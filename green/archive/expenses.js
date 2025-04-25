/**
 * Expense tracking component for Stackr Finance
 * This module handles tracking and categorizing expenses based on the 40/30/30 split.
 */

import { appState } from './src/main.js';

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Get expense categories with icons
function getExpenseCategories() {
  // Organize by 40/30/30 split categories
  return {
    needs: [
      { id: 'housing', name: 'Housing', icon: '🏠', split: 'needs' },
      { id: 'utilities', name: 'Utilities', icon: '💡', split: 'needs' },
      { id: 'groceries', name: 'Groceries', icon: '🛒', split: 'needs' },
      { id: 'transportation', name: 'Transportation', icon: '🚗', split: 'needs' },
      { id: 'insurance', name: 'Insurance', icon: '🛡️', split: 'needs' },
      { id: 'healthcare', name: 'Healthcare', icon: '⚕️', split: 'needs' },
      { id: 'education', name: 'Education', icon: '📚', split: 'needs' },
      { id: 'debt', name: 'Debt Payments', icon: '💳', split: 'needs' },
      { id: 'childcare', name: 'Childcare', icon: '👶', split: 'needs' },
      { id: 'other_needs', name: 'Other Needs', icon: '📦', split: 'needs' }
    ],
    investments: [
      { id: 'retirement', name: 'Retirement', icon: '👵', split: 'investments' },
      { id: 'stocks', name: 'Stocks', icon: '📈', split: 'investments' },
      { id: 'realestate', name: 'Real Estate', icon: '🏢', split: 'investments' },
      { id: 'business', name: 'Business', icon: '💼', split: 'investments' },
      { id: 'education_investment', name: 'Education', icon: '🎓', split: 'investments' },
      { id: 'crypto', name: 'Cryptocurrency', icon: '₿', split: 'investments' },
      { id: 'other_investments', name: 'Other Investments', icon: '💰', split: 'investments' }
    ],
    savings: [
      { id: 'emergency', name: 'Emergency Fund', icon: '🚨', split: 'savings' },
      { id: 'travel', name: 'Travel Fund', icon: '✈️', split: 'savings' },
      { id: 'gifts', name: 'Gifts', icon: '🎁', split: 'savings' },
      { id: 'personal', name: 'Personal', icon: '👤', split: 'savings' },
      { id: 'recreation', name: 'Recreation', icon: '🎮', split: 'savings' },
      { id: 'dining', name: 'Dining Out', icon: '🍽️', split: 'savings' },
      { id: 'entertainment', name: 'Entertainment', icon: '🎬', split: 'savings' },
      { id: 'shopping', name: 'Shopping', icon: '👕', split: 'savings' },
      { id: 'other_savings', name: 'Other Savings', icon: '🔖', split: 'savings' }
    ]
  };
}

// Generate expense data if not available
function getExpenseData() {
  if (!appState.expenseEntries || appState.expenseEntries.length === 0) {
    // Generate sample expense data if none exists
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    return [
      {
        id: 1,
        date: today.toISOString(),
        amount: 1200,
        merchant: 'Parkview Apartments',
        category: 'housing',
        description: 'Monthly rent',
        split: 'needs'
      },
      {
        id: 2,
        date: today.toISOString(),
        amount: 150,
        merchant: 'Power & Light Co.',
        category: 'utilities',
        description: 'Electricity bill',
        split: 'needs'
      },
      {
        id: 3,
        date: lastWeek.toISOString(),
        amount: 85,
        merchant: 'Grocery Mart',
        category: 'groceries',
        description: 'Weekly groceries',
        split: 'needs'
      },
      {
        id: 4,
        date: lastWeek.toISOString(),
        amount: 500,
        merchant: 'Vanguard',
        category: 'retirement',
        description: 'IRA contribution',
        split: 'investments'
      },
      {
        id: 5,
        date: twoWeeksAgo.toISOString(),
        amount: 60,
        merchant: 'Cinema City',
        category: 'entertainment',
        description: 'Movie night with friends',
        split: 'savings'
      },
      {
        id: 6, 
        date: twoWeeksAgo.toISOString(),
        amount: 200,
        merchant: 'Travel Fund',
        category: 'travel',
        description: 'Vacation savings',
        split: 'savings'
      }
    ];
  }
  
  return appState.expenseEntries;
}

