/**
 * Financial Summary Service
 * Generates and sends weekly and monthly financial summaries
 */

import { createFinancialSummaryNotification } from './notification-service.js';

/**
 * Generate a weekly financial summary for a user
 * @param {string} userId - User ID
 * @param {Object} financialData - User's financial data
 */
export function generateWeeklySummary(userId, financialData) {
  if (!userId || !financialData) return;
  
  // Fetch the user's financial data for the past week
  // Use the provided data or calculate from transaction history
  
  const weeklyData = financialData.weekly || calculateWeeklyData(userId);
  
  // Calculate key metrics
  const totalIncome = weeklyData.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = weeklyData.expenses.reduce((sum, item) => sum + item.amount, 0);
  const netCashflow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;
  
  // Determine top spending category
  const spendingByCategory = weeklyData.expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {});
  
  const topCategory = Object.entries(spendingByCategory)
    .sort((a, b) => b[1] - a[1])
    .shift();
  
  // Create summary data
  const summaryData = {
    period: 'weekly',
    startDate: weeklyData.startDate,
    endDate: weeklyData.endDate,
    totalIncome,
    totalExpenses,
    netCashflow,
    savingsRate,
    topSpendingCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
    incomeBreakdown: weeklyData.income,
    expensesByCategory: spendingByCategory
  };
  
  // Generate summary message
  const summaryMessage = createSummaryMessage(summaryData);
  
  // Create notification
  createFinancialSummaryNotification(
    userId,
    'Your Weekly Financial Summary',
    summaryMessage,
    summaryData,
    true, // Show in app
    true,  // Send email
    false  // Don't send push
  );
  
  return summaryData;
}

/**
 * Generate a monthly financial summary for a user
 * @param {string} userId - User ID
 * @param {Object} financialData - User's financial data
 */
export function generateMonthlySummary(userId, financialData) {
  if (!userId || !financialData) return;
  
  // Fetch the user's financial data for the past month
  // Use the provided data or calculate from transaction history
  
  const monthlyData = financialData.monthly || calculateMonthlyData(userId);
  
  // Calculate key metrics
  const totalIncome = monthlyData.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = monthlyData.expenses.reduce((sum, item) => sum + item.amount, 0);
  const netCashflow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;
  
  // Compare to previous month if available
  const previousMonth = financialData.previousMonth;
  let incomeChange = null;
  let expenseChange = null;
  let savingsRateChange = null;
  
  if (previousMonth) {
    const prevTotalIncome = previousMonth.income.reduce((sum, item) => sum + item.amount, 0);
    const prevTotalExpenses = previousMonth.expenses.reduce((sum, item) => sum + item.amount, 0);
    const prevSavingsRate = prevTotalIncome > 0 ? ((prevTotalIncome - prevTotalExpenses) / prevTotalIncome * 100) : 0;
    
    incomeChange = calculatePercentageChange(prevTotalIncome, totalIncome);
    expenseChange = calculatePercentageChange(prevTotalExpenses, totalExpenses);
    savingsRateChange = parseFloat(savingsRate) - prevSavingsRate;
  }
  
  // Determine top spending categories
  const spendingByCategory = monthlyData.expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {});
  
  const topCategories = Object.entries(spendingByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  // Create summary data
  const summaryData = {
    period: 'monthly',
    month: monthlyData.month,
    year: monthlyData.year,
    totalIncome,
    totalExpenses,
    netCashflow,
    savingsRate,
    topSpendingCategories: topCategories.map(([name, amount]) => ({ name, amount })),
    incomeChange,
    expenseChange,
    savingsRateChange,
    incomeBreakdown: monthlyData.income,
    expensesByCategory: spendingByCategory,
    goals: monthlyData.goals || []
  };
  
  // Generate summary message
  const summaryMessage = createMonthlySummaryMessage(summaryData);
  
  // Create notification
  createFinancialSummaryNotification(
    userId,
    `Your ${monthlyData.month} ${monthlyData.year} Financial Summary`,
    summaryMessage,
    summaryData,
    true, // Show in app
    true,  // Send email
    false  // Don't send push
  );
  
  return summaryData;
}

/**
 * Create a summary message from the summary data
 * @param {Object} summaryData - The financial summary data
 * @returns {string} - Summary message text
 */
