import { Router } from 'express';
import { OpenAI } from 'openai';

const router = Router();

// Initialize OpenAI client if API key is available
const openaiApiKey = process.env.OPENAI_API_KEY;
let openaiClient: OpenAI | null = null;

if (openaiApiKey) {
  openaiClient = new OpenAI({
    apiKey: openaiApiKey,
  });
  console.log('OpenAI client initialized');
} else {
  console.warn('OPENAI_API_KEY not found. OpenAI functionality will be limited or disabled.');
}

// Check if OpenAI API is configured
router.get('/status', (req, res) => {
  res.json({
    configured: !!openaiApiKey,
    provider: 'openai'
  });
});

// Generate text using OpenAI API
router.post('/generate', async (req, res) => {
  try {
    if (!openaiClient) {
      return res.status(503).json({
        message: 'OpenAI API key not configured'
      });
    }

    const { prompt, model = 'gpt-4o', temperature = 0.7, maxTokens = 300 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        message: 'Prompt is required'
      });
    }

    const completion = await openaiClient.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    });

    // Extract the generated text from the response
    const text = completion.choices[0]?.message?.content || '';

    res.json({
      text,
      model: completion.model,
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    res.status(500).json({
      message: error.message || 'Failed to generate text',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export const registerOpenAIRoutes = (app: any) => {
  app.use('/api/ai', router);
};