import { users, type User, type InsertUser, incomes, type Income, type InsertIncome, goals, type Goal, type InsertGoal } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private incomes: Map<number, Income>;
  private goals: Map<number, Goal>;
  private userCurrentId: number;
  private incomeCurrentId: number;
  private goalCurrentId: number;

  constructor() {
    this.users = new Map();
    this.incomes = new Map();
    this.goals = new Map();
    this.userCurrentId = 1;
    this.incomeCurrentId = 1;
    this.goalCurrentId = 1;
    
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
      userId: insertIncome.userId || null
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
}

// Import database storage
import { dbStorage } from './db-storage';

// Export the database storage implementation instead of memory storage
export const storage = dbStorage;