function createSummaryMessage(summaryData) {
  const {
    totalIncome,
    totalExpenses,
    netCashflow,
    savingsRate,
    topSpendingCategory
  } = summaryData;
  
  // Format currency values
  const formatCurrency = (value) => {
    return `$${Math.abs(value).toFixed(2)}`;
  };
  
  // Basic summary message
  let message = `This week's summary: Income: ${formatCurrency(totalIncome)}, Expenses: ${formatCurrency(totalExpenses)}, `;
  
  // Add net cashflow with appropriate wording
  if (netCashflow > 0) {
    message += `Net savings: ${formatCurrency(netCashflow)} (${savingsRate}% savings rate).`;
  } else if (netCashflow < 0) {
    message += `Net deficit: ${formatCurrency(Math.abs(netCashflow))}.`;
  } else {
    message += `Break-even for the week.`;
  }
  
  // Add top spending category if available
  if (topSpendingCategory) {
    message += ` Your highest spending category was ${topSpendingCategory.name}: ${formatCurrency(topSpendingCategory.amount)}.`;
  }
  
  return message;
}

/**
 * Create a monthly summary message from the summary data
 * @param {Object} summaryData - The financial summary data
 * @returns {string} - Summary message text
 */
function createMonthlySummaryMessage(summaryData) {
  const {
    month,
    year,
    totalIncome,
    totalExpenses,
    netCashflow,
    savingsRate,
    topSpendingCategories,
    incomeChange,
    expenseChange,
    savingsRateChange,
    goals
  } = summaryData;
  
  // Format currency values
  const formatCurrency = (value) => {
    return `$${Math.abs(value).toFixed(2)}`;
  };
  
  // Basic summary message
  let message = `Your ${month} ${year} summary: Income: ${formatCurrency(totalIncome)}, Expenses: ${formatCurrency(totalExpenses)}, `;
  
  // Add net cashflow with appropriate wording
  if (netCashflow > 0) {
    message += `Net savings: ${formatCurrency(netCashflow)} (${savingsRate}% savings rate).`;
  } else if (netCashflow < 0) {
    message += `Net deficit: ${formatCurrency(Math.abs(netCashflow))}.`;
  } else {
    message += `Break-even for the month.`;
  }
  
  // Add change compared to previous month if available
  if (incomeChange !== null) {
    message += ` Compared to last month: Income ${formatChangeString(incomeChange)}, `;
    message += `Expenses ${formatChangeString(expenseChange)}, `;
    
    if (savingsRateChange !== null) {
      if (savingsRateChange > 0) {
        message += `Savings rate increased by ${savingsRateChange.toFixed(1)} percentage points.`;
      } else if (savingsRateChange < 0) {
        message += `Savings rate decreased by ${Math.abs(savingsRateChange).toFixed(1)} percentage points.`;
      } else {
        message += `Savings rate unchanged.`;
      }
    }
  }
  
  // Add top spending categories if available
  if (topSpendingCategories && topSpendingCategories.length > 0) {
    message += ` Top spending categories: `;
    topSpendingCategories.forEach((category, index) => {
      message += `${category.name} (${formatCurrency(category.amount)})`;
      if (index < topSpendingCategories.length - 1) {
        message += `, `;
      }
    });
    message += `.`;
  }
  
  // Add goal progress if available
  if (goals && goals.length > 0) {
    const completedGoals = goals.filter(goal => goal.completed);
    if (completedGoals.length > 0) {
      message += ` You achieved ${completedGoals.length} financial goal${completedGoals.length > 1 ? 's' : ''} this month!`;
    }
  }
  
  return message;
}

/**
 * Format a percentage change as a string
 * @param {number} change - The percentage change
 * @returns {string} - Formatted change string
 */
function formatChangeString(change) {
  if (change > 0) {
    return `increased by ${change.toFixed(1)}%`;
  } else if (change < 0) {
    return `decreased by ${Math.abs(change).toFixed(1)}%`;
  } else {
    return `unchanged`;
  }
}

/**
 * Calculate percentage change between two values
 * @param {number} oldValue - Previous value
 * @param {number} newValue - Current value
 * @returns {number} - Percentage change
 */
function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue * 100).toFixed(1);
}

/**
 * Calculate weekly financial data from user's transaction history
 * @param {string} userId - User ID
 * @returns {Object} - Weekly financial data
 */
function calculateWeeklyData(userId) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7);
  
  // Fetch user's transactions for the past week
  const transactions = fetchUserTransactions(userId, startDate, today);
  
  // Group transactions into income and expenses
  const income = transactions.filter(transaction => transaction.amount > 0)
    .map(transaction => ({
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount
    }));
  
  const expenses = transactions.filter(transaction => transaction.amount < 0)
    .map(transaction => ({
      category: transaction.category,
      description: transaction.description,
      amount: Math.abs(transaction.amount) // Convert to positive for easier calculations
    }));
  
  return {
    startDate: startDate.toISOString(),
    endDate: today.toISOString(),
    income,
    expenses
  };
}

/**
 * Fetch user transactions for a specific date range
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} - Array of transaction objects
 */
function fetchUserTransactions(userId, startDate, endDate) {
  // In a production app, this would query the database or transaction API
  
  // For the GREEN version, we'll try to get transactions from localStorage
  // or return an empty array if none exist
  try {
    const transactionKey = `stackr_transactions_${userId}`;
    const storedTransactions = localStorage.getItem(transactionKey);
    
    if (!storedTransactions) {
      return [];
    }
    
    const allTransactions = JSON.parse(storedTransactions);
    
    // Filter transactions by date range
    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }
}

/**
 * Fetch user goals
 * @param {string} userId - User ID
 * @returns {Array} - Array of goal objects
 */
function fetchUserGoals(userId) {
  // In a production app, this would query the database or goals API
  
  // For the GREEN version, we'll try to get goals from localStorage
  // or return an empty array if none exist
  try {
    const goalsKey = `stackr_goals_${userId}`;
    const storedGoals = localStorage.getItem(goalsKey);
    
    if (!storedGoals) {
      return [];
    }
    
    return JSON.parse(storedGoals);
  } catch (error) {
    console.error('Error fetching user goals:', error);
    return [];
  }
}

/**
 * Calculate monthly financial data from user's transaction history
 * @param {string} userId - User ID
 * @returns {Object} - Monthly financial data
 */
function calculateMonthlyData(userId) {
  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();
  
  // Calculate start of current month and previous month
  const startOfMonth = new Date(year, today.getMonth(), 1);
  const startOfPrevMonth = new Date(year, today.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(year, today.getMonth(), 0);
  
  // Fetch transactions for current and previous month
  const currentMonthTransactions = fetchUserTransactions(userId, startOfMonth, today);
  const prevMonthTransactions = fetchUserTransactions(userId, startOfPrevMonth, endOfPrevMonth);
  
  // Group current month transactions into income and expenses
  const income = currentMonthTransactions.filter(transaction => transaction.amount > 0)
    .map(transaction => ({
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount
    }));
  
  const expenses = currentMonthTransactions.filter(transaction => transaction.amount < 0)
    .map(transaction => ({
      category: transaction.category,
      description: transaction.description,
      amount: Math.abs(transaction.amount) // Convert to positive for easier calculations
    }));
  
  // Process previous month data (if available)
  let previousMonth = null;
  if (prevMonthTransactions.length > 0) {
    const prevIncome = prevMonthTransactions.filter(transaction => transaction.amount > 0)
      .map(transaction => ({
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount
      }));
    
    const prevExpenses = prevMonthTransactions.filter(transaction => transaction.amount < 0)
      .map(transaction => ({
        category: transaction.category,
        description: transaction.description,
        amount: Math.abs(transaction.amount) // Convert to positive for easier calculations
      }));
    
    previousMonth = {
      income: prevIncome,
      expenses: prevExpenses
    };
  }
  
  // Fetch user goals
  const goals = fetchUserGoals(userId);
  
  return {
    month,
    year,
    income,
    expenses,
    previousMonth,
    goals
  };
}

/**
 * Schedule weekly summary generation
 * @param {string} userId - User ID
 * @param {function} getFinancialDataCallback - Callback to get financial data
 */
export function scheduleWeeklySummary(userId, getFinancialDataCallback) {
  // In a real app, we would schedule this with a recurring timer or cron job
  // For the GREEN version, we'll just return a function that can be called manually
  
  return function generateNow() {
    const financialData = getFinancialDataCallback ? getFinancialDataCallback() : null;
    return generateWeeklySummary(userId, financialData);
  };
}

/**
 * Schedule monthly summary generation
 * @param {string} userId - User ID
 * @param {function} getFinancialDataCallback - Callback to get financial data
 */
export function scheduleMonthlySummary(userId, getFinancialDataCallback) {
  // In a real app, we would schedule this with a recurring timer or cron job
  // For the GREEN version, we'll just return a function that can be called manually
  
  return function generateNow() {
    const financialData = getFinancialDataCallback ? getFinancialDataCallback() : null;
    return generateMonthlySummary(userId, financialData);
  };
}

/**
 * Get financial insights for the personal financial assessment
 * @param {string} userId - User ID
 * @returns {Object} - User's financial data and insights
 */
export async function getFinancialInsights(userId) {
  // In a real app, this would fetch comprehensive financial data
  // For the GREEN version, we'll build a simplified dataset
  
  try {
    // Get current transactions
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    // Fetch transactions for the past 6 months
    const transactions = fetchUserTransactions(userId, sixMonthsAgo, today);
    
    // Get income data
    const incomeTransactions = transactions.filter(transaction => transaction.amount > 0);
    const income = incomeTransactions.map(transaction => ({
      amount: transaction.amount,
      date: transaction.date,
      source: transaction.category || 'Other',
      description: transaction.description
    }));
    
    // Get expense data
    const expenseTransactions = transactions.filter(transaction => transaction.amount < 0);
    const expenses = expenseTransactions.map(transaction => ({
      amount: Math.abs(transaction.amount),
      date: transaction.date,
      category: transaction.category || 'Other',
      description: transaction.description
    }));
    
    // Get budget data
    const budgets = getUserBudgets(userId);
    
    // Get goals data
    const goals = fetchUserGoals(userId);
    
    // Get investment data
    const investments = getUserInvestments(userId);
    
    // Get debt data
    const debt = getUserDebt(userId);
    
    // Get guardrails (spending limits) data
    const spendingLimits = getUserSpendingLimits(userId);
    
    // Get income split config
    const incomeSplit = getUserIncomeSplit(userId) || { needs: 40, wants: 30, savings: 30 };
    
    // Compile all data
    return {
      userData: {
        income,
        expenses,
        budgets,
        goals,
        investments,
        debt,
        spendingLimits,
        incomeSplit
      }
    };
  } catch (error) {
    console.error('Error getting financial insights:', error);
    return { userData: {} };
  }
}

/**
 * Get user's budgets
 * @param {string} userId - User ID
 * @returns {Array} - Array of budget objects
 */
function getUserBudgets(userId) {
  try {
    const budgetsKey = `stackr_budgets_${userId}`;
    const storedBudgets = localStorage.getItem(budgetsKey);
    
    if (!storedBudgets) {
      return [];
    }
    
    return JSON.parse(storedBudgets);
  } catch (error) {
    console.error('Error fetching user budgets:', error);
    return [];
  }
}

/**
 * Get user's investments
 * @param {string} userId - User ID
 * @returns {Array} - Array of investment objects
 */
function getUserInvestments(userId) {
  try {
    const investmentsKey = `stackr_investments_${userId}`;
    const storedInvestments = localStorage.getItem(investmentsKey);
    
    if (!storedInvestments) {
      return [];
    }
    
    return JSON.parse(storedInvestments);
  } catch (error) {
    console.error('Error fetching user investments:', error);
    return [];
  }
}

/**
 * Get user's debt information
 * @param {string} userId - User ID
 * @returns {Array} - Array of debt objects
 */
function getUserDebt(userId) {
  try {
    const debtKey = `stackr_debt_${userId}`;
    const storedDebt = localStorage.getItem(debtKey);
    
    if (!storedDebt) {
      return [];
    }
    
    return JSON.parse(storedDebt);
  } catch (error) {
    console.error('Error fetching user debt:', error);
    return [];
  }
}

/**
 * Get user's spending limits (guardrails)
 * @param {string} userId - User ID
 * @returns {Array} - Array of spending limit objects
 */
function getUserSpendingLimits(userId) {
  try {
    const limitsKey = `stackr_spending_limits_${userId}`;
    const storedLimits = localStorage.getItem(limitsKey);
    
    if (!storedLimits) {
      return [];
    }
    
    return JSON.parse(storedLimits);
  } catch (error) {
    console.error('Error fetching user spending limits:', error);
    return [];
  }
}

/**
 * Get user's income split configuration
 * @param {string} userId - User ID
 * @returns {Object} - Income split configuration
 */
function getUserIncomeSplit(userId) {
  try {
    const splitKey = `stackr_income_split_${userId}`;
    const storedSplit = localStorage.getItem(splitKey);
    
    if (!storedSplit) {
      return null;
    }
    
    return JSON.parse(storedSplit);
  } catch (error) {
    console.error('Error fetching user income split:', error);
    return null;
  }
}