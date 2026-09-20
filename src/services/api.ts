import { AnalyzeScreenResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function checkBackendHealth(): Promise<{ status: string; apiKeyConfigured: boolean; model: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Health check failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      status: 'offline',
      apiKeyConfigured: false,
      model: 'unavailable',
    };
  }
}

export async function analyzeScreenApi(
  image: string,
  question?: string
): Promise<AnalyzeScreenResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/analyze-screen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image, question }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Server responded with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('API analyzeScreen error:', err);
    throw new Error(err.message || 'Failed to connect to ScreenMate AI server.');
  }
}

export async function sendChatApi(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  image?: string
): Promise<{ reply: string; structuredGuidance?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, image }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Chat API error ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('API sendChat error:', err);
    throw new Error(err.message || 'Failed to send message to ScreenMate backend.');
  }
}
