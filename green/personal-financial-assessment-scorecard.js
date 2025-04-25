/**
 * Personal Financial Assessment
 * This module evaluates a user's overall financial health across multiple dimensions
 * and provides personalized recommendations specifically for personal finance.
 * Note: This is completely distinct from service provider/gig worker ratings.
 */

import { getFinancialInsights } from './financial-summary.js';
import { createNotification, NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from './notification-service.js';

// Categories and maximum points for each
const WELLNESS_CATEGORIES = {
  INCOME_STABILITY: { name: 'Income Stability', maxPoints: 20 },
  SAVINGS_RATIO: { name: 'Savings Ratio', maxPoints: 20 },
  INVESTMENT_HEALTH: { name: 'Investment Health', maxPoints: 15 },
  DEBT_MANAGEMENT: { name: 'Debt Management', maxPoints: 15 },
  EXPENSE_CONTROL: { name: 'Expense Control', maxPoints: 15 },
  GOAL_PROGRESS: { name: 'Financial Goals', maxPoints: 10 },
  GUARDRAILS_USAGE: { name: 'Spending Guardrails', maxPoints: 5 }
};

// Wellness score ranges and their interpretations
const SCORE_RANGES = [
  { min: 90, max: 100, level: 'Excellent', color: 'var(--color-success-600)', description: 'Your financial health is excellent! You\'re making great choices across almost all financial dimensions.' },
  { min: 75, max: 89, level: 'Strong', color: 'var(--color-success-500)', description: 'You have a strong financial foundation. Some minor improvements could further strengthen your position.' },
  { min: 60, max: 74, level: 'Good', color: 'var(--color-warning-400)', description: 'Your financial health is good with some areas of strength, but there are opportunities for improvement.' },
  { min: 40, max: 59, level: 'Fair', color: 'var(--color-warning-500)', description: 'Your financial situation has some challenges that need attention. Follow the recommendations to improve.' },
  { min: 0, max: 39, level: 'Needs Attention', color: 'var(--color-danger-500)', description: 'Several aspects of your finances need immediate attention. Focus on the high-priority recommendations.' }
];

/**
 * Calculate a user's financial personal financial assessment score
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Complete scorecard data
 */
export async function calculatePersonalFinancialAssessmentScore(userId) {
  try {
    // Get financial data for the user
    const insights = await getFinancialInsights(userId);
    const userData = insights.userData || {};
    
    // Initialize scorecard
    const scorecard = {
      userId,
      generatedAt: new Date(),
      overallScore: 0,
      categoryScores: [],
      recommendations: [],
      insights: [],
      scoreLevel: '',
      scoreColor: '',
      scoreDescription: ''
    };
    
    // Calculate scores for each category
    scorecard.categoryScores = calculateCategoryScores(userData);
    
    // Calculate overall score (weighted average)
    const totalPoints = scorecard.categoryScores.reduce((sum, category) => sum + category.points, 0);
    const maxPossiblePoints = scorecard.categoryScores.reduce((sum, category) => sum + category.maxPoints, 0);
    scorecard.overallScore = Math.round((totalPoints / maxPossiblePoints) * 100);
    
    // Determine score level, color and description
    const scoreRange = SCORE_RANGES.find(range => 
      scorecard.overallScore >= range.min && scorecard.overallScore <= range.max
    ) || SCORE_RANGES[SCORE_RANGES.length - 1];
    
    scorecard.scoreLevel = scoreRange.level;
    scorecard.scoreColor = scoreRange.color;
    scorecard.scoreDescription = scoreRange.description;
    
    // Generate personalized recommendations
    scorecard.recommendations = generateRecommendations(scorecard.categoryScores, userData);
    
    // Generate key insights
    scorecard.insights = generateInsights(userData, scorecard.categoryScores);
    
    // Store the scorecard for the user
    saveWellnessScorecard(userId, scorecard);
    
    // Notify the user about their new scorecard
    notifyUserAboutScorecard(userId, scorecard);
    
    return scorecard;
  } catch (error) {
    console.log('Error calculating personal financial assessment score:', error);
    // Return a minimal scorecard in case of error
    return {
      userId,
      generatedAt: new Date(),
      overallScore: 0,
      categoryScores: [],
      recommendations: [
        {
          category: 'System',
          text: 'We encountered an issue calculating your personal financial assessment score. Please try again later.',
          priority: 'high'
        }
      ],
      insights: [],
      scoreLevel: 'Unavailable',
      scoreColor: 'var(--color-neutral-400)',
      scoreDescription: 'Score calculation is temporarily unavailable.'
    };
  }
}

/**
 * Calculate scores for each financial category
 * @param {Object} userData - User's financial data
 * @returns {Array} - Array of category scores
 */
function calculateCategoryScores(userData) {
  const categoryScores = [];
  
  // Income Stability score
  const incomeStability = calculateIncomeStabilityScore(userData);
  categoryScores.push({
    category: 'INCOME_STABILITY',
    name: WELLNESS_CATEGORIES.INCOME_STABILITY.name,
    points: incomeStability.points,
    maxPoints: WELLNESS_CATEGORIES.INCOME_STABILITY.maxPoints,
    details: incomeStability.details,
    percentage: Math.round((incomeStability.points / WELLNESS_CATEGORIES.INCOME_STABILITY.maxPoints) * 100)
  });
  
  // Savings Ratio score
  const savingsRatio = calculateSavingsRatioScore(userData);
  categoryScores.push({
    category: 'SAVINGS_RATIO',
    name: WELLNESS_CATEGORIES.SAVINGS_RATIO.name,
    points: savingsRatio.points,
    maxPoints: WELLNESS_CATEGORIES.SAVINGS_RATIO.maxPoints,
    details: savingsRatio.details,
    percentage: Math.round((savingsRatio.points / WELLNESS_CATEGORIES.SAVINGS_RATIO.maxPoints) * 100)
  });
  
  // Investment Health score
  const investmentHealth = calculateInvestmentHealthScore(userData);
  categoryScores.push({
    category: 'INVESTMENT_HEALTH',
    name: WELLNESS_CATEGORIES.INVESTMENT_HEALTH.name,
    points: investmentHealth.points,
    maxPoints: WELLNESS_CATEGORIES.INVESTMENT_HEALTH.maxPoints,
    details: investmentHealth.details,
    percentage: Math.round((investmentHealth.points / WELLNESS_CATEGORIES.INVESTMENT_HEALTH.maxPoints) * 100)
  });
  
  // Debt Management score
  const debtManagement = calculateDebtManagementScore(userData);
  categoryScores.push({
    category: 'DEBT_MANAGEMENT',
    name: WELLNESS_CATEGORIES.DEBT_MANAGEMENT.name,
    points: debtManagement.points,
    maxPoints: WELLNESS_CATEGORIES.DEBT_MANAGEMENT.maxPoints,
    details: debtManagement.details,
    percentage: Math.round((debtManagement.points / WELLNESS_CATEGORIES.DEBT_MANAGEMENT.maxPoints) * 100)
  });
  
  // Expense Control score
  const expenseControl = calculateExpenseControlScore(userData);
  categoryScores.push({
    category: 'EXPENSE_CONTROL',
    name: WELLNESS_CATEGORIES.EXPENSE_CONTROL.name,
    points: expenseControl.points,
    maxPoints: WELLNESS_CATEGORIES.EXPENSE_CONTROL.maxPoints,
    details: expenseControl.details,
    percentage: Math.round((expenseControl.points / WELLNESS_CATEGORIES.EXPENSE_CONTROL.maxPoints) * 100)
  });
  
  // Goal Progress score
  const goalProgress = calculateGoalProgressScore(userData);
  categoryScores.push({
    category: 'GOAL_PROGRESS',
    name: WELLNESS_CATEGORIES.GOAL_PROGRESS.name,
    points: goalProgress.points,
    maxPoints: WELLNESS_CATEGORIES.GOAL_PROGRESS.maxPoints,
    details: goalProgress.details,
    percentage: Math.round((goalProgress.points / WELLNESS_CATEGORIES.GOAL_PROGRESS.maxPoints) * 100)
  });
  
  // Guardrails Usage score
  const guardrailsUsage = calculateGuardrailsUsageScore(userData);
  categoryScores.push({
    category: 'GUARDRAILS_USAGE',
    name: WELLNESS_CATEGORIES.GUARDRAILS_USAGE.name,
    points: guardrailsUsage.points,
    maxPoints: WELLNESS_CATEGORIES.GUARDRAILS_USAGE.maxPoints,
    details: guardrailsUsage.details,
    percentage: Math.round((guardrailsUsage.points / WELLNESS_CATEGORIES.GUARDRAILS_USAGE.maxPoints) * 100)
  });
  
  return categoryScores;
}

/**
 * Calculate Income Stability score based on income consistency and growth
 * @param {Object} userData - User financial data
 * @returns {Object} - Points and details
 */
function calculateIncomeStabilityScore(userData) {
  const income = userData.income || [];
  const maxPoints = WELLNESS_CATEGORIES.INCOME_STABILITY.maxPoints;
  let points = 0;
  const details = [];
  
  // If no income data, return minimal score
  if (!income.length) {
    details.push('No income data available to analyze.');
    return { points: Math.round(maxPoints * 0.2), details };
  }
  
  // Sort income by date
  const sortedIncome = [...income].sort((a, b) => 
    new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
  );
  
  // Check for consistent income (at least 3 months)
  if (sortedIncome.length >= 3) {
    points += Math.min(sortedIncome.length, 6) * 2; // Up to 12 points for consistent income
    details.push(`Consistent income tracked for ${sortedIncome.length} periods.`);
  } else {
    details.push('Limited income history available.');
  }
  
  // Check for income growth
  if (sortedIncome.length >= 2) {
    const firstAmount = parseFloat(sortedIncome[0].amount);
    const lastAmount = parseFloat(sortedIncome[sortedIncome.length - 1].amount);
    
    if (lastAmount > firstAmount) {
      const growthPercent = ((lastAmount - firstAmount) / firstAmount) * 100;
      const growthPoints = Math.min(Math.round(growthPercent / 5), 8); // Up to 8 points for growth
      points += growthPoints;
      details.push(`Income has grown by ${growthPercent.toFixed(1)}% over time.`);
    } else if (lastAmount === firstAmount) {
      points += 4; // 4 points for stable income
      details.push('Income has remained stable over time.');
    } else {
      details.push('Income has decreased over time.');
    }
  }
  
  // Check for multiple income sources
  const sources = new Set(income.map(item => item.source || 'Unknown'));
  if (sources.size > 1) {
    points += Math.min(sources.size, 3); // Up to 3 points for multiple income sources
    details.push(`Multiple income sources (${sources.size}) provide stability.`);
  }
  
  return { 
    points: Math.min(points, maxPoints), 
    details 
  };
}

/**
 * Calculate Savings Ratio score based on savings rate
 * @param {Object} userData - User financial data
 * @returns {Object} - Points and details
 */
function calculateSavingsRatioScore(userData) {
  const maxPoints = WELLNESS_CATEGORIES.SAVINGS_RATIO.maxPoints;
  let points = 0;
  const details = [];
  
  // Get income and savings data
  const income = userData.income || [];
  const savings = userData.savings || [];
  const incomeSplit = userData.incomeSplit || { savings: 30 }; // Default to 30% savings target
  
  // Calculate total income
  const totalIncome = income.reduce((sum, item) => 
    sum + parseFloat(item.amount || 0), 0
  );
  
  // Calculate total savings
  const totalSavings = savings.reduce((sum, item) => 
    sum + parseFloat(item.amount || 0), 0
  );
  
  // If no income data, return minimal score
  if (totalIncome === 0) {
    details.push('No income data available to analyze savings ratio.');
    return { points: Math.round(maxPoints * 0.25), details };
  }
  
  // Calculate savings ratio
  const savingsRatio = (totalSavings / totalIncome) * 100;
  const targetSavingsRatio = incomeSplit.savings || 30;
  
  // Score based on savings ratio compared to target
  if (savingsRatio >= targetSavingsRatio) {
    points = maxPoints;
    details.push(`Excellent! You're saving ${savingsRatio.toFixed(1)}% of your income, exceeding your ${targetSavingsRatio}% target.`);
  } else if (savingsRatio >= targetSavingsRatio * 0.75) {
    points = Math.round(maxPoints * 0.8);
    details.push(`You're saving ${savingsRatio.toFixed(1)}% of your income, close to your ${targetSavingsRatio}% target.`);
  } else if (savingsRatio >= targetSavingsRatio * 0.5) {
    points = Math.round(maxPoints * 0.6);
    details.push(`You're saving ${savingsRatio.toFixed(1)}% of your income, below your ${targetSavingsRatio}% target.`);
  } else if (savingsRatio > 0) {
    points = Math.round(maxPoints * 0.4);
    details.push(`You're only saving ${savingsRatio.toFixed(1)}% of your income, far below your ${targetSavingsRatio}% target.`);
  } else {
    points = 0;
    details.push(`No savings detected. Your target is ${targetSavingsRatio}% of income.`);
  }
  
  return { 
    points, 
    details 
  };
}

/**
 * Calculate Investment Health score
 * @param {Object} userData - User financial data
 * @returns {Object} - Points and details
 */
function calculateInvestmentHealthScore(userData) {
  const maxPoints = WELLNESS_CATEGORIES.INVESTMENT_HEALTH.maxPoints;
  let points = 0;
  const details = [];
  
  // Get investment data
  const investments = userData.investments || [];
  const incomeSplit = userData.incomeSplit || { investments: 30 }; // Default to 30% investment target
  
  // If no investment data, return minimal score
  if (!investments.length) {
    details.push('No investment data available to analyze.');
    return { points: Math.round(maxPoints * 0.2), details };
  }
  
  // Calculate total invested amount
  const totalInvested = investments.reduce((sum, item) => 
    sum + parseFloat(item.amount || 0), 0
  );
  
  // Calculate investment diversity (number of different investment types)
  const investmentTypes = new Set(investments.map(item => item.type || 'Unknown'));
  
  // Score based on investment types diversity
  if (investmentTypes.size >= 3) {
    points += 5;
    details.push(`Well-diversified with ${investmentTypes.size} different investment types.`);
  } else if (investmentTypes.size === 2) {
    points += 3;
    details.push('Moderately diversified with 2 investment types.');
  } else {
    points += 1;
    details.push('Limited investment diversity with only one type of investment.');
  }
  
  // Score based on total invested amount
  if (totalInvested > 10000) {
    points += 5;
    details.push('Strong investment foundation with significant capital invested.');
  } else if (totalInvested > 5000) {
    points += 3;
    details.push('Moderate investment capital built up.');
  } else if (totalInvested > 1000) {
    points += 2;
    details.push('Beginning to build investment capital.');
  } else {
    points += 1;
    details.push('Early stage investments with room to grow.');
  }
  
  // Check if retirement accounts exist
  const hasRetirement = investments.some(item => 
    (item.type || '').toLowerCase().includes('retirement') || 
    (item.type || '').toLowerCase().includes('401k') ||
    (item.type || '').toLowerCase().includes('ira')
  );
  
  if (hasRetirement) {
    points += 5;
    details.push('Retirement investments in place, showing long-term planning.');
  } else {
    details.push('No retirement-specific investments detected.');
  }
  
  return { 
    points: Math.min(points, maxPoints), 
    details 
  };
}

/**
 * Calculate Debt Management score
 * @param {Object} userData - User financial data
 * @returns {Object} - Points and details
 */
function calculateDebtManagementScore(userData) {
  const maxPoints = WELLNESS_CATEGORIES.DEBT_MANAGEMENT.maxPoints;
  let points = maxPoints; // Start with max points and subtract for debt issues
  const details = [];
  
  // Get debt data
  const debts = userData.debts || [];
  
  // If no debt data, give benefit of the doubt
  if (!debts.length) {
    details.push('No debt information available.');
    return { points: Math.round(maxPoints * 0.7), details };
  }
  
  // Calculate total debt
  const totalDebt = debts.reduce((sum, item) => 
    sum + parseFloat(item.amount || 0), 0
  );
  
  // Calculate high-interest debt (over 10%)
  const highInterestDebt = debts.filter(debt => 
    parseFloat(debt.interestRate || 0) > 10
  );
  
  const totalHighInterestDebt = highInterestDebt.reduce((sum, item) => 
    sum + parseFloat(item.amount || 0), 0
  );
  
  // Get income for debt-to-income calculation
  const income = userData.income || [];
  const monthlyIncome = income.reduce((sum, item) => {
    if (item.frequency === 'monthly') {
      return sum + parseFloat(item.amount || 0);
    } else if (item.frequency === 'biweekly') {
      return sum + (parseFloat(item.amount || 0) * 2.17);
    } else if (item.frequency === 'weekly') {
      return sum + (parseFloat(item.amount || 0) * 4.33);
    }
    return sum;
  }, 0);
  
  // Calculate debt-to-income ratio
  let debtToIncomeRatio = 0;
  
  if (monthlyIncome > 0) {
    // Calculate monthly debt payments (estimate as 3% of total debt)
    const estimatedMonthlyDebtPayment = totalDebt * 0.03;
    debtToIncomeRatio = (estimatedMonthlyDebtPayment / monthlyIncome) * 100;
  }
  
  // Score based on debt-to-income ratio
  if (debtToIncomeRatio > 40) {
    points -= 10;
    details.push('High debt-to-income ratio over 40% requires immediate attention.');
  } else if (debtToIncomeRatio > 30) {
    points -= 7;
    details.push('Debt-to-income ratio over 30% is concerning.');
  } else if (debtToIncomeRatio > 20) {
    points -= 5;
    details.push('Moderate debt-to-income ratio around 20-30%.');
  } else if (debtToIncomeRatio > 0) {
    points -= 2;
    details.push('Healthy debt-to-income ratio under 20%.');
  } else {
    details.push('No debt-to-income calculation possible.');
  }
  
  // Score based on high-interest debt
  if (totalHighInterestDebt > 0) {
    const highInterestPercentage = (totalHighInterestDebt / totalDebt) * 100;
    
    if (highInterestPercentage > 50) {
      points -= 5;
      details.push('Majority of debt is high-interest (>10%), which is costly.');
    } else if (highInterestPercentage > 20) {
      points -= 3;
      details.push('Significant portion of debt is high-interest (>10%).');
    } else {
      points -= 1;
      details.push('Small amount of high-interest debt detected.');
    }
  } else if (totalDebt > 0) {
    details.push('No high-interest debt detected, which is excellent.');
  }
  
  return { 
    points: Math.max(0, points), 
    details 
  };
}

/**
 * Calculate Expense Control score
 * @param {Object} userData - User financial data
 * @returns {Object} - Points and details
 */
function calculateExpenseControlScore(userData) {
  const maxPoints = WELLNESS_CATEGORIES.EXPENSE_CONTROL.maxPoints;
  let points = 0;
  const details = [];
  
  // Get expense and budget data
  const expenses = userData.expenses || [];
  const budgets = userData.budgets || [];
  
  // If no expense data, return minimal score
  if (!expenses.length) {
    details.push('No expense data available to analyze.');
    return { points: Math.round(maxPoints * 0.3), details };
  }
  
  // Group expenses by category
  const expensesByCategory = {};
  expenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    if (!expensesByCategory[category]) {
      expensesByCategory[category] = [];
    }
    expensesByCategory[category].push(expense);
  });
  
  // Check what percentage of expenses are categorized
  const totalExpenses = expenses.length;
  const categorizedExpenses = expenses.filter(expense => 
    expense.category && expense.category !== 'Uncategorized'
  ).length;
  
  const categorizationPercentage = (categorizedExpenses / totalExpenses) * 100;
  
  // Score based on expense categorization
  if (categorizationPercentage >= 90) {
    points += 5;
    details.push(`Excellent expense tracking with ${categorizationPercentage.toFixed(0)}% of expenses categorized.`);
  } else if (categorizationPercentage >= 70) {
    points += 3;
    details.push(`Good expense tracking with ${categorizationPercentage.toFixed(0)}% of expenses categorized.`);
  } else if (categorizationPercentage >= 50) {
    points += 2;
    details.push(`Moderate expense tracking with ${categorizationPercentage.toFixed(0)}% of expenses categorized.`);
  } else {
    points += 0;
    details.push(`Poor expense tracking with only ${categorizationPercentage.toFixed(0)}% of expenses categorized.`);
  }
  
  // Check budget adherence
  if (budgets.length > 0) {
    // Calculate how many budget categories are within limits
    let withinBudgetCount = 0;
    let totalBudgetCategories = 0;
    
    budgets.forEach(budget => {
      if (!budget.category) return;
      
      totalBudgetCategories++;
      const categoryExpenses = expensesByCategory[budget.category] || [];
      const totalCategorySpend = categoryExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount || 0), 0
      );
      
      if (totalCategorySpend <= parseFloat(budget.amount || 0)) {
        withinBudgetCount++;
      }
    });
    
    const budgetAdherencePercentage = totalBudgetCategories > 0 ? 
      (withinBudgetCount / totalBudgetCategories) * 100 : 0;
    
    // Score based on budget adherence
    if (budgetAdherencePercentage >= 90) {
      points += 10;
      details.push(`Excellent budget adherence at ${budgetAdherencePercentage.toFixed(0)}% of categories within budget.`);
    } else if (budgetAdherencePercentage >= 70) {
      points += 7;
      details.push(`Good budget adherence with ${budgetAdherencePercentage.toFixed(0)}% of categories within budget.`);
    } else if (budgetAdherencePercentage >= 50) {
      points += 4;
      details.push(`Moderate budget adherence with ${budgetAdherencePercentage.toFixed(0)}% of categories within budget.`);
    } else if (budgetAdherencePercentage > 0) {
      points += 2;
      details.push(`Poor budget adherence with only ${budgetAdherencePercentage.toFixed(0)}% of categories within budget.`);
    } else {
      details.push('No budget adherence data available to analyze.');
    }
  } else {
    details.push('No budgets set up to measure expense control against targets.');
  }
  
  return { 
    points: Math.min(points, maxPoints), 
    details 
  };
}

