import { Router, Request, Response } from 'express';
import { OpenAIProvider } from '../services/aiProvider.js';

export const apiRouter = Router();
const aiProvider = new OpenAIProvider();

// Healthcheck endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: aiProvider.isKeyConfigured(),
    model: aiProvider.getModel(),
    timestamp: Date.now(),
  });
});

// Analyze screen endpoint with Groq text Context support
apiRouter.post('/analyze-screen', async (req: Request, res: Response) => {
  try {
    const { image, question, textContext } = req.body;

    if (!image) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing "image" field in request payload.',
      });
    }

    const result = await aiProvider.analyzeScreen(image, question || 'Help', textContext);
    return res.json(result);
  } catch (err: any) {
    console.error('Error handling /api/analyze-screen:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An error occurred while processing the screenshot.',
    });
  }
});

// Multi-turn chat endpoint
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, image } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing or invalid "messages" array in request body.',
      });
    }

    const result = await aiProvider.chat(messages, image);
    return res.json(result);
  } catch (err: any) {
    console.error('Error handling /api/chat:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An error occurred while handling chat request.',
    });
  }
});
