/**
 * Financial Wellness Scorecard Module
 * Provides users with personalized financial health assessment and recommendations
 */

// Constants for score calculation
const SCORE_CATEGORIES = {
  INCOME_MANAGEMENT: { id: 'income', name: 'Income Management', maxScore: 20 },
  SAVINGS_RATE: { id: 'savings', name: 'Savings Rate', maxScore: 20 },
  DEBT_MANAGEMENT: { id: 'debt', name: 'Debt Management', maxScore: 20 },
  EMERGENCY_FUND: { id: 'emergency', name: 'Emergency Fund', maxScore: 15 },
  INVESTMENT_STRATEGY: { id: 'investments', name: 'Investment Growth', maxScore: 15 },
  FINANCIAL_GOALS: { id: 'goals', name: 'Goal Progress', maxScore: 10 }
};

// Score ranges and their corresponding status
const SCORE_RANGES = [
  { min: 0, max: 40, status: 'At Risk', color: '#e53e3e', description: 'Your financial wellness needs immediate attention. Focus on building a strong foundation.' },
  { min: 41, max: 60, status: 'Improving', color: '#f6ad55', description: 'You\'re on the right track, but there\'s room for improvement in key areas.' },
  { min: 61, max: 80, status: 'Stable', color: '#4299e1', description: 'Your finances are stable. Focus on optimization and growth strategies.' },
  { min: 81, max: 100, status: 'Excellent', color: '#48bb78', description: 'Excellent financial wellness! Continue your current strategies and consider wealth building.' }
];

/**
 * Calculate the wellness score based on user financial data
 * @param {Object} userData - User financial data
 * @returns {Object} Calculated score and breakdown
 */
