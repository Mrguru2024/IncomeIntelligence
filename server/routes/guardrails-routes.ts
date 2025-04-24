import express from 'express';
import { guardrailsService } from '../services/guardrails-service';
import { insertSpendingLimitSchema, insertSpendingLogSchema } from '@shared/schema';
import { z } from 'zod';
import OpenAI from 'openai';
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';

// Initialize OpenAI client if API key is available
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Create router
const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('Guardrails auth check - isAuthenticated:', req.isAuthenticated ? req.isAuthenticated() : 'function not available');
  console.log('Guardrails auth check - user:', req.user);
  
  // Development mode bypass
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    console.log('Guardrails: Development mode - bypassing auth check');
    req.user = req.user || {
      id: 1,
      username: 'developmentUser',
      email: 'dev@example.com',
      role: 'user'
    };
    return next();
  }
  
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Parse and validate spending limit data
const parseSpendingLimitData = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const validatedData = insertSpendingLimitSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(400).json({ error: 'Invalid request data' });
  }
};

// Parse and validate spending log data
const parseSpendingLogData = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const validatedData = insertSpendingLogSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(400).json({ error: 'Invalid request data' });
  }
};

/**
 * Set or update a category spending limit
 * POST /api/guardrails/limits
 */
router.post('/limits', requireAuth, parseSpendingLimitData, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limitData = {
      category: req.body.category,
      limitAmount: req.body.limitAmount,
      cycle: req.body.cycle,
      isActive: req.body.isActive,
    };

    const limit = await guardrailsService.setSpendingLimit(userId, limitData);
    res.status(201).json(limit);
  } catch (error) {
    console.error('Error setting spending limit:', error);
    res.status(500).json({ error: 'Failed to set spending limit' });
  }
});

/**
 * Get all spending limits for the user
 * GET /api/guardrails/limits
 */
router.get('/limits', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limits = await guardrailsService.getSpendingLimits(userId);
    res.json(limits);
  } catch (error) {
    console.error('Error getting spending limits:', error);
    res.status(500).json({ error: 'Failed to get spending limits' });
  }
});

/**
 * Log a new spending transaction
 * POST /api/guardrails/logs
 */
router.post('/logs', requireAuth, parseSpendingLogData, async (req, res) => {
  try {
    const userId = req.user!.id;
    const logData = {
      category: req.body.category,
      amountSpent: req.body.amountSpent,
      description: req.body.description,
      source: req.body.source,
      timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
    };

    const log = await guardrailsService.logSpending(userId, logData);
    res.status(201).json(log);
  } catch (error) {
    console.error('Error logging spending:', error);
    res.status(500).json({ error: 'Failed to log spending' });
  }
});

/**
 * Get spending summary with limits and status
 * GET /api/guardrails/summary
 */
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const periodType = (req.query.period as string) || 'weekly';
    
    let startDate: Date;
    const endDate = new Date();
    
    if (periodType === 'monthly') {
      // First day of current month
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    } else {
      // Start of current week (Sunday)
      startDate = startOfWeek(endDate, { weekStartsOn: 0 });
    }
    
    const summary = await guardrailsService.getSpendingSummary(userId, {
      start: startDate,
      end: endDate
    });
    
    res.json(summary);
  } catch (error) {
    console.error('Error getting spending summary:', error);
    res.status(500).json({ error: 'Failed to get spending summary' });
  }
});

/**
 * Check for spending alerts (over 80% or 100% of limits)
 * GET /api/guardrails/alerts
 */
router.get('/alerts', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const alerts = await guardrailsService.checkSpendingAgainstLimit(userId);
    res.json(alerts);
  } catch (error) {
    console.error('Error checking spending alerts:', error);
    res.status(500).json({ error: 'Failed to check spending alerts' });
  }
});

/**
 * Get weekly reflection with AI suggestions
 * GET /api/guardrails/reflection
 */
router.get('/reflection', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Determine the week to generate reflection for
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    
    // Get spending summary for the week
    const summary = await guardrailsService.getSpendingSummary(userId, {
      start: weekStart,
      end: weekEnd
    });
    
    // Get existing reflection or create new one
    const existingReflections = await guardrailsService.getWeeklyReflections(userId, 1);
    
    // If we have a recent reflection for this week already, return it
    if (
      existingReflections.length > 0 && 
      format(new Date(existingReflections[0].weekStartDate), 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd') &&
      format(new Date(existingReflections[0].weekEndDate), 'yyyy-MM-dd') === format(weekEnd, 'yyyy-MM-dd')
    ) {
      return res.json(existingReflections[0]);
    }
    
    // Generate AI suggestion based on spending data
    const overBudgetCategories = summary.categories.filter(c => c.status === 'over');
    const warningCategories = summary.categories.filter(c => c.status === 'warning');
    
    let overallStatus = 'good';
    if (overBudgetCategories.length > 0) {
      overallStatus = 'over_budget';
    } else if (warningCategories.length > 0) {
      overallStatus = 'warning';
    }
    
    // Format data for AI prompt
    const categoryData = summary.categories.map(c => 
      `${c.category}: Spent $${c.spent.toFixed(2)}${c.limit ? ` of $${c.limit.toFixed(2)} limit (${c.percentage.toFixed(0)}%)` : ''}`
    ).join('\n');
    
    // Generate AI suggestion
    const prompt = `
User's weekly spending summary (${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}):
${categoryData}

Overall status: ${
  overallStatus === 'good' ? 'Within budget across all categories' :
  overallStatus === 'warning' ? 'Approaching limit in some categories' :
  'Over budget in some categories'
}

Provide practical, encouraging financial advice for this user based on their spending patterns. Include:
1. A brief analysis of their spending behavior
2. One or two specific actionable tips to improve in the coming week
3. A positive note about any categories where they're doing well

Keep the tone helpful, not judgmental. Limit to 3-4 sentences total.
`;

    let aiSuggestion = "Review your spending in categories close to or over budget, and consider adjusting your limits or spending habits. Focus on categories where you're within budget and apply those successful strategies to other areas.";
    
    // Only call OpenAI if the API key is available and client is initialized
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 150,
          temperature: 0.7,
        });
        
        aiSuggestion = response.choices[0].message.content || aiSuggestion;
      } catch (aiError) {
        console.error('Error generating AI suggestion:', aiError);
        // Fall back to default suggestion
      }
    }
    
    // Create the reflection
    const reflection = await guardrailsService.createWeeklyReflection(userId, {
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      overallStatus,
      categorySummary: summary.categories,
      aiSuggestion
    });
    
    res.json(reflection);
  } catch (error) {
    console.error('Error generating weekly reflection:', error);
    res.status(500).json({ error: 'Failed to generate weekly reflection' });
  }
});

/**
 * Get past weekly reflections
 * GET /api/guardrails/reflections/history
 */
router.get('/reflections/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
    
    const reflections = await guardrailsService.getWeeklyReflections(userId, limit);
    res.json(reflections);
  } catch (error) {
    console.error('Error getting reflection history:', error);
    res.status(500).json({ error: 'Failed to get reflection history' });
  }
});

export default router;