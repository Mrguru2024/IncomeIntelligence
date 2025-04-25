/**
 * Achievement and Goal Milestone Service
 * Tracks user progress and sends achievement notifications
 */

import { createAchievementNotification, createGoalProgressNotification } from './notification-service.js';

// Define achievement types
const ACHIEVEMENT_TYPES = {
  SAVINGS_MILESTONE: 'savings_milestone',
  STREAK: 'streak',
  BUDGET_MASTERY: 'budget_mastery',
  INCOME_GROWTH: 'income_growth',
  DEBT_REDUCTION: 'debt_reduction',
  CHALLENGE_COMPLETE: 'challenge_complete',
  ACCOUNT_MILESTONE: 'account_milestone',
  LOGIN_STREAK: 'login_streak'
};

// Achievement definitions
const ACHIEVEMENTS = [
  // Savings milestones
  {
    id: 'first_100_saved',
    type: ACHIEVEMENT_TYPES.SAVINGS_MILESTONE,
    title: 'Savings Starter',
    description: 'Save your first $100',
    threshold: 100,
    icon: '💰',
    milestone: true
  },
  {
    id: 'first_1000_saved',
    type: ACHIEVEMENT_TYPES.SAVINGS_MILESTONE,
    title: 'Serious Saver',
    description: 'Save your first $1,000',
    threshold: 1000,
    icon: '💸',
    milestone: true
  },
  {
    id: 'first_5000_saved',
    type: ACHIEVEMENT_TYPES.SAVINGS_MILESTONE,
    title: 'Savings Champion',
    description: 'Save your first $5,000',
    threshold: 5000,
    icon: '🏆',
    milestone: true
  },
  
  // Streak achievements
  {
    id: 'week_streak',
    type: ACHIEVEMENT_TYPES.STREAK,
    title: 'Week Warrior',
    description: 'Stay under budget for 7 consecutive days',
    threshold: 7,
    icon: '📅',
    milestone: false
  },
  {
    id: 'month_streak',
    type: ACHIEVEMENT_TYPES.STREAK,
    title: 'Monthly Master',
    description: 'Stay under budget for a full month',
    threshold: 30,
    icon: '📆',
    milestone: true
  },
  {
    id: 'quarter_streak',
    type: ACHIEVEMENT_TYPES.STREAK,
    title: 'Quarterly Champion',
    description: 'Stay under budget for 3 consecutive months',
    threshold: 90,
    icon: '🏅',
    milestone: true
  },
  
  // Budget mastery
  {
    id: 'perfect_budget_week',
    type: ACHIEVEMENT_TYPES.BUDGET_MASTERY,
    title: 'Budget Apprentice',
    description: 'Stay within 5% of your budget for a full week',
    threshold: 5,
    icon: '📊',
    milestone: false
  },
  {
    id: 'perfect_budget_month',
    type: ACHIEVEMENT_TYPES.BUDGET_MASTERY,
    title: 'Budget Expert',
    description: 'Stay within 5% of your budget for a full month',
    threshold: 5,
    icon: '📈',
    milestone: true
  },
  
  // Income growth
  {
    id: 'income_boost_10',
    type: ACHIEVEMENT_TYPES.INCOME_GROWTH,
    title: 'Income Booster',
    description: 'Increase your monthly income by 10%',
    threshold: 10,
    icon: '💼',
    milestone: true
  },
  {
    id: 'income_boost_25',
    type: ACHIEVEMENT_TYPES.INCOME_GROWTH,
    title: 'Income Accelerator',
    description: 'Increase your monthly income by 25%',
    threshold: 25,
    icon: '🚀',
    milestone: true
  },
  
  // Debt reduction
  {
    id: 'debt_reduction_25',
    type: ACHIEVEMENT_TYPES.DEBT_REDUCTION,
    title: 'Debt Crusher',
    description: 'Reduce your total debt by 25%',
    threshold: 25,
    icon: '✂️',
    milestone: true
  },
  {
    id: 'debt_freedom',
    type: ACHIEVEMENT_TYPES.DEBT_REDUCTION,
    title: 'Debt Freedom',
    description: 'Pay off all your tracked debt',
    threshold: 100,
    icon: '🎊',
    milestone: true
  },
  
  // Challenge completions
  {
    id: 'first_challenge',
    type: ACHIEVEMENT_TYPES.CHALLENGE_COMPLETE,
    title: 'Challenge Accepted',
    description: 'Complete your first savings challenge',
    threshold: 1,
    icon: '🏁',
    milestone: true
  },
  {
    id: 'five_challenges',
    type: ACHIEVEMENT_TYPES.CHALLENGE_COMPLETE,
    title: 'Challenge Master',
    description: 'Complete 5 savings challenges',
    threshold: 5,
    icon: '🏋️',
    milestone: true
  },
  
  // Account milestones
  {
    id: 'profile_complete',
    type: ACHIEVEMENT_TYPES.ACCOUNT_MILESTONE,
    title: 'Profile Perfectionist',
    description: 'Complete all profile information',
    threshold: 100,
    icon: '📝',
    milestone: false
  },
  {
    id: 'first_bank_link',
    type: ACHIEVEMENT_TYPES.ACCOUNT_MILESTONE,
    title: 'Connected',
    description: 'Link your first bank account',
    threshold: 1,
    icon: '🔗',
    milestone: true
  },
  
  // Login streaks
  {
    id: 'login_streak_7',
    type: ACHIEVEMENT_TYPES.LOGIN_STREAK,
    title: 'Consistency Champion',
    description: 'Log in for 7 consecutive days',
    threshold: 7,
    icon: '🔥',
    milestone: false
  },
  {
    id: 'login_streak_30',
    type: ACHIEVEMENT_TYPES.LOGIN_STREAK,
    title: 'Dedication Master',
    description: 'Log in for 30 consecutive days',
    threshold: 30,
    icon: '⭐',
    milestone: true
  }
];

/**
 * User achievement store (in-memory for GREEN version)
 * In a real app, this would be stored in a database
 */
const userAchievements = {};

/**
 * Initialize achievements for a user
 * @param {string} userId - User ID
 */
export function initializeAchievements(userId) {
  if (!userAchievements[userId]) {
    userAchievements[userId] = {
      achievements: {},
      stats: {
        totalSaved: 0,
        budgetStreak: 0,
        completedChallenges: 0,
        loginStreak: 0,
        lastLogin: new Date().toISOString(),
        monthlyIncomeHistory: [],
        debtHistory: []
      }
    };
    
    // Initialize all achievements as not earned
    ACHIEVEMENTS.forEach(achievement => {
      userAchievements[userId].achievements[achievement.id] = {
        earned: false,
        progress: 0,
        earnedAt: null
      };
    });
  }
}

/**
 * Check and update achievements for a user
 * @param {string} userId - User ID
 * @param {Object} userData - User financial data
 */
export function checkAchievements(userId, userData) {
  // Ensure user has achievements initialized
  if (!userAchievements[userId]) {
    initializeAchievements(userId);
  }
  
  const userStats = userAchievements[userId].stats;
  const userAchievementData = userAchievements[userId].achievements;
  
  // Update user stats based on the provided data
  if (userData) {
    if (userData.totalSaved !== undefined) {
      userStats.totalSaved = userData.totalSaved;
    }
    
    if (userData.budgetStreak !== undefined) {
      userStats.budgetStreak = userData.budgetStreak;
    }
    
    if (userData.completedChallenges !== undefined) {
      userStats.completedChallenges = userData.completedChallenges;
    }
    
    if (userData.monthlyIncome !== undefined) {
      userStats.monthlyIncomeHistory.push({
        date: new Date().toISOString(),
        amount: userData.monthlyIncome
      });
      
      // Keep only the last 12 months of income history
      if (userStats.monthlyIncomeHistory.length > 12) {
        userStats.monthlyIncomeHistory.shift();
      }
    }
    
    if (userData.totalDebt !== undefined) {
      userStats.debtHistory.push({
        date: new Date().toISOString(),
        amount: userData.totalDebt
      });
      
      // Keep only the last 12 months of debt history
      if (userStats.debtHistory.length > 12) {
        userStats.debtHistory.shift();
      }
    }
  }
  
  // Check each achievement
  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already earned
    if (userAchievementData[achievement.id].earned) {
      return;
    }
    
    let progress = 0;
    let achieved = false;
    
    // Check achievement based on type
    switch (achievement.type) {
      case ACHIEVEMENT_TYPES.SAVINGS_MILESTONE:
        progress = Math.min(100, (userStats.totalSaved / achievement.threshold) * 100);
        achieved = userStats.totalSaved >= achievement.threshold;
        break;
        
      case ACHIEVEMENT_TYPES.STREAK:
        progress = Math.min(100, (userStats.budgetStreak / achievement.threshold) * 100);
        achieved = userStats.budgetStreak >= achievement.threshold;
        break;
        
      case ACHIEVEMENT_TYPES.CHALLENGE_COMPLETE:
        progress = Math.min(100, (userStats.completedChallenges / achievement.threshold) * 100);
        achieved = userStats.completedChallenges >= achievement.threshold;
        break;
        
      case ACHIEVEMENT_TYPES.LOGIN_STREAK:
        progress = Math.min(100, (userStats.loginStreak / achievement.threshold) * 100);
        achieved = userStats.loginStreak >= achievement.threshold;
        break;
        
      case ACHIEVEMENT_TYPES.INCOME_GROWTH:
        // Check income growth if we have enough history
        if (userStats.monthlyIncomeHistory.length >= 2) {
          const oldestIncome = userStats.monthlyIncomeHistory[0].amount;
          const latestIncome = userStats.monthlyIncomeHistory[userStats.monthlyIncomeHistory.length - 1].amount;
          const growthPercentage = oldestIncome > 0 ? ((latestIncome - oldestIncome) / oldestIncome) * 100 : 0;
          
          progress = Math.min(100, (growthPercentage / achievement.threshold) * 100);
          achieved = growthPercentage >= achievement.threshold;
        }
        break;
        
      case ACHIEVEMENT_TYPES.DEBT_REDUCTION:
        // Check debt reduction if we have enough history
        if (userStats.debtHistory.length >= 2) {
          const initialDebt = userStats.debtHistory[0].amount;
          const currentDebt = userStats.debtHistory[userStats.debtHistory.length - 1].amount;
          
          // Special case for debt freedom achievement
          if (achievement.id === 'debt_freedom') {
            achieved = currentDebt <= 0 && initialDebt > 0;
            progress = initialDebt > 0 ? Math.min(100, 100 - (currentDebt / initialDebt) * 100) : 0;
          } else {
            // Regular debt reduction achievement
            const reductionPercentage = initialDebt > 0 ? ((initialDebt - currentDebt) / initialDebt) * 100 : 0;
            progress = Math.min(100, (reductionPercentage / achievement.threshold) * 100);
            achieved = reductionPercentage >= achievement.threshold;
          }
        }
        break;
        
      // For other achievement types, we would need specific logic
      // For now, we'll just leave them unearned
    }
    
    // Update achievement progress
    userAchievementData[achievement.id].progress = progress;
    
    // If achievement is earned, update and send notification
    if (achieved) {
      userAchievementData[achievement.id].earned = true;
      userAchievementData[achievement.id].earnedAt = new Date().toISOString();
      
      // Send notification
      createAchievementNotification(
        userId,
        `Achievement Unlocked: ${achievement.title}`,
        `${achievement.icon} ${achievement.description}`,
        true, // Show in app
        true, // Send email for milestones, false otherwise
        false // Don't send push
      );
    }
  });
  
  return userAchievements[userId];
}

/**
 * Update login streak for a user
 * @param {string} userId - User ID
 */
export function updateLoginStreak(userId) {
  // Ensure user has achievements initialized
  if (!userAchievements[userId]) {
    initializeAchievements(userId);
  }
  
  const userStats = userAchievements[userId].stats;
  const lastLogin = new Date(userStats.lastLogin);
  const today = new Date();
  
  // Reset date parts for comparison (compare days only)
  lastLogin.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // Calculate days between logins
  const timeDiff = today.getTime() - lastLogin.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  // If logged in today already, do nothing
  if (daysDiff === 0) {
    return userStats.loginStreak;
  }
  
  // If it's been exactly 1 day, increment streak
  if (daysDiff === 1) {
    userStats.loginStreak += 1;
  } else {
    // If it's been more than 1 day, reset streak
    userStats.loginStreak = 1;
  }
  
  // Update last login
  userStats.lastLogin = today.toISOString();
  
  // Check login streak achievements
  checkAchievements(userId);
  
  return userStats.loginStreak;
}

/**
 * Update budget streak for a user
 * @param {string} userId - User ID
 * @param {boolean} underBudget - Whether the user was under budget
 */
export function updateBudgetStreak(userId, underBudget) {
  // Ensure user has achievements initialized
  if (!userAchievements[userId]) {
    initializeAchievements(userId);
  }
  
  const userStats = userAchievements[userId].stats;
  
  if (underBudget) {
    userStats.budgetStreak += 1;
  } else {
    userStats.budgetStreak = 0;
  }
  
  // Check streak achievements
  checkAchievements(userId);
  
  return userStats.budgetStreak;
}

/**
 * Update completed challenges count for a user
 * @param {string} userId - User ID
 * @param {Object} challengeData - Data about the completed challenge
 */
export function completeChallenge(userId, challengeData) {
  // Ensure user has achievements initialized
  if (!userAchievements[userId]) {
    initializeAchievements(userId);
  }
  
  const userStats = userAchievements[userId].stats;
  
  // Increment completed challenges count
  userStats.completedChallenges += 1;
  
  // Check challenge achievements
  checkAchievements(userId);
  
  return userStats.completedChallenges;
}

/**
 * Track savings goal progress for a user
 * @param {string} userId - User ID
 * @param {Object} goalData - Goal data including progress
 * @returns {boolean} - Whether a notification was created
 */
export function trackGoalProgress(userId, goalData) {
  if (!userId || !goalData || !goalData.name || !goalData.target) {
    return false;
  }
  
  // Calculate progress percentage
  const progressPercent = goalData.current / goalData.target * 100;
  
  // Determine if we should notify at this progress level
  // We'll notify at 25%, 50%, 75%, and 100%
  const notifyAt = [25, 50, 75, 100];
  
  // Find the milestone we just passed
  const milestone = notifyAt.find(m => {
    // If progress just crossed this milestone
    const previousAmount = goalData.previousAmount || 0;
    const previousPercent = previousAmount / goalData.target * 100;
    
    return previousPercent < m && progressPercent >= m;
  });
  
  if (milestone) {
    // Format goal amount
    const formattedTarget = formatCurrency(goalData.target);
    const formattedCurrent = formatCurrency(goalData.current);
    
    // Create appropriate message based on milestone
    let title, message;
    
    if (milestone === 100) {
      title = `Goal Achieved! 🎉`;
      message = `You've reached your goal of ${formattedTarget} for "${goalData.name}"!`;
    } else {
      title = `${milestone}% Progress on Your Goal`;
      message = `You've saved ${formattedCurrent} toward your goal of ${formattedTarget} for "${goalData.name}"`;
    }
    
    // Create goal progress notification
    createGoalProgressNotification(
      userId,
      title,
      message,
      {
        ...goalData,
        progressPercent,
        milestone
      },
      true, // Show in app
      milestone === 100, // Send email only for completed goals
      false // Don't send push
    );
    
    return true;
  }
  
  return false;
}

/**
 * Format currency value
 * @param {number} value - Currency value
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value) {
  return `$${Math.abs(value).toFixed(2)}`;
}

/**
 * Get all achievements for a user
 * @param {string} userId - User ID
 * @returns {Object} - User achievements data
 */
export function getUserAchievements(userId) {
  if (!userAchievements[userId]) {
    initializeAchievements(userId);
  }
  
  // Combine stats with earned achievements
  const earnedAchievements = Object.entries(userAchievements[userId].achievements)
    .filter(([_, data]) => data.earned)
    .map(([id, data]) => {
      const achievementDef = ACHIEVEMENTS.find(a => a.id === id);
      return {
        ...achievementDef,
        earnedAt: data.earnedAt
      };
    });
  
  // Get in-progress achievements
  const inProgressAchievements = Object.entries(userAchievements[userId].achievements)
    .filter(([_, data]) => !data.earned && data.progress > 0)
    .map(([id, data]) => {
      const achievementDef = ACHIEVEMENTS.find(a => a.id === id);
      return {
        ...achievementDef,
        progress: data.progress
      };
    })
    .sort((a, b) => b.progress - a.progress); // Sort by progress descending
  
  return {
    stats: { ...userAchievements[userId].stats },
    earned: earnedAchievements,
    inProgress: inProgressAchievements
  };
}

/**
 * Reset achievements for testing
 * @param {string} userId - User ID
 */
export function resetAchievements(userId) {
  delete userAchievements[userId];
  initializeAchievements(userId);
}