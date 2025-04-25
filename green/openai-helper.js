/**
 * OpenAI Helper Module for Stackr
 * Provides utility functions for interacting with OpenAI APIs
 */

import { createToast } from './components/toast.js';

// OpenAI API endpoint
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Check if OpenAI API key is configured
 * @returns {Promise<{configured: boolean, status: string}>} - OpenAI configuration status
 */
export async function checkOpenAIConfigured() {
  try {
    // Check if API key is configured on server-side
    const response = await fetch('/api/ai/status');
    const data = await response.json();
    
    return {
      configured: data.configured === true,
      status: data.status || 'unknown',
      provider: data.provider || 'openai'
    };
  } catch (error) {
    console.error('Error checking OpenAI configuration:', error);
    return {
      configured: false,
      status: 'error',
      provider: 'openai'
    };
  }
}

/**
 * Generate text using OpenAI API
 * @param {string} prompt - The prompt to send to OpenAI
 * @param {Object} options - Additional options
 * @param {string} options.model - OpenAI model to use (default: gpt-4)
 * @param {number} options.temperature - Temperature for generation (default: 0.7)
 * @param {number} options.maxTokens - Maximum tokens to generate (default: 300)
 * @returns {Promise<string>} - The generated text
 */
export async function generateText(prompt, options = {}) {
  const {
    model = 'gpt-4',
    temperature = 0.7,
    maxTokens = 300
  } = options;
  
  try {
    // First check if the API is configured
    const configStatus = await checkOpenAIConfigured();
    
    if (!configStatus.configured) {
      createToast('AI features require an API key. Using intelligent fallbacks instead.', 'warning');
      console.error('OpenAI API key not configured');
      return getSmartFallbackResponse(prompt);
    }
    
    // Check for quota exceeded status
    if (configStatus.status === 'quota_exceeded') {
      createToast('AI quota exceeded. Using intelligent fallbacks instead.', 'warning');
      console.error('OpenAI API quota exceeded');
      return getSmartFallbackResponse(prompt);
    }
    
    // Check for other error status
    if (configStatus.status !== 'active') {
      createToast('AI service currently unavailable. Using intelligent fallbacks instead.', 'warning');
      console.error(`OpenAI API status: ${configStatus.status}`);
      return getSmartFallbackResponse(prompt);
    }
    
    // Call the server-side API proxy to avoid exposing API key
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        model,
        temperature,
        maxTokens
      })
    });
    
    const data = await response.json();
    
    // If status is not 2xx, use the suggested response
    if (!response.ok) {
      if (data.error === 'QUOTA_EXCEEDED') {
        createToast('AI quota exceeded. Using intelligent fallbacks instead.', 'warning');
      }
      
      // Use the suggested response if provided, otherwise get a fallback
      return data.suggestedResponse || getSmartFallbackResponse(prompt);
    }
    
    return data.text;
  } catch (error) {
    console.error('Error generating text with OpenAI:', error);
    // Instead of throwing, return a fallback response
    return getSmartFallbackResponse(prompt);
  }
}

// Smart fallback responses based on prompt context
function getSmartFallbackResponse(prompt) {
  // Detect the type of prompt to provide contextually relevant responses
  const promptLower = prompt.toLowerCase();
  
  // Motivation fallbacks
  if (promptLower.includes('motivation') || promptLower.includes('motivational')) {
    const motivationResponses = [
      "Your consistent financial habits today build your freedom tomorrow.",
      "Small daily wins compound into significant financial growth over time.",
      "Focus on progress, not perfection - every financial step matters.",
      "Financial freedom isn't built in a day, but daily consistent actions."
    ];
    return motivationResponses[Math.floor(Math.random() * motivationResponses.length)];
  }
  
  // Reflection fallbacks
  if (promptLower.includes('reflect') || promptLower.includes('reflection')) {
    return "This week, review your expense categories to identify one potential area for saving. Remember to celebrate your consistency in tracking - that's already a significant win!";
  }
  
  // Summary fallbacks
  if (promptLower.includes('summary') || promptLower.includes('summarize')) {
    return "Your spending patterns show good discipline in most categories. Consider setting specific goals for your top spending areas to optimize further.";
  }
  
  // General financial advice fallback
  return "Focus on building consistent financial habits. Track expenses regularly, maintain emergency savings, and make intentional spending decisions aligned with your long-term goals.";
}

/**
 * Generate a motivation message
 * @param {string} goals - User's financial goals
 * @param {string} painPoints - User's financial pain points
 * @returns {Promise<string>} - The motivation message
 */
export async function generateMotivationMessage(goals, painPoints) {
  const prompt = `
You're a motivational financial coach. 
Based on this user's goals (${goals}) and struggles (${painPoints}),
give them one sentence of motivational advice for today.
Be specific, actionable, and uplifting. Keep it under 150 characters.
`;

  try {
    const message = await generateText(prompt, {
      temperature: 0.8,
      maxTokens: 150
    });
    return message;
  } catch (error) {
    console.error('Error generating motivation message:', error);
    return 'Your consistent efforts today create financial freedom tomorrow.';
  }
}

/**
 * Generate a weekly financial reflection
 * @param {string} goals - User's financial goals
 * @param {string} painPoints - User's financial pain points
 * @param {string} recentActivity - Recent user activity
 * @returns {Promise<string>} - The financial reflection
 */
export async function generateFinancialReflection(goals, painPoints, recentActivity) {
  const prompt = `
You're an empathetic financial assistant.
User goals: ${goals}.
Struggles: ${painPoints}.
Recent activity: ${recentActivity || "none"}.
Give one clear suggestion for this week + 1 small win.
Keep your response under 150 words, be encouraging but honest.
`;

  try {
    const reflection = await generateText(prompt, {
      temperature: 0.7,
      maxTokens: 300
    });
    return reflection;
  } catch (error) {
    console.error('Error generating financial reflection:', error);
    return 'Continue to track your expenses and set realistic budget goals. Look for small wins in your consistent tracking habits.';
  }
}

/**
 * Generate a monthly behavior summary
 * @param {string} monthData - Text description of monthly data
 * @returns {Promise<string>} - The generated summary
 */
export async function generateBehaviorSummary(monthData) {
  const prompt = `
Summarize this month's financial behavior:
${monthData}
Give 1 insight, 1 concern, 1 win.
Keep the entire response under 150 words.
`;

  try {
    const summary = await generateText(prompt, {
      temperature: 0.7,
      maxTokens: 300
    });
    return summary;
  } catch (error) {
    console.error('Error generating behavior summary:', error);
    return 'Based on your financial data, continue to monitor your spending patterns and look for opportunities to optimize your budget.';
  }
}

/**
 * Generate a team member encouragement message
 * @param {string} name - Team member's name
 * @param {Array} goals - Team member's financial goals
 * @param {Array} painPoints - Team member's financial pain points
 * @returns {Promise<string>} - The encouragement message
 */
export async function generateTeamMemberEncouragement(name, goals, painPoints) {
  const prompt = `
${name} is working towards these financial goals: ${goals.join(', ')}.
Their struggles are: ${painPoints.join(', ')}.
Write one sentence of financial encouragement that's specific to their situation.
Keep it under 150 characters.
`;

  try {
    const message = await generateText(prompt, {
      temperature: 0.8,
      maxTokens: 150
    });
    return message;
  } catch (error) {
    console.error('Error generating team member encouragement:', error);
    return 'Keep working toward your financial goals!';
  }
}