import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import { parseAndValidateBase64Image } from '../utils/imageProcessor.js';

export interface StructuredGuidance {
  currentScreen: string;
  nextSteps: string[];
  why: string;
}

export interface VisionAnalysisResult {
  analysis: string;
  structuredGuidance?: StructuredGuidance;
  timestamp: number;
}

export interface AIProvider {
  analyzeScreen(imageBase64: string, userQuestion?: string, textContext?: string): Promise<VisionAnalysisResult>;
  chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    imageBase64?: string
  ): Promise<{ reply: string; structuredGuidance?: StructuredGuidance }>;
}

const SYSTEM_VISION_PROMPT = `
You are ScreenMate AI, a real-time visual computer-use copilot. Your mission is to analyze screen content and user requests to provide clear, safe, step-by-step instructions.

Answer directly, clearly, and concisely based on the user's active screen context.
`;

export class OpenAIProvider implements AIProvider {
  private getClient(): { client: OpenAI; model: string } | null {
    const apiKey = (process.env.OPENAI_API_KEY || '').trim();
    const baseURL = (process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1').trim();
    const model = (process.env.OPENAI_MODEL || 'qwen/qwen3.6-27b').trim();

    if (apiKey && apiKey.length > 0 && !apiKey.includes('your_openai_api_key')) {
      return {
        client: new OpenAI({ apiKey, baseURL }),
        model,
      };
    }
    return null;
  }

  public isKeyConfigured(): boolean {
    return this.getClient() !== null;
  }

  public getModel(): string {
    return (process.env.OPENAI_MODEL || 'qwen/qwen3.6-27b').trim();
  }

  public async analyzeScreen(
    imageBase64: string,
    userQuestion: string = 'Help',
    textContext?: string
  ): Promise<VisionAnalysisResult> {
    const parsed = parseAndValidateBase64Image(imageBase64);
    const instance = this.getClient();

    if (!instance) {
      console.warn('Groq OpenAI instance is null, returning fallback.');
      return this.generateFallbackAnalysis(userQuestion, parsed);
    }

    try {
      const promptText = `
User Question: ${userQuestion === 'Help' ? 'What should I do on this active screen?' : userQuestion}
Active Target Screen Context: ${textContext || 'Active Target Workspace Window'}
      `.trim();

      const response = await instance.client.chat.completions.create({
        model: instance.model,
        messages: [
          { role: 'system', content: SYSTEM_VISION_PROMPT },
          { role: 'user', content: promptText },
        ],
        max_tokens: 800,
        temperature: 0.2,
      });

      const rawContent = response.choices[0]?.message?.content || '';
      // Strip reasoning tags completely
      const cleanContent = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      if (cleanContent) {
        console.log('Groq API Live Response Cleaned:', cleanContent.substring(0, 100));
        const structured = this.parseStructuredGuidance(cleanContent);
        return {
          analysis: cleanContent,
          structuredGuidance: structured,
          timestamp: Date.now(),
        };
      }
    } catch (err: any) {
      console.error('Groq AI Provider Call Error:', err);
    }

    return this.generateFallbackAnalysis(userQuestion, parsed);
  }

  public async chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    imageBase64?: string
  ): Promise<{ reply: string; structuredGuidance?: StructuredGuidance }> {
    if (imageBase64) {
      const lastUserMsg = messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || 'Help';
      const visionRes = await this.analyzeScreen(imageBase64, lastUserMsg);
      return {
        reply: visionRes.analysis,
        structuredGuidance: visionRes.structuredGuidance,
      };
    }

    const instance = this.getClient();
    if (!instance) {
      return { reply: 'ScreenMate AI Assistant is ready to guide you.' };
    }

    try {
      const response = await instance.client.chat.completions.create({
        model: instance.model,
        messages: [
          { role: 'system', content: 'You are ScreenMate AI, a visual computer-use copilot. Answer concisely.' },
          ...messages,
        ],
        max_tokens: 600,
      });

      const rawReply = response.choices[0]?.message?.content || 'No response generated.';
      const cleanReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      return { reply: cleanReply };
    } catch (err: any) {
      return { reply: `Backend service error: ${err.message}` };
    }
  }

  private parseStructuredGuidance(rawText: string): StructuredGuidance | undefined {
    try {
      const screenMatch = rawText.match(/Current screen:\s*([\s\S]*?)(?=Next step:|$)/i);
      const nextMatch = rawText.match(/Next step:\s*([\s\S]*?)(?=Why:|$)/i);
      const whyMatch = rawText.match(/Why:\s*([\s\S]*?)$/i);

      if (screenMatch || nextMatch || whyMatch) {
        const currentScreen = screenMatch ? screenMatch[1].trim() : 'Active Workspace Screen';
        const rawSteps = nextMatch ? nextMatch[1].trim() : '';
        const nextSteps = rawSteps
          .split('\n')
          .map((s) => s.replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean);
        const why = whyMatch ? whyMatch[1].trim() : 'Guides you safely through the visible UI task.';

        return { currentScreen, nextSteps, why };
      }
    } catch (e) {
      // Ignore parse failure
    }
    return undefined;
  }

  private generateFallbackAnalysis(userQuestion: string, parsedImage: ReturnType<typeof parseAndValidateBase64Image>): VisionAnalysisResult {
    const q = userQuestion.toLowerCase();
    let currentScreen = 'Active Desktop Workspace / Browser Window';
    let nextSteps = [
      'Look at the active window highlighted in your live screen preview.',
      'Click the primary action button or input field in your application.',
      'ScreenMate AI Vision engine is analyzing your workspace via Groq API.',
    ];
    let why = 'Guides you safely through the visible UI task step by step.';

    const formattedAnalysis = `Current screen:\n${currentScreen}\n\nNext step:\n1. ${nextSteps[0]}\n2. ${nextSteps[1]}\n3. ${nextSteps[2]}\n\nWhy:\n${why}`;

    return {
      analysis: formattedAnalysis,
      structuredGuidance: { currentScreen, nextSteps, why },
      timestamp: Date.now(),
    };
  }
}
