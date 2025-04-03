import { users, type User, type InsertUser, incomes, type Income, type InsertIncome, goals, type Goal, type InsertGoal, 
  bankConnections, type BankConnection, type InsertBankConnection, 
  bankAccounts, type BankAccount, type InsertBankAccount,
  bankTransactions, type BankTransaction, type InsertBankTransaction } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Income methods
  getIncomes(): Promise<Income[]>;
  getIncomeById(id: number): Promise<Income | undefined>;
  createIncome(income: InsertIncome): Promise<Income>;
  updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined>;
  deleteIncome(id: number): Promise<boolean>;
  getIncomesByUserId(userId: number): Promise<Income[]>;
  getIncomesByMonth(year: number, month: number): Promise<Income[]>;
  
  // Goal methods
  getGoals(): Promise<Goal[]>;
  getGoalById(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  getGoalsByType(type: string): Promise<Goal[]>;
  updateGoalProgress(id: number, amount: number): Promise<Goal | undefined>;
  
  // Bank connection methods
  getBankConnections(userId: number): Promise<BankConnection[]>;
  getBankConnectionById(id: number): Promise<BankConnection | undefined>;
  createBankConnection(connection: InsertBankConnection): Promise<BankConnection>;
  updateBankConnection(id: number, connection: Partial<InsertBankConnection>): Promise<BankConnection | undefined>;
  deleteBankConnection(id: number): Promise<boolean>;
  
  // Bank account methods
  getBankAccounts(connectionId: number): Promise<BankAccount[]>;
  getBankAccountById(id: number): Promise<BankAccount | undefined>;
  getBankAccountByAccountId(accountId: string): Promise<BankAccount | undefined>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined>;
  deleteBankAccount(id: number): Promise<boolean>;
  
  // Bank transaction methods
  getBankTransactions(accountId: number): Promise<BankTransaction[]>;
  getBankTransactionById(id: number): Promise<BankTransaction | undefined>;
  getBankTransactionByTransactionId(transactionId: string): Promise<BankTransaction | undefined>;
  createBankTransaction(transaction: InsertBankTransaction): Promise<BankTransaction>;
  updateBankTransaction(id: number, transaction: Partial<InsertBankTransaction>): Promise<BankTransaction | undefined>;
  deleteBankTransaction(id: number): Promise<boolean>;
  importBankTransactionAsIncome(transactionId: number): Promise<Income | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private incomes: Map<number, Income>;
  private goals: Map<number, Goal>;
  private bankConnections: Map<number, BankConnection>;
  private bankAccounts: Map<number, BankAccount>;
  private bankTransactions: Map<number, BankTransaction>;
  private userCurrentId: number;
  private incomeCurrentId: number;
  private goalCurrentId: number;
  private bankConnectionCurrentId: number;
  private bankAccountCurrentId: number;
  private bankTransactionCurrentId: number;

  constructor() {
    this.users = new Map();
    this.incomes = new Map();
    this.goals = new Map();
    this.bankConnections = new Map();
    this.bankAccounts = new Map();
    this.bankTransactions = new Map();
    this.userCurrentId = 1;
    this.incomeCurrentId = 1;
    this.goalCurrentId = 1;
    this.bankConnectionCurrentId = 1;
    this.bankAccountCurrentId = 1;
    this.bankTransactionCurrentId = 1;
    
    // Add some initial data
    this.setupInitialData();
  }

  private setupInitialData() {
    const incomes: InsertIncome[] = [
      {
        description: "Emergency lockout - Downtown",
        amount: "225.00",
        date: new Date("2023-05-18"),
        source: "Manual",
        category: "emergency",
        userId: 1
      },
      {
        description: "Car key replacement",
        amount: "185.00",
        date: new Date("2023-05-16"),
        source: "Bank",
        category: "service",
        userId: 1
      },
      {
        description: "Commercial lock installation",
        amount: "450.00",
        date: new Date("2023-05-15"),
        source: "Manual",
        category: "installation",
        userId: 1
      }
    ];

    incomes.forEach(income => {
      this.createIncome(income);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Income methods
  async getIncomes(): Promise<Income[]> {
    return Array.from(this.incomes.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getIncomeById(id: number): Promise<Income | undefined> {
    return this.incomes.get(id);
  }

  async createIncome(insertIncome: InsertIncome): Promise<Income> {
    const id = this.incomeCurrentId++;
    const date = insertIncome.date instanceof Date 
      ? insertIncome.date 
      : new Date(insertIncome.date || new Date());
      
    const income: Income = { 
      id,
      description: insertIncome.description,
      amount: insertIncome.amount,
      date: date,
      source: insertIncome.source || 'Manual',
      category: insertIncome.category || 'other',
      userId: insertIncome.userId || null,
      notes: insertIncome.notes || null
    };
    
    this.incomes.set(id, income);
    return income;
  }

  async updateIncome(id: number, updatedIncome: Partial<InsertIncome>): Promise<Income | undefined> {
    const income = this.incomes.get(id);
    if (!income) return undefined;

    const updated: Income = { 
      ...income, 
      ...updatedIncome,
      date: updatedIncome.date ? 
        (updatedIncome.date instanceof Date ? updatedIncome.date : new Date(updatedIncome.date)) 
        : income.date
    };
    
    this.incomes.set(id, updated);
    return updated;
  }

  async deleteIncome(id: number): Promise<boolean> {
    return this.incomes.delete(id);
  }

  async getIncomesByUserId(userId: number): Promise<Income[]> {
    return Array.from(this.incomes.values())
      .filter(income => income.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getIncomesByMonth(year: number, month: number): Promise<Income[]> {
    return Array.from(this.incomes.values())
      .filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getFullYear() === year && incomeDate.getMonth() === month;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  // Goal methods
  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values()).sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  async getGoalById(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.goalCurrentId++;
    const startDate = insertGoal.startDate instanceof Date 
      ? insertGoal.startDate 
      : new Date(insertGoal.startDate || new Date());

    const deadline = insertGoal.deadline instanceof Date 
      ? insertGoal.deadline 
      : (insertGoal.deadline ? new Date(insertGoal.deadline) : null);
      
    const goal: Goal = { 
      id,
      name: insertGoal.name,
      targetAmount: insertGoal.targetAmount,
      currentAmount: insertGoal.currentAmount || "0",
      type: insertGoal.type,
      deadline: deadline,
      isCompleted: insertGoal.isCompleted || false,
      startDate: startDate,
      userId: insertGoal.userId || null,
      description: insertGoal.description || null
    };
    
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, updatedGoal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;

    // Process dates
    let startDate = goal.startDate;
    if (updatedGoal.startDate) {
      startDate = updatedGoal.startDate instanceof Date 
        ? updatedGoal.startDate 
        : new Date(updatedGoal.startDate);
    }

    let deadline = goal.deadline;
    if (updatedGoal.deadline !== undefined) {
      deadline = updatedGoal.deadline === null 
        ? null 
        : (updatedGoal.deadline instanceof Date 
            ? updatedGoal.deadline 
            : new Date(updatedGoal.deadline));
    }
    
    const updated: Goal = { 
      ...goal, 
      ...updatedGoal,
      startDate,
      deadline
    };
    
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  async getGoalsByType(type: string): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.type === type)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  async updateGoalProgress(id: number, amount: number): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const currentAmount = typeof goal.currentAmount === 'string' 
      ? parseFloat(goal.currentAmount) 
      : goal.currentAmount;
    
    const newAmount = currentAmount + amount;
    const targetAmount = typeof goal.targetAmount === 'string' 
      ? parseFloat(goal.targetAmount) 
      : goal.targetAmount;
    
    // Check if goal is now completed
    const isCompleted = newAmount >= targetAmount;
    
    const updatedGoal: Goal = {
      ...goal,
      currentAmount: newAmount.toString(),
      isCompleted
    };
    
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }
  
  // Bank connection methods
  async getBankConnections(userId: number): Promise<BankConnection[]> {
    return Array.from(this.bankConnections.values())
      .filter(connection => connection.userId === userId)
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }
  
  async getBankConnectionById(id: number): Promise<BankConnection | undefined> {
    return this.bankConnections.get(id);
  }
  
  async createBankConnection(connection: InsertBankConnection): Promise<BankConnection> {
    const id = this.bankConnectionCurrentId++;
    const lastUpdated = new Date();
    
    const bankConnection: BankConnection = {
      id,
      userId: connection.userId,
      institutionId: connection.institutionId,
      institutionName: connection.institutionName,
      accessToken: connection.accessToken,
      itemId: connection.itemId,
      status: connection.status || 'active',
      lastUpdated,
      metadata: connection.metadata || null
    };
    
    this.bankConnections.set(id, bankConnection);
    return bankConnection;
  }
  
  async updateBankConnection(id: number, connection: Partial<InsertBankConnection>): Promise<BankConnection | undefined> {
    const existingConnection = this.bankConnections.get(id);
    if (!existingConnection) return undefined;
    
    const updatedConnection: BankConnection = {
      ...existingConnection,
      ...connection,
      lastUpdated: new Date()
    };
    
    this.bankConnections.set(id, updatedConnection);
    return updatedConnection;
  }
  
  async deleteBankConnection(id: number): Promise<boolean> {
    return this.bankConnections.delete(id);
  }
  
  // Bank account methods
  async getBankAccounts(connectionId: number): Promise<BankAccount[]> {
    return Array.from(this.bankAccounts.values())
      .filter(account => account.connectionId === connectionId)
      .sort((a, b) => a.accountName.localeCompare(b.accountName));
  }
  
  async getBankAccountById(id: number): Promise<BankAccount | undefined> {
    return this.bankAccounts.get(id);
  }
  
  async getBankAccountByAccountId(accountId: string): Promise<BankAccount | undefined> {
    return Array.from(this.bankAccounts.values())
      .find(account => account.accountId === accountId);
  }
  
  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    const id = this.bankAccountCurrentId++;
    const lastUpdated = new Date();
    
    const bankAccount: BankAccount = {
      id,
      connectionId: account.connectionId,
      accountId: account.accountId,
      accountName: account.accountName,
      accountType: account.accountType,
      accountSubtype: account.accountSubtype || null,
      mask: account.mask || null,
      balanceAvailable: account.balanceAvailable || null,
      balanceCurrent: account.balanceCurrent || null,
      isActive: account.isActive !== undefined ? account.isActive : true,
      lastUpdated
    };
    
    this.bankAccounts.set(id, bankAccount);
    return bankAccount;
  }
  
  async updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    const existingAccount = this.bankAccounts.get(id);
    if (!existingAccount) return undefined;
    
    const updatedAccount: BankAccount = {
      ...existingAccount,
      ...account,
      lastUpdated: new Date()
    };
    
    this.bankAccounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteBankAccount(id: number): Promise<boolean> {
    return this.bankAccounts.delete(id);
  }
  
  // Bank transaction methods
  async getBankTransactions(accountId: number): Promise<BankTransaction[]> {
    return Array.from(this.bankTransactions.values())
      .filter(transaction => transaction.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getBankTransactionById(id: number): Promise<BankTransaction | undefined> {
    return this.bankTransactions.get(id);
  }
  
  async getBankTransactionByTransactionId(transactionId: string): Promise<BankTransaction | undefined> {
    return Array.from(this.bankTransactions.values())
      .find(transaction => transaction.transactionId === transactionId);
  }
  
  async createBankTransaction(transaction: InsertBankTransaction): Promise<BankTransaction> {
    const id = this.bankTransactionCurrentId++;
    
    const date = transaction.date instanceof Date 
      ? transaction.date 
      : new Date(transaction.date || new Date());
    
    const bankTransaction: BankTransaction = {
      id,
      accountId: transaction.accountId,
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      date,
      name: transaction.name,
      merchantName: transaction.merchantName || null,
      category: transaction.category || null,
      pending: transaction.pending || false,
      importedAsIncome: transaction.importedAsIncome || false,
      metadata: transaction.metadata || null
    };
    
    this.bankTransactions.set(id, bankTransaction);
    return bankTransaction;
  }
  
  async updateBankTransaction(id: number, transaction: Partial<InsertBankTransaction>): Promise<BankTransaction | undefined> {
    const existingTransaction = this.bankTransactions.get(id);
    if (!existingTransaction) return undefined;
    
    let updatedDate = existingTransaction.date;
    if (transaction.date) {
      updatedDate = transaction.date instanceof Date 
        ? transaction.date 
        : new Date(transaction.date);
    }
    
    const updatedTransaction: BankTransaction = {
      ...existingTransaction,
      ...transaction,
      date: updatedDate
    };
    
    this.bankTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async deleteBankTransaction(id: number): Promise<boolean> {
    return this.bankTransactions.delete(id);
  }
  
  async importBankTransactionAsIncome(transactionId: number): Promise<Income | undefined> {
    const transaction = this.bankTransactions.get(transactionId);
    if (!transaction) return undefined;
    
    // Transaction already imported
    if (transaction.importedAsIncome) return undefined;
    
    // Get account details to include bank name in description
    const account = this.bankAccounts.get(transaction.accountId);
    if (!account) return undefined;
    
    // Create income entry from transaction
    const incomeData: InsertIncome = {
      description: transaction.merchantName || transaction.name,
      amount: transaction.amount.toString(),
      date: transaction.date,
      source: "Bank",
      category: transaction.category || "other",
      userId: null, // Add logic to get account owner's user ID
      notes: `Imported from bank transaction (${account.accountName})`
    };
    
    // Create income record
    const income = await this.createIncome(incomeData);
    
    // Mark transaction as imported
    transaction.importedAsIncome = true;
    this.bankTransactions.set(transactionId, transaction);
    
    return income;
  }
}

// Import database storage
import { dbStorage } from './db-storage';

// Export the database storage implementation instead of memory storage
export const storage = dbStorage;
