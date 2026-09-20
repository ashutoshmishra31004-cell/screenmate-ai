import React from 'react';
import { Eye, HelpCircle, Sparkles, Shield, Cpu, ArrowRight, Play, Monitor, Mic, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onHowItWorks: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onHowItWorks }) => {
  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background radial glow gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-cyan/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-cyan flex items-center justify-center shadow-glow-indigo">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              ScreenMate <span className="text-brand-cyan font-bold">AI</span>
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Visual AI Copilot</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onHowItWorks}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={onStart}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-cyan hover:from-brand-500 hover:to-brand-cyan text-white text-sm font-semibold shadow-glow-indigo hover:shadow-glow-cyan transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <span>Launch Copilot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center items-center text-center z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-panel-accent text-xs font-semibold text-brand-cyan mb-8 animate-fade-in border border-brand-cyan/30">
          <Sparkles className="w-4 h-4 text-brand-cyan" />
          <span>Real-Time Screen Understanding & Guidance</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Your AI that <span className="bg-gradient-to-r from-brand-cyan via-brand-500 to-indigo-300 bg-clip-text text-transparent">sees what you see.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl font-normal leading-relaxed">
          ScreenMate understands your computer screen in real time and provides step-by-step guidance whenever you get stuck.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-cyan text-white font-bold text-base shadow-glow-indigo hover:shadow-glow-cyan transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-3"
          >
            <span>Start Assistant</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onHowItWorks}
            className="w-full sm:w-auto px-6 py-4 rounded-xl glass-panel text-gray-200 hover:text-white font-semibold text-base hover:bg-surface-100 transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 text-brand-cyan fill-brand-cyan" />
            <span>How It Works</span>
          </button>
        </div>

        {/* Features Cards Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brand-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 text-brand-cyan group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. See</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Captures your current tab, active application window, or full screen safely with explicit consent.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brand-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 text-brand-500 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. Ask</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Say "Help" or type naturally: "What should I click next?", "Why am I getting this error?".
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brand-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 text-brand-cyan group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Understand</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              AI Vision identifies visible menus, dialogs, buttons, fields, and errors accurately.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brand-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 text-brand-emerald group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">4. Get Guided</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Receive structured step-by-step action items referencing exact visible UI button names.
            </p>
          </div>
        </div>

        {/* Conceptual Assistant Preview */}
        <div className="mt-16 w-full max-w-4xl glass-panel p-4 rounded-3xl border border-brand-500/20 shadow-2xl relative">
          <div className="flex items-center justify-between pb-3 px-3 border-b border-white/10 text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-gray-300 ml-2">ScreenMate Copilot Live Context</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-brand-emerald/20 text-brand-emerald text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
              <span>Monitoring Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 text-left">
            <div className="md:col-span-2 space-y-3">
              <div className="bg-surface-100 p-3 rounded-xl border border-white/5">
                <div className="text-xs text-brand-cyan font-semibold mb-1">User Question</div>
                <p className="text-sm text-gray-200">"Where do I click to create a pull request on GitHub?"</p>
              </div>

              <div className="bg-brand-500/10 p-4 rounded-xl border border-brand-500/30 space-y-2">
                <div className="text-xs text-brand-cyan font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>AI Guidance Response</span>
                  <span className="text-[10px] bg-brand-500/30 px-2 py-0.5 rounded text-white">Screen Context Used</span>
                </div>
                <div className="text-sm font-semibold text-white">Current Screen: GitHub Repository</div>
                <div className="text-xs text-gray-300 space-y-1">
                  <p>1. Click the <span className="text-brand-cyan font-bold">"Pull requests"</span> tab at the top.</p>
                  <p>2. Click the green <span className="text-brand-emerald font-bold">"New pull request"</span> button.</p>
                  <p>3. Select your working branch from the dropdown.</p>
                </div>
              </div>
            </div>

            <div className="glass-panel-accent p-3 rounded-xl flex flex-col justify-between border border-brand-cyan/20">
              <div>
                <div className="text-xs font-bold text-gray-300 mb-2 flex items-center justify-between">
                  <span>Live Capture Frame</span>
                  <Monitor className="w-3.5 h-3.5 text-brand-cyan" />
                </div>
                <div className="aspect-video rounded-lg bg-surface-200 flex items-center justify-center border border-white/10 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] text-gray-300 font-mono">1280x720 • Active Tab</span>
                  </div>
                  <Eye className="w-8 h-8 text-brand-cyan/60" />
                </div>
              </div>
              <div className="mt-3 text-[11px] text-gray-400">
                Privacy Protected: Screenshots processed strictly in RAM for vision inference.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-white/5 text-center text-xs text-gray-300 flex flex-col sm:flex-row justify-between items-center z-10 gap-4">
        <div>ScreenMate AI © 2026. Production-Ready Visual Copilot System.</div>
        <div className="flex items-center space-x-6 text-gray-300">
          <span className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Local Permission Control</span>
          </span>
          <span>Zero Secrets Exposed</span>
        </div>
      </footer>
    </div>
  );
};
