/**
 * OpenAI Helper Module for Stackr
 * Provides utility functions for interacting with OpenAI APIs
 */

import { createToast } from './components/toast.js';

// OpenAI API endpoint
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Check if OpenAI API key is configured
 * @returns {Promise<boolean>} - Whether the API key is configured
 */
export async function checkOpenAIConfigured() {
  try {
    // Check if API key is configured on server-side
    const response = await fetch('/api/ai/status');
    const data = await response.json();
    return data.configured === true;
  } catch (error) {
    console.error('Error checking OpenAI configuration:', error);
    return false;
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
    const isConfigured = await checkOpenAIConfigured();
    if (!isConfigured) {
      createToast('AI features require an API key in settings. Please add one or contact support.', 'error');
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
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
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error generating text');
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error generating text with OpenAI:', error);
    throw error;
  }
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