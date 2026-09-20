import React, { useState, useEffect } from 'react';
import { X, Settings, Cpu, Monitor, Mic, Shield, Globe, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppSettings } from '../types';
import { SettingsStore } from '../store/settingsStore';
import { ChatStore } from '../store/chatStore';
import { ExtensionBridge } from '../services/extensionBridge';
import { checkBackendHealth } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'screen' | 'voice' | 'privacy' | 'extension'>('general');
  const [settings, setSettings] = useState<AppSettings>(SettingsStore.getSettings());
  const [backendHealth, setBackendHealth] = useState<{ status: string; apiKeyConfigured: boolean; model: string } | null>(null);
  const [checkingBackend, setCheckingBackend] = useState<boolean>(false);
  const [extensionStatus, setExtensionStatus] = useState(ExtensionBridge.getStatus());

  useEffect(() => {
    if (isOpen) {
      setSettings(SettingsStore.getSettings());
      testBackend();
      ExtensionBridge.ping();
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = ExtensionBridge.subscribe((status) => {
      setExtensionStatus(status);
    });
    return unsub;
  }, []);

  const testBackend = async () => {
    setCheckingBackend(true);
    const health = await checkBackendHealth();
    setBackendHealth(health);
    setCheckingBackend(false);
  };

  const handleUpdate = (updated: Partial<AppSettings>) => {
    const newSt = SettingsStore.updateSettings(updated);
    setSettings(newSt);
    if (onSettingsChange) onSettingsChange();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all local conversations and reset settings to default?')) {
      ChatStore.clearAllData();
      SettingsStore.resetSettings();
      setSettings(SettingsStore.getSettings());
      if (onSettingsChange) onSettingsChange();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-3xl w-full h-[600px] glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Settings className="w-5 h-5 text-brand-cyan" />
            <h2 className="text-lg font-bold text-white">ScreenMate Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-100 hover:bg-surface-200 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Sidebar + Main Tab View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tabs Sidebar */}
          <div className="w-48 bg-surface-100/50 border-r border-white/5 p-3 space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'general' ? 'bg-brand-500/20 text-brand-cyan border border-brand-cyan/30' : 'text-gray-400 hover:bg-surface-100 hover:text-gray-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>General</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'ai' ? 'bg-brand-500/20 text-brand-cyan border border-brand-cyan/30' : 'text-gray-400 hover:bg-surface-100 hover:text-gray-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>AI Model</span>
            </button>

            <button
              onClick={() => setActiveTab('screen')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'screen' ? 'bg-brand-500/20 text-brand-cyan border border-brand-cyan/30' : 'text-gray-400 hover:bg-surface-100 hover:text-gray-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Screen Capture</span>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'voice' ? 'bg-brand-500/20 text-brand-cyan border border-brand-cyan/30' : 'text-gray-400 hover:bg-surface-100 hover:text-gray-200'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Voice & TTS</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'privacy' ? 'bg-brand-500/20 text-brand-cyan border border-brand-cyan/30' : 'text-gray-400 hover:bg-surface-100 hover:text-gray-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Privacy & Storage</span>
            </button>

            <button
              onClick={() => setActiveTab('extension')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'extension' ? 'bg-brand-500/20 text-brand-cyan border border-brand-cyan/30' : 'text-gray-400 hover:bg-surface-100 hover:text-gray-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Browser Extension</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">General Configuration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleUpdate({ theme: e.target.value as any })}
                      className="w-full bg-surface-100 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="dark">Dark Mode (Default)</option>
                      <option value="light">Light Mode</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Startup Mode</label>
                    <select
                      value={settings.startupMode}
                      onChange={(e) => handleUpdate({ startupMode: e.target.value as any })}
                      className="w-full bg-surface-100 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="dashboard">Full Dashboard View</option>
                      <option value="floating">Floating Compact Assistant</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">AI Vision Engine</h3>

                {/* API Status Card */}
                <div className="p-4 rounded-xl bg-surface-100/80 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span>Backend Status:</span>
                      {backendHealth?.status === 'ok' ? (
                        <span className="text-brand-emerald font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Connected ({backendHealth.model})</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Local Fallback Provider Active</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      API keys are configured securely via server environment variables (`.env`).
                    </p>
                  </div>

                  <button
                    onClick={testBackend}
                    disabled={checkingBackend}
                    className="p-2 rounded-lg glass-panel hover:bg-surface-200 text-brand-cyan transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${checkingBackend ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Provider</label>
                    <select
                      value={settings.aiProvider}
                      onChange={(e) => handleUpdate({ aiProvider: e.target.value as any })}
                      className="w-full bg-surface-100 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="openai">OpenAI Compatible Vision API</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Vision Model</label>
                    <input
                      type="text"
                      value={settings.aiModel}
                      onChange={(e) => handleUpdate({ aiModel: e.target.value })}
                      className="w-full bg-surface-100 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'screen' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">Screen Monitoring & Capture</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Preferred Capture Source</label>
                    <select
                      value={settings.captureSource}
                      onChange={(e) => handleUpdate({ captureSource: e.target.value as any })}
                      className="w-full bg-surface-100 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="screen">Entire Screen</option>
                      <option value="window">Application Window</option>
                      <option value="tab">Browser Tab</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Continuous Monitoring Interval</label>
                    <select
                      value={settings.monitoringInterval}
                      onChange={(e) => handleUpdate({ monitoringInterval: Number(e.target.value) })}
                      className="w-full bg-surface-100 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value={1}>1 Second (High Frequency)</option>
                      <option value={3}>3 Seconds (Recommended)</option>
                      <option value={5}>5 Seconds</option>
                      <option value={10}>10 Seconds</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Automatic Analysis Mode</label>
                    <select
                      value={settings.autoAnalysis}
                      onChange={(e) => handleUpdate({ autoAnalysis: e.target.value as any })}
                      className="w-full bg-surface-100 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="manual">Manual (Analyze only when requested)</option>
                      <option value="significant_change">On Significant Screen Change</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">Voice Interaction & Audio</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-surface-100/60 border border-white/5 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-white">Voice Speech-to-Text</div>
                      <div className="text-[11px] text-gray-400">Allow saying "Help" or asking questions orally.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.voiceEnabled}
                      onChange={(e) => handleUpdate({ voiceEnabled: e.target.checked })}
                      className="w-4 h-4 accent-brand-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-surface-100/60 border border-white/5 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-white">Text-to-Speech Output (TTS)</div>
                      <div className="text-[11px] text-gray-400">Read AI step-by-step guidance aloud automatically.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.ttsEnabled}
                      onChange={(e) => handleUpdate({ ttsEnabled: e.target.checked })}
                      className="w-4 h-4 accent-brand-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">Privacy & Local Data Management</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-surface-100/60 border border-white/5 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-white">Retain Screenshot History</div>
                      <div className="text-[11px] text-gray-400">Save thumbnails in conversation log (stored locally only).</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.screenshotRetention}
                      onChange={(e) => handleUpdate({ screenshotRetention: e.target.checked })}
                      className="w-4 h-4 accent-brand-500"
                    />
                  </label>

                  <div className="pt-4 border-t border-white/10">
                    <button
                      onClick={handleClearAll}
                      className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear All Local Conversations & Data</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'extension' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">ScreenMate Chrome Extension</h3>

                <div className="p-4 rounded-xl bg-surface-100/80 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Extension Connection Status:</span>
                    {extensionStatus.installed ? (
                      <span className="px-2 py-0.5 rounded bg-brand-emerald/20 text-brand-emerald text-xs font-bold">
                        Connected (v{extensionStatus.version})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold">
                        Not Detected
                      </span>
                    )}
                  </div>
                  {extensionStatus.tabTitle && (
                    <div className="text-[11px] text-gray-400">
                      Active Tab: <span className="text-gray-200 font-medium">{extensionStatus.tabTitle}</span>
                    </div>
                  )}
                </div>

                <div className="bg-surface-100/50 p-4 rounded-xl border border-white/5 space-y-2 text-xs text-gray-300">
                  <p className="font-bold text-white">How to load unpacked Extension:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400">
                    <li>Open Chrome and navigate to <code className="text-brand-cyan font-mono">chrome://extensions</code>.</li>
                    <li>Enable <strong className="text-white">Developer mode</strong> in the top right corner.</li>
                    <li>Click <strong className="text-white">Load unpacked</strong>.</li>
                    <li>Select the <code className="text-brand-cyan font-mono">/extension</code> directory from this project.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
