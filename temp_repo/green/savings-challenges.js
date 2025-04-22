/**
 * Gamified Savings Challenge Generator Module
 * Creates engaging saving challenges with achievement tracking and rewards
 */

// Challenge types and their descriptions
const CHALLENGE_TYPES = {
  DAILY: {
    id: 'daily',
    name: 'Daily Challenge',
    description: 'Save a small amount each day',
    duration: { min: 7, max: 30, default: 30 },
    difficulty: 'easy'
  },
  WEEKLY: {
    id: 'weekly',
    name: 'Weekly Power-Up',
    description: 'Save a larger amount once a week',
    duration: { min: 4, max: 12, default: 8 },
    difficulty: 'medium'
  },
  MONTHLY: {
    id: 'monthly',
    name: 'Monthly Milestone',
    description: 'Save a substantial amount once a month',
    duration: { min: 3, max: 12, default: 6 },
    difficulty: 'medium'
  },
  ROUND_UP: {
    id: 'round-up',
    name: 'Round-Up Challenge',
    description: 'Round up all purchases to the nearest dollar and save the difference',
    duration: { min: 14, max: 90, default: 30 },
    difficulty: 'easy'
  },
  NO_SPEND: {
    id: 'no-spend',
    name: 'No-Spend Period',
    description: 'Avoid spending in specific categories for a period',
    duration: { min: 7, max: 30, default: 14 },
    difficulty: 'hard'
  },
  SAVING_SPRINT: {
    id: 'saving-sprint',
    name: 'Savings Sprint',
    description: 'Maximize savings in a short, intense period',
    duration: { min: 3, max: 14, default: 7 },
    difficulty: 'hard'
  },
  INCREMENTAL: {
    id: 'incremental',
    name: 'Increment Challenge',
    description: 'Save an increasing amount each period',
    duration: { min: 4, max: 52, default: 26 },
    difficulty: 'medium'
  },
  DECLUTTER: {
    id: 'declutter',
    name: 'Declutter & Earn',
    description: 'Sell unused items and save all proceeds',
    duration: { min: 7, max: 30, default: 14 },
    difficulty: 'medium'
  },
  HABIT_SWAP: {
    id: 'habit-swap',
    name: 'Habit Swap',
    description: 'Replace expensive habits with cheaper alternatives and save the difference',
    duration: { min: 14, max: 60, default: 30 },
    difficulty: 'medium'
  },
  AUTOMATION: {
    id: 'automation',
    name: 'Auto-Save Setup',
    description: 'Set up automated transfers for consistent saving',
    duration: { min: 30, max: 90, default: 60 },
    difficulty: 'easy'
  }
};

// Achievement levels for challenges
const ACHIEVEMENT_LEVELS = [
  { name: 'Bronze', threshold: 1, icon: '🥉', bonus: 5 },
  { name: 'Silver', threshold: 5, icon: '🥈', bonus: 10 },
  { name: 'Gold', threshold: 10, icon: '🥇', bonus: 15 },
  { name: 'Platinum', threshold: 15, icon: '💎', bonus: 20 },
  { name: 'Diamond', threshold: 25, icon: '👑', bonus: 25 }
];

// Streak levels and bonuses
const STREAK_BONUSES = [
  { days: 3, bonus: 5 },
  { days: 7, bonus: 10 },
  { days: 14, bonus: 15 },
  { days: 30, bonus: 25 },
  { days: 60, bonus: 35 },
  { days: 90, bonus: 50 }
];

// Challenge themes for added fun
const CHALLENGE_THEMES = [
  { id: 'space', name: 'Space Explorer', description: 'Reach for the stars with your savings!' },
  { id: 'ocean', name: 'Ocean Adventure', description: 'Dive deep into saving success!' },
  { id: 'forest', name: 'Forest Journey', description: 'Grow your savings like a mighty forest!' },
  { id: 'mountain', name: 'Mountain Climber', description: 'Ascend to financial heights!' },
  { id: 'ninja', name: 'Savings Ninja', description: 'Master the art of saving with stealth and discipline!' },
  { id: 'wizard', name: 'Financial Wizard', description: 'Cast powerful spells of wealth growth!' },
  { id: 'superhero', name: 'Money Superhero', description: 'Save the day with your financial superpowers!' },
  { id: 'chef', name: 'Budget Chef', description: 'Cook up a delicious financial future!' }
];

