import { users, type User, type InsertUser, incomes, type Income, type InsertIncome } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private incomes: Map<number, Income>;
  private userCurrentId: number;
  private incomeCurrentId: number;

  constructor() {
    this.users = new Map();
    this.incomes = new Map();
    this.userCurrentId = 1;
    this.incomeCurrentId = 1;
    
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
        userId: 1
      },
      {
        description: "Car key replacement",
        amount: "185.00",
        date: new Date("2023-05-16"),
        source: "Bank",
        userId: 1
      },
      {
        description: "Commercial lock installation",
        amount: "450.00",
        date: new Date("2023-05-15"),
        source: "Manual",
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
      ...insertIncome, 
      id,
      date
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
}

export const storage = new MemStorage();
