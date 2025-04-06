import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { requireAuth } from '../middleware/authMiddleware';
import { requireProSubscription } from '../middleware/proSubscriptionMiddleware';
import { 
  getAdviceFromPerplexity, 
  getFinancialAnalysisWithCitations, 
  generateFinancialRecommendations 
} from '../services/perplexity-service';
import { storage } from '../storage';

export function registerPerplexityRoutes(app: Express) {
  // Get financial advice from Perplexity AI - Protected by authentication
  app.post('/api/perplexity/financial-advice', requireAuth, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.number().int().positive(),
        question: z.string().optional(),
      });
      
      const { userId, question } = schema.parse(req.body);
      
      // Check if user ID matches authenticated user
      if (req.user?.id !== userId) {
        return res.status(403).json({ message: 'Unauthorized to get advice for this user' });
      }
      
      // Gather relevant financial data for the user
      const incomeData = await storage.getIncomesByUserId(userId);
      const expenseData = await storage.getExpensesByUserId(userId);
      const goalData = await storage.getGoalsByUserId(userId);
      
      // Get the most recent balance data
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const balanceData = await storage.getBalance(userId, currentYear, currentMonth);
      
      // Prepare prompt with context
      let prompt = `Based on the following financial information, provide personalized financial advice:

Income data: ${JSON.stringify(incomeData)}
Expense data: ${JSON.stringify(expenseData)}
Goal data: ${JSON.stringify(goalData)}
Balance data: ${JSON.stringify(balanceData)}
`;

      // Add the question if provided
      if (question) {
        prompt += `\nThe user's specific question is: "${question}"`;
      }
      
      // Add formatting instructions
      prompt += `\n\nYour response should be formatted as valid JSON with the following structure:
{
  "advice": "Main advice paragraph",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "summary": "Brief summary of financial situation"
}`;

      // Get advice from Perplexity
      const systemPrompt = 'You are a certified financial advisor specializing in personal finance. Your expertise includes budgeting, debt management, savings strategies, and investment planning. Always provide accurate, relevant, and actionable financial advice. Format your response in valid JSON.';
      const adviceResult = await getAdviceFromPerplexity(prompt, systemPrompt);
      
      try {
        // Parse JSON response
        const parsedResponse = JSON.parse(adviceResult);
        res.json(parsedResponse);
      } catch (parseError) {
        // If not valid JSON, wrap in a basic structure
        console.error('Error parsing Perplexity response as JSON:', parseError);
        res.json({
          advice: adviceResult,
          suggestions: [],
          summary: 'Unable to format response properly'
        });
      }
    } catch (error) {
      console.error('Error getting financial advice from Perplexity:', error);
      
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: 'Failed to get financial advice',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get financial analysis with citations - Premium feature
  app.post('/api/perplexity/financial-analysis', requireAuth, requireProSubscription, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.number().int().positive(),
        topic: z.string().optional(),
        period: z.enum(['week', 'month', 'year']).optional().default('month')
      });
      
      const { userId, topic, period } = schema.parse(req.body);
      
      // Check if user ID matches authenticated user
      if (req.user?.id !== userId) {
        return res.status(403).json({ message: 'Unauthorized to get analysis for this user' });
      }
      
      // Get expense data for the relevant period
      const today = new Date();
      const currentYear = today.getFullYear();
      let expenseData;
      
      if (period === 'week') {
        // For a week analysis, get the current month's data and filter client-side
        expenseData = await storage.getExpensesByMonth(currentYear, today.getMonth());
      } else if (period === 'month') {
        expenseData = await storage.getExpensesByMonth(currentYear, today.getMonth());
      } else if (period === 'year') {
        // For a year analysis, we'd ideally collect data for all months
        // This is simplified for now - in a real implementation, we'd aggregate all months
        expenseData = await storage.getExpensesByUserId(userId);
      }
      
      // Build prompt
      let prompt = `Analyze the following financial data for the past ${period}:

Expense data: ${JSON.stringify(expenseData)}`;

      if (topic) {
        prompt += `\n\nThe user is particularly interested in: "${topic}"`;
      }
      
      prompt += `\n\nProvide a detailed analysis with specific insights, identifying patterns, and making realistic recommendations.
Format your response as JSON with the following structure:
{
  "summary": "Overall financial health assessment",
  "topCategories": [{"category": "Category name", "amount": 123.45, "percentage": 25.5}],
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}`;

      // Get analysis from Perplexity
      const systemPrompt = 'You are a financial analysis expert with deep expertise in personal finance metrics and patterns. Provide clear, actionable insights based on financial data.';
      const result = await getFinancialAnalysisWithCitations(prompt, systemPrompt);
      
      try {
        // Parse JSON response
        const parsedContent = JSON.parse(result.content);
        res.json({
          ...parsedContent,
          citations: result.citations
        });
      } catch (parseError) {
        // If not valid JSON, wrap in a basic structure
        console.error('Error parsing Perplexity response as JSON:', parseError);
        res.json({
          summary: result.content,
          topCategories: [],
          insights: [],
          recommendations: [],
          citations: result.citations
        });
      }
    } catch (error) {
      console.error('Error getting financial analysis from Perplexity:', error);
      
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: 'Failed to get financial analysis',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Generate investment recommendations - Premium feature
  app.post('/api/perplexity/investment-recommendations', requireAuth, requireProSubscription, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.number().int().positive(),
        riskTolerance: z.enum(['low', 'medium', 'high']).optional(),
        investmentGoals: z.array(z.string()).optional(),
        timeHorizon: z.string().optional()
      });
      
      const { userId, riskTolerance, investmentGoals, timeHorizon } = schema.parse(req.body);
      
      // Check if user ID matches authenticated user
      if (req.user?.id !== userId) {
        return res.status(403).json({ message: 'Unauthorized to get recommendations for this user' });
      }
      
      // Get user profile and financial data
      const profile = await storage.getUserProfile(userId);
      const incomeData = await storage.getIncomesByUserId(userId);
      const goalData = await storage.getGoalsByUserId(userId);
      
      // Build context
      let userContext = `User Profile:
- Income Level: ${getIncomeLevel(incomeData)}
- Risk Tolerance: ${riskTolerance || 'Medium'}
- Investment Goals: ${investmentGoals?.join(', ') || 'General wealth building'}
- Time Horizon: ${timeHorizon || 'Long term (5+ years)'}

Current Financial State:
- Monthly Income: ${getTotalMonthlyIncome(incomeData)}
- Financial Goals: ${formatGoals(goalData)}
`;

      // Get recommendations from Perplexity
      const recommendations = await generateFinancialRecommendations(userContext);
      
      res.json(recommendations);
    } catch (error) {
      console.error('Error generating investment recommendations:', error);
      
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: 'Failed to generate investment recommendations',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

// Helper functions
function getIncomeLevel(incomeData: any[]): string {
  // Calculate total annual income
  const totalMonthly = getTotalMonthlyIncome(incomeData);
  const annualIncome = totalMonthly * 12;
  
  if (annualIncome < 30000) return 'Low';
  if (annualIncome < 60000) return 'Lower-Middle';
  if (annualIncome < 100000) return 'Middle';
  if (annualIncome < 200000) return 'Upper-Middle';
  return 'High';
}

function getTotalMonthlyIncome(incomeData: any[]): number {
  if (!incomeData || !incomeData.length) return 0;
  
  // Sum all income amounts, assuming they're monthly
  return incomeData.reduce((sum, income) => {
    const amount = typeof income.amount === 'string' 
      ? parseFloat(income.amount) 
      : income.amount;
    
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
}

function formatGoals(goalData: any[]): string {
  if (!goalData || !goalData.length) return 'No specific goals set';
  
  return goalData.map(goal => {
    const targetAmount = typeof goal.targetAmount === 'string' 
      ? parseFloat(goal.targetAmount) 
      : goal.targetAmount;
    
    return `${goal.name}: $${targetAmount} (${goal.isCompleted ? 'Completed' : 'In Progress'})`;
  }).join(', ');
}