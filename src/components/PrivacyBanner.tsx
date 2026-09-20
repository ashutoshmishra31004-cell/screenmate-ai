import React from 'react';
import { Shield, ShieldAlert, StopCircle, EyeOff, MicOff } from 'lucide-react';

interface PrivacyBannerProps {
  privacyMode: boolean;
  onTogglePrivacy: (enabled: boolean) => void;
  onStopEverything: () => void;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({
  privacyMode,
  onTogglePrivacy,
  onStopEverything,
}) => {
  if (!privacyMode) {
    return (
      <div className="bg-surface-100/80 border-b border-white/5 px-4 py-2 flex items-center justify-between text-xs text-gray-300">
        <div className="flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-brand-emerald" />
          <span>ScreenMate Security: Screenshot data processed securely in memory. No continuous recording.</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onTogglePrivacy(true)}
            className="text-gray-400 hover:text-brand-cyan transition-colors flex items-center space-x-1 font-medium"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Enable Privacy Mode</span>
          </button>
          <button
            onClick={onStopEverything}
            className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold flex items-center space-x-1 border border-rose-500/40 transition-colors"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span>Stop Everything</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-rose-950/90 via-surface-100 to-rose-950/90 border-b border-rose-500/40 px-6 py-2.5 flex items-center justify-between text-xs animate-fade-in">
      <div className="flex items-center space-x-3 text-rose-200">
        <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
        <span className="font-bold uppercase tracking-wider text-rose-300">PRIVACY MODE ACTIVE</span>
        <span className="hidden sm:inline text-rose-200/80">• Screen capture paused • Mic stopped • Memory cleared</span>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => onTogglePrivacy(false)}
          className="px-3 py-1 rounded bg-surface-200 hover:bg-surface-300 text-white font-medium text-xs transition-colors"
        >
          Resume Copilot
        </button>
        <button
          onClick={onStopEverything}
          className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center space-x-1"
        >
          <StopCircle className="w-3.5 h-3.5" />
          <span>Purge All Context</span>
        </button>
      </div>
    </div>
  );
};
