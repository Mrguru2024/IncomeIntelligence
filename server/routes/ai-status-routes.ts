import express from 'express';
import { AIProvider, getAISettings } from '../ai-service';
import OpenAI from 'openai';
import { Resend } from 'resend';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

// Initialize AI clients
let openaiClient: OpenAI | null = null;
let perplexityClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

if (process.env.PERPLEXITY_API_KEY) {
  perplexityClient = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: 'https://api.perplexity.ai/v1',
  });
}

if (process.env.ANTHROPIC_API_KEY) {
  anthropicClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

// Check AI services status
router.get('/status', async (req, res) => {
  try {
    const status = {
      openai: {
        status: 'unknown' as 'active' | 'error' | 'unknown',
        message: '',
      },
      perplexity: {
        status: 'unknown' as 'active' | 'error' | 'unknown',
        message: '',
      },
      anthropic: {
        status: 'unknown' as 'active' | 'error' | 'unknown',
        message: '',
      }
    };

    // Check OpenAI status
    if (openaiClient) {
      try {
        // Use a simple models list call to check connection
        await openaiClient.models.list();
        status.openai.status = 'active';
      } catch (error: any) {
        status.openai.status = 'error';
        status.openai.message = error.message || 'OpenAI API error';
        
        // Check for quota exceeded
        if (error.message && error.message.includes('quota')) {
          status.openai.message = 'API quota exceeded. Please check your billing.';
        }
      }
    } else {
      status.openai.message = 'OpenAI API key not configured';
    }

    // Check Perplexity status
    if (perplexityClient) {
      try {
        // Use a simple models list call to check connection
        await perplexityClient.models.list();
        status.perplexity.status = 'active';
      } catch (error: any) {
        status.perplexity.status = 'error';
        status.perplexity.message = error.message || 'Perplexity API error';
        
        // Check for quota exceeded
        if (error.message && (error.message.includes('quota') || error.message.includes('limit'))) {
          status.perplexity.message = 'API quota exceeded. Please check your billing.';
        }
      }
    } else {
      status.perplexity.message = 'Perplexity API key not configured';
    }

    // Check Anthropic/Claude status
    if (anthropicClient) {
      try {
        // Use a simple models list call to check connection
        await anthropicClient.messages.create({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 1,
          messages: [{role: 'user', content: 'Hello'}]
        });
        status.anthropic.status = 'active';
      } catch (error: any) {
        status.anthropic.status = 'error';
        status.anthropic.message = error.message || 'Anthropic API error';
        
        // Check for quota exceeded
        if (error.message && error.message.includes('quota')) {
          status.anthropic.message = 'API quota exceeded. Please check your billing.';
        }
      }
    } else {
      status.anthropic.message = 'Anthropic API key not configured';
    }

    // Return the status
    res.json(status);
  } catch (error: any) {
    console.error('Error checking AI status:', error);
    res.status(500).json({ 
      message: 'Failed to check AI service status',
      error: error.message
    });
  }
});

// Additional AI-related routes can be added here

export function registerAIStatusRoutes(app: express.Express) {
  app.use('/api/ai', router);
  console.log('AI status routes registered');
}