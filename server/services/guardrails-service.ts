import { db } from '../db';
import { spendingLimits, spendingLogs, spendingReflections, type SpendingLimit, type SpendingLog, type SpendingReflection } from '@shared/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

/**
 * GuardrailsService - Manages spending limits, logs, and alerts for the Stackr Guardrails feature
 */
export class GuardrailsService {
  /**
   * Set or update a spending limit for a specific category
   */
  async setSpendingLimit(userId: string, categoryData: { 
    category: string;
    limitAmount: number; 
    cycle: 'weekly' | 'monthly';
    isActive?: boolean;
  }): Promise<SpendingLimit> {
    // Check if there's an existing limit for this user and category
    const existingLimit = await db.select()
      .from(spendingLimits)
      .where(
        and(
          eq(spendingLimits.userId, userId),
          eq(spendingLimits.category, categoryData.category)
        )
      )
      .limit(1);
    
    if (existingLimit.length > 0) {
      // Update existing record
      const [updated] = await db.update(spendingLimits)
        .set({
          limitAmount: categoryData.limitAmount,
          cycle: categoryData.cycle,
          updatedAt: new Date(),
          isActive: categoryData.isActive ?? true,
        })
        .where(eq(spendingLimits.id, existingLimit[0].id))
        .returning();
      
      return updated;
    } else {
      // Create new record
      const [newLimit] = await db.insert(spendingLimits)
        .values({
          userId,
          category: categoryData.category,
          limitAmount: categoryData.limitAmount,
          cycle: categoryData.cycle,
          isActive: categoryData.isActive ?? true,
        })
        .returning();
      
      return newLimit;
    }
  }

  /**
   * Get all spending limits for a user
   */
  async getSpendingLimits(userId: string): Promise<SpendingLimit[]> {
    return db.select()
      .from(spendingLimits)
      .where(eq(spendingLimits.userId, userId))
      .orderBy(spendingLimits.category);
  }

  /**
   * Log a new spending transaction
   */
  async logSpending(userId: string, logData: { 
    category: string;
    amountSpent: number;
    description?: string;
    source?: string;
    timestamp?: Date;
  }): Promise<SpendingLog> {
    const [log] = await db.insert(spendingLogs)
      .values({
        userId,
        category: logData.category,
        amountSpent: logData.amountSpent,
        description: logData.description,
        source: logData.source || 'manual',
        timestamp: logData.timestamp || new Date(),
      })
      .returning();
    
    // Check against limits after logging
    await this.checkSpendingAgainstLimit(userId);
    
    return log;
  }

  /**
   * Get spending summary for a specific time period
   */
  async getSpendingSummary(userId: string, period: { 
    start: Date; 
    end: Date;
  }): Promise<{ 
    categories: {
      category: string;
      spent: number;
      limit: number | null;
      percentage: number;
      status: 'safe' | 'warning' | 'over';
    }[];
    totalSpent: number;
    totalLimit: number | null;
    startDate: Date;
    endDate: Date;
  }> {
    // Get all spending for the period
    const logs = await db.select()
      .from(spendingLogs)
      .where(
        and(
          eq(spendingLogs.userId, userId),
          gte(spendingLogs.timestamp, period.start),
          lte(spendingLogs.timestamp, period.end)
        )
      );
    
    // Get all spending limits
    const limits = await this.getSpendingLimits(userId);
    
    // Aggregate spending by category
    const categorySpending: Record<string, number> = {};
    for (const log of logs) {
      if (!categorySpending[log.category]) {
        categorySpending[log.category] = 0;
      }
      categorySpending[log.category] += Number(log.amountSpent);
    }
    
    // Create summary with limits and status
    const categories = Object.keys(categorySpending).map(category => {
      const spent = categorySpending[category];
      const limitObj = limits.find(l => l.category === category && l.isActive);
      const limit = limitObj ? Number(limitObj.limitAmount) : null;
      const percentage = limit ? (spent / limit) * 100 : 0;
      
      let status: 'safe' | 'warning' | 'over' = 'safe';
      if (limit) {
        if (percentage >= 100) {
          status = 'over';
        } else if (percentage >= 80) {
          status = 'warning';
        }
      }
      
      return {
        category,
        spent,
        limit,
        percentage,
        status
      };
    });
    
    const totalSpent = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
    const totalLimit = limits
      .filter(l => l.isActive)
      .reduce((sum, limit) => sum + Number(limit.limitAmount), 0) || null;
    
    return {
      categories,
      totalSpent,
      totalLimit,
      startDate: period.start,
      endDate: period.end
    };
  }