function calculateWellnessScore(userData) {
  // Default values if any data is missing
  const {
    incomeData = { sources: [], allocation: {} },
    savingsData = { rate: 0, totalSavings: 0 },
    debtData = { totalDebt: 0, monthlyPayments: 0, monthlyIncome: 1 },
    emergencyFund = { months: 0 },
    investmentData = { growthRate: 0, diversification: 0 },
    goals = []
  } = userData;

  // Calculate individual category scores
  const incomeScore = calculateIncomeScore(incomeData);
  const savingsScore = calculateSavingsScore(savingsData);
  const debtScore = calculateDebtScore(debtData);
  const emergencyScore = calculateEmergencyScore(emergencyFund);
  const investmentScore = calculateInvestmentScore(investmentData);
  const goalsScore = calculateGoalsScore(goals);

  // Calculate total score (out of 100)
  const scores = {
    [SCORE_CATEGORIES.INCOME_MANAGEMENT.id]: {
      score: incomeScore,
      maxScore: SCORE_CATEGORIES.INCOME_MANAGEMENT.maxScore,
      name: SCORE_CATEGORIES.INCOME_MANAGEMENT.name,
      percentage: (incomeScore / SCORE_CATEGORIES.INCOME_MANAGEMENT.maxScore) * 100
    },
    [SCORE_CATEGORIES.SAVINGS_RATE.id]: {
      score: savingsScore,
      maxScore: SCORE_CATEGORIES.SAVINGS_RATE.maxScore,
      name: SCORE_CATEGORIES.SAVINGS_RATE.name,
      percentage: (savingsScore / SCORE_CATEGORIES.SAVINGS_RATE.maxScore) * 100
    },
    [SCORE_CATEGORIES.DEBT_MANAGEMENT.id]: {
      score: debtScore,
      maxScore: SCORE_CATEGORIES.DEBT_MANAGEMENT.maxScore,
      name: SCORE_CATEGORIES.DEBT_MANAGEMENT.name,
      percentage: (debtScore / SCORE_CATEGORIES.DEBT_MANAGEMENT.maxScore) * 100
    },
    [SCORE_CATEGORIES.EMERGENCY_FUND.id]: {
      score: emergencyScore,
      maxScore: SCORE_CATEGORIES.EMERGENCY_FUND.maxScore,
      name: SCORE_CATEGORIES.EMERGENCY_FUND.name,
      percentage: (emergencyScore / SCORE_CATEGORIES.EMERGENCY_FUND.maxScore) * 100
    },
    [SCORE_CATEGORIES.INVESTMENT_STRATEGY.id]: {
      score: investmentScore,
      maxScore: SCORE_CATEGORIES.INVESTMENT_STRATEGY.maxScore,
      name: SCORE_CATEGORIES.INVESTMENT_STRATEGY.name,
      percentage: (investmentScore / SCORE_CATEGORIES.INVESTMENT_STRATEGY.maxScore) * 100
    },
    [SCORE_CATEGORIES.FINANCIAL_GOALS.id]: {
      score: goalsScore,
      maxScore: SCORE_CATEGORIES.FINANCIAL_GOALS.maxScore,
      name: SCORE_CATEGORIES.FINANCIAL_GOALS.name,
      percentage: (goalsScore / SCORE_CATEGORIES.FINANCIAL_GOALS.maxScore) * 100
    }
  };

  const totalScore = Math.round(
    Object.values(scores).reduce((sum, category) => sum + category.score, 0)
  );

  // Determine status based on score range
  const statusRange = SCORE_RANGES.find(range => 
    totalScore >= range.min && totalScore <= range.max
  );

  return {
    totalScore,
    status: statusRange.status,
    color: statusRange.color,
    description: statusRange.description,
    categoryScores: scores,
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculate income management score (max 20 points)
 * @param {Object} incomeData - User's income data
 * @returns {number} - Score for income management
 */
function calculateIncomeScore(incomeData) {
  let score = 0;
  const { sources = [], allocation = {} } = incomeData;
  
  // Multiple income sources (up to 5 points)
  score += Math.min(sources.length * 2, 5);
  
  // Income allocation adherence to 40/30/30 or custom split (up to 10 points)
  const hasAllocation = allocation.needs && allocation.savings && allocation.investments;
  
  if (hasAllocation) {
    // Check if user is sticking to their allocation targets
    const allocTarget = { 
      needs: allocation.needsTarget || 40, 
      savings: allocation.savingsTarget || 30,
      investments: allocation.investmentsTarget || 30 
    };
    
    // Calculate deviation from targets (lower is better)
    const needsDev = Math.abs(allocation.needs - allocTarget.needs);
    const savingsDev = Math.abs(allocation.savings - allocTarget.savings);
    const investmentsDev = Math.abs(allocation.investments - allocTarget.investments);
    
    // Average deviation from target (0-100 scale)
    const avgDeviation = (needsDev + savingsDev + investmentsDev) / 3;
    
    // Convert to score (lower deviation = higher score)
    const deviationScore = Math.max(0, 10 - (avgDeviation / 2));
    score += Math.round(deviationScore);
  }
  
  // Income stability (up to 5 points)
  if (incomeData.monthsWithIncome) {
    // The more months with consistent income, the better (up to 12 months)
    score += Math.min(Math.floor(incomeData.monthsWithIncome / 2.4), 5);
  }
  
  return Math.min(score, SCORE_CATEGORIES.INCOME_MANAGEMENT.maxScore);
}

/**
 * Calculate savings rate score (max 20 points)
 * @param {Object} savingsData - User's savings data
 * @returns {number} - Score for savings rate
 */
function calculateSavingsScore(savingsData) {
  let score = 0;
  const { rate = 0, totalSavings = 0, monthlyIncome = 0 } = savingsData;
  
  // Savings rate (up to 15 points)
  // 15% or higher is considered excellent
  if (rate >= 15) {
    score += 15;
  } else if (rate >= 10) {
    score += 10;
  } else if (rate >= 5) {
    score += 5;
  } else if (rate > 0) {
    score += 2;
  }
  
  // Total savings relative to monthly income (up to 5 points)
  if (monthlyIncome > 0 && totalSavings > 0) {
    // Calculate months of income saved
    const monthsOfIncomeSaved = totalSavings / monthlyIncome;
    
    if (monthsOfIncomeSaved >= 6) {
      score += 5;
    } else if (monthsOfIncomeSaved >= 3) {
      score += 3;
    } else if (monthsOfIncomeSaved >= 1) {
      score += 1;
    }
  }
  
  return Math.min(score, SCORE_CATEGORIES.SAVINGS_RATE.maxScore);
}

/**
 * Calculate debt management score (max 20 points)
 * @param {Object} debtData - User's debt data
 * @returns {number} - Score for debt management
 */
function calculateDebtScore(debtData) {
  let score = 0;
  const { 
    totalDebt = 0, 
    monthlyPayments = 0, 
    monthlyIncome = 1,
    debtTypes = [] 
  } = debtData;
  
  // Debt-to-income ratio (up to 15 points)
  const dti = monthlyPayments / monthlyIncome;
  
  if (dti <= 0.1) { // Excellent: 10% or less
    score += 15;
  } else if (dti <= 0.2) { // Good: 20% or less
    score += 12;
  } else if (dti <= 0.3) { // Acceptable: 30% or less
    score += 8;
  } else if (dti <= 0.4) { // Concerning: 40% or less
    score += 4;
  } else if (dti <= 0.5) { // Problematic: 50% or less
    score += 2;
  }
  
  // Debt composition (up to 5 points)
  // Good debt (mortgage, student loans, business) vs. Bad debt (credit cards, consumer)
  if (debtTypes.length > 0) {
    const goodDebtRatio = debtTypes.filter(debt => 
      ['mortgage', 'student', 'business'].includes(debt.type)
    ).reduce((sum, debt) => sum + debt.amount, 0) / totalDebt;
    
    if (goodDebtRatio >= 0.8) {
      score += 5;
    } else if (goodDebtRatio >= 0.6) {
      score += 3;
    } else if (goodDebtRatio >= 0.4) {
      score += 1;
    }
  } else if (totalDebt === 0) {
    // No debt at all is ideal
    score += 5;
  }
  
  return Math.min(score, SCORE_CATEGORIES.DEBT_MANAGEMENT.maxScore);
}

/**
 * Calculate emergency fund score (max 15 points)
 * @param {Object} emergencyData - User's emergency fund data
 * @returns {number} - Score for emergency fund
 */
function calculateEmergencyScore(emergencyData) {
  let score = 0;
  const { months = 0 } = emergencyData;
  
  // Recommended: 3-6 months of expenses in emergency fund
  if (months >= 6) {
    score += 15; // Excellent
  } else if (months >= 3) {
    score += 10; // Good
  } else if (months >= 1) {
    score += 5; // Getting started
  } else if (months > 0) {
    score += 2; // At least something
  }
  
  return Math.min(score, SCORE_CATEGORIES.EMERGENCY_FUND.maxScore);
}

/**
 * Calculate investment strategy score (max 15 points)
 * @param {Object} investmentData - User's investment data
 * @returns {number} - Score for investment strategy
 */
function calculateInvestmentScore(investmentData) {
  let score = 0;
  const { 
    growthRate = 0, 
    diversification = 0, 
    monthlyContributions = 0,
    totalInvestments = 0
  } = investmentData;
  
  // Investment growth rate (up to 5 points)
  if (growthRate >= 8) {
    score += 5; // Excellent
  } else if (growthRate >= 6) {
    score += 4; // Very good
  } else if (growthRate >= 4) {
    score += 3; // Good
  } else if (growthRate >= 2) {
    score += 2; // Fair
  } else if (growthRate > 0) {
    score += 1; // At least positive
  }
  
  // Portfolio diversification (up to 5 points)
  // diversification score is expected to be 0-10
  score += Math.min(Math.floor(diversification / 2), 5);
  
  // Regular contributions (up to 5 points)
  if (monthlyContributions > 0 && totalInvestments > 0) {
    // Calculate contribution as percentage of total portfolio
    const contributionRate = (monthlyContributions * 12 / totalInvestments) * 100;
    
    if (contributionRate >= 15) {
      score += 5; // Excellent growth rate
    } else if (contributionRate >= 10) {
      score += 4; // Very good
    } else if (contributionRate >= 5) {
      score += 3; // Good
    } else if (contributionRate >= 2) {
      score += 2; // Fair
    } else {
      score += 1; // At least contributing
    }
  }
  
  return Math.min(score, SCORE_CATEGORIES.INVESTMENT_STRATEGY.maxScore);
}

/**
 * Calculate financial goals score (max 10 points)
 * @param {Array} goals - User's financial goals
 * @returns {number} - Score for financial goals
 */
function calculateGoalsScore(goals) {
  let score = 0;
  
  if (!goals || goals.length === 0) {
    return score;
  }
  
  // Number of active goals (up to 3 points)
  score += Math.min(goals.length, 3);
  
  // Goals with progress (up to 5 points)
  const goalsWithProgress = goals.filter(goal => goal.progress > 0);
  score += Math.min(goalsWithProgress.length * 1.5, 5);
  
  // Goals with dates and plans (up to 2 points)
  const goalsWithPlans = goals.filter(goal => 
    goal.targetDate && goal.plan && goal.plan.length > 0
  );
  score += Math.min(goalsWithPlans.length, 2);
  
  return Math.min(score, SCORE_CATEGORIES.FINANCIAL_GOALS.maxScore);
}

/**
 * Generate personalized recommendations based on financial scorecard
 * @param {Object} scoreData - User's financial wellness score data
 * @returns {Object} - Recommendations for improvement
 */
function generateRecommendations(scoreData) {
  const recommendations = [];
  const scores = scoreData.categoryScores;
  
  // Income Management recommendations
  if (scores.income.percentage < 70) {
    if (scores.income.percentage < 40) {
      recommendations.push({
        category: 'income',
        priority: 'high',
        title: 'Diversify Your Income',
        description: 'Your income sources need attention. Explore side gigs, freelance work, or passive income options to reduce financial vulnerability.',
        actions: [
          'Identify 1-2 potential secondary income sources based on your skills',
          'Allocate 3-5 hours weekly to developing a side income',
          'Consider Stackr Gigs for immediate service opportunities'
        ]
      });
    } else {
      recommendations.push({
        category: 'income',
        priority: 'medium',
        title: 'Optimize Income Allocation',
        description: 'Improve how you distribute your income between needs, savings, and investments to achieve your financial targets.',
        actions: [
          'Review your current 40/30/30 split and adjust if needed',
          'Set up automatic transfers on payday to ensure proper allocation',
          'Track allocation monthly to identify improvement areas'
        ]
      });
    }
  }
  
  // Savings Rate recommendations
  if (scores.savings.percentage < 70) {
    if (scores.savings.percentage < 40) {
      recommendations.push({
        category: 'savings',
        priority: 'high',
        title: 'Boost Your Savings Rate',
        description: 'Your savings rate needs significant improvement. Aim to save at least 10% of your income.',
        actions: [
          'Identify 3 non-essential expenses you can reduce immediately',
          'Set up an automatic savings transfer on payday',
          'Challenge yourself to a 30-day no-spend challenge in one category'
        ]
      });
    } else {
      recommendations.push({
        category: 'savings',
        priority: 'medium',
        title: 'Optimize Your Savings Strategy',
        description: 'You\'re saving, but could improve your rate and strategy to build financial security faster.',
        actions: [
          'Increase your savings rate by 2% this month',
          'Research high-yield savings accounts to maximize returns',
          'Set specific savings goals with timelines'
        ]
      });
    }
  }
  
  // Debt Management recommendations
  if (scores.debt.percentage < 70) {
    if (scores.debt.percentage < 40) {
      recommendations.push({
        category: 'debt',
        priority: 'high',
        title: 'Reduce Debt Burden',
        description: 'Your debt levels are concerning and need immediate attention to avoid financial stress.',
        actions: [
          'List all debts with interest rates, focusing on highest-rate first',
          'Contact creditors to negotiate lower interest rates',
          'Cut non-essential spending to increase debt payments',
          'Consider consolidating high-interest debt'
        ]
      });
    } else {
      recommendations.push({
        category: 'debt',
        priority: 'medium',
        title: 'Optimize Debt Strategy',
        description: 'Your debt is manageable but could be structured better to reduce interest costs.',
        actions: [
          'Prioritize paying off high-interest debt first',
          'Consider refinancing options for lower interest rates',
          'Increase monthly payments on smallest debts to eliminate them faster'
        ]
      });
    }
  }
  
  // Emergency Fund recommendations
  if (scores.emergency.percentage < 70) {
    if (scores.emergency.percentage < 40) {
      recommendations.push({
        category: 'emergency',
        priority: 'high',
        title: 'Build Your Emergency Fund',
        description: 'Your emergency fund is critically low. Aim to build at least 3 months of expenses.',
        actions: [
          'Open a separate savings account specifically for emergencies',
          'Start with a goal of saving 1 month of expenses',
          'Set up an automatic weekly transfer, even if it\'s small',
          'Sell unused items to jumpstart your emergency fund'
        ]
      });
    } else {
      recommendations.push({
        category: 'emergency',
        priority: 'medium',
        title: 'Strengthen Your Safety Net',
        description: 'Your emergency fund is a good start but needs strengthening to provide adequate security.',
        actions: [
          'Increase emergency fund to cover 6 months of expenses',
          'Store your emergency fund in an accessible but interest-bearing account',
          'Review and update what constitutes a true emergency'
        ]
      });
    }
  }
  
  // Investment Strategy recommendations
  if (scores.investments.percentage < 70) {
    if (scores.investments.percentage < 40) {
      recommendations.push({
        category: 'investments',
        priority: 'medium',
        title: 'Start Investing Regularly',
        description: 'Your investment strategy needs foundation work to build long-term wealth.',
        actions: [
          'Start with small, regular contributions to a diversified fund',
          'Learn investment basics through Stackr\'s educational resources',
          'Set up automatic monthly investments, even if they\'re small',
          'Consider consulting with a financial advisor'
        ]
      });
    } else {
      recommendations.push({
        category: 'investments',
        priority: 'low',
        title: 'Optimize Your Investment Mix',
        description: 'Fine-tune your investment strategy to improve returns and diversification.',
        actions: [
          'Review your asset allocation for proper diversification',
          'Consider increasing your monthly contribution rate',
          'Evaluate fees and expenses in your current investments'
        ]
      });
    }
  }
  
  // Financial Goals recommendations
  if (scores.goals.percentage < 70) {
    recommendations.push({
      category: 'goals',
      priority: 'medium',
      title: 'Define Clear Financial Goals',
      description: 'Setting specific, measurable goals will improve your financial direction and motivation.',
      actions: [
        'Set 2-3 specific financial goals with deadlines',
        'Break each goal down into monthly milestones',
        'Track progress weekly to stay motivated',
        'Celebrate small victories along the way'
      ]
    });
  }
  
  // If doing well overall, give enhancement recommendations
  if (scoreData.totalScore >= 80) {
    recommendations.push({
      category: 'overall',
      priority: 'low',
      title: 'Take Your Finances to the Next Level',
      description: 'You\'re doing great! Consider these optimizations to further enhance your financial wellness.',
      actions: [
        'Explore tax optimization strategies',
        'Consider meeting with a financial planner for advanced strategies',
        'Review insurance coverage to ensure adequate protection',
        'Start planning for wealth transfer or charitable giving'
      ]
    });
  }
  
  return {
    summary: `We've identified ${recommendations.length} key area${recommendations.length !== 1 ? 's' : ''} for improvement in your financial wellness.`,
    priorityFocus: recommendations.filter(r => r.priority === 'high')[0]?.title || 
                  recommendations[0]?.title || 
                  'Maintain your excellent financial habits',
    recommendations: recommendations
  };
}

/**
 * Create chart data for visualization
 * @param {Object} scoreData - User's financial wellness score data
 * @returns {Object} - Data formatted for charts
 */
function createChartData(scoreData) {
  const categoryScores = scoreData.categoryScores;
  
  // Bar chart data
  const barChartData = {
    labels: Object.values(categoryScores).map(cat => cat.name),
    datasets: [{
      label: 'Your Score',
      data: Object.values(categoryScores).map(cat => cat.score),
      backgroundColor: Object.values(categoryScores).map(cat => 
        cat.percentage >= 80 ? '#48bb78' : // Green
        cat.percentage >= 60 ? '#4299e1' : // Blue
        cat.percentage >= 40 ? '#f6ad55' : // Orange
        '#e53e3e' // Red
      ),
      maxValues: Object.values(categoryScores).map(cat => cat.maxScore)
    }]
  };
  
  // Radar chart data
  const radarChartData = {
    labels: Object.values(categoryScores).map(cat => cat.name),
    datasets: [{
      label: 'Your Profile',
      data: Object.values(categoryScores).map(cat => cat.percentage),
      borderColor: scoreData.color,
      backgroundColor: scoreData.color + '33' // Add transparency
    }]
  };
  
  // Timeline data if available
  const timelineData = {
    available: false,
    data: null
  };
  
  return {
    barChart: barChartData,
    radarChart: radarChartData,
    timeline: timelineData,
    gaugeValue: scoreData.totalScore
  };
}

/**
 * Render the financial wellness scorecard UI
 * @param {Object} userData - User's financial data
 * @param {string} containerId - DOM container ID to render the scorecard
 * @returns {HTMLElement} - The rendered scorecard element
 */
export function renderWellnessScorecard(userData, containerId) {
  // Get container element - with fallback mechanism
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID '${containerId}' not found, creating fallback container`);
    // Instead of failing, create a container with the expected ID
    const fallbackContainer = document.createElement('div');
    fallbackContainer.id = containerId;
    document.body.appendChild(fallbackContainer);
    return renderWellnessScorecard(userData, containerId); // Retry with the new container
  }
  
  // Calculate score
  const scoreData = calculateWellnessScore(userData);
  
  // Generate recommendations
  const recommendations = generateRecommendations(scoreData);
  
  // Prepare chart data
  const chartData = createChartData(scoreData);
  
  // Clear the container
  container.innerHTML = '';
  
  // Create the scorecard UI
  const scorecard = document.createElement('div');
  scorecard.className = 'wellness-scorecard';
  scorecard.style.fontFamily = 'Inter, system-ui, sans-serif';
  scorecard.style.color = '#333';
  scorecard.style.maxWidth = '100%';
  scorecard.style.margin = '0 auto';
  scorecard.style.padding = '1rem';
  scorecard.style.borderRadius = '12px';
  scorecard.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
  scorecard.style.background = 'white';
  
  // Get viewport width for responsive layout
  const width = window.innerWidth;
  const isMobile = width < 768;
  const isSmallMobile = width < 500;
  
  // Create header with score
  const header = document.createElement('div');
  header.className = 'scorecard-header';
  header.style.display = 'flex';
  header.style.flexDirection = isMobile ? 'column' : 'row';
  header.style.alignItems = isMobile ? 'center' : 'flex-start';
  header.style.justifyContent = 'space-between';
  header.style.marginBottom = '2rem';
  header.style.gap = '1rem';
  header.style.textAlign = isMobile ? 'center' : 'left';
  
  // Title and description
  const titleSection = document.createElement('div');
  
  const title = document.createElement('h2');
  title.textContent = 'Your Financial Wellness Score';
  title.style.fontSize = isSmallMobile ? '1.5rem' : '1.75rem';
  title.style.marginBottom = '0.5rem';
  title.style.fontWeight = '700';
  
  const lastUpdated = document.createElement('p');
  lastUpdated.textContent = `Last updated: ${new Date(scoreData.timestamp).toLocaleDateString()}`;
  lastUpdated.style.color = '#666';
  lastUpdated.style.fontSize = '0.875rem';
  lastUpdated.style.margin = '0 0 1rem 0';
  
  const description = document.createElement('p');
  description.textContent = scoreData.description;
  description.style.fontSize = '1rem';
  description.style.maxWidth = '600px';
  
  titleSection.appendChild(title);
  titleSection.appendChild(lastUpdated);
  titleSection.appendChild(description);
  
  // Score circle
  const scoreCircle = document.createElement('div');
  scoreCircle.className = 'score-circle';
  scoreCircle.style.display = 'flex';
  scoreCircle.style.flexDirection = 'column';
  scoreCircle.style.alignItems = 'center';
  scoreCircle.style.justifyContent = 'center';
  scoreCircle.style.width = isSmallMobile ? '140px' : '160px';
  scoreCircle.style.height = isSmallMobile ? '140px' : '160px';
  scoreCircle.style.borderRadius = '50%';
  scoreCircle.style.background = `conic-gradient(${scoreData.color} 0% ${scoreData.totalScore}%, #edf2f7 ${scoreData.totalScore}% 100%)`;
  scoreCircle.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  scoreCircle.style.marginTop = isMobile ? '1rem' : '0';
  
  const innerCircle = document.createElement('div');
  innerCircle.style.display = 'flex';
  innerCircle.style.flexDirection = 'column';
  innerCircle.style.alignItems = 'center';
  innerCircle.style.justifyContent = 'center';
  innerCircle.style.width = isSmallMobile ? '120px' : '140px';
  innerCircle.style.height = isSmallMobile ? '120px' : '140px';
  innerCircle.style.borderRadius = '50%';
  innerCircle.style.background = 'white';
  
  const scoreNumber = document.createElement('div');
  scoreNumber.className = 'score-number';
  scoreNumber.textContent = scoreData.totalScore;
  scoreNumber.style.fontSize = isSmallMobile ? '2.5rem' : '3rem';
  scoreNumber.style.fontWeight = '700';
  scoreNumber.style.color = scoreData.color;
  
  const scoreLabel = document.createElement('div');
  scoreLabel.className = 'score-label';
  scoreLabel.textContent = scoreData.status;
  scoreLabel.style.fontSize = isSmallMobile ? '1rem' : '1.125rem';
  scoreLabel.style.fontWeight = '600';
  
  innerCircle.appendChild(scoreNumber);
  innerCircle.appendChild(scoreLabel);
  scoreCircle.appendChild(innerCircle);
  
  header.appendChild(titleSection);
  header.appendChild(scoreCircle);
  
  // Create score breakdown section
  const breakdownSection = document.createElement('div');
  breakdownSection.className = 'score-breakdown';
  breakdownSection.style.marginBottom = '2rem';
  
  const breakdownTitle = document.createElement('h3');
  breakdownTitle.textContent = 'Score Breakdown';
  breakdownTitle.style.fontSize = '1.25rem';
  breakdownTitle.style.marginBottom = '1rem';
  breakdownTitle.style.fontWeight = '600';
  
  const categories = document.createElement('div');
  categories.className = 'score-categories';
  categories.style.display = 'grid';
  categories.style.gridTemplateColumns = isMobile ? '1fr' : isSmallMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))';
  categories.style.gap = '1rem';
  
  Object.values(scoreData.categoryScores).forEach(category => {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.style.padding = '1rem';
    categoryItem.style.borderRadius = '8px';
    categoryItem.style.border = '1px solid #e2e8f0';
    categoryItem.style.background = '#f8fafc';
    
    const categoryHeader = document.createElement('div');
    categoryHeader.style.display = 'flex';
    categoryHeader.style.justifyContent = 'space-between';
    categoryHeader.style.alignItems = 'center';
    categoryHeader.style.marginBottom = '0.5rem';
    
    const categoryName = document.createElement('div');
    categoryName.className = 'category-name';
    categoryName.textContent = category.name;
    categoryName.style.fontWeight = '500';
    
    const categoryScore = document.createElement('div');
    categoryScore.className = 'category-score';
    categoryScore.textContent = `${category.score}/${category.maxScore}`;
    categoryScore.style.fontWeight = '600';
    
    // Color based on percentage
    let barColor;
    if (category.percentage >= 80) {
      barColor = '#48bb78'; // Green
    } else if (category.percentage >= 60) {
      barColor = '#4299e1'; // Blue
    } else if (category.percentage >= 40) {
      barColor = '#f6ad55'; // Orange
    } else {
      barColor = '#e53e3e'; // Red
    }
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.height = '8px';
    progressBar.style.width = '100%';
    progressBar.style.background = '#edf2f7';
    progressBar.style.borderRadius = '4px';
    progressBar.style.overflow = 'hidden';
    
    const progress = document.createElement('div');
    progress.style.height = '100%';
    progress.style.width = `${category.percentage}%`;
    progress.style.background = barColor;
    
    categoryHeader.appendChild(categoryName);
    categoryHeader.appendChild(categoryScore);
    
    progressBar.appendChild(progress);
    
    categoryItem.appendChild(categoryHeader);
    categoryItem.appendChild(progressBar);
    
    categories.appendChild(categoryItem);
  });
  
  breakdownSection.appendChild(breakdownTitle);
  breakdownSection.appendChild(categories);
  
  // Recommendations section
  const recommendationsSection = document.createElement('div');
  recommendationsSection.className = 'recommendations-section';
  
  const recommendationsTitle = document.createElement('h3');
  recommendationsTitle.textContent = 'Personalized Recommendations';
  recommendationsTitle.style.fontSize = '1.25rem';
  recommendationsTitle.style.marginBottom = '1rem';
  recommendationsTitle.style.fontWeight = '600';
  
  const recommendationsSummary = document.createElement('p');
  recommendationsSummary.textContent = recommendations.summary;
  recommendationsSummary.style.marginBottom = '1.5rem';
  
  const recommendationsList = document.createElement('div');
  recommendationsList.className = 'recommendations-list';
  recommendationsList.style.display = 'flex';
  recommendationsList.style.flexDirection = 'column';
  recommendationsList.style.gap = '1rem';
  
  // Show at most 3 recommendations initially
  const topRecommendations = recommendations.recommendations.slice(0, 3);
  
  topRecommendations.forEach(recommendation => {
    const recommendationItem = document.createElement('div');
    recommendationItem.className = 'recommendation-item';
    recommendationItem.style.padding = '1.25rem';
    recommendationItem.style.borderRadius = '8px';
    recommendationItem.style.border = '1px solid #e2e8f0';
    recommendationItem.style.background = 'white';
    
    // Border color based on priority
    if (recommendation.priority === 'high') {
      recommendationItem.style.borderLeft = '4px solid #e53e3e';
    } else if (recommendation.priority === 'medium') {
      recommendationItem.style.borderLeft = '4px solid #f6ad55';
    } else {
      recommendationItem.style.borderLeft = '4px solid #4299e1';
    }
    
    const recommendationPriority = document.createElement('div');
    recommendationPriority.className = 'recommendation-priority';
    recommendationPriority.textContent = recommendation.priority.toUpperCase();
    recommendationPriority.style.fontSize = '0.75rem';
    recommendationPriority.style.fontWeight = '700';
    recommendationPriority.style.textTransform = 'uppercase';
    recommendationPriority.style.letterSpacing = '0.05em';
    recommendationPriority.style.marginBottom = '0.5rem';
    
    // Priority color
    if (recommendation.priority === 'high') {
      recommendationPriority.style.color = '#e53e3e';
    } else if (recommendation.priority === 'medium') {
      recommendationPriority.style.color = '#f6ad55';
    } else {
      recommendationPriority.style.color = '#4299e1';
    }
    
    const recommendationTitle = document.createElement('h4');
    recommendationTitle.className = 'recommendation-title';
    recommendationTitle.textContent = recommendation.title;
    recommendationTitle.style.fontSize = '1.125rem';
    recommendationTitle.style.fontWeight = '600';
    recommendationTitle.style.marginBottom = '0.5rem';
    
    const recommendationDescription = document.createElement('p');
    recommendationDescription.className = 'recommendation-description';
    recommendationDescription.textContent = recommendation.description;
    recommendationDescription.style.marginBottom = '1rem';
    
    const actionsList = document.createElement('ul');
    actionsList.className = 'actions-list';
    actionsList.style.paddingLeft = '1.5rem';
    actionsList.style.marginBottom = '0.5rem';
    
    recommendation.actions.forEach(action => {
      const actionItem = document.createElement('li');
      actionItem.textContent = action;
      actionItem.style.marginBottom = '0.375rem';
      actionsList.appendChild(actionItem);
    });
    
    recommendationItem.appendChild(recommendationPriority);
    recommendationItem.appendChild(recommendationTitle);
    recommendationItem.appendChild(recommendationDescription);
    recommendationItem.appendChild(actionsList);
    
    recommendationsList.appendChild(recommendationItem);
  });
  
  // Show more button if there are more than 3 recommendations
  if (recommendations.recommendations.length > 3) {
    const showMoreBtn = document.createElement('button');
    showMoreBtn.className = 'show-more-btn';
    showMoreBtn.textContent = 'Show More Recommendations';
    showMoreBtn.style.alignSelf = 'center';
    showMoreBtn.style.padding = '0.75rem 1.5rem';
    showMoreBtn.style.borderRadius = '6px';
    showMoreBtn.style.border = 'none';
    showMoreBtn.style.background = '#4299e1';
    showMoreBtn.style.color = 'white';
    showMoreBtn.style.fontWeight = '600';
    showMoreBtn.style.cursor = 'pointer';
    showMoreBtn.style.marginTop = '1rem';
    
    showMoreBtn.addEventListener('click', () => {
      // Clear current list and show all recommendations
      recommendationsList.innerHTML = '';
      
      recommendations.recommendations.forEach(recommendation => {
        const recommendationItem = document.createElement('div');
        recommendationItem.className = 'recommendation-item';
        recommendationItem.style.padding = '1.25rem';
        recommendationItem.style.borderRadius = '8px';
        recommendationItem.style.border = '1px solid #e2e8f0';
        recommendationItem.style.background = 'white';
        
        // Border color based on priority
        if (recommendation.priority === 'high') {
          recommendationItem.style.borderLeft = '4px solid #e53e3e';
        } else if (recommendation.priority === 'medium') {
          recommendationItem.style.borderLeft = '4px solid #f6ad55';
        } else {
          recommendationItem.style.borderLeft = '4px solid #4299e1';
        }
        
        const recommendationPriority = document.createElement('div');
        recommendationPriority.className = 'recommendation-priority';
        recommendationPriority.textContent = recommendation.priority.toUpperCase();
        recommendationPriority.style.fontSize = '0.75rem';
        recommendationPriority.style.fontWeight = '700';
        recommendationPriority.style.textTransform = 'uppercase';
        recommendationPriority.style.letterSpacing = '0.05em';
        recommendationPriority.style.marginBottom = '0.5rem';
        
        // Priority color
        if (recommendation.priority === 'high') {
          recommendationPriority.style.color = '#e53e3e';
        } else if (recommendation.priority === 'medium') {
          recommendationPriority.style.color = '#f6ad55';
        } else {
          recommendationPriority.style.color = '#4299e1';
        }
        
        const recommendationTitle = document.createElement('h4');
        recommendationTitle.className = 'recommendation-title';
        recommendationTitle.textContent = recommendation.title;
        recommendationTitle.style.fontSize = '1.125rem';
        recommendationTitle.style.fontWeight = '600';
        recommendationTitle.style.marginBottom = '0.5rem';
        
        const recommendationDescription = document.createElement('p');
        recommendationDescription.className = 'recommendation-description';
        recommendationDescription.textContent = recommendation.description;
        recommendationDescription.style.marginBottom = '1rem';
        
        const actionsList = document.createElement('ul');
        actionsList.className = 'actions-list';
        actionsList.style.paddingLeft = '1.5rem';
        actionsList.style.marginBottom = '0.5rem';
        
        recommendation.actions.forEach(action => {
          const actionItem = document.createElement('li');
          actionItem.textContent = action;
          actionItem.style.marginBottom = '0.375rem';
          actionsList.appendChild(actionItem);
        });
        
        recommendationItem.appendChild(recommendationPriority);
        recommendationItem.appendChild(recommendationTitle);
        recommendationItem.appendChild(recommendationDescription);
        recommendationItem.appendChild(actionsList);
        
        recommendationsList.appendChild(recommendationItem);
      });
      
      // Remove the show more button
      showMoreBtn.remove();
    });
    
    recommendationsList.appendChild(showMoreBtn);
  }
  
  recommendationsSection.appendChild(recommendationsTitle);
  recommendationsSection.appendChild(recommendationsSummary);
  recommendationsSection.appendChild(recommendationsList);
  
  // Assemble the scorecard
  scorecard.appendChild(header);
  scorecard.appendChild(breakdownSection);
  scorecard.appendChild(recommendationsSection);
  
  // Add to container
  container.appendChild(scorecard);
  
  // Return the rendered element
  return scorecard;
}

/**
 * Load a user's financial data from the server
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - User financial data
 */
export async function loadUserFinancialData(userId) {
  try {
    const token = localStorage.getItem('stackrToken') || sessionStorage.getItem('stackrToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`/api/financial-data/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load financial data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error loading financial data:', error);
    // Return default data structure for testing
    return {
      incomeData: {
        sources: [{ name: 'Primary Job', amount: 4000, frequency: 'monthly' }],
        allocation: {
          needs: 45,
          savings: 25,
          investments: 30,
          needsTarget: 40,
          savingsTarget: 30,
          investmentsTarget: 30
        },
        monthsWithIncome: 6
      },
      savingsData: {
        rate: 15,
        totalSavings: 8000,
        monthlyIncome: 4000
      },
      debtData: {
        totalDebt: 15000,
        monthlyPayments: 500,
        monthlyIncome: 4000,
        debtTypes: [
          { type: 'student', amount: 10000 },
          { type: 'credit', amount: 5000 }
        ]
      },
      emergencyFund: {
        months: 2
      },
      investmentData: {
        growthRate: 5,
        diversification: 6,
        monthlyContributions: 200,
        totalInvestments: 12000
      },
      goals: [
        {
          id: 1,
          name: 'Emergency Fund',
          target: 12000,
          current: 8000,
          progress: 66.7,
          targetDate: '2024-12-31',
          plan: ['Monthly contribution of $500']
        },
        {
          id: 2,
          name: 'Pay off Credit Card',
          target: 5000,
          current: 1200,
          progress: 24,
          targetDate: '2024-06-30',
          plan: ['Pay $800 monthly']
        }
      ]
    };
  }
}

/**
 * Save wellness score to server
 * @param {number} userId - User ID
 * @param {Object} scoreData - Wellness score data
 * @returns {Promise<Object>} - Server response
 */
export async function saveWellnessScore(userId, scoreData) {
  try {
    const token = localStorage.getItem('stackrToken') || sessionStorage.getItem('stackrToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`/api/wellness-score/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(scoreData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save wellness score');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving wellness score:', error);
    return { success: false, error: error.message };
  }
}