// Color schemes for different challenge themes
const THEME_COLORS = {
  space: { primary: '#1a237e', secondary: '#7986cb', accent: '#ff4081' },
  ocean: { primary: '#006064', secondary: '#4dd0e1', accent: '#ffb74d' },
  forest: { primary: '#1b5e20', secondary: '#81c784', accent: '#ff8a65' },
  mountain: { primary: '#3e2723', secondary: '#a1887f', accent: '#4fc3f7' },
  ninja: { primary: '#212121', secondary: '#616161', accent: '#f44336' },
  wizard: { primary: '#4a148c', secondary: '#9c27b0', accent: '#ffeb3b' },
  superhero: { primary: '#0d47a1', secondary: '#1976d2', accent: '#f44336' },
  chef: { primary: '#bf360c', secondary: '#ff5722', accent: '#fff176' }
};

/**
 * Generate a savings challenge based on user preferences and financial data
 * @param {Object} userData - User's financial data 
 * @param {Object} preferences - User's challenge preferences
 * @returns {Object} - Generated challenge details
 */
export function generateSavingsChallenge(userData, preferences = {}) {
  // Default user data if not provided
  const financialData = userData || {
    monthlyIncome: 3000,
    savingsRate: 10,
    currentSavings: 2000,
    expenses: { discretionary: 500 }
  };
  
  // Get challenge type
  const challengeType = preferences.challengeType || selectRandomChallenge();
  const challengeInfo = CHALLENGE_TYPES[challengeType] || CHALLENGE_TYPES.DAILY;
  
  // Determine duration
  const duration = preferences.duration || challengeInfo.duration.default;
  
  // Determine theme
  const theme = preferences.theme || selectRandomTheme();
  const themeInfo = CHALLENGE_THEMES.find(t => t.id === theme) || CHALLENGE_THEMES[0];
  const themeColors = THEME_COLORS[theme] || THEME_COLORS.space;
  
  // Calculate target amount based on user's financial data and challenge type
  const targetAmount = calculateTargetAmount(challengeInfo, financialData, duration);
  
  // Generate challenge structure
  const challenge = {
    id: generateChallengeId(),
    type: challengeInfo.id,
    name: `${themeInfo.name}: ${challengeInfo.name}`,
    description: challengeInfo.description,
    themeDescription: themeInfo.description,
    startDate: new Date().toISOString(),
    endDate: addDays(new Date(), duration).toISOString(),
    duration: duration,
    targetAmount: targetAmount,
    currentAmount: 0,
    dailyTargets: generateDailyTargets(challengeInfo, targetAmount, duration),
    progress: 0,
    status: 'active',
    difficulty: challengeInfo.difficulty,
    theme: {
      id: themeInfo.id,
      name: themeInfo.name,
      colors: themeColors
    },
    milestones: generateMilestones(targetAmount, duration),
    streakCount: 0,
    lastContributionDate: null,
    achievements: [],
    tips: generateTips(challengeInfo.id),
    rewards: generateRewards(targetAmount, challengeInfo)
  };
  
  return challenge;
}

/**
 * Generate a list of available challenges for the user to choose from
 * @param {Object} userData - User's financial data
 * @returns {Array} - List of challenge options
 */
export function getAvailableChallenges(userData) {
  // Get user's income level to determine appropriate challenge amounts
  const incomeLevel = userData?.monthlyIncome || 3000;
  const savingsCapacity = incomeLevel * 0.2; // Assume max 20% of income for challenges
  
  // Generate list of challenges with appropriate amounts
  return Object.values(CHALLENGE_TYPES).map(challengeType => {
    // Pick a random theme for variety
    const theme = selectRandomTheme();
    const themeInfo = CHALLENGE_THEMES.find(t => t.id === theme);
    
    // Calculate appropriate target amount based on this challenge type
    const duration = challengeType.duration.default;
    const targetAmount = calculateTargetAmount(challengeType, userData, duration);
    
    return {
      id: challengeType.id,
      name: `${themeInfo.name}: ${challengeType.name}`,
      description: challengeType.description,
      themeDescription: themeInfo.description,
      difficulty: challengeType.difficulty,
      duration: duration,
      targetAmount: targetAmount,
      theme: {
        id: themeInfo.id,
        name: themeInfo.name,
        colors: THEME_COLORS[theme]
      }
    };
  });
}

/**
 * Update a challenge with a new contribution
 * @param {Object} challenge - The current challenge
 * @param {number} amount - Amount contributed
 * @param {Date} date - Date of contribution
 * @returns {Object} - Updated challenge
 */
export function updateChallenge(challenge, amount, date = new Date()) {
  // Clone the challenge to avoid mutations
  const updatedChallenge = { ...challenge };
  
  // If challenge is already completed or failed, do not update
  if (updatedChallenge.status === 'completed' || updatedChallenge.status === 'failed') {
    return updatedChallenge;
  }
  
  // Format date as ISO string if it's a Date object
  const contributionDate = date instanceof Date ? date.toISOString() : date;
  
  // Update current amount
  updatedChallenge.currentAmount += amount;
  
  // Calculate new progress percentage
  updatedChallenge.progress = Math.min(100, Math.round((updatedChallenge.currentAmount / updatedChallenge.targetAmount) * 100));
  
  // Check if challenge is completed
  if (updatedChallenge.currentAmount >= updatedChallenge.targetAmount) {
    updatedChallenge.status = 'completed';
    updatedChallenge.completedDate = contributionDate;
    
    // Add completion achievement
    updatedChallenge.achievements.push({
      id: 'challenge-complete',
      name: 'Challenge Champion',
      description: 'Successfully completed a savings challenge',
      date: contributionDate,
      icon: '🏆'
    });
  }
  
  // Update streak information
  updatedChallenge.streakCount = updateStreak(updatedChallenge, contributionDate);
  updatedChallenge.lastContributionDate = contributionDate;
  
  // Check for milestone achievements
  const newMilestones = updatedChallenge.milestones.filter(
    milestone => !milestone.achieved && updatedChallenge.currentAmount >= milestone.amount
  );
  
  newMilestones.forEach(milestone => {
    // Mark milestone as achieved
    const milestoneIndex = updatedChallenge.milestones.findIndex(m => m.id === milestone.id);
    if (milestoneIndex >= 0) {
      updatedChallenge.milestones[milestoneIndex].achieved = true;
      updatedChallenge.milestones[milestoneIndex].achievedDate = contributionDate;
    }
    
    // Add milestone achievement
    updatedChallenge.achievements.push({
      id: `milestone-${milestone.id}`,
      name: `${milestone.name} Reached`,
      description: `Reached the ${milestone.name} milestone`,
      date: contributionDate,
      icon: milestone.icon || '🎯'
    });
  });
  
  // Check for streak achievements
  const streakBonuses = STREAK_BONUSES.filter(bonus => bonus.days === updatedChallenge.streakCount);
  streakBonuses.forEach(bonus => {
    updatedChallenge.achievements.push({
      id: `streak-${bonus.days}`,
      name: `${bonus.days}-Day Streak`,
      description: `Maintained a ${bonus.days}-day savings streak`,
      date: contributionDate,
      icon: '🔥',
      bonusPoints: bonus.bonus
    });
  });
  
  // Check for challenge completion based on endDate
  const endDate = new Date(updatedChallenge.endDate);
  const currentDate = new Date(contributionDate);
  
  if (currentDate > endDate && updatedChallenge.status !== 'completed') {
    updatedChallenge.status = (updatedChallenge.progress >= 80) ? 'partiallyCompleted' : 'failed';
    
    // Add appropriate achievement
    if (updatedChallenge.status === 'partiallyCompleted') {
      updatedChallenge.achievements.push({
        id: 'almost-there',
        name: 'Almost There',
        description: 'Reached at least 80% of your savings goal',
        date: contributionDate,
        icon: '👏'
      });
    }
  }
  
  return updatedChallenge;
}

/**
 * Calculate a user's achievement level based on completed challenges
 * @param {Array} completedChallenges - Array of user's completed challenges
 * @returns {Object} - User's achievement level and details
 */
export function calculateAchievementLevel(completedChallenges) {
  const challengeCount = completedChallenges.length;
  
  // Determine achievement level based on number of completed challenges
  let currentLevel = ACHIEVEMENT_LEVELS[0];
  
  for (let i = ACHIEVEMENT_LEVELS.length - 1; i >= 0; i--) {
    if (challengeCount >= ACHIEVEMENT_LEVELS[i].threshold) {
      currentLevel = ACHIEVEMENT_LEVELS[i];
      break;
    }
  }
  
  // Calculate progress to next level
  let nextLevel = null;
  let progressToNext = 0;
  
  for (let i = 0; i < ACHIEVEMENT_LEVELS.length; i++) {
    if (ACHIEVEMENT_LEVELS[i].threshold > currentLevel.threshold) {
      nextLevel = ACHIEVEMENT_LEVELS[i];
      const remaining = nextLevel.threshold - challengeCount;
      const total = nextLevel.threshold - currentLevel.threshold;
      progressToNext = Math.round(((total - remaining) / total) * 100);
      break;
    }
  }
  
  // Calculate total points
  const totalPoints = completedChallenges.reduce((sum, challenge) => {
    // Base points for completing a challenge
    let points = 100;
    
    // Add points for difficulty
    if (challenge.difficulty === 'medium') points += 50;
    if (challenge.difficulty === 'hard') points += 100;
    
    // Add points for achievements within the challenge
    points += challenge.achievements.reduce((ach, a) => ach + (a.bonusPoints || 0), 0);
    
    return sum + points;
  }, 0);
  
  return {
    level: currentLevel.name,
    icon: currentLevel.icon,
    bonusMultiplier: currentLevel.bonus / 100 + 1, // e.g., 10% bonus = 1.1 multiplier
    challengesCompleted: challengeCount,
    nextLevel: nextLevel ? nextLevel.name : null,
    progressToNextLevel: progressToNext,
    requiredForNextLevel: nextLevel ? nextLevel.threshold - challengeCount : 0,
    totalPoints: totalPoints
  };
}

/**
 * Generate a leaderboard of users based on their challenge achievements
 * @param {Array} users - Array of users with their challenges
 * @returns {Array} - Sorted leaderboard with user achievements
 */
export function generateLeaderboard(users) {
  return users.map(user => {
    // Count completed challenges
    const completedChallenges = user.challenges.filter(c => c.status === 'completed');
    
    // Calculate achievement level
    const achievementLevel = calculateAchievementLevel(completedChallenges);
    
    // Calculate streak
    const currentStreak = user.challenges.reduce((maxStreak, challenge) => {
      return Math.max(maxStreak, challenge.streakCount || 0);
    }, 0);
    
    // Calculate total saved amount
    const totalSaved = completedChallenges.reduce((sum, challenge) => {
      return sum + (challenge.currentAmount || 0);
    }, 0);
    
    return {
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      challengesCompleted: completedChallenges.length,
      achievementLevel: achievementLevel.level,
      achievementIcon: achievementLevel.icon,
      points: achievementLevel.totalPoints,
      streak: currentStreak,
      totalSaved: totalSaved
    };
  }).sort((a, b) => b.points - a.points);
}

// Helper functions

/**
 * Select a random challenge type
 * @returns {string} - Challenge type ID
 */
function selectRandomChallenge() {
  const challengeTypes = Object.keys(CHALLENGE_TYPES);
  const randomIndex = Math.floor(Math.random() * challengeTypes.length);
  return challengeTypes[randomIndex];
}

/**
 * Select a random theme
 * @returns {string} - Theme ID
 */
function selectRandomTheme() {
  const randomIndex = Math.floor(Math.random() * CHALLENGE_THEMES.length);
  return CHALLENGE_THEMES[randomIndex].id;
}

/**
 * Generate a unique challenge ID
 * @returns {string} - Unique ID
 */
function generateChallengeId() {
  return 'challenge_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

/**
 * Add days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} - Resulting date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate target amount for challenge based on user's financial data
 * @param {Object} challengeInfo - Challenge type information
 * @param {Object} financialData - User's financial data
 * @param {number} duration - Challenge duration in days
 * @returns {number} - Target amount
 */
function calculateTargetAmount(challengeInfo, financialData, duration) {
  const { monthlyIncome = 3000, savingsRate = 10, expenses = {} } = financialData;
  const discretionarySpending = expenses.discretionary || monthlyIncome * 0.15;
  
  // Base calculations for different challenge types
  switch (challengeInfo.id) {
    case 'daily':
      // Daily small amount, adjusted for income
      const dailyBase = Math.max(1, Math.round(monthlyIncome * 0.001));
      return dailyBase * duration;
      
    case 'weekly':
      // Weekly larger amount, approximately 2% of monthly income per week
      const weeklyBase = Math.round(monthlyIncome * 0.02);
      const weeks = Math.ceil(duration / 7);
      return weeklyBase * weeks;
      
    case 'monthly':
      // Monthly substantial amount, adjusted savings rate
      const adjustedRate = savingsRate * 1.2; // 20% increase as a challenge
      const months = Math.ceil(duration / 30);
      return Math.round((monthlyIncome * (adjustedRate / 100)) * months);
      
    case 'round-up':
      // Estimate round-up amounts based on discretionary spending
      // Assume average of 15 transactions per week with average round-up of $0.50
      const weeklyTransactions = 15;
      const avgRoundUp = 0.5;
      const totalWeeks = duration / 7;
      return Math.round(weeklyTransactions * avgRoundUp * totalWeeks);
      
    case 'no-spend':
      // Based on cutting discretionary spending by 80% for the period
      const dailyDiscretionary = discretionarySpending / 30;
      const savingsPercentage = 0.8; // Save 80% of discretionary during no-spend
      return Math.round(dailyDiscretionary * duration * savingsPercentage);
      
    case 'saving-sprint':
      // Intense saving, 10% of monthly income for the sprint period
      const sprintPercentage = 0.10;
      const dailyIncome = monthlyIncome / 30;
      return Math.round(dailyIncome * duration * sprintPercentage);
      
    case 'incremental':
      // Save increasing amounts each period (weekly)
      // Start with 0.25% of income, increasing by 0.25% each week
      const startPercent = 0.0025;
      const weeks2 = Math.ceil(duration / 7);
      let total = 0;
      for (let i = 0; i < weeks2; i++) {
        total += monthlyIncome * (startPercent * (i + 1));
      }
      return Math.round(total);
      
    case 'declutter':
      // Average item selling price of $20, target of selling 2 items per week
      const itemsPerWeek = 2;
      const avgItemValue = 20;
      const weeks3 = Math.ceil(duration / 7);
      return itemsPerWeek * avgItemValue * weeks3;
      
    case 'habit-swap':
      // Assume average savings of $5 per day from swapped habits
      const dailySavings = 5;
      return dailySavings * duration;
      
    case 'automation':
      // Automatic savings of 3% of monthly income per month
      const autoSaveRate = 0.03;
      const months2 = Math.ceil(duration / 30);
      return Math.round(monthlyIncome * autoSaveRate * months2);
      
    default:
      // Default fallback calculation
      const dailyAmount = Math.max(2, Math.round(monthlyIncome * 0.001));
      return dailyAmount * duration;
  }
}

/**
 * Generate daily target amounts for the challenge
 * @param {Object} challengeInfo - Challenge type information
 * @param {number} totalAmount - Total challenge target amount
 * @param {number} duration - Challenge duration in days
 * @returns {Array} - Daily targets
 */
function generateDailyTargets(challengeInfo, totalAmount, duration) {
  const targets = [];
  const today = new Date();
  
  switch (challengeInfo.id) {
    case 'daily':
      // Even distribution every day
      const dailyAmount = Math.round(totalAmount / duration);
      for (let i = 0; i < duration; i++) {
        const targetDate = addDays(today, i);
        targets.push({
          day: i + 1,
          date: targetDate.toISOString(),
          amount: dailyAmount,
          completed: false
        });
      }
      break;
      
    case 'weekly':
      // Weekly distribution
      const weeklyAmount = Math.round(totalAmount / Math.ceil(duration / 7));
      for (let i = 0; i < duration; i++) {
        const targetDate = addDays(today, i);
        if (i % 7 === 0) {
          // Week day
          targets.push({
            day: i + 1,
            date: targetDate.toISOString(),
            amount: weeklyAmount,
            completed: false
          });
        } else {
          // Non-contribution day
          targets.push({
            day: i + 1,
            date: targetDate.toISOString(),
            amount: 0,
            completed: true
          });
        }
      }
      break;
      
    case 'incremental':
      // Increasing amounts each week
      const weeks = Math.ceil(duration / 7);
      const baseAmount = Math.round(totalAmount / ((weeks * (weeks + 1)) / 2));
      
      for (let i = 0; i < duration; i++) {
        const targetDate = addDays(today, i);
        const weekNum = Math.floor(i / 7);
        
        if (i % 7 === 0) {
          // Week day with increasing amount
          targets.push({
            day: i + 1,
            date: targetDate.toISOString(),
            amount: baseAmount * (weekNum + 1),
            completed: false
          });
        } else {
          // Non-contribution day
          targets.push({
            day: i + 1,
            date: targetDate.toISOString(),
            amount: 0,
            completed: true
          });
        }
      }
      break;
      
    case 'monthly':
      // Monthly distribution
      const monthlyAmount = Math.round(totalAmount / Math.ceil(duration / 30));
      for (let i = 0; i < duration; i++) {
        const targetDate = addDays(today, i);
        if (i % 30 === 0) {
          // Month day
          targets.push({
            day: i + 1,
            date: targetDate.toISOString(),
            amount: monthlyAmount,
            completed: false
          });
        } else {
          // Non-contribution day
          targets.push({
            day: i + 1,
            date: targetDate.toISOString(),
            amount: 0,
            completed: true
          });
        }
      }
      break;
      
    default:
      // Default to even daily distribution
      const defaultDailyAmount = Math.ceil(totalAmount / duration);
      for (let i = 0; i < duration; i++) {
        const targetDate = addDays(today, i);
        targets.push({
          day: i + 1,
          date: targetDate.toISOString(),
          amount: defaultDailyAmount,
          completed: false
        });
      }
  }
  
  return targets;
}

/**
 * Generate milestones for the challenge
 * @param {number} targetAmount - Total challenge target amount
 * @param {number} duration - Challenge duration in days
 * @returns {Array} - Milestones
 */
function generateMilestones(targetAmount, duration) {
  const milestones = [];
  
  // Create milestone percentages based on challenge size
  const percentages = duration <= 7 ? [33, 66, 100] : [25, 50, 75, 100];
  
  // Generate milestone for each percentage
  percentages.forEach((percentage, index) => {
    const amount = Math.round((targetAmount * percentage) / 100);
    
    // Select appropriate icon based on position
    let icon;
    if (percentage === 100) {
      icon = '🏆';
    } else if (percentage >= 75) {
      icon = '🌟';
    } else if (percentage >= 50) {
      icon = '⭐';
    } else {
      icon = '🔷';
    }
    
    milestones.push({
      id: `milestone-${index}`,
      name: `${percentage}% Complete`,
      description: `Reach ${percentage}% of your savings goal`,
      amount: amount,
      percentage: percentage,
      icon: icon,
      achieved: false,
      achievedDate: null
    });
  });
  
  return milestones;
}

/**
 * Update streak count based on contribution date
 * @param {Object} challenge - Challenge object
 * @param {string} contributionDate - ISO date string of contribution
 * @returns {number} - Updated streak count
 */
function updateStreak(challenge, contributionDate) {
  const lastDate = challenge.lastContributionDate ? new Date(challenge.lastContributionDate) : null;
  const currentDate = new Date(contributionDate);
  
  // If this is the first contribution, start streak at 1
  if (!lastDate) {
    return 1;
  }
  
  // Reset dates to midnight for comparison
  lastDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = Math.abs(currentDate - lastDate);
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  // Different day but consecutive (either 1 day apart or same day)
  if (diffDays <= 1 && currentDate >= lastDate) {
    // If same day, don't increment streak
    if (diffDays === 0) {
      return challenge.streakCount;
    }
    // If next day, increment streak
    return challenge.streakCount + 1;
  }
  
  // Not consecutive, reset to 1
  return 1;
}

/**
 * Generate tips for a specific challenge type
 * @param {string} challengeType - Type of challenge
 * @returns {Array} - Array of tips
 */
function generateTips(challengeType) {
  // Common tips for all challenges
  const commonTips = [
    "Set reminders on your phone for saving days",
    "Visualize your goal to stay motivated",
    "Share your challenge progress with a friend for accountability",
    "Keep a visible tracker where you'll see it daily"
  ];
  
  // Challenge-specific tips
  const specificTips = {
    'daily': [
      "Put the daily amount in a jar each morning",
      "Set up a separate '30-day challenge' digital envelope",
      "Try to save the amount first thing each day"
    ],
    'weekly': [
      "Schedule your savings transfer for the same day each week",
      "Consider saving the weekly amount from a single expense you cut",
      "Celebrate each weekly milestone with a free reward"
    ],
    'monthly': [
      "Schedule the transfer right after payday",
      "Look for one big expense to cut each month",
      "Break down the monthly goal into weekly targets"
    ],
    'round-up': [
      "Keep a log of all purchases and calculate round-ups daily",
      "Use an app that automatically tracks your round-ups",
      "Round to the nearest $5 for even faster progress"
    ],
    'no-spend': [
      "Identify trigger situations and plan alternatives",
      "Meal prep to avoid food spending",
      "Find free alternatives for entertainment"
    ],
    'saving-sprint': [
      "Clear your calendar of spending opportunities",
      "Temporarily pause subscriptions during the sprint",
      "Create daily mini-goals for maximum motivation"
    ],
    'incremental': [
      "Use a visual tracker that shows the increasing amounts",
      "Plan ahead for the larger contributions in later weeks",
      "Find ways to increase income as the amounts grow"
    ],
    'declutter': [
      "Start with higher-value items for immediate momentum",
      "Set aside 15 minutes daily to identify items to sell",
      "Use multiple selling platforms for best results"
    ],
    'habit-swap': [
      "Track both the money and time saved with each swap",
      "Find substitutes that still provide satisfaction",
      "Create a 'swap journal' to track your experience"
    ],
    'automation': [
      "Set up the automatic transfer and then 'forget' about it",
      "Start small and increase the amount once you adjust",
      "Split the automation into weekly smaller transfers"
    ]
  };
  
  // Select 2 common tips and 3 specific tips
  const selectedCommonTips = shuffle(commonTips).slice(0, 2);
  const selectedSpecificTips = specificTips[challengeType] 
    ? shuffle(specificTips[challengeType]).slice(0, 3) 
    : shuffle(specificTips['daily']).slice(0, 3);
  
  return [...selectedCommonTips, ...selectedSpecificTips];
}

/**
 * Shuffle array elements (Fisher-Yates algorithm)
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate rewards for completing a challenge
 * @param {number} targetAmount - Challenge target amount
 * @param {Object} challengeInfo - Challenge type information
 * @returns {Array} - Rewards
 */
function generateRewards(targetAmount, challengeInfo) {
  // Base points based on challenge difficulty
  let basePoints;
  switch (challengeInfo.difficulty) {
    case 'hard':
      basePoints = 200;
      break;
    case 'medium':
      basePoints = 150;
      break;
    case 'easy':
    default:
      basePoints = 100;
      break;
  }
  
  // Scale points based on target amount
  const scaleFactor = Math.log10(targetAmount) / 2;
  const totalPoints = Math.round(basePoints * scaleFactor);
  
  // Generate achievement badges
  return [
    {
      id: 'completion-badge',
      name: `${challengeInfo.name} Warrior`,
      description: `Completed the ${challengeInfo.name} challenge successfully`,
      type: 'badge',
      icon: '🏆'
    },
    {
      id: 'points-reward',
      name: 'Achievement Points',
      description: `Earned ${totalPoints} achievement points`,
      type: 'points',
      value: totalPoints,
      icon: '✨'
    },
    {
      id: 'savings-boost',
      name: 'Savings Boost',
      description: 'Boosted your savings rate by completing this challenge',
      type: 'stats',
      value: `+${Math.round(targetAmount / 10)}%`,
      icon: '📈'
    }
  ];
}

/**
 * Get challenge statistics for a user
 * @param {Array} challenges - User's challenges
 * @returns {Object} - Challenge statistics
 */
export function getChallengeStatistics(challenges) {
  if (!challenges || challenges.length === 0) {
    return {
      totalCompleted: 0,
      totalSaved: 0,
      completionRate: 0,
      averageSaved: 0,
      longestStreak: 0,
      currentStreak: 0,
      totalPoints: 0,
      badges: []
    };
  }
  
  const completedChallenges = challenges.filter(c => c.status === 'completed');
  const totalSaved = challenges.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
  const longestStreak = challenges.reduce((max, c) => Math.max(max, c.streakCount || 0), 0);
  
  // Find current active challenge with a streak
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const currentStreak = activeChallenges.length > 0 
    ? activeChallenges.reduce((max, c) => Math.max(max, c.streakCount || 0), 0) 
    : 0;
  
  // Calculate total points
  const totalPoints = challenges.reduce((sum, challenge) => {
    // Points for completion status
    let points = 0;
    if (challenge.status === 'completed') points += 100;
    if (challenge.status === 'partiallyCompleted') points += 50;
    
    // Add points for achievements within the challenge
    if (challenge.achievements) {
      points += challenge.achievements.reduce((ach, a) => ach + (a.bonusPoints || 0), 0);
    }
    
    return sum + points;
  }, 0);
  
  // Collect unique badges
  const badges = [];
  challenges.forEach(challenge => {
    if (challenge.achievements) {
      challenge.achievements.forEach(achievement => {
        if (!badges.some(b => b.id === achievement.id)) {
          badges.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            date: achievement.date
          });
        }
      });
    }
  });
  
  return {
    totalCompleted: completedChallenges.length,
    totalSaved: totalSaved,
    completionRate: challenges.length > 0 ? Math.round((completedChallenges.length / challenges.length) * 100) : 0,
    averageSaved: completedChallenges.length > 0 ? Math.round(totalSaved / completedChallenges.length) : 0,
    longestStreak: longestStreak,
    currentStreak: currentStreak,
    totalPoints: totalPoints,
    badges: badges.slice(0, 10) // Return top 10 badges
  };
}

/**
 * Generate personalized challenge recommendations
 * @param {Object} userData - User's financial data and past challenges
 * @returns {Array} - Recommended challenges
 */
export function getRecommendedChallenges(userData) {
  // Analyze past challenges
  const completedChallengeTypes = new Set(
    (userData.challenges || [])
      .filter(c => c.status === 'completed')
      .map(c => c.type)
  );
  
  // Filter challenge types that haven't been completed or are worth repeating
  const eligibleChallenges = Object.entries(CHALLENGE_TYPES)
    .filter(([type, info]) => {
      // If never completed, include it
      if (!completedChallengeTypes.has(type)) return true;
      
      // Some challenges are worth repeating regularly (daily, weekly, round-up)
      if (['daily', 'weekly', 'round-up'].includes(type)) return true;
      
      return false;
    })
    .map(([type, info]) => ({ type, info }));
  
  // Determine user's savings capacity
  const monthlyIncome = userData.monthlyIncome || 3000;
  const currentSavingsRate = userData.savingsRate || 10;
  
  // Recommend challenges based on user's financial situation
  const recommendations = [];
  
  // Add beginner-friendly challenge if user has completed few challenges
  if ((userData.challenges || []).length < 3) {
    const beginnerChallenge = eligibleChallenges.find(c => 
      c.info.difficulty === 'easy' || c.type === 'daily'
    );
    
    if (beginnerChallenge) {
      const theme = selectRandomTheme();
      recommendations.push({
        type: beginnerChallenge.type,
        name: `${beginnerChallenge.info.name}`,
        description: beginnerChallenge.info.description,
        duration: beginnerChallenge.info.duration.default,
        targetAmount: calculateTargetAmount(beginnerChallenge.info, userData, beginnerChallenge.info.duration.default),
        difficulty: beginnerChallenge.info.difficulty,
        theme: theme,
        reason: "Great for beginners to build a savings habit"
      });
    }
  }
  
  // For users with low savings rate, recommend habit-changing challenges
  if (currentSavingsRate < 15) {
    const habitChallenge = eligibleChallenges.find(c => 
      ['no-spend', 'habit-swap', 'automation'].includes(c.type)
    );
    
    if (habitChallenge) {
      const theme = selectRandomTheme();
      recommendations.push({
        type: habitChallenge.type,
        name: `${habitChallenge.info.name}`,
        description: habitChallenge.info.description,
        duration: habitChallenge.info.duration.default,
        targetAmount: calculateTargetAmount(habitChallenge.info, userData, habitChallenge.info.duration.default),
        difficulty: habitChallenge.info.difficulty,
        theme: theme,
        reason: "Help increase your savings rate with new habits"
      });
    }
  }
  
  // For users with some experience, recommend a more challenging option
  if ((userData.challenges || []).length >= 3) {
    const advancedChallenge = eligibleChallenges.find(c => 
      c.info.difficulty === 'medium' || c.info.difficulty === 'hard'
    );
    
    if (advancedChallenge) {
      const theme = selectRandomTheme();
      recommendations.push({
        type: advancedChallenge.type,
        name: `${advancedChallenge.info.name}`,
        description: advancedChallenge.info.description,
        duration: advancedChallenge.info.duration.default,
        targetAmount: calculateTargetAmount(advancedChallenge.info, userData, advancedChallenge.info.duration.default),
        difficulty: advancedChallenge.info.difficulty,
        theme: theme,
        reason: "Ready for a bigger challenge? This will push your savings further"
      });
    }
  }
  
  // Always include a short-term, quick-win challenge
  const quickChallenge = eligibleChallenges.find(c => 
    c.info.duration.default <= 14 && !recommendations.some(r => r.type === c.type)
  );
  
  if (quickChallenge) {
    const theme = selectRandomTheme();
    recommendations.push({
      type: quickChallenge.type,
      name: `${quickChallenge.info.name}`,
      description: quickChallenge.info.description,
      duration: quickChallenge.info.duration.default,
      targetAmount: calculateTargetAmount(quickChallenge.info, userData, quickChallenge.info.duration.default),
      difficulty: quickChallenge.info.difficulty,
      theme: theme,
      reason: "Quick win to boost your savings momentum"
    });
  }
  
  // If we don't have enough recommendations, add random ones until we do
  while (recommendations.length < 3 && eligibleChallenges.length > 0) {
    // Find a challenge type not already in recommendations
    const remainingChallenges = eligibleChallenges.filter(c => 
      !recommendations.some(r => r.type === c.type)
    );
    
    if (remainingChallenges.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * remainingChallenges.length);
    const randomChallenge = remainingChallenges[randomIndex];
    const theme = selectRandomTheme();
    
    recommendations.push({
      type: randomChallenge.type,
      name: `${randomChallenge.info.name}`,
      description: randomChallenge.info.description,
      duration: randomChallenge.info.duration.default,
      targetAmount: calculateTargetAmount(randomChallenge.info, userData, randomChallenge.info.duration.default),
      difficulty: randomChallenge.info.difficulty,
      theme: theme,
      reason: "This challenge matches your financial profile"
    });
  }
  
  return recommendations;
}