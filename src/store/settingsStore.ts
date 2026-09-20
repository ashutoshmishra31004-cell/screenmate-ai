import { AppSettings } from '../types';

const STORAGE_KEY = 'screenmate_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'en',
  startupMode: 'dashboard',
  aiProvider: 'openai',
  aiModel: 'gpt-4o-mini',
  temperature: 0.2,
  maxTokens: 1000,
  apiKeySet: false,
  captureSource: 'screen',
  monitoringInterval: 3,
  autoAnalysis: 'manual',
  privacyMode: false,
  voiceEnabled: true,
  ttsEnabled: false,
  voiceActivation: false,
  screenshotRetention: false,
  conversationRetention: true,
  extensionConnected: false,
};

export class SettingsStore {
  private static settings: AppSettings = SettingsStore.loadSettings();
  private static listeners: Set<(settings: AppSettings) => void> = new Set();

  public static getSettings(): AppSettings {
    return { ...SettingsStore.settings };
  }

  public static updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    SettingsStore.settings = { ...SettingsStore.settings, ...newSettings };
    SettingsStore.saveSettings();
    SettingsStore.notify();
    return SettingsStore.getSettings();
  }

  public static resetSettings(): AppSettings {
    SettingsStore.settings = { ...DEFAULT_SETTINGS };
    SettingsStore.saveSettings();
    SettingsStore.notify();
    return SettingsStore.getSettings();
  }

  public static subscribe(listener: (settings: AppSettings) => void): () => void {
    SettingsStore.listeners.add(listener);
    return () => {
      SettingsStore.listeners.delete(listener);
    };
  }

  private static loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (err) {
      console.warn('Failed to load settings from localStorage', err);
    }
    return DEFAULT_SETTINGS;
  }

  private static saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SettingsStore.settings));
    } catch (err) {
      console.warn('Failed to save settings to localStorage', err);
    }
  }

  private static notify(): void {
    const current = SettingsStore.getSettings();
    SettingsStore.listeners.forEach((listener) => listener(current));
  }
}