/**
 * Calculate Goal Progress score
 * @param {Object} userData - User financial data
 * @returns {Object} - Points and details
 */
function calculateGoalProgressScore(userData) {
  const maxPoints = WELLNESS_CATEGORIES.GOAL_PROGRESS.maxPoints;
  let points = 0;
  const details = [];
  
  // Get goals data
  const goals = userData.goals || [];
  
  // If no goals, return minimal score
  if (!goals.length) {
    details.push('No financial goals set to track progress.');
    return { points: Math.round(maxPoints * 0.2), details };
  }
  
  // Check number of active goals
  const activeGoals = goals.filter(goal => 
    goal.status === 'active' || goal.status === 'in-progress'
  );
  
  // Score based on having active goals
  if (activeGoals.length >= 3) {
    points += 4;
    details.push(`Strong goal setting with ${activeGoals.length} active financial goals.`);
  } else if (activeGoals.length > 0) {
    points += 2;
    details.push(`${activeGoals.length} active financial goals in progress.`);
  } else {
    details.push('No active financial goals found.');
  }
  
  // Calculate average progress across goals
  let totalProgress = 0;
  let goalsWithProgress = 0;
  
  goals.forEach(goal => {
    if (goal.progress && goal.target) {
      const progressPercentage = (parseFloat(goal.progress) / parseFloat(goal.target)) * 100;
      totalProgress += progressPercentage;
      goalsWithProgress++;
    }
  });
  
  const averageProgress = goalsWithProgress > 0 ? totalProgress / goalsWithProgress : 0;
  
  // Score based on goal progress
  if (averageProgress >= 75) {
    points += 6;
    details.push(`Excellent average goal progress of ${averageProgress.toFixed(0)}%.`);
  } else if (averageProgress >= 50) {
    points += 4;
    details.push(`Good average goal progress of ${averageProgress.toFixed(0)}%.`);
  } else if (averageProgress >= 25) {
    points += 2;
    details.push(`Moderate average goal progress of ${averageProgress.toFixed(0)}%.`);
  } else if (averageProgress > 0) {
    points += 1;
    details.push(`Limited average goal progress of ${averageProgress.toFixed(0)}%.`);
  } else {
    details.push('No measurable progress on financial goals.');
  }
  
  return { 
    points: Math.min(points, maxPoints), 
    details 
  };
}

