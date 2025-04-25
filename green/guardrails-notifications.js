/**
 * Guardrails Notifications Integration
 * Connects the Guardrails spending limits feature with the notification system
 */

import { createSpendingAlertNotification } from './notification-service.js';

/**
 * Check spending against limits and create notifications as needed
 * @param {string} userId - User ID
 * @param {Object} transaction - Transaction data
 * @param {Array} spendingLimits - User's spending limits
 */
export function checkSpendingLimits(userId, transaction, spendingLimits) {
  if (!transaction || !spendingLimits || !Array.isArray(spendingLimits)) {
    return;
  }
  
  // Find matching spending limit for the transaction category
  const matchingLimit = spendingLimits.find(limit => 
    limit.category.toLowerCase() === transaction.category.toLowerCase());
  
  if (!matchingLimit) return;
  
  // Calculate current spending for this period
  const currentSpending = calculateSpendingForPeriod(userId, matchingLimit.category, matchingLimit.period);
  
  // Add the new transaction amount (use absolute value since expenses are stored as negative)
  const transactionAmount = Math.abs(transaction.amount);
  const totalSpending = currentSpending + transactionAmount;
  
  // Check against thresholds
  const limitAmount = parseFloat(matchingLimit.amount);
  
  // Check if approaching limit (80% of limit)
  if (totalSpending >= limitAmount * 0.8 && totalSpending < limitAmount) {
    createApproachingLimitNotification(userId, transaction, matchingLimit, totalSpending);
  }
  
  // Check if exceeded limit
  if (totalSpending >= limitAmount) {
    createLimitExceededNotification(userId, transaction, matchingLimit, totalSpending);
  }
}

/**
 * Check all spending categories against their limits
 * @param {string} userId - User ID
 * @param {Array} spendingLimits - User's spending limits
 */
export function checkAllSpendingLimits(userId, spendingLimits) {
  if (!userId || !spendingLimits || !Array.isArray(spendingLimits)) {
    return;
  }
  
  // Process each spending limit
  spendingLimits.forEach(limit => {
    // Calculate current spending for this category/period
    const totalSpending = calculateSpendingForPeriod(userId, limit.category, limit.period);
    
    // Check against thresholds
    const limitAmount = parseFloat(limit.amount);
    
    // Create a "reference transaction" for notification purposes
    const referenceTransaction = {
      id: `ref-${Date.now()}`,
      category: limit.category,
      description: `${limit.category} spending`,
      amount: -1, // Negative amount to represent an expense
      date: new Date().toISOString()
    };
    
    // Check if approaching limit (80% of limit)
    if (totalSpending >= limitAmount * 0.8 && totalSpending < limitAmount) {
      createApproachingLimitNotification(userId, referenceTransaction, limit, totalSpending);
    }
    
    // Check if exceeded limit
    if (totalSpending >= limitAmount) {
      createLimitExceededNotification(userId, referenceTransaction, limit, totalSpending);
    }
  });
}

/**
 * Create a notification when approaching spending limit
 * @param {string} userId - User ID
 * @param {Object} transaction - Transaction data
 * @param {Object} limit - Spending limit
 * @param {number} totalSpending - Total spending in the period
 */
function createApproachingLimitNotification(userId, transaction, limit, totalSpending) {
  const percentUsed = Math.round((totalSpending / parseFloat(limit.amount)) * 100);
  const remaining = parseFloat(limit.amount) - totalSpending;
  
  createSpendingAlertNotification(
    userId,
    `Approaching ${limit.category} spending limit`,
    `You've used ${percentUsed}% of your ${limit.period} ${limit.category} budget. $${remaining.toFixed(2)} remaining.`,
    {
      transaction,
      limit,
      totalSpending,
      percentUsed,
      remaining
    },
    true, // Show in app
    false, // Don't send email
    false  // Don't send push
  );
}

/**
 * Create a notification when spending limit is exceeded
 * @param {string} userId - User ID
 * @param {Object} transaction - Transaction data
 * @param {Object} limit - Spending limit
 * @param {number} totalSpending - Total spending in the period
 */
function createLimitExceededNotification(userId, transaction, limit, totalSpending) {
  const percentUsed = Math.round((totalSpending / parseFloat(limit.amount)) * 100);
  const overage = totalSpending - parseFloat(limit.amount);
  
  createSpendingAlertNotification(
    userId,
    `${limit.category} spending limit exceeded!`,
    `You've exceeded your ${limit.period} ${limit.category} budget by $${overage.toFixed(2)}.`,
    {
      transaction,
      limit,
      totalSpending,
      percentUsed,
      overage
    },
    true, // Show in app
    true,  // Send email
    true   // Send push
  );
}

/**
 * Calculate current spending for a category and period
 * @param {string} userId - User ID
 * @param {string} category - Spending category
 * @param {string} period - Period (weekly/monthly)
 * @returns {number} - Total spending amount
 */
function calculateSpendingForPeriod(userId, category, period) {
  if (!userId || !category || !period) {
    return 0;
  }
  
  try {
    // Get the current date and calculate the start date based on the period
    const today = new Date();
    let startDate;
    
    if (period.toLowerCase() === 'weekly') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7); // 7 days ago
    } else if (period.toLowerCase() === 'monthly') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of current month
    } else {
      console.error(`Invalid period: ${period}`);
      return 0;
    }
    
    // Get user transactions
    const transactions = fetchUserTransactions(userId, startDate, today);
    
    // Filter by category and sum the amounts
    const categoryTransactions = transactions.filter(
      transaction => transaction.category.toLowerCase() === category.toLowerCase()
    );
    
    return categoryTransactions.reduce((total, transaction) => {
      // Expenses are stored as negative values, so we use absolute
      return total + Math.abs(transaction.amount);
    }, 0);
  } catch (error) {
    console.error('Error calculating spending for period:', error);
    return 0;
  }
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
 * Process a new transaction and check against guardrails limits
 * @param {string} userId - User ID
 * @param {Object} transaction - Transaction data
 * @param {Array} spendingLimits - User's spending limits
 */
export function processTransaction(userId, transaction, spendingLimits) {
  if (!userId || !transaction || !spendingLimits || !Array.isArray(spendingLimits)) {
    return;
  }
  
  // Validate transaction data
  if (!transaction.category || !transaction.amount || transaction.amount >= 0) {
    return; // Only process expense transactions (negative amounts)
  }
  
  // Check the transaction against spending limits
  checkSpendingLimits(userId, transaction, spendingLimits);
  
  // Save the transaction to localStorage for future reference
  saveTransaction(userId, transaction);
  
  return transaction;
}

/**
 * Save a transaction to localStorage
 * @param {string} userId - User ID
 * @param {Object} transaction - Transaction data
 */
function saveTransaction(userId, transaction) {
  if (!userId || !transaction) return;
  
  try {
    const transactionKey = `stackr_transactions_${userId}`;
    let transactions = [];
    
    // Get existing transactions
    const storedTransactions = localStorage.getItem(transactionKey);
    if (storedTransactions) {
      transactions = JSON.parse(storedTransactions);
    }
    
    // Add new transaction
    transactions.push(transaction);
    
    // Save back to localStorage
    localStorage.setItem(transactionKey, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
}