import React, { useState } from 'react';
import { Eye, Mic, MessageSquare, Pause, Play, Maximize2, Minimize2, X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { Message } from '../types';

interface FloatingAssistantProps {
  onExpandToFull: () => void;
  onHelpTriggered: () => void;
  onSendMessage: (text: string) => void;
  isCapturing: boolean;
  onToggleCapture: () => void;
  messages: Message[];
  isThinking: boolean;
  latestPreview: string | null;
}

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({
  onExpandToFull,
  onHelpTriggered,
  onSendMessage,
  isCapturing,
  onToggleCapture,
  messages,
  isThinking,
  latestPreview,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const lastAssistantMsg = messages.filter((m) => m.sender === 'assistant').slice(-1)[0];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Expanded Side Drawer Panel */}
      {isExpanded && (
        <div className="w-80 sm:w-96 h-[500px] glass-panel rounded-3xl border border-brand-500/30 shadow-2xl flex flex-col overflow-hidden mb-3 animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-surface-100/80">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-cyan flex items-center justify-center shadow-glow-indigo">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold text-white">ScreenMate Copilot</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={onExpandToFull}
                title="Expand to Full Dashboard"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-200 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                title="Minimize Floating Assistant"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-200 transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages View */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            {lastAssistantMsg ? (
              <div className="bg-surface-100/90 p-3 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-brand-cyan font-bold">
                  <span>Latest Guidance</span>
                  {lastAssistantMsg.hasScreenshotContext && (
                    <span className="bg-brand-500/20 text-brand-cyan px-2 py-0.5 rounded text-[10px]">
                      Screen Context Used
                    </span>
                  )}
                </div>
                <div className="text-gray-200 whitespace-pre-line leading-relaxed">
                  {lastAssistantMsg.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 text-xs">
                Press <strong className="text-brand-cyan">Help</strong> or ask a question to analyze visible screen.
              </div>
            )}

            {isThinking && (
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center space-x-2 text-brand-cyan text-xs">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Reading screen & analyzing UI...</span>
              </div>
            )}
          </div>

          {/* Quick Input Bar */}
          <form onSubmit={handleSend} className="p-2 border-t border-white/10 bg-surface-100/80 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about visible screen..."
              className="flex-1 bg-surface-200 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-cyan"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Pill Widget UI */}
      <div className="glass-panel p-2 rounded-2xl border border-brand-500/30 shadow-glow-indigo flex items-center space-x-2">
        <div className="flex items-center space-x-2 pl-2 pr-1">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-cyan flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-extrabold text-white hidden sm:inline">ScreenMate</span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* 🎤 Help Button */}
        <button
          onClick={onHelpTriggered}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-cyan hover:from-brand-500 hover:to-brand-cyan text-white font-bold text-xs shadow-glow-cyan transition-all flex items-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Help</span>
        </button>

        {/* 💬 Ask Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            isExpanded ? 'bg-surface-200 text-brand-cyan' : 'bg-surface-100 text-gray-300 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>

        {/* ⏸ Pause / Capture Toggle */}
        <button
          onClick={onToggleCapture}
          className={`p-1.5 rounded-xl text-xs font-semibold transition-all ${
            isCapturing ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
          }`}
          title={isCapturing ? 'Pause Monitoring' : 'Start Screen Capture'}
        >
          {isCapturing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
