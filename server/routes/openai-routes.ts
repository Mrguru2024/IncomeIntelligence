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
router.get('/status', async (req, res) => {
  const isConfigured = !!openaiApiKey;
  let status = 'unconfigured';
  
  if (isConfigured && openaiClient) {
    try {
      // Make a small test request to check if the API key has quota
      const testCompletion = await openaiClient.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
      
      // If we get here, the API key is valid and has quota
      status = 'active';
    } catch (error: any) {
      console.error('Error testing OpenAI API:', error);
      
      // Check for quota errors
      if (error.code === 'insufficient_quota') {
        status = 'quota_exceeded';
      } else {
        status = 'error';
      }
    }
  }
  
  res.json({
    configured: isConfigured,
    status: status,
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

    try {
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
    } catch (apiError: any) {
      console.error('OpenAI API error:', apiError);
      
      // Check for specific error types
      if (apiError.code === 'insufficient_quota') {
        // Handle quota errors gracefully
        return res.status(402).json({
          message: 'OpenAI API quota exceeded',
          error: 'QUOTA_EXCEEDED',
          suggestedResponse: 'Your financial journey requires consistent effort, but brings long-term rewards. Keep tracking your progress daily!'
        });
      } else {
        throw apiError; // Re-throw for the outer catch
      }
    }
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    res.status(500).json({
      message: error.message || 'Failed to generate text',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
      suggestedResponse: 'Focus on small daily wins to build your financial future - consistency is key!'
    });
  }
});

export const registerOpenAIRoutes = (app: any) => {
  app.use('/api/ai', router);
};