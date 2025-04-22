import { Express, Request, Response } from 'express';
import { perplexityService, FinancialTopicCategory } from '../services/perplexity-service';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { requireAuth } from '../middleware/authMiddleware';
import { requireProSubscription } from '../middleware/proSubscriptionMiddleware';

/**
 * Register all Perplexity AI API routes
 */
export function registerPerplexityRoutes(app: Express) {
  /**
   * Get financial advice from Perplexity AI
   * This endpoint requires Pro subscription
   */
  app.post('/api/perplexity/financial-advice', requireAuth, requireProSubscription, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        query: z.string().min(10, 'Query must be at least 10 characters long'),
        category: z.nativeEnum(FinancialTopicCategory).optional(),
        userContext: z.string().optional()
      });

      const validatedData = schema.parse(req.body);
      
      // Get financial advice
      const advice = await perplexityService.getFinancialAdvice(
        validatedData.query,
        validatedData.category || FinancialTopicCategory.GENERAL,
        validatedData.userContext
      );
      
      res.json({ advice });
    } catch (error) {
      console.error('Error getting financial advice:', error);
      
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: 'Failed to get financial advice',
        error: error.message
      });
    }
  });

  /**
   * Get income allocation recommendation
   * This endpoint requires Pro subscription
   */
  app.post('/api/perplexity/income-allocation', requireAuth, requireProSubscription, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        monthlyIncome: z.number().positive('Monthly income must be positive'),
        financialGoals: z.array(z.string()).min(1, 'At least one financial goal is required'),
        existingExpenses: z.record(z.string(), z.number())
      });

      const validatedData = schema.parse(req.body);
      
      // Get allocation recommendation
      const allocation = await perplexityService.getIncomeAllocationRecommendation(
        validatedData.monthlyIncome,
        validatedData.financialGoals,
        validatedData.existingExpenses
      );
      
      res.json({ allocation });
    } catch (error) {
      console.error('Error getting income allocation recommendation:', error);
      
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: 'Failed to get income allocation recommendation',
        error: error.message
      });
    }
  });

  /**
   * Get investment recommendations
   * This endpoint requires Pro subscription
   */
  app.post('/api/perplexity/investment-recommendations', requireAuth, requireProSubscription, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        riskTolerance: z.enum(['low', 'medium', 'high']),
        investmentTimeframe: z.enum(['short', 'medium', 'long']),
        investmentAmount: z.number().positive('Investment amount must be positive'),
        financialGoals: z.array(z.string()).min(1, 'At least one financial goal is required')
      });

      const validatedData = schema.parse(req.body);
      
      // Get investment recommendations
      const recommendations = await perplexityService.getInvestmentRecommendations(
        validatedData.riskTolerance,
        validatedData.investmentTimeframe,
        validatedData.investmentAmount,
        validatedData.financialGoals
      );
      
      res.json({ recommendations });
    } catch (error) {
      console.error('Error getting investment recommendations:', error);
      
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: 'Failed to get investment recommendations',
        error: error.message
      });
    }
  });

  /**
   * Get debt repayment plan
   * This endpoint requires Pro subscription
   */
  app.post('/api/perplexity/debt-repayment-plan', requireAuth, requireProSubscription, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        debts: z.array(z.object({
          name: z.string(),
          balance: z.number().positive('Debt balance must be positive'),
          interestRate: z.number().min(0, 'Interest rate cannot be negative'),
          minimumPayment: z.number().min(0, 'Minimum payment cannot be negative')
        })).min(1, 'At least one debt is required'),
        monthlyIncomeAvailableForDebt: z.number().positive('Monthly income available for debt must be positive')
      });

      const validatedData = schema.parse(req.body);
      
      // Get debt repayment plan
      const plan = await perplexityService.getDebtRepaymentPlan(
        validatedData.debts,
        validatedData.monthlyIncomeAvailableForDebt
      );
      
      res.json({ plan });
    } catch (error) {
      console.error('Error getting debt repayment plan:', error);
      
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: 'Failed to get debt repayment plan',
        error: error.message
      });
    }
  });

  /**
   * Demo endpoint for financial advice - no authentication required
   * This is useful for displaying examples on the landing page
   */
  app.get('/api/perplexity/demo/advice', async (req: Request, res: Response) => {
    try {
      const demoQueries = [
        "What's the 50/30/20 budget rule and how do I apply it?",
        "How can I start investing with just $500?",
        "What's the best way to pay off credit card debt?",
        "How much should I save for an emergency fund?",
        "What are some side hustles I can start to generate extra income?"
      ];
      
      // Pick a random demo query
      const randomQuery = demoQueries[Math.floor(Math.random() * demoQueries.length)];
      
      // Get financial advice with a short timeout to prevent long wait times
      const advice = await Promise.race([
        perplexityService.getFinancialAdvice(randomQuery),
        new Promise<string>((resolve) => {
          setTimeout(() => resolve(
            "Based on the 50/30/20 rule, you should allocate 50% of your after-tax income to needs (housing, food, utilities), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment. To apply it, track your spending for a month, categorize each expense, and adjust your budget to match these percentages. Start by focusing on reducing expenses in your 'wants' category if you're currently spending more than 30% there."
          ), 3000);
        })
      ]);
      
      res.json({ 
        query: randomQuery,
        advice 
      });
    } catch (error) {
      console.error('Error getting demo financial advice:', error);
      res.status(500).json({ 
        message: 'Failed to get demo financial advice',
        error: error.message
      });
    }
  });
  
  /**
   * Health check endpoint for Perplexity AI service
   */
  app.get('/api/perplexity/health', async (req: Request, res: Response) => {
    try {
      // Simple health check - just verify we can connect to the API
      const testQuery = "What is compound interest?";
      
      // Try with a short timeout
      const result = await Promise.race([
        perplexityService.getFinancialAdvice(testQuery),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Perplexity API timeout")), 5000);
        })
      ]);
      
      res.json({ 
        status: 'ok',
        message: 'Perplexity AI API is working'
      });
    } catch (error) {
      console.error('Perplexity health check failed:', error);
      res.status(503).json({ 
        status: 'error',
        message: 'Perplexity AI API is not available',
        error: error.message
      });
    }
  });
}