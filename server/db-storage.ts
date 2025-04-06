import { 
  InsertIncome, InsertUser, Income, User, InsertGoal, Goal, 
  incomes, users, goals, bankConnections, bankAccounts, bankTransactions,
  InsertBankConnection, BankConnection, InsertBankAccount, BankAccount,
  InsertBankTransaction, BankTransaction, InsertExpense, Expense, expenses,
  InsertBalance, Balance, balances, UserProfile, InsertUserProfile, userProfiles,
  Reminder, InsertReminder, reminders, WidgetSettings, InsertWidgetSettings, widgetSettings,
  Notification, InsertNotification, notifications,
  SpendingPersonalityQuestion, InsertSpendingPersonalityQuestion, spendingPersonalityQuestions,
  SpendingPersonalityResult, InsertSpendingPersonalityResult, spendingPersonalityResults,
  Budget, InsertBudget, budgets, 
  ProfessionalService, InsertProfessionalService, professionalServices
} from '@shared/schema';
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
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result.length > 0 ? result[0] : undefined;
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
  
  async updateUserLastLogin(id: number): Promise<User | undefined> {
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
  
  async verifyUser(id: number): Promise<User | undefined> {
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
  
  async setPasswordReset(id: number, token: string, expires: Date): Promise<User | undefined> {
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
  
  async resetPassword(id: number, newPassword: string): Promise<User | undefined> {
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
  
  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
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
  async updateUserSubscription(userId: number, tier: string, active: boolean, startDate?: Date, endDate?: Date): Promise<User | undefined> {
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
  
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
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
  
  async updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined> {
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
  
  async updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
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
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
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
  
  async updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
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
  
  async deleteUserProfile(userId: number): Promise<boolean> {
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
  
  async markProfileCompleted(userId: number): Promise<User | undefined> {
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

  // Bank connection methods
  async getBankConnections(userId: number): Promise<BankConnection[]> {
    try {
      return await db
        .select()
        .from(bankConnections)
        .where(eq(bankConnections.userId, userId))
        .orderBy(desc(bankConnections.lastUpdated));
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
          lastUpdated: new Date()
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
      const result = await db
        .update(bankConnections)
        .set({
          ...connection,
          lastUpdated: new Date()
        })
        .where(eq(bankConnections.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
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
  async getBankAccounts(connectionId: number): Promise<BankAccount[]> {
    try {
      return await db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.connectionId, connectionId));
    } catch (error) {
      console.error('Error getting bank accounts:', error);
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
          lastUpdated: new Date()
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating bank account:', error);
      throw error;
    }
  }

  async updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    try {
      const result = await db
        .update(bankAccounts)
        .set({
          ...account,
          lastUpdated: new Date()
        })
        .where(eq(bankAccounts.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating bank account:', error);
      return undefined;
    }
  }

  async deleteBankAccount(id: number): Promise<boolean> {
    try {
      // Delete all associated transactions first
      const transactions = await this.getBankTransactions(id);
      for (const transaction of transactions) {
        await this.deleteBankTransaction(transaction.id);
      }
      
      const result = await db
        .delete(bankAccounts)
        .where(eq(bankAccounts.id, id))
        .returning({ id: bankAccounts.id });
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting bank account:', error);
      return false;
    }
  }

  // Bank transaction methods
  async getBankTransactions(accountId: number): Promise<BankTransaction[]> {
    try {
      return await db
        .select()
        .from(bankTransactions)
        .where(eq(bankTransactions.accountId, accountId))
        .orderBy(desc(bankTransactions.date));
    } catch (error) {
      console.error('Error getting bank transactions:', error);
      return [];
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
      const result = await db
        .insert(bankTransactions)
        .values(transaction)
        .returning();
      return result[0];
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

  async getExpensesByCategory(category: string): Promise<Expense[]> {
    try {
      return await db
        .select()
        .from(expenses)
        .where(eq(expenses.category, category))
        .orderBy(desc(expenses.date));
    } catch (error) {
      console.error('Error getting expenses by category:', error);
      return [];
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
          createdAt: new Date(),
          updatedAt: new Date()
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
          updatedAt: new Date()
        })
        .where(eq(budgets.id, id))
        .returning();
      
      return updatedBudget;
    } catch (error) {
      console.error('Error updating budget:', error);
      return undefined;
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
}

// Create and export a singleton instance
export const dbStorage = new DbStorage();