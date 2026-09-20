import React, { useState } from 'react';
import { Mic, Monitor, ShieldCheck, Globe, ArrowRight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { ExtensionBridge } from '../services/extensionBridge';

interface OnboardingModalProps {
  onComplete: () => void;
  onRequestScreen: () => Promise<void>;
  onRequestMic: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onComplete,
  onRequestScreen,
  onRequestMic,
}) => {
  const [step, setStep] = useState<number>(0);
  const [micGranted, setMicGranted] = useState<boolean>(false);
  const [screenGranted, setScreenGranted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleMicRequest = async () => {
    setLoading(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        setMicGranted(true);
        onRequestMic();
      }
    } catch (e) {
      console.warn('Microphone permission request denied:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleScreenRequest = async () => {
    setLoading(true);
    try {
      await onRequestScreen();
      setScreenGranted(true);
    } catch (e) {
      console.warn('Screen request failed during onboarding:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full glass-panel p-8 rounded-3xl border border-brand-500/30 shadow-2xl relative overflow-hidden animate-fade-in">
        {/* Top subtle glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/20 blur-3xl rounded-full pointer-events-none" />

        {step === 0 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-cyan mx-auto flex items-center justify-center shadow-glow-indigo">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white">Welcome to ScreenMate AI</h2>
              <p className="text-brand-cyan font-medium text-sm mt-1">Your visual AI copilot for anything on your screen.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left my-6">
              <div className="bg-surface-100/60 p-3.5 rounded-xl border border-white/5 space-y-1">
                <div className="text-xs font-bold text-gray-200 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-cyan flex items-center justify-center text-xs">1</span>
                  <span>Allow Screen Access</span>
                </div>
                <p className="text-[11px] text-gray-400">Share your active tab or window so AI can see UI elements.</p>
              </div>

              <div className="bg-surface-100/60 p-3.5 rounded-xl border border-white/5 space-y-1">
                <div className="text-xs font-bold text-gray-200 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-cyan flex items-center justify-center text-xs">2</span>
                  <span>Ask by Voice or Text</span>
                </div>
                <p className="text-[11px] text-gray-400">Press "Help" or ask questions like "What should I click next?".</p>
              </div>

              <div className="bg-surface-100/60 p-3.5 rounded-xl border border-white/5 space-y-1">
                <div className="text-xs font-bold text-gray-200 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-cyan flex items-center justify-center text-xs">3</span>
                  <span>AI Visual Analysis</span>
                </div>
                <p className="text-[11px] text-gray-400">Vision model inspects form fields, menus, errors, and layout.</p>
              </div>

              <div className="bg-surface-100/60 p-3.5 rounded-xl border border-white/5 space-y-1">
                <div className="text-xs font-bold text-gray-200 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-cyan flex items-center justify-center text-xs">4</span>
                  <span>Step-by-step Guidance</span>
                </div>
                <p className="text-[11px] text-gray-400">Receive precise instructions referencing exact visible labels.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-cyan text-white font-bold text-sm shadow-glow-indigo hover:shadow-glow-cyan transition-all flex items-center justify-center space-x-2"
              >
                <span>Get Started & Configure Permissions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-cyan flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Step 1: Voice Permission</h3>
                <p className="text-xs text-gray-400">Enable optional hands-free voice interaction</p>
              </div>
            </div>

            <div className="bg-surface-100/70 p-4 rounded-xl border border-white/5 text-xs text-gray-300 space-y-2">
              <p className="font-semibold text-white">Why ScreenMate needs microphone access:</p>
              <p>
                Saying "Help" or "Hey ScreenMate" triggers real-time visual assistance without needing to switch windows or type.
              </p>
              <div className="text-brand-emerald flex items-center space-x-1.5 font-medium pt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Audio is processed locally in your browser. Audio is never recorded continuously.</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleMicRequest}
                disabled={loading || micGranted}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  micGranted
                    ? 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/40'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow-indigo'
                }`}
              >
                {micGranted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Microphone Granted</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Grant Microphone Permission</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-surface-200 hover:bg-surface-300 text-white text-xs font-semibold flex items-center space-x-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Step 2: Screen Sharing Access</h3>
                <p className="text-xs text-gray-400">Select tab, window, or display to monitor</p>
              </div>
            </div>

            <div className="bg-surface-100/70 p-4 rounded-xl border border-white/5 text-xs text-gray-300 space-y-2">
              <p className="font-semibold text-white">Why ScreenMate needs screen capture:</p>
              <p>
                To provide accurate guidance, ScreenMate captures snapshot frames of your visible workspace when you request help.
              </p>
              <div className="text-brand-emerald flex items-center space-x-1.5 font-medium pt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>You control when screen sharing starts, pauses, or stops at any time.</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleScreenRequest}
                disabled={loading || screenGranted}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  screenGranted
                    ? 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/40'
                    : 'bg-gradient-to-r from-brand-600 to-brand-cyan text-white shadow-glow-cyan'
                }`}
              >
                {screenGranted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Screen Sharing Active</span>
                  </>
                ) : (
                  <>
                    <Monitor className="w-4 h-4" />
                    <span>Start Screen Sharing</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-surface-200 hover:bg-surface-300 text-white text-xs font-semibold flex items-center space-x-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Step 3: Chrome Extension (Optional)</h3>
                <p className="text-xs text-gray-400">Unlock side panel assistant on any website</p>
              </div>
            </div>

            <div className="bg-surface-100/70 p-4 rounded-xl border border-white/5 text-xs text-gray-300 space-y-2">
              <p>
                Installing the ScreenMate Chrome Extension allows you to trigger the assistant directly in Chrome's side panel.
              </p>
              <div className="text-gray-400 text-[11px]">
                Note: The extension is fully optional. If skipped, ScreenMate works smoothly right inside this web dashboard.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  ExtensionBridge.ping();
                }}
                className="px-4 py-2 rounded-xl glass-panel text-xs text-gray-300 hover:text-white"
              >
                Check Extension Connection
              </button>

              <button
                onClick={onComplete}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-cyan text-white font-bold text-sm shadow-glow-indigo flex items-center space-x-2"
              >
                <span>Complete Setup & Enter Dashboard</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
