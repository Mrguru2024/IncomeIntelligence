import { users, type User, type InsertUser, incomes, type Income, type InsertIncome, goals, type Goal, type InsertGoal, 
  bankConnections, type BankConnection, type InsertBankConnection, 
  bankAccounts, type BankAccount, type InsertBankAccount,
  bankTransactions, type BankTransaction, type InsertBankTransaction,
  expenses, type Expense, type InsertExpense,
  balances, type Balance, type InsertBalance,
  achievements, type Achievement, type InsertAchievement,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  gamificationProfiles, type GamificationProfile, type InsertGamificationProfile,
  pointTransactions, type PointTransaction, type InsertPointTransaction,
  userProfiles, type UserProfile, type InsertUserProfile,
  reminders, type Reminder, type InsertReminder,
  widgetSettings, type WidgetSettings, type InsertWidgetSettings,
  notifications, type Notification, type InsertNotification,
  spendingPersonalityQuestions, type SpendingPersonalityQuestion, type InsertSpendingPersonalityQuestion,
  spendingPersonalityResults, type SpendingPersonalityResult, type InsertSpendingPersonalityResult,
  budgets, type Budget, type InsertBudget,
  professionalServices, type ProfessionalService, type InsertProfessionalService
 } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  getUserByStripeSubscriptionId(subscriptionId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  verifyUser(id: number): Promise<User | undefined>;
  setPasswordReset(id: number, token: string, expires: Date): Promise<User | undefined>;
  resetPassword(id: number, newPassword: string): Promise<User | undefined>;
  
  // Subscription methods
  updateUserSubscription(userId: number, tier: string, active: boolean, startDate?: Date, endDate?: Date): Promise<User | undefined>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined>;
  updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: number, stripeInfo: { 
    customerId: string, 
    subscriptionId: string 
  }): Promise<User | undefined>;
  
  // User Profile methods
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  deleteUserProfile(userId: number): Promise<boolean>;
  markProfileCompleted(userId: number): Promise<User | undefined>;
  
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
  
  // Reminder methods
  getReminders(userId: number): Promise<Reminder[]>;
  getReminderById(id: number): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;
  getActiveReminders(userId: number): Promise<Reminder[]>;
  getDueReminders(userId: number): Promise<Reminder[]>;
  markReminderSent(id: number): Promise<Reminder | undefined>;
  updateReminderNextDate(id: number, nextDate: Date): Promise<Reminder | undefined>;
  
  // Widget methods
  getWidgetSettings(userId: number): Promise<WidgetSettings | undefined>;
  createWidgetSettings(settings: InsertWidgetSettings): Promise<WidgetSettings>;
  updateWidgetSettings(userId: number, settings: Partial<InsertWidgetSettings>): Promise<WidgetSettings | undefined>;
  toggleWidgetEnabled(userId: number, enabled: boolean): Promise<WidgetSettings | undefined>;
  
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
  
  // Notification methods
  getNotifications(userId: number): Promise<Notification[]>;
  getNotificationById(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, notification: Partial<InsertNotification>): Promise<Notification | undefined>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  
  // Spending Personality Quiz methods
  getSpendingPersonalityQuestions(): Promise<SpendingPersonalityQuestion[]>;
  getActiveSpendingPersonalityQuestions(): Promise<SpendingPersonalityQuestion[]>;
  getSpendingPersonalityQuestionById(id: number): Promise<SpendingPersonalityQuestion | undefined>;
  createSpendingPersonalityQuestion(question: InsertSpendingPersonalityQuestion): Promise<SpendingPersonalityQuestion>;
  updateSpendingPersonalityQuestion(id: number, question: Partial<InsertSpendingPersonalityQuestion>): Promise<SpendingPersonalityQuestion | undefined>;
  deleteSpendingPersonalityQuestion(id: number): Promise<boolean>;
  
  // Spending Personality Results methods
  getSpendingPersonalityResults(userId: number): Promise<SpendingPersonalityResult[]>;
  getSpendingPersonalityResultById(id: number): Promise<SpendingPersonalityResult | undefined>;
  createSpendingPersonalityResult(result: InsertSpendingPersonalityResult): Promise<SpendingPersonalityResult>;
  getLatestSpendingPersonalityResult(userId: number): Promise<SpendingPersonalityResult | undefined>;
  
  // Budget methods
  getBudgets(): Promise<Budget[]>;
  getBudgetById(id: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
  getBudgetsByUserId(userId: number): Promise<Budget[]>;
  getBudgetsByYearMonth(userId: number, year: number, month: number): Promise<Budget[]>;
  
  // Professional Services methods
  getProfessionalServices(): Promise<ProfessionalService[]>;
  getProfessionalServiceById(id: number): Promise<ProfessionalService | undefined>;
  createProfessionalService(service: InsertProfessionalService): Promise<ProfessionalService>;
  updateProfessionalService(id: number, service: Partial<InsertProfessionalService>): Promise<ProfessionalService | undefined>;
  deleteProfessionalService(id: number): Promise<boolean>;
  getProfessionalServicesByUserId(userId: number): Promise<ProfessionalService[]>;
  getProfessionalServicesByCategory(category: string): Promise<ProfessionalService[]>;
  toggleProfessionalServiceActive(id: number, isActive: boolean): Promise<ProfessionalService | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userProfiles: Map<number, UserProfile>;
  private incomes: Map<number, Income>;
  private goals: Map<number, Goal>;
  private bankConnections: Map<number, BankConnection>;
  private bankAccounts: Map<number, BankAccount>;
  private bankTransactions: Map<number, BankTransaction>;
  private expenses: Map<number, Expense>;
  private balances: Map<number, Balance>;
  private reminders: Map<number, Reminder>;
  private widgetSettings: Map<number, WidgetSettings>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private gamificationProfiles: Map<number, GamificationProfile>;
  private pointTransactions: Map<number, PointTransaction>;
  private notifications: Map<number, Notification>;
  private spendingPersonalityQuestions: Map<number, SpendingPersonalityQuestion>;
  private spendingPersonalityResults: Map<number, SpendingPersonalityResult>;
  private budgets: Map<number, Budget>;
  private professionalServices: Map<number, ProfessionalService>;
  
  private userCurrentId: number;
  private userProfileCurrentId: number;
  private incomeCurrentId: number;
  private goalCurrentId: number;
  private bankConnectionCurrentId: number;
  private bankAccountCurrentId: number;
  private bankTransactionCurrentId: number;
  private expenseCurrentId: number;
  private balanceCurrentId: number;
  private reminderCurrentId: number;
  private widgetSettingsCurrentId: number;
  private achievementCurrentId: number;
  private userAchievementCurrentId: number;
  private gamificationProfileCurrentId: number;
  private pointTransactionCurrentId: number;
  private notificationCurrentId: number;
  private spendingPersonalityQuestionCurrentId: number;
  private spendingPersonalityResultCurrentId: number;
  private budgetCurrentId: number;
  private professionalServiceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.incomes = new Map();
    this.goals = new Map();
    this.bankConnections = new Map();
    this.bankAccounts = new Map();
    this.bankTransactions = new Map();
    this.expenses = new Map();
    this.balances = new Map();
    this.reminders = new Map();
    this.widgetSettings = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.gamificationProfiles = new Map();
    this.pointTransactions = new Map();
    this.notifications = new Map();
    this.spendingPersonalityQuestions = new Map();
    this.spendingPersonalityResults = new Map();
    this.budgets = new Map();
    this.professionalServices = new Map();
    
    this.userCurrentId = 1;
    this.userProfileCurrentId = 1;
    this.incomeCurrentId = 1;
    this.goalCurrentId = 1;
    this.bankConnectionCurrentId = 1;
    this.bankAccountCurrentId = 1;
    this.bankTransactionCurrentId = 1;
    this.expenseCurrentId = 1;
    this.balanceCurrentId = 1;
    this.reminderCurrentId = 1;
    this.widgetSettingsCurrentId = 1;
    this.achievementCurrentId = 1;
    this.userAchievementCurrentId = 1;
    this.gamificationProfileCurrentId = 1;
    this.pointTransactionCurrentId = 1;
    this.notificationCurrentId = 1;
    this.spendingPersonalityQuestionCurrentId = 1;
    this.spendingPersonalityResultCurrentId = 1;
    this.budgetCurrentId = 1;
    this.professionalServiceCurrentId = 1;
    
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
    
    // Set up initial reminders
    const initialDate = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(initialDate.getDate() + 7);
    
    const nextBiweek = new Date();
    nextBiweek.setDate(initialDate.getDate() + 14);
    
    const nextMonth = new Date();
    nextMonth.setMonth(initialDate.getMonth() + 1);
    
    const reminders: InsertReminder[] = [
      {
        userId: 1,
        title: "Review monthly expenses",
        message: "Take time to categorize and review your expenses for the month",
        type: "expense",
        frequency: "monthly",
        nextRemindAt: nextMonth,
        isActive: true
      },
      {
        userId: 1,
        title: "Update 40/30/30 split",
        message: "Check if your income allocations are on track and make adjustments if needed",
        type: "budget",
        frequency: "biweekly",
        nextRemindAt: nextBiweek,
        isActive: true
      },
      {
        userId: 1,
        title: "Emergency fund check",
        message: "Verify your emergency fund is still at target level",
        type: "savings",
        frequency: "monthly",
        nextRemindAt: nextMonth,
        isActive: true
      },
      {
        userId: 1,
        title: "Weekly income entry",
        message: "Don't forget to log your service calls for the week",
        type: "income",
        frequency: "weekly",
        nextRemindAt: nextWeek,
        isActive: true
      }
    ];
    
    reminders.forEach(reminder => {
      const id = this.reminderCurrentId++;
      const now = new Date();
      
      const newReminder: Reminder = {
        id,
        userId: reminder.userId,
        title: reminder.title,
        message: reminder.message,
        type: reminder.type || "custom",
        frequency: reminder.frequency,
        nextRemindAt: reminder.nextRemindAt,
        lastSentAt: null,
        isActive: reminder.isActive !== undefined ? reminder.isActive : true,
        createdAt: now,
        updatedAt: now,
        metadata: reminder.metadata || null
      };
      
      this.reminders.set(id, newReminder);
    });
    
    // Set up initial widget settings
    const widgetSettingsData: InsertWidgetSettings = {
      userId: 1,
      enabled: true,
      showBalance: true,
      showIncomeGoal: true, 
      showNextReminder: true,
      position: "bottom-right",
      size: "medium",
      theme: "auto"
    };
    
    const widgetSettingsId = this.widgetSettingsCurrentId++;
    const widgetSettingsNow = new Date();
    
    const widgetSetting: WidgetSettings = {
      id: widgetSettingsId,
      userId: widgetSettingsData.userId,
      enabled: widgetSettingsData.enabled !== undefined ? widgetSettingsData.enabled : true,
      showBalance: widgetSettingsData.showBalance !== undefined ? widgetSettingsData.showBalance : true,
      showIncomeGoal: widgetSettingsData.showIncomeGoal !== undefined ? widgetSettingsData.showIncomeGoal : true, 
      showNextReminder: widgetSettingsData.showNextReminder !== undefined ? widgetSettingsData.showNextReminder : true,
      position: widgetSettingsData.position || "bottom-right",
      size: widgetSettingsData.size || "medium",
      theme: widgetSettingsData.theme || "auto",
      updatedAt: widgetSettingsNow,
      customSettings: null
    };
    
    this.widgetSettings.set(widgetSettingsId, widgetSetting);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token,
    );
  }
  
  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetPasswordToken === token && 
        user.resetPasswordExpires && 
        new Date(user.resetPasswordExpires) > new Date()
    );
  }
  
  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.stripeCustomerId === customerId
    );
  }
  
  async getUserByStripeSubscriptionId(subscriptionId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.stripeSubscriptionId === subscriptionId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      phone: insertUser.phone || null,
      createdAt: now,
      lastLogin: null,
      profileCompleted: false,
      onboardingCompleted: false,
      onboardingStep: "welcome",
      verified: false,
      verificationToken: insertUser.verificationToken || null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      provider: insertUser.provider || 'local',
      providerId: insertUser.providerId || null,
      firebaseUid: insertUser.firebaseUid || null,
      profileImage: insertUser.profileImage || null,
      role: insertUser.role || 'user',
      accountStatus: insertUser.accountStatus || 'pending',
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      twoFactorVerified: false,
      // Subscription fields
      subscriptionTier: 'free',
      subscriptionActive: false,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = {
      ...existingUser,
      ...user
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = {
      ...existingUser,
      lastLogin: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async verifyUser(id: number): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = {
      ...existingUser,
      verified: true,
      verificationToken: null,
      accountStatus: 'active'
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async setPasswordReset(id: number, token: string, expires: Date): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = {
      ...existingUser,
      resetPasswordToken: token,
      resetPasswordExpires: expires
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async resetPassword(id: number, newPassword: string): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = {
      ...existingUser,
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Subscription methods
  async updateUserSubscription(userId: number, tier: string, active: boolean, startDate?: Date, endDate?: Date): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      subscriptionTier: tier,
      subscriptionActive: active,
      subscriptionStartDate: startDate || null,
      subscriptionEndDate: endDate || null,
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId: customerId
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      stripeSubscriptionId: subscriptionId
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId: stripeInfo.customerId,
      stripeSubscriptionId: stripeInfo.subscriptionId
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // User Profile methods
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values())
      .find(profile => profile.userId === userId);
  }
  
  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const id = this.userProfileCurrentId++;
    const now = new Date();
    
    const userProfile: UserProfile = {
      id,
      userId: profile.userId,
      occupation: profile.occupation || null,
      occupationDetails: profile.occupationDetails || null,
      businessName: profile.businessName || null,
      yearsInBusiness: profile.yearsInBusiness || null,
      averageMonthlyIncome: profile.averageMonthlyIncome || null,
      financialGoals: profile.financialGoals || null,
      lifeGoals: profile.lifeGoals || null,
      financialHealthStatus: profile.financialHealthStatus || null,
      riskTolerance: profile.riskTolerance || null,
      isSoleProvider: profile.isSoleProvider || null,
      hasEmergencyFund: profile.hasEmergencyFund || null,
      emergencyFundAmount: profile.emergencyFundAmount || null,
      preferredContactMethod: profile.preferredContactMethod || null,
      widgetEnabled: profile.widgetEnabled !== undefined ? profile.widgetEnabled : false,
      remindersEnabled: profile.remindersEnabled !== undefined ? profile.remindersEnabled : true,
      notificationsEmail: profile.notificationsEmail !== undefined ? profile.notificationsEmail : true,
      notificationsPush: profile.notificationsPush !== undefined ? profile.notificationsPush : true,
      updatedAt: now
    };
    
    this.userProfiles.set(id, userProfile);
    
    // Also create default widget settings
    this.createWidgetSettings({
      userId: profile.userId,
      enabled: userProfile.widgetEnabled,
      showBalance: true,
      showIncomeGoal: true,
      showNextReminder: true,
      position: "bottom-right",
      size: "medium",
      theme: "auto"
    });
    
    return userProfile;
  }
  
  async updateUserProfile(userId: number, updatedProfile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const profile = Array.from(this.userProfiles.values())
      .find(profile => profile.userId === userId);
      
    if (!profile) return undefined;
    
    const updated: UserProfile = {
      ...profile,
      ...updatedProfile,
      updatedAt: new Date()
    };
    
    this.userProfiles.set(profile.id, updated);
    return updated;
  }
  
  async deleteUserProfile(userId: number): Promise<boolean> {
    const profile = Array.from(this.userProfiles.values())
      .find(profile => profile.userId === userId);
      
    if (!profile) return false;
    return this.userProfiles.delete(profile.id);
  }
  
  async markProfileCompleted(userId: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      profileCompleted: true
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
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
  
  // Reminder methods
  async getReminders(userId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values())
      .filter(reminder => reminder.userId === userId)
      .sort((a, b) => new Date(a.nextRemindAt).getTime() - new Date(b.nextRemindAt).getTime());
  }
  
  async getReminderById(id: number): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }
  
  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const id = this.reminderCurrentId++;
    const now = new Date();
    
    const nextRemindAt = reminder.nextRemindAt instanceof Date 
      ? reminder.nextRemindAt 
      : new Date(reminder.nextRemindAt);
    
    const newReminder: Reminder = {
      id,
      userId: reminder.userId,
      title: reminder.title,
      message: reminder.message,
      type: reminder.type || "custom",
      frequency: reminder.frequency,
      nextRemindAt: nextRemindAt,
      lastSentAt: null,
      isActive: reminder.isActive !== undefined ? reminder.isActive : true,
      createdAt: now,
      updatedAt: now,
      metadata: reminder.metadata || null
    };
    
    this.reminders.set(id, newReminder);
    return newReminder;
  }
  
  async updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const existingReminder = this.reminders.get(id);
    if (!existingReminder) return undefined;
    
    let nextRemindAt = existingReminder.nextRemindAt;
    if (reminder.nextRemindAt) {
      nextRemindAt = reminder.nextRemindAt instanceof Date 
        ? reminder.nextRemindAt 
        : new Date(reminder.nextRemindAt);
    }
    
    const updatedReminder: Reminder = {
      ...existingReminder,
      ...reminder,
      nextRemindAt,
      updatedAt: new Date()
    };
    
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }
  
  async deleteReminder(id: number): Promise<boolean> {
    return this.reminders.delete(id);
  }
  
  async getActiveReminders(userId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values())
      .filter(reminder => reminder.userId === userId && reminder.isActive)
      .sort((a, b) => new Date(a.nextRemindAt).getTime() - new Date(b.nextRemindAt).getTime());
  }
  
  async getDueReminders(userId: number): Promise<Reminder[]> {
    const now = new Date();
    return Array.from(this.reminders.values())
      .filter(reminder => 
        reminder.userId === userId && 
        reminder.isActive && 
        new Date(reminder.nextRemindAt) <= now
      )
      .sort((a, b) => new Date(a.nextRemindAt).getTime() - new Date(b.nextRemindAt).getTime());
  }
  
  async markReminderSent(id: number): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const now = new Date();
    let nextRemindAt = new Date(now);
    
    // Calculate next remind date based on frequency
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
      default:
        nextRemindAt.setDate(nextRemindAt.getDate() + 1);
    }
    
    const updatedReminder: Reminder = {
      ...reminder,
      lastSentAt: now,
      nextRemindAt,
      updatedAt: now
    };
    
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }
  
  async updateReminderNextDate(id: number, nextDate: Date): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder: Reminder = {
      ...reminder,
      nextRemindAt: nextDate,
      updatedAt: new Date()
    };
    
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }
  
  // Widget methods
  async getWidgetSettings(userId: number): Promise<WidgetSettings | undefined> {
    return Array.from(this.widgetSettings.values())
      .find(settings => settings.userId === userId);
  }
  
  async createWidgetSettings(settings: InsertWidgetSettings): Promise<WidgetSettings> {
    const id = this.widgetSettingsCurrentId++;
    const now = new Date();
    
    const widgetSetting: WidgetSettings = {
      id,
      userId: settings.userId,
      enabled: settings.enabled !== undefined ? settings.enabled : true,
      showBalance: settings.showBalance !== undefined ? settings.showBalance : true,
      showIncomeGoal: settings.showIncomeGoal !== undefined ? settings.showIncomeGoal : true,
      showNextReminder: settings.showNextReminder !== undefined ? settings.showNextReminder : true,
      position: settings.position || "bottom-right",
      size: settings.size || "medium",
      theme: settings.theme || "auto",
      updatedAt: now,
      customSettings: settings.customSettings || null
    };
    
    this.widgetSettings.set(id, widgetSetting);
    return widgetSetting;
  }
  
  async updateWidgetSettings(userId: number, settings: Partial<InsertWidgetSettings>): Promise<WidgetSettings | undefined> {
    const existingSettings = Array.from(this.widgetSettings.values())
      .find(setting => setting.userId === userId);
      
    if (!existingSettings) return undefined;
    
    const updatedSettings: WidgetSettings = {
      ...existingSettings,
      ...settings,
      updatedAt: new Date()
    };
    
    this.widgetSettings.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }
  
  async toggleWidgetEnabled(userId: number, enabled: boolean): Promise<WidgetSettings | undefined> {
    const settings = Array.from(this.widgetSettings.values())
      .find(setting => setting.userId === userId);
      
    if (!settings) return undefined;
    
    const updatedSettings: WidgetSettings = {
      ...settings,
      enabled,
      updatedAt: new Date()
    };
    
    this.widgetSettings.set(settings.id, updatedSettings);
    return updatedSettings;
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
  
  // Notification methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getNotificationById(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationCurrentId++;
    const now = new Date();
    
    const newNotification: Notification = {
      id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      isRead: notification.isRead || false,
      createdAt: now,
      metadata: notification.metadata || null
    };
    
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  
  async updateNotification(id: number, notification: Partial<InsertNotification>): Promise<Notification | undefined> {
    const existingNotification = this.notifications.get(id);
    if (!existingNotification) return undefined;
    
    const updatedNotification: Notification = {
      ...existingNotification,
      ...notification
    };
    
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const existingNotification = this.notifications.get(id);
    if (!existingNotification) return undefined;
    
    const updatedNotification: Notification = {
      ...existingNotification,
      isRead: true
    };
    
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId);
      
    if (userNotifications.length === 0) return false;
    
    userNotifications.forEach(notification => {
      this.notifications.set(notification.id, {
        ...notification,
        isRead: true
      });
    });
    
    return true;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }
  
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  // Spending Personality Quiz Methods
  async getSpendingPersonalityQuestions(): Promise<SpendingPersonalityQuestion[]> {
    return Array.from(this.spendingPersonalityQuestions.values());
  }
  
  async getActiveSpendingPersonalityQuestions(): Promise<SpendingPersonalityQuestion[]> {
    return Array.from(this.spendingPersonalityQuestions.values())
      .filter(q => q.active);
  }
  
  async getSpendingPersonalityQuestionById(id: number): Promise<SpendingPersonalityQuestion | undefined> {
    return this.spendingPersonalityQuestions.get(id);
  }
  
  async createSpendingPersonalityQuestion(question: InsertSpendingPersonalityQuestion): Promise<SpendingPersonalityQuestion> {
    const id = this.spendingPersonalityQuestionCurrentId++;
    const now = new Date();
    
    const newQuestion: SpendingPersonalityQuestion = {
      id,
      questionText: question.questionText,
      options: question.options,
      category: question.category,
      weight: question.weight || 1,
      active: question.active !== undefined ? question.active : true,
      createdAt: now
    };
    
    this.spendingPersonalityQuestions.set(id, newQuestion);
    return newQuestion;
  }
  
  async updateSpendingPersonalityQuestion(id: number, question: Partial<InsertSpendingPersonalityQuestion>): Promise<SpendingPersonalityQuestion | undefined> {
    const existingQuestion = this.spendingPersonalityQuestions.get(id);
    if (!existingQuestion) return undefined;
    
    const updatedQuestion: SpendingPersonalityQuestion = {
      ...existingQuestion,
      ...question
    };
    
    this.spendingPersonalityQuestions.set(id, updatedQuestion);
    return updatedQuestion;
  }
  
  async deleteSpendingPersonalityQuestion(id: number): Promise<boolean> {
    if (!this.spendingPersonalityQuestions.has(id)) return false;
    return this.spendingPersonalityQuestions.delete(id);
  }
  
  // Spending Personality Result methods
  async getSpendingPersonalityResults(userId: number): Promise<SpendingPersonalityResult[]> {
    return Array.from(this.spendingPersonalityResults.values())
      .filter(result => result.userId === userId)
      .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()); // Most recent first
  }
  
  async getSpendingPersonalityResultById(id: number): Promise<SpendingPersonalityResult | undefined> {
    return this.spendingPersonalityResults.get(id);
  }
  
  async createSpendingPersonalityResult(result: InsertSpendingPersonalityResult): Promise<SpendingPersonalityResult> {
    const id = this.spendingPersonalityResultCurrentId++;
    const now = new Date();
    
    const newResult: SpendingPersonalityResult = {
      id,
      userId: result.userId,
      personalityType: result.personalityType,
      score: result.score,
      answers: result.answers,
      takenAt: now,
      recommendations: result.recommendations || null
    };
    
    this.spendingPersonalityResults.set(id, newResult);
    return newResult;
  }
  
  async getLatestSpendingPersonalityResult(userId: number): Promise<SpendingPersonalityResult | undefined> {
    const userResults = await this.getSpendingPersonalityResults(userId);
    if (userResults.length === 0) return undefined;
    
    return userResults[0]; // Already sorted by takenAt desc
  }

  // Budget methods
  async getBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }

  async getBudgetById(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const id = this.budgetCurrentId++;
    const now = new Date();
    
    const newBudget: Budget = {
      id,
      userId: budget.userId,
      year: budget.year,
      month: budget.month,
      needsPercentage: budget.needsPercentage || 40,
      wantsPercentage: budget.wantsPercentage || 30,
      savingsPercentage: budget.savingsPercentage || 30,
      needsCategories: Array.isArray(budget.needsCategories) ? budget.needsCategories : [],
      wantsCategories: Array.isArray(budget.wantsCategories) ? budget.wantsCategories : [],
      savingsCategories: Array.isArray(budget.savingsCategories) ? budget.savingsCategories : [],
      rules: Array.isArray(budget.rules) ? budget.rules : [],
      monthlyIncome: budget.monthlyIncome || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.budgets.set(id, newBudget);
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existingBudget = this.budgets.get(id);
    if (!existingBudget) return undefined;
    
    const updatedBudget: Budget = {
      ...existingBudget,
      ...(budget.userId !== undefined ? { userId: budget.userId } : {}),
      ...(budget.year !== undefined ? { year: budget.year } : {}),
      ...(budget.month !== undefined ? { month: budget.month } : {}),
      ...(budget.needsPercentage !== undefined ? { needsPercentage: budget.needsPercentage } : {}),
      ...(budget.wantsPercentage !== undefined ? { wantsPercentage: budget.wantsPercentage } : {}),
      ...(budget.savingsPercentage !== undefined ? { savingsPercentage: budget.savingsPercentage } : {}),
      ...(budget.needsCategories !== undefined ? { needsCategories: Array.isArray(budget.needsCategories) ? budget.needsCategories : [] } : {}),
      ...(budget.wantsCategories !== undefined ? { wantsCategories: Array.isArray(budget.wantsCategories) ? budget.wantsCategories : [] } : {}),
      ...(budget.savingsCategories !== undefined ? { savingsCategories: Array.isArray(budget.savingsCategories) ? budget.savingsCategories : [] } : {}),
      ...(budget.rules !== undefined ? { rules: Array.isArray(budget.rules) ? budget.rules : [] } : {}),
      ...(budget.monthlyIncome !== undefined ? { monthlyIncome: budget.monthlyIncome } : {}),
      updatedAt: new Date()
    };
    
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }

  async getBudgetsByUserId(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values())
      .filter(budget => budget.userId === userId);
  }

  async getBudgetsByYearMonth(userId: number, year: number, month: number): Promise<Budget[]> {
    return Array.from(this.budgets.values())
      .filter(budget => budget.userId === userId && budget.year === year && budget.month === month);
  }

  // Professional Services methods
  async getProfessionalServices(): Promise<ProfessionalService[]> {
    return Array.from(this.professionalServices.values());
  }

  async getProfessionalServiceById(id: number): Promise<ProfessionalService | undefined> {
    return this.professionalServices.get(id);
  }

  async createProfessionalService(service: InsertProfessionalService): Promise<ProfessionalService> {
    const id = this.professionalServiceCurrentId++;
    const now = new Date();
    
    const newService: ProfessionalService = {
      id,
      userId: service.userId,
      name: service.name,
      description: service.description,
      category: service.category,
      pricing: service.pricing || null,
      location: service.location || null,
      availability: service.availability || null,
      createdAt: now,
      updatedAt: now,
      isActive: service.isActive !== undefined ? service.isActive : true,
      contactInfo: service.contactInfo || null,
      ratings: "0",
      reviewCount: 0,
      licenseInfo: service.licenseInfo || null,
      certifications: service.certifications || null,
      serviceArea: service.serviceArea || null,
      businessHours: service.businessHours || null
    };
    
    this.professionalServices.set(id, newService);
    return newService;
  }

  async updateProfessionalService(id: number, service: Partial<InsertProfessionalService>): Promise<ProfessionalService | undefined> {
    const existingService = this.professionalServices.get(id);
    if (!existingService) {
      return undefined;
    }
    
    const updatedService: ProfessionalService = {
      ...existingService,
      ...service,
      updatedAt: new Date()
    };
    
    this.professionalServices.set(id, updatedService);
    return updatedService;
  }

  async deleteProfessionalService(id: number): Promise<boolean> {
    return this.professionalServices.delete(id);
  }

  async getProfessionalServicesByUserId(userId: number): Promise<ProfessionalService[]> {
    return Array.from(this.professionalServices.values()).filter(
      service => service.userId === userId
    );
  }

  async getProfessionalServicesByCategory(category: string): Promise<ProfessionalService[]> {
    return Array.from(this.professionalServices.values()).filter(
      service => service.category === category
    );
  }

  async toggleProfessionalServiceActive(id: number, isActive: boolean): Promise<ProfessionalService | undefined> {
    const existingService = this.professionalServices.get(id);
    if (!existingService) {
      return undefined;
    }
    
    const updatedService: ProfessionalService = {
      ...existingService,
      isActive,
      updatedAt: new Date()
    };
    
    this.professionalServices.set(id, updatedService);
    return updatedService;
  }
}

// Import database storage
import { dbStorage } from './db-storage';

// Export the database storage implementation instead of memory storage
export const storage = dbStorage;
