import { InsertIncome, InsertUser, Income, User, InsertGoal, Goal, incomes, users, goals } from '@shared/schema';
import { IStorage } from './storage';
import { db, pool } from './db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export class DbStorage implements IStorage {
  constructor() {
    this.setupInitialData();
  }

  private async setupInitialData() {
    try {
      // Check if users table has data
      const userResult = await pool.query('SELECT COUNT(*) FROM users');
      const userCount = parseInt(userResult.rows[0].count);
      
      if (userCount === 0) {
        // Add demo user
        await this.createUser({
          username: 'demo',
          password: 'password123'
        });

        // Add sample incomes if no incomes exist
        const incomeResult = await pool.query('SELECT COUNT(*) FROM incomes');
        const incomeCount = parseInt(incomeResult.rows[0].count);
        
        if (incomeCount === 0) {
          const sampleIncomes = [
            {
              description: 'Emergency lockout - Downtown',
              amount: "150.00",
              date: new Date('2023-05-18'),
              source: 'Manual',
              category: 'emergency',
              userId: 1
            },
            {
              description: 'Car key replacement',
              amount: "185.00", 
              date: new Date('2023-05-16'),
              source: 'Bank',
              category: 'service',
              userId: 1
            },
            {
              description: 'Commercial lock installation',
              amount: "450.00",
              date: new Date('2023-05-15'),
              source: 'Manual',
              category: 'installation',
              userId: 1
            }
          ];

          for (const income of sampleIncomes) {
            await this.createIncome(income);
          }
        }
        
        // Add sample goals if no goals exist
        try {
          const goalResult = await pool.query('SELECT COUNT(*) FROM goals');
          const goalCount = parseInt(goalResult.rows[0].count);
          
          if (goalCount === 0) {
            const sampleGoals = [
              {
                name: 'Emergency Fund',
                targetAmount: "5000.00",
                currentAmount: "1200.00",
                type: 'savings',
                deadline: new Date('2023-12-31'),
                isCompleted: false,
                startDate: new Date('2023-01-01'),
                userId: 1,
                description: 'Build an emergency fund for unexpected expenses'
              },
              {
                name: 'Retirement Investment',
                targetAmount: "15000.00",
                currentAmount: "3000.00",
                type: 'investments',
                deadline: new Date('2023-12-31'),
                isCompleted: false,
                startDate: new Date('2023-01-01'),
                userId: 1,
                description: 'Yearly retirement investment contribution'
              },
              {
                name: 'Monthly Income Target',
                targetAmount: "10000.00",
                currentAmount: "6350.00",
                type: 'income',
                deadline: new Date('2023-06-30'),
                isCompleted: false,
                startDate: new Date('2023-06-01'),
                userId: 1,
                description: 'Target monthly income for June'
              }
            ];

            for (const goal of sampleGoals) {
              await this.createGoal(goal);
            }
          }
        } catch (error) {
          console.error('Error setting up sample goals:', error);
          // It's possible the goals table doesn't exist yet on first run
          // so we'll just log the error and continue
        }
      }
    } catch (error) {
      console.error('Error setting up initial data:', error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(user).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Income methods
  async getIncomes(): Promise<Income[]> {
    try {
      return await db.select().from(incomes).orderBy(desc(incomes.date));
    } catch (error) {
      console.error('Error getting incomes:', error);
      return [];
    }
  }

  async getIncomeById(id: number): Promise<Income | undefined> {
    try {
      const result = await db.select().from(incomes).where(eq(incomes.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting income by id:', error);
      return undefined;
    }
  }

  async createIncome(income: InsertIncome): Promise<Income> {
    try {
      const result = await db.insert(incomes).values(income).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating income:', error);
      throw error;
    }
  }

  async updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined> {
    try {
      const result = await db
        .update(incomes)
        .set(income)
        .where(eq(incomes.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating income:', error);
      return undefined;
    }
  }

  async deleteIncome(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(incomes)
        .where(eq(incomes.id, id))
        .returning({ id: incomes.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting income:', error);
      return false;
    }
  }

  async getIncomesByUserId(userId: number): Promise<Income[]> {
    try {
      return await db
        .select()
        .from(incomes)
        .where(eq(incomes.userId, userId))
        .orderBy(desc(incomes.date));
    } catch (error) {
      console.error('Error getting incomes by user id:', error);
      return [];
    }
  }

  async getIncomesByMonth(year: number, month: number): Promise<Income[]> {
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // Last day of the month
      
      return await db
        .select()
        .from(incomes)
        .where(
          and(
            gte(incomes.date, startDate),
            lte(incomes.date, endDate)
          )
        )
        .orderBy(desc(incomes.date));
    } catch (error) {
      console.error('Error getting incomes by month:', error);
      return [];
    }
  }
  
  // Goal methods
  async getGoals(): Promise<Goal[]> {
    try {
      return await db.select().from(goals).orderBy(desc(goals.startDate));
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  }

  async getGoalById(id: number): Promise<Goal | undefined> {
    try {
      const result = await db.select().from(goals).where(eq(goals.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting goal by id:', error);
      return undefined;
    }
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    try {
      const result = await db.insert(goals).values(goal).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    try {
      const result = await db
        .update(goals)
        .set(goal)
        .where(eq(goals.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating goal:', error);
      return undefined;
    }
  }

  async deleteGoal(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(goals)
        .where(eq(goals.id, id))
        .returning({ id: goals.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }

  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    try {
      return await db
        .select()
        .from(goals)
        .where(eq(goals.userId, userId))
        .orderBy(desc(goals.startDate));
    } catch (error) {
      console.error('Error getting goals by user id:', error);
      return [];
    }
  }

  async getGoalsByType(type: string): Promise<Goal[]> {
    try {
      return await db
        .select()
        .from(goals)
        .where(eq(goals.type, type))
        .orderBy(desc(goals.startDate));
    } catch (error) {
      console.error('Error getting goals by type:', error);
      return [];
    }
  }

  async updateGoalProgress(id: number, amount: number): Promise<Goal | undefined> {
    try {
      // First get the current goal
      const currentGoal = await this.getGoalById(id);
      if (!currentGoal) return undefined;
      
      // Calculate the new amount
      const currentAmount = typeof currentGoal.currentAmount === 'string' 
        ? parseFloat(currentGoal.currentAmount) 
        : currentGoal.currentAmount;
      
      const newAmount = currentAmount + amount;
      
      // Check if the goal is now completed
      const targetAmount = typeof currentGoal.targetAmount === 'string' 
        ? parseFloat(currentGoal.targetAmount) 
        : currentGoal.targetAmount;
      
      const isCompleted = newAmount >= targetAmount;
      
      // Update the goal
      return await this.updateGoal(id, {
        currentAmount: newAmount.toString(),
        isCompleted
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return undefined;
    }
  }
}

// Create and export a singleton instance
export const dbStorage = new DbStorage();