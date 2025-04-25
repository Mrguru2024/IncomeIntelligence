import { Express, Request, Response } from 'express';
import { getPerplexityService, FinancialTopicCategory } from '../services/perplexity-service';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { requireAuth } from '../middleware/authMiddleware';
import { requireProSubscription } from '../middleware/proSubscriptionMiddleware';
import { Router } from 'express';
import { getAISettings, updateAISettings, AIProvider } from '../ai-service';

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
      const perplexityService = getPerplexityService();
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
        error: error instanceof Error ? error.message : String(error)
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
      const perplexityService = getPerplexityService();
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
        error: error instanceof Error ? error.message : String(error)
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
      const perplexityService = getPerplexityService();
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
        error: error instanceof Error ? error.message : String(error)
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
      const perplexityService = getPerplexityService();
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
        error: error instanceof Error ? error.message : String(error)
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
      const perplexityService = getPerplexityService();
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
      console.error('Error getting demo advice:', error);
      res.status(500).json({ 
        message: 'Failed to get demo advice',
        error: error instanceof Error ? error.message : String(error)
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
        getPerplexityService().getFinancialAdvice(testQuery),
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
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  /**
   * Process user settings commands
   * This endpoint allows AI to modify user settings based on requests
   */
  app.post('/api/perplexity/settings-command', requireAuth, requireProSubscription, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        command: z.string().min(5, 'Command must be at least 5 characters long'),
        settingType: z.enum(['ai', 'user', 'preferences', 'notifications', 'display']),
        userId: z.string().or(z.number())
      });

      const validatedData = schema.parse(req.body);
      
      // Process command through Perplexity
      const perplexityService = getPerplexityService();
      const command = validatedData.command;
      
      // Detect the type of settings change requested
      const systemPrompt = `You are a command interpreter for a financial app called Stackr. 
        Parse the user's command and determine what settings they want to change. 
        Respond ONLY with a JSON object containing the settings to update and their new values. 
        For AI settings, valid keys are: DEFAULT_PROVIDER (accepted values: openai, anthropic, perplexity), 
        CACHE_ENABLED (boolean), MAX_RETRIES (number between 1-5).
        For display settings, valid keys are: theme (light/dark), fontSize (small/medium/large).
        For notification settings, valid keys are: emailNotifications (boolean), pushNotifications (boolean), 
        reminderFrequency (daily/weekly/monthly).
        
        Examples:
        User: "Change the AI model to GPT-4"
        Response: {"DEFAULT_PROVIDER": "openai"}
        
        User: "I prefer Claude AI"
        Response: {"DEFAULT_PROVIDER": "anthropic"}
        
        User: "Set dark mode"
        Response: {"theme": "dark"}
        
        User: "Send me weekly notifications"
        Response: {"reminderFrequency": "weekly"}`;
      
      // Send the query to Perplexity with specialized system prompt
      const response = await perplexityService.getFinancialAdvice(
        command,
        FinancialTopicCategory.GENERAL,
        systemPrompt
      );
      
      // Try to extract JSON response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                          response.match(/{[\s\S]*?}/);
      
      if (!jsonMatch) {
        return res.status(400).json({ 
          message: 'Failed to parse settings from command',
          commandResponse: response
        });
      }
      
      let jsonStr = jsonMatch[0];
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonMatch[1];
      }
      
      const settingsChanges = JSON.parse(jsonStr);
      let updatedSettings;
      
      // Apply changes based on the setting type
      switch (validatedData.settingType) {
        case 'ai':
          // Filter out unsupported settings
          const validAISettings = Object.entries(settingsChanges)
            .filter(([key]) => ['DEFAULT_PROVIDER', 'CACHE_ENABLED', 'MAX_RETRIES'].includes(key))
            .reduce((obj, [key, value]) => {
              obj[key] = value;
              return obj;
            }, {} as Record<string, any>);
            
          if (Object.keys(validAISettings).length === 0) {
            return res.status(400).json({ 
              message: 'No valid AI settings found in command',
              commandResponse: response
            });
          }
          
          // Update AI settings
          updatedSettings = updateAISettings(validAISettings);
          break;
          
        case 'user':
        case 'preferences':
        case 'notifications':
        case 'display':
          // For now, we'll just acknowledge these settings but not implement them
          // In a full implementation, these would update user preferences in the database
          updatedSettings = {
            message: 'Settings would be updated in the database',
            type: validatedData.settingType,
            changes: settingsChanges
          };
          break;
          
        default:
          return res.status(400).json({ message: 'Unsupported settings type' });
      }
      
      // Return the updated settings
      res.json({ 
        success: true,
        originalCommand: command,
        parsedResponse: response,
        updatedSettings 
      });
    } catch (error) {
      console.error('Error processing settings command:', error);
      
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      if (error instanceof SyntaxError) {
        return res.status(400).json({ 
          message: 'Failed to parse AI response as JSON',
          error: error.message
        });
      }
      
      res.status(500).json({ 
        message: 'Failed to process settings command',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

const router = Router();

// Route to get financial advice
router.post('/advice', requireAuth, requireProSubscription, async (req, res) => {
  try {
    const { query, category, userContext } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const perplexityService = getPerplexityService();
    const advice = await perplexityService.getFinancialAdvice(
      query,
      category || FinancialTopicCategory.GENERAL,
      userContext
    );

    res.json({ advice });
  } catch (error: any) {
    console.error('Error in /advice route:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Route to get income allocation recommendation
router.post('/income-allocation', requireAuth, requireProSubscription, async (req, res) => {
  try {
    const { monthlyIncome, financialGoals, existingExpenses } = req.body;

    if (!monthlyIncome || !financialGoals || !existingExpenses) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const perplexityService = getPerplexityService();
    const allocation = await perplexityService.getIncomeAllocationRecommendation(
      monthlyIncome,
      financialGoals,
      existingExpenses
    );

    res.json({ allocation });
  } catch (error: any) {
    console.error('Error in /income-allocation route:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;