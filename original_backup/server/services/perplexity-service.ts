import fetch from 'node-fetch';

// Define the message structure for the Perplexity API
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Define the perplexity API response structure
interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations?: Array<string>;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Define different financial topic categories for specialized advice
export enum FinancialTopicCategory {
  BUDGETING = 'budgeting',
  INVESTING = 'investing',
  SAVING = 'saving',
  DEBT = 'debt',
  RETIREMENT = 'retirement',
  TAXES = 'taxes',
  INCOME = 'income_generation',
  GENERAL = 'general',
}

/**
 * Service for interacting with the Perplexity AI API to get financial advice
 */
export class PerplexityService {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is not set');
    }
    this.apiKey = apiKey;
  }

  /**
   * Get financial advice on a specific topic using Perplexity AI
   * 
   * @param query The user's financial question
   * @param category The category of financial advice
   * @param userContext Additional context about the user's financial situation (optional)
   * @returns The AI-generated financial advice
   */
  async getFinancialAdvice(
    query: string,
    category: FinancialTopicCategory = FinancialTopicCategory.GENERAL,
    userContext?: string
  ): Promise<string> {
    try {
      // Prepare system prompt based on the category
      const systemPrompt = this.getSystemPromptForCategory(category);
      
      // Prepare messages array
      const messages: Message[] = [
        {
          role: 'system',
          content: systemPrompt,
        }
      ];
      
      // Add user context if provided
      if (userContext) {
        messages.push({
          role: 'user',
          content: `Here's my financial context: ${userContext}`
        });
        
        // Add a mock assistant response to maintain the alternating pattern
        messages.push({
          role: 'assistant',
          content: 'Thank you for providing your financial context. I will take that into account when answering your question.'
        });
      }
      
      // Add the user's question
      messages.push({
        role: 'user',
        content: query
      });

      // Call Perplexity API
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: messages,
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 800,
          frequency_penalty: 1,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as PerplexityResponse;
      
      // Return the AI response content
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error('Error getting financial advice from Perplexity:', error);
      throw new Error(`Failed to get financial advice: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a recommendation for how to allocate income based on financial goals
   * 
   * @param monthlyIncome User's monthly income
   * @param financialGoals Array of the user's financial goals
   * @param existingExpenses Object containing the user's existing expense categories and amounts
   * @returns Recommended allocation percentages for different spending categories
   */
  async getIncomeAllocationRecommendation(
    monthlyIncome: number,
    financialGoals: string[],
    existingExpenses: Record<string, number>
  ): Promise<Record<string, number>> {
    try {
      // Create a detailed context for the AI
      const context = `
        Monthly income: $${monthlyIncome}
        Financial goals: ${financialGoals.join(', ')}
        Current expense breakdown:
        ${Object.entries(existingExpenses)
          .map(([category, amount]) => `- ${category}: $${amount}`)
          .join('\n')}
      `;

      // Create the query
      const query = `Based on my financial situation, recommend a percentage allocation across spending categories (needs, savings, investments, wants) that will help me achieve my financial goals. Please provide specific percentages that add up to 100% and explain your reasoning. Provide your answer in JSON format with category names as keys and percentage numbers (without % signs) as values.`;

      // Get the advice
      const aiResponse = await this.getFinancialAdvice(
        query,
        FinancialTopicCategory.BUDGETING,
        context
      );

      // Extract the JSON object from the response
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                        aiResponse.match(/{[\s\S]*?}/);
      
      if (!jsonMatch) {
        throw new Error('Could not parse allocation recommendation from AI response');
      }

      let jsonStr = jsonMatch[0];
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonMatch[1];
      }

      const allocation = JSON.parse(jsonStr) as Record<string, number>;
      
      // Validate the allocation sums to approximately 100%
      const total = Object.values(allocation).reduce((sum, percent) => sum + percent, 0);
      if (total < 95 || total > 105) {
        throw new Error(`Allocation percentages don't sum to 100% (got ${total}%)`);
      }

      return allocation;
    } catch (error: any) {
      console.error('Error getting income allocation recommendation:', error);
      throw new Error(`Failed to get income allocation recommendation: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get personalized investment strategy recommendations
   */
  async getInvestmentRecommendations(
    riskTolerance: 'low' | 'medium' | 'high',
    investmentTimeframe: 'short' | 'medium' | 'long',
    investmentAmount: number,
    financialGoals: string[]
  ): Promise<string> {
    const context = `
      Risk tolerance: ${riskTolerance}
      Investment timeframe: ${investmentTimeframe}
      Amount to invest: $${investmentAmount}
      Financial goals: ${financialGoals.join(', ')}
    `;

    const query = "Based on my profile, please recommend an investment strategy. Include specific asset allocation recommendations, types of investment vehicles I should consider, and any precautions I should take. Make your advice specific and actionable.";

    return this.getFinancialAdvice(
      query,
      FinancialTopicCategory.INVESTING,
      context
    );
  }

  /**
   * Get a debt repayment plan
   */
  async getDebtRepaymentPlan(
    debts: Array<{ name: string, balance: number, interestRate: number, minimumPayment: number }>,
    monthlyIncomeAvailableForDebt: number
  ): Promise<string> {
    const context = `
      Monthly income available for debt repayment: $${monthlyIncomeAvailableForDebt}
      Debts:
      ${debts.map(debt => 
        `- ${debt.name}: $${debt.balance} at ${debt.interestRate}% interest, minimum payment: $${debt.minimumPayment}`
      ).join('\n')}
    `;

    const query = "Please create a debt repayment plan for me that minimizes the interest I'll pay while getting out of debt as quickly as possible. Include the order I should pay off my debts, how much I should pay towards each debt monthly, and how long it will take to become debt-free with this plan.";

    return this.getFinancialAdvice(
      query,
      FinancialTopicCategory.DEBT,
      context
    );
  }

  /**
   * Generate specialized system prompts based on financial topic category
   */
  private getSystemPromptForCategory(category: FinancialTopicCategory): string {
    const basePrompt = "You are an expert financial advisor with 20 years of experience. Provide clear, actionable financial advice based on the situation described. Focus on practical steps the person can take, not just general principles. Use simple language, avoid jargon, and back up your advice with reasoning.";
    
    switch (category) {
      case FinancialTopicCategory.BUDGETING:
        return `${basePrompt} You specialize in personal budgeting. Help the person create a realistic budget that aligns with their goals and income. Suggest specific spending limits for different categories and ways to track expenses.`;
        
      case FinancialTopicCategory.INVESTING:
        return `${basePrompt} You specialize in investment planning. Suggest investment strategies appropriate for the person's risk tolerance, time horizon, and goals. Be specific about asset allocation and investment vehicles.`;
        
      case FinancialTopicCategory.SAVING:
        return `${basePrompt} You specialize in helping people save effectively. Recommend specific strategies to increase savings rate, appropriate savings vehicles, and ways to automate the saving process.`;
        
      case FinancialTopicCategory.DEBT:
        return `${basePrompt} You specialize in debt management and elimination. Provide actionable advice on prioritizing debt payments, negotiating with creditors, and strategies to become debt-free faster.`;
        
      case FinancialTopicCategory.RETIREMENT:
        return `${basePrompt} You specialize in retirement planning. Help the person understand how much they need to save, which retirement accounts to use, and how to allocate their investments to meet their retirement goals.`;
        
      case FinancialTopicCategory.TAXES:
        return `${basePrompt} You specialize in tax planning for individuals. Suggest legitimate strategies to minimize tax burden, take advantage of deductions and credits, and properly plan for tax payments.`;
        
      case FinancialTopicCategory.INCOME:
        return `${basePrompt} You specialize in helping people increase their income. Provide practical suggestions for side hustles, career advancement, negotiating raises, or starting small businesses based on the person's skills and situation.`;
        
      case FinancialTopicCategory.GENERAL:
      default:
        return basePrompt;
    }
  }
}

// Export a singleton instance
export const perplexityService = new PerplexityService();