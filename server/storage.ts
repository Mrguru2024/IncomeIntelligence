import { users, type User, type InsertUser, incomes, type Income, type InsertIncome, goals, type Goal, type InsertGoal, 
  bankConnections, type BankConnection, type InsertBankConnection, 
  bankAccounts, type BankAccount, type InsertBankAccount,
  bankTransactions, type BankTransaction, type InsertBankTransaction,
  expenses, type Expense, type InsertExpense,
  balances, type Balance, type InsertBalance,
  achievements, type Achievement, type InsertAchievement,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  gamificationProfiles, type GamificationProfile, type InsertGamificationProfile,
  pointTransactions, type PointTransaction, type InsertPointTransaction
 } from "@shared/schema";

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
  
  // Expense methods
  getExpenses(): Promise<Expense[]>;
  getExpenseById(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  getExpensesByUserId(userId: number): Promise<Expense[]>;
  getExpensesByMonth(year: number, month: number): Promise<Expense[]>;
  getExpensesByCategory(category: string): Promise<Expense[]>;
  syncOfflineExpenses(offlineExpenses: InsertExpense[]): Promise<Expense[]>;
  
  // Balance methods
  getBalance(userId: number, year: number, month: number): Promise<Balance | undefined>;
  getAllBalances(userId: number): Promise<Balance[]>;
  createBalance(balance: InsertBalance): Promise<Balance>;
  updateBalance(id: number, balance: Partial<InsertBalance>): Promise<Balance | undefined>;
  calculateCurrentBalance(userId: number, year: number, month: number): Promise<number>;
  updateBalanceAfterExpense(userId: number, expenseAmount: number): Promise<Balance | undefined>;
  updateBalanceAfterIncome(userId: number, incomeAmount: number): Promise<Balance | undefined>;
  
  // Gamification methods
  
  // Achievement methods
  getAchievements(): Promise<Achievement[]>; 
  getAchievementById(id: number): Promise<Achievement | undefined>;
  getAchievementsByCategory(category: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: number, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined>;
  deleteAchievement(id: number): Promise<boolean>;
  
  // User Achievement methods
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  getUserAchievementById(id: number): Promise<UserAchievement | undefined>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserAchievement(id: number, userAchievement: Partial<InsertUserAchievement>): Promise<UserAchievement | undefined>;
  deleteUserAchievement(id: number): Promise<boolean>;
  checkAchievementEligibility(userId: number, achievementId: number): Promise<boolean>;
  awardAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined>;
  
  // Gamification Profile methods
  getGamificationProfile(userId: number): Promise<GamificationProfile | undefined>;
  createGamificationProfile(profile: InsertGamificationProfile): Promise<GamificationProfile>;
  updateGamificationProfile(userId: number, profile: Partial<InsertGamificationProfile>): Promise<GamificationProfile | undefined>;
  incrementUserStreak(userId: number): Promise<GamificationProfile | undefined>;
  resetUserStreak(userId: number): Promise<GamificationProfile | undefined>;
  addPointsToUser(userId: number, points: number, reason: string, source: string, sourceId?: number): Promise<GamificationProfile | undefined>;
  checkAndUpdateUserLevel(userId: number): Promise<GamificationProfile | undefined>;
  
  // Point Transaction methods
  getPointTransactions(userId: number): Promise<PointTransaction[]>;
  getPointTransactionById(id: number): Promise<PointTransaction | undefined>;
  createPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction>;
  getRecentPointTransactions(userId: number, limit: number): Promise<PointTransaction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private incomes: Map<number, Income>;
  private goals: Map<number, Goal>;
  private bankConnections: Map<number, BankConnection>;
  private bankAccounts: Map<number, BankAccount>;
  private bankTransactions: Map<number, BankTransaction>;
  private expenses: Map<number, Expense>;
  private balances: Map<number, Balance>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private gamificationProfiles: Map<number, GamificationProfile>;
  private pointTransactions: Map<number, PointTransaction>;
  private userCurrentId: number;
  private incomeCurrentId: number;
  private goalCurrentId: number;
  private bankConnectionCurrentId: number;
  private bankAccountCurrentId: number;
  private bankTransactionCurrentId: number;
  private expenseCurrentId: number;
  private balanceCurrentId: number;
  private achievementCurrentId: number;
  private userAchievementCurrentId: number;
  private gamificationProfileCurrentId: number;
  private pointTransactionCurrentId: number;

  constructor() {
    this.users = new Map();
    this.incomes = new Map();
    this.goals = new Map();
    this.bankConnections = new Map();
    this.bankAccounts = new Map();
    this.bankTransactions = new Map();
    this.expenses = new Map();
    this.balances = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.gamificationProfiles = new Map();
    this.pointTransactions = new Map();
    
    this.userCurrentId = 1;
    this.incomeCurrentId = 1;
    this.goalCurrentId = 1;
    this.bankConnectionCurrentId = 1;
    this.bankAccountCurrentId = 1;
    this.bankTransactionCurrentId = 1;
    this.expenseCurrentId = 1;
    this.balanceCurrentId = 1;
    this.achievementCurrentId = 1;
    this.userAchievementCurrentId = 1;
    this.gamificationProfileCurrentId = 1;
    this.pointTransactionCurrentId = 1;
    
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
    
    // Add initial expenses
    const expenses: InsertExpense[] = [
      {
        description: "Office supplies",
        amount: "45.75",
        date: new Date("2023-05-19"),
        category: "other",
        userId: 1,
        paymentMethod: "credit"
      },
      {
        description: "Fuel for work van",
        amount: "68.50",
        date: new Date("2023-05-17"),
        category: "transportation",
        userId: 1,
        paymentMethod: "debit"
      }
    ];
    
    expenses.forEach(expense => {
      const id = this.expenseCurrentId++;
      const expenseObj: Expense = {
        id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date instanceof Date ? expense.date : new Date(expense.date || new Date()),
        category: expense.category || 'other',
        userId: expense.userId || null,
        paymentMethod: expense.paymentMethod || 'cash',
        location: expense.location || null,
        notes: expense.notes || null,
        isRecurring: expense.isRecurring || false,
        recurringPeriod: expense.recurringPeriod || null,
        offlineCreated: expense.offlineCreated || false,
        offlineId: expense.offlineId || null
      };
      this.expenses.set(id, expenseObj);
    });
    
    // Add initial balance
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const initialBalance: InsertBalance = {
      userId: 1,
      beginningBalance: "2000.00",
      currentBalance: "2000.00",
      year: currentYear,
      month: currentMonth
    };
    
    this.balances.set(this.balanceCurrentId++, {
      ...initialBalance,
      id: this.balanceCurrentId,
      lastUpdated: new Date()
    });
    
    // Add initial achievements
    const achievements: InsertAchievement[] = [
      {
        name: "First Income",
        description: "Record your first income",
        category: "income",
        pointsValue: 10,
        icon: "trophy",
        level: 1,
        criteria: { incomeCount: 1 }
      },
      {
        name: "Income Milestone: $1,000",
        description: "Record a total of $1,000 in income",
        category: "income",
        pointsValue: 25,
        icon: "award",
        level: 2,
        criteria: { minIncome: 1000 }
      },
      {
        name: "First Savings Goal",
        description: "Create your first savings goal",
        category: "savings",
        pointsValue: 15,
        icon: "piggyBank",
        level: 1,
        criteria: { goalCount: 1 }
      },
      {
        name: "Goal Achieved",
        description: "Complete any financial goal",
        category: "goals",
        pointsValue: 50,
        icon: "check",
        level: 2,
        criteria: { completedGoals: 1 }
      },
      {
        name: "Expense Tracker",
        description: "Record 5 expenses",
        category: "expense",
        pointsValue: 20,
        icon: "receipt",
        level: 1,
        criteria: { expenseCount: 5 }
      },
      {
        name: "3-Day Streak",
        description: "Login for 3 days in a row",
        category: "streak",
        pointsValue: 15,
        icon: "flame",
        level: 1,
        criteria: { minStreak: 3 }
      },
      {
        name: "Connected Account",
        description: "Connect your first bank account",
        category: "milestone",
        pointsValue: 30,
        icon: "link",
        level: 1,
        criteria: { connectionCount: 1 }
      }
    ];
    
    achievements.forEach(achievement => {
      const id = this.achievementCurrentId++;
      const achievementObj: Achievement = {
        id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        pointsValue: achievement.pointsValue || 10,
        icon: achievement.icon || null,
        level: achievement.level || 1,
        criteria: achievement.criteria || {},
        createdAt: new Date()
      };
      this.achievements.set(id, achievementObj);
    });
    
    // Create initial gamification profile for user 1
    const profileId = this.gamificationProfileCurrentId++;
    const now = new Date();
    
    const initialProfile: GamificationProfile = {
      id: profileId,
      userId: 1,
      points: 0,
      level: 1,
      streak: 0,
      lastActive: now,
      totalPointsEarned: 0,
      milestones: [],
      achievements: {},
      updatedAt: now
    };
    
    this.gamificationProfiles.set(profileId, initialProfile);
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
  
  // Expense methods
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.expenseCurrentId++;
    const date = insertExpense.date instanceof Date 
      ? insertExpense.date 
      : new Date(insertExpense.date || new Date());
      
    const expense: Expense = { 
      id,
      description: insertExpense.description,
      amount: insertExpense.amount,
      date: date,
      category: insertExpense.category || 'other',
      userId: insertExpense.userId || null,
      paymentMethod: insertExpense.paymentMethod || 'cash',
      location: insertExpense.location || null,
      notes: insertExpense.notes || null,
      isRecurring: insertExpense.isRecurring || false,
      recurringPeriod: insertExpense.recurringPeriod || null,
      offlineCreated: insertExpense.offlineCreated || false,
      offlineId: insertExpense.offlineId || null
    };
    
    this.expenses.set(id, expense);
    
    // Update the user's balance
    if (expense.userId) {
      await this.updateBalanceAfterExpense(expense.userId, 
        typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount);
    }
    
    return expense;
  }

  async updateExpense(id: number, updatedExpense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;

    const updated: Expense = { 
      ...expense, 
      ...updatedExpense,
      date: updatedExpense.date ? 
        (updatedExpense.date instanceof Date ? updatedExpense.date : new Date(updatedExpense.date)) 
        : expense.date
    };
    
    this.expenses.set(id, updated);
    return updated;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const expense = this.expenses.get(id);
    if (!expense) return false;
    
    // Adjust balance if deleting an expense
    if (expense.userId) {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      await this.updateBalanceAfterIncome(expense.userId, amount);
    }
    
    return this.expenses.delete(id);
  }

  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getExpensesByCategory(category: string): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.category === category)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async syncOfflineExpenses(offlineExpenses: InsertExpense[]): Promise<Expense[]> {
    const syncedExpenses: Expense[] = [];
    
    for (const expense of offlineExpenses) {
      // Check if expense with this offlineId already exists
      if (expense.offlineId) {
        const existing = Array.from(this.expenses.values())
          .find(exp => exp.offlineId === expense.offlineId);
        
        if (!existing) {
          const newExpense = await this.createExpense(expense);
          syncedExpenses.push(newExpense);
        }
      }
    }
    
    return syncedExpenses;
  }
  
  // Balance methods
  async getBalance(userId: number, year: number, month: number): Promise<Balance | undefined> {
    return Array.from(this.balances.values())
      .find(balance => 
        balance.userId === userId && 
        balance.year === year && 
        balance.month === month);
  }

  async getAllBalances(userId: number): Promise<Balance[]> {
    return Array.from(this.balances.values())
      .filter(balance => balance.userId === userId)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  }

  async createBalance(insertBalance: InsertBalance): Promise<Balance> {
    const id = this.balanceCurrentId++;
    const lastUpdated = new Date();
    
    const balance: Balance = {
      id,
      userId: insertBalance.userId,
      beginningBalance: insertBalance.beginningBalance,
      currentBalance: insertBalance.currentBalance,
      month: insertBalance.month,
      year: insertBalance.year,
      lastUpdated
    };
    
    this.balances.set(id, balance);
    return balance;
  }

  async updateBalance(id: number, updatedBalance: Partial<InsertBalance>): Promise<Balance | undefined> {
    const balance = this.balances.get(id);
    if (!balance) return undefined;
    
    const updated: Balance = {
      ...balance,
      ...updatedBalance,
      lastUpdated: new Date()
    };
    
    this.balances.set(id, updated);
    return updated;
  }

  async calculateCurrentBalance(userId: number, year: number, month: number): Promise<number> {
    // Get the balance record for this user and month
    const balance = await this.getBalance(userId, year, month);
    
    if (!balance) {
      // Create a new balance if it doesn't exist
      const previousMonth = month === 0 ? 11 : month - 1;
      const previousYear = month === 0 ? year - 1 : year;
      
      // Get previous month's balance
      const previousBalance = await this.getBalance(userId, previousYear, previousMonth);
      const beginningBalance = previousBalance ? 
        (typeof previousBalance.currentBalance === 'string' ? 
          parseFloat(previousBalance.currentBalance) : previousBalance.currentBalance) : 
        0;
      
      // Create new balance
      await this.createBalance({
        userId,
        beginningBalance: beginningBalance.toString(),
        currentBalance: beginningBalance.toString(),
        month,
        year
      });
      
      return beginningBalance;
    }
    
    return typeof balance.currentBalance === 'string' ? 
      parseFloat(balance.currentBalance) : balance.currentBalance;
  }

  async updateBalanceAfterExpense(userId: number, expenseAmount: number): Promise<Balance | undefined> {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get or create balance for this month
    let balance = await this.getBalance(userId, year, month);
    
    if (!balance) {
      // Create new balance if it doesn't exist
      balance = await this.createBalance({
        userId,
        beginningBalance: "0",
        currentBalance: "0",
        month,
        year
      });
    }
    
    // Calculate new balance
    const currentAmount = typeof balance.currentBalance === 'string' ? 
      parseFloat(balance.currentBalance) : balance.currentBalance;
    
    const newAmount = currentAmount - expenseAmount;
    
    // Update balance
    return this.updateBalance(balance.id, {
      currentBalance: newAmount.toString()
    });
  }

  async updateBalanceAfterIncome(userId: number, incomeAmount: number): Promise<Balance | undefined> {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get or create balance for this month
    let balance = await this.getBalance(userId, year, month);
    
    if (!balance) {
      // Create new balance if it doesn't exist
      balance = await this.createBalance({
        userId,
        beginningBalance: "0",
        currentBalance: "0",
        month,
        year
      });
    }
    
    // Calculate new balance
    const currentAmount = typeof balance.currentBalance === 'string' ? 
      parseFloat(balance.currentBalance) : balance.currentBalance;
    
    const newAmount = currentAmount + incomeAmount;
    
    // Update balance
    return this.updateBalance(balance.id, {
      currentBalance: newAmount.toString()
    });
  }

  // Gamification methods 

  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .sort((a, b) => a.level - b.level);
  }

  async getAchievementById(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.category === category)
      .sort((a, b) => a.level - b.level);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementCurrentId++;
    const createdAt = new Date();
    
    const newAchievement: Achievement = {
      id,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category,
      pointsValue: achievement.pointsValue || 10,
      icon: achievement.icon || null,
      level: achievement.level || 1,
      criteria: achievement.criteria || {},
      createdAt
    };
    
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  async updateAchievement(id: number, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined> {
    const existingAchievement = this.achievements.get(id);
    if (!existingAchievement) return undefined;
    
    const updatedAchievement: Achievement = {
      ...existingAchievement,
      ...achievement,
    };
    
    this.achievements.set(id, updatedAchievement);
    return updatedAchievement;
  }

  async deleteAchievement(id: number): Promise<boolean> {
    return this.achievements.delete(id);
  }

  // User Achievement methods
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId)
      .sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime());
  }

  async getUserAchievementById(id: number): Promise<UserAchievement | undefined> {
    return this.userAchievements.get(id);
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.userAchievementCurrentId++;
    const dateEarned = new Date();
    
    const newUserAchievement: UserAchievement = {
      id,
      userId: userAchievement.userId,
      achievementId: userAchievement.achievementId,
      dateEarned,
      progress: userAchievement.progress || null
    };
    
    this.userAchievements.set(id, newUserAchievement);
    return newUserAchievement;
  }

  async updateUserAchievement(id: number, userAchievement: Partial<InsertUserAchievement>): Promise<UserAchievement | undefined> {
    const existingUA = this.userAchievements.get(id);
    if (!existingUA) return undefined;
    
    const updatedUA: UserAchievement = {
      ...existingUA,
      ...userAchievement,
    };
    
    this.userAchievements.set(id, updatedUA);
    return updatedUA;
  }

  async deleteUserAchievement(id: number): Promise<boolean> {
    return this.userAchievements.delete(id);
  }

  async checkAchievementEligibility(userId: number, achievementId: number): Promise<boolean> {
    // Check if achievement exists
    const achievement = await this.getAchievementById(achievementId);
    if (!achievement) return false;
    
    // Check if user already has this achievement
    const existingAchievements = await this.getUserAchievements(userId);
    const alreadyEarned = existingAchievements.some(ua => ua.achievementId === achievementId);
    
    if (alreadyEarned) return false;
    
    // Check criteria based on achievement category
    switch(achievement.category) {
      case 'income':
        // Check income-related criteria
        const incomes = await this.getIncomesByUserId(userId);
        const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount.toString()), 0);
        const criteria = achievement.criteria as { minIncome?: number, incomeCount?: number };
        
        if (criteria.minIncome && totalIncome < criteria.minIncome) return false;
        if (criteria.incomeCount && incomes.length < criteria.incomeCount) return false;
        break;
        
      case 'savings':
        // Check savings-related criteria
        const savingsGoals = await this.getGoalsByType('savings');
        const userSavingsGoals = savingsGoals.filter(goal => goal.userId === userId);
        const criteria2 = achievement.criteria as { goalCount?: number, goalCompletion?: number };
        
        if (criteria2.goalCount && userSavingsGoals.length < criteria2.goalCount) return false;
        if (criteria2.goalCompletion) {
          const completedGoals = userSavingsGoals.filter(goal => goal.isCompleted).length;
          if ((completedGoals / userSavingsGoals.length) < criteria2.goalCompletion) return false;
        }
        break;
        
      case 'streak':
        // Check streak-related criteria
        const profile = await this.getGamificationProfile(userId);
        if (!profile) return false;
        
        const criteria3 = achievement.criteria as { minStreak?: number };
        if (criteria3.minStreak && profile.streak < criteria3.minStreak) return false;
        break;
        
      // Add more criteria checks for other categories
    }
    
    return true;
  }

  async awardAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined> {
    // Check eligibility
    const isEligible = await this.checkAchievementEligibility(userId, achievementId);
    if (!isEligible) return undefined;
    
    // Get achievement details
    const achievement = await this.getAchievementById(achievementId);
    if (!achievement) return undefined;
    
    // Award the achievement
    const userAchievement = await this.createUserAchievement({
      userId,
      achievementId
    });
    
    // Award points
    await this.addPointsToUser(
      userId, 
      achievement.pointsValue, 
      `Earned achievement: ${achievement.name}`,
      'achievement',
      achievement.id
    );
    
    return userAchievement;
  }

  // Gamification Profile methods
  async getGamificationProfile(userId: number): Promise<GamificationProfile | undefined> {
    return Array.from(this.gamificationProfiles.values())
      .find(profile => profile.userId === userId);
  }

  async createGamificationProfile(profile: InsertGamificationProfile): Promise<GamificationProfile> {
    const id = this.gamificationProfileCurrentId++;
    const now = new Date();
    
    const newProfile: GamificationProfile = {
      id,
      userId: profile.userId,
      points: profile.points || 0,
      level: profile.level || 1,
      streak: profile.streak || 0,
      lastActive: profile.lastActive || now,
      totalPointsEarned: profile.totalPointsEarned || 0,
      milestones: profile.milestones || [],
      achievements: profile.achievements || {},
      updatedAt: now
    };
    
    this.gamificationProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateGamificationProfile(userId: number, profileUpdate: Partial<InsertGamificationProfile>): Promise<GamificationProfile | undefined> {
    let profile = await this.getGamificationProfile(userId);
    
    if (!profile) {
      // Create new profile if it doesn't exist
      profile = await this.createGamificationProfile({
        userId,
        points: profileUpdate.points || 0,
        level: profileUpdate.level || 1,
        streak: profileUpdate.streak || 0,
        lastActive: profileUpdate.lastActive || new Date(),
        totalPointsEarned: profileUpdate.totalPointsEarned || 0,
        milestones: profileUpdate.milestones || [],
        achievements: profileUpdate.achievements || {}
      });
      return profile;
    }
    
    const updatedProfile: GamificationProfile = {
      ...profile,
      ...profileUpdate,
      updatedAt: new Date()
    };
    
    this.gamificationProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  async incrementUserStreak(userId: number): Promise<GamificationProfile | undefined> {
    let profile = await this.getGamificationProfile(userId);
    
    if (!profile) {
      profile = await this.createGamificationProfile({
        userId,
        streak: 1,
        lastActive: new Date(),
        points: 0,
        level: 1,
        totalPointsEarned: 0,
        milestones: [],
        achievements: {}
      });
      return profile;
    }
    
    // Increment streak and update last active date
    const updatedProfile = await this.updateGamificationProfile(userId, {
      streak: profile.streak + 1,
      lastActive: new Date()
    });
    
    return updatedProfile;
  }

  async resetUserStreak(userId: number): Promise<GamificationProfile | undefined> {
    const profile = await this.getGamificationProfile(userId);
    if (!profile) return undefined;
    
    // Reset streak to 0 and update last active date
    const updatedProfile = await this.updateGamificationProfile(userId, {
      streak: 0,
      lastActive: new Date()
    });
    
    return updatedProfile;
  }

  async addPointsToUser(userId: number, points: number, reason: string, source: string, sourceId?: number): Promise<GamificationProfile | undefined> {
    // Get or create user profile
    let profile = await this.getGamificationProfile(userId);
    
    if (!profile) {
      profile = await this.createGamificationProfile({
        userId,
        points: 0,
        level: 1,
        streak: 0,
        lastActive: new Date(),
        totalPointsEarned: 0,
        milestones: [],
        achievements: {}
      });
    }
    
    // Create point transaction
    await this.createPointTransaction({
      userId,
      amount: points,
      reason,
      source,
      sourceId
    });
    
    // Update profile with new points
    const updatedProfile = await this.updateGamificationProfile(userId, {
      points: profile.points + points,
      totalPointsEarned: profile.totalPointsEarned + (points > 0 ? points : 0)
    });
    
    // Check if user should level up
    return this.checkAndUpdateUserLevel(userId);
  }

  async checkAndUpdateUserLevel(userId: number): Promise<GamificationProfile | undefined> {
    const profile = await this.getGamificationProfile(userId);
    if (!profile) return undefined;
    
    // Level up algorithm: level = sqrt(points/100) + 1
    const calculatedLevel = Math.floor(Math.sqrt(profile.points / 100)) + 1;
    
    if (calculatedLevel > profile.level) {
      // Level up!
      const updatedProfile = await this.updateGamificationProfile(userId, {
        level: calculatedLevel
      });
      
      // Add level-up record to point transactions
      await this.createPointTransaction({
        userId,
        amount: 0, // No points awarded for leveling up
        reason: `Reached level ${calculatedLevel}`,
        source: 'level_up'
      });
      
      return updatedProfile;
    }
    
    return profile;
  }

  // Point Transaction methods
  async getPointTransactions(userId: number): Promise<PointTransaction[]> {
    return Array.from(this.pointTransactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }

  async getPointTransactionById(id: number): Promise<PointTransaction | undefined> {
    return this.pointTransactions.get(id);
  }

  async createPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction> {
    const id = this.pointTransactionCurrentId++;
    const transactionDate = new Date();
    
    const newTransaction: PointTransaction = {
      id,
      userId: transaction.userId,
      amount: transaction.amount,
      reason: transaction.reason,
      source: transaction.source,
      sourceId: transaction.sourceId || null,
      transactionDate
    };
    
    this.pointTransactions.set(id, newTransaction);
    return newTransaction;
  }

  async getRecentPointTransactions(userId: number, limit: number): Promise<PointTransaction[]> {
    return (await this.getPointTransactions(userId)).slice(0, limit);
  }
}

// Import database storage
import { dbStorage } from './db-storage';

// Export the database storage implementation instead of memory storage
export const storage = dbStorage;
