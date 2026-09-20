import React, { useState, useRef, useEffect } from 'react';
import {
  Eye, Plus, Settings, MessageSquare, Trash2, Edit2, Send, Mic, MicOff,
  Sparkles, RefreshCw, Pause, Upload, Shield, Maximize2, CheckCircle2,
  AlertCircle, Monitor, Globe, Copy, Check, Image as ImageIcon, X,
  Zap, ArrowRight, Search, Smartphone, Camera
} from 'lucide-react';
import { Conversation, Message, ScreenCaptureState, VoiceState, ExtensionStatus } from '../types';
import { ChatStore } from '../store/chatStore';

interface DashboardProps {
  conversations: Conversation[];
  activeConversation: Conversation;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onSendMessage: (text: string, useScreen: boolean) => Promise<void>;
  onTriggerHelp: () => Promise<void>;
  screenState: ScreenCaptureState;
  onStartCapture: () => void;
  onStopCapture: () => void;
  onRefreshCapture: () => void;
  onToggleMonitoring: () => void;
  onManualUpload: (file: File) => void;
  voiceState: VoiceState;
  onStartVoice: () => void;
  onStopVoice: () => void;
  onOpenSettings: () => void;
  onToggleFloating: () => void;
  isThinking: boolean;
  thinkingStep: string;
  extensionStatus: ExtensionStatus;
  backendConnected: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onSendMessage,
  onTriggerHelp,
  screenState,
  onStartCapture,
  onStopCapture,
  onRefreshCapture,
  onToggleMonitoring,
  onManualUpload,
  voiceState,
  onStartVoice,
  onStopVoice,
  onOpenSettings,
  isThinking,
  thinkingStep,
  extensionStatus,
  backendConnected,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [inspectImage, setInspectImage] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'screen' | 'chat'>('chat');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation.messages, isThinking]);

  // Support Ctrl+V clipboard paste of screenshots across all devices
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            onManualUpload(file);
            setMobileTab('screen');
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onManualUpload]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text, true);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-background text-gray-100 overflow-hidden select-none">
      {/* HEADER BAR (RESPONSIVE FOR MOBILE & DESKTOP) */}
      <header className="h-14 bg-surface-100/95 border-b border-white/10 px-3 md:px-4 flex items-center justify-between text-xs flex-shrink-0">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-cyan flex items-center justify-center shadow-glow-indigo flex-shrink-0">
            <Eye className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm text-white">ScreenMate AI</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold hidden sm:inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                24/7 Cloud
              </span>
            </div>
          </div>
        </div>

        {/* Mobile View Switcher Tabs (Visible only on small screens) */}
        <div className="flex md:hidden items-center bg-surface-200/80 p-0.5 rounded-xl border border-white/10">
          <button
            onClick={() => setMobileTab('screen')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              mobileTab === 'screen' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            🖥️ Screen
          </button>
          <button
            onClick={() => setMobileTab('chat')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              mobileTab === 'chat' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            💬 AI Chat
          </button>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center space-x-2">
          {screenState.isCapturing ? (
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/40 text-xs font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                <span>● Screen Sharing Active</span>
              </span>
              <button
                onClick={onRefreshCapture}
                className="px-3 py-1 rounded-xl glass-panel hover:bg-surface-200 text-gray-200 text-xs font-semibold flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3 text-brand-cyan" />
                <span>Refresh</span>
              </button>
              <button
                onClick={onStopCapture}
                className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold"
              >
                Stop
              </button>
            </div>
          ) : (
            <button
              onClick={onStartCapture}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-cyan text-white text-xs font-bold shadow-glow-cyan flex items-center space-x-1.5"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Share Screen</span>
            </button>
          )}

          <button
            onClick={() => {
              const width = 420;
              const height = window.screen.height - 80;
              const left = window.screen.width - width - 20;
              window.open(window.location.href, 'ScreenMateSidePanelWindow', `width=${width},height=${height},left=${left},top=40,resizable=yes,scrollbars=yes`);
            }}
            className="px-3 py-1.5 rounded-xl bg-surface-200/80 hover:bg-surface-200 text-gray-200 hover:text-white font-semibold text-xs border border-white/10 flex items-center space-x-1.5 transition-all"
            title="Pop-out Side Window"
          >
            <span>🪟 Dock Window</span>
          </button>

          <a
            href="/ScreenMate-AI-Extension.zip"
            download="ScreenMate-AI-Extension.zip"
            className="px-3 py-1.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-cyan hover:text-white font-semibold text-xs border border-brand-cyan/30 flex items-center space-x-1.5 transition-all"
            title="Download Extension on this device"
          >
            <span>🧩 Get Extension</span>
          </a>
        </div>

        {/* Global Upload Button & Settings */}
        <div className="flex items-center space-x-1.5">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onManualUpload(file);
                setMobileTab('screen');
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-cyan border border-brand-cyan/30 text-xs font-bold flex items-center space-x-1"
            title="Upload screenshot or take photo"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload / Photo</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl glass-panel hover:bg-surface-200 text-gray-300 hover:text-white"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* RESPONSIVE DUAL-PANEL WORKSPACE (SIDE-BY-SIDE ON DESKTOP, TABBED ON MOBILE) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANEL: TARGET SCREEN / PHOTO CANVAS */}
        <div
          className={`bg-surface-200/40 flex flex-col border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden transition-all ${
            mobileTab === 'screen' ? 'flex-1 flex' : 'hidden md:flex md:w-[60%] lg:w-[65%]'
          }`}
        >
          <div className="h-9 bg-surface-100/60 border-b border-white/10 px-3 md:px-4 flex items-center justify-between text-xs text-gray-300 font-semibold flex-shrink-0">
            <span className="flex items-center space-x-1.5">
              <Monitor className="w-4 h-4 text-brand-cyan" />
              <span className="truncate">Active Screen / Uploaded Image</span>
            </span>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-brand-cyan hover:text-white flex items-center space-x-1"
            >
              <Upload className="w-3 h-3" />
              <span>Change Image</span>
            </button>
          </div>

          {/* Screen Display Area */}
          <div className="flex-1 p-3 md:p-4 flex items-center justify-center relative overflow-hidden">
            {screenState.previewUrl ? (
              <div className="w-full h-full rounded-2xl bg-black border border-white/10 overflow-hidden relative shadow-2xl flex items-center justify-center group">
                <img
                  src={screenState.previewUrl}
                  alt="Target Screen Stream"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setInspectImage(screenState.previewUrl)}
                    className="px-3 py-1.5 rounded-xl glass-panel text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Expand</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md w-full glass-panel p-6 md:p-8 rounded-3xl border border-brand-500/20 text-center space-y-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-brand-500/10 text-brand-cyan mx-auto flex items-center justify-center">
                  <Monitor className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white">No Screen Connected Yet</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Share your screen on PC, or upload any screenshot/photo on mobile. You can also press <kbd className="px-1.5 py-0.5 rounded bg-surface-200 border border-white/15 text-white">Ctrl+V</kbd> to paste!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={onStartCapture}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-cyan text-white font-bold text-xs shadow-glow-cyan flex items-center justify-center space-x-2"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Share Screen</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl glass-panel hover:bg-surface-200 text-white font-bold text-xs flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Screenshot</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: DEDICATED SCREENMATE AI TOOLBOX */}
        <div
          className={`bg-surface-100/95 flex flex-col justify-between overflow-hidden ${
            mobileTab === 'chat' ? 'flex-1 flex' : 'hidden md:flex md:w-[40%] lg:w-[35%] md:min-w-[360px] md:max-w-[440px]'
          }`}
        >
          {/* AI Header */}
          <div className="p-3 border-b border-white/10 bg-surface-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-cyan" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">ScreenMate AI Copilot</h2>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
              Groq Cloud 24/7
            </span>
          </div>

          {/* TARGET CONTEXT THUMBNAIL CARD */}
          <div className="p-2.5 md:p-3 bg-surface-200/50 border-b border-white/5 space-y-1.5 flex-shrink-0">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-brand-cyan font-extrabold uppercase tracking-wider text-[9px]">SCREEN CONTEXT</span>
              <span className="bg-brand-cyan/20 text-brand-cyan px-1.5 py-0.5 rounded text-[9px] font-bold">
                {screenState.previewUrl ? 'Ready to Analyze' : 'Waiting for Screen'}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {screenState.previewUrl ? (
                <img
                  src={screenState.previewUrl}
                  alt="Target Screen Thumbnail"
                  className="w-16 h-10 md:w-20 md:h-12 rounded-lg bg-black border border-white/10 object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-10 md:w-20 md:h-12 rounded-lg bg-surface-100 border border-dashed border-white/20 flex items-center justify-center text-[9px] text-gray-500 flex-shrink-0">
                  No Image
                </div>
              )}
              <div className="text-[11px] text-gray-300 space-y-0.5 truncate">
                <div className="font-bold text-white truncate text-xs">
                  {extensionStatus.tabTitle || (screenState.previewUrl ? 'Captured Screenshot' : 'No screen attached')}
                </div>
                <div className="text-[10px] text-gray-400">
                  Works on Any Device 24/7
                </div>
              </div>
            </div>
          </div>

          {/* AI Chat Messages Stream */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            {activeConversation.messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center py-1 text-gray-500 italic text-[10px]">
                    {msg.content}
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`space-y-1 animate-fade-in ${isUser ? 'pl-4' : 'pr-1'}`}>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                    <span>{isUser ? 'You' : 'ScreenMate AI'}</span>
                    <div className="flex items-center space-x-1">
                      {msg.hasScreenshotContext && (
                        <span className="bg-brand-cyan/20 text-brand-cyan px-1.5 py-0.5 rounded text-[9px]">
                          Screen Analyzed
                        </span>
                      )}
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.content)}
                        className="text-gray-400 hover:text-white"
                      >
                        {copiedMsgId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-2xl border leading-relaxed whitespace-pre-line ${
                      isUser
                        ? 'bg-brand-600/30 text-brand-100 border-brand-500/40 rounded-tr-none'
                        : msg.isError
                        ? 'bg-rose-950/40 text-rose-200 border-rose-500/40 rounded-tl-none'
                        : 'glass-panel text-gray-100 border-white/10 rounded-tl-none'
                    }`}
                  >
                    {msg.content}

                    {/* Structured Guidance Box */}
                    {msg.structuredGuidance && (
                      <div className="mt-3 p-2.5 rounded-xl bg-surface-200/80 border border-brand-cyan/30 space-y-1.5 text-[11px]">
                        {msg.structuredGuidance.currentScreen && (
                          <div>
                            <span className="text-brand-cyan font-bold uppercase text-[9px] tracking-wider">Current Screen:</span>
                            <p className="text-gray-200 font-medium">{msg.structuredGuidance.currentScreen}</p>
                          </div>
                        )}

                        {msg.structuredGuidance.nextSteps && msg.structuredGuidance.nextSteps.length > 0 && (
                          <div>
                            <span className="text-brand-emerald font-bold uppercase text-[9px] tracking-wider">Next Step:</span>
                            <ol className="list-decimal list-inside space-y-0.5 mt-1 text-gray-200 font-semibold">
                              {msg.structuredGuidance.nextSteps.map((s, idx) => (
                                <li key={idx}>{s}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {msg.structuredGuidance.why && (
                          <div>
                            <span className="text-indigo-300 font-bold uppercase text-[9px] tracking-wider">Why:</span>
                            <p className="text-gray-300">{msg.structuredGuidance.why}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-cyan/30 flex items-center space-x-2 text-brand-cyan text-xs">
                <Sparkles className="w-4 h-4 animate-spin text-brand-cyan" />
                <span>{thinkingStep || 'ScreenMate AI is analyzing screen...'}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ACTION CONTROLS PANEL */}
          <div className="p-2.5 md:p-3 border-t border-white/10 bg-surface-100 space-y-2 flex-shrink-0">
            <button
              onClick={onTriggerHelp}
              disabled={isThinking}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-cyan hover:from-brand-500 hover:to-brand-cyan text-white font-extrabold text-xs shadow-glow-indigo transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-brand-cyan fill-brand-cyan" />
              <span>✨ HELP — Analyze Current Screen</span>
            </button>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                onClick={() => {
                  const val = inputText.trim() || "What should I do on this screen?";
                  onSendMessage(val, true);
                  setInputText('');
                }}
                className="py-1.5 rounded-lg glass-panel hover:bg-surface-200 text-brand-cyan font-bold flex items-center justify-center space-x-1"
              >
                <span>💬 Ask</span>
              </button>

              <button
                onClick={voiceState.isListening ? onStopVoice : onStartVoice}
                className={`py-1.5 rounded-lg font-bold flex items-center justify-center space-x-1 ${
                  voiceState.isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'glass-panel text-brand-emerald hover:bg-surface-200'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>Voice</span>
              </button>

              <button
                onClick={() => onSendMessage("Explain what is currently visible on this target screen", true)}
                className="py-1.5 rounded-lg glass-panel hover:bg-surface-200 text-indigo-300 font-bold flex items-center justify-center space-x-1"
              >
                <Zap className="w-3 h-3" />
                <span>Explain</span>
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="flex items-center space-x-2 pt-0.5">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask what to click, errors, next steps..."
                className="flex-1 bg-surface-200 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-cyan"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isThinking}
                className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 transition-colors shadow-glow-indigo flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Screenshot Inspector Modal */}
      {inspectImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
          <div className="max-w-4xl w-full glass-panel p-4 rounded-3xl border border-white/10 shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-brand-cyan" />
                <span>Screen Frame Inspection</span>
              </span>
              <button
                onClick={() => setInspectImage(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden flex items-center justify-center rounded-xl bg-surface-200">
              <img src={inspectImage} alt="Inspected Target Context" className="max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