/**
 * Calculate Guardrails Usage score
 * @param {Object} userData - User financial data
 * @returns {Object} - Points and details
 */
function calculateGuardrailsUsageScore(userData) {
  const maxPoints = WELLNESS_CATEGORIES.GUARDRAILS_USAGE.maxPoints;
  let points = 0;
  const details = [];
  
  // Get spending limits data
  const spendingLimits = userData.spendingLimits || [];
  
  // If no spending limits, return minimal score
  if (!spendingLimits.length) {
    details.push('No spending guardrails set up to help control expenses.');
    return { points: 0, details };
  }
  
  // Score based on number of spending guardrails
  if (spendingLimits.length >= 5) {
    points += 3;
    details.push(`Comprehensive guardrails with ${spendingLimits.length} spending categories protected.`);
  } else if (spendingLimits.length >= 3) {
    points += 2;
    details.push(`Good guardrails coverage with ${spendingLimits.length} spending categories protected.`);
  } else {
    points += 1;
    details.push(`Basic guardrails with ${spendingLimits.length} spending categories protected.`);
  }
  
  // Check if guardrails are respected (not exceeding limits)
  const guardrailsRespected = spendingLimits.filter(limit => 
    !limit.isExceeded
  ).length;
  
  const adherencePercentage = (guardrailsRespected / spendingLimits.length) * 100;
  
  // Score based on guardrails adherence
  if (adherencePercentage >= 90) {
    points += 2;
    details.push(`Excellent guardrails adherence at ${adherencePercentage.toFixed(0)}%.`);
  } else if (adherencePercentage >= 70) {
    points += 1;
    details.push(`Good guardrails adherence at ${adherencePercentage.toFixed(0)}%.`);
  } else {
    details.push(`Guardrails adherence needs improvement at ${adherencePercentage.toFixed(0)}%.`);
  }
  
  return { 
    points: Math.min(points, maxPoints), 
    details 
  };
}

