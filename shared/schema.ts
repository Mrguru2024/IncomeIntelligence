import { pgTable, text, serial, integer, boolean, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
