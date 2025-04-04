import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertIncomeSchema, 
  insertGoalSchema, 
  insertBankConnectionSchema, 
  insertExpenseSchema,
  insertBalanceSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { plaidService } from "./plaid-service";

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

  const httpServer = createServer(app);

  return httpServer;
}
