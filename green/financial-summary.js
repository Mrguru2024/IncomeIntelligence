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
  
  // In a real app, we would fetch the user's financial data for the past week
  // For this demo, we'll use the provided data or generate some mock data
  
  const weeklyData = financialData.weekly || generateMockWeeklyData();
  
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
  
  // In a real app, we would fetch the user's financial data for the past month
  // For this demo, we'll use the provided data or generate some mock data
  
  const monthlyData = financialData.monthly || generateMockMonthlyData();
  
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
 * Generate mock weekly financial data
 * @returns {Object} - Mock weekly financial data
 */
function generateMockWeeklyData() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7);
  
  return {
    startDate: startDate.toISOString(),
    endDate: today.toISOString(),
    income: [
      { category: 'Salary', description: 'Weekly paycheck', amount: 850 },
      { category: 'Side Gig', description: 'Freelance work', amount: 200 }
    ],
    expenses: [
      { category: 'Groceries', description: 'Weekly groceries', amount: 120 },
      { category: 'Dining', description: 'Restaurants', amount: 85 },
      { category: 'Transportation', description: 'Gas & transit', amount: 60 },
      { category: 'Entertainment', description: 'Movies & activities', amount: 45 },
      { category: 'Shopping', description: 'Clothing', amount: 75 }
    ]
  };
}

/**
 * Generate mock monthly financial data
 * @returns {Object} - Mock monthly financial data
 */
function generateMockMonthlyData() {
  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' });
  
  return {
    month,
    year: today.getFullYear(),
    income: [
      { category: 'Salary', description: 'Monthly paycheck', amount: 3400 },
      { category: 'Side Gig', description: 'Freelance work', amount: 800 },
      { category: 'Investments', description: 'Dividend payments', amount: 200 }
    ],
    expenses: [
      { category: 'Housing', description: 'Rent/Mortgage', amount: 1200 },
      { category: 'Groceries', description: 'Monthly groceries', amount: 480 },
      { category: 'Dining', description: 'Restaurants', amount: 340 },
      { category: 'Transportation', description: 'Gas & transit', amount: 240 },
      { category: 'Entertainment', description: 'Movies & activities', amount: 180 },
      { category: 'Shopping', description: 'Clothing', amount: 250 },
      { category: 'Utilities', description: 'Electric, water, internet', amount: 210 },
      { category: 'Insurance', description: 'Auto & renters', amount: 150 }
    ],
    goals: [
      { name: 'Emergency Fund', target: 1000, current: 1200, completed: true },
      { name: 'Vacation Savings', target: 2000, current: 1500, completed: false }
    ]
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