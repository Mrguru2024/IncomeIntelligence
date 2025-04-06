import axios from 'axios';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityRequest {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: string;
  top_k?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

// Perplexity citations are returned as an array of strings
type PerplexityCitation = string;

interface PerplexityChoice {
  index: number;
  finish_reason: string;
  message: {
    role: string;
    content: string;
  };
  delta: {
    role: string;
    content: string;
  };
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: PerplexityCitation[];
  choices: PerplexityChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Check if PERPLEXITY_API_KEY is present
if (!process.env.PERPLEXITY_API_KEY) {
  console.warn('Warning: PERPLEXITY_API_KEY environment variable is not set');
}

/**
 * Get financial advice from Perplexity AI
 * @param userPrompt - The financial question or context to analyze
 * @param systemPrompt - Optional system prompt to guide the model
 * @returns The model's response
 */
export async function getAdviceFromPerplexity(
  userPrompt: string,
  systemPrompt: string = 'You are a helpful financial advisor. Provide accurate, concise, and useful financial advice.'
): Promise<string> {
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY environment variable is not set');
    }

    const perplexityRequest: PerplexityRequest = {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'month',
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1
    };

    const response = await axios.post<PerplexityResponse>(
      'https://api.perplexity.ai/chat/completions',
      perplexityRequest,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('No response content received from Perplexity API');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Perplexity API Error:', error.response?.data || error.message);
      throw new Error(`Perplexity API Error: ${error.response?.data?.error?.message || error.message}`);
    } else {
      console.error('Error getting advice from Perplexity:', error);
      throw error;
    }
  }
}

/**
 * Get financial analysis with citations from Perplexity AI
 * @param userPrompt - The financial data or context to analyze
 * @param systemPrompt - Optional system prompt to guide the model
 * @returns The model's response and citations
 */
export async function getFinancialAnalysisWithCitations(
  userPrompt: string,
  systemPrompt: string = 'You are a professional financial analyst. Analyze the provided financial data comprehensively with relevant citations.'
): Promise<{ content: string; citations: string[] }> {
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY environment variable is not set');
    }

    const perplexityRequest: PerplexityRequest = {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.1, // Lower temperature for more factual responses
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'month',
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1
    };

    const response = await axios.post<PerplexityResponse>(
      'https://api.perplexity.ai/chat/completions',
      perplexityRequest,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      // Perplexity returns citations as string[]
      return {
        content: response.data.choices[0].message.content,
        citations: response.data.citations || []
      };
    } else {
      throw new Error('No response content received from Perplexity API');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Perplexity API Error:', error.response?.data || error.message);
      throw new Error(`Perplexity API Error: ${error.response?.data?.error?.message || error.message}`);
    } else {
      console.error('Error getting analysis from Perplexity:', error);
      throw error;
    }
  }
}

/**
 * Generate recommendations for investments or financial strategies
 * @param userContext - Context about the user's financial situation and goals
 * @returns Investment or strategy recommendations
 */
export async function generateFinancialRecommendations(
  userContext: string
): Promise<{ recommendations: string[]; explanation: string }> {
  try {
    const prompt = `Based on the following financial context, provide 3-5 specific investment or financial strategy recommendations. 
For each recommendation, include a brief explanation of why it's appropriate.
Format your response as JSON with "recommendations" (an array of strings) and "explanation" (a string providing overall context).

Financial Context:
${userContext}`;

    const systemMessage = 'You are a certified financial planner with expertise in investment strategies. Provide accurate, personalized recommendations based on the user\'s financial situation. Always respond with valid JSON.';

    const result = await getAdviceFromPerplexity(prompt, systemMessage);
    
    try {
      // Parse the JSON response
      const parsed = JSON.parse(result);
      return {
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        explanation: parsed.explanation || ''
      };
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // Fallback to text parsing if JSON parsing fails
      const recommendations = result
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
      
      return {
        recommendations: recommendations.length ? recommendations : [result],
        explanation: 'Recommendation generated from financial analysis'
      };
    }
  } catch (error) {
    console.error('Error generating financial recommendations:', error);
    throw error;
  }
}