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
   * Subscription value analysis endpoint
   * This endpoint requires Pro subscription
   */
  app.post('/api/perplexity/subscription-analysis', requireAuth, requireProSubscription, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        subscriptionName: z.string().min(1, 'Subscription name is required'),
        amount: z.number().positive('Amount must be positive'),
        frequency: z.string().min(1, 'Frequency is required'),
        category: z.string().optional()
      });

      const validatedData = schema.parse(req.body);
      
      // Convert to monthly cost for better analysis
      let monthlyCost = validatedData.amount;
      if (validatedData.frequency === 'annual') {
        monthlyCost = validatedData.amount / 12;
      } else if (validatedData.frequency === 'quarterly') {
        monthlyCost = validatedData.amount / 3;
      } else if (validatedData.frequency === 'semi-annual') {
        monthlyCost = validatedData.amount / 6;
      } else if (validatedData.frequency === 'weekly') {
        monthlyCost = validatedData.amount * 4.33; // Average weeks per month
      } else if (validatedData.frequency === 'bi-weekly') {
        monthlyCost = validatedData.amount * 2.17; // Average bi-weeks per month
      }
      
      const userPrompt = `Analyze if this subscription provides good value: 
      - Service: ${validatedData.subscriptionName}
      - Monthly cost: $${monthlyCost.toFixed(2)}
      - Payment frequency: ${validatedData.frequency}
      - Category: ${validatedData.category || 'unknown'}
      
      Rate the value as "excellent", "good", "fair", or "poor".
      Provide a brief explanation of the rating (max 40 words).
      Format response as JSON with fields: "rating" and "analysis".`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "You are an expert financial analyst specializing in subscription value assessment. Be precise and concise."
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          temperature: 0.1,
          max_tokens: 150,
          top_p: 0.9,
          response_format: { type: "json_object" },
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error:', errorText);
        return res.status(500).json({ error: 'Error analyzing subscription value' });
      }

      const data = await response.json();
      
      try {
        const analysis = JSON.parse(data.choices[0].message.content);
        return res.json({
          rating: analysis.rating || 'good',
          analysis: analysis.analysis || 'Analysis not available',
          sources: data.citations || []
        });
      } catch (parseError) {
        console.error('Error parsing Perplexity response:', parseError);
        // Fall back to basic analysis if JSON parsing fails
        return res.json({
          rating: 'good',
          analysis: data.choices[0].message.content,
          sources: data.citations || []
        });
      }
    } catch (error) {
      console.error('Error analyzing subscription value:', error);
      
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: 'Failed to analyze subscription value',
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