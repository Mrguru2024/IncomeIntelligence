import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import fs from "fs";
import path from "path";
import { pool } from "./db";
import { 
  insertIncomeSchema, 
  insertGoalSchema, 
  insertBankConnectionSchema, 
  insertExpenseSchema,
  insertBalanceSchema,
  insertReminderSchema,
  insertWidgetSettingsSchema,
  insertUserProfileSchema,
  insertSpendingPersonalityQuestionSchema,
  insertNotificationSchema,
  insertBudgetSchema,
  insertStackrGigSchema,
  insertAffiliateProgramSchema,
  insertUserAffiliateSchema,
  insertDigitalProductSchema,
  insertMoneyChallengeSchema,
  insertUserChallengeSchema,
  insertInvestmentStrategySchema,
  insertUsedGearListingSchema,
  insertInvoiceSchema,
  insertCreativeGrantSchema,
  insertGrantApplicationSchema,
  insertReferralSchema,
  insertProfessionalServiceSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { plaidService } from "./plaid-service";
import { 
  getFinancialAdvice, 
  suggestFinancialGoals, 
  analyzeExpenses, 
  getAISettings,
  updateAISettings,
  AIProvider,
  type FinancialAdviceRequest 
} from "./ai-service";
import { notificationService } from "./notification-service";
import { requireAuth, checkUserMatch } from "./middleware/authMiddleware";
import { requireAdmin } from "./middleware/adminMiddleware";
import { requireProSubscription } from "./middleware/proSubscriptionMiddleware";
import { spendingPersonalityService } from "./spending-personality-service";
import { registerPerplexityRoutes } from "./routes/perplexity-routes";
import Stripe from "stripe";
import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Stripe if secret key is available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16" as any, // Type casting to avoid LSP issues
  });
  console.log('Stripe initialized successfully');
} else {
  if (process.env.NODE_ENV === 'development') {
    console.log('STRIPE_SECRET_KEY not found. Stripe functionality will be disabled in development mode.');
  } else {
    console.warn('STRIPE_SECRET_KEY not found. Stripe functionality will be disabled.');
  }
}

// JWT Authentication is now handled by the auth middleware

