import { create } from 'zustand';
import { Income } from '@shared/schema';

interface IncomeState {
  currentAmount: number;
  setCurrentAmount: (amount: number) => void;
  
  selectedIncome: Income | null;
  setSelectedIncome: (income: Income | null) => void;
  
  needsPercentage: number;
  investmentsPercentage: number;
  savingsPercentage: number;
  updatePercentages: (needs: number, investments: number, savings: number) => void;
}

export const useIncomeStore = create<IncomeState>((set) => ({
  currentAmount: 0,
  setCurrentAmount: (amount) => set({ currentAmount: amount }),
  
  selectedIncome: null,
  setSelectedIncome: (income) => set({ selectedIncome: income }),
  
  needsPercentage: 40,
  investmentsPercentage: 30,
  savingsPercentage: 30,
  updatePercentages: (needs, investments, savings) => {
    if (needs + investments + savings !== 100) {
      console.error("Percentages must add up to 100");
      return;
    }
    
    set({
      needsPercentage: needs,
      investmentsPercentage: investments,
      savingsPercentage: savings
    });
  }
}));
