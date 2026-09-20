import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceState } from '../types';

interface UseVoiceInteractionProps {
  onHelpTriggered?: () => void;
  onSpeechResult?: (transcript: string) => void;
  ttsEnabled?: boolean;
}

export function useVoiceInteraction({
  onHelpTriggered,
  onSpeechResult,
  ttsEnabled = false,
}: UseVoiceInteractionProps = {}) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    supported: false,
    error: null,
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setVoiceState((prev) => ({ ...prev, supported: true }));
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceState((prev) => ({
          ...prev,
          isListening: true,
          error: null,
        }));
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }

        setVoiceState((prev) => ({
          ...prev,
          transcript: currentTranscript,
        }));

        const clean = currentTranscript.trim().toLowerCase();

        // Check for "Help" voice trigger commands
        if (
          clean === 'help' ||
          clean.includes('hey screenmate help') ||
          clean.includes('help me') ||
          clean.includes('screenmate help')
        ) {
          if (onHelpTriggered) {
            onHelpTriggered();
          }
        }

        if (event.results[0].isFinal) {
          if (onSpeechResult) {
            onSpeechResult(currentTranscript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setVoiceState((prev) => ({
          ...prev,
          isListening: false,
          error: event.error === 'not-allowed'
            ? 'Microphone permission denied. Please allow microphone access in your browser settings.'
            : `Voice error: ${event.error}`,
        }));
      };

      recognition.onend = () => {
        setVoiceState((prev) => ({
          ...prev,
          isListening: false,
        }));
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceState((prev) => ({
        ...prev,
        supported: false,
        error: 'Voice input is not supported in this browser. You can type instead.',
      }));
    }
  }, [onHelpTriggered, onSpeechResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !voiceState.isListening) {
      try {
        setVoiceState((prev) => ({ ...prev, transcript: '' }));
        recognitionRef.current.start();
      } catch (err: any) {
        console.warn('Failed to start speech recognition:', err);
      }
    }
  }, [voiceState.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && voiceState.isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err: any) {
        console.warn('Failed to stop speech recognition:', err);
      }
    }
  }, [voiceState.isListening]);

  const speakText = useCallback(
    (text: string) => {
      if (!ttsEnabled || !('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel(); // stop previous speech

      const cleanText = text.replace(/[*#_`]/g, ''); // strip markdown
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setVoiceState((prev) => ({ ...prev, isSpeaking: true }));
      };

      utterance.onend = () => {
        setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
      };

      utterance.onerror = () => {
        setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
      };

      window.speechSynthesis.speak(utterance);
    },
    [ttsEnabled]
  );

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  return {
    voiceState,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  };
}