// Save expense entry to application state
function saveExpenseEntry(expenseEntry) {
  // Generate unique ID if not provided
  if (!expenseEntry.id) {
    expenseEntry.id = Date.now();
  }
  
  // Ensure app state has expenseEntries array
  if (!appState.expenseEntries) {
    appState.expenseEntries = [];
  }
  
  // If editing an existing entry, replace it
  const existingIndex = appState.expenseEntries.findIndex(entry => entry.id === expenseEntry.id);
  if (existingIndex !== -1) {
    appState.expenseEntries[existingIndex] = expenseEntry;
  } else {
    // Otherwise add as new entry
    appState.expenseEntries.push(expenseEntry);
  }
  
  // Calculate monthly totals
  updateMonthlyExpenses();
  
  // Save to local storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('stackr-finance-state', JSON.stringify(appState));
      console.log('Expense entry saved successfully');
    } catch (error) {
      console.error('Error saving expense entry to localStorage:', error);
    }
  }
  
  return expenseEntry;
}

// Calculate and update monthly expenses
function updateMonthlyExpenses() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Filter for current month's expenses
  const currentMonthExpenses = appState.expenseEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });
  
  // Calculate totals by category
  const needsTotal = currentMonthExpenses
    .filter(entry => entry.split === 'needs')
    .reduce((sum, entry) => sum + entry.amount, 0);
    
  const investmentsTotal = currentMonthExpenses
    .filter(entry => entry.split === 'investments')
    .reduce((sum, entry) => sum + entry.amount, 0);
    
  const savingsTotal = currentMonthExpenses
    .filter(entry => entry.split === 'savings')
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  // Update app state
  if (!appState.expenses) {
    appState.expenses = { 
      monthly: {
        needs: needsTotal,
        investments: investmentsTotal,
        savings: savingsTotal
      }
    };
  } else {
    if (!appState.expenses.monthly) {
      appState.expenses.monthly = {};
    }
    appState.expenses.monthly.needs = needsTotal;
    appState.expenses.monthly.investments = investmentsTotal;
    appState.expenses.monthly.savings = savingsTotal;
  }
  
  return {
    needs: needsTotal,
    investments: investmentsTotal,
    savings: savingsTotal,
    total: needsTotal + investmentsTotal + savingsTotal
  };
}

// Delete expense entry
function deleteExpenseEntry(entryId) {
  if (!appState.expenseEntries) return false;
  
  const initialLength = appState.expenseEntries.length;
  appState.expenseEntries = appState.expenseEntries.filter(entry => entry.id !== entryId);
  
  if (appState.expenseEntries.length < initialLength) {
    // Entry was deleted, update monthly totals
    updateMonthlyExpenses();
    
    // Save to local storage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('stackr-finance-state', JSON.stringify(appState));
        console.log('Expense entry deleted successfully');
      } catch (error) {
        console.error('Error saving state to localStorage after deletion:', error);
      }
    }
    
    return true;
  }
  
  return false;
}

// Get all expense categories as a flat array
function getAllCategories() {
  const categories = getExpenseCategories();
  return [
    ...categories.needs,
    ...categories.investments,
    ...categories.savings
  ];
}

// Calculate budget status based on monthly income and expenses
function calculateBudgetStatus() {
  // Get monthly income from app state or use a default
  const monthlyIncome = appState.income?.monthly || 4500;
  
  // Get split ratios
  const splitRatio = appState.user?.splitRatio || { needs: 40, investments: 30, savings: 30 };
  
  // Calculate budget amounts for each category
  const needsBudget = (monthlyIncome * splitRatio.needs) / 100;
  const investmentsBudget = (monthlyIncome * splitRatio.investments) / 100;
  const savingsBudget = (monthlyIncome * splitRatio.savings) / 100;
  
  // Get actual expenses
  const expenses = appState.expenses?.monthly || { needs: 0, investments: 0, savings: 0 };
  
  // Calculate remaining budget
  const needsRemaining = needsBudget - expenses.needs;
  const investmentsRemaining = investmentsBudget - expenses.investments;
  const savingsRemaining = savingsBudget - expenses.savings;
  
  // Calculate percentages spent
  const needsPercentage = needsBudget > 0 ? (expenses.needs / needsBudget) * 100 : 0;
  const investmentsPercentage = investmentsBudget > 0 ? (expenses.investments / investmentsBudget) * 100 : 0;
  const savingsPercentage = savingsBudget > 0 ? (expenses.savings / savingsBudget) * 100 : 0;
  
  return {
    budget: {
      needs: needsBudget,
      investments: investmentsBudget,
      savings: savingsBudget,
      total: needsBudget + investmentsBudget + savingsBudget
    },
    expenses: {
      needs: expenses.needs,
      investments: expenses.investments,
      savings: expenses.savings,
      total: expenses.needs + expenses.investments + expenses.savings
    },
    remaining: {
      needs: needsRemaining,
      investments: investmentsRemaining,
      savings: savingsRemaining,
      total: needsRemaining + investmentsRemaining + savingsRemaining
    },
    percentages: {
      needs: needsPercentage,
      investments: investmentsPercentage,
      savings: savingsPercentage
    }
  };
}

// Render the expenses page
export function renderExpensesPage() {
  // Main container
  const expensesContainer = document.createElement('div');
  expensesContainer.className = 'expenses-container';
  
  // Get expense data and categories
  const expenseEntries = getExpenseData();
  const expenseCategories = getExpenseCategories();
  const allCategories = getAllCategories();
  
  // Calculate budget status
  const budgetStatus = calculateBudgetStatus();
  updateMonthlyExpenses();
  
  // Header section
  const header = document.createElement('header');
  header.className = 'expenses-header mb-6';
  header.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold mb-1">Expense Tracking</h1>
        <p class="text-gray-600">Track and categorize your expenses based on the 40/30/30 split</p>
      </div>
      <div class="mt-4 md:mt-0">
        <button id="add-expense-btn" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
          + Add Expense
        </button>
      </div>
    </div>
  `;
  expensesContainer.appendChild(header);
  
  // Budget status section
  const budgetSection = document.createElement('section');
  budgetSection.className = 'budget-section grid grid-cols-1 md:grid-cols-3 gap-4 mb-8';
  
  // Budget progress card
  const progressCard = document.createElement('div');
  progressCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  progressCard.innerHTML = `
    <div class="card-header mb-3">
      <h3 class="text-lg font-semibold">Monthly Budget</h3>
    </div>
    
    <div class="flex justify-between mb-1">
      <div class="text-sm font-medium">Needs (40%)</div>
      <div class="text-sm">${formatCurrency(budgetStatus.expenses.needs)} / ${formatCurrency(budgetStatus.budget.needs)}</div>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5 mb-3">
      <div class="bg-primary h-2.5 rounded-full" style="width: ${Math.min(100, budgetStatus.percentages.needs)}%"></div>
    </div>
    
    <div class="flex justify-between mb-1">
      <div class="text-sm font-medium">Investments (30%)</div>
      <div class="text-sm">${formatCurrency(budgetStatus.expenses.investments)} / ${formatCurrency(budgetStatus.budget.investments)}</div>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5 mb-3">
      <div class="bg-accent h-2.5 rounded-full" style="width: ${Math.min(100, budgetStatus.percentages.investments)}%"></div>
    </div>
    
    <div class="flex justify-between mb-1">
      <div class="text-sm font-medium">Savings (30%)</div>
      <div class="text-sm">${formatCurrency(budgetStatus.expenses.savings)} / ${formatCurrency(budgetStatus.budget.savings)}</div>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5 mb-3">
      <div class="bg-secondary h-2.5 rounded-full" style="width: ${Math.min(100, budgetStatus.percentages.savings)}%"></div>
    </div>
    
    <div class="mt-4 pt-4 border-t border-gray-100">
      <div class="flex justify-between">
        <div class="text-sm">Total Expenses:</div>
        <div class="font-semibold">${formatCurrency(budgetStatus.expenses.total)}</div>
      </div>
      <div class="flex justify-between mt-1">
        <div class="text-sm">Budget Remaining:</div>
        <div class="font-semibold ${budgetStatus.remaining.total >= 0 ? 'text-green-600' : 'text-red-600'}">
          ${formatCurrency(budgetStatus.remaining.total)}
        </div>
      </div>
    </div>
  `;
  
  // Category breakdown card
  const categoryCard = document.createElement('div');
  categoryCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  
  // Get top expense categories
  const categoryTotals = {};
  expenseEntries.forEach(entry => {
    if (!categoryTotals[entry.category]) {
      categoryTotals[entry.category] = 0;
    }
    categoryTotals[entry.category] += entry.amount;
  });
  
  // Sort categories by amount
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 categories
  
  categoryCard.innerHTML = `
    <div class="card-header mb-3">
      <h3 class="text-lg font-semibold">Top Expense Categories</h3>
    </div>
    
    ${sortedCategories.length > 0 ? `
      <div class="category-list">
        ${sortedCategories.map(([categoryId, amount]) => {
          const category = allCategories.find(cat => cat.id === categoryId) || 
                          { name: 'Other', icon: '🔹', split: 'needs' };
          
          // Determine the color based on the split category
          const colorClass = category.split === 'needs' ? 'bg-primary' : 
                            category.split === 'investments' ? 'bg-accent' : 
                            'bg-secondary';
          
          return `
            <div class="category-item mb-3">
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center">
                  <span class="mr-2">${category.icon}</span>
                  <span class="text-sm font-medium">${category.name}</span>
                </div>
                <span class="text-sm">${formatCurrency(amount)}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="${colorClass} h-2 rounded-full" style="width: ${Math.min(100, (amount / budgetStatus.expenses.total) * 100)}%"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : `
      <div class="text-center py-8 text-gray-500">
        <p>No expense data available</p>
      </div>
    `}
  `;
  
  // Recent transactions card
  const recentCard = document.createElement('div');
  recentCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  
  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenseEntries].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  }).slice(0, 5); // Get only the 5 most recent
  
  recentCard.innerHTML = `
    <div class="card-header mb-3">
      <h3 class="text-lg font-semibold">Recent Transactions</h3>
    </div>
    
    ${sortedExpenses.length > 0 ? `
      <div class="recent-transactions">
        ${sortedExpenses.map(expense => {
          const category = allCategories.find(cat => cat.id === expense.category) || 
                          { name: 'Other', icon: '🔹', split: 'needs' };
          
          return `
            <div class="transaction-item flex items-center justify-between py-2 border-b border-gray-100">
              <div class="flex items-center">
                <div class="mr-2 text-lg">${category.icon}</div>
                <div>
                  <div class="font-medium">${expense.merchant}</div>
                  <div class="text-xs text-gray-500">${formatDate(expense.date)}</div>
                </div>
              </div>
              <div class="font-medium">${formatCurrency(expense.amount)}</div>
            </div>
          `;
        }).join('')}
        
        <div class="mt-3 text-center">
          <a href="#" id="view-all-expenses" class="text-primary text-sm hover:underline">
            View All Transactions
          </a>
        </div>
      </div>
    ` : `
      <div class="text-center py-8 text-gray-500">
        <p>No recent transactions</p>
      </div>
    `}
  `;
  
  budgetSection.appendChild(progressCard);
  budgetSection.appendChild(categoryCard);
  budgetSection.appendChild(recentCard);
  expensesContainer.appendChild(budgetSection);
  
  // Expense list section
  const expenseListSection = document.createElement('section');
  expenseListSection.className = 'expense-list mb-8';
  expenseListSection.innerHTML = `
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Expense Transactions</h3>
        <div class="flex space-x-2">
          <select id="expense-filter" class="p-2 border rounded-md text-sm">
            <option value="all">All Categories</option>
            <option value="needs">Needs</option>
            <option value="investments">Investments</option>
            <option value="savings">Savings</option>
          </select>
          <select id="expense-time-filter" class="p-2 border rounded-md text-sm">
            <option value="all">All Time</option>
            <option value="month" selected>This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Split</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" id="expense-entries">
            ${expenseEntries.map((expense, index) => {
              const category = allCategories.find(cat => cat.id === expense.category) || 
                             { name: 'Other', icon: '🔹', split: 'needs' };
              
              return `
                <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}" data-entry-id="${expense.id}">
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${formatDate(expense.date)}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <span class="inline-flex items-center">
                      <span class="mr-1">${category.icon}</span>
                      ${category.name}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${expense.merchant}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-900">
                    ${expense.description || '-'}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${formatCurrency(expense.amount)}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <span class="px-2 py-1 text-xs rounded-full ${
                      expense.split === 'needs' ? 'bg-green-100 text-green-800' : 
                      expense.split === 'investments' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }">
                      ${expense.split.charAt(0).toUpperCase() + expense.split.slice(1)}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <button class="edit-expense-btn text-blue-600 hover:text-blue-800 mr-3">
                      Edit
                    </button>
                    <button class="delete-expense-btn text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      
      ${expenseEntries.length === 0 ? `
        <div class="text-center py-8 text-gray-500">
          <p>No expense entries found</p>
          <button id="add-first-expense-btn" class="mt-2 text-primary hover:underline">Add your first expense</button>
        </div>
      ` : ''}
    </div>
  `;
  expensesContainer.appendChild(expenseListSection);
  
  // Expense form modal
  const modalContainer = document.createElement('div');
  modalContainer.id = 'expense-modal';
  modalContainer.className = 'modal-container fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
  modalContainer.style.backdropFilter = 'blur(3px)';
  
  modalContainer.innerHTML = `
    <div class="modal-content bg-white rounded-lg w-full max-w-md p-6 relative">
      <button id="close-modal-btn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
      <h3 class="text-xl font-bold mb-4" id="modal-title">Add Expense</h3>
      
      <form id="expense-form">
        <input type="hidden" id="expense-id">
        
        <div class="mb-4">
          <label for="expense-date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" id="expense-date" required
                 class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        
        <div class="mb-4">
          <label for="expense-amount" class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input type="number" id="expense-amount" min="0" step="0.01" required
                 class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        
        <div class="mb-4">
          <label for="expense-merchant" class="block text-sm font-medium text-gray-700 mb-1">Merchant/Payee</label>
          <input type="text" id="expense-merchant" required
                 class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        
        <div class="mb-4">
          <label for="expense-split" class="block text-sm font-medium text-gray-700 mb-1">Split Category</label>
          <select id="expense-split" required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="needs">Needs (40%)</option>
            <option value="investments">Investments (30%)</option>
            <option value="savings">Savings (30%)</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label for="expense-category" class="block text-sm font-medium text-gray-700 mb-1">Expense Category</label>
          <select id="expense-category" required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            <optgroup label="Needs (40%)">
              ${expenseCategories.needs.map(category => `
                <option value="${category.id}" data-split="needs">${category.icon} ${category.name}</option>
              `).join('')}
            </optgroup>
            <optgroup label="Investments (30%)">
              ${expenseCategories.investments.map(category => `
                <option value="${category.id}" data-split="investments">${category.icon} ${category.name}</option>
              `).join('')}
            </optgroup>
            <optgroup label="Savings (30%)">
              ${expenseCategories.savings.map(category => `
                <option value="${category.id}" data-split="savings">${category.icon} ${category.name}</option>
              `).join('')}
            </optgroup>
          </select>
        </div>
        
        <div class="mb-6">
          <label for="expense-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="expense-description" rows="2"
                   class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
        </div>
        
        <div class="flex justify-end">
          <button type="button" id="cancel-expense-btn" 
                  class="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" id="save-expense-btn"
                  class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
            Save Expense
          </button>
        </div>
      </form>
    </div>
  `;
  expensesContainer.appendChild(modalContainer);
  
  // Add event listeners
  setTimeout(() => {
    // Add expense button
    const addExpenseBtn = expensesContainer.querySelector('#add-expense-btn');
    if (addExpenseBtn) {
      addExpenseBtn.addEventListener('click', () => {
        const modal = expensesContainer.querySelector('#expense-modal');
        const modalTitle = modal.querySelector('#modal-title');
        const form = modal.querySelector('#expense-form');
        
        // Reset form
        form.reset();
        document.getElementById('expense-id').value = '';
        
        // Set default date to today
        document.getElementById('expense-date').valueAsDate = new Date();
        
        // Update modal title
        modalTitle.textContent = 'Add Expense';
        
        // Show modal
        modal.classList.remove('hidden');
      });
    }
    
    // Add first expense button (shown when no expense entries exist)
    const addFirstExpenseBtn = expensesContainer.querySelector('#add-first-expense-btn');
    if (addFirstExpenseBtn) {
      addFirstExpenseBtn.addEventListener('click', () => {
        const addExpenseBtn = expensesContainer.querySelector('#add-expense-btn');
        if (addExpenseBtn) {
          addExpenseBtn.click();
        }
      });
    }
    
    // Close modal buttons
    const closeModalBtn = expensesContainer.querySelector('#close-modal-btn');
    const cancelExpenseBtn = expensesContainer.querySelector('#cancel-expense-btn');
    
    [closeModalBtn, cancelExpenseBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          const modal = expensesContainer.querySelector('#expense-modal');
          modal.classList.add('hidden');
        });
      }
    });
    
    // Split category selector
    const splitSelect = expensesContainer.querySelector('#expense-split');
    const categorySelect = expensesContainer.querySelector('#expense-category');
    
    if (splitSelect && categorySelect) {
      splitSelect.addEventListener('change', () => {
        const selectedSplit = splitSelect.value;
        
        // Filter categories based on selected split
        const allOptions = categorySelect.querySelectorAll('option');
        allOptions.forEach(option => {
          if (option.dataset.split === selectedSplit) {
            option.hidden = false;
            option.disabled = false;
          } else {
            option.hidden = true;
            option.disabled = true;
          }
        });
        
        // Select first visible option
        const firstVisibleOption = categorySelect.querySelector(`option[data-split="${selectedSplit}"]:not([disabled])`);
        if (firstVisibleOption) {
          firstVisibleOption.selected = true;
        }
      });
      
      // Sync category when split changes
      categorySelect.addEventListener('change', () => {
        const selectedOption = categorySelect.options[categorySelect.selectedIndex];
        if (selectedOption && selectedOption.dataset.split) {
          splitSelect.value = selectedOption.dataset.split;
        }
      });
    }
    
    // Edit expense buttons
    const editButtons = expensesContainer.querySelectorAll('.edit-expense-btn');
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        const entryId = parseInt(row.dataset.entryId);
        
        // Find the expense entry
        const entry = expenseEntries.find(i => i.id === entryId);
        if (!entry) return;
        
        // Populate the form
        document.getElementById('expense-id').value = entry.id;
        document.getElementById('expense-date').value = new Date(entry.date).toISOString().split('T')[0];
        document.getElementById('expense-amount').value = entry.amount;
        document.getElementById('expense-merchant').value = entry.merchant;
        document.getElementById('expense-description').value = entry.description || '';
        document.getElementById('expense-split').value = entry.split;
        
        // Need to trigger change event to filter categories
        const event = new Event('change');
        document.getElementById('expense-split').dispatchEvent(event);
        
        document.getElementById('expense-category').value = entry.category;
        
        // Update modal title
        document.getElementById('modal-title').textContent = 'Edit Expense';
        
        // Show modal
        document.getElementById('expense-modal').classList.remove('hidden');
      });
    });
    
    // Delete expense buttons
    const deleteButtons = expensesContainer.querySelectorAll('.delete-expense-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (confirm('Are you sure you want to delete this expense entry?')) {
          const row = e.target.closest('tr');
          const entryId = parseInt(row.dataset.entryId);
          
          // Delete the entry
          if (deleteExpenseEntry(entryId)) {
            // Remove the row from the table
            row.remove();
            
            // Check if table is now empty
            const expenseEntries = expensesContainer.querySelector('#expense-entries');
            if (expenseEntries && expenseEntries.children.length === 0) {
              expenseEntries.innerHTML = `
                <tr>
                  <td colspan="7" class="text-center py-4 text-gray-500">
                    No expense entries found
                    <div>
                      <button id="add-first-expense-btn" class="mt-2 text-primary hover:underline">
                        Add your first expense
                      </button>
                    </div>
                  </td>
                </tr>
              `;
              
              // Re-add event listener to the new button
              const newAddFirstBtn = expenseEntries.querySelector('#add-first-expense-btn');
              if (newAddFirstBtn) {
                newAddFirstBtn.addEventListener('click', () => {
                  const addExpenseBtn = expensesContainer.querySelector('#add-expense-btn');
                  if (addExpenseBtn) {
                    addExpenseBtn.click();
                  }
                });
              }
            }
            
            // Update budget status
            window.location.reload();
          }
        }
      });
    });
    
    // Expense form submission
    const expenseForm = expensesContainer.querySelector('#expense-form');
    if (expenseForm) {
      expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const id = document.getElementById('expense-id').value ? parseInt(document.getElementById('expense-id').value) : null;
        const date = document.getElementById('expense-date').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const merchant = document.getElementById('expense-merchant').value;
        const description = document.getElementById('expense-description').value;
        const category = document.getElementById('expense-category').value;
        const split = document.getElementById('expense-split').value;
        
        // Create expense entry object
        const expenseEntry = {
          id,
          date: new Date(date).toISOString(),
          amount,
          merchant,
          description,
          category,
          split
        };
        
        // Save the entry
        const savedEntry = saveExpenseEntry(expenseEntry);
        
        // Close the modal
        document.getElementById('expense-modal').classList.add('hidden');
        
        // Refresh the page to show the new entry
        // In a real app, you would just update the DOM
        window.location.reload();
      });
    }
    
    // Expense filter
    const expenseFilter = expensesContainer.querySelector('#expense-filter');
    const timeFilter = expensesContainer.querySelector('#expense-time-filter');
    
    function applyFilters() {
      const splitFilter = expenseFilter.value;
      const timeFilterValue = timeFilter.value;
      const now = new Date();
      
      // Filter expense entries based on selection
      let filteredEntries = [...expenseEntries];
      
      // Apply split filter
      if (splitFilter !== 'all') {
        filteredEntries = filteredEntries.filter(entry => entry.split === splitFilter);
      }
      
      // Apply time filter
      if (timeFilterValue === 'month') {
        // Filter to current month
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        filteredEntries = filteredEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });
      } else if (timeFilterValue === 'year') {
        // Filter to current year
        const currentYear = now.getFullYear();
        
        filteredEntries = filteredEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getFullYear() === currentYear;
        });
      }
      
      // Rebuild the table with filtered entries
      const tableBody = expensesContainer.querySelector('#expense-entries');
      
      if (filteredEntries.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4 text-gray-500">
              No expense entries found for the selected filters
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = filteredEntries.map((expense, index) => {
          const category = allCategories.find(cat => cat.id === expense.category) || 
                         { name: 'Other', icon: '🔹', split: 'needs' };
          
          return `
            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}" data-entry-id="${expense.id}">
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                ${formatDate(expense.date)}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <span class="inline-flex items-center">
                  <span class="mr-1">${category.icon}</span>
                  ${category.name}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                ${expense.merchant}
              </td>
              <td class="px-4 py-3 text-sm text-gray-900">
                ${expense.description || '-'}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                ${formatCurrency(expense.amount)}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <span class="px-2 py-1 text-xs rounded-full ${
                  expense.split === 'needs' ? 'bg-green-100 text-green-800' : 
                  expense.split === 'investments' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'
                }">
                  ${expense.split.charAt(0).toUpperCase() + expense.split.slice(1)}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <button class="edit-expense-btn text-blue-600 hover:text-blue-800 mr-3">
                  Edit
                </button>
                <button class="delete-expense-btn text-red-600 hover:text-red-800">
                  Delete
                </button>
              </td>
            </tr>
          `;
        }).join('');
        
        // Re-attach event listeners
        const newEditButtons = tableBody.querySelectorAll('.edit-expense-btn');
        newEditButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const entryId = parseInt(row.dataset.entryId);
            
            // Find the expense entry
            const entry = expenseEntries.find(i => i.id === entryId);
            if (!entry) return;
            
            // Populate the form
            document.getElementById('expense-id').value = entry.id;
            document.getElementById('expense-date').value = new Date(entry.date).toISOString().split('T')[0];
            document.getElementById('expense-amount').value = entry.amount;
            document.getElementById('expense-merchant').value = entry.merchant;
            document.getElementById('expense-description').value = entry.description || '';
            document.getElementById('expense-split').value = entry.split;
            
            // Need to trigger change event to filter categories
            const event = new Event('change');
            document.getElementById('expense-split').dispatchEvent(event);
            
            document.getElementById('expense-category').value = entry.category;
            
            // Update modal title
            document.getElementById('modal-title').textContent = 'Edit Expense';
            
            // Show modal
            document.getElementById('expense-modal').classList.remove('hidden');
          });
        });
        
        const newDeleteButtons = tableBody.querySelectorAll('.delete-expense-btn');
        newDeleteButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            if (confirm('Are you sure you want to delete this expense entry?')) {
              const row = e.target.closest('tr');
              const entryId = parseInt(row.dataset.entryId);
              
              // Delete the entry
              if (deleteExpenseEntry(entryId)) {
                // Refresh page to update all components
                window.location.reload();
              }
            }
          });
        });
      }
    }
    
    if (expenseFilter) {
      expenseFilter.addEventListener('change', applyFilters);
    }
    
    if (timeFilter) {
      timeFilter.addEventListener('change', applyFilters);
    }
    
    // View all expenses button
    const viewAllBtn = expensesContainer.querySelector('#view-all-expenses');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Scroll to expense list
        expenseListSection.scrollIntoView({ behavior: 'smooth' });
        
        // Set filters to show all
        if (timeFilter) {
          timeFilter.value = 'all';
          const event = new Event('change');
          timeFilter.dispatchEvent(event);
        }
      });
    }
  }, 100);
  
  return expensesContainer;
}