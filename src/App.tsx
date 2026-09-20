import React, { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './components/LandingPage';
import { OnboardingModal } from './components/OnboardingModal';
import { Dashboard } from './components/Dashboard';
import { FloatingAssistant } from './components/FloatingAssistant';
import { SettingsModal } from './components/SettingsModal';
import { PrivacyBanner } from './components/PrivacyBanner';
import { useScreenCapture } from './hooks/useScreenCapture';
import { useVoiceInteraction } from './hooks/useVoiceInteraction';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ChatStore } from './store/chatStore';
import { SettingsStore } from './store/settingsStore';
import { ExtensionBridge } from './services/extensionBridge';
import { checkBackendHealth, analyzeScreenApi, sendChatApi } from './services/api';
import { Conversation, AppSettings, ExtensionStatus } from './types';

export const App: React.FC = () => {
  // Always default directly to dashboard
  const [view, setView] = useState<'landing' | 'onboarding' | 'dashboard' | 'floating'>('dashboard');
  const [settings, setSettings] = useState<AppSettings>(SettingsStore.getSettings());
  const [conversations, setConversations] = useState<Conversation[]>(ChatStore.getConversations());
  const [activeConv, setActiveConv] = useState<Conversation>(ChatStore.getActiveConversation());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>(ExtensionBridge.getStatus());

  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [thinkingStep, setThinkingStep] = useState<string>('');

  const {
    state: screenState,
    startCapture,
    stopCapture,
    captureFrameNow,
    handleManualUpload,
    setPreviewUrlDirectly,
    toggleMonitoring,
  } = useScreenCapture();

  useEffect(() => {
    ExtensionBridge.init();
    const handleExtCapture = (e: any) => {
      if (e.detail) {
        setPreviewUrlDirectly(e.detail);
      }
    };
    window.addEventListener('screenmate_extension_capture', handleExtCapture);
    const unsubExt = ExtensionBridge.subscribe(setExtensionStatus);

    return () => {
      window.removeEventListener('screenmate_extension_capture', handleExtCapture);
      unsubExt();
    };
  }, [setPreviewUrlDirectly]);

  useEffect(() => {
    const unsubChat = ChatStore.subscribe(() => {
      setConversations(ChatStore.getConversations());
      setActiveConv(ChatStore.getActiveConversation());
    });

    const unsubSettings = SettingsStore.subscribe((st) => {
      setSettings(st);
    });

    checkBackendHealth().then((h) => {
      setBackendConnected(h.status === 'ok');
    });

    return () => {
      unsubChat();
      unsubSettings();
    };
  }, []);

  const handleVoiceHelp = useCallback(() => {
    handleTriggerHelp();
  }, []);

  const handleSpeechResult = useCallback((transcript: string) => {
    if (transcript.trim()) {
      handleSendMessage(transcript.trim(), true);
    }
  }, []);

  const { voiceState, startListening, stopListening, speakText, stopSpeaking } = useVoiceInteraction({
    onHelpTriggered: handleVoiceHelp,
    onSpeechResult: handleSpeechResult,
    ttsEnabled: settings.ttsEnabled,
  });

  const handleTriggerHelp = async () => {
    if (settings.privacyMode) {
      alert('Privacy Mode is active.');
      return;
    }

    setIsThinking(true);
    setThinkingStep('Capturing screen...');

    try {
      let frame = captureFrameNow();

      if (!frame && !screenState.isCapturing) {
        setThinkingStep('Requesting screen access...');
        await startCapture(settings.captureSource);
        await new Promise((res) => setTimeout(res, 600));
        frame = captureFrameNow();
      }

      if (!frame) {
        ChatStore.addMessage(activeConv.id, {
          sender: 'assistant',
          content: 'Screen access is unavailable or denied. Please click "Start Screen Sharing" or upload a screenshot manually.',
          isError: true,
        });
        setIsThinking(false);
        return;
      }

      setThinkingStep('Reading screen & identifying UI elements...');
      await new Promise((r) => setTimeout(r, 400));

      setThinkingStep('Understanding layout & computing guidance...');
      const response = await analyzeScreenApi(frame, 'Help');

      setThinkingStep('Preparing step-by-step guidance...');

      ChatStore.addMessage(activeConv.id, {
        sender: 'user',
        content: 'HELP',
        hasScreenshotContext: true,
        screenshotUrl: settings.screenshotRetention ? frame : undefined,
      });

      ChatStore.addMessage(activeConv.id, {
        sender: 'assistant',
        content: response.analysis,
        hasScreenshotContext: true,
        screenshotUrl: settings.screenshotRetention ? frame : undefined,
        structuredGuidance: response.structuredGuidance,
      });

      if (settings.ttsEnabled) {
        speakText(response.analysis);
      }
    } catch (err: any) {
      console.error('Help trigger error:', err);
      ChatStore.addMessage(activeConv.id, {
        sender: 'assistant',
        content: `Error analyzing screen: ${err.message || 'Server unavailable.'}`,
        isError: true,
      });
    } finally {
      setIsThinking(false);
      setThinkingStep('');
    }
  };

  const handleSendMessage = async (text: string, useScreen: boolean) => {
    if (settings.privacyMode) {
      alert('Privacy Mode is active.');
      return;
    }

    setIsThinking(true);
    setThinkingStep('Processing question...');

    try {
      const frame = useScreen ? captureFrameNow() : null;

      ChatStore.addMessage(activeConv.id, {
        sender: 'user',
        content: text,
        hasScreenshotContext: Boolean(frame),
        screenshotUrl: settings.screenshotRetention && frame ? frame : undefined,
      });

      if (frame) {
        setThinkingStep('Analyzing screen in context of question...');
        const response = await analyzeScreenApi(frame, text);

        ChatStore.addMessage(activeConv.id, {
          sender: 'assistant',
          content: response.analysis,
          hasScreenshotContext: true,
          screenshotUrl: settings.screenshotRetention ? frame : undefined,
          structuredGuidance: response.structuredGuidance,
        });

        if (settings.ttsEnabled) {
          speakText(response.analysis);
        }
      } else {
        const recentMsgs = activeConv.messages.map((m) => ({
          role: m.sender as any,
          content: m.content,
        }));
        recentMsgs.push({ role: 'user', content: text });

        const res = await sendChatApi(recentMsgs);
        ChatStore.addMessage(activeConv.id, {
          sender: 'assistant',
          content: res.reply,
        });

        if (settings.ttsEnabled) {
          speakText(res.reply);
        }
      }
    } catch (err: any) {
      ChatStore.addMessage(activeConv.id, {
        sender: 'assistant',
        content: `Sorry, I encountered an issue: ${err.message}`,
        isError: true,
      });
    } finally {
      setIsThinking(false);
      setThinkingStep('');
    }
  };

  useKeyboardShortcuts({
    onHelp: handleTriggerHelp,
    onCapture: () => captureFrameNow(),
    onEscape: () => {
      if (view === 'floating') setView('dashboard');
      if (isSettingsOpen) setIsSettingsOpen(false);
    },
  });

  const handleStopEverything = () => {
    stopCapture();
    stopListening();
    stopSpeaking();
    SettingsStore.updateSettings({ privacyMode: true });
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-100">
      <PrivacyBanner
        privacyMode={settings.privacyMode}
        onTogglePrivacy={(enabled) => SettingsStore.updateSettings({ privacyMode: enabled })}
        onStopEverything={handleStopEverything}
      />

      <Dashboard
        conversations={conversations}
        activeConversation={activeConv}
        onSelectConversation={(id) => ChatStore.setActiveConversation(id)}
        onNewConversation={() => ChatStore.createNewConversation()}
        onDeleteConversation={(id) => ChatStore.deleteConversation(id)}
        onRenameConversation={(id, newTitle) => ChatStore.renameConversation(id, newTitle)}
        onSendMessage={handleSendMessage}
        onTriggerHelp={handleTriggerHelp}
        screenState={screenState}
        onStartCapture={() => startCapture(settings.captureSource)}
        onStopCapture={stopCapture}
        onRefreshCapture={() => captureFrameNow()}
        onToggleMonitoring={() => toggleMonitoring(!screenState.isMonitoring, settings.monitoringInterval)}
        onManualUpload={handleManualUpload}
        voiceState={voiceState}
        onStartVoice={startListening}
        onStopVoice={stopListening}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleFloating={() => setView('floating')}
        isThinking={isThinking}
        thinkingStep={thinkingStep}
        extensionStatus={extensionStatus}
        backendConnected={backendConnected}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={() => setSettings(SettingsStore.getSettings())}
      />
    </div>
  );
};
