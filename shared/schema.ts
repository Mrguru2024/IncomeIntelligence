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
  { id: "service", name: "Service Job", icon: "wrench" },
  { id: "emergency", name: "Emergency Call", icon: "bell" },
  { id: "installation", name: "Installation", icon: "settings" },
  { id: "consulting", name: "Consulting", icon: "messagesSquare" },
  { id: "repair", name: "Repair", icon: "tool" },
  { id: "retail", name: "Retail Sale", icon: "shoppingBag" },
  { id: "other", name: "Other", icon: "moreHorizontal" }
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
});

// Create the base schema
const baseInsertIncomeSchema = createInsertSchema(incomes).pick({
  description: true,
  amount: true,
  date: true,
  source: true,
  category: true,
  userId: true,
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
