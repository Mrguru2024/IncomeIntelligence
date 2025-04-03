import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
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