export async function registerRoutes(app: Express): Promise<Server> {
  // Note: We've removed all static HTML serving routes in favor of the dynamic React application
  // The Vite dev server will handle serving the React application at the root route
  
  // Setup authentication routes
  setupAuth(app);

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  
  // System status check endpoint
  app.get("/api/status", async (req, res) => {
    try {
      // Check database connection
      let dbStatus = 'offline';
      let stripeStatus = 'inactive';
      let authStatus = 'configured';
      
      try {
        // Test database connection with a quick query
        const dbResult = await pool.query('SELECT NOW()');
        dbStatus = dbResult.rows.length > 0 ? 'online' : 'error';
      } catch (dbError) {
        console.error('Database status check error:', dbError);
        dbStatus = 'error';
      }
      
      // Check Stripe initialization
      stripeStatus = stripe ? 'configured' : 'not_configured';
      
      // Return all status information
      res.json({
        status: 'maintenance',
        message: 'System is currently in maintenance mode while Firebase dependencies are being removed.',
        services: {
          api: 'online',
          database: dbStatus,
          stripe: stripeStatus,
          authentication: authStatus
        },
        maintenance: {
          reason: 'Removing Firebase dependencies',
          estimatedCompletionDate: 'April 10, 2025'
        }
      });
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to retrieve system status'
      });
    }
  });

  // User profile and onboarding routes
  app.patch("/api/users/:userId/onboarding", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user is updating their own profile
      if (req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this user's onboarding status" });
      }

      const schema = z.object({
        onboardingCompleted: z.boolean().optional(),
        onboardingStep: z.string().optional(),
      });
      
      const validatedData = schema.parse(req.body);
      const user = await storage.updateUser(userId, validatedData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating user onboarding status:', error);
      res.status(500).json({ message: "Failed to update user onboarding status" });
    }
  });

  // Get user profile
  app.get("/api/users/:userId/profile", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user is requesting their own profile
      if (req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized to view this user profile" });
      }

      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "User profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });

  // Create or update user profile
  app.post("/api/users/:userId/profile", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user is updating their own profile
      if (req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this user profile" });
      }

      const validatedData = insertUserProfileSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if profile already exists
      const existingProfile = await storage.getUserProfile(userId);
      
      let profile;
      if (existingProfile) {
        profile = await storage.updateUserProfile(userId, validatedData);
      } else {
        profile = await storage.createUserProfile(validatedData);
      }
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating/updating user profile:', error);
      res.status(500).json({ message: "Failed to create/update user profile" });
    }
  });
  
  // Get all incomes
  app.get("/api/incomes", async (req, res) => {
    try {
      const incomes = await storage.getIncomes();
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incomes" });
    }
  });

  // Get income by ID
  app.get("/api/incomes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid income ID" });
      }

      const income = await storage.getIncomeById(id);
      if (!income) {
        return res.status(404).json({ message: "Income not found" });
      }

      res.json(income);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch income" });
    }
  });

  // Create new income
  app.post("/api/incomes", async (req, res) => {
    try {
      const validatedData = insertIncomeSchema.parse(req.body);
      
      const income = await storage.createIncome(validatedData);
      res.status(201).json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create income" });
    }
  });

  // Update income
  app.patch("/api/incomes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid income ID" });
      }

      const validatedData = insertIncomeSchema.partial().parse(req.body);
      
      const income = await storage.updateIncome(id, validatedData);
      if (!income) {
        return res.status(404).json({ message: "Income not found" });
      }

      res.json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update income" });
    }
  });

  // Delete income
  app.delete("/api/incomes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid income ID" });
      }

      const success = await storage.deleteIncome(id);
      if (!success) {
        return res.status(404).json({ message: "Income not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete income" });
    }
  });

  // Get incomes by month
  app.get("/api/incomes/month/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month) - 1; // JavaScript months are 0-indexed
      
      if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
        return res.status(400).json({ message: "Invalid year or month" });
      }

      const incomes = await storage.getIncomesByMonth(year, month);
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incomes by month" });
    }
  });
  
  // GOAL ENDPOINTS
  
  // Get all goals
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Get goal by ID
  app.get("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }

      const goal = await storage.getGoalById(id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goal" });
    }
  });

  // Create new goal
  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  // Update goal
  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }

      const validatedData = insertGoalSchema.partial().parse(req.body);
      
      const goal = await storage.updateGoal(id, validatedData);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Delete goal
  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }

      const success = await storage.deleteGoal(id);
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Get goals by user ID
  app.get("/api/users/:userId/goals", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const goals = await storage.getGoalsByUserId(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user goals" });
    }
  });

  // Get goals by type
  app.get("/api/goals/type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const goals = await storage.getGoalsByType(type);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals by type" });
    }
  });
  
  // Update goal progress
  app.patch("/api/goals/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }
      
      const schema = z.object({
        amount: z.number().or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(val => parseFloat(val)))
      });
      
      const validatedData = schema.parse(req.body);
      const amount = typeof validatedData.amount === 'string' 
        ? parseFloat(validatedData.amount) 
        : validatedData.amount;
      
      const goal = await storage.updateGoalProgress(id, amount);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update goal progress" });
    }
  });

  // BANK CONNECTION ENDPOINTS
  
  // Get create link token for Plaid Link
  app.post("/api/plaid/create-link-token", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.number().int().positive()
      });
      
      const { userId } = schema.parse(req.body);
      
      const linkToken = await plaidService.createLinkToken(userId);
      res.json({ linkToken: linkToken });
    } catch (error) {
      console.error('Error creating link token:', error);
      res.status(500).json({ message: "Failed to create link token" });
    }
  });
  
  // Exchange public token for access token
  app.post("/api/plaid/exchange-token", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.number().int().positive(),
        publicToken: z.string(),
        metadata: z.any()
      });
      
      const { userId, publicToken, metadata } = schema.parse(req.body);
      
      const connectionId = await plaidService.exchangePublicToken(userId, publicToken, metadata);
      res.json({ connectionId });
    } catch (error) {
      console.error('Error exchanging token:', error);
      res.status(500).json({ message: "Failed to exchange token" });
    }
  });
  
  // Get user's bank connections
  app.get("/api/bank-connections/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const connections = await storage.getBankConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error('Error getting bank connections:', error);
      res.status(500).json({ message: "Failed to get bank connections" });
    }
  });
  
  // Get bank connection by ID
  app.get("/api/bank-connections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      const connection = await storage.getBankConnectionById(id);
      if (!connection) {
        return res.status(404).json({ message: "Bank connection not found" });
      }
      
      res.json(connection);
    } catch (error) {
      console.error('Error getting bank connection:', error);
      res.status(500).json({ message: "Failed to get bank connection" });
    }
  });
  
  // Sync transactions for a connection
  app.post("/api/bank-connections/:id/sync", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      await plaidService.syncTransactions(id);
      res.json({ success: true, message: "Transactions synced successfully" });
    } catch (error) {
      console.error('Error syncing transactions:', error);
      res.status(500).json({ message: "Failed to sync transactions" });
    }
  });
  
  // Import transactions as income
  app.post("/api/bank-connections/:id/import-income", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      await plaidService.importPositiveTransactionsAsIncome(id);
      res.json({ success: true, message: "Transactions imported as income successfully" });
    } catch (error) {
      console.error('Error importing transactions as income:', error);
      res.status(500).json({ message: "Failed to import transactions as income" });
    }
  });
  
  // Get accounts for a connection
  app.get("/api/bank-connections/:id/accounts", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      const accounts = await storage.getBankAccounts(id);
      res.json(accounts);
    } catch (error) {
      console.error('Error getting bank accounts:', error);
      res.status(500).json({ message: "Failed to get bank accounts" });
    }
  });
  
  // Get transactions for an account
  app.get("/api/bank-accounts/:id/transactions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }
      
      const transactions = await storage.getBankTransactions(id);
      res.json(transactions);
    } catch (error) {
      console.error('Error getting bank transactions:', error);
      res.status(500).json({ message: "Failed to get bank transactions" });
    }
  });
  
  // Disconnect a bank connection
  app.delete("/api/bank-connections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      const success = await storage.deleteBankConnection(id);
      if (!success) {
        return res.status(404).json({ message: "Bank connection not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting bank connection:', error);
      res.status(500).json({ message: "Failed to delete bank connection" });
    }
  });

  // EXPENSE ENDPOINTS
  
  // Get all expenses
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      console.error('Error getting expenses:', error);
      res.status(500).json({ message: "Failed to get expenses" });
    }
  });
  
  // Get expense by ID
  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      
      const expense = await storage.getExpenseById(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      console.error('Error getting expense:', error);
      res.status(500).json({ message: "Failed to get expense" });
    }
  });
  
  // Create new expense
  app.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating expense:', error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });
  
  // Update expense
  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      
      const expense = await storage.updateExpense(id, validatedData);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating expense:', error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });
  
  // Delete expense
  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      
      const success = await storage.deleteExpense(id);
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });
  
  // Get expenses by user ID
  app.get("/api/users/:userId/expenses", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const expenses = await storage.getExpensesByUserId(userId);
      res.json(expenses);
    } catch (error) {
      console.error('Error getting user expenses:', error);
      res.status(500).json({ message: "Failed to get user expenses" });
    }
  });
  
  // Get expenses by month
  app.get("/api/expenses/month/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month) - 1; // JavaScript months are 0-indexed
      
      if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
        return res.status(400).json({ message: "Invalid year or month" });
      }
      
      const expenses = await storage.getExpensesByMonth(year, month);
      res.json(expenses);
    } catch (error) {
      console.error('Error getting expenses by month:', error);
      res.status(500).json({ message: "Failed to get expenses by month" });
    }
  });
  
  // Get expenses by category
  app.get("/api/expenses/category/:categoryId", async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      const expenses = await storage.getExpensesByCategory(categoryId);
      res.json(expenses);
    } catch (error) {
      console.error('Error getting expenses by category:', error);
      res.status(500).json({ message: "Failed to get expenses by category" });
    }
  });
  
  // Sync offline expenses
  app.post("/api/expenses/sync", async (req, res) => {
    try {
      const schema = z.array(insertExpenseSchema);
      const validatedData = schema.parse(req.body);
      
      const syncedExpenses = await storage.syncOfflineExpenses(validatedData);
      res.json(syncedExpenses);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error syncing offline expenses:', error);
      res.status(500).json({ message: "Failed to sync offline expenses" });
    }
  });
  
  // BUDGET ENDPOINTS
  
  // Get all budgets for a user
  app.get("/api/users/:userId/budgets", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user is requesting their own budgets
      if (req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized to view these budgets" });
      }
      
      const budgets = await storage.getBudgetsByUserId(userId);
      res.json(budgets);
    } catch (error) {
      console.error('Error getting user budgets:', error);
      res.status(500).json({ message: "Failed to get user budgets" });
    }
  });
  
  // Get budgets by year and month
  app.get("/api/users/:userId/budgets/:year/:month", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      if (isNaN(userId) || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      // Check if user is requesting their own budgets
      if (req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized to view these budgets" });
      }
      
      const budgets = await storage.getBudgetsByYearMonth(userId, year, month);
      res.json(budgets);
    } catch (error) {
      console.error('Error getting budgets by year/month:', error);
      res.status(500).json({ message: "Failed to get budgets" });
    }
  });
  
  // Create budget
  app.post("/api/budgets", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const validatedData = insertBudgetSchema.parse({
        ...req.body,
        userId
      });
      
      const budget = await storage.createBudget(validatedData);
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating budget:', error);
      res.status(500).json({ message: "Failed to create budget" });
    }
  });
  
  // Update budget
  app.patch("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid budget ID" });
      }
      
      // Fetch the budget to check if the user is authorized to update it
      const existingBudget = await storage.getBudgetById(id);
      if (!existingBudget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      // Check if user is updating their own budget
      if (req.user?.id !== existingBudget.userId) {
        return res.status(403).json({ message: "Unauthorized to update this budget" });
      }
      
      const validatedData = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(id, validatedData);
      
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating budget:', error);
      res.status(500).json({ message: "Failed to update budget" });
    }
  });
  
  // Delete budget
  app.delete("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid budget ID" });
      }
      
      // Fetch the budget to check if the user is authorized to delete it
      const existingBudget = await storage.getBudgetById(id);
      if (!existingBudget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      // Check if user is deleting their own budget
      if (req.user?.id !== existingBudget.userId) {
        return res.status(403).json({ message: "Unauthorized to delete this budget" });
      }
      
      const success = await storage.deleteBudget(id);
      if (!success) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting budget:', error);
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });
  
  // INCOME GENERATION FEATURES
  
  // STACKR GIGS ENDPOINTS
  
  // Get all gigs
  app.get("/api/gigs", requireAuth, async (req, res) => {
    try {
      const gigs = await storage.getStackrGigs();
      res.json(gigs);
    } catch (error) {
      console.error('Error getting gigs:', error);
      res.status(500).json({ message: "Failed to get gigs" });
    }
  });
  
  // Get gig by ID
  app.get("/api/gigs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }
      
      const gig = await storage.getStackrGigById(id);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      res.json(gig);
    } catch (error) {
      console.error('Error getting gig:', error);
      res.status(500).json({ message: "Failed to get gig" });
    }
  });
  
  // Create gig
  app.post("/api/gigs", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const validatedData = insertStackrGigSchema.parse({
        ...req.body,
        createdBy: userId,
        status: req.body.status || 'open'
      });
      
      const gig = await storage.createStackrGig(validatedData);
      res.status(201).json(gig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating gig:', error);
      res.status(500).json({ message: "Failed to create gig" });
    }
  });
  
  // Update gig
  app.patch("/api/gigs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }
      
      // Fetch the gig to check if the user is authorized to update it
      const existingGig = await storage.getStackrGigById(id);
      if (!existingGig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      // Check if user is the creator of the gig
      if (req.user?.id !== existingGig.createdBy) {
        return res.status(403).json({ message: "Unauthorized to update this gig" });
      }
      
      const validatedData = insertStackrGigSchema.partial().parse(req.body);
      const gig = await storage.updateStackrGig(id, validatedData);
      
      res.json(gig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating gig:', error);
      res.status(500).json({ message: "Failed to update gig" });
    }
  });
  
  // Delete gig
  app.delete("/api/gigs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }
      
      // Fetch the gig to check if the user is authorized to delete it
      const existingGig = await storage.getStackrGigById(id);
      if (!existingGig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      // Check if user is the creator of the gig
      if (req.user?.id !== existingGig.createdBy) {
        return res.status(403).json({ message: "Unauthorized to delete this gig" });
      }
      
      const success = await storage.deleteStackrGig(id);
      if (!success) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting gig:', error);
      res.status(500).json({ message: "Failed to delete gig" });
    }
  });
  
  // Apply for gig
  app.post("/api/gigs/:id/apply", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (isNaN(id) || !userId) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      const result = await storage.applyForGig(id, userId, req.body.message);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error applying for gig:', error);
      res.status(500).json({ message: "Failed to apply for gig" });
    }
  });
  
  // AFFILIATE PROGRAM ENDPOINTS
  
  // Get all affiliate programs
  app.get("/api/affiliate-programs", requireAuth, async (req, res) => {
    try {
      const programs = await storage.getAffiliatePrograms();
      res.json(programs);
    } catch (error) {
      console.error('Error getting affiliate programs:', error);
      res.status(500).json({ message: "Failed to get affiliate programs" });
    }
  });
  
  // Get affiliate program by ID
  app.get("/api/affiliate-programs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid program ID" });
      }
      
      const program = await storage.getAffiliateProgramById(id);
      if (!program) {
        return res.status(404).json({ message: "Affiliate program not found" });
      }
      
      res.json(program);
    } catch (error) {
      console.error('Error getting affiliate program:', error);
      res.status(500).json({ message: "Failed to get affiliate program" });
    }
  });
  
  // Create affiliate program (admin only)
  app.post("/api/affiliate-programs", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAffiliateProgramSchema.parse(req.body);
      const program = await storage.createAffiliateProgram(validatedData);
      res.status(201).json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating affiliate program:', error);
      res.status(500).json({ message: "Failed to create affiliate program" });
    }
  });
  
  // Join affiliate program
  app.post("/api/affiliate-programs/:id/join", requireAuth, async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (isNaN(programId) || !userId) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      const result = await storage.joinAffiliateProgram(programId, userId);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error joining affiliate program:', error);
      res.status(500).json({ message: "Failed to join affiliate program" });
    }
  });
  
  // Get user's affiliate links/codes
  app.get("/api/users/:userId/affiliates", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const affiliates = await storage.getUserAffiliates(userId);
      res.json(affiliates);
    } catch (error) {
      console.error('Error getting user affiliates:', error);
      res.status(500).json({ message: "Failed to get user affiliates" });
    }
  });
  
  // Track affiliate click
  app.post("/api/affiliates/:code/track", async (req, res) => {
    try {
      const code = req.params.code;
      await storage.trackAffiliateClick(code);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
      res.status(500).json({ message: "Failed to track affiliate click" });
    }
  });
  
  // Record affiliate conversion
  app.post("/api/affiliates/:code/convert", requireAuth, requireAdmin, async (req, res) => {
    try {
      const code = req.params.code;
      const amount = parseFloat(req.body.amount);
      
      if (isNaN(amount)) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      await storage.recordAffiliateConversion(code, amount);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error recording affiliate conversion:', error);
      res.status(500).json({ message: "Failed to record affiliate conversion" });
    }
  });
  
  // MONEY CHALLENGES ENDPOINTS
  
  // Get all money challenges
  app.get("/api/money-challenges", requireAuth, async (req, res) => {
    try {
      const challenges = await storage.getMoneyChallenges();
      res.json(challenges);
    } catch (error) {
      console.error('Error getting money challenges:', error);
      res.status(500).json({ message: "Failed to get money challenges" });
    }
  });
  
  // Get money challenge by ID
  app.get("/api/money-challenges/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      const challenge = await storage.getMoneyChallenge(id);
      if (!challenge) {
        return res.status(404).json({ message: "Money challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      console.error('Error getting money challenge:', error);
      res.status(500).json({ message: "Failed to get money challenge" });
    }
  });
  
  // Create money challenge (admin only)
  app.post("/api/money-challenges", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertMoneyChallengeSchema.parse(req.body);
      const challenge = await storage.createMoneyChallenge(validatedData);
      res.status(201).json(challenge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating money challenge:', error);
      res.status(500).json({ message: "Failed to create money challenge" });
    }
  });
  
  // Join money challenge
  app.post("/api/money-challenges/:id/join", requireAuth, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (isNaN(challengeId) || !userId) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      const result = await storage.joinMoneyChallenge(challengeId, userId);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error joining money challenge:', error);
      res.status(500).json({ message: "Failed to join money challenge" });
    }
  });
  
  // Update user challenge progress
  app.patch("/api/user-challenges/:id/progress", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (isNaN(id) || !userId) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      const userChallenge = await storage.getUserChallengeById(id);
      if (!userChallenge || userChallenge.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const progress = parseFloat(req.body.progress);
      if (isNaN(progress)) {
        return res.status(400).json({ message: "Invalid progress value" });
      }
      
      const result = await storage.updateUserChallengeProgress(id, progress);
      res.json(result);
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      res.status(500).json({ message: "Failed to update challenge progress" });
    }
  });
  
  // Get user's active challenges
  app.get("/api/users/:userId/challenges", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const challenges = await storage.getUserChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error('Error getting user challenges:', error);
      res.status(500).json({ message: "Failed to get user challenges" });
    }
  });
  
  // DIGITAL PRODUCTS ENDPOINTS
  
  // Get all digital products
  app.get("/api/digital-products", async (req, res) => {
    try {
      const products = await storage.getDigitalProducts();
      res.json(products);
    } catch (error) {
      console.error('Error getting digital products:', error);
      res.status(500).json({ message: "Failed to get digital products" });
    }
  });
  
  // Get digital product by ID
  app.get("/api/digital-products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getDigitalProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Digital product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Error getting digital product:', error);
      res.status(500).json({ message: "Failed to get digital product" });
    }
  });
  
  // Create digital product (admin only)
  app.post("/api/digital-products", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertDigitalProductSchema.parse(req.body);
      const product = await storage.createDigitalProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating digital product:', error);
      res.status(500).json({ message: "Failed to create digital product" });
    }
  });
  
  // Purchase digital product
  app.post("/api/digital-products/:id/purchase", requireAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (isNaN(productId) || !userId) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      const product = await storage.getDigitalProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Digital product not found" });
      }
      
      // Create Stripe checkout session for the product
      if (!stripe) {
        return res.status(500).json({ message: "Payment processing is not available" });
      }
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.title,
                description: product.description
              },
              unit_amount: Math.round(product.price * 100), // convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/purchase-success?product=${productId}`,
        cancel_url: `${req.protocol}://${req.get('host')}/digital-products/${productId}`,
        metadata: {
          productId: productId.toString(),
          userId: userId.toString(),
          productType: 'digital'
        }
      });
      
      res.json({ url: session.url });
    } catch (error) {
      console.error('Error purchasing digital product:', error);
      res.status(500).json({ message: "Failed to process purchase" });
    }
  });
  
  // USED GEAR LISTINGS ENDPOINTS
  
  // Get all used gear listings
  app.get("/api/used-gear", requireAuth, async (req, res) => {
    try {
      const listings = await storage.getUsedGearListings();
      res.json(listings);
    } catch (error) {
      console.error('Error getting used gear listings:', error);
      res.status(500).json({ message: "Failed to get used gear listings" });
    }
  });
  
  // Get used gear listing by ID
  app.get("/api/used-gear/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const listing = await storage.getUsedGearListingById(id);
      if (!listing) {
        return res.status(404).json({ message: "Used gear listing not found" });
      }
      
      res.json(listing);
    } catch (error) {
      console.error('Error getting used gear listing:', error);
      res.status(500).json({ message: "Failed to get used gear listing" });
    }
  });
  
  // Create used gear listing
  app.post("/api/used-gear", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const validatedData = insertUsedGearListingSchema.parse({
        ...req.body,
        sellerId: userId
      });
      
      const listing = await storage.createUsedGearListing(validatedData);
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating used gear listing:', error);
      res.status(500).json({ message: "Failed to create used gear listing" });
    }
  });
  
  // Update used gear listing
  app.patch("/api/used-gear/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      // Fetch the listing to check if the user is authorized to update it
      const existingListing = await storage.getUsedGearListingById(id);
      if (!existingListing) {
        return res.status(404).json({ message: "Used gear listing not found" });
      }
      
      // Check if user is the seller
      if (req.user?.id !== existingListing.sellerId) {
        return res.status(403).json({ message: "Unauthorized to update this listing" });
      }
      
      const validatedData = insertUsedGearListingSchema.partial().parse(req.body);
      const listing = await storage.updateUsedGearListing(id, validatedData);
      
      res.json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating used gear listing:', error);
      res.status(500).json({ message: "Failed to update used gear listing" });
    }
  });
  
  // Delete used gear listing
  app.delete("/api/used-gear/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      // Fetch the listing to check if the user is authorized to delete it
      const existingListing = await storage.getUsedGearListingById(id);
      if (!existingListing) {
        return res.status(404).json({ message: "Used gear listing not found" });
      }
      
      // Check if user is the seller
      if (req.user?.id !== existingListing.sellerId) {
        return res.status(403).json({ message: "Unauthorized to delete this listing" });
      }
      
      const success = await storage.deleteUsedGearListing(id);
      if (!success) {
        return res.status(404).json({ message: "Used gear listing not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting used gear listing:', error);
      res.status(500).json({ message: "Failed to delete used gear listing" });
    }
  });
  
  // INVOICE BUILDER ENDPOINTS
  
  // Get all invoices for a user
  app.get("/api/users/:userId/invoices", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const invoices = await storage.getUserInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error('Error getting user invoices:', error);
      res.status(500).json({ message: "Failed to get user invoices" });
    }
  });
  
  // Get invoice by ID
  app.get("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      const invoice = await storage.getInvoiceById(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Check if user is the creator of the invoice
      if (req.user?.id !== invoice.userId) {
        return res.status(403).json({ message: "Unauthorized to view this invoice" });
      }
      
      res.json(invoice);
    } catch (error) {
      console.error('Error getting invoice:', error);
      res.status(500).json({ message: "Failed to get invoice" });
    }
  });
  
  // Create invoice
  app.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const validatedData = insertInvoiceSchema.parse({
        ...req.body,
        userId
      });
      
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating invoice:', error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });
  
  // Update invoice
  app.patch("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      // Fetch the invoice to check if the user is authorized to update it
      const existingInvoice = await storage.getInvoiceById(id);
      if (!existingInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Check if user is the creator of the invoice
      if (req.user?.id !== existingInvoice.userId) {
        return res.status(403).json({ message: "Unauthorized to update this invoice" });
      }
      
      const validatedData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, validatedData);
      
      res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating invoice:', error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });
  
  // Delete invoice
  app.delete("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      // Fetch the invoice to check if the user is authorized to delete it
      const existingInvoice = await storage.getInvoiceById(id);
      if (!existingInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Check if user is the creator of the invoice
      if (req.user?.id !== existingInvoice.userId) {
        return res.status(403).json({ message: "Unauthorized to delete this invoice" });
      }
      
      const success = await storage.deleteInvoice(id);
      if (!success) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });
  
  // REFERRAL SYSTEM ENDPOINTS
  
  // Generate referral code for user
  app.post("/api/users/:userId/referral-code", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const referral = await storage.generateReferralCode(userId);
      res.status(201).json(referral);
    } catch (error) {
      console.error('Error generating referral code:', error);
      res.status(500).json({ message: "Failed to generate referral code" });
    }
  });
  
  // Apply referral code (for new user registration)
  app.post("/api/referrals/:code/apply", async (req, res) => {
    try {
      const code = req.params.code;
      const userId = parseInt(req.body.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const result = await storage.applyReferralCode(code, userId);
      res.json(result);
    } catch (error) {
      console.error('Error applying referral code:', error);
      res.status(500).json({ message: "Failed to apply referral code" });
    }
  });
  
  // Get user's referrals
  app.get("/api/users/:userId/referrals", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const referrals = await storage.getUserReferrals(userId);
      res.json(referrals);
    } catch (error) {
      console.error('Error getting user referrals:', error);
      res.status(500).json({ message: "Failed to get user referrals" });
    }
  });
  
  // CREATIVE GRANTS PROGRAM ENDPOINTS
  
  // Get all creative grants
  app.get("/api/creative-grants", requireAuth, async (req, res) => {
    try {
      const grants = await storage.getCreativeGrants();
      res.json(grants);
    } catch (error) {
      console.error('Error getting creative grants:', error);
      res.status(500).json({ message: "Failed to get creative grants" });
    }
  });
  
  // Get creative grant by ID
  app.get("/api/creative-grants/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid grant ID" });
      }
      
      const grant = await storage.getCreativeGrantById(id);
      if (!grant) {
        return res.status(404).json({ message: "Creative grant not found" });
      }
      
      res.json(grant);
    } catch (error) {
      console.error('Error getting creative grant:', error);
      res.status(500).json({ message: "Failed to get creative grant" });
    }
  });
  
  // Create creative grant (admin only)
  app.post("/api/creative-grants", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCreativeGrantSchema.parse(req.body);
      const grant = await storage.createCreativeGrant(validatedData);
      res.status(201).json(grant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating creative grant:', error);
      res.status(500).json({ message: "Failed to create creative grant" });
    }
  });
  
  // Apply for creative grant
  app.post("/api/creative-grants/:id/apply", requireAuth, async (req, res) => {
    try {
      const grantId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (isNaN(grantId) || !userId) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      const validatedData = insertGrantApplicationSchema.parse({
        ...req.body,
        grantId,
        userId,
        status: 'pending'
      });
      
      const application = await storage.applyForCreativeGrant(validatedData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error applying for creative grant:', error);
      res.status(500).json({ message: "Failed to apply for creative grant" });
    }
  });
  
  // Get user's grant applications
  app.get("/api/users/:userId/grant-applications", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const applications = await storage.getUserGrantApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error('Error getting user grant applications:', error);
      res.status(500).json({ message: "Failed to get user grant applications" });
    }
  });
  
  // BALANCE ENDPOINTS
  
  // Get balance for user by month and year
  app.get("/api/balances/user/:userId/month/:year/:month", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month) - 1; // JavaScript months are 0-indexed
      
      if (isNaN(userId) || isNaN(year) || isNaN(month) || month < 0 || month > 11) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      const balance = await storage.getBalance(userId, year, month);
      
      if (!balance) {
        // If no balance exists, calculate current balance
        const calculatedBalance = await storage.calculateCurrentBalance(userId, year, month);
        return res.json({ 
          userId,
          year,
          month,
          beginningBalance: calculatedBalance.toString(),
          currentBalance: calculatedBalance.toString(),
          lastUpdated: new Date()
        });
      }
      
      res.json(balance);
    } catch (error) {
      console.error('Error getting user balance:', error);
      res.status(500).json({ message: "Failed to get user balance" });
    }
  });
  
  // Get all balances for user
  app.get("/api/balances/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const balances = await storage.getAllBalances(userId);
      res.json(balances);
    } catch (error) {
      console.error('Error getting user balances:', error);
      res.status(500).json({ message: "Failed to get user balances" });
    }
  });
  
  // Create or update balance
  app.post("/api/balances", async (req, res) => {
    try {
      const validatedData = insertBalanceSchema.parse(req.body);
      
      // Check if balance already exists
      const existingBalance = await storage.getBalance(
        validatedData.userId, 
        validatedData.year, 
        validatedData.month
      );
      
      let balance;
      if (existingBalance) {
        // Update existing balance
        balance = await storage.updateBalance(existingBalance.id, validatedData);
      } else {
        // Create new balance
        balance = await storage.createBalance(validatedData);
      }
      
      res.status(201).json(balance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating/updating balance:', error);
      res.status(500).json({ message: "Failed to create/update balance" });
    }
  });
  
  // AI FINANCIAL ADVICE ENDPOINTS
  
  // Get personalized financial advice - Protected by authentication
  app.post("/api/ai/financial-advice", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        userId: z.number().int().positive(),
        question: z.string().optional(),
        preferredProvider: z.string().optional()
      });
      
      const { userId, question, preferredProvider } = schema.parse(req.body);
      
      // Gather relevant financial data for the user
      const incomeData = await storage.getIncomesByUserId(userId);
      const expenseData = await storage.getExpensesByUserId(userId);
      const goalData = await storage.getGoalsByUserId(userId);
      
      // Get the most recent balance data
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const balanceData = await storage.getBalance(userId, currentYear, currentMonth);
      
      // Get AI advice
      const adviceRequest: FinancialAdviceRequest = {
        userId,
        incomeData,
        expenseData,
        goalData,
        balanceData,
        question,
        preferredProvider: preferredProvider as AIProvider
      };
      
      const advice = await getFinancialAdvice(adviceRequest);
      
      // Direct return of error response if AI service detected an error
      if (advice.error) {
        const statusCode = advice.errorType === "quota_exceeded" || advice.errorType === "rate_limited" ? 429 : 500;
        const message = advice.errorType === "quota_exceeded" 
          ? "AI API quota exceeded. Please update the API key or billing plan."
          : advice.errorType === "rate_limited"
          ? "Too many requests to AI service. Please try again in a few minutes."
          : "Failed to get financial advice";
          
        return res.status(statusCode).json({ ...advice, message });
      }
      
      res.json(advice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error getting financial advice:', error);
      
      // Send more specific error message to the frontend
      if (error instanceof Error) {
        if (error.message.includes("quota exceeded")) {
          return res.status(429).json({ 
            message: "AI API quota exceeded. Please update the API key or billing plan.",
            errorType: "quota_exceeded",
            error: true
          });
        } else if (error.message.includes("rate limit")) {
          return res.status(429).json({ 
            message: "Too many requests to AI service. Please try again in a few minutes.",
            errorType: "rate_limited",
            error: true
          });
        }
      }
      
      res.status(500).json({ 
        message: "Failed to get financial advice", 
        error: true, 
        errorType: "unknown" 
      });
    }
  });
  
  // Suggest AI-generated financial goals - Protected by authentication
  app.post("/api/ai/suggest-goals", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        userId: z.number().int().positive()
      });
      
      const { userId } = schema.parse(req.body);
      
      // Get recent income data
      const incomeData = await storage.getIncomesByUserId(userId);
      
      // Get goal suggestions from AI
      const goalSuggestions = await suggestFinancialGoals(incomeData);
      
      // Direct return of error response if AI service detected an error
      if (goalSuggestions.error) {
        const statusCode = goalSuggestions.errorType === "quota_exceeded" || goalSuggestions.errorType === "rate_limited" ? 429 : 500;
        const message = goalSuggestions.errorType === "quota_exceeded" 
          ? "AI API quota exceeded. Please update the API key or billing plan."
          : goalSuggestions.errorType === "rate_limited"
          ? "Too many requests to AI service. Please try again in a few minutes."
          : "Failed to suggest goals";
          
        return res.status(statusCode).json({ ...goalSuggestions, message });
      }
      
      res.json(goalSuggestions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error suggesting goals:', error);
      res.status(500).json({ 
        message: "Failed to suggest goals", 
        error: true, 
        errorType: "unknown" 
      });
    }
  });
  
  // Analyze expenses and provide optimization suggestions - Protected by authentication
  app.post("/api/ai/analyze-expenses", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        userId: z.number().int().positive(),
        period: z.enum(['week', 'month', 'year']).optional().default('month')
      });
      
      const { userId, period } = schema.parse(req.body);
      
      // Get expense data
      const expenses = await storage.getExpensesByUserId(userId);
      
      // Filter expenses based on period
      const today = new Date();
      let filteredExpenses;
      
      switch (period) {
        case 'week':
          // Get expenses from the last 7 days
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          filteredExpenses = expenses.filter(expense => 
            new Date(expense.date) >= weekAgo && new Date(expense.date) <= today
          );
          break;
        case 'month':
          // Get expenses from the current month
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          filteredExpenses = expenses.filter(expense => 
            new Date(expense.date) >= startOfMonth && new Date(expense.date) <= today
          );
          break;
        case 'year':
          // Get expenses from the current year
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          filteredExpenses = expenses.filter(expense => 
            new Date(expense.date) >= startOfYear && new Date(expense.date) <= today
          );
          break;
      }
      
      // Get expense analysis from AI
      const analysis = await analyzeExpenses(filteredExpenses);
      
      // Direct return of error response if AI service detected an error
      if (analysis.error) {
        const statusCode = analysis.errorType === "quota_exceeded" || analysis.errorType === "rate_limited" ? 429 : 500;
        const message = analysis.errorType === "quota_exceeded" 
          ? "AI API quota exceeded. Please update the API key or billing plan."
          : analysis.errorType === "rate_limited"
          ? "Too many requests to AI service. Please try again in a few minutes."
          : "Failed to analyze expenses";
          
        return res.status(statusCode).json({ ...analysis, message });
      }
      
      res.json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error analyzing expenses:', error);
      res.status(500).json({ 
        message: "Failed to analyze expenses", 
        error: true, 
        errorType: "unknown" 
      });
    }
  });
  
  // Check and record when user has used AI advice - Protected by authentication
  app.post("/api/ai/mark-advice-used", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        userId: z.number().int().positive(),
        adviceType: z.enum(['financial_advice', 'goal_suggestion', 'expense_analysis'])
      });
      
      const { userId, adviceType } = schema.parse(req.body);
      
      // Determine point values (for future implementation of points system)
      let points = 0;
      let reason = '';
      
      switch (adviceType) {
        case 'financial_advice':
          points = 5;
          reason = 'Used AI financial advice';
          break;
        case 'goal_suggestion':
          points = 10;
          reason = 'Created goal from AI suggestion';
          break;
        case 'expense_analysis':
          points = 8;
          reason = 'Reviewed AI expense analysis';
          break;
      }
      
      // Just return success for now until gamification system is fully implemented in db-storage
      res.json({
        success: true,
        pointsAwarded: points,
        reason
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error recording AI advice usage:', error);
      res.status(500).json({ message: "Failed to record AI advice usage" });
    }
  });

  // USER PROFILE ENDPOINTS

  // Get user profile
  app.get("/api/user/profile", requireAuth, async (req, res) => {
    try {
      // For now, hardcode userId as 1 since we don't have authentication yet
      const userId = 1;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const profile = await storage.getUserProfile(userId);
      
      res.json({
        ...user,
        profile: profile || {}
      });
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });

  // Update user profile
  app.patch("/api/user/profile", async (req, res) => {
    try {
      // For now, hardcode userId as 1 since we don't have authentication yet
      const userId = 1;
      
      const validatedData = insertUserProfileSchema.partial().parse(req.body);
      
      let profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        // Create new profile if it doesn't exist
        profile = await storage.createUserProfile({
          userId,
          ...validatedData
        });
      } else {
        // Update existing profile
        profile = await storage.updateUserProfile(profile.id, validatedData);
      }
      
      const user = await storage.getUser(userId);
      
      res.json({
        ...user,
        profile
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // REMINDER ENDPOINTS

  // Get reminders
  app.get("/api/reminders", async (req, res) => {
    try {
      // For now, hardcode userId as 1 since we don't have authentication yet
      const userId = 1;
      
      const reminders = await storage.getReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error('Error getting reminders:', error);
      res.status(500).json({ message: "Failed to get reminders" });
    }
  });

  // Get reminder by ID
  app.get("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reminder ID" });
      }
      
      const reminder = await storage.getReminderById(id);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      console.error('Error getting reminder:', error);
      res.status(500).json({ message: "Failed to get reminder" });
    }
  });

  // Create reminder
  app.post("/api/reminders", async (req, res) => {
    try {
      // For now, hardcode userId as 1 since we don't have authentication yet
      const userId = 1;
      
      const validatedData = insertReminderSchema.parse({
        ...req.body,
        userId
      });
      
      const reminder = await storage.createReminder(validatedData);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating reminder:', error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  // Update reminder
  app.patch("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reminder ID" });
      }
      
      const validatedData = insertReminderSchema.partial().parse(req.body);
      
      const reminder = await storage.updateReminder(id, validatedData);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating reminder:', error);
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  // Delete reminder
  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reminder ID" });
      }
      
      const success = await storage.deleteReminder(id);
      if (!success) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  // Get active reminders
  app.get("/api/reminders/status/active", async (req, res) => {
    try {
      // For now, hardcode userId as 1 since we don't have authentication yet
      const userId = 1;
      
      const reminders = await storage.getActiveReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error('Error getting active reminders:', error);
      res.status(500).json({ message: "Failed to get active reminders" });
    }
  });

  // Get due reminders
  app.get("/api/reminders/status/due", async (req, res) => {
    try {
      // For now, hardcode userId as 1 since we don't have authentication yet
      const userId = 1;
      
      const reminders = await storage.getDueReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error('Error getting due reminders:', error);
      res.status(500).json({ message: "Failed to get due reminders" });
    }
  });

  // Mark reminder as sent
  app.post("/api/reminders/:id/sent", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reminder ID" });
      }
      
      const reminder = await storage.markReminderSent(id);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      console.error('Error marking reminder as sent:', error);
      res.status(500).json({ message: "Failed to mark reminder as sent" });
    }
  });

  // NOTIFICATION ENDPOINTS
  
  // Get user notifications
  app.get("/api/notifications/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });
  
  // Get unread notifications
  app.get("/api/notifications/user/:userId/unread", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const notifications = await storage.getUnreadNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      res.status(500).json({ message: "Failed to get unread notifications" });
    }
  });
  
  // Get notification by ID
  app.get("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const notification = await storage.getNotificationById(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      console.error('Error getting notification:', error);
      res.status(500).json({ message: "Failed to get notification" });
    }
  });
  
  // Create notification
  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      
      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating notification:', error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });
  
  // Send notification with email
  app.post("/api/notifications/send", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.number().int().positive(),
        title: z.string(),
        message: z.string(),
        type: z.enum(['info', 'warning', 'success', 'reminder']),
        sendEmail: z.boolean().optional(),
        sendPush: z.boolean().optional(),
        metadata: z.any().optional()
      });
      
      const notificationData = schema.parse(req.body);
      
      const notification = await notificationService.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error sending notification:', error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });
  
  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const notification = await storage.markNotificationAsRead(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  
  // Mark all notifications as read
  app.patch("/api/notifications/user/:userId/read-all", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const success = await storage.markAllNotificationsAsRead(userId);
      res.json({ success });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  
  // Delete notification
  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const success = await storage.deleteNotification(id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });
  
  // Check for due reminders and send notifications
  app.post("/api/notifications/check-reminders", async (req, res) => {
    try {
      await notificationService.sendReminderNotifications();
      res.json({ success: true, message: "Reminder notifications processed" });
    } catch (error) {
      console.error('Error processing reminder notifications:', error);
      res.status(500).json({ message: "Failed to process reminder notifications" });
    }
  });

  // WIDGET SETTINGS ENDPOINTS

  // Get widget settings
  app.get("/api/user/widget-settings", async (req, res) => {
    try {
      // For now, hardcode userId as 1 since we don't have authentication yet
      const userId = 1;
      
      let settings = await storage.getWidgetSettings(userId);
      
      if (!settings) {
        // Create default settings if they don't exist
        settings = await storage.createWidgetSettings({
          userId,
          enabled: false,
          showBalance: true,
          showIncomeGoal: true,
          showNextReminder: true,
          position: "bottom-right",
          size: "medium",
          theme: "auto"
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error('Error getting widget settings:', error);
      res.status(500).json({ message: "Failed to get widget settings" });
    }
  });

  // Update widget settings
  app.patch("/api/user/widget-settings", async (req, res) => {
    try {
      // For now, hardcode userId as 1 since we don't have authentication yet
      const userId = 1;
      
      const validatedData = insertWidgetSettingsSchema.partial().parse(req.body);
      
      let settings = await storage.getWidgetSettings(userId);
      
      if (!settings) {
        // Create settings if they don't exist
        settings = await storage.createWidgetSettings({
          userId,
          ...validatedData,
          enabled: validatedData.enabled ?? false,
          showBalance: validatedData.showBalance ?? true,
          showIncomeGoal: validatedData.showIncomeGoal ?? true,
          showNextReminder: validatedData.showNextReminder ?? true,
          position: validatedData.position ?? "bottom-right",
          size: validatedData.size ?? "medium",
          theme: validatedData.theme ?? "auto"
        });
      } else {
        // Update existing settings
        settings = await storage.updateWidgetSettings(userId, validatedData);
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating widget settings:', error);
      res.status(500).json({ message: "Failed to update widget settings" });
    }
  });

  // Toggle widget enabled
  app.post("/api/user/widget-settings/toggle", async (req, res) => {
    try {
      // For now, hardcode userId as 1 since we don't have authentication yet
      const userId = 1;
      
      const schema = z.object({
        enabled: z.boolean()
      });
      
      const { enabled } = schema.parse(req.body);
      
      const settings = await storage.toggleWidgetEnabled(userId, enabled);
      if (!settings) {
        return res.status(404).json({ message: "Widget settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error toggling widget:', error);
      res.status(500).json({ message: "Failed to toggle widget" });
    }
  });

  // AI SETTINGS ENDPOINTS
  
  // Get current AI settings
  app.get("/api/ai/settings", (req, res) => {
    try {
      const settings = getAISettings();
      res.json(settings);
    } catch (error) {
      console.error('Error getting AI settings:', error);
      res.status(500).json({ message: "Failed to get AI settings" });
    }
  });
  
  // Update AI settings
  app.patch("/api/ai/settings", (req, res) => {
    try {
      const schema = z.object({
        DEFAULT_PROVIDER: z.nativeEnum(AIProvider).optional(),
        AUTO_FALLBACK: z.boolean().optional(),
        MAX_RETRIES: z.number().int().min(1).max(10).optional(),
        CACHE_ENABLED: z.boolean().optional(),
        CACHE_EXPIRY: z.number().int().min(1000).optional(),
      });
      
      const validatedData = schema.parse(req.body);
      const settings = updateAISettings(validatedData);
      
      res.json({ 
        settings, 
        message: "AI settings updated successfully" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating AI settings:', error);
      res.status(500).json({ message: "Failed to update AI settings" });
    }
  });

  // SPENDING PERSONALITY QUIZ ENDPOINTS
  
  // Initialize the quiz system
  app.post("/api/spending-personality/seed", requireAuth, requireAdmin, async (req, res) => {
    try {
      await spendingPersonalityService.seedQuestions();
      res.json({ success: true, message: "Quiz questions seeded successfully" });
    } catch (error) {
      console.error('Error seeding quiz questions:', error);
      res.status(500).json({ message: "Failed to seed quiz questions" });
    }
  });
  
  // Get quiz questions for a user
  app.get("/api/spending-personality/questions", async (req, res) => {
    try {
      const questions = await spendingPersonalityService.getQuestions();
      res.json(questions);
    } catch (error) {
      console.error('Error getting quiz questions:', error);
      res.status(500).json({ message: "Failed to get quiz questions" });
    }
  });
  
  // Submit quiz answers and get results
  app.post("/api/spending-personality/submit-quiz", requireAuth, async (req, res) => {
    try {
      const { userId, answers } = req.body;
      
      // Validate user ID
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user is submitting their own quiz
      if (req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized to submit quiz for this user" });
      }
      
      // Import the schema directly
      const { quizAnswersSchema } = await import('@shared/schema'); 
      
      // Validate quiz answers
      const validatedAnswers = quizAnswersSchema.parse(answers);
      
      // Submit the quiz and get results
      const result = await spendingPersonalityService.submitQuiz(userId, validatedAnswers);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error submitting quiz:', error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });
  
  // Get the user's quiz results
  app.get("/api/spending-personality/results/:userId", requireAuth, checkUserMatch, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const results = await spendingPersonalityService.getUserResults(userId);
      res.json(results);
    } catch (error) {
      console.error('Error getting quiz results:', error);
      res.status(500).json({ message: "Failed to get quiz results" });
    }
  });
  
  // Get the user's most recent quiz result
  app.get("/api/spending-personality/latest-result/:userId", requireAuth, checkUserMatch, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const result = await spendingPersonalityService.getLatestUserResult(userId);
      if (!result) {
        return res.status(404).json({ message: "No quiz results found for this user" });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error getting latest quiz result:', error);
      res.status(500).json({ message: "Failed to get latest quiz result" });
    }
  });
  
  // ADMIN ENDPOINTS FOR QUIZ MANAGEMENT
  
  // Add a new quiz question (admin only)
  app.post("/api/spending-personality/questions", requireAuth, requireAdmin, async (req, res) => {
    try {
      const question = await spendingPersonalityService.createQuestion(req.body);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error adding quiz question:', error);
      res.status(500).json({ message: "Failed to add quiz question" });
    }
  });
  
  // Subscription Management Routes
  
  // Get user subscription info
  app.get("/api/subscription/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user is requesting their own subscription info
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to view this subscription" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return only subscription-related fields
      res.json({
        subscriptionTier: user.subscriptionTier,
        subscriptionActive: user.subscriptionActive,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
      });
    } catch (error) {
      console.error('Error getting subscription info:', error);
      res.status(500).json({ message: "Failed to get subscription information" });
    }
  });
  
  // Update user subscription (manual update for testing/admin purposes)
  app.patch("/api/subscription/:userId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const schema = z.object({
        subscriptionTier: z.enum(['free', 'pro', 'lifetime']),
        subscriptionActive: z.boolean(),
        subscriptionStartDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
        subscriptionEndDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
      });
      
      const validatedData = schema.parse(req.body);
      
      const user = await storage.updateUserSubscription(
        userId,
        validatedData.subscriptionTier,
        validatedData.subscriptionActive,
        validatedData.subscriptionStartDate,
        validatedData.subscriptionEndDate
      );
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        subscriptionTier: user.subscriptionTier,
        subscriptionActive: user.subscriptionActive,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating subscription:', error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Subscription and payment routes with Stripe
  if (stripe) {
    // Create or retrieve a subscription
    app.post('/api/create-subscription', requireAuth, async (req, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        if (!user.email) {
          return res.status(400).json({ message: 'User email is required for subscription' });
        }
        
        // If user already has a subscription, return the existing subscription
        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          
          return res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret || null,
          });
        }
        
        // Create a new customer if needed
        let customerId = user.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.username,
          });
          
          customerId = customer.id;
          await storage.updateStripeCustomerId(userId, customerId);
        }
        
        // Check if price ID is provided (otherwise use default)
        const priceId = req.body.priceId || process.env.STRIPE_PRICE_ID;
        
        if (!priceId) {
          return res.status(400).json({ message: 'No subscription price ID provided' });
        }
        
        // Create the subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{
            price: priceId,
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            userId: userId.toString(),
          },
        });
        
        // Store the subscription ID in the database
        await storage.updateUserStripeInfo(userId, {
          customerId,
          subscriptionId: subscription.id
        });
        
        // Return the client secret for the payment
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret || null,
        });
      } catch (error) {
        console.error('Error creating subscription:', error);
        return res.status(500).json({ message: 'Subscription creation failed' });
      }
    });
    
    // Upgrade to Pro
    app.post('/api/upgrade', requireAuth, async (req, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        
        // Update the user's subscription status (this is called by client after successful payment)
        const updatedUser = await storage.updateUserSubscription(
          userId,
          'pro',
          true,
          new Date(),
          undefined
        );
        
        if (!updatedUser) {
          return res.status(500).json({ message: 'Failed to upgrade subscription' });
        }
        
        res.json({
          tier: updatedUser.subscriptionTier,
          active: updatedUser.subscriptionActive,
          startDate: updatedUser.subscriptionStartDate,
          message: 'Upgraded to Pro successfully'
        });
      } catch (error) {
        console.error('Error upgrading to Pro:', error);
        res.status(500).json({ message: 'Failed to upgrade subscription' });
      }
    });
    
    // Cancel subscription
    app.post('/api/cancel-subscription', requireAuth, async (req, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const user = await storage.getUser(userId);
        if (!user || !user.stripeSubscriptionId) {
          return res.status(400).json({ message: 'No active subscription found' });
        }
        
        // Cancel at period end to allow user to use the service until the end of their billing period
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          cancel_at_period_end: true
        });
        
        res.json({ message: 'Subscription will be canceled at the end of billing period' });
      } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({ message: 'Failed to cancel subscription' });
      }
    });
    
    // Webhook to handle subscription status changes
    app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(400).json({ message: 'Webhook signature missing or webhook secret not configured' });
      }
      
      try {
        // Verify the event
        const event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
        
        // Handle the event
        switch (event.type) {
          case 'invoice.payment_succeeded':
            const invoice = event.data.object as Stripe.Invoice;
            if (invoice.subscription) {
              const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
              
              // Get user ID from metadata or customer lookup
              let userId;
              if (subscription.metadata.userId) {
                userId = parseInt(subscription.metadata.userId);
              } else {
                // Lookup user by customer ID
                const user = await storage.getUserByStripeCustomerId(subscription.customer as string);
                if (user) {
                  userId = user.id;
                }
              }
              
              if (userId) {
                await storage.updateUserSubscription(
                  userId,
                  'pro',
                  true,
                  new Date(),
                  subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined
                );
              }
            }
            break;
            
          case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object as Stripe.Subscription;
            
            // Find the user by subscription ID and update
            if (deletedSubscription.id) {
              const user = await storage.getUserByStripeSubscriptionId(deletedSubscription.id);
              
              if (user) {
                await storage.updateUserSubscription(user.id, 'free', false, undefined, undefined);
              }
            }
            break;
            
          default:
            console.log(`Unhandled event type: ${event.type}`);
        }
        
        res.json({ received: true });
      } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ message: `Webhook Error: ${error.message}` });
      }
    });
    
    // Verify subscription status - used by checkout success page
    app.get('/api/verify-subscription', requireAuth, async (req, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // If user has a Stripe subscription ID, verify it with Stripe
        if (user.stripeSubscriptionId && stripe) {
          try {
            const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
            
            // Check if subscription is active
            const isActive = ['active', 'trialing'].includes(subscription.status);
            
            if (isActive) {
              // Get subscription details
              const subscriptionInfo = {
                status: subscription.status,
                currentPeriodEnd: subscription.current_period_end,
                plan: subscription.items.data[0]?.price.nickname || 'Stackr Pro',
                tier: user.subscriptionTier || 'pro',
                isPro: true,
                stripeId: subscription.id,
                cancelAtPeriodEnd: subscription.cancel_at_period_end
              };
              
              return res.json({
                verified: true,
                subscription: subscriptionInfo
              });
            } else {
              // Inactive subscription
              await storage.updateUserSubscription(userId, 'free', false, undefined, undefined);
              return res.json({
                verified: false,
                reason: 'Subscription inactive',
                subscription: { status: subscription.status }
              });
            }
          } catch (error) {
            console.error('Error verifying subscription with Stripe:', error);
            // Check if user has subscription data in our database
            if (user.subscriptionTier && user.subscriptionTier !== 'free' && user.subscriptionActive) {
              // We'll trust our database in this case
              return res.json({
                verified: true,
                subscription: {
                  status: 'active',
                  tier: user.subscriptionTier,
                  startDate: user.subscriptionStartDate,
                  endDate: user.subscriptionEndDate,
                  isLifetime: user.subscriptionTier === 'lifetime',
                  stripeSync: false
                }
              });
            } else {
              return res.json({
                verified: false,
                reason: 'Error verifying subscription with payment provider'
              });
            }
          }
        } 
        // For lifetime subscribers without a Stripe subscription or users on free tier
        else if (user.subscriptionTier === 'lifetime' || user.subscriptionTier === 'free') {
          return res.json({
            verified: true,
            subscription: {
              tier: user.subscriptionTier,
              isPro: user.subscriptionTier !== 'free',
              isLifetime: user.subscriptionTier === 'lifetime'
            }
          });
        } 
        // No subscription
        else {
          return res.json({
            verified: false,
            reason: 'No subscription found'
          });
        }
      } catch (error) {
        console.error('Error verifying subscription:', error);
        return res.status(500).json({ message: 'Failed to verify subscription' });
      }
    });
  
    // One-time payment routes for Stackr services and products
    app.post('/api/create-payment-intent', requireAuth, async (req, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const { amount, description, metadata } = req.body;
        
        if (!amount || amount <= 0) {
          return res.status(400).json({ message: 'Invalid amount' });
        }
        
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        if (!user.email) {
          return res.status(400).json({ message: 'User email is required for payment' });
        }
        
        // Create or get customer ID
        let customerId = user.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.username,
          });
          
          customerId = customer.id;
          await storage.updateStripeCustomerId(userId, customerId);
        }
        
        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          customer: customerId,
          description: description || 'Stackr one-time purchase',
          metadata: {
            userId: userId.toString(),
            ...metadata
          },
        });
        
        res.json({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Failed to create payment' });
      }
    });
  } else {
    // Stripe is not configured
    const stripeDisabledMessage = { message: 'Stripe integration not configured' };
    
    app.post('/api/create-subscription', requireAuth, (req, res) => {
      res.status(503).json(stripeDisabledMessage);
    });
    
    app.post('/api/upgrade', requireAuth, (req, res) => {
      res.status(503).json(stripeDisabledMessage);
    });
    
    app.post('/api/cancel-subscription', requireAuth, (req, res) => {
      res.status(503).json(stripeDisabledMessage);
    });
    
    app.post('/api/create-payment-intent', requireAuth, (req, res) => {
      res.status(503).json(stripeDisabledMessage);
    });
    
    app.get('/api/verify-subscription', requireAuth, (req, res) => {
      res.status(503).json(stripeDisabledMessage);
    });
  }

  /******************************
   * INCOME GENERATION FEATURES *
   ******************************/

  // STACKR GIGS MARKETPLACE

  // Get all gigs
  app.get("/api/gigs", requireAuth, async (req, res) => {
    try {
      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      res.status(500).json({ message: "Failed to fetch gigs" });
    }
  });

  // Get gig by ID
  app.get("/api/gigs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }

      // Placeholder - would need to implement storage method
      res.status(404).json({ message: "Gig not found" });
    } catch (error) {
      console.error('Error fetching gig:', error);
      res.status(500).json({ message: "Failed to fetch gig" });
    }
  });

  // Create new gig
  app.post("/api/gigs", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - User ID not found" });
      }
      
      const validatedData = insertStackrGigSchema.parse({
        ...req.body,
        requesterUserId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Placeholder - would need to implement storage method
      res.status(201).json({ id: 1, ...validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating gig:', error);
      res.status(500).json({ message: "Failed to create gig" });
    }
  });

  // Update gig
  app.patch("/api/gigs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }

      const validatedData = insertStackrGigSchema.partial().parse({
        ...req.body,
        updatedAt: new Date()
      });
      
      // Placeholder - would need to implement storage method
      res.status(404).json({ message: "Gig not found" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating gig:', error);
      res.status(500).json({ message: "Failed to update gig" });
    }
  });

  // Delete gig
  app.delete("/api/gigs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }

      // Placeholder - would need to implement storage method
      res.status(404).json({ message: "Gig not found" });
    } catch (error) {
      console.error('Error deleting gig:', error);
      res.status(500).json({ message: "Failed to delete gig" });
    }
  });

  // Get gigs by user (created by user)
  app.get("/api/gigs/created/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching user gigs:', error);
      res.status(500).json({ message: "Failed to fetch user gigs" });
    }
  });

  // Get gigs assigned to user
  app.get("/api/gigs/assigned/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching assigned gigs:', error);
      res.status(500).json({ message: "Failed to fetch assigned gigs" });
    }
  });

  // AFFILIATE PROGRAMS
  
  // Get all affiliate programs
  app.get("/api/affiliate-programs", requireAuth, async (req, res) => {
    try {
      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching affiliate programs:', error);
      res.status(500).json({ message: "Failed to fetch affiliate programs" });
    }
  });

  // Get user's affiliate programs
  app.get("/api/users/:userId/affiliates", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching user affiliates:', error);
      res.status(500).json({ message: "Failed to fetch user affiliates" });
    }
  });

  // Join affiliate program
  app.post("/api/users/:userId/affiliates", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const validatedData = insertUserAffiliateSchema.parse({
        ...req.body,
        userId: userId,
        dateJoined: new Date()
      });
      
      // Placeholder - would need to implement storage method
      res.status(201).json({ id: 1, ...validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error joining affiliate program:', error);
      res.status(500).json({ message: "Failed to join affiliate program" });
    }
  });

  // DIGITAL PRODUCTS
  
  // Get all products
  app.get("/api/digital-products", requireAuth, async (req, res) => {
    try {
      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching digital products:', error);
      res.status(500).json({ message: "Failed to fetch digital products" });
    }
  });

  // Get user's products
  app.get("/api/users/:userId/digital-products", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching user digital products:', error);
      res.status(500).json({ message: "Failed to fetch user digital products" });
    }
  });

  // Create digital product
  app.post("/api/digital-products", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - User ID not found" });
      }
      
      const validatedData = insertDigitalProductSchema.parse({
        ...req.body,
        userId: userId,
        created: new Date(),
        updated: new Date()
      });
      
      // Placeholder - would need to implement storage method
      res.status(201).json({ id: 1, ...validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating digital product:', error);
      res.status(500).json({ message: "Failed to create digital product" });
    }
  });

  // MONEY CHALLENGES
  
  // Get all challenges
  app.get("/api/money-challenges", requireAuth, async (req, res) => {
    try {
      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching money challenges:', error);
      res.status(500).json({ message: "Failed to fetch money challenges" });
    }
  });

  // Get featured challenges
  app.get("/api/money-challenges/featured", requireAuth, async (req, res) => {
    try {
      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching featured challenges:', error);
      res.status(500).json({ message: "Failed to fetch featured challenges" });
    }
  });

  // Join challenge - requires Pro subscription
  app.post("/api/users/:userId/challenges", requireAuth, requireProSubscription, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const validatedData = insertUserChallengeSchema.parse({
        ...req.body,
        userId: userId,
        startDate: new Date(),
        status: "in_progress"
      });
      
      // Placeholder - would need to implement storage method
      res.status(201).json({ id: 1, ...validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error joining money challenge:', error);
      res.status(500).json({ message: "Failed to join money challenge" });
    }
  });

  // INVESTMENT STRATEGIES
  
  // Get all investment strategies
  app.get("/api/investment-strategies", requireAuth, async (req, res) => {
    try {
      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching investment strategies:', error);
      res.status(500).json({ message: "Failed to fetch investment strategies" });
    }
  });

  // Get recommended investment strategies - requires Pro subscription
  app.get("/api/investment-strategies/recommended", requireAuth, requireProSubscription, async (req, res) => {
    try {
      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching recommended strategies:', error);
      res.status(500).json({ message: "Failed to fetch recommended strategies" });
    }
  });

  // USED GEAR LISTINGS
  
  // Get all listings
  app.get("/api/used-gear-listings", requireAuth, async (req, res) => {
    try {
      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching used gear listings:', error);
      res.status(500).json({ message: "Failed to fetch used gear listings" });
    }
  });

  // Get user's listings
  app.get("/api/users/:userId/used-gear-listings", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching user listings:', error);
      res.status(500).json({ message: "Failed to fetch user listings" });
    }
  });

  // Create used gear listing
  app.post("/api/used-gear-listings", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - User ID not found" });
      }
      
      const validatedData = insertUsedGearListingSchema.parse({
        ...req.body,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Placeholder - would need to implement storage method
      res.status(201).json({ id: 1, ...validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating used gear listing:', error);
      res.status(500).json({ message: "Failed to create used gear listing" });
    }
  });

  // INVOICES
  
  // Get user's invoices
  app.get("/api/users/:userId/invoices", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching user invoices:', error);
      res.status(500).json({ message: "Failed to fetch user invoices" });
    }
  });

  // Create invoice
  app.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - User ID not found" });
      }
      
      const validatedData = insertInvoiceSchema.parse({
        ...req.body,
        userId: userId,
        issueDate: new Date(),
      });
      
      // Placeholder - would need to implement storage method
      res.status(201).json({ id: 1, ...validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating invoice:', error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // CREATIVE GRANTS
  
  // Get all grants
  app.get("/api/creative-grants", requireAuth, async (req, res) => {
    try {
      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching creative grants:', error);
      res.status(500).json({ message: "Failed to fetch creative grants" });
    }
  });

  // Apply for grant - requires Pro subscription
  app.post("/api/creative-grants/:grantId/applications", requireAuth, requireProSubscription, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - User ID not found" });
      }
      
      const grantId = parseInt(req.params.grantId);
      if (isNaN(grantId)) {
        return res.status(400).json({ message: "Invalid grant ID" });
      }

      const validatedData = insertGrantApplicationSchema.parse({
        ...req.body,
        grantId: grantId,
        userId: userId,
        status: "submitted",
        applicationDate: new Date()
      });
      
      // Placeholder - would need to implement storage method
      res.status(201).json({ id: 1, ...validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error applying for grant:', error);
      res.status(500).json({ message: "Failed to apply for grant" });
    }
  });

  // REFERRAL SYSTEM
  
  // Get user's referrals
  app.get("/api/users/:userId/referrals", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Placeholder - would need to implement storage method
      res.json([]);
    } catch (error) {
      console.error('Error fetching user referrals:', error);
      res.status(500).json({ message: "Failed to fetch user referrals" });
    }
  });

  // Create referral
  app.post("/api/referrals", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - User ID not found" });
      }
      
      const validatedData = insertReferralSchema.parse({
        ...req.body,
        referrerUserId: userId,
        dateCreated: new Date(),
        status: "pending"
      });
      
      // Placeholder - would need to implement storage method
      res.status(201).json({ id: 1, ...validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating referral:', error);
      res.status(500).json({ message: "Failed to create referral" });
    }
  });

  // SUBSCRIPTION ROUTES

  // Get user's subscription status
  app.get("/api/users/:userId/subscription", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Check if user is requesting their own subscription info
      if (req.user?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized to view this user's subscription" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return subscription info
      const subscriptionInfo = {
        tier: user.subscriptionTier,
        active: user.subscriptionActive,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId
      };

      res.json(subscriptionInfo);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  // PROFESSIONAL SERVICES ENDPOINTS
  
  // Get all professional services
  app.get("/api/professional-services", async (req, res) => {
    try {
      const services = await storage.getProfessionalServices();
      res.json(services);
    } catch (error) {
      console.error('Error fetching professional services:', error);
      res.status(500).json({ message: "Failed to fetch professional services" });
    }
  });
  
  // Get professional service by ID
  app.get("/api/professional-services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const service = await storage.getProfessionalServiceById(id);
      if (!service) {
        return res.status(404).json({ message: "Professional service not found" });
      }
      
      res.json(service);
    } catch (error) {
      console.error('Error fetching professional service:', error);
      res.status(500).json({ message: "Failed to fetch professional service" });
    }
  });
  
  // Create new professional service (requires authentication)
  app.post("/api/professional-services", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - User ID not found" });
      }
      
      const validatedData = insertProfessionalServiceSchema.parse({
        ...req.body,
        userId
      });
      
      const service = await storage.createProfessionalService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating professional service:', error);
      res.status(500).json({ message: "Failed to create professional service" });
    }
  });
  
  // Update professional service (requires authentication and ownership)
  app.patch("/api/professional-services/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      // Get service to verify ownership
      const service = await storage.getProfessionalServiceById(id);
      if (!service) {
        return res.status(404).json({ message: "Professional service not found" });
      }
      
      // Verify ownership
      if (service.userId !== req.user?.id) {
        return res.status(403).json({ message: "Unauthorized - You do not own this service" });
      }
      
      const validatedData = insertProfessionalServiceSchema.partial().parse(req.body);
      
      const updatedService = await storage.updateProfessionalService(id, validatedData);
      if (!updatedService) {
        return res.status(404).json({ message: "Professional service not found" });
      }
      
      res.json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating professional service:', error);
      res.status(500).json({ message: "Failed to update professional service" });
    }
  });
  
  // Delete professional service (requires authentication and ownership)
  app.delete("/api/professional-services/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      // Get service to verify ownership
      const service = await storage.getProfessionalServiceById(id);
      if (!service) {
        return res.status(404).json({ message: "Professional service not found" });
      }
      
      // Verify ownership
      if (service.userId !== req.user?.id) {
        return res.status(403).json({ message: "Unauthorized - You do not own this service" });
      }
      
      const success = await storage.deleteProfessionalService(id);
      if (!success) {
        return res.status(404).json({ message: "Professional service not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting professional service:', error);
      res.status(500).json({ message: "Failed to delete professional service" });
    }
  });
  
  // Get professional services by user ID
  app.get("/api/users/:userId/professional-services", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const services = await storage.getProfessionalServicesByUserId(userId);
      res.json(services);
    } catch (error) {
      console.error('Error fetching user professional services:', error);
      res.status(500).json({ message: "Failed to fetch user professional services" });
    }
  });
  
  // Get professional services by category
  app.get("/api/professional-services/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      
      const services = await storage.getProfessionalServicesByCategory(category);
      res.json(services);
    } catch (error) {
      console.error('Error fetching professional services by category:', error);
      res.status(500).json({ message: "Failed to fetch professional services by category" });
    }
  });
  
  // Toggle service active status (requires authentication and ownership)
  app.patch("/api/professional-services/:id/toggle-active", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      // Get service to verify ownership
      const service = await storage.getProfessionalServiceById(id);
      if (!service) {
        return res.status(404).json({ message: "Professional service not found" });
      }
      
      // Verify ownership
      if (service.userId !== req.user?.id) {
        return res.status(403).json({ message: "Unauthorized - You do not own this service" });
      }
      
      const schema = z.object({
        isActive: z.boolean()
      });
      
      const { isActive } = schema.parse(req.body);
      
      const updatedService = await storage.toggleProfessionalServiceActive(id, isActive);
      if (!updatedService) {
        return res.status(404).json({ message: "Professional service not found" });
      }
      
      res.json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error toggling professional service active status:', error);
      res.status(500).json({ message: "Failed to toggle professional service active status" });
    }
  });

  // Register Perplexity AI routes
  registerPerplexityRoutes(app);

  // Special route for minimal HTML page that doesn't use Firebase or Sanity
  app.get('/minimal', (req, res) => {
    try {
      // Use the public/minimal.html file we created
      const minimalPath = path.join(process.cwd(), 'public', 'minimal.html');
      console.log("Serving static minimal HTML from:", minimalPath);
      
      const content = fs.readFileSync(minimalPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    } catch (err) {
      console.error("Error serving minimal app:", err);
      res.status(500).send(`Error serving minimal app: ${err}`);
    }
  });
  
  // Special route for Firebase-free version
  app.get('/fb-free', (req, res) => {
    try {
      // Use the client/firebase-free.html file we created
      const fbFreePath = path.join(process.cwd(), 'client', 'firebase-free.html');
      console.log("Serving Firebase-free HTML from:", fbFreePath);
      
      const content = fs.readFileSync(fbFreePath, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    } catch (err) {
      console.error("Error serving Firebase-free app:", err);
      res.status(500).send(`Error serving Firebase-free app: ${err}`);
    }
  });

  // Serve the clean version that has no Firebase/Sanity dependencies
  app.get("/clean", (req, res) => {
    try {
      // Add security headers to prevent script execution
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'nonce-stackr-safe' 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;");
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      const cleanHtmlPath = path.join(process.cwd(), "client", "clean.html");
      console.log("Serving clean HTML from:", cleanHtmlPath);
      
      // Read the HTML file
      const cleanHtml = fs.readFileSync(cleanHtmlPath, 'utf8');
      
      // Add nonce to scripts we want to allow
      const secureHtml = cleanHtml.replace(
        /<script>/g, 
        '<script nonce="stackr-safe">'
      );
      
      // Send the modified HTML
      res.send(secureHtml);
    } catch (err) {
      console.error("Error serving clean app:", err);
      res.status(500).send(`Error serving clean app: ${err}`);
    }
  });
  
  app.get("/ultra-clean", (req, res) => {
    // Directly send an inline HTML page with no external scripts
    const safeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stackr Finance - Ultra Clean</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { color: #4f46e5; }
    .card { background: #fff; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .button { display: inline-block; background: #4f46e5; color: white; padding: 0.5rem 1rem; border-radius: 4px; text-decoration: none; }
  </style>
  <script>
    // Block any possible Firebase/Sanity initialization
    window.firebase = null;
    window.sanity = null;
    Object.defineProperty(window, 'firebase', {
      get: () => null,
      set: () => {},
      configurable: false
    });
  </script>
</head>
<body>
  <h1>Stackr Finance</h1>
  <div class="card">
    <h2>Ultra Clean Mode</h2>
    <p>This page is serving a completely isolated version of the app with no external scripts or dependencies.</p>
    <p>Current status: <strong style="color: green;">✓ Online</strong></p>
  </div>
  <div class="card">
    <h2>Available Features</h2>
    <ul>
      <li>Income tracking with 40/30/30 split</li>
      <li>Budget planning</li>
      <li>Goal setting</li>
      <li>Financial advice</li>
    </ul>
    <p>All features are available through our API endpoints.</p>
  </div>
  <a href="/" class="button">Back to Main App</a>
</body>
</html>`;
    
    // Set strong security headers
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline';");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    res.send(safeHtml);
  });
  
  // Serve standalone HTML (completely separate from Vite/React)
  app.get("/standalone", (req, res) => {
    try {
      const standalonePath = path.join(process.cwd(), "public", "standalone.html");
      
      // Set headers to prevent any scripts from loading
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none';");
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      res.sendFile(standalonePath);
    } catch (err) {
      console.error("Error serving standalone HTML:", err);
      res.status(500).send(`Error serving standalone HTML: ${err}`);
    }
  });
  
  // Run direct.js server in a child process
  app.get("/direct-html", async (req, res) => {
    try {
      // Start the direct.js server in a child process
      const { exec } = await import('child_process');
      const serverProcess = exec('node direct.js');
      
      // Give the server a moment to start
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the standalone server
      res.redirect('http://localhost:8080');
    } catch (err) {
      console.error("Error starting direct HTML server:", err);
      res.status(500).send(`Error starting direct HTML server: ${err}`);
    }
  });
  
  // API status endpoint for the clean version
  app.get("/api/status", (req, res) => {
    res.json({
      api: "online",
      version: "1.0.0",
      database: "connected",
      features: {
        income: true,
        banking: true,
        ai: true,
        goals: true,
        export: true
      },
      timestamp: new Date().toISOString()
    });
  });
  
  // Special route to serve the Firebase-free version
  app.get("/firebase-free", (req, res) => {
    try {
      const standaloneHtmlPath = path.resolve(process.cwd(), "client", "standalone.html");
      console.log(`Serving Firebase-free version from: ${standaloneHtmlPath}`);
      res.sendFile(standaloneHtmlPath);
    } catch (error) {
      console.error("Error serving Firebase-free HTML:", error);
      res.status(500).send("Error loading Firebase-free version");
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
