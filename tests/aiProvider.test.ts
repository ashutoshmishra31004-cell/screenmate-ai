import { describe, it, expect } from 'vitest';
import { OpenAIProvider } from '../server/services/aiProvider';

describe('OpenAIProvider Unit Tests', () => {
  it('should initialize without crashing when API key is unconfigured', () => {
    const provider = new OpenAIProvider();
    expect(provider).toBeDefined();
    expect(provider.getModel()).toBeDefined();
  });

  it('should return analysis response with timestamp for screen analysis', async () => {
    const provider = new OpenAIProvider();
    const mockImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = await provider.analyzeScreen(mockImage, 'Where do I click?');
    expect(result.analysis).toBeDefined();
    expect(typeof result.analysis).toBe('string');
    expect(result.analysis.length).toBeGreaterThan(0);
    expect(result.timestamp).toBeGreaterThan(0);
  });
});