/**
 * Generate personalized recommendations based on category scores
 * @param {Array} categoryScores - Array of category scores
 * @param {Object} userData - User financial data
 * @returns {Array} - Array of recommendations
 */
function generateRecommendations(categoryScores, userData) {
  const recommendations = [];
  
  // Sort categories by percentage score (ascending)
  const sortedCategories = [...categoryScores].sort((a, b) => 
    a.percentage - b.percentage
  );
  
  // Generate recommendations for the 3 lowest scoring categories
  for (let i = 0; i < Math.min(3, sortedCategories.length); i++) {
    const category = sortedCategories[i];
    
    // Only give recommendations for categories scoring under 70%
    if (category.percentage >= 70) continue;
    
    switch (category.category) {
      case 'INCOME_STABILITY':
        if (category.percentage < 50) {
          recommendations.push({
            category: category.name,
            text: 'Focus on building more consistent income streams. Consider part-time work or freelancing opportunities in the Gigs section.',
            priority: 'high'
          });
        } else {
          recommendations.push({
            category: category.name,
            text: 'Work on increasing your income consistency. Consider setting up automatic transfers for irregular income to create more stability.',
            priority: 'medium'
          });
        }
        break;
        
      case 'SAVINGS_RATIO':
        if (category.percentage < 30) {
          recommendations.push({
            category: category.name,
            text: 'Your savings rate needs immediate attention. Try the 24-hour rule: wait a day before making non-essential purchases over $50.',
            priority: 'high'
          });
        } else {
          recommendations.push({
            category: category.name,
            text: 'Boost your savings by setting up automatic transfers on payday. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
            priority: 'medium'
          });
        }
        break;
        
      case 'INVESTMENT_HEALTH':
        if (category.percentage < 40) {
          recommendations.push({
            category: category.name,
            text: 'Start investing now, even with small amounts. Consider setting up a retirement account like an IRA with automatic contributions.',
            priority: 'high'
          });
        } else {
          recommendations.push({
            category: category.name,
            text: 'Diversify your investments across more asset classes. Consider index funds for broader market exposure with lower fees.',
            priority: 'medium'
          });
        }
        break;
        
      case 'DEBT_MANAGEMENT':
        if (category.percentage < 40) {
          recommendations.push({
            category: category.name,
            text: 'Focus on paying down high-interest debt first. Consider the debt avalanche method to minimize interest payments.',
            priority: 'high'
          });
        } else {
          recommendations.push({
            category: category.name,
            text: 'Continue your debt reduction plan. Consider refinancing high-interest debt to lower rates if possible.',
            priority: 'medium'
          });
        }
        break;
        
      case 'EXPENSE_CONTROL':
        if (category.percentage < 40) {
          recommendations.push({
            category: category.name,
            text: 'Set up specific budgets for each spending category and use Stackr Guardrails to prevent overspending.',
            priority: 'high'
          });
        } else {
          recommendations.push({
            category: category.name,
            text: 'Review your largest expense categories and look for opportunities to reduce costs without sacrificing quality of life.',
            priority: 'medium'
          });
        }
        break;
        
      case 'GOAL_PROGRESS':
        if (category.percentage < 40) {
          recommendations.push({
            category: category.name,
            text: 'Set 2-3 specific, measurable financial goals with deadlines. Break larger goals into smaller milestones.',
            priority: 'medium'
          });
        } else {
          recommendations.push({
            category: category.name,
            text: 'Review and update your financial goals quarterly. Celebrate progress milestones to stay motivated.',
            priority: 'low'
          });
        }
        break;
        
      case 'GUARDRAILS_USAGE':
        recommendations.push({
          category: category.name,
          text: 'Set up Stackr Guardrails for your top 5 spending categories to prevent overspending and stay on budget.',
          priority: 'medium'
        });
        break;
    }
  }
  
  // Add general recommendations if we don't have enough specific ones
  if (recommendations.length < 3) {
    recommendations.push({
      category: 'General',
      text: 'Schedule a monthly financial review to track your progress and adjust your plans as needed.',
      priority: 'medium'
    });
  }
  
  if (recommendations.length < 3) {
    recommendations.push({
      category: 'General',
      text: 'Build an emergency fund with 3-6 months of essential expenses before focusing on other financial goals.',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

/**
 * Generate key insights based on user data
 * @param {Object} userData - User financial data
 * @param {Array} categoryScores - Category scores
 * @returns {Array} - Array of insights
 */
function generateInsights(userData, categoryScores) {
  const insights = [];
  
  // Get strongest category
  const strongestCategory = [...categoryScores].sort((a, b) => 
    b.percentage - a.percentage
  )[0];
  
  if (strongestCategory) {
    insights.push({
      title: 'Your Financial Strength',
      text: `Your strongest area is ${strongestCategory.name} with a score of ${strongestCategory.percentage}%. ${strongestCategory.details[0]}`,
      type: 'positive'
    });
  }
  
  // Calculate income and expense trend
  const income = userData.income || [];
  const expenses = userData.expenses || [];
  
  if (income.length >= 3 && expenses.length >= 3) {
    // Sort by date
    const sortedIncome = [...income].sort((a, b) => 
      new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
    );
    
    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
    );
    
    // Calculate income trend (last 3 periods)
    const recentIncome = sortedIncome.slice(-3);
    const incomeStart = parseFloat(recentIncome[0].amount || 0);
    const incomeEnd = parseFloat(recentIncome[recentIncome.length - 1].amount || 0);
    const incomeTrend = ((incomeEnd - incomeStart) / incomeStart) * 100;
    
    // Calculate expense trend (last 3 periods)
    const recentExpenses = sortedExpenses.slice(-3);
    const expenseStart = recentExpenses.reduce((sum, expense) => 
      sum + parseFloat(expense.amount || 0), 0
    );
    const expenseEnd = recentExpenses.reduce((sum, expense) => 
      sum + parseFloat(expense.amount || 0), 0
    );
    const expenseTrend = expenseStart > 0 ? ((expenseEnd - expenseStart) / expenseStart) * 100 : 0;
    
    if (incomeTrend > 5 && expenseTrend < incomeTrend) {
      insights.push({
        title: 'Income Growth',
        text: `Your income has increased by ${incomeTrend.toFixed(1)}% recently, outpacing your expense growth of ${expenseTrend.toFixed(1)}%. Keep up this positive trend!`,
        type: 'positive'
      });
    } else if (incomeTrend < 0) {
      insights.push({
        title: 'Income Trend',
        text: `Your income has decreased by ${Math.abs(incomeTrend).toFixed(1)}% recently. Consider exploring additional income sources in the Gigs section.`,
        type: 'negative'
      });
    }
    
    if (expenseTrend > 10) {
      insights.push({
        title: 'Expense Trend',
        text: `Your expenses have increased by ${expenseTrend.toFixed(1)}% recently. Review your spending categories to identify areas for potential savings.`,
        type: 'negative'
      });
    } else if (expenseTrend < -5) {
      insights.push({
        title: 'Expense Reduction',
        text: `You've reduced your expenses by ${Math.abs(expenseTrend).toFixed(1)}% recently. Great job controlling your spending!`,
        type: 'positive'
      });
    }
  }
  
  // Add insight about savings potential
  const incomeSplit = userData.incomeSplit || { needs: 40, wants: 30, savings: 30 };
  
  insights.push({
    title: 'Savings Potential',
    text: `Based on your current income split, you're aiming to save ${incomeSplit.savings}% of your income. Consistently achieving this target could significantly improve your financial security.`,
    type: 'neutral'
  });
  
  return insights;
}

/**
 * Save personal financial assessment scorecard for a user
 * @param {string} userId - User ID
 * @param {Object} scorecard - Personal financial assessment scorecard data
 */
function savePersonalFinancialAssessmentScorecard(userId, scorecard) {
  try {
    // Get existing scorecards from localStorage
    const existingDataStr = localStorage.getItem('personal-financial-assessments') || '{}';
    const existingData = JSON.parse(existingDataStr);
    
    // Add/update this user's scorecard
    if (!existingData[userId]) {
      existingData[userId] = [];
    }
    
    // Keep only the last 6 scorecards
    existingData[userId].unshift(scorecard);
    if (existingData[userId].length > 6) {
      existingData[userId] = existingData[userId].slice(0, 6);
    }
    
    // Save back to localStorage
    localStorage.setItem('personal-financial-assessments', JSON.stringify(existingData));
    
  } catch (error) {
    console.log('Error saving personal financial assessment scorecard:', error);
  }
}

/**
 * Notify user about their new scorecard
 * @param {string} userId - User ID
 * @param {Object} scorecard - Personal financial assessment scorecard data
 */
function notifyUserAboutScorecard(userId, scorecard) {
  try {
    // Create notification title based on score
    let title = 'Personal Financial Assessment';
    let message = '';
    
    if (scorecard.overallScore >= 80) {
      message = `Great job! Your financial personal financial assessment score is ${scorecard.overallScore}. You're making excellent financial choices.`;
    } else if (scorecard.overallScore >= 60) {
      message = `Your financial personal financial assessment score is ${scorecard.overallScore}. You've made good progress with some areas for improvement.`;
    } else {
      message = `Your financial personal financial assessment score is ${scorecard.overallScore}. Check your assessment for important recommendations.`;
    }
    
    // Add notification with specific type identifier
    createNotification(userId, {
      title,
      message,
      type: NOTIFICATION_TYPES.FINANCIAL_SUMMARY, // Using available type that best matches
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      data: {
        scoreId: scorecard.generatedAt.getTime(),
        score: scorecard.overallScore,
        scoreLevel: scorecard.scoreLevel,
        assessmentType: 'personal_finance' // Add identifier to distinguish from gig worker ratings
      }
    });
  } catch (error) {
    console.log('Error sending financial assessment notification:', error);
  }
}

/**
 * Get saved personal financial assessment scorecards for a user
 * @param {string} userId - User ID
 * @returns {Array} - Array of user's scorecards, newest first
 */
export function getUserPersonalFinancialAssessmentScorecard(userId) {
  try {
    // Get scorecards from localStorage
    const existingDataStr = localStorage.getItem('personal-financial-assessments') || '{}';
    const existingData = JSON.parse(existingDataStr);
    
    // Return this user's scorecards or empty array
    return existingData[userId] || [];
  } catch (error) {
    console.log('Error getting personal financial assessment scorecards:', error);
    return [];
  }
}

/**
 * Get the latest personal financial assessment scorecard for a user
 * @param {string} userId - User ID
 * @returns {Object|null} - Latest personal financial assessment scorecard or null
 */
export function getLatestPersonalFinancialAssessmentScorecard(userId) {
  const scorecards = getUserPersonalFinancialAssessmentScorecard(userId);
  return scorecards.length > 0 ? scorecards[0] : null;
}

/**
 * Check if it's time to generate a new personal financial assessment scorecard
 * @param {string} userId - User ID
 * @returns {boolean} - True if it's time for a new scorecard
 */
export function shouldGeneratePersonalFinancialAssessmentScorecard(userId) {
  const scorecards = getUserPersonalFinancialAssessmentScorecard(userId);
  
  // If no scorecards, definitely generate one
  if (scorecards.length === 0) return true;
  
  // Check date of most recent scorecard
  const latestScorecard = scorecards[0];
  const now = new Date();
  const latestDate = new Date(latestScorecard.generatedAt);
  
  // Generate new scorecard if the latest is more than 30 days old
  const daysSinceLastScorecard = Math.floor((now - latestDate) / (1000 * 60 * 60 * 24));
  
  return daysSinceLastScorecard >= 30;
}

/**
 * Render the personal financial assessment scorecard page
 * @param {string} userId - User ID
 * @returns {HTMLElement} - The scorecard page element
 */
export async function renderPersonalFinancialAssessmentScorecardPage(userId) {
  // Container for the entire page
  const container = document.createElement('div');
  container.className = 'personal-financial-assessment-page';
  
  // Create loading state
  const loadingElement = document.createElement('div');
  loadingElement.className = 'personal-financial-assessment-loading';
  loadingElement.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Calculating your personal financial assessment...</p>
  `;
  container.appendChild(loadingElement);
  
  try {
    // Get latest scorecard or generate a new one
    let scorecard = getLatestPersonalFinancialAssessmentScorecard(userId);
    
    // If no scorecard exists or it's time for a new one, calculate a new scorecard
    if (!scorecard || shouldGeneratePersonalFinancialAssessmentScorecard(userId)) {
      scorecard = await calculatePersonalFinancialAssessmentScore(userId);
    }
    
    // Remove loading element
    container.removeChild(loadingElement);
    
    // Create scorecard content
    const scorecardContent = createScorecardContent(scorecard);
    container.appendChild(scorecardContent);
    
    return container;
  } catch (error) {
    console.log('Error rendering personal financial assessment:', error);
    
    // Remove loading element
    if (loadingElement.parentNode === container) {
      container.removeChild(loadingElement);
    }
    
    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'personal-financial-assessment-error';
    errorElement.innerHTML = `
      <h2>Unable to Load Personal Financial Assessment</h2>
      <p>We encountered an issue while calculating your personal financial assessment. Please try again later.</p>
      <button class="retry-button">Try Again</button>
    `;
    
    // Add retry button functionality
    const retryButton = errorElement.querySelector('.retry-button');
    retryButton.addEventListener('click', async () => {
      // Replace error with loading state
      container.removeChild(errorElement);
      container.appendChild(loadingElement);
      
      try {
        // Calculate new scorecard
        const newScorecard = await calculatePersonalFinancialAssessmentScore(userId);
        
        // Remove loading element
        container.removeChild(loadingElement);
        
        // Add scorecard content
        const scorecardContent = createScorecardContent(newScorecard);
        container.appendChild(scorecardContent);
      } catch (retryError) {
        console.log('Error on retry:', retryError);
        container.removeChild(loadingElement);
        container.appendChild(errorElement);
      }
    });
    
    container.appendChild(errorElement);
    return container;
  }
}

/**
 * Create the scorecard content elements
 * @param {Object} scorecard - Personal financial assessment scorecard data
 * @returns {HTMLElement} - The scorecard content element
 */
function createScorecardContent(scorecard) {
  const content = document.createElement('div');
  content.className = 'personal-financial-assessment-content';
  
  // Add header
  const header = document.createElement('header');
  header.className = 'personal-financial-assessment-header';
  header.innerHTML = `
    <h1>Personal Financial Assessment</h1>
    <p class="scorecard-date">Generated on ${new Date(scorecard.generatedAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</p>
  `;
  content.appendChild(header);
  
  // Add overall score section
  const scoreSection = document.createElement('section');
  scoreSection.className = 'personal-financial-assessment-overall-score';
  scoreSection.innerHTML = `
    <div class="score-circle" style="background: conic-gradient(${scorecard.scoreColor} 0% ${scorecard.overallScore}%, #e2e8f0 ${scorecard.overallScore}% 100%)">
      <div class="score-inner">
        <span class="score-value">${scorecard.overallScore}</span>
        <span class="score-label">${scorecard.scoreLevel}</span>
      </div>
    </div>
    <p class="score-description">${scorecard.scoreDescription}</p>
  `;
  content.appendChild(scoreSection);
  
  // Add category scores section
  const categoriesSection = document.createElement('section');
  categoriesSection.className = 'personal-financial-assessment-categories';
  
  const categoriesHeader = document.createElement('h2');
  categoriesHeader.textContent = 'Financial Health Categories';
  categoriesSection.appendChild(categoriesHeader);
  
  const categoriesGrid = document.createElement('div');
  categoriesGrid.className = 'categories-grid';
  
  // Add each category
  scorecard.categoryScores.forEach(category => {
    const categoryCard = document.createElement('div');
    categoryCard.className = 'category-card';
    
    // Set color based on percentage
    let categoryColor = 'var(--color-danger-500)';
    if (category.percentage >= 80) {
      categoryColor = 'var(--color-success-500)';
    } else if (category.percentage >= 60) {
      categoryColor = 'var(--color-success-400)';
    } else if (category.percentage >= 40) {
      categoryColor = 'var(--color-warning-400)';
    }
    
    categoryCard.innerHTML = `
      <div class="category-header">
        <h3>${category.name}</h3>
        <div class="category-score" style="color: ${categoryColor}">
          ${category.percentage}%
        </div>
      </div>
      <div class="category-progress">
        <div class="progress-bar" style="width: ${category.percentage}%; background-color: ${categoryColor}"></div>
      </div>
      <div class="category-details">
        <p>${category.details[0]}</p>
      </div>
    `;
    
    categoriesGrid.appendChild(categoryCard);
  });
  
  categoriesSection.appendChild(categoriesGrid);
  content.appendChild(categoriesSection);
  
  // Add recommendations section
  const recommendationsSection = document.createElement('section');
  recommendationsSection.className = 'personal-financial-assessment-recommendations';
  
  const recommendationsHeader = document.createElement('h2');
  recommendationsHeader.textContent = 'Personalized Recommendations';
  recommendationsSection.appendChild(recommendationsHeader);
  
  const recommendationsList = document.createElement('div');
  recommendationsList.className = 'recommendations-list';
  
  // Add each recommendation
  scorecard.recommendations.forEach(recommendation => {
    const recommendationCard = document.createElement('div');
    recommendationCard.className = `recommendation-card priority-${recommendation.priority}`;
    
    recommendationCard.innerHTML = `
      <div class="recommendation-category">${recommendation.category}</div>
      <div class="recommendation-text">${recommendation.text}</div>
      ${recommendation.priority === 'high' ? '<div class="priority-badge">High Priority</div>' : ''}
    `;
    
    recommendationsList.appendChild(recommendationCard);
  });
  
  recommendationsSection.appendChild(recommendationsList);
  content.appendChild(recommendationsSection);
  
  // Add insights section
  const insightsSection = document.createElement('section');
  insightsSection.className = 'personal-financial-assessment-insights';
  
  const insightsHeader = document.createElement('h2');
  insightsHeader.textContent = 'Financial Insights';
  insightsSection.appendChild(insightsHeader);
  
  const insightsList = document.createElement('div');
  insightsList.className = 'insights-list';
  
  // Add each insight
  scorecard.insights.forEach(insight => {
    const insightCard = document.createElement('div');
    insightCard.className = `insight-card insight-${insight.type}`;
    
    insightCard.innerHTML = `
      <div class="insight-title">${insight.title}</div>
      <div class="insight-text">${insight.text}</div>
    `;
    
    insightsList.appendChild(insightCard);
  });
  
  insightsSection.appendChild(insightsList);
  content.appendChild(insightsSection);
  
  // Add action button section
  const actionSection = document.createElement('section');
  actionSection.className = 'personal-financial-assessment-actions';
  
  const actionButton = document.createElement('button');
  actionButton.className = 'refresh-scorecard-button';
  actionButton.textContent = 'Refresh Assessment';
  actionButton.addEventListener('click', async () => {
    try {
      // Replace current content with loading state
      const parentElement = content.parentNode;
      parentElement.removeChild(content);
      
      const loadingElement = document.createElement('div');
      loadingElement.className = 'personal-financial-assessment-loading';
      loadingElement.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Recalculating your personal financial assessment...</p>
      `;
      parentElement.appendChild(loadingElement);
      
      // Calculate new scorecard
      const newScorecard = await calculatePersonalFinancialAssessmentScore(scorecard.userId);
      
      // Remove loading element
      parentElement.removeChild(loadingElement);
      
      // Add new scorecard content
      const newContent = createScorecardContent(newScorecard);
      parentElement.appendChild(newContent);
    } catch (error) {
      console.log('Error refreshing financial assessment:', error);
    }
  });
  
  actionSection.appendChild(actionButton);
  content.appendChild(actionSection);
  
  return content;
}

// Add stylesheet for the personal financial assessment scorecard
function addScorecardStyles() {
  // Check if stylesheet already exists
  if (document.getElementById('personal-financial-assessment-styles')) return;
  
  const styleSheet = document.createElement('style');
  styleSheet.id = 'personal-financial-assessment-styles';
  
  styleSheet.textContent = `
    .personal-financial-assessment-page {
      max-width: 1000px;
      margin: 0 auto;
      padding: var(--container-padding);
    }
    
    .personal-financial-assessment-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 0;
    }
    
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .personal-financial-assessment-error {
      text-align: center;
      padding: 2rem;
      background: var(--color-card-background);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    
    .retry-button {
      background: var(--color-primary);
      color: white;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: var(--radius-md);
      margin-top: 1rem;
      cursor: pointer;
      font-weight: 500;
    }
    
    .personal-financial-assessment-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .personal-financial-assessment-header h1 {
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary, #6366f1) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }
    
    .scorecard-date {
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }
    
    .personal-financial-assessment-overall-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 3rem;
    }
    
    .score-circle {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    
    .score-inner {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: var(--color-card-background);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .score-value {
      font-size: 3rem;
      font-weight: 700;
      line-height: 1;
    }
    
    .score-label {
      font-size: 1rem;
      font-weight: 500;
      color: var(--color-text-secondary);
    }
    
    .score-description {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .personal-financial-assessment-categories,
    .personal-financial-assessment-recommendations,
    .personal-financial-assessment-insights {
      margin-bottom: 3rem;
    }
    
    .personal-financial-assessment-categories h2,
    .personal-financial-assessment-recommendations h2,
    .personal-financial-assessment-insights h2 {
      margin-bottom: 1.5rem;
      color: var(--color-heading);
      position: relative;
      padding-bottom: 0.5rem;
    }
    
    .personal-financial-assessment-categories h2:after,
    .personal-financial-assessment-recommendations h2:after,
    .personal-financial-assessment-insights h2:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 3px;
      background: var(--color-primary);
      border-radius: 3px;
    }
    
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .category-card {
      background: var(--color-card-background);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
    }
    
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    
    .category-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
    
    .category-score {
      font-weight: 700;
      font-size: 1.25rem;
    }
    
    .category-progress {
      height: 8px;
      background: var(--color-border);
      border-radius: 4px;
      margin-bottom: 1rem;
      overflow: hidden;
    }
    
    .progress-bar {
      height: 100%;
      border-radius: 4px;
    }
    
    .category-details p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }
    
    .recommendations-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .recommendation-card {
      background: var(--color-card-background);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
      position: relative;
      border-left: 4px solid var(--color-primary);
    }
    
    .recommendation-card.priority-high {
      border-left-color: var(--color-danger-500);
    }
    
    .recommendation-card.priority-medium {
      border-left-color: var(--color-warning-500);
    }
    
    .recommendation-card.priority-low {
      border-left-color: var(--color-success-500);
    }
    
    .recommendation-category {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--color-heading);
    }
    
    .recommendation-text {
      color: var(--color-text);
      font-size: 0.95rem;
    }
    
    .priority-badge {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: var(--color-danger-100);
      color: var(--color-danger-700);
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    
    .insights-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .insight-card {
      background: var(--color-card-background);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
    }
    
    .insight-positive {
      background: linear-gradient(to bottom right, var(--color-card-background), var(--color-success-50));
    }
    
    .insight-negative {
      background: linear-gradient(to bottom right, var(--color-card-background), var(--color-danger-50));
    }
    
    .insight-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--color-heading);
    }
    
    .insight-text {
      color: var(--color-text);
      font-size: 0.95rem;
    }
    
    .personal-financial-assessment-actions {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }
    
    .refresh-scorecard-button {
      background: var(--color-primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }
    
    .refresh-scorecard-button:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .categories-grid,
      .recommendations-list,
      .insights-list {
        grid-template-columns: 1fr;
      }
      
      .score-circle {
        width: 150px;
        height: 150px;
      }
      
      .score-inner {
        width: 120px;
        height: 120px;
      }
      
      .score-value {
        font-size: 2.5rem;
      }
    }
  `;
  
  document.head.appendChild(styleSheet);
}

// Add styles when this module is imported
addScorecardStyles();