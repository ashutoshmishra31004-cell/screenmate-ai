export interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  hasScreenshotContext?: boolean;
  screenshotUrl?: string;
  structuredGuidance?: {
    currentScreen?: string;
    nextSteps?: string[];
    why?: string;
  };
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export type ScreenCaptureSource = 'screen' | 'window' | 'tab' | 'manual';

export interface ScreenCaptureState {
  isCapturing: boolean;
  source: ScreenCaptureSource;
  previewUrl: string | null;
  lastCaptureTime: number | null;
  permissionGranted: boolean;
  error: string | null;
  isMonitoring: boolean;
  monitoringInterval: number; // in seconds
  autoAnalysis: 'manual' | 'significant_change' | 'continuous';
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  supported: boolean;
  error: string | null;
}

export interface AppSettings {
  // General
  theme: 'dark' | 'light';
  language: string;
  startupMode: 'dashboard' | 'floating';

  // AI
  aiProvider: 'openai' | 'custom';
  aiModel: string;
  temperature: number;
  maxTokens: number;
  apiKeySet: boolean;

  // Screen
  captureSource: ScreenCaptureSource;
  monitoringInterval: number; // in seconds (1, 3, 5, 10)
  autoAnalysis: 'manual' | 'significant_change' | 'continuous';
  privacyMode: boolean;

  // Voice
  voiceEnabled: boolean;
  ttsEnabled: boolean;
  voiceActivation: boolean;

  // Privacy
  screenshotRetention: boolean;
  conversationRetention: boolean;

  // Extension
  extensionConnected: boolean;
}

export interface ExtensionStatus {
  installed: boolean;
  version: string | null;
  tabTitle?: string;
  tabUrl?: string;
}

export interface AnalyzeScreenRequest {
  image: string; // base64 string
  question?: string;
  conversationId?: string;
}

export interface AnalyzeScreenResponse {
  analysis: string;
  structuredGuidance?: {
    currentScreen: string;
    nextSteps: string[];
    why: string;
  };
  timestamp: number;
}
