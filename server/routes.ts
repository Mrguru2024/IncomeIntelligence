import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertIncomeSchema, 
  insertGoalSchema, 
  insertBankConnectionSchema, 
  insertExpenseSchema,
  insertBalanceSchema,
  insertReminderSchema,
  insertWidgetSettingsSchema,
  insertUserProfileSchema
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
import { insertNotificationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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
      res.json({ link_token: linkToken });
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
  
  // Get personalized financial advice
  app.post("/api/ai/financial-advice", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.number().int().positive(),
        question: z.string().optional()
      });
      
      const { userId, question } = schema.parse(req.body);
      
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
        question
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
  
  // Suggest AI-generated financial goals
  app.post("/api/ai/suggest-goals", async (req, res) => {
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
  
  // Analyze expenses and provide optimization suggestions
  app.post("/api/ai/analyze-expenses", async (req, res) => {
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
  
  // Check and record when user has used AI advice
  app.post("/api/ai/mark-advice-used", async (req, res) => {
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
  app.get("/api/user/profile", async (req, res) => {
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
        DEFAULT_PROVIDER: z.enum([AIProvider.OPENAI, AIProvider.ANTHROPIC]).optional(),
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

  const httpServer = createServer(app);

  return httpServer;
}
