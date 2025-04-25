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
  notifications, type Notification, type InsertNotification,
  reminders, type Reminder, type InsertReminder,
  widgetSettings, type WidgetSettings, type InsertWidgetSettings,
  userProfiles, type UserProfile, type InsertUserProfile,
  spendingPersonalityQuestions, type SpendingPersonalityQuestion, type InsertSpendingPersonalityQuestion,
  spendingPersonalityResults, type SpendingPersonalityResult, type InsertSpendingPersonalityResult,
  professionalServices, type ProfessionalService, type InsertProfessionalService,
  budgets, type Budget, type InsertBudget,
  stackrGigs, type StackrGig, type InsertStackrGig,
  affiliatePrograms, type AffiliateProgram, type InsertAffiliateProgram,
  userAffiliates, type UserAffiliate, type InsertUserAffiliate
} from "@shared/schema";
import { eq, sql, and, or, desc, asc } from 'drizzle-orm';
import { db } from './db';

// Define the storage interface
export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(identifier: string): Promise<User | undefined>;
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
  updateUserSubscription(userId: number, tier: string, active: boolean, startDate?: Date, endDate?: Date): Promise<User | undefined>;
  getUserSubscription(userId: number): Promise<{ status: string, plan: string } | null>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined>;
  updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined>;
  
  // Get comprehensive user data including spending limits
  getUserData(userId: number): Promise<{
    id: number;
    username: string;
    email: string;
    spendingLimits?: Array<{
      id: string;
      category: string;
      limit: number;
      period: 'weekly' | 'monthly';
    }>;
    subscription?: {
      status: string;
      plan: string;
    };
    profile?: UserProfile;
  } | undefined>;
  
  // User profile methods
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  
  // Spending limits methods
  addSpendingLimit(userId: number, limit: {
    id: string;
    category: string;
    limit: number;
    period: 'weekly' | 'monthly';
  }): Promise<boolean>;
  getSpendingLimits(userId: number): Promise<Array<{
    id: string;
    category: string;
    limit: number;
    period: 'weekly' | 'monthly';
  }>>;
  updateSpendingLimit(userId: number, limitId: string, updates: Partial<{
    category: string;
    limit: number;
    period: 'weekly' | 'monthly';
  }>): Promise<boolean>;
  deleteSpendingLimit(userId: number, limitId: string): Promise<boolean>;
  
  // Affiliate methods
  getAffiliatePrograms(): Promise<AffiliateProgram[]>;
  getAffiliateProgramById(id: number): Promise<AffiliateProgram | undefined>;
  getAffiliateProgramsByCategory(category: string): Promise<AffiliateProgram[]>;
  createAffiliateProgram(program: InsertAffiliateProgram): Promise<AffiliateProgram>;
  updateAffiliateProgram(id: number, program: Partial<InsertAffiliateProgram>): Promise<AffiliateProgram | undefined>;
  deleteAffiliateProgram(id: number): Promise<boolean>;
  getFeaturedAffiliatePrograms(): Promise<AffiliateProgram[]>;
  
  // User Affiliate methods
  getUserAffiliatePrograms(userId: number): Promise<UserAffiliate[]>;
  getUserAffiliateById(id: number): Promise<UserAffiliate | undefined>;
  joinAffiliateProgram(userAffiliate: InsertUserAffiliate): Promise<UserAffiliate>;
  updateUserAffiliate(id: number, userAffiliate: Partial<InsertUserAffiliate>): Promise<UserAffiliate | undefined>;
  leaveAffiliateProgram(userId: number, programId: number): Promise<boolean>;
  updateUserAffiliateEarnings(id: number, earnings: string): Promise<UserAffiliate | undefined>;
  getUserAffiliateProgramDetails(userId: number): Promise<Array<AffiliateProgram & { joined: boolean, joinedDate?: Date }>>;
  
  // Income methods
  getIncomes(userId: number): Promise<Income[]>;
  getIncomeById(id: number): Promise<Income | undefined>;
  createIncome(income: InsertIncome): Promise<Income>;
  updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined>;
  deleteIncome(id: number): Promise<boolean>;
  getIncomesByMonth(userId: number, year: number, month: number): Promise<Income[]>;
  getIncomesByCategory(userId: number, category: string): Promise<Income[]>;
  getIncomesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Income[]>;
  getIncomeYears(userId: number): Promise<number[]>;
  getTotalIncomeByMonth(userId: number, year: number, month: number): Promise<string>;
  getIncomeStats(userId: number): Promise<any>;
  getIncomeDistribution(userId: number, period?: string): Promise<any>;
  
  // Goal methods
  getGoals(userId: number): Promise<Goal[]>;
  getActiveGoals(userId: number): Promise<Goal[]>;
  getGoalById(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  completeGoal(id: number): Promise<Goal | undefined>;
  
  // Bank connection methods
  getBankConnections(userId: number): Promise<BankConnection[]>;
  getBankConnectionById(id: number): Promise<BankConnection | undefined>;
  getBankConnectionByPlaidId(plaidId: string): Promise<BankConnection | undefined>;
  createBankConnection(connection: InsertBankConnection): Promise<BankConnection>;
  updateBankConnection(id: number, connection: Partial<InsertBankConnection>): Promise<BankConnection | undefined>;
  deleteBankConnection(id: number): Promise<boolean>;
  
  // Bank account methods
  getBankAccounts(userId: number): Promise<BankAccount[]>;
  getBankAccountsByConnectionId(connectionId: number): Promise<BankAccount[]>;
  getBankAccountById(id: number): Promise<BankAccount | undefined>;
  getBankAccountByPlaidId(plaidId: string): Promise<BankAccount | undefined>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined>;
  deleteBankAccount(id: number): Promise<boolean>;
  
  // Bank transaction methods
  getBankTransactions(userId: number, limit?: number, offset?: number): Promise<BankTransaction[]>;
  getBankTransactionsByAccountId(accountId: number): Promise<BankTransaction[]>;
  getBankTransactionById(id: number): Promise<BankTransaction | undefined>;
  getBankTransactionByPlaidId(plaidId: string): Promise<BankTransaction | undefined>;
  createBankTransaction(transaction: InsertBankTransaction): Promise<BankTransaction>;
  updateBankTransaction(id: number, transaction: Partial<InsertBankTransaction>): Promise<BankTransaction | undefined>;
  deleteBankTransaction(id: number): Promise<boolean>;
  getBankTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<BankTransaction[]>;
  
  // Expense methods
  getExpenses(userId: number): Promise<Expense[]>;
  getExpenseById(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  getExpensesByMonth(userId: number, year: number, month: number): Promise<Expense[]>;
  getExpensesByCategory(userId: number, category: string): Promise<Expense[]>;
  getExpensesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Expense[]>;
  getExpenseYears(userId: number): Promise<number[]>;
  getTotalExpenseByMonth(userId: number, year: number, month: number): Promise<string>;
  getExpenseStats(userId: number): Promise<any>;
  getExpenseDistribution(userId: number, period?: string): Promise<any>;
  
  // Balance methods
  getBalance(userId: number, year: number, month: number): Promise<Balance | undefined>;
  updateBalance(id: number, balance: Partial<InsertBalance>): Promise<Balance | undefined>;
  createBalance(balance: InsertBalance): Promise<Balance>;
  getBalanceHistory(userId: number): Promise<Balance[]>;
  getCurrentBalance(userId: number): Promise<Balance | undefined>;
  
  // Reminders
  getReminders(userId: number): Promise<Reminder[]>;
  getReminderById(id: number): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;
  updateReminderStatus(id: number, isActive: boolean): Promise<Reminder | undefined>;
  getDueReminders(userId: number): Promise<Reminder[]>;
  markReminderSent(id: number): Promise<Reminder | undefined>;
  
  // Widget settings
  getWidgetSettings(userId: number): Promise<WidgetSettings | undefined>;
  createWidgetSettings(settings: InsertWidgetSettings): Promise<WidgetSettings>;
  updateWidgetSettings(userId: number, settings: Partial<InsertWidgetSettings>): Promise<WidgetSettings | undefined>;
  
  // Achievement methods
  getAchievements(): Promise<Achievement[]>;
  getAchievementById(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // User achievement methods
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  getUserAchievementById(id: number): Promise<UserAchievement | undefined>;
  awardAchievement(userId: number, achievementId: number): Promise<UserAchievement>;
  checkAndAwardAchievements(userId: number): Promise<UserAchievement[]>;
  
  // Gamification profile methods
  getGamificationProfile(userId: number): Promise<GamificationProfile | undefined>;
  createGamificationProfile(profile: InsertGamificationProfile): Promise<GamificationProfile>;
  updateGamificationProfile(userId: number, profile: Partial<InsertGamificationProfile>): Promise<GamificationProfile | undefined>;
  addPoints(userId: number, points: number, reason: string): Promise<GamificationProfile | undefined>;
  increaseStreak(userId: number): Promise<GamificationProfile | undefined>;
  resetStreak(userId: number): Promise<GamificationProfile | undefined>;
  
  // Point transaction methods
  getPointTransactions(userId: number): Promise<PointTransaction[]>;
  createPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction>;
  
  // Notification methods
  getNotifications(userId: number): Promise<Notification[]>;
  getNotificationById(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsRead(userId: number): Promise<boolean>;
  
  // Spending personality methods
  getSpendingPersonalityQuestions(): Promise<SpendingPersonalityQuestion[]>;
  getSpendingPersonalityQuestionById(id: number): Promise<SpendingPersonalityQuestion | undefined>;
  getSpendingPersonalityResult(userId: number): Promise<SpendingPersonalityResult | undefined>;
  saveSpendingPersonalityResult(result: InsertSpendingPersonalityResult): Promise<SpendingPersonalityResult>;
  
  // Budget methods
  getBudget(userId: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(userId: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  
  // Professional services methods
  getProfessionalServices(): Promise<ProfessionalService[]>;
  getProfessionalServiceById(id: number): Promise<ProfessionalService | undefined>;
  createProfessionalService(service: InsertProfessionalService): Promise<ProfessionalService>;
  updateProfessionalService(id: number, service: Partial<InsertProfessionalService>): Promise<ProfessionalService | undefined>;
  deleteProfessionalService(id: number): Promise<boolean>;
  
  // Stackr Gigs methods
  getStackrGigs(): Promise<StackrGig[]>;
  getStackrGigById(id: number): Promise<StackrGig | undefined>;
  createStackrGig(gig: InsertStackrGig): Promise<StackrGig>;
  updateStackrGig(id: number, gig: Partial<InsertStackrGig>): Promise<StackrGig | undefined>;
  deleteStackrGig(id: number): Promise<boolean>;
  getStackrGigsByUserId(userId: number): Promise<StackrGig[]>;
  getStackrGigsByStatus(status: string): Promise<StackrGig[]>;
  applyForGig(gigId: number, userId: number): Promise<StackrGig | undefined>;
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
  private stackrGigs: Map<number, StackrGig>;
  private affiliatePrograms: Map<number, AffiliateProgram>;
  private userAffiliates: Map<number, UserAffiliate>;
  
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
  private stackrGigCurrentId: number;
  private affiliateProgramCurrentId: number;
  private userAffiliateCurrentId: number;

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
    this.stackrGigs = new Map();
    this.affiliatePrograms = new Map();
    this.userAffiliates = new Map();
    
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
    this.stackrGigCurrentId = 1;
    this.affiliateProgramCurrentId = 1;
    this.userAffiliateCurrentId = 1;
    
    // Add some initial data
    this.setupInitialData();
  }

  private setupInitialData() {
    // Create sample user
    const sampleUser: InsertUser = {
      username: "demo",
      password: "$2b$10$6UaVJ8utQu1k7pslBl9YzOOlpYS3gOjZolnYQmKzya/8AY2jdwvYu", // hashed password for "password123"
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User",
      phone: null,
      role: "user",
      verificationToken: null,
      verified: true,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      profileImage: null,
      subscriptionTier: "free",
      subscriptionActive: false,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      onboardingCompleted: false,
      onboardingStep: "welcome"
    };
    
    const adminUser: InsertUser = {
      username: "admin",
      password: "$2b$10$6UaVJ8utQu1k7pslBl9YzOOlpYS3gOjZolnYQmKzya/8AY2jdwvYu", // hashed password for "password123"
      email: "admin@stackr.finance",
      firstName: "Admin",
      lastName: "User",
      phone: null,
      role: "admin",
      verificationToken: null,
      verified: true,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      profileImage: null,
      subscriptionTier: "lifetime",
      subscriptionActive: true,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      onboardingCompleted: false,
      onboardingStep: "welcome"
    };

    this.createUser(sampleUser);
    this.createUser(adminUser);
    
    // Add sample affiliate programs
    const sampleAffiliatePrograms: InsertAffiliateProgram[] = [
      {
        name: "LockPro Commission",
        description: "Earn commissions by referring customers to LockPro's high-security locksmith products.",
        company: "LockPro Security",
        category: "security",
        commissionRate: "10%",
        payoutThreshold: "50.00",
        payoutSchedule: "monthly",
        termsUrl: "https://lockpro.example.com/affiliates/terms",
        signupUrl: "https://lockpro.example.com/affiliates/signup",
        logoUrl: "https://lockpro.example.com/logo.png",
        status: "active",
        tags: ["security", "locksmith", "hardware"],
        aiRecommendationScore: 85,
        featured: true,
      },
      {
        name: "ToolMaster Affiliate",
        description: "Refer clients to ToolMaster and get 8% on professional-grade tools for tradespeople.",
        company: "ToolMaster Inc.",
        category: "tools",
        commissionRate: "8%",
        payoutThreshold: "100.00",
        payoutSchedule: "monthly",
        termsUrl: "https://toolmaster.example.com/affiliate-terms",
        signupUrl: "https://toolmaster.example.com/affiliate-program",
        logoUrl: "https://toolmaster.example.com/logo.png",
        status: "active",
        tags: ["tools", "tradesperson", "equipment"],
        aiRecommendationScore: 78,
        featured: false,
      },
      {
        name: "ServicePro Software Partner",
        description: "Earn ongoing commissions by referring service businesses to ServicePro scheduling software.",
        company: "ServicePro",
        category: "software",
        commissionRate: "20% recurring",
        payoutThreshold: "25.00",
        payoutSchedule: "monthly",
        termsUrl: "https://servicepro.example.com/partners/terms",
        signupUrl: "https://servicepro.example.com/partners/apply",
        logoUrl: "https://servicepro.example.com/logo.png",
        status: "active",
        tags: ["software", "scheduling", "service-business"],
        aiRecommendationScore: 92,
        featured: true,
      }
    ];
    
    sampleAffiliatePrograms.forEach(program => {
      this.createAffiliateProgram(program);
    });
    // Add some sample gigs
    const sampleGigs: InsertStackrGig[] = [
      {
        title: "Locksmith Website Development",
        description: "Create a modern website for my locksmith business with service booking and customer testimonials.",
        amount: "750.00",
        status: "open",
        requesterUserId: 1,
        category: "web_development",
        skills: ["react", "javascript", "html", "css"],
        estimatedHours: "20",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        location: "Remote",
        completionDate: null,
      },
      {
        title: "Appointment Scheduling System",
        description: "Need a custom scheduling system for service appointments that integrates with Google Calendar.",
        amount: "500.00",
        status: "open",
        requesterUserId: 1,
        category: "software_development",
        skills: ["javascript", "google_api", "scheduling"],
        estimatedHours: "15",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
        location: "Remote",
        completionDate: null,
      },
      {
        title: "Logo Design for Locksmith Tools",
        description: "Create a professional logo for my new line of locksmith tools and equipment.",
        amount: "300.00",
        status: "open",
        requesterUserId: 1,
        category: "design",
        skills: ["logo_design", "branding", "graphic_design"],
        estimatedHours: "8",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        location: "Remote",
        completionDate: null,
      }
    ];
    
    sampleGigs.forEach(gig => {
      this.createStackrGig(gig);
    });
    
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
  }

  // Stackr Gigs implementation

  async getStackrGigs(): Promise<StackrGig[]> {
    return Array.from(this.stackrGigs.values());
  }

  async getStackrGigById(id: number): Promise<StackrGig | undefined> {
    return this.stackrGigs.get(id);
  }

  async createStackrGig(gig: InsertStackrGig): Promise<StackrGig> {
    const id = this.stackrGigCurrentId++;
    const now = new Date();
    
    const gigObj: StackrGig = {
      id,
      title: gig.title,
      description: gig.description,
      amount: gig.amount,
      status: gig.status || "open",
      requesterUserId: gig.requesterUserId,
      assignedUserId: gig.assignedUserId || null,
      category: gig.category,
      skills: gig.skills || [],
      estimatedHours: gig.estimatedHours || "0",
      dueDate: gig.dueDate || null,
      completionDate: gig.completionDate || null,
      paymentStatus: gig.paymentStatus || "unpaid",
      createdAt: now,
      updatedAt: now,
      location: gig.location || "Remote",
      hasAttachments: gig.hasAttachments || false
    };
    
    this.stackrGigs.set(id, gigObj);
    return gigObj;
  }

  async updateStackrGig(id: number, gig: Partial<InsertStackrGig>): Promise<StackrGig | undefined> {
    const existingGig = this.stackrGigs.get(id);
    if (!existingGig) return undefined;
    
    const updatedGig: StackrGig = {
      ...existingGig,
      ...gig,
      updatedAt: new Date()
    };
    
    this.stackrGigs.set(id, updatedGig);
    return updatedGig;
  }

  async deleteStackrGig(id: number): Promise<boolean> {
    const exists = this.stackrGigs.has(id);
    if (exists) {
      this.stackrGigs.delete(id);
      return true;
    }
    return false;
  }

  async getStackrGigsByUserId(userId: number): Promise<StackrGig[]> {
    return Array.from(this.stackrGigs.values()).filter(
      gig => gig.requesterUserId === userId || gig.assignedUserId === userId
    );
  }

  async getStackrGigsByStatus(status: string): Promise<StackrGig[]> {
    return Array.from(this.stackrGigs.values()).filter(
      gig => gig.status === status
    );
  }

  async applyForGig(gigId: number, userId: number): Promise<StackrGig | undefined> {
    const gig = await this.getStackrGigById(gigId);
    if (!gig) return undefined;
    
    if (gig.status !== "open") {
      throw new Error("This gig is no longer open for applications");
    }
    
    const updatedGig: StackrGig = {
      ...gig,
      status: "assigned",
      assignedUserId: userId,
      updatedAt: new Date()
    };
    
    this.stackrGigs.set(gigId, updatedGig);
    return updatedGig;
  }

  // User methods (only including what's absolutely necessary for the app to function)
  
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
  
  async getUserByUsernameOrEmail(identifier: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === identifier || user.email === identifier,
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
  
  async getUserSubscription(userId: number): Promise<{ status: string, plan: string } | null> {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    return {
      status: user.subscriptionActive ? 'active' : 'inactive',
      plan: user.subscriptionTier || 'free'
    };
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
  
  async getUserData(userId: number): Promise<{
    id: number;
    username: string;
    email: string;
    spendingLimits?: Array<{
      id: string;
      category: string;
      limit: number;
      period: 'weekly' | 'monthly';
    }>;
    subscription?: {
      status: string;
      plan: string;
    };
    profile?: UserProfile;
  } | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const profile = await this.getUserProfile(userId);
    const subscription = await this.getUserSubscription(userId);
    
    // Get spending limits from user profile or a default setting
    // In a real implementation, these would come from a dedicated table
    let spendingLimits = [];
    
    if (profile && profile.preferences && profile.preferences.spendingLimits) {
      spendingLimits = profile.preferences.spendingLimits;
    } else {
      // Add some default spending limits for testing guardrails
      spendingLimits = [
        {
          id: `limit-${Date.now()}-1`,
          category: 'Food',
          limit: 200,
          period: 'weekly'
        },
        {
          id: `limit-${Date.now()}-2`,
          category: 'Entertainment',
          limit: 150,
          period: 'monthly'
        }
      ];
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      spendingLimits,
      subscription: subscription || undefined,
      profile
    };
  }

  // Income methods (simplified, only including what's necessary)

  async getIncomes(userId: number): Promise<Income[]> {
    return Array.from(this.incomes.values()).filter(
      income => income.userId === userId
    );
  }

  async getIncomeById(id: number): Promise<Income | undefined> {
    return this.incomes.get(id);
  }

  async createIncome(income: InsertIncome): Promise<Income> {
    const id = this.incomeCurrentId++;
    
    const incomeObj: Income = {
      id,
      description: income.description,
      amount: income.amount,
      date: income.date,
      source: income.source || 'Manual',
      category: income.category || 'other',
      userId: income.userId || null,
      notes: income.notes || null
    };
    
    this.incomes.set(id, incomeObj);
    return incomeObj;
  }

  async updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined> {
    const existingIncome = this.incomes.get(id);
    if (!existingIncome) return undefined;
    
    const updatedIncome: Income = {
      ...existingIncome,
      ...income,
      date: income.date || existingIncome.date
    };
    
    this.incomes.set(id, updatedIncome);
    return updatedIncome;
  }

  async deleteIncome(id: number): Promise<boolean> {
    const exists = this.incomes.has(id);
    if (exists) {
      this.incomes.delete(id);
      return true;
    }
    return false;
  }

  async getIncomesByMonth(userId: number, year: number, month: number): Promise<Income[]> {
    return Array.from(this.incomes.values()).filter(income => {
      if (income.userId !== userId) return false;
      
      const incomeDate = new Date(income.date);
      return incomeDate.getFullYear() === year && incomeDate.getMonth() === month;
    });
  }

  // Other method stubs implemented to satisfy interface requirements
  async getUserProfile(userId: number): Promise<UserProfile | undefined> { return undefined; }
  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> { return {} as UserProfile; }
  async updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> { return undefined; }
  
  // Spending limits implementation 
  // In a real implementation, we would store these in a database table
  // For now, we'll use a memory map to store user spending limits
  private userSpendingLimits: Map<number, Array<{
    id: string;
    category: string;
    limit: number;
    period: 'weekly' | 'monthly';
  }>> = new Map();
  
  async addSpendingLimit(userId: number, limit: {
    id: string;
    category: string;
    limit: number;
    period: 'weekly' | 'monthly';
  }): Promise<boolean> {
    // Get existing limits or create a new array
    const existingLimits = this.userSpendingLimits.get(userId) || [];
    
    // Add the new limit
    existingLimits.push({
      id: limit.id,
      category: limit.category,
      limit: limit.limit,
      period: limit.period
    });
    
    // Save updated limits
    this.userSpendingLimits.set(userId, existingLimits);
    
    return true;
  }
  
  async getSpendingLimits(userId: number): Promise<Array<{
    id: string;
    category: string;
    limit: number;
    period: 'weekly' | 'monthly';
  }>> {
    // Return existing limits or empty array if none exist
    return this.userSpendingLimits.get(userId) || [];
  }
  
  async updateSpendingLimit(userId: number, limitId: string, updates: Partial<{
    category: string;
    limit: number;
    period: 'weekly' | 'monthly';
  }>): Promise<boolean> {
    // Get existing limits
    const existingLimits = this.userSpendingLimits.get(userId);
    if (!existingLimits) return false;
    
    // Find the limit to update
    const limitIndex = existingLimits.findIndex(limit => limit.id === limitId);
    if (limitIndex === -1) return false;
    
    // Update the limit
    existingLimits[limitIndex] = {
      ...existingLimits[limitIndex],
      ...updates
    };
    
    // Save updated limits
    this.userSpendingLimits.set(userId, existingLimits);
    
    return true;
  }
  
  async deleteSpendingLimit(userId: number, limitId: string): Promise<boolean> {
    // Get existing limits
    const existingLimits = this.userSpendingLimits.get(userId);
    if (!existingLimits) return false;
    
    // Filter out the limit to delete
    const updatedLimits = existingLimits.filter(limit => limit.id !== limitId);
    
    // Save updated limits
    this.userSpendingLimits.set(userId, updatedLimits);
    
    return true;
  }
  async getIncomesByCategory(userId: number, category: string): Promise<Income[]> { return []; }
  async getIncomesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Income[]> { return []; }
  async getIncomeYears(userId: number): Promise<number[]> { return []; }
  async getTotalIncomeByMonth(userId: number, year: number, month: number): Promise<string> { return "0"; }
  async getIncomeStats(userId: number): Promise<any> { return {}; }
  async getIncomeDistribution(userId: number, period?: string): Promise<any> { return {}; }
  async getGoals(userId: number): Promise<Goal[]> { return []; }
  async getActiveGoals(userId: number): Promise<Goal[]> { return []; }
  async getGoalById(id: number): Promise<Goal | undefined> { return undefined; }
  async createGoal(goal: InsertGoal): Promise<Goal> { return {} as Goal; }
  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined> { return undefined; }
  async deleteGoal(id: number): Promise<boolean> { return true; }
  async completeGoal(id: number): Promise<Goal | undefined> { return undefined; }
  async getBankConnections(userId: number): Promise<BankConnection[]> { return []; }
  async getBankConnectionById(id: number): Promise<BankConnection | undefined> { return undefined; }
  async getBankConnectionByPlaidId(plaidId: string): Promise<BankConnection | undefined> { return undefined; }
  async createBankConnection(connection: InsertBankConnection): Promise<BankConnection> { return {} as BankConnection; }
  async updateBankConnection(id: number, connection: Partial<InsertBankConnection>): Promise<BankConnection | undefined> { return undefined; }
  async deleteBankConnection(id: number): Promise<boolean> { return true; }
  async getBankAccounts(userId: number): Promise<BankAccount[]> { return []; }
  async getBankAccountsByConnectionId(connectionId: number): Promise<BankAccount[]> { return []; }
  async getBankAccountById(id: number): Promise<BankAccount | undefined> { return undefined; }
  async getBankAccountByPlaidId(plaidId: string): Promise<BankAccount | undefined> { return undefined; }
  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> { return {} as BankAccount; }
  async updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined> { return undefined; }
  async deleteBankAccount(id: number): Promise<boolean> { return true; }
  async getBankTransactions(userId: number, limit?: number, offset?: number): Promise<BankTransaction[]> { return []; }
  async getBankTransactionsByAccountId(accountId: number): Promise<BankTransaction[]> { return []; }
  async getBankTransactionById(id: number): Promise<BankTransaction | undefined> { return undefined; }
  async getBankTransactionByPlaidId(plaidId: string): Promise<BankTransaction | undefined> { return undefined; }
  async createBankTransaction(transaction: InsertBankTransaction): Promise<BankTransaction> { return {} as BankTransaction; }
  async updateBankTransaction(id: number, transaction: Partial<InsertBankTransaction>): Promise<BankTransaction | undefined> { return undefined; }
  async deleteBankTransaction(id: number): Promise<boolean> { return true; }
  async getBankTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<BankTransaction[]> { return []; }
  async getExpenses(userId: number): Promise<Expense[]> { return []; }
  async getExpenseById(id: number): Promise<Expense | undefined> { return undefined; }
  async createExpense(expense: InsertExpense): Promise<Expense> { return {} as Expense; }
  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> { return undefined; }
  async deleteExpense(id: number): Promise<boolean> { return true; }
  async getExpensesByMonth(userId: number, year: number, month: number): Promise<Expense[]> { return []; }
  async getExpensesByCategory(userId: number, category: string): Promise<Expense[]> { return []; }
  async getExpensesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Expense[]> { return []; }
  async getExpenseYears(userId: number): Promise<number[]> { return []; }
  async getTotalExpenseByMonth(userId: number, year: number, month: number): Promise<string> { return "0"; }
  async getExpenseStats(userId: number): Promise<any> { return {}; }
  async getExpenseDistribution(userId: number, period?: string): Promise<any> { return {}; }
  async getBalance(userId: number, year: number, month: number): Promise<Balance | undefined> { return undefined; }
  async updateBalance(id: number, balance: Partial<InsertBalance>): Promise<Balance | undefined> { return undefined; }
  async createBalance(balance: InsertBalance): Promise<Balance> { return {} as Balance; }
  async getBalanceHistory(userId: number): Promise<Balance[]> { return []; }
  async getCurrentBalance(userId: number): Promise<Balance | undefined> { return undefined; }
  async getReminders(userId: number): Promise<Reminder[]> { return []; }
  async getReminderById(id: number): Promise<Reminder | undefined> { return undefined; }
  async createReminder(reminder: InsertReminder): Promise<Reminder> { return {} as Reminder; }
  async updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder | undefined> { return undefined; }
  async deleteReminder(id: number): Promise<boolean> { return true; }
  async updateReminderStatus(id: number, isActive: boolean): Promise<Reminder | undefined> { return undefined; }
  async getDueReminders(userId: number): Promise<Reminder[]> { return []; }
  async markReminderSent(id: number): Promise<Reminder | undefined> { return undefined; }
  async getWidgetSettings(userId: number): Promise<WidgetSettings | undefined> { return undefined; }
  async createWidgetSettings(settings: InsertWidgetSettings): Promise<WidgetSettings> { return {} as WidgetSettings; }
  async updateWidgetSettings(userId: number, settings: Partial<InsertWidgetSettings>): Promise<WidgetSettings | undefined> { return undefined; }
  async getAchievements(): Promise<Achievement[]> { return []; }
  async getAchievementById(id: number): Promise<Achievement | undefined> { return undefined; }
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> { return {} as Achievement; }
  async getUserAchievements(userId: number): Promise<UserAchievement[]> { return []; }
  async getUserAchievementById(id: number): Promise<UserAchievement | undefined> { return undefined; }
  async awardAchievement(userId: number, achievementId: number): Promise<UserAchievement> { return {} as UserAchievement; }
  async checkAndAwardAchievements(userId: number): Promise<UserAchievement[]> { return []; }
  async getGamificationProfile(userId: number): Promise<GamificationProfile | undefined> { return undefined; }
  async createGamificationProfile(profile: InsertGamificationProfile): Promise<GamificationProfile> { return {} as GamificationProfile; }
  async updateGamificationProfile(userId: number, profile: Partial<InsertGamificationProfile>): Promise<GamificationProfile | undefined> { return undefined; }
  async addPoints(userId: number, points: number, reason: string): Promise<GamificationProfile | undefined> { return undefined; }
  async increaseStreak(userId: number): Promise<GamificationProfile | undefined> { return undefined; }
  async resetStreak(userId: number): Promise<GamificationProfile | undefined> { return undefined; }
  async getPointTransactions(userId: number): Promise<PointTransaction[]> { return []; }
  async createPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction> { return {} as PointTransaction; }
  async getNotifications(userId: number): Promise<Notification[]> { return []; }
  async getNotificationById(id: number): Promise<Notification | undefined> { return undefined; }
  async createNotification(notification: InsertNotification): Promise<Notification> { return {} as Notification; }
  async markNotificationRead(id: number): Promise<Notification | undefined> { return undefined; }
  async markAllNotificationsRead(userId: number): Promise<boolean> { return true; }
  async getSpendingPersonalityQuestions(): Promise<SpendingPersonalityQuestion[]> { return []; }
  async getSpendingPersonalityQuestionById(id: number): Promise<SpendingPersonalityQuestion | undefined> { return undefined; }
  async getSpendingPersonalityResult(userId: number): Promise<SpendingPersonalityResult | undefined> { return undefined; }
  async saveSpendingPersonalityResult(result: InsertSpendingPersonalityResult): Promise<SpendingPersonalityResult> { return {} as SpendingPersonalityResult; }
  async getBudget(userId: number): Promise<Budget | undefined> { return undefined; }
  async createBudget(budget: InsertBudget): Promise<Budget> { return {} as Budget; }
  async updateBudget(userId: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> { return undefined; }
  async getProfessionalServices(): Promise<ProfessionalService[]> { return []; }
  async getProfessionalServiceById(id: number): Promise<ProfessionalService | undefined> { return undefined; }
  async createProfessionalService(service: InsertProfessionalService): Promise<ProfessionalService> { return {} as ProfessionalService; }
  async updateProfessionalService(id: number, service: Partial<InsertProfessionalService>): Promise<ProfessionalService | undefined> { return undefined; }
  async deleteProfessionalService(id: number): Promise<boolean> { return true; }

  // Affiliate Program methods
  async getAffiliatePrograms(): Promise<AffiliateProgram[]> {
    return Array.from(this.affiliatePrograms.values());
  }

  async getAffiliateProgramById(id: number): Promise<AffiliateProgram | undefined> {
    return this.affiliatePrograms.get(id);
  }

  async getAffiliateProgramsByCategory(category: string): Promise<AffiliateProgram[]> {
    return Array.from(this.affiliatePrograms.values()).filter(
      program => program.category === category
    );
  }

  async createAffiliateProgram(program: InsertAffiliateProgram): Promise<AffiliateProgram> {
    const id = this.affiliateProgramCurrentId++;
    const now = new Date();
    
    const programObj: AffiliateProgram = {
      id,
      name: program.name,
      description: program.description,
      company: program.company,
      category: program.category,
      commissionRate: program.commissionRate,
      payoutThreshold: program.payoutThreshold || null,
      payoutSchedule: program.payoutSchedule || null,
      termsUrl: program.termsUrl || null,
      signupUrl: program.signupUrl,
      logoUrl: program.logoUrl || null,
      status: program.status || "active",
      tags: program.tags || [],
      aiRecommendationScore: program.aiRecommendationScore || 50,
      createdAt: now,
      featured: program.featured || false
    };
    
    this.affiliatePrograms.set(id, programObj);
    return programObj;
  }

  async updateAffiliateProgram(id: number, program: Partial<InsertAffiliateProgram>): Promise<AffiliateProgram | undefined> {
    const existingProgram = this.affiliatePrograms.get(id);
    if (!existingProgram) return undefined;
    
    const updatedProgram: AffiliateProgram = {
      ...existingProgram,
      ...program
    };
    
    this.affiliatePrograms.set(id, updatedProgram);
    return updatedProgram;
  }

  async deleteAffiliateProgram(id: number): Promise<boolean> {
    const exists = this.affiliatePrograms.has(id);
    if (exists) {
      this.affiliatePrograms.delete(id);
      return true;
    }
    return false;
  }

  async getFeaturedAffiliatePrograms(): Promise<AffiliateProgram[]> {
    return Array.from(this.affiliatePrograms.values()).filter(
      program => program.featured === true
    );
  }

  // User Affiliate methods
  async getUserAffiliatePrograms(userId: number): Promise<UserAffiliate[]> {
    return Array.from(this.userAffiliates.values()).filter(
      affiliate => affiliate.userId === userId
    );
  }

  async getUserAffiliateById(id: number): Promise<UserAffiliate | undefined> {
    return this.userAffiliates.get(id);
  }

  async joinAffiliateProgram(userAffiliate: InsertUserAffiliate): Promise<UserAffiliate> {
    const id = this.userAffiliateCurrentId++;
    const now = new Date();
    
    const userAffiliateObj: UserAffiliate = {
      id,
      userId: userAffiliate.userId,
      programId: userAffiliate.programId,
      affiliateId: userAffiliate.affiliateId || null,
      referralCode: userAffiliate.referralCode || null,
      referralUrl: userAffiliate.referralUrl || null,
      dateJoined: now,
      totalEarnings: userAffiliate.totalEarnings || "0",
      status: userAffiliate.status || "active",
      lastPayout: userAffiliate.lastPayout || null,
      notes: userAffiliate.notes || null
    };
    
    this.userAffiliates.set(id, userAffiliateObj);
    return userAffiliateObj;
  }

  async updateUserAffiliate(id: number, userAffiliate: Partial<InsertUserAffiliate>): Promise<UserAffiliate | undefined> {
    const existingUserAffiliate = this.userAffiliates.get(id);
    if (!existingUserAffiliate) return undefined;
    
    const updatedUserAffiliate: UserAffiliate = {
      ...existingUserAffiliate,
      ...userAffiliate
    };
    
    this.userAffiliates.set(id, updatedUserAffiliate);
    return updatedUserAffiliate;
  }

  async leaveAffiliateProgram(userId: number, programId: number): Promise<boolean> {
    const userAffiliates = Array.from(this.userAffiliates.values());
    const affiliateToRemove = userAffiliates.find(
      affiliate => affiliate.userId === userId && affiliate.programId === programId
    );
    
    if (affiliateToRemove) {
      this.userAffiliates.delete(affiliateToRemove.id);
      return true;
    }
    return false;
  }

  async updateUserAffiliateEarnings(id: number, earnings: string): Promise<UserAffiliate | undefined> {
    const userAffiliate = this.userAffiliates.get(id);
    if (!userAffiliate) return undefined;
    
    const updatedUserAffiliate: UserAffiliate = {
      ...userAffiliate,
      totalEarnings: earnings,
      lastPayout: new Date()
    };
    
    this.userAffiliates.set(id, updatedUserAffiliate);
    return updatedUserAffiliate;
  }

  async getUserAffiliateProgramDetails(userId: number): Promise<Array<AffiliateProgram & { joined: boolean, joinedDate?: Date }>> {
    const allPrograms = await this.getAffiliatePrograms();
    const userAffiliates = await this.getUserAffiliatePrograms(userId);
    
    return allPrograms.map(program => {
      const joined = userAffiliates.some(affiliate => affiliate.programId === program.id);
      const affiliate = userAffiliates.find(affiliate => affiliate.programId === program.id);
      
      return {
        ...program,
        joined,
        joinedDate: affiliate ? affiliate.dateJoined : undefined
      };
    });
  }
}

export const storage = new MemStorage();