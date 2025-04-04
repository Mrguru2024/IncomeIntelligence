import OpenAI from 'openai';
import { storage } from './storage';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type FinancialAdviceRequest = {
  userId: number;
  incomeData?: any[]; // Recent income data
  expenseData?: any[]; // Recent expense data
  goalData?: any[]; // User's financial goals
  balanceData?: any; // Current balance information
  question?: string; // Specific financial question (optional)
};

export type FinancialAdviceResponse = {
  advice: string;
  suggestions: string[];
  summary?: string;
};

// Generate financial advice based on user data
export async function getFinancialAdvice(requestData: FinancialAdviceRequest): Promise<FinancialAdviceResponse> {
  try {
    const { userId, question } = requestData;

    // Fetch user data if not provided
    let incomeData = requestData.incomeData;
    let expenseData = requestData.expenseData;
    let goalData = requestData.goalData;
    let balanceData = requestData.balanceData;

    if (!incomeData) {
      incomeData = await storage.getIncomesByUserId(userId);
    }

    if (!expenseData) {
      // Get expenses for the last 3 months for a better overview
      const now = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      
      // Fetch expenses from storage
      // In a production app, you would filter by date range
      expenseData = await storage.getExpensesByUserId(userId);
    }

    if (!goalData) {
      goalData = await storage.getGoalsByUserId(userId);
    }

    // Create a prompt for the AI
    const currentDate = new Date().toISOString().split('T')[0];
    
    const prompt = `
    You are a professional financial advisor specialized in giving advice to service providers using a 40/30/30 income allocation model (40% for needs, 30% for investments, 30% for savings). Today is ${currentDate}.
    
    Here is the financial data for this user:
    
    INCOME DATA:
    ${JSON.stringify(incomeData, null, 2)}
    
    EXPENSE DATA:
    ${JSON.stringify(expenseData, null, 2)}
    
    FINANCIAL GOALS:
    ${JSON.stringify(goalData, null, 2)}
    
    ${question ? `The user has asked: ${question}` : 'Provide general financial advice based on their income patterns, expenses, and goals.'}
    
    Please create a detailed analysis and financial advice based on this data. Include:
    1. A general assessment of their financial situation
    2. Specific advice regarding their 40/30/30 allocation
    3. How their current behavior aligns with their financial goals
    4. Actionable suggestions to improve their financial health
    
    Format your response as a JSON object with these fields:
    {
      "advice": "Detailed financial advice with multiple paragraphs",
      "suggestions": ["Specific action item 1", "Specific action item 2", "Specific action item 3"],
      "summary": "A one-paragraph summary of the key advice"
    }
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a financial advisor specializing in personal finance for service providers." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000, 
      temperature: 0.7
    });

    // Extract and return the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsedResponse = JSON.parse(content);
    return {
      advice: parsedResponse.advice,
      suggestions: parsedResponse.suggestions,
      summary: parsedResponse.summary
    };
  } catch (error) {
    console.error("Error generating financial advice:", error);
    throw error;
  }
}

// Suggest financial goals based on income data
export async function suggestFinancialGoals(incomeData: any[]): Promise<any[]> {
  try {
    // Calculate average monthly income
    const totalIncome = incomeData.reduce((sum, income) => {
      return sum + (typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount);
    }, 0);
    
    const avgMonthlyIncome = totalIncome / Math.max(1, incomeData.length);

    const prompt = `
    You are a financial goal-setting expert for service providers. Based on the following income data, suggest 3 realistic financial goals.
    
    Average Monthly Income: $${avgMonthlyIncome.toFixed(2)}
    
    Raw Income Data:
    ${JSON.stringify(incomeData, null, 2)}
    
    For each goal, provide:
    1. A name for the goal
    2. A target amount (as a number)
    3. A reasonable timeframe (e.g., "3 months", "6 months", "1 year")
    4. A brief description of why this goal would be beneficial
    
    Format your response as a JSON object with a "goals" array containing goal objects:
    {
      "goals": [
        {
          "name": "Goal name",
          "targetAmount": 1000,
          "timeframe": "3 months",
          "description": "Benefit description"
        },
        // Additional goals...
      ]
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a financial goal-setting expert." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error suggesting financial goals:", error);
    throw error;
  }
}

// Analyze expenses to find patterns and suggest optimizations
export async function analyzeExpenses(expenseData: any[]): Promise<any> {
  try {
    if (!expenseData || expenseData.length === 0) {
      return {
        analysis: "No expense data available for analysis.",
        suggestions: ["Start tracking your expenses to receive personalized analysis."],
        potentialSavings: 0
      };
    }

    // Calculate total expenses by category
    const categoryTotals: Record<string, number> = {};
    let totalExpenses = 0;

    expenseData.forEach(expense => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      totalExpenses += amount;
      
      const category = expense.category || 'uncategorized';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += amount;
    });

    const prompt = `
    You are a financial expense analyzer. Based on the following expense data, provide an analysis and suggestions for optimization.
    
    Total Expenses: $${totalExpenses.toFixed(2)}
    
    Expenses by Category:
    ${Object.entries(categoryTotals)
      .map(([category, amount]) => `${category}: $${amount.toFixed(2)} (${((amount / totalExpenses) * 100).toFixed(1)}%)`)
      .join('\n')}
    
    Raw Expense Data:
    ${JSON.stringify(expenseData, null, 2)}
    
    Provide:
    1. A detailed analysis of spending patterns
    2. Suggestions for reducing expenses
    3. An estimated amount of potential monthly savings
    
    Format your response as a JSON object:
    {
      "analysis": "Detailed analysis of expense patterns",
      "suggestions": ["Specific suggestion 1", "Specific suggestion 2", "Specific suggestion 3"],
      "potentialSavings": 120.50
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a financial expense analysis expert." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing expenses:", error);
    throw error;
  }
}