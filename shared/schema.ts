import { pgTable, text, serial, integer, boolean, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profile options and enums
export const occupationTypes = [
  { id: "tradesperson", name: "Tradesperson" },
  { id: "locksmith", name: "Locksmith" },
  { id: "contractor", name: "Contractor" },
  { id: "plumber", name: "Plumber" },
  { id: "electrician", name: "Electrician" },
  { id: "repair", name: "Repair Service" },
  { id: "consultant", name: "Consultant" },
  { id: "freelancer", name: "Freelancer" },
  { id: "self_employed", name: "Self-Employed" },
  { id: "other", name: "Other" }
];

export const financialHealthStatuses = [
  { id: "building", name: "Building", description: "Starting to build financial foundation" },
  { id: "stable", name: "Stable", description: "Maintaining stable finances" },
  { id: "growing", name: "Growing", description: "Actively growing wealth" },
  { id: "established", name: "Established", description: "Well-established financial position" }
];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
  profileCompleted: boolean("profile_completed").notNull().default(false),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  onboardingStep: text("onboarding_step").default("welcome"), // Current step in the onboarding process
  verified: boolean("verified").notNull().default(false),
  verificationToken: text("verification_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  provider: text("provider").default("local"), // 'local', 'google', 'github', 'apple', etc.
  providerId: text("provider_id"),
  firebaseUid: text("firebase_uid"), // UID from Firebase Auth for social login
  profileImage: text("profile_image"), // URL to profile image, often provided by social login
  role: text("role").notNull().default("user"), // 'user', 'admin'
  accountStatus: text("account_status").notNull().default("active"), // 'active', 'suspended', 'inactive'
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorBackupCodes: json("two_factor_backup_codes"),
  twoFactorVerified: boolean("two_factor_verified").notNull().default(false),
  // Subscription fields for Stackr Pro
  subscriptionTier: text("subscription_tier").notNull().default("free"), // 'free', 'pro', 'lifetime'
  subscriptionActive: boolean("subscription_active").notNull().default(false),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  provider: true,
  providerId: true,
  firebaseUid: true,
  profileImage: true,
  verificationToken: true,
  role: true,
  accountStatus: true,
  verified: true,
  onboardingCompleted: true,
  onboardingStep: true,
  twoFactorEnabled: true,
  twoFactorSecret: true,
  twoFactorBackupCodes: true,
  twoFactorVerified: true,
  // Subscription-related fields
  subscriptionTier: true,
  subscriptionActive: true,
  subscriptionStartDate: true,
  subscriptionEndDate: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User profile for detailed personal and financial information
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  occupation: text("occupation"),
  occupationDetails: text("occupation_details"),
  businessName: text("business_name"),
  yearsInBusiness: integer("years_in_business"),
  averageMonthlyIncome: numeric("average_monthly_income"),
  financialGoals: json("financial_goals"), // Array of goal objects
  lifeGoals: json("life_goals"), // Array of goal objects
  financialHealthStatus: text("financial_health_status"),
  riskTolerance: text("risk_tolerance"), // low, medium, high
  isSoleProvider: boolean("is_sole_provider"),
  hasEmergencyFund: boolean("has_emergency_fund"),
  emergencyFundAmount: numeric("emergency_fund_amount"),
  preferredContactMethod: text("preferred_contact_method"), // email, phone, app
  widgetEnabled: boolean("widget_enabled").notNull().default(false),
  remindersEnabled: boolean("reminders_enabled").notNull().default(true),
  notificationsEmail: boolean("notifications_email").notNull().default(true),
  notificationsPush: boolean("notifications_push").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).pick({
  userId: true,
  occupation: true,
  occupationDetails: true,
  businessName: true,
  yearsInBusiness: true,
  averageMonthlyIncome: true,
  financialGoals: true,
  lifeGoals: true,
  financialHealthStatus: true,
  riskTolerance: true,
  isSoleProvider: true,
  hasEmergencyFund: true,
  emergencyFundAmount: true,
  preferredContactMethod: true,
  widgetEnabled: true,
  remindersEnabled: true,
  notificationsEmail: true,
  notificationsPush: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// Define income categories
export const incomeCategories = [
  { id: "service", name: "Service Job", icon: "wrench", color: "blue" },
  { id: "emergency", name: "Emergency Call", icon: "bell", color: "red" },
  { id: "installation", name: "Installation", icon: "settings", color: "purple" },
  { id: "consulting", name: "Consulting", icon: "messagesSquare", color: "indigo" },
  { id: "repair", name: "Repair", icon: "tool", color: "amber" },
  { id: "retail", name: "Retail Sale", icon: "shoppingBag", color: "green" },
  { id: "other", name: "Other", icon: "moreHorizontal", color: "gray" }
];

// Income entry schema
export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  source: text("source").notNull().default("Manual"),
  category: text("category").notNull().default("other"), // New category field
  userId: integer("user_id"),
  notes: text("notes"),
});

// Create the base schema
const baseInsertIncomeSchema = createInsertSchema(incomes).pick({
  description: true,
  amount: true,
  date: true,
  source: true,
  category: true,
  userId: true,
  notes: true,
});

// Extend it to handle date conversion
export const insertIncomeSchema = baseInsertIncomeSchema.extend({
  // Override the date field to accept both string and Date objects
  date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Income = typeof incomes.$inferSelect;

// Helper function to get category by ID
export function getCategoryById(categoryId: string) {
  return incomeCategories.find(cat => cat.id === categoryId) || incomeCategories[incomeCategories.length - 1]; // Default to "Other"
}

// Define goal types
export const goalTypes = [
  { id: "savings", name: "Savings", icon: "piggyBank", color: "green" },
  { id: "investments", name: "Investments", icon: "barChart", color: "purple" },
  { id: "needs", name: "Needs", icon: "home", color: "blue" },
  { id: "income", name: "Income", icon: "wallet", color: "amber" }
];

// Goals schema
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount").notNull(),
  currentAmount: numeric("current_amount").notNull().default("0"),
  type: text("type").notNull(),
  deadline: timestamp("deadline"),
  isCompleted: boolean("is_completed").notNull().default(false),
  startDate: timestamp("start_date").notNull().defaultNow(),
  userId: integer("user_id"),
  description: text("description"),
});

// Create the base schema
const baseInsertGoalSchema = createInsertSchema(goals).pick({
  name: true,
  targetAmount: true,
  currentAmount: true,
  type: true,
  deadline: true,
  isCompleted: true,
  startDate: true,
  userId: true,
  description: true,
});

// Extend it to handle date conversion
export const insertGoalSchema = baseInsertGoalSchema.extend({
  // Override the date fields to accept both string and Date objects
  deadline: z.preprocess(
    (arg) => {
      if (arg === null || arg === undefined) return null;
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date().nullable()
  ),
  startDate: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// Helper function to get goal type by ID
export function getGoalTypeById(typeId: string) {
  return goalTypes.find(type => type.id === typeId) || { id: "savings", name: "Savings", icon: "piggyBank", color: "green" };
}

// Bank connections schema
export const bankConnections = pgTable("bank_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  institutionId: text("institution_id").notNull(),
  institutionName: text("institution_name").notNull(),
  accessToken: text("access_token").notNull(),
  itemId: text("item_id").notNull(),
  status: text("status").notNull().default("active"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  metadata: json("metadata"),
});

// Create the base schema
const baseInsertBankConnectionSchema = createInsertSchema(bankConnections).pick({
  userId: true,
  institutionId: true,
  institutionName: true,
  accessToken: true,
  itemId: true,
  status: true,
  metadata: true,
});

export const insertBankConnectionSchema = baseInsertBankConnectionSchema;

export type InsertBankConnection = z.infer<typeof insertBankConnectionSchema>;
export type BankConnection = typeof bankConnections.$inferSelect;

// Bank accounts schema
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").notNull(),
  accountId: text("account_id").notNull().unique(),
  accountName: text("account_name").notNull(),
  accountType: text("account_type").notNull(),
  accountSubtype: text("account_subtype"),
  mask: text("mask"),
  balanceAvailable: numeric("balance_available"),
  balanceCurrent: numeric("balance_current"),
  isActive: boolean("is_active").notNull().default(true),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// Create the base schema
const baseInsertBankAccountSchema = createInsertSchema(bankAccounts).pick({
  connectionId: true,
  accountId: true,
  accountName: true,
  accountType: true,
  accountSubtype: true,
  mask: true,
  balanceAvailable: true,
  balanceCurrent: true,
  isActive: true,
});

export const insertBankAccountSchema = baseInsertBankAccountSchema;

export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;

// Bank Transactions schema
export const bankTransactions = pgTable("bank_transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  transactionId: text("transaction_id").notNull().unique(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull(),
  name: text("name").notNull(),
  merchantName: text("merchant_name"),
  category: text("category"),
  pending: boolean("pending").notNull().default(false),
  importedAsIncome: boolean("imported_as_income").notNull().default(false),
  metadata: json("metadata"),
});

// Create the base schema
const baseInsertBankTransactionSchema = createInsertSchema(bankTransactions).pick({
  accountId: true,
  transactionId: true,
  amount: true,
  date: true,
  name: true,
  merchantName: true,
  category: true,
  pending: true,
  importedAsIncome: true,
  metadata: true,
});

// Extend it to handle date conversion
export const insertBankTransactionSchema = baseInsertBankTransactionSchema.extend({
  date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

export type InsertBankTransaction = z.infer<typeof insertBankTransactionSchema>;
export type BankTransaction = typeof bankTransactions.$inferSelect;

// Define expense categories
export const expenseCategories = [
  { id: "housing", name: "Housing", icon: "home", color: "slate" },
  { id: "food", name: "Food & Groceries", icon: "utensils", color: "red" },
  { id: "transportation", name: "Transportation", icon: "car", color: "blue" },
  { id: "utilities", name: "Utilities", icon: "plug", color: "amber" },
  { id: "healthcare", name: "Healthcare", icon: "stethoscope", color: "emerald" },
  { id: "personal", name: "Personal", icon: "user", color: "purple" },
  { id: "entertainment", name: "Entertainment", icon: "film", color: "pink" },
  { id: "education", name: "Education", icon: "graduationCap", color: "indigo" },
  { id: "debt", name: "Debt", icon: "creditCard", color: "rose" },
  { id: "savings", name: "Savings", icon: "piggyBank", color: "green" },
  { id: "other", name: "Other", icon: "moreHorizontal", color: "gray" }
];

// Expenses schema
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  category: text("category").notNull().default("other"),
  userId: integer("user_id"),
  paymentMethod: text("payment_method").default("cash"),
  location: text("location"),
  notes: text("notes"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPeriod: text("recurring_period"),
  offlineCreated: boolean("offline_created").default(false),
  offlineId: text("offline_id").unique(),
});

// Create the base schema
const baseInsertExpenseSchema = createInsertSchema(expenses).pick({
  description: true,
  amount: true,
  date: true,
  category: true,
  userId: true,
  paymentMethod: true,
  location: true,
  notes: true,
  isRecurring: true,
  recurringPeriod: true,
  offlineCreated: true,
  offlineId: true,
});

// Extend it to handle date conversion
export const insertExpenseSchema = baseInsertExpenseSchema.extend({
  // Override the date field to accept both string and Date objects
  date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Helper function to get expense category by ID
export function getExpenseCategoryById(categoryId: string) {
  return expenseCategories.find(cat => cat.id === categoryId) || expenseCategories[expenseCategories.length - 1]; // Default to "Other"
}

// Spending Personality Types
export const spendingPersonalityTypes = [
  { id: "saver", name: "The Saver", description: "Cautious with money, focused on security and future stability", traits: ["thrifty", "patient", "methodical", "security-focused"] },
  { id: "investor", name: "The Investor", description: "Strategic with money, sees finances as tools for growth", traits: ["analytical", "strategic", "growth-oriented", "calculated risk-taker"] },
  { id: "spender", name: "The Spender", description: "Lives in the moment, uses money for experiences and enjoyment", traits: ["spontaneous", "experience-driven", "generous", "present-focused"] },
  { id: "debtor", name: "The Debtor", description: "Struggles with managing credit, often spends beyond means", traits: ["impulsive", "optimistic", "comfort-seeking", "pressure-sensitive"] },
  { id: "avoider", name: "The Avoider", description: "Prefers not to think about finances and money management", traits: ["inattentive", "anxious", "procrastinating", "overwhelmed"] },
  { id: "security_seeker", name: "The Security Seeker", description: "Plans extensively to protect against financial risks", traits: ["cautious", "protective", "detail-oriented", "conservative"] },
  { id: "status_focused", name: "The Status Focused", description: "Uses money to signal achievement and social position", traits: ["image-conscious", "ambitious", "competitive", "quality-focused"] },
  { id: "minimalist", name: "The Minimalist", description: "Values simplicity and reduced consumption", traits: ["intentional", "quality-focused", "frugal", "values-driven"] },
];

// Balance tracking schema
export const balances = pgTable("balances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  beginningBalance: numeric("beginning_balance").notNull(),
  currentBalance: numeric("current_balance").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// Create the balance schema
const baseInsertBalanceSchema = createInsertSchema(balances).pick({
  userId: true,
  beginningBalance: true,
  currentBalance: true,
  month: true,
  year: true,
});

export const insertBalanceSchema = baseInsertBalanceSchema;

export type InsertBalance = z.infer<typeof insertBalanceSchema>;
export type Balance = typeof balances.$inferSelect;

// Gamification System

// Define achievement types
export const achievementTypes = [
  { id: "income", name: "Income Achievements", icon: "wallet", color: "blue" },
  { id: "savings", name: "Savings Achievements", icon: "piggyBank", color: "green" },
  { id: "streak", name: "Streak Achievements", icon: "flame", color: "amber" },
  { id: "goals", name: "Goal Achievements", icon: "target", color: "purple" },
  { id: "expense", name: "Expense Achievements", icon: "receipt", color: "red" },
  { id: "milestone", name: "Milestone Achievements", icon: "trophy", color: "yellow" }
];

// Achievements schema
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  pointsValue: integer("points_value").notNull().default(10),
  icon: text("icon"),
  level: integer("level").notNull().default(1),
  criteria: json("criteria").notNull(), // JSON data with criteria for unlocking
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const baseInsertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  category: true,
  pointsValue: true,
  icon: true,
  level: true,
  criteria: true,
});

export const insertAchievementSchema = baseInsertAchievementSchema;

// User Achievements junction table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  dateEarned: timestamp("date_earned").notNull().defaultNow(),
  progress: json("progress"), // For tracking partial progress
});

const baseInsertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementId: true,
  progress: true,
});

export const insertUserAchievementSchema = baseInsertUserAchievementSchema;

// Gamification Profile
export const gamificationProfiles = pgTable("gamification_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  lastActive: timestamp("last_active").notNull().defaultNow(),
  totalPointsEarned: integer("total_points_earned").notNull().default(0),
  milestones: json("milestones"), // JSON array of milestones reached
  achievements: json("achievements"), // Summary of achievements earned
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

const baseInsertGamificationProfileSchema = createInsertSchema(gamificationProfiles).pick({
  userId: true,
  points: true,
  level: true,
  streak: true,
  lastActive: true,
  totalPointsEarned: true,
  milestones: true,
  achievements: true,
});

export const insertGamificationProfileSchema = baseInsertGamificationProfileSchema.extend({
  lastActive: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

// Point Transactions - history of points earned/spent
export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // Positive = earned, Negative = spent
  reason: text("reason").notNull(),
  source: text("source").notNull(), // achievement, milestone, etc.
  sourceId: integer("source_id"), // Optional ID reference to the source
  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
});

const baseInsertPointTransactionSchema = createInsertSchema(pointTransactions).pick({
  userId: true,
  amount: true,
  reason: true,
  source: true,
  sourceId: true,
});

export const insertPointTransactionSchema = baseInsertPointTransactionSchema;

// Types for gamification
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type GamificationProfile = typeof gamificationProfiles.$inferSelect;
export type InsertGamificationProfile = z.infer<typeof insertGamificationProfileSchema>;

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;

// Reminder system
export const reminderFrequencies = [
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" },
  { id: "biweekly", name: "Bi-Weekly" },
  { id: "monthly", name: "Monthly" }
];

export const reminderTypes = [
  { id: "income", name: "Income Entry", icon: "dollarSign", color: "green" },
  { id: "expense", name: "Expense Tracking", icon: "receipt", color: "red" },
  { id: "goal", name: "Goal Update", icon: "target", color: "blue" },
  { id: "budget", name: "Budget Check", icon: "pieChart", color: "purple" },
  { id: "custom", name: "Custom", icon: "bell", color: "amber" }
];

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("custom"),
  frequency: text("frequency").notNull(),
  nextRemindAt: timestamp("next_remind_at").notNull(),
  lastSentAt: timestamp("last_sent_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  metadata: json("metadata"),
});

const baseInsertReminderSchema = createInsertSchema(reminders).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  frequency: true,
  nextRemindAt: true,
  isActive: true,
  metadata: true,
});

export const insertReminderSchema = baseInsertReminderSchema.extend({
  nextRemindAt: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

// Notification Types
export const notificationTypes = [
  { id: "info", name: "Information", icon: "info", color: "blue" },
  { id: "success", name: "Success", icon: "checkCircle", color: "green" },
  { id: "warning", name: "Warning", icon: "alertTriangle", color: "amber" },
  { id: "reminder", name: "Reminder", icon: "bell", color: "purple" }
];

// Notifications schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  metadata: json("metadata"),
});

// Create the notifications schema
const baseInsertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  isRead: true,
  metadata: true,
});

export const insertNotificationSchema = baseInsertNotificationSchema;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Widget settings
export const widgetSettings = pgTable("widget_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  enabled: boolean("enabled").notNull().default(true),
  showBalance: boolean("show_balance").notNull().default(true),
  showIncomeGoal: boolean("show_income_goal").notNull().default(true),
  showNextReminder: boolean("show_next_reminder").notNull().default(true),
  position: text("position").notNull().default("bottom-right"),
  size: text("size").notNull().default("medium"),
  theme: text("theme").notNull().default("auto"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  customSettings: json("custom_settings"),
});

const baseInsertWidgetSettingsSchema = createInsertSchema(widgetSettings).pick({
  userId: true,
  enabled: true,
  showBalance: true,
  showIncomeGoal: true,
  showNextReminder: true,
  position: true,
  size: true,
  theme: true,
  customSettings: true,
});

