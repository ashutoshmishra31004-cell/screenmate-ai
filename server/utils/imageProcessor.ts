export interface ParsedImage {
  mimeType: string;
  base64Data: string;
  sizeBytes: number;
}

export function parseAndValidateBase64Image(dataUrl: string): ParsedImage {
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new Error('Invalid or empty image payload.');
  }

  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    // If raw base64 string without data URL header
    return {
      mimeType: 'image/jpeg',
      base64Data: dataUrl,
      sizeBytes: Math.round((dataUrl.length * 3) / 4),
    };
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const sizeBytes = Math.round((base64Data.length * 3) / 4);

  // 10MB maximum payload check
  if (sizeBytes > 10 * 1024 * 1024) {
    throw new Error('Screenshot payload size exceeds 10MB limit.');
  }

  return {
    mimeType,
    base64Data,
    sizeBytes,
  };
}
