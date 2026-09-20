import { describe, it, expect } from 'vitest';
import { parseAndValidateBase64Image } from '../server/utils/imageProcessor';

describe('ImageProcessor Unit Tests', () => {
  it('should parse valid base64 data URL correctly', () => {
    const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const parsed = parseAndValidateBase64Image(mockDataUrl);
    expect(parsed.mimeType).toBe('image/png');
    expect(parsed.base64Data).toBeDefined();
    expect(parsed.sizeBytes).toBeGreaterThan(0);
  });

  it('should handle raw base64 string without data URL prefix', () => {
    const mockBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const parsed = parseAndValidateBase64Image(mockBase64);
    expect(parsed.mimeType).toBe('image/jpeg');
    expect(parsed.base64Data).toBe(mockBase64);
  });

  it('should throw error for invalid empty image input', () => {
    expect(() => parseAndValidateBase64Image('')).toThrow('Invalid or empty image payload.');
  });
});