  /**
   * Check spending against limits and identify any categories over threshold
   */
  async checkSpendingAgainstLimit(userId: string): Promise<{
    hasWarnings: boolean;
    hasOverages: boolean;
    alerts: {
      category: string;
      spent: number;
      limit: number;
      percentage: number;
      status: 'warning' | 'over';
    }[];
  }> {
    const now = new Date();
    
    // Get active limits
    const limits = await db.select()
      .from(spendingLimits)
      .where(
        and(
          eq(spendingLimits.userId, userId),
          eq(spendingLimits.isActive, true)
        )
      );
    
    if (limits.length === 0) {
      return { hasWarnings: false, hasOverages: false, alerts: [] };
    }
    
    const alerts = [];
    
    // Check each limit
    for (const limit of limits) {
      // Determine period start based on cycle
      let periodStart: Date;
      if (limit.cycle === 'weekly') {
        // Start of current week (Sunday)
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - day);
        periodStart.setHours(0, 0, 0, 0);
      } else {
        // Start of current month
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      // Get spending for this category in the current period
      const logs = await db.select()
        .from(spendingLogs)
        .where(
          and(
            eq(spendingLogs.userId, userId),
            eq(spendingLogs.category, limit.category),
            gte(spendingLogs.timestamp, periodStart),
            lte(spendingLogs.timestamp, now)
          )
        );
      
      // Calculate total spent
      const spent = logs.reduce((total, log) => total + Number(log.amountSpent), 0);
      const limitAmount = Number(limit.limitAmount);
      const percentage = (spent / limitAmount) * 100;
      
      // Check if over thresholds
      if (percentage >= 80) {
        const status = percentage >= 100 ? 'over' : 'warning';
        alerts.push({
          category: limit.category,
          spent,
          limit: limitAmount,
          percentage,
          status
        });
      }
    }
    
    return {
      hasWarnings: alerts.some(alert => alert.status === 'warning'),
      hasOverages: alerts.some(alert => alert.status === 'over'),
      alerts
    };
  }

  /**
   * Create or update weekly spending reflection with AI suggestions
   */
  async createWeeklyReflection(userId: string, data: {
    weekStartDate: Date;
    weekEndDate: Date;
    overallStatus: string;
    categorySummary: any;
    aiSuggestion: string;
  }): Promise<SpendingReflection> {
    // Check if reflection already exists for this week
    const existingReflection = await db.select()
      .from(spendingReflections)
      .where(
        and(
          eq(spendingReflections.userId, userId),
          eq(spendingReflections.weekStartDate, data.weekStartDate),
          eq(spendingReflections.weekEndDate, data.weekEndDate)
        )
      )
      .limit(1);
    
    if (existingReflection.length > 0) {
      // Update existing reflection
      const [updated] = await db.update(spendingReflections)
        .set({
          overallStatus: data.overallStatus,
          categorySummary: data.categorySummary,
          aiSuggestion: data.aiSuggestion,
        })
        .where(eq(spendingReflections.id, existingReflection[0].id))
        .returning();
      
      return updated;
    } else {
      // Create new reflection
      const [newReflection] = await db.insert(spendingReflections)
        .values({
          userId,
          weekStartDate: data.weekStartDate,
          weekEndDate: data.weekEndDate,
          overallStatus: data.overallStatus,
          categorySummary: data.categorySummary,
          aiSuggestion: data.aiSuggestion,
        })
        .returning();
      
      return newReflection;
    }
  }

  /**
   * Get weekly reflections for a user
   */
  async getWeeklyReflections(userId: string, limit: number = 4): Promise<SpendingReflection[]> {
    return db.select()
      .from(spendingReflections)
      .where(eq(spendingReflections.userId, userId))
      .orderBy(desc(spendingReflections.weekEndDate))
      .limit(limit);
  }
}

// Create singleton instance
export const guardrailsService = new GuardrailsService();