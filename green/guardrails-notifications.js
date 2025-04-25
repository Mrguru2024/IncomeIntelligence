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
  
  // Add the new transaction amount
  const totalSpending = currentSpending + transaction.amount;
  
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
 * This is a stub function that would be replaced with actual logic in a production app
 * @param {string} userId - User ID
 * @param {string} category - Spending category
 * @param {string} period - Period (weekly/monthly)
 * @returns {number} - Total spending amount
 */
function calculateSpendingForPeriod(userId, category, period) {
  // This would normally query the database for transactions in the current period
  // For the GREEN version, we'll return a random amount between 0 and 500
  return Math.random() * 500;
}

/**
 * Simulate a new transaction to test the notification system
 * @param {string} userId - User ID
 * @param {Array} spendingLimits - User's spending limits
 */
export function simulateTransaction(userId, spendingLimits) {
  if (!spendingLimits || !Array.isArray(spendingLimits) || spendingLimits.length === 0) {
    return;
  }
  
  // Randomly select a spending limit category
  const randomIndex = Math.floor(Math.random() * spendingLimits.length);
  const selectedLimit = spendingLimits[randomIndex];
  
  // Create a mock transaction
  const transaction = {
    id: `txn-${Date.now()}`,
    category: selectedLimit.category,
    description: `Test Transaction - ${selectedLimit.category}`,
    amount: Math.random() * parseFloat(selectedLimit.amount) * 1.2, // Random amount up to 120% of limit
    date: new Date().toISOString()
  };
  
  // Check the transaction against spending limits
  checkSpendingLimits(userId, transaction, spendingLimits);
  
  return transaction;
}