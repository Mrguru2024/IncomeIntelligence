/**
 * Financial Wellness Scorecard Module
 * Generates a personalized financial wellness score based on user's financial data and behaviors
 */

// Store the latest calculated scores for the user
let userScores = null;

// Category weights for calculating final score
const categoryWeights = {
  savingsRate: 0.25,       // 25% - How much of income is saved
  debtManagement: 0.20,    // 20% - Debt levels and payment consistency
  emergencyFund: 0.15,     // 15% - Emergency savings compared to monthly expenses
  budgetAdherence: 0.15,   // 15% - How well user sticks to budget
  investmentDiversity: 0.10, // 10% - Diversity of investments
  financialKnowledge: 0.10, // 10% - Based on interaction with educational content
  expenseControl: 0.05     // 5% - Control over discretionary spending
};

/**
 * Calculate a user's financial wellness score and breakdown
 * @param {string} userId - The user's ID
 * @returns {Object} User's financial scores
 */
async function calculateFinancialWellnessScore(userId) {
  try {
    // Fetch financial data for calculations
    const financialData = await fetchUserFinancialData(userId);
    
    if (!financialData) {
      console.error("Could not fetch financial data for user:", userId);
      return null;
    }
    
    // Calculate individual category scores (0-100)
    const scores = {
      savingsRate: calculateSavingsRateScore(financialData),
      debtManagement: calculateDebtManagementScore(financialData),
      emergencyFund: calculateEmergencyFundScore(financialData),
      budgetAdherence: calculateBudgetAdherenceScore(financialData),
      investmentDiversity: calculateInvestmentDiversityScore(financialData),
      financialKnowledge: calculateFinancialKnowledgeScore(financialData),
      expenseControl: calculateExpenseControlScore(financialData)
    };
    
    // Calculate overall score (weighted average)
    let overallScore = 0;
    for (const [category, score] of Object.entries(scores)) {
      overallScore += score * categoryWeights[category];
    }
    
    // Round to nearest whole number
    overallScore = Math.round(overallScore);
    
    // Generate improvement recommendations
    const recommendations = generateRecommendations(scores);
    
    // Generate score grades (A, B, C, D, F)
    const scoreGrades = {};
    for (const [category, score] of Object.entries(scores)) {
      scoreGrades[category] = getScoreGrade(score);
    }
    
    // Generate overall grade
    const overallGrade = getScoreGrade(overallScore);
    
    // Store the complete score data
    userScores = {
      userId,
      timestamp: new Date().toISOString(),
      overallScore,
      overallGrade,
      categoryScores: scores,
      categoryGrades: scoreGrades,
      recommendations
    };
    
    return userScores;
  } catch (error) {
    console.error("Error calculating financial wellness score:", error);
    return null;
  }
}

/**
 * Convert numerical score to letter grade
 * @param {number} score - Numerical score (0-100)
 * @returns {string} Letter grade
 */
function getScoreGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Fetch user's financial data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User financial data
 */
async function fetchUserFinancialData(userId) {
  try {
    // Try to get data from API first
    const response = await fetch(`/api/financial-data/${userId}`);
    
    if (response.ok) {
      return response.json();
    }
    
    // Fallback to local storage or samples if no connected accounts
    return fetchFinancialDataFromLocalStorage(userId);
  } catch (error) {
    console.error("Error fetching financial data:", error);
    // Fallback to local storage or samples
    return fetchFinancialDataFromLocalStorage(userId);
  }
}

/**
 * Fetch financial data from local storage if available
 * @param {string} userId - User ID
 * @returns {Object} User financial data
 */
function fetchFinancialDataFromLocalStorage(userId) {
  // Look for saved transaction data
  const transactions = JSON.parse(localStorage.getItem(`${userId}_transactions`) || '[]');
  const budgets = JSON.parse(localStorage.getItem(`${userId}_budgets`) || '{}');
  const savings = JSON.parse(localStorage.getItem(`${userId}_savings`) || '{}');
  const investments = JSON.parse(localStorage.getItem(`${userId}_investments`) || '[]');
  const debts = JSON.parse(localStorage.getItem(`${userId}_debts`) || '[]');
  const income = parseFloat(localStorage.getItem(`${userId}_income`) || '0');
  const expenses = calculateExpensesFromTransactions(transactions);
  const savingsAmount = parseFloat(localStorage.getItem(`${userId}_savingsAmount`) || '0');
  const emergencyFund = parseFloat(localStorage.getItem(`${userId}_emergencyFund`) || '0');
  const quizScores = JSON.parse(localStorage.getItem(`${userId}_financialQuizScores`) || '[]');
  
  // Return compiled financial data
  return {
    userId,
    transactions,
    budgets,
    savings,
    investments,
    debts,
    income,
    expenses,
    savingsAmount,
    emergencyFund,
    quizScores
  };
}

/**
 * Calculate total expenses from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Total expenses
 */
function calculateExpensesFromTransactions(transactions) {
  return transactions
    .filter(transaction => transaction.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
}

/**
 * Calculate savings rate score (0-100)
 * @param {Object} financialData - User's financial data
 * @returns {number} Savings rate score
 */
function calculateSavingsRateScore(financialData) {
  // If income is 0 or not present, return lowest score
  if (!financialData.income || financialData.income === 0) {
    return 20; // Base score even without data
  }
  
  // Calculate savings rate (as a percentage of income)
  const savingsRate = (financialData.savingsAmount / financialData.income) * 100;
  
  // Score based on recommended savings rate (15-20% is ideal)
  if (savingsRate >= 20) return 100;
  if (savingsRate >= 15) return 90;
  if (savingsRate >= 10) return 80;
  if (savingsRate >= 5) return 60;
  if (savingsRate > 0) return 40;
  return 20; // Minimum score if not saving at all
}

/**
 * Calculate debt management score (0-100)
 * @param {Object} financialData - User's financial data
 * @returns {number} Debt management score
 */
function calculateDebtManagementScore(financialData) {
  // If no debt data, return a moderate score
  if (!financialData.debts || financialData.debts.length === 0) {
    return 60; // Moderate score with no debt data
  }
  
  // Calculate debt-to-income ratio
  const totalDebt = financialData.debts.reduce((sum, debt) => sum + debt.amount, 0);
  const monthlyIncome = financialData.income / 12;
  const debtToIncomeRatio = totalDebt / monthlyIncome;
  
  // Calculate on-time payment percentage
  const onTimePayments = financialData.debts.filter(debt => debt.paymentStatus === 'onTime').length;
  const onTimePercentage = (onTimePayments / financialData.debts.length) * 100;
  
  // Score based on debt-to-income ratio and payment history
  let score = 0;
  
  // Debt-to-income portion (50% of this score)
  if (debtToIncomeRatio <= 0.1) score += 50;
  else if (debtToIncomeRatio <= 0.3) score += 40;
  else if (debtToIncomeRatio <= 0.4) score += 30;
  else if (debtToIncomeRatio <= 0.5) score += 20;
  else score += 10;
  
  // On-time payments portion (50% of this score)
  score += (onTimePercentage / 2);
  
  return score;
}

/**
 * Calculate emergency fund score (0-100)
 * @param {Object} financialData - User's financial data
 * @returns {number} Emergency fund score
 */
function calculateEmergencyFundScore(financialData) {
  // If no expenses data, return a moderate score
  if (!financialData.expenses || financialData.expenses === 0) {
    return 50; // Moderate score with no expense data
  }
  
  // Calculate months of expenses covered by emergency fund
  const monthlyExpenses = financialData.expenses / 12;
  const monthsCovered = financialData.emergencyFund / monthlyExpenses;
  
  // Score based on recommended emergency fund size (3-6 months)
  if (monthsCovered >= 6) return 100;
  if (monthsCovered >= 3) return 80;
  if (monthsCovered >= 2) return 60;
  if (monthsCovered >= 1) return 40;
  if (monthsCovered > 0) return 20;
  return 0; // No emergency fund
}

/**
 * Calculate budget adherence score (0-100)
 * @param {Object} financialData - User's financial data
 * @returns {number} Budget adherence score
 */
function calculateBudgetAdherenceScore(financialData) {
  // If no budget data, return a moderate score
  if (!financialData.budgets || Object.keys(financialData.budgets).length === 0) {
    return 50; // Moderate score with no budget data
  }
  
  // Calculate percentage of budget categories adhered to
  let categoriesAdheringToBudget = 0;
  let totalCategories = 0;
  
  for (const [category, budget] of Object.entries(financialData.budgets)) {
    // Skip categories without budget amounts
    if (!budget.amount) continue;
    
    totalCategories++;
    
    // Calculate actual spending for this category
    const categoryTransactions = financialData.transactions
      .filter(t => t.category === category && t.amount < 0);
    
    const categorySpending = categoryTransactions
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Check if spending is within budget
    if (categorySpending <= budget.amount) {
      categoriesAdheringToBudget++;
    }
  }
  
  // If no valid budget categories, return a moderate score
  if (totalCategories === 0) {
    return 50;
  }
  
  // Calculate adherence percentage and score
  const adherencePercentage = (categoriesAdheringToBudget / totalCategories) * 100;
  return Math.round(adherencePercentage);
}

/**
 * Calculate investment diversity score (0-100)
 * @param {Object} financialData - User's financial data
 * @returns {number} Investment diversity score
 */
function calculateInvestmentDiversityScore(financialData) {
  // If no investment data, return a low-moderate score
  if (!financialData.investments || financialData.investments.length === 0) {
    return 40; // Low-moderate score with no investment data
  }
  
  // Count different asset classes
  const assetClasses = new Set();
  financialData.investments.forEach(investment => {
    if (investment.assetClass) {
      assetClasses.add(investment.assetClass);
    }
  });
  
  // Score based on number of asset classes
  const numAssetClasses = assetClasses.size;
  
  if (numAssetClasses >= 5) return 100;
  if (numAssetClasses === 4) return 90;
  if (numAssetClasses === 3) return 80;
  if (numAssetClasses === 2) return 70;
  if (numAssetClasses === 1) return 60;
  return 40; // Default with no clear asset classes
}

/**
 * Calculate financial knowledge score (0-100)
 * @param {Object} financialData - User's financial data
 * @returns {number} Financial knowledge score
 */
function calculateFinancialKnowledgeScore(financialData) {
  // If no quiz scores data, return a moderate score
  if (!financialData.quizScores || financialData.quizScores.length === 0) {
    // Check app usage as a proxy for engagement
    const appOpenCount = parseInt(localStorage.getItem(`${financialData.userId}_appOpenCount`) || '0');
    
    // Basic score based on app usage
    if (appOpenCount > 20) return 70;
    if (appOpenCount > 10) return 60;
    if (appOpenCount > 5) return 50;
    return 40;
  }
  
  // Calculate average quiz score
  const totalScore = financialData.quizScores.reduce((sum, quiz) => sum + quiz.score, 0);
  const averageScore = totalScore / financialData.quizScores.length;
  
  // Convert to 0-100 scale if needed
  return Math.min(100, Math.round(averageScore));
}

/**
 * Calculate expense control score (0-100)
 * @param {Object} financialData - User's financial data
 * @returns {number} Expense control score
 */
function calculateExpenseControlScore(financialData) {
  // If no transaction data, return a moderate score
  if (!financialData.transactions || financialData.transactions.length === 0) {
    return 50; // Moderate score with no transaction data
  }
  
  // Calculate discretionary vs. essential spending
  const discretionarySpending = financialData.transactions
    .filter(t => t.category === 'entertainment' || t.category === 'dining' || 
           t.category === 'shopping' || t.category === 'travel')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalSpending = financialData.transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // If no spending, return a moderate score
  if (totalSpending === 0) {
    return 50;
  }
  
  // Calculate discretionary spending ratio
  const discretionaryRatio = discretionarySpending / totalSpending;
  
  // Score based on discretionary spending ratio (lower is better)
  if (discretionaryRatio <= 0.1) return 100;
  if (discretionaryRatio <= 0.2) return 90;
  if (discretionaryRatio <= 0.3) return 80;
  if (discretionaryRatio <= 0.4) return 70;
  if (discretionaryRatio <= 0.5) return 60;
  if (discretionaryRatio <= 0.6) return 50;
  if (discretionaryRatio <= 0.7) return 40;
  if (discretionaryRatio <= 0.8) return 30;
  return 20; // Very high discretionary spending
}

/**
 * Generate personalized recommendations based on scores
 * @param {Object} scores - Category scores
 * @returns {Array} Array of recommendation objects
 */
function generateRecommendations(scores) {
  const recommendations = [];
  
  // Find the lowest scoring categories (up to 3)
  const sortedCategories = Object.entries(scores)
    .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
    .map(([category]) => category);
  
  const lowestCategories = sortedCategories.slice(0, 3);
  
  // Generate recommendations for the lowest categories
  lowestCategories.forEach(category => {
    const score = scores[category];
    const recommendation = getRecommendationForCategory(category, score);
    recommendations.push(recommendation);
  });
  
  return recommendations;
}

/**
 * Get a specific recommendation for a category and score
 * @param {string} category - Score category
 * @param {number} score - Category score
 * @returns {Object} Recommendation object
 */
function getRecommendationForCategory(category, score) {
  // Common recommendation templates
  const recommendations = {
    savingsRate: [
      {
        threshold: 40,
        title: "Start a Savings Habit",
        description: "Try the 50/30/20 rule: 50% of income for needs, 30% for wants, and 20% for savings. Start small if needed.",
        action: "Set up an automatic transfer to savings each payday, even if it's just 5% of your income."
      },
      {
        threshold: 70,
        title: "Boost Your Savings Rate",
        description: "You're saving, but could benefit from increasing your rate to build wealth faster.",
        action: "Try increasing your savings rate by 2-3% every few months until you reach 15-20% of income."
      },
      {
        threshold: 100,
        title: "Optimize Your Savings Strategy",
        description: "You're already saving well. Focus on optimizing where those savings go.",
        action: "Consider diversifying your savings into different buckets: emergency fund, retirement, and short-term goals."
      }
    ],
    debtManagement: [
      {
        threshold: 40,
        title: "Create a Debt Reduction Plan",
        description: "Your debt levels are impacting your financial health significantly.",
        action: "List all debts with interest rates and consider either the snowball method (smallest balance first) or avalanche method (highest interest first)."
      },
      {
        threshold: 70,
        title: "Accelerate Debt Repayment",
        description: "You're managing debt reasonably, but could benefit from faster repayment.",
        action: "Consider allocating any extra income or windfalls to paying down high-interest debt."
      },
      {
        threshold: 100,
        title: "Maintain Your Debt Strategy",
        description: "You're handling debt well. Focus on maintaining your good habits.",
        action: "If applicable, look into refinancing remaining debts to lower interest rates."
      }
    ],
    emergencyFund: [
      {
        threshold: 40,
        title: "Start an Emergency Fund",
        description: "Having even a small emergency fund can help avoid debt when unexpected expenses arise.",
        action: "Aim to save $1,000 as a starter emergency fund, then work toward 3-6 months of expenses."
      },
      {
        threshold: 70,
        title: "Grow Your Emergency Fund",
        description: "Your emergency fund is a good start, but may not cover larger emergencies.",
        action: "Work toward saving 3-6 months of essential expenses in an accessible account."
      },
      {
        threshold: 100,
        title: "Maintain Your Emergency Fund",
        description: "Your emergency fund is in great shape. Make sure it stays that way.",
        action: "Review your emergency fund annually to ensure it still covers 3-6 months of your current expenses."
      }
    ],
    budgetAdherence: [
      {
        threshold: 40,
        title: "Strengthen Your Budget",
        description: "Consistent budgeting helps ensure you're spending according to your priorities.",
        action: "Identify your top budget-busting categories and create specific strategies for each."
      },
      {
        threshold: 70,
        title: "Fine-tune Your Budget",
        description: "Your budget is working fairly well, but some adjustments could help.",
        action: "Review if your budget allocations match your actual spending patterns, and adjust as needed."
      },
      {
        threshold: 100,
        title: "Optimize Your Budget",
        description: "Your budget discipline is excellent. Focus on optimizing categories.",
        action: "Look for small adjustments that align your spending even more with your long-term goals."
      }
    ],
    investmentDiversity: [
      {
        threshold: 40,
        title: "Start Diversifying Investments",
        description: "A diversified portfolio helps manage risk and maximize returns.",
        action: "Consider low-cost index funds that provide instant diversification across many companies."
      },
      {
        threshold: 70,
        title: "Expand Your Investment Mix",
        description: "Your investments have some diversity, but could benefit from more.",
        action: "Consider adding 1-2 more asset classes that you don't currently have in your portfolio."
      },
      {
        threshold: 100,
        title: "Review Investment Allocations",
        description: "Your investments are well-diversified. Focus on optimizing allocations.",
        action: "Review your investment allocations annually and rebalance to maintain your target asset mix."
      }
    ],
    financialKnowledge: [
      {
        threshold: 40,
        title: "Build Financial Literacy",
        description: "Understanding core financial concepts helps you make better decisions.",
        action: "Spend 15 minutes each day reading about a financial topic or concept."
      },
      {
        threshold: 70,
        title: "Deepen Financial Knowledge",
        description: "You have a good foundation of knowledge. Keep building on it.",
        action: "Pick one financial topic each month to learn in-depth through books, podcasts, or courses."
      },
      {
        threshold: 100,
        title: "Stay Updated on Finance",
        description: "Your financial knowledge is strong. Stay current with trends and changes.",
        action: "Follow financial news and consider more advanced topics like tax optimization or estate planning."
      }
    ],
    expenseControl: [
      {
        threshold: 40,
        title: "Reduce Discretionary Spending",
        description: "Controlling non-essential spending frees up money for saving and important goals.",
        action: "Try a 30-day challenge where you cut one category of discretionary spending completely."
      },
      {
        threshold: 70,
        title: "Balance Essential and Non-essential Spending",
        description: "Your spending is fairly balanced, but could be optimized further.",
        action: "Review your recent discretionary purchases and identify which brought lasting value versus temporary satisfaction."
      },
      {
        threshold: 100,
        title: "Maintain Spending Balance",
        description: "You're managing discretionary spending well. Focus on maintaining this balance.",
        action: "Periodically review if your spending aligns with your current priorities and values."
      }
    ]
  };
  
  // Find the appropriate recommendation based on score
  const categoryRecs = recommendations[category];
  
  for (let i = 0; i < categoryRecs.length; i++) {
    if (score <= categoryRecs[i].threshold) {
      return {
        category,
        score,
        ...categoryRecs[i]
      };
    }
  }
  
  // Default to the highest threshold recommendation if none matched
  return {
    category,
    score,
    ...categoryRecs[categoryRecs.length - 1]
  };
}

/**
 * Render the Financial Wellness Scorecard Page
 * @param {string} containerId - DOM container ID to render into
 * @returns {void}
 */
export async function renderFinancialScorecardPage(containerId = 'app-container') {
  // Get container
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }
  
  // Show loading state
  container.innerHTML = `
    <div class="scorecard-loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
      <div class="spinner" style="width: 40px; height: 40px; border: 4px solid rgba(79, 70, 229, 0.2); border-radius: 50%; border-top-color: #4F46E5; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 16px; color: #6b7280; font-size: 16px;">Calculating your financial wellness score...</p>
    </div>
    
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  
  try {
    // Get user ID (either from auth system or localStorage)
    const userId = getUserId();
    
    // Calculate or retrieve the user's financial wellness score
    const scoreData = await calculateFinancialWellnessScore(userId);
    
    if (!scoreData) {
      renderErrorState(container);
      return;
    }
    
    // Render the scorecard UI with the score data
    renderScorecardUI(container, scoreData);
  } catch (error) {
    console.error("Error rendering financial scorecard:", error);
    renderErrorState(container);
  }
}

/**
 * Get the current user's ID
 * @returns {string} User ID
 */
function getUserId() {
  // Try to get user ID from auth system (if available)
  if (typeof getAuthenticatedUserId === 'function') {
    const authUserId = getAuthenticatedUserId();
    if (authUserId) return authUserId;
  }
  
  // Check if we have a cached user ID in session
  if (window.user && window.user.id) {
    return window.user.id;
  }
  
  // Check for URL parameter (if applicable)
  const urlParams = new URLSearchParams(window.location.search);
  const paramUserId = urlParams.get('userId');
  if (paramUserId) return paramUserId;
  
  // Try to get from localStorage
  const localUserId = localStorage.getItem('current_user_id');
  if (localUserId) return localUserId;
  
  // Generate a temporary ID if all else fails
  const tempId = 'user-' + Date.now();
  localStorage.setItem('current_user_id', tempId);
  return tempId;
}

/**
 * Render an error state in the container
 * @param {HTMLElement} container - Container element
 */
function renderErrorState(container) {
  container.innerHTML = `
    <div class="error-container" style="padding: 24px; text-align: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h2 style="margin-top: 16px; font-size: 20px; color: #374151;">Error Loading Financial Scorecard</h2>
      <p style="margin-top: 8px; color: #6b7280;">We encountered a problem calculating your financial wellness score. This could be due to limited financial data.</p>
      <button id="retry-scorecard" style="margin-top: 16px; padding: 8px 16px; background-color: #4F46E5; color: white; border: none; border-radius: 4px; cursor: pointer;">Try Again</button>
    </div>
  `;
  
  // Add retry button handler
  document.getElementById('retry-scorecard')?.addEventListener('click', () => {
    renderFinancialScorecardPage(container.id);
  });
}

/**
 * Render the Scorecard UI with the given score data
 * @param {HTMLElement} container - Container element
 * @param {Object} scoreData - User's financial wellness score data
 */
function renderScorecardUI(container, scoreData) {
  // Generate color based on overall score
  const getScoreColor = (score) => {
    if (score >= 90) return '#059669'; // Green (excellent)
    if (score >= 80) return '#10B981'; // Light green (very good)
    if (score >= 70) return '#F59E0B'; // Yellow (good)
    if (score >= 60) return '#F97316'; // Orange (fair)
    return '#EF4444'; // Red (needs improvement)
  };
  
  // Get color for overall score
  const scoreColor = getScoreColor(scoreData.overallScore);
  
  // Get top 3 recommendations
  const topRecommendations = scoreData.recommendations.slice(0, 3);
  
  // Build the UI
  container.innerHTML = `
    <div class="scorecard-container" style="padding: 24px; max-width: 1200px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: var(--color-text-primary);">Financial Wellness Scorecard</h1>
        <button id="refresh-scorecard" style="padding: 8px 16px; background-color: white; border: 1px solid #d1d5db; border-radius: 6px; color: var(--color-text-secondary); font-weight: 500; display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Refresh Score
        </button>
      </div>
      
      <!-- Overall Score -->
      <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px;">
        <div style="padding: 24px; text-align: center;">
          <h2 style="font-size: 18px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 16px;">Your Financial Wellness Score</h2>
          
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div class="score-circle" style="position: relative; width: 150px; height: 150px; border-radius: 50%; margin-bottom: 16px; background: conic-gradient(${scoreColor} ${scoreData.overallScore}%, #f3f4f6 0); display: flex; align-items: center; justify-content: center;">
              <div style="width: 130px; height: 130px; border-radius: 50%; background-color: white; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 40px; font-weight: 700; color: ${scoreColor};">${scoreData.overallScore}</span>
                <span style="font-size: 14px; color: #6b7280;">out of 100</span>
              </div>
            </div>
            
            <div class="score-grade" style="font-size: 24px; font-weight: 700; color: ${scoreColor};">
              Grade: ${scoreData.overallGrade}
            </div>
            
            <p style="margin-top: 16px; color: #6b7280; max-width: 600px;">
              Your financial wellness score is based on seven key areas of your financial life. This personalized assessment helps identify your strengths and areas for improvement.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Category Scores -->
      <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px;">
        <div style="padding: 24px;">
          <h2 style="font-size: 18px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 16px;">Category Breakdown</h2>
          
          <div class="score-categories" style="display: grid; gap: 16px;">
            ${Object.entries(scoreData.categoryScores).map(([category, score]) => {
              const categoryDisplayName = getCategoryDisplayName(category);
              const categoryGrade = scoreData.categoryGrades[category];
              const categoryColor = getScoreColor(score);
              
              return `
                <div class="score-category" style="display: flex; align-items: center; gap: 16px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <div style="width: 50px; height: 50px; border-radius: 50%; background: conic-gradient(${categoryColor} ${score}%, #f3f4f6 0); display: flex; align-items: center; justify-content: center;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background-color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; color: ${categoryColor};">
                      ${categoryGrade}
                    </div>
                  </div>
                  
                  <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <h3 style="font-size: 16px; font-weight: 500; color: var(--color-text-primary);">${categoryDisplayName}</h3>
                      <span style="font-weight: 600; color: ${categoryColor};">${score}/100</span>
                    </div>
                    
                    <div style="height: 6px; background-color: #f3f4f6; border-radius: 3px; overflow: hidden;">
                      <div style="height: 100%; width: ${score}%; background-color: ${categoryColor};"></div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
      
      <!-- Recommendations -->
      <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="padding: 24px;">
          <h2 style="font-size: 18px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 16px;">Top Recommendations</h2>
          
          <div class="recommendations" style="display: grid; gap: 16px;">
            ${topRecommendations.map(rec => {
              const categoryDisplayName = getCategoryDisplayName(rec.category);
              const categoryColor = getScoreColor(rec.score);
              
              return `
                <div class="recommendation" style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="font-size: 16px; font-weight: 600; color: var(--color-text-primary);">${rec.title}</h3>
                    <span style="font-size: 12px; padding: 4px 8px; background-color: ${categoryColor}20; color: ${categoryColor}; border-radius: 9999px; font-weight: 500;">
                      ${categoryDisplayName}
                    </span>
                  </div>
                  
                  <p style="color: #6b7280; margin-bottom: 12px;">${rec.description}</p>
                  
                  <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; border-left: 4px solid ${categoryColor};">
                    <div style="display: flex; gap: 8px; align-items: center; color: var(--color-text-primary); font-weight: 500;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                      Action Step
                    </div>
                    <p style="margin-top: 4px; color: #6b7280;">${rec.action}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
      
      <!-- View History Button -->
      <div style="margin-top: 24px; text-align: center;">
        <button id="view-history-btn" style="padding: 8px 16px; background-color: white; border: 1px solid #d1d5db; border-radius: 6px; color: var(--color-text-secondary); font-weight: 500; cursor: pointer;">
          View Score History
        </button>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('refresh-scorecard')?.addEventListener('click', () => {
    renderFinancialScorecardPage(container.id);
  });
  
  document.getElementById('view-history-btn')?.addEventListener('click', () => {
    showScoreHistoryModal();
  });
}

/**
 * Get a display-friendly name for a score category
 * @param {string} category - Category key
 * @returns {string} Display name
 */
function getCategoryDisplayName(category) {
  const displayNames = {
    savingsRate: 'Savings Rate',
    debtManagement: 'Debt Management',
    emergencyFund: 'Emergency Fund',
    budgetAdherence: 'Budget Adherence',
    investmentDiversity: 'Investment Diversity',
    financialKnowledge: 'Financial Knowledge',
    expenseControl: 'Expense Control'
  };
  
  return displayNames[category] || category;
}

/**
 * Show modal with score history
 */
function showScoreHistoryModal() {
  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'score-history-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '9999';
  modal.style.padding = '20px';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '800px';
  modalContent.style.width = '100%';
  modalContent.style.maxHeight = '90vh';
  modalContent.style.overflow = 'auto';
  modalContent.style.position = 'relative';
  modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  
  // For now, we'll show a placeholder as we don't have historical data yet
  modalContent.innerHTML = `
    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 20px; font-weight: 600; color: #111827;">Score History</h2>
        <button class="close-modal" style="background: transparent; border: none; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
    
    <div style="padding: 24px; text-align: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
      
      <h3 style="margin-top: 16px; font-size: 18px; color: var(--color-text-primary);">No History Yet</h3>
      <p style="margin-top: 8px; color: var(--color-text-secondary); max-width: 400px; margin-left: auto; margin-right: auto;">
        Your score history will be tracked and displayed here as you continue to use the app and improve your financial wellness.
      </p>
      
      <button class="close-modal-btn" style="margin-top: 24px; padding: 8px 16px; background-color: var(--color-primary); color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
        Got It
      </button>
    </div>
  `;
  
  // Add the modal to the DOM
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Add event listeners
  document.querySelector('.close-modal')?.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  document.querySelector('.close-modal-btn')?.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}

// Helper functions for demo purposes
// These would be replaced with proper API calls in a real app

/**
 * Generate sample financial data for testing
 * @param {string} userId - User ID
 * @returns {Object} Sample financial data
 */
function generateSampleFinancialData(userId) {
  return {
    userId,
    income: 5000,
    expenses: 4000,
    savingsAmount: 750,
    emergencyFund: 10000,
    transactions: [
      { id: 1, amount: -120, category: 'dining', date: '2025-04-20' },
      { id: 2, amount: -1500, category: 'housing', date: '2025-04-01' },
      { id: 3, amount: -200, category: 'entertainment', date: '2025-04-15' },
      { id: 4, amount: -350, category: 'utilities', date: '2025-04-10' },
      { id: 5, amount: -500, category: 'groceries', date: '2025-04-05' },
      { id: 6, amount: 5000, category: 'income', date: '2025-04-01' },
    ],
    budgets: {
      housing: { amount: 1500 },
      groceries: { amount: 600 },
      dining: { amount: 200 },
      entertainment: { amount: 150 },
      utilities: { amount: 400 }
    },
    debts: [
      { id: 1, type: 'creditCard', amount: 2000, interestRate: 17.99, paymentStatus: 'onTime' },
      { id: 2, type: 'studentLoan', amount: 15000, interestRate: 4.5, paymentStatus: 'onTime' }
    ],
    investments: [
      { id: 1, type: '401k', assetClass: 'stocks', amount: 50000 },
      { id: 2, type: 'ira', assetClass: 'bonds', amount: 20000 },
      { id: 3, type: 'brokerage', assetClass: 'realestate', amount: 10000 }
    ],
    quizScores: [
      { id: 1, quiz: 'budgeting', score: 80, date: '2025-03-15' },
      { id: 2, quiz: 'investing', score: 65, date: '2025-03-22' },
      { id: 3, quiz: 'retirement', score: 70, date: '2025-04-05' }
    ]
  };
}