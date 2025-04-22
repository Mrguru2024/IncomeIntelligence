import { 
  InsertIncome, InsertUser, Income, User, InsertGoal, Goal, 
  incomes, users, goals, bankAccounts, bankTransactions,
  InsertBankConnection, BankConnection, InsertBankAccount, BankAccount,
  InsertBankTransaction, BankTransaction, InsertExpense, Expense, expenses,
  InsertBalance, Balance, balances, UserProfile, InsertUserProfile, userProfiles,
  Reminder, InsertReminder, reminders, WidgetSettings, InsertWidgetSettings, widgetSettings,
  Notification, InsertNotification, notifications,
  SpendingPersonalityQuestion, InsertSpendingPersonalityQuestion, spendingPersonalityQuestions,
  SpendingPersonalityResult, InsertSpendingPersonalityResult, spendingPersonalityResults,
  Budget, InsertBudget, budgets, 
  ProfessionalService, InsertProfessionalService, professionalServices,
  StackrGig, InsertStackrGig, stackrGigs
} from '@shared/schema';
import { IStorage } from './storage';
import { db, pool } from './db';
import { eq, and, gte, lte, desc, or } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const bankConnections = pgTable('bank_connections', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  institutionId: text('institution_id').notNull(),
  institutionName: text('institution_name').notNull(),
  accessToken: text('access_token').notNull(),
  itemId: text('item_id').notNull(),
  status: text('status').notNull(),
  lastUpdated: timestamp('last_updated').defaultNow(),
  metadata: jsonb('metadata')
});

export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(identifier: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  getUserByStripeSubscriptionId(subscriptionId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserLastLogin(id: string): Promise<User | undefined>;
  verifyUser(id: string): Promise<User | undefined>;
  setPasswordReset(id: string, token: string, expires: Date): Promise<User | undefined>;
  resetPassword(id: string, newPassword: string): Promise<User | undefined>;
  updateUserSubscription(userId: string, tier: string, active: boolean, startDate?: Date, endDate?: Date): Promise<User | undefined>;
  getUserSubscription(userId: string): Promise<{ status: string, plan: string } | null>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<User | undefined>;
  updateStripeSubscriptionId(userId: string, subscriptionId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: string, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined>;
  
  // User profile methods
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  
  // Bank connection methods
  getBankConnections(userId: string | number): Promise<BankConnection[]>;
  getBankConnectionById(id: number): Promise<BankConnection | undefined>;
  createBankConnection(connection: InsertBankConnection): Promise<BankConnection>;
  updateBankConnection(id: number, connection: Partial<InsertBankConnection>): Promise<BankConnection | undefined>;
  deleteBankConnection(id: number): Promise<boolean>;
  
  // Bank account methods
  getBankAccountsByConnectionId(connectionId: number): Promise<BankAccount[]>;
  getBankAccountById(id: number): Promise<BankAccount | undefined>;
  deleteBankAccount(id: number): Promise<boolean>;
  
  // Bank transaction methods
  getBankTransactions(userId: string, limit?: number, offset?: number): Promise<BankTransaction[]>;
  getBankTransactionById(id: number): Promise<BankTransaction | undefined>;
  
  // Expense methods
  getExpenseById(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  getExpenseStats(userId: string): Promise<any>;
  getExpenseDistribution(userId: string, period?: string): Promise<any>;
  
  // Balance methods
  createBalance(balance: InsertBalance): Promise<Balance>;
  updateBalance(id: number, balance: Partial<InsertBalance>): Promise<Balance | undefined>;
  
  // Reminder methods
  getReminderById(id: number): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  
  // Point transaction methods
  createPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<Notification | undefined>;
  
  // Budget methods
  getBudget(userId: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(userId: string, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  
  // Affiliate Program methods
  getAffiliatePrograms(): Promise<AffiliateProgram[]>;
  getAffiliateProgramById(id: number): Promise<AffiliateProgram | undefined>;
  getAffiliateProgramsByCategory(category: string): Promise<AffiliateProgram[]>;
  createAffiliateProgram(program: InsertAffiliateProgram): Promise<AffiliateProgram>;
  updateAffiliateProgram(id: number, program: Partial<InsertAffiliateProgram>): Promise<AffiliateProgram | undefined>;
  deleteAffiliateProgram(id: number): Promise<boolean>;
  
  // User Affiliate methods
  getUserAffiliatePrograms(userId: string): Promise<UserAffiliate[]>;
  getUserAffiliateById(id: number): Promise<UserAffiliate | undefined>;
  joinAffiliateProgram(userId: string, programId: number): Promise<UserAffiliate>;
  leaveAffiliateProgram(userId: string, programId: number): Promise<boolean>;
}

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
          password: 'password123',
          email: 'demo@stackr.finance',
          role: 'user',
          accountStatus: 'active',
          verified: true
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
  async getUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      // Use pool directly for manual queries
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE id = $1 LIMIT 1',
        [id]
      );
      
      if (rows.length === 0) return undefined;
      
      // Add missing fields that might be expected by the app
      const user = rows[0] as User;
      if (user && !('onboardingCompleted' in user)) {
        (user as any).onboardingCompleted = false;
      }
      
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      // Use pool directly for manual queries
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE username = $1 LIMIT 1',
        [username]
      );
      
      if (rows.length === 0) return undefined;
      
      // Add missing fields that might be expected by the app
      const user = rows[0] as User;
      if (user && !('onboardingCompleted' in user)) {
        (user as any).onboardingCompleted = false;
      }
      
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Use pool directly for manual queries
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        [email]
      );
      
      if (rows.length === 0) return undefined;
      
      // Add missing fields that might be expected by the app
      const user = rows[0] as User;
      if (user && !('onboardingCompleted' in user)) {
        (user as any).onboardingCompleted = false;
      }
      
      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.verificationToken, token));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting user by verification token:', error);
      return undefined;
    }
  }
  
  async getUserByResetToken(token: string): Promise<User | undefined> {
    try {
      const now = new Date();
      const result = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.resetPasswordToken, token),
            gte(users.resetPasswordExpires, now)
          )
        );
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting user by reset token:', error);
      return undefined;
    }
  }
  
  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.stripeCustomerId, customerId));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting user by Stripe customer ID:', error);
      return undefined;
    }
  }
  
  async getUserByStripeSubscriptionId(subscriptionId: string): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.stripeSubscriptionId, subscriptionId));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting user by Stripe subscription ID:', error);
      return undefined;
    }
  }
  
  async updateUserLastLogin(id: string): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating user last login:', error);
      return undefined;
    }
  }
  
  async verifyUser(id: string): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({
          verified: true,
          verificationToken: null,
          accountStatus: 'active'
        })
        .where(eq(users.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error verifying user:', error);
      return undefined;
    }
  }
  
  async setPasswordReset(id: string, token: string, expires: Date): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({
          resetPasswordToken: token,
          resetPasswordExpires: expires
        })
        .where(eq(users.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error setting password reset:', error);
      return undefined;
    }
  }
  
  async resetPassword(id: string, newPassword: string): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({
          password: newPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null
        })
        .where(eq(users.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error resetting password:', error);
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
  
  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set(user)
        .where(eq(users.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }
  
  // Subscription methods
  async updateUserSubscription(userId: string, tier: string, active: boolean, startDate?: Date, endDate?: Date): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({
          subscriptionTier: tier,
          subscriptionActive: active,
          subscriptionStartDate: startDate || null,
          subscriptionEndDate: endDate || null
        })
        .where(eq(users.id, userId))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating user subscription:', error);
      return undefined;
    }
  }
  
  async updateStripeCustomerId(userId: string, customerId: string): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating Stripe customer ID:', error);
      return undefined;
    }
  }
  
  async updateStripeSubscriptionId(userId: string, subscriptionId: string): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({ stripeSubscriptionId: subscriptionId })
        .where(eq(users.id, userId))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating Stripe subscription ID:', error);
      return undefined;
    }
  }
  
  async updateUserStripeInfo(userId: string, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({
          stripeCustomerId: stripeInfo.customerId,
          stripeSubscriptionId: stripeInfo.subscriptionId
        })
        .where(eq(users.id, userId))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating user Stripe info:', error);
      return undefined;
    }
  }
  
  // User Profile methods
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    try {
      const result = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId));
        
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return undefined;
    }
  }
  
  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    try {
      const result = await db
        .insert(userProfiles)
        .values({
          ...profile,
          updatedAt: new Date()
        })
        .returning();
        
      // Create default widget settings for the user
      await this.createWidgetSettings({
        userId: profile.userId,
        enabled: profile.widgetEnabled || false,
        showBalance: true,
        showIncomeGoal: true,
        showNextReminder: true,
        position: "bottom-right",
        size: "medium",
        theme: "auto"
      });
      
      return result[0];
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
  
  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    try {
      const existingProfile = await this.getUserProfile(userId);
      if (!existingProfile) return undefined;
      
      const result = await db
        .update(userProfiles)
        .set({
          ...profile,
          updatedAt: new Date()
        })
        .where(eq(userProfiles.userId, userId))
        .returning();
        
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return undefined;
    }
  }
  
  async deleteUserProfile(userId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .returning({ id: userProfiles.id });
        
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }
  }
  
  async markProfileCompleted(userId: string): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({ profileCompleted: true })
        .where(eq(users.id, userId))
        .returning();
        
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error marking profile completed:', error);
      return undefined;
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

  async getIncomesByUserId(userId: string): Promise<Income[]> {
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

  async getGoalsByUserId(userId: string): Promise<Goal[]> {
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

  // Bank connection methods
  async getBankConnections(userId: string): Promise<BankConnection[]> {
    try {
      const result = await db.select().from(bankConnections).where(eq(bankConnections.userId, userId));
      return result;
    } catch (error) {
      console.error('Error getting bank connections:', error);
      return [];
    }
  }

  async getBankConnectionById(id: number): Promise<BankConnection | undefined> {
    try {
      const result = await db
        .select()
        .from(bankConnections)
        .where(eq(bankConnections.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting bank connection by id:', error);
      return undefined;
    }
  }

  async createBankConnection(connection: InsertBankConnection): Promise<BankConnection> {
    try {
      const result = await db
        .insert(bankConnections)
        .values({
          ...connection,
          userId: connection.userId.toString(),
          createdAt: new Date()
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating bank connection:', error);
      throw error;
    }
  }

  async updateBankConnection(id: number, connection: Partial<InsertBankConnection>): Promise<BankConnection | undefined> {
    try {
      const [updatedConnection] = await db
        .update(bankConnections)
        .set({
          ...connection,
          userId: connection.userId?.toString(),
          lastUpdated: new Date()
        })
        .where(eq(bankConnections.id, id))
        .returning();
      
      if (!updatedConnection) return undefined;
      
      return {
        ...updatedConnection,
        userId: parseInt(updatedConnection.userId),
        lastUpdated: updatedConnection.lastUpdated || new Date()
      };
    } catch (error) {
      console.error('Error updating bank connection:', error);
      return undefined;
    }
  }

  async deleteBankConnection(id: number): Promise<boolean> {
    try {
      // Delete all associated accounts first (which will cascade delete transactions)
      const accounts = await this.getBankAccounts(id);
      for (const account of accounts) {
        await this.deleteBankAccount(account.id);
      }
      
      const result = await db
        .delete(bankConnections)
        .where(eq(bankConnections.id, id))
        .returning({ id: bankConnections.id });
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting bank connection:', error);
      return false;
    }
  }

  // Bank account methods
  async getBankAccountsByConnectionId(connectionId: number): Promise<BankAccount[]> {
    try {
      return await db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.connectionId, connectionId));
    } catch (error) {
      console.error('Error getting bank accounts by connection id:', error);
      return [];
    }
  }

  async getBankAccountById(id: number): Promise<BankAccount | undefined> {
    try {
      const result = await db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting bank account by id:', error);
      return undefined;
    }
  }

  async getBankAccountByAccountId(accountId: string): Promise<BankAccount | undefined> {
    try {
      const result = await db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.accountId, accountId));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting bank account by account id:', error);
      return undefined;
    }
  }

  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    try {
      const result = await db
        .insert(bankAccounts)
        .values({
          ...account,
          createdAt: new Date()
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating bank account:', error);
      throw error;
    }
  }

  async updateBankAccount(id: number, account: Partial<BankAccount>): Promise<void> {
    try {
      await db
        .update(bankAccounts)
        .set(account)
        .where(eq(bankAccounts.id, id));
    } catch (error) {
      console.error('Error updating bank account:', error);
      throw error;
    }
  }

  async deleteBankAccount(id: number): Promise<void> {
    try {
      await db
        .delete(bankAccounts)
        .where(eq(bankAccounts.id, id));
    } catch (error) {
      console.error('Error deleting bank account:', error);
      throw error;
    }
  }

  // Bank transaction methods
  async getBankTransactions(accountId: number): Promise<BankTransaction[]> {
    try {
      const results = await db
        .select()
        .from(bankTransactions)
        .where(eq(bankTransactions.accountId, accountId));
      
      return results.map(transaction => ({
        ...transaction,
        date: new Date(transaction.date)
      }));
    } catch (error) {
      console.error('Error fetching bank transactions:', error);
      throw error;
    }
  }

  async getBankTransactionById(id: number): Promise<BankTransaction | undefined> {
    try {
      const result = await db
        .select()
        .from(bankTransactions)
        .where(eq(bankTransactions.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting bank transaction by id:', error);
      return undefined;
    }
  }

  async getBankTransactionByTransactionId(transactionId: string): Promise<BankTransaction | undefined> {
    try {
      const result = await db
        .select()
        .from(bankTransactions)
        .where(eq(bankTransactions.transactionId, transactionId));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting bank transaction by transaction id:', error);
      return undefined;
    }
  }

  async createBankTransaction(transaction: InsertBankTransaction): Promise<BankTransaction> {
    try {
      const [newTransaction] = await db
        .insert(bankTransactions)
        .values({
          ...transaction,
          date: transaction.date
        })
        .returning();
      
      return {
        ...newTransaction,
        date: new Date(newTransaction.date)
      };
    } catch (error) {
      console.error('Error creating bank transaction:', error);
      throw error;
    }
  }

  async updateBankTransaction(id: number, transaction: Partial<InsertBankTransaction>): Promise<BankTransaction | undefined> {
    try {
      const result = await db
        .update(bankTransactions)
        .set(transaction)
        .where(eq(bankTransactions.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating bank transaction:', error);
      return undefined;
    }
  }

  async deleteBankTransaction(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(bankTransactions)
        .where(eq(bankTransactions.id, id))
        .returning({ id: bankTransactions.id });
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting bank transaction:', error);
      return false;
    }
  }

  async importBankTransactionAsIncome(transactionId: number): Promise<Income | undefined> {
    try {
      // Get the transaction
      const transaction = await this.getBankTransactionById(transactionId);
      if (!transaction) return undefined;

      // Skip if already imported or negative amount (expense)
      if (transaction.importedAsIncome || parseFloat(transaction.amount) <= 0) {
        return undefined;
      }

      // Create income from transaction
      const account = await this.getBankAccountById(transaction.accountId);
      if (!account) return undefined;

      const connection = await this.getBankConnectionById(account.connectionId);
      if (!connection) return undefined;

      // Create income record
      // Convert negative amount from Plaid to a positive amount for our income tracking
      const parsedAmount = Math.abs(parseFloat(transaction.amount));
      
      const incomeData: InsertIncome = {
        description: transaction.name,
        amount: parsedAmount.toString(),
        date: transaction.date,
        source: 'Bank',
        category: transaction.category || 'other',
        userId: connection.userId,
        notes: `Imported from ${connection.institutionName} - ${account.accountName}`
      };

      const income = await this.createIncome(incomeData);

      // Mark transaction as imported
      await this.updateBankTransaction(transaction.id, {
        importedAsIncome: true
      });

      return income;
    } catch (error) {
      console.error('Error importing transaction as income:', error);
      return undefined;
    }
  }
  
  // Expense methods
  async getExpenses(): Promise<Expense[]> {
    try {
      return await db.select().from(expenses).orderBy(desc(expenses.date));
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    try {
      const result = await db.select().from(expenses).where(eq(expenses.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting expense by id:', error);
      return undefined;
    }
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    try {
      const result = await db.insert(expenses).values(expense).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    try {
      const result = await db
        .update(expenses)
        .set(expense)
        .where(eq(expenses.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating expense:', error);
      return undefined;
    }
  }

  async deleteExpense(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(expenses)
        .where(eq(expenses.id, id))
        .returning({ id: expenses.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  }

  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    try {
      return await db
        .select()
        .from(expenses)
        .where(eq(expenses.userId, userId))
        .orderBy(desc(expenses.date));
    } catch (error) {
      console.error('Error getting expenses by user id:', error);
      return [];
    }
  }

  async getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // Last day of the month
      
      return await db
        .select()
        .from(expenses)
        .where(
          and(
            gte(expenses.date, startDate),
            lte(expenses.date, endDate)
          )
        )
        .orderBy(desc(expenses.date));
    } catch (error) {
      console.error('Error getting expenses by month:', error);
      return [];
    }
  }

  async getExpensesByCategory(userId: number, category: string): Promise<Expense[]> {
    try {
      return await db
        .select()
        .from(expenses)
        .where(
          and(
            eq(expenses.userId, userId),
            eq(expenses.category, category)
          )
        )
        .orderBy(desc(expenses.date));
    } catch (error) {
      console.error('Error getting expenses by category:', error);
      throw error;
    }
  }

  async syncOfflineExpenses(offlineExpenses: InsertExpense[]): Promise<Expense[]> {
    try {
      const syncedExpenses: Expense[] = [];
      
      // Process each offline expense
      for (const expense of offlineExpenses) {
        // Check if this offline expense already exists
        if (expense.offlineId) {
          const existingExpense = await db
            .select()
            .from(expenses)
            .where(eq(expenses.offlineId, expense.offlineId));
          
          // If it exists, skip it
          if (existingExpense.length > 0) {
            syncedExpenses.push(existingExpense[0]);
            continue;
          }
        }
        
        // Create new expense record
        const newExpense = await this.createExpense(expense);
        syncedExpenses.push(newExpense);
      }
      
      return syncedExpenses;
    } catch (error) {
      console.error('Error syncing offline expenses:', error);
      return [];
    }
  }
  
  // Balance methods
  async getBalance(userId: number, year: number, month: number): Promise<Balance | undefined> {
    try {
      const result = await db
        .select()
        .from(balances)
        .where(
          and(
            eq(balances.userId, userId),
            eq(balances.year, year),
            eq(balances.month, month)
          )
        );
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting balance:', error);
      return undefined;
    }
  }

  async getAllBalances(userId: number): Promise<Balance[]> {
    try {
      return await db
        .select()
        .from(balances)
        .where(eq(balances.userId, userId))
        .orderBy(desc(balances.year), desc(balances.month));
    } catch (error) {
      console.error('Error getting all balances:', error);
      return [];
    }
  }

  async createBalance(balance: InsertBalance): Promise<Balance> {
    try {
      const result = await db
        .insert(balances)
        .values({
          ...balance,
          lastUpdated: new Date()
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating balance:', error);
      throw error;
    }
  }

  async updateBalance(id: number, balance: Partial<InsertBalance>): Promise<Balance | undefined> {
    try {
      const result = await db
        .update(balances)
        .set({
          ...balance,
          lastUpdated: new Date()
        })
        .where(eq(balances.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating balance:', error);
      return undefined;
    }
  }

  async calculateCurrentBalance(userId: number, year: number, month: number): Promise<number> {
    try {
      // Get the balance record for the previous month
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevBalance = await this.getBalance(userId, prevYear, prevMonth);
      
      // Start with the previous balance or 0 if none exists
      let balance = 0;
      if (prevBalance) {
        balance = parseFloat(prevBalance.currentBalance.toString());
      }
      
      // Get all income for the month
      const incomes = await this.getIncomesByMonth(year, month);
      const incomeTotal = incomes.reduce((sum, income) => 
        sum + parseFloat(income.amount.toString()), 0);
      
      // Get all expenses for the month
      const expenses = await this.getExpensesByMonth(year, month);
      const expenseTotal = expenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount.toString()), 0);
      
      // Calculate the current balance
      return balance + incomeTotal - expenseTotal;
    } catch (error) {
      console.error('Error calculating current balance:', error);
      return 0;
    }
  }

  async updateBalanceAfterExpense(userId: number, expenseAmount: number): Promise<Balance | undefined> {
    try {
      // Get the current month and year
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      
      // Get the current balance
      let balance = await this.getBalance(userId, year, month);
      
      if (!balance) {
        // If no balance exists for current month, calculate it and create a new record
        const currentBalance = await this.calculateCurrentBalance(userId, year, month);
        
        balance = await this.createBalance({
          userId,
          beginningBalance: currentBalance.toString(),
          currentBalance: (currentBalance - expenseAmount).toString(),
          year,
          month
        });
      } else {
        // Update existing balance
        const newBalance = parseFloat(balance.currentBalance.toString()) - expenseAmount;
        
        balance = await this.updateBalance(balance.id, {
          currentBalance: newBalance.toString()
        });
      }
      
      return balance;
    } catch (error) {
      console.error('Error updating balance after expense:', error);
      return undefined;
    }
  }

  async updateBalanceAfterIncome(userId: number, incomeAmount: number): Promise<Balance | undefined> {
    try {
      // Get the current month and year
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      
      // Get the current balance
      let balance = await this.getBalance(userId, year, month);
      
      if (!balance) {
        // If no balance exists for current month, calculate it and create a new record
        const currentBalance = await this.calculateCurrentBalance(userId, year, month);
        
        balance = await this.createBalance({
          userId,
          beginningBalance: currentBalance.toString(),
          currentBalance: (currentBalance + incomeAmount).toString(),
          year,
          month
        });
      } else {
        // Update existing balance
        const newBalance = parseFloat(balance.currentBalance.toString()) + incomeAmount;
        
        balance = await this.updateBalance(balance.id, {
          currentBalance: newBalance.toString()
        });
      }
      
      return balance;
    } catch (error) {
      console.error('Error updating balance after income:', error);
      return undefined;
    }
  }
  
  // Reminder methods
  async getReminders(userId: number): Promise<Reminder[]> {
    try {
      return await db
        .select()
        .from(reminders)
        .where(eq(reminders.userId, userId))
        .orderBy(reminders.nextRemindAt);
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }
  
  async getReminderById(id: number): Promise<Reminder | undefined> {
    try {
      const result = await db
        .select()
        .from(reminders)
        .where(eq(reminders.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting reminder by id:', error);
      return undefined;
    }
  }
  
  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    try {
      const now = new Date();
      const result = await db
        .insert(reminders)
        .values({
          ...reminder,
          createdAt: now,
          updatedAt: now
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }
  
  async updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder | undefined> {
    try {
      const result = await db
        .update(reminders)
        .set({
          ...reminder,
          updatedAt: new Date()
        })
        .where(eq(reminders.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating reminder:', error);
      return undefined;
    }
  }
  
  async deleteReminder(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(reminders)
        .where(eq(reminders.id, id))
        .returning({ id: reminders.id });
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return false;
    }
  }
  
  async getActiveReminders(userId: number): Promise<Reminder[]> {
    try {
      return await db
        .select()
        .from(reminders)
        .where(
          and(
            eq(reminders.userId, userId),
            eq(reminders.isActive, true)
          )
        )
        .orderBy(reminders.nextRemindAt);
    } catch (error) {
      console.error('Error getting active reminders:', error);
      return [];
    }
  }
  
  async getDueReminders(userId: number): Promise<Reminder[]> {
    try {
      const now = new Date();
      return await db
        .select()
        .from(reminders)
        .where(
          and(
            eq(reminders.userId, userId),
            eq(reminders.isActive, true),
            lte(reminders.nextRemindAt, now)
          )
        )
        .orderBy(reminders.nextRemindAt);
    } catch (error) {
      console.error('Error getting due reminders:', error);
      return [];
    }
  }
  
  async markReminderSent(id: number): Promise<Reminder | undefined> {
    try {
      const reminder = await this.getReminderById(id);
      if (!reminder) return undefined;
      
      // Calculate next reminder date based on frequency
      const nextRemindAt = new Date(reminder.nextRemindAt);
      
      switch (reminder.frequency) {
        case 'daily':
          nextRemindAt.setDate(nextRemindAt.getDate() + 1);
          break;
        case 'weekly':
          nextRemindAt.setDate(nextRemindAt.getDate() + 7);
          break;
        case 'biweekly':
          nextRemindAt.setDate(nextRemindAt.getDate() + 14);
          break;
        case 'monthly':
          nextRemindAt.setMonth(nextRemindAt.getMonth() + 1);
          break;
        case 'quarterly':
          nextRemindAt.setMonth(nextRemindAt.getMonth() + 3);
          break;
        case 'yearly':
          nextRemindAt.setFullYear(nextRemindAt.getFullYear() + 1);
          break;
        // For one-time reminders, we'll mark them as inactive
        case 'once':
          return await db
            .update(reminders)
            .set({
              lastSentAt: new Date(),
              isActive: false,
              updatedAt: new Date()
            })
            .where(eq(reminders.id, id))
            .returning()
            .then(result => result[0]);
      }
      
      const result = await db
        .update(reminders)
        .set({
          lastSentAt: new Date(),
          nextRemindAt: nextRemindAt,
          updatedAt: new Date()
        })
        .where(eq(reminders.id, id))
        .returning();
        
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error marking reminder as sent:', error);
      return undefined;
    }
  }
  
  async updateReminderNextDate(id: number, nextDate: Date): Promise<Reminder | undefined> {
    try {
      const result = await db
        .update(reminders)
        .set({
          nextRemindAt: nextDate,
          updatedAt: new Date()
        })
        .where(eq(reminders.id, id))
        .returning();
        
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating reminder next date:', error);
      return undefined;
    }
  }
  
  // Widget methods
  async getWidgetSettings(userId: number): Promise<WidgetSettings | undefined> {
    try {
      const result = await db
        .select()
        .from(widgetSettings)
        .where(eq(widgetSettings.userId, userId));
        
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting widget settings:', error);
      return undefined;
    }
  }
  
  async createWidgetSettings(settings: InsertWidgetSettings): Promise<WidgetSettings> {
    try {
      // Check if settings already exist for this user
      const existingSettings = await this.getWidgetSettings(settings.userId);
      if (existingSettings) {
        // Update instead of create if settings already exist
        const updated = await this.updateWidgetSettings(settings.userId, settings);
        if (!updated) throw new Error("Failed to update existing widget settings");
        return updated;
      }
      
      const result = await db
        .insert(widgetSettings)
        .values({
          ...settings,
          updatedAt: new Date()
        })
        .returning();
        
      return result[0];
    } catch (error) {
      console.error('Error creating widget settings:', error);
      throw error;
    }
  }
  
  async updateWidgetSettings(userId: number, settings: Partial<InsertWidgetSettings>): Promise<WidgetSettings | undefined> {
    try {
      const result = await db
        .update(widgetSettings)
        .set({
          ...settings,
          updatedAt: new Date()
        })
        .where(eq(widgetSettings.userId, userId))
        .returning();
        
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating widget settings:', error);
      return undefined;
    }
  }
  
  async toggleWidgetEnabled(userId: number, enabled: boolean): Promise<WidgetSettings | undefined> {
    try {
      const existingSettings = await this.getWidgetSettings(userId);
      
      if (!existingSettings) {
        // Create default settings if they don't exist
        return this.createWidgetSettings({
          userId,
          enabled,
          showBalance: true,
          showIncomeGoal: true,
          showNextReminder: true,
          position: "bottom-right",
          size: "medium",
          theme: "auto"
        });
      }
      
      const result = await db
        .update(widgetSettings)
        .set({
          enabled,
          updatedAt: new Date()
        })
        .where(eq(widgetSettings.userId, userId))
        .returning();
        
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error toggling widget enabled state:', error);
      return undefined;
    }
  }
  
  // Notification methods
  async getNotifications(userId: number): Promise<Notification[]> {
    try {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async getNotificationById(id: number): Promise<Notification | undefined> {
    try {
      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting notification by id:', error);
      return undefined;
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    try {
      const result = await db
        .insert(notifications)
        .values({
          ...notification,
          createdAt: new Date(),
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async updateNotification(id: number, notification: Partial<InsertNotification>): Promise<Notification | undefined> {
    try {
      const result = await db
        .update(notifications)
        .set(notification)
        .where(eq(notifications.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating notification:', error);
      return undefined;
    }
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    try {
      const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return undefined;
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    try {
      const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userId))
        .returning({ id: notifications.id });
      return result.length > 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  async deleteNotification(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(notifications)
        .where(eq(notifications.id, id))
        .returning({ id: notifications.id });
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    try {
      return await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        )
        .orderBy(desc(notifications.createdAt));
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      return [];
    }
  }

  // Spending Personality Quiz Methods
  async getSpendingPersonalityQuestions(): Promise<SpendingPersonalityQuestion[]> {
    try {
      return await db
        .select()
        .from(spendingPersonalityQuestions);
    } catch (error) {
      console.error('Error getting spending personality questions:', error);
      return [];
    }
  }
  
  async getActiveSpendingPersonalityQuestions(): Promise<SpendingPersonalityQuestion[]> {
    try {
      return await db
        .select()
        .from(spendingPersonalityQuestions)
        .where(eq(spendingPersonalityQuestions.active, true));
    } catch (error) {
      console.error('Error getting active spending personality questions:', error);
      return [];
    }
  }
  
  async getSpendingPersonalityQuestionById(id: number): Promise<SpendingPersonalityQuestion | undefined> {
    try {
      const result = await db
        .select()
        .from(spendingPersonalityQuestions)
        .where(eq(spendingPersonalityQuestions.id, id));
        
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting spending personality question by id:', error);
      return undefined;
    }
  }
  
  async createSpendingPersonalityQuestion(question: InsertSpendingPersonalityQuestion): Promise<SpendingPersonalityQuestion> {
    try {
      const result = await db
        .insert(spendingPersonalityQuestions)
        .values({
          ...question,
          createdAt: new Date()
        })
        .returning();
        
      return result[0];
    } catch (error) {
      console.error('Error creating spending personality question:', error);
      throw error;
    }
  }
  
  async updateSpendingPersonalityQuestion(id: number, question: Partial<InsertSpendingPersonalityQuestion>): Promise<SpendingPersonalityQuestion | undefined> {
    try {
      const result = await db
        .update(spendingPersonalityQuestions)
        .set(question)
        .where(eq(spendingPersonalityQuestions.id, id))
        .returning();
        
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating spending personality question:', error);
      return undefined;
    }
  }
  
  async deleteSpendingPersonalityQuestion(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(spendingPersonalityQuestions)
        .where(eq(spendingPersonalityQuestions.id, id))
        .returning({ id: spendingPersonalityQuestions.id });
        
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting spending personality question:', error);
      return false;
    }
  }
  
  // Spending Personality Result methods
  async getSpendingPersonalityResults(userId: number): Promise<SpendingPersonalityResult[]> {
    try {
      return await db
        .select()
        .from(spendingPersonalityResults)
        .where(eq(spendingPersonalityResults.userId, userId))
        .orderBy(desc(spendingPersonalityResults.takenAt));
    } catch (error) {
      console.error('Error getting spending personality results:', error);
      return [];
    }
  }
  
  async getSpendingPersonalityResultById(id: number): Promise<SpendingPersonalityResult | undefined> {
    try {
      const result = await db
        .select()
        .from(spendingPersonalityResults)
        .where(eq(spendingPersonalityResults.id, id));
        
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting spending personality result by id:', error);
      return undefined;
    }
  }
  
  async createSpendingPersonalityResult(result: InsertSpendingPersonalityResult): Promise<SpendingPersonalityResult> {
    try {
      const dbResult = await db
        .insert(spendingPersonalityResults)
        .values({
          ...result,
          takenAt: new Date()
        })
        .returning();
        
      return dbResult[0];
    } catch (error) {
      console.error('Error creating spending personality result:', error);
      throw error;
    }
  }
  
  async getLatestSpendingPersonalityResult(userId: number): Promise<SpendingPersonalityResult | undefined> {
    try {
      const results = await db
        .select()
        .from(spendingPersonalityResults)
        .where(eq(spendingPersonalityResults.userId, userId))
        .orderBy(desc(spendingPersonalityResults.takenAt))
        .limit(1);
        
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      console.error('Error getting latest spending personality result:', error);
      return undefined;
    }
  }

  // Budget methods
  async getBudgets(): Promise<Budget[]> {
    try {
      return await db.select().from(budgets);
    } catch (error) {
      console.error('Error getting budgets:', error);
      return [];
    }
  }

  async getBudgetById(id: number): Promise<Budget | undefined> {
    try {
      const result = await db
        .select()
        .from(budgets)
        .where(eq(budgets.id, id));
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting budget by id:', error);
      return undefined;
    }
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    try {
      const [newBudget] = await db
        .insert(budgets)
        .values({
          ...budget,
          needsCategories: budget.needsCategories || [],
          wantsCategories: budget.wantsCategories || [],
          savingsCategories: budget.savingsCategories || []
        })
        .returning();
      return newBudget;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    try {
      const [updatedBudget] = await db
        .update(budgets)
        .set({
          ...budget,
          needsCategories: budget.needsCategories || undefined,
          wantsCategories: budget.wantsCategories || undefined,
          savingsCategories: budget.savingsCategories || undefined
        })
        .where(eq(budgets.id, id))
        .returning();
      return updatedBudget;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  async deleteBudget(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(budgets)
        .where(eq(budgets.id, id));
      
      return true;
    } catch (error) {
      console.error('Error deleting budget:', error);
      return false;
    }
  }

  async getBudgetsByUserId(userId: number): Promise<Budget[]> {
    try {
      return await db
        .select()
        .from(budgets)
        .where(eq(budgets.userId, userId));
    } catch (error) {
      console.error('Error getting budgets by user id:', error);
      return [];
    }
  }

  async getBudgetsByYearMonth(userId: number, year: number, month: number): Promise<Budget[]> {
    try {
      return await db
        .select()
        .from(budgets)
        .where(
          and(
            eq(budgets.userId, userId),
            eq(budgets.year, year),
            eq(budgets.month, month)
          )
        );
    } catch (error) {
      console.error('Error getting budgets by year and month:', error);
      return [];
    }
  }
  
  // Professional Services methods
  async getProfessionalServices(): Promise<ProfessionalService[]> {
    try {
      return await db.select().from(professionalServices);
    } catch (error) {
      console.error('Error getting professional services:', error);
      return [];
    }
  }

  async getProfessionalServiceById(id: number): Promise<ProfessionalService | undefined> {
    try {
      const result = await db
        .select()
        .from(professionalServices)
        .where(eq(professionalServices.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting professional service by id:', error);
      return undefined;
    }
  }

  async createProfessionalService(service: InsertProfessionalService): Promise<ProfessionalService> {
    try {
      const now = new Date();
      const serviceToInsert = {
        ...service,
        createdAt: now,
        updatedAt: now,
        ratings: "0",
        reviewCount: 0,
        isActive: service.isActive !== undefined ? service.isActive : true
      };
      
      const result = await db.insert(professionalServices).values(serviceToInsert).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating professional service:', error);
      throw error;
    }
  }

  async updateProfessionalService(id: number, service: Partial<InsertProfessionalService>): Promise<ProfessionalService | undefined> {
    try {
      const result = await db
        .update(professionalServices)
        .set({
          ...service,
          updatedAt: new Date()
        })
        .where(eq(professionalServices.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating professional service:', error);
      return undefined;
    }
  }

  async deleteProfessionalService(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(professionalServices)
        .where(eq(professionalServices.id, id))
        .returning({ id: professionalServices.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting professional service:', error);
      return false;
    }
  }

  async getProfessionalServicesByUserId(userId: number): Promise<ProfessionalService[]> {
    try {
      return await db
        .select()
        .from(professionalServices)
        .where(eq(professionalServices.userId, userId));
    } catch (error) {
      console.error('Error getting professional services by user id:', error);
      return [];
    }
  }

  async getProfessionalServicesByCategory(category: string): Promise<ProfessionalService[]> {
    try {
      return await db
        .select()
        .from(professionalServices)
        .where(eq(professionalServices.category, category));
    } catch (error) {
      console.error('Error getting professional services by category:', error);
      return [];
    }
  }

  async toggleProfessionalServiceActive(id: number, isActive: boolean): Promise<ProfessionalService | undefined> {
    try {
      const result = await db
        .update(professionalServices)
        .set({
          isActive,
          updatedAt: new Date()
        })
        .where(eq(professionalServices.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error toggling professional service active status:', error);
      return undefined;
    }
  }

  // Stackr Gigs methods
  async getStackrGigs(): Promise<StackrGig[]> {
    try {
      return await db.select().from(stackrGigs).orderBy(desc(stackrGigs.createdAt));
    } catch (error) {
      console.error('Error getting Stackr gigs:', error);
      return [];
    }
  }
  
  async getStackrGigById(id: number): Promise<StackrGig | undefined> {
    try {
      const result = await db.select().from(stackrGigs).where(eq(stackrGigs.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting Stackr gig by ID:', error);
      return undefined;
    }
  }
  
  async createStackrGig(gig: InsertStackrGig): Promise<StackrGig> {
    try {
      const now = new Date();
      const result = await db.insert(stackrGigs).values({
        ...gig,
        createdAt: now,
        updatedAt: now
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating Stackr gig:', error);
      throw error;
    }
  }
  
  async updateStackrGig(id: number, gig: Partial<InsertStackrGig>): Promise<StackrGig | undefined> {
    try {
      const result = await db
        .update(stackrGigs)
        .set({
          ...gig,
          updatedAt: new Date()
        })
        .where(eq(stackrGigs.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating Stackr gig:', error);
      return undefined;
    }
  }
  
  async deleteStackrGig(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(stackrGigs)
        .where(eq(stackrGigs.id, id))
        .returning({ id: stackrGigs.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting Stackr gig:', error);
      return false;
    }
  }
  
  async getStackrGigsByUserId(userId: number): Promise<StackrGig[]> {
    try {
      return await db
        .select()
        .from(stackrGigs)
        .where(
          or(
            eq(stackrGigs.requesterUserId, userId),
            eq(stackrGigs.assignedUserId, userId)
          )
        )
        .orderBy(desc(stackrGigs.createdAt));
    } catch (error) {
      console.error('Error getting user stackr gigs:', error);
      throw error;
    }
  }
  
  async getStackrGigsByStatus(status: string): Promise<StackrGig[]> {
    try {
      return await db
        .select()
        .from(stackrGigs)
        .where(eq(stackrGigs.status, status))
        .orderBy(desc(stackrGigs.createdAt));
    } catch (error) {
      console.error('Error getting Stackr gigs by status:', error);
      return [];
    }
  }
  
  async applyForGig(gigId: number, userId: number): Promise<StackrGig | undefined> {
    try {
      const gig = await this.getStackrGigById(gigId);
      if (!gig) return undefined;
      
      if (gig.status !== "open") {
        throw new Error("This gig is no longer open for applications");
      }
      
      const result = await db
        .update(stackrGigs)
        .set({
          status: "assigned",
          assignedUserId: userId,
          updatedAt: new Date()
        })
        .where(eq(stackrGigs.id, gigId))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error applying for Stackr gig:', error);
      throw error;
    }
  }

  // Get all bank accounts for a user across all their connections
  async getAllUserBankAccounts(userId: number): Promise<BankAccount[]> {
    try {
      // First get all connections for the user
      const connections = await this.getBankConnections(userId.toString());
      
      // Get accounts for each connection
      const allAccounts: BankAccount[] = [];
      for (const connection of connections) {
        const accounts = await this.getBankAccountsByConnectionId(connection.id);
        allAccounts.push(...accounts);
      }
      
      return allAccounts;
    } catch (error) {
      console.error('Error getting all user bank accounts:', error);
      return [];
    }
  }
}

// Create and export a singleton instance
export const dbStorage = new DbStorage();