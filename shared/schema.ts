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

// Income entry schema
export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  source: text("source").notNull().default("Manual"),
  userId: integer("user_id"),
});

export const insertIncomeSchema = createInsertSchema(incomes).pick({
  description: true,
  amount: true,
  date: true,
  source: true,
  userId: true,
});

export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Income = typeof incomes.$inferSelect;