export const insertWidgetSettingsSchema = baseInsertWidgetSettingsSchema;

export type InsertWidgetSettings = z.infer<typeof insertWidgetSettingsSchema>;
export type WidgetSettings = typeof widgetSettings.$inferSelect;

// Spending Personality Quiz System

// Quiz Result Schema
export const spendingPersonalityResults = pgTable("spending_personality_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  personalityType: text("personality_type").notNull(),
  score: json("score").notNull(), // Score breakdown by personality type
  answers: json("answers").notNull(), // Record of user's answers
  takenAt: timestamp("taken_at").notNull().defaultNow(),
  recommendations: json("recommendations"), // Personalized recommendations based on results
});

const baseInsertSpendingPersonalityResultSchema = createInsertSchema(spendingPersonalityResults).pick({
  userId: true,
  personalityType: true,
  score: true,
  answers: true,
  recommendations: true,
});

export const insertSpendingPersonalityResultSchema = baseInsertSpendingPersonalityResultSchema;

export type InsertSpendingPersonalityResult = z.infer<typeof insertSpendingPersonalityResultSchema>;
export type SpendingPersonalityResult = typeof spendingPersonalityResults.$inferSelect;

// Quiz Questions Schema
export const spendingPersonalityQuestions = pgTable("spending_personality_questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text").notNull(),
  options: json("options").notNull(), // Array of possible answers
  category: text("category").notNull(), // For grouping related questions
  weight: integer("weight").notNull().default(1), // Importance of this question
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const baseInsertSpendingPersonalityQuestionSchema = createInsertSchema(spendingPersonalityQuestions).pick({
  questionText: true,
  options: true,
  category: true,
  weight: true,
  active: true,
});

export const insertSpendingPersonalityQuestionSchema = baseInsertSpendingPersonalityQuestionSchema;

export type InsertSpendingPersonalityQuestion = z.infer<typeof insertSpendingPersonalityQuestionSchema>;
export type SpendingPersonalityQuestion = typeof spendingPersonalityQuestions.$inferSelect;

// Quiz answer schema for validation
export const quizAnswerSchema = z.object({
  questionId: z.number(),
  optionId: z.string(),
  personalityType: z.string(),
  value: z.number()
});

export const quizAnswersSchema = z.array(quizAnswerSchema);
export type QuizAnswer = z.infer<typeof quizAnswerSchema>;
