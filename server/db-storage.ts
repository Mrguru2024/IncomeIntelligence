import { InsertIncome, InsertUser, Income, User, incomes, users } from '@shared/schema';
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
              userId: 1
            },
            {
              description: 'Car key replacement',
              amount: "185.00", 
              date: new Date('2023-05-16'),
              source: 'Bank',
              userId: 1
            },
            {
              description: 'Commercial lock installation',
              amount: "450.00",
              date: new Date('2023-05-15'),
              source: 'Manual',
              userId: 1
            }
          ];

          for (const income of sampleIncomes) {
            await this.createIncome(income);
          }
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
}

// Create and export a singleton instance
export const dbStorage = new DbStorage();