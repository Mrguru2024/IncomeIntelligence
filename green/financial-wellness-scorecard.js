/**
 * Financial Wellness Scorecard Module
 * 
 * This module provides a comprehensive financial wellness assessment tool
 * that evaluates users' financial health across multiple categories
 * and provides personalized recommendations for improvement.
 */

/**
 * Render the Financial Wellness Scorecard page
 * @param {string} containerId - DOM element ID to render the scorecard interface
 */
export function renderFinancialScorecardPage(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear the container
  container.innerHTML = '';
  
  // Create the scorecard container with responsive layout
  const scorecardContainer = document.createElement('div');
  scorecardContainer.classList.add('financial-wellness-scorecard');
  scorecardContainer.style.display = 'flex';
  scorecardContainer.style.flexDirection = 'column';
  scorecardContainer.style.maxWidth = '1200px';
  scorecardContainer.style.margin = '0 auto';
  scorecardContainer.style.padding = '24px';
  scorecardContainer.style.gap = '24px';
  
  // Add the header section
  const headerSection = createSectionHeader(
    'Financial Wellness Scorecard',
    'Understand your overall financial health and get personalized tips to improve'
  );
  scorecardContainer.appendChild(headerSection);
  
  // Main scorecard content
  const mainContent = document.createElement('div');
  mainContent.classList.add('scorecard-content');
  mainContent.style.display = 'grid';
  mainContent.style.gridTemplateColumns = 'repeat(auto-fill, minmax(340px, 1fr))';
  mainContent.style.gap = '24px';
  
  // Add score summary card
  const scoreSummaryCard = createScoreSummaryCard();
  mainContent.appendChild(scoreSummaryCard);
  
  // Load user ID from local storage or app state
  const userId = getUserId();
  
  // Async function to load and display scorecard data
  (async function loadScorecard() {
    try {
      // Show loading state
      const loadingIndicator = createLoadingIndicator();
      scoreSummaryCard.appendChild(loadingIndicator);
      
      // Fetch user's financial wellness score
      const scoreData = await calculateFinancialWellnessScore(userId);
      
      // Remove loading indicator
      loadingIndicator.remove();
      
      // Update the score summary card with the overall score
      updateScoreSummaryCard(scoreSummaryCard, scoreData);
      
      // Create category score cards
      Object.entries(scoreData.categories).forEach(([category, data]) => {
        const categoryCard = createCategoryScoreCard(category, data);
        mainContent.appendChild(categoryCard);
      });
      
      // Add recommendations section
      const recommendationsSection = createRecommendationsSection(scoreData.recommendations);
      scorecardContainer.appendChild(recommendationsSection);
      
    } catch (error) {
      console.error('Error loading financial wellness scorecard:', error);
      scoreSummaryCard.innerHTML = `
        <div class="error-message" style="padding: 24px; text-align: center; color: var(--color-error);">
          <h3>Unable to load financial wellness data</h3>
          <p>${error.message || 'Please try again later'}</p>
        </div>
      `;
    }
  })();
  
  scorecardContainer.appendChild(mainContent);
  container.appendChild(scorecardContainer);
}

/**
 * Calculate a user's financial wellness score and breakdown
 * @param {string} userId - The user's ID
 * @returns {Object} User's financial scores
 */
async function calculateFinancialWellnessScore(userId) {
  // First try to fetch the user's financial data
  const financialData = await fetchUserFinancialData(userId);
  
  // Calculate individual category scores
  const savingsRateScore = calculateSavingsRateScore(financialData);
  const debtManagementScore = calculateDebtManagementScore(financialData);
  const emergencyFundScore = calculateEmergencyFundScore(financialData);
  const budgetAdherenceScore = calculateBudgetAdherenceScore(financialData);
  const investmentDiversityScore = calculateInvestmentDiversityScore(financialData);
  
  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (savingsRateScore * 0.25) +
    (debtManagementScore * 0.25) +
    (emergencyFundScore * 0.2) +
    (budgetAdherenceScore * 0.15) +
    (investmentDiversityScore * 0.15)
  );
  
  // Generate personalized recommendations based on scores
  const recommendations = generateRecommendations({
    savingsRateScore,
    debtManagementScore,
    emergencyFundScore,
    budgetAdherenceScore,
    investmentDiversityScore
  });
  
  return {
    overallScore,
    grade: getScoreGrade(overallScore),
    categories: {
      savingsRate: {
        name: 'Savings Rate',
        score: savingsRateScore,
        grade: getScoreGrade(savingsRateScore),
        description: 'How much of your income you save',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M20 12V8"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M20 16v4"></path></svg>'
      },
      debtManagement: {
        name: 'Debt Management',
        score: debtManagementScore,
        grade: getScoreGrade(debtManagementScore),
        description: 'How well you manage and reduce debt',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"></path><path d="M20 15V8a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path><path d="M10 14V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6"></path></svg>'
      },
      emergencyFund: {
        name: 'Emergency Fund',
        score: emergencyFundScore,
        grade: getScoreGrade(emergencyFundScore),
        description: 'Your preparedness for financial emergencies',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'
      },
      budgetAdherence: {
        name: 'Budget Adherence',
        score: budgetAdherenceScore,
        grade: getScoreGrade(budgetAdherenceScore),
        description: 'How well you stick to your budget',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>'
      },
      investmentDiversity: {
        name: 'Investment Diversity',
        score: investmentDiversityScore,
        grade: getScoreGrade(investmentDiversityScore),
        description: 'How diversified your investments are',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>'
      }
    },
    recommendations
  };
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
    // First try to fetch from API if available
    // This would be replaced with an actual API call in production
    
    // For the MVP, use local storage as data source if available
    const localData = fetchFinancialDataFromLocalStorage(userId);
    if (localData) {
      return localData;
    }
    
    // If no data is found, generate sensible defaults
    return {
      income: {
        monthly: 4000,
        annual: 48000
      },
      expenses: {
        fixed: 2000,
        variable: 1000,
        monthly: 3000
      },
      savings: {
        liquid: 5000,
        retirement: 15000,
        monthly: 400
      },
      debt: {
        credit: 2000,
        student: 10000,
        mortgage: 150000,
        auto: 8000,
        personal: 0,
        totalMonthlyPayments: 1200
      },
      netWorth: 20000,
      budgetCategories: {
        housing: { planned: 1200, actual: 1250 },
        food: { planned: 500, actual: 600 },
        transportation: { planned: 300, actual: 280 },
        utilities: { planned: 200, actual: 210 },
        entertainment: { planned: 200, actual: 250 },
        healthcare: { planned: 150, actual: 100 },
        personal: { planned: 100, actual: 150 },
        savings: { planned: 400, actual: 400 }
      },
      investments: {
        stocks: 10000,
        bonds: 5000,
        realEstate: 0,
        crypto: 0,
        other: 0
      }
    };
  } catch (error) {
    console.error('Error fetching financial data:', error);
    throw new Error('Unable to retrieve financial data');
  }
}

/**
 * Fetch financial data from local storage if available
 * @param {string} userId - User ID
 * @returns {Object} User financial data
 */
function fetchFinancialDataFromLocalStorage(userId) {
  try {
    const data = localStorage.getItem(`user_financial_data_${userId}`);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
    return null;
  }
}

/**
 * Calculate total expenses from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Total expenses
 */
function calculateExpensesFromTransactions(transactions) {
  if (!transactions || !transactions.length) return 0;
  
  return transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
}

/**
 * Calculate savings rate score (0-100)
 * @param {Object} financialData - User's financial data
 * @returns {number} Savings rate score
 */
function calculateSavingsRateScore(financialData) {
  // Savings rate = (monthly savings / monthly income) * 100
  const monthlyIncome = financialData.income.monthly;
  const monthlySavings = financialData.savings.monthly;
  
  if (!monthlyIncome || monthlyIncome <= 0) return 0;
  
  const savingsRate = (monthlySavings / monthlyIncome) * 100;
  
  // Calculate score on scale of 0-100
  // 0% savings rate = 0 score
  // 20% or higher savings rate = 100 score
  // Linear scale in between
  return Math.min(100, Math.round((savingsRate / 20) * 100));
}

/**
 * Calculate debt management score (0-100)
 * @param {Object} financialData - User's financial data
 * @returns {number} Debt management score
 */
function calculateDebtManagementScore(financialData) {
  const monthlyIncome = financialData.income.monthly;
  const monthlyDebtPayments = financialData.debt.totalMonthlyPayments;
  
  if (!monthlyIncome || monthlyIncome <= 0) return 0;
  
  // Debt-to-income ratio = (monthly debt payments / monthly income) * 100
  const debtToIncomeRatio = (monthlyDebtPayments / monthlyIncome) * 100;
  
  // Ideal debt-to-income ratio is below 20%
  // 50% or higher debt-to-income ratio = 0 score
  // 20% or lower debt-to-income ratio = 100 score
  // Linear scale in between
  if (debtToIncomeRatio >= 50) return 0;
  if (debtToIncomeRatio <= 20) return 100;
  
  return Math.round(100 - ((debtToIncomeRatio - 20) / 30) * 100);
}

/**
 * Calculate emergency fund score (0-100)
 * @param {Object} financialData - User's financial data
 * @returns {number} Emergency fund score
 */
function calculateEmergencyFundScore(financialData) {
  const monthlyExpenses = financialData.expenses.monthly;
  const liquidSavings = financialData.savings.liquid;
  
  if (!monthlyExpenses || monthlyExpenses <= 0) return 0;
  
  // Number of months emergency fund covers
  const monthsCovered = liquidSavings / monthlyExpenses;
  
  // 0 months covered = 0 score
  // 6 or more months covered = 100 score
  // Linear scale in between
  return Math.min(100, Math.round((monthsCovered / 6) * 100));
}

/**
 * Calculate budget adherence score (0-100)
 * @param {Object} financialData - User's financial data
 * @returns {number} Budget adherence score
 */
function calculateBudgetAdherenceScore(financialData) {
  const categories = financialData.budgetCategories;
  
  // If no budget categories are defined, return 0
  if (!categories || Object.keys(categories).length === 0) return 0;
  
  let totalPlanned = 0;
  let totalDifference = 0;
  
  // Calculate total planned budget and total difference between actual and planned
  Object.values(categories).forEach(category => {
    if (category.planned > 0) {
      totalPlanned += category.planned;
      totalDifference += Math.abs(category.actual - category.planned);
    }
  });
  
  if (totalPlanned <= 0) return 0;
  
  // Calculate percentage difference
  const percentageDifference = (totalDifference / totalPlanned) * 100;
  
  // 0% difference = 100 score
  // 30% or more difference = 0 score
  // Linear scale in between
  return Math.max(0, Math.round(100 - (percentageDifference * (100 / 30))));
}

/**
 * Calculate investment diversity score (0-100)
 * @param {Object} financialData - User's financial data
 * @returns {number} Investment diversity score
 */
function calculateInvestmentDiversityScore(financialData) {
  const investments = financialData.investments;
  
  // If no investments, return 0
  if (!investments) return 0;
  
  const investmentTypes = Object.keys(investments).filter(type => investments[type] > 0);
  const totalInvestments = Object.values(investments).reduce((sum, val) => sum + val, 0);
  
  // No investments = 0 score
  if (totalInvestments <= 0) return 0;
  
  // Calculate Herfindahl index to measure concentration
  // Higher Herfindahl = less diversity
  let herfindahlIndex = 0;
  
  Object.values(investments).forEach(amount => {
    if (amount > 0) {
      const marketShare = amount / totalInvestments;
      herfindahlIndex += marketShare * marketShare;
    }
  });
  
  // Convert to diversity score (1 - Herfindahl)
  // Scale to 0-100
  const rawDiversityScore = (1 - herfindahlIndex) * 100;
  
  // Adjustment based on number of investment types
  // Maximum score if there are at least 3-4 types
  const typeBonus = Math.min(30, investmentTypes.length * 10);
  
  return Math.min(100, Math.round(rawDiversityScore * 0.7 + typeBonus));
}

/**
 * Generate personalized recommendations based on scores
 * @param {Object} scores - Category scores
 * @returns {Array} Array of recommendation objects
 */
function generateRecommendations(scores) {
  const recommendations = [];
  
  // Savings Rate recommendations
  if (scores.savingsRateScore < 40) {
    recommendations.push({
      category: 'savingsRate',
      priority: 'high',
      title: 'Increase Your Savings Rate',
      description: 'Aim to save at least 10-15% of your income. Start by automatically transferring money to savings on payday.'
    });
  } else if (scores.savingsRateScore < 70) {
    recommendations.push({
      category: 'savingsRate',
      priority: 'medium',
      title: 'Boost Your Savings Rate',
      description: 'Consider increasing your savings rate by 2-5%. Review your budget to find areas where you can cut back.'
    });
  }
  
  // Debt Management recommendations
  if (scores.debtManagementScore < 30) {
    recommendations.push({
      category: 'debtManagement',
      priority: 'high',
      title: 'Reduce High-Interest Debt',
      description: 'Focus on paying down high-interest debt like credit cards first. Consider debt consolidation or balance transfer offers.'
    });
  } else if (scores.debtManagementScore < 60) {
    recommendations.push({
      category: 'debtManagement',
      priority: 'medium',
      title: 'Optimize Debt Repayment',
      description: 'Consider the snowball or avalanche method to pay down debt more efficiently. Always pay more than the minimum payment.'
    });
  }
  
  // Emergency Fund recommendations
  if (scores.emergencyFundScore < 50) {
    recommendations.push({
      category: 'emergencyFund',
      priority: 'high',
      title: 'Build Your Emergency Fund',
      description: 'Aim for 3-6 months of expenses in an easily accessible account. Start with a goal of $1,000, then build from there.'
    });
  } else if (scores.emergencyFundScore < 80) {
    recommendations.push({
      category: 'emergencyFund',
      priority: 'medium',
      title: 'Strengthen Your Emergency Fund',
      description: 'Consider increasing your emergency fund to cover 6 months of expenses. Keep these funds in a high-yield savings account.'
    });
  }
  
  // Budget Adherence recommendations
  if (scores.budgetAdherenceScore < 60) {
    recommendations.push({
      category: 'budgetAdherence',
      priority: 'medium',
      title: 'Improve Budget Tracking',
      description: 'Review your spending weekly instead of monthly. Use the envelope method or automatic categorization to better track expenses.'
    });
  }
  
  // Investment Diversity recommendations
  if (scores.investmentDiversityScore < 40) {
    recommendations.push({
      category: 'investmentDiversity',
      priority: 'medium',
      title: 'Diversify Your Investments',
      description: 'Consider low-cost index funds or ETFs to increase diversification. Don't put all your investments in a single asset class.'
    });
  }
  
  return recommendations;
}

/**
 * Get current user ID from app state or local storage
 * @returns {string} User ID
 */
function getUserId() {
  // Try to get from app state if available
  if (window.appState && window.appState.user && window.appState.user.id) {
    return window.appState.user.id;
  }
  
  // Otherwise get from local storage
  try {
    const userData = localStorage.getItem('stackr_user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.id;
    }
  } catch (e) {
    console.warn('Could not get user ID from localStorage:', e);
  }
  
  // Fallback to demo user
  return 'demo-user';
}

/* UI components for the scorecard */

/**
 * Create section header component
 * @param {string} title - Section title
 * @param {string} subtitle - Section subtitle
 * @returns {HTMLElement} Section header element
 */
function createSectionHeader(title, subtitle) {
  const header = document.createElement('div');
  header.classList.add('section-header');
  header.style.marginBottom = '24px';
  
  const titleElement = document.createElement('h2');
  titleElement.textContent = title;
  titleElement.style.fontSize = '24px';
  titleElement.style.fontWeight = '700';
  titleElement.style.marginBottom = '8px';
  titleElement.style.color = 'var(--color-text-primary)';
  
  const subtitleElement = document.createElement('p');
  subtitleElement.textContent = subtitle;
  subtitleElement.style.fontSize = '16px';
  subtitleElement.style.color = 'var(--color-text-secondary)';
  subtitleElement.style.marginBottom = '8px';
  
  header.appendChild(titleElement);
  header.appendChild(subtitleElement);
  
  return header;
}

/**
 * Create score summary card
 * @returns {HTMLElement} Score summary card element
 */
function createScoreSummaryCard() {
  const card = document.createElement('div');
  card.classList.add('score-summary-card');
  card.style.background = 'var(--color-card-bg)';
  card.style.borderRadius = '12px';
  card.style.padding = '24px';
  card.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
  card.style.position = 'relative';
  card.style.overflow = 'hidden';
  card.style.gridColumn = '1 / -1';
  
  const headerText = document.createElement('h3');
  headerText.textContent = 'Your Financial Wellness Score';
  headerText.style.fontSize = '18px';
  headerText.style.fontWeight = '600';
  headerText.style.marginBottom = '16px';
  headerText.style.color = 'var(--color-text-primary)';
  
  card.appendChild(headerText);
  
  return card;
}

/**
 * Update score summary card with data
 * @param {HTMLElement} card - Score summary card element
 * @param {Object} scoreData - Score data object
 */
function updateScoreSummaryCard(card, scoreData) {
  // Create score display container
  const scoreContainer = document.createElement('div');
  scoreContainer.style.display = 'flex';
  scoreContainer.style.alignItems = 'center';
  scoreContainer.style.gap = '24px';
  scoreContainer.style.marginBottom = '24px';
  
  // Create circular score indicator
  const scoreCircle = document.createElement('div');
  scoreCircle.style.width = '120px';
  scoreCircle.style.height = '120px';
  scoreCircle.style.borderRadius = '50%';
  scoreCircle.style.display = 'flex';
  scoreCircle.style.flexDirection = 'column';
  scoreCircle.style.justifyContent = 'center';
  scoreCircle.style.alignItems = 'center';
  scoreCircle.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  
  // Set background color based on score
  if (scoreData.overallScore >= 80) {
    scoreCircle.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
  } else if (scoreData.overallScore >= 60) {
    scoreCircle.style.background = 'linear-gradient(135deg, #facc15 0%, #eab308 100%)';
  } else {
    scoreCircle.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
  }
  
  // Score number
  const scoreNumber = document.createElement('div');
  scoreNumber.textContent = scoreData.overallScore;
  scoreNumber.style.fontSize = '36px';
  scoreNumber.style.fontWeight = '700';
  scoreNumber.style.color = 'white';
  
  // Score grade
  const scoreGrade = document.createElement('div');
  scoreGrade.textContent = scoreData.grade;
  scoreGrade.style.fontSize = '24px';
  scoreGrade.style.fontWeight = '600';
  scoreGrade.style.color = 'rgba(255, 255, 255, 0.9)';
  
  scoreCircle.appendChild(scoreNumber);
  scoreCircle.appendChild(scoreGrade);
  
  // Score explanation
  const scoreExplanation = document.createElement('div');
  scoreExplanation.style.flex = '1';
  
  const explanationTitle = document.createElement('h4');
  explanationTitle.style.fontSize = '16px';
  explanationTitle.style.fontWeight = '600';
  explanationTitle.style.marginBottom = '8px';
  explanationTitle.style.color = 'var(--color-text-primary)';
  
  const explanationText = document.createElement('p');
  explanationText.style.fontSize = '14px';
  explanationText.style.lineHeight = '1.5';
  explanationText.style.color = 'var(--color-text-secondary)';
  
  // Set explanation based on score
  if (scoreData.overallScore >= 80) {
    explanationTitle.textContent = 'Excellent Financial Health';
    explanationText.textContent = 'You're managing your finances very well! Continue your current habits and look for opportunities to optimize further.';
  } else if (scoreData.overallScore >= 60) {
    explanationTitle.textContent = 'Good Financial Health';
    explanationText.textContent = 'You're on the right track, but there are areas you can improve. Focus on the recommendations below.';
  } else {
    explanationTitle.textContent = 'Needs Improvement';
    explanationText.textContent = 'There are some key areas that need your attention. Focus on the high-priority recommendations to improve your financial wellness.';
  }
  
  scoreExplanation.appendChild(explanationTitle);
  scoreExplanation.appendChild(explanationText);
  
  // Add components to score container
  scoreContainer.appendChild(scoreCircle);
  scoreContainer.appendChild(scoreExplanation);
  
  // Add category score overview
  const categoryScoresContainer = document.createElement('div');
  categoryScoresContainer.style.display = 'flex';
  categoryScoresContainer.style.flexWrap = 'wrap';
  categoryScoresContainer.style.gap = '16px';
  categoryScoresContainer.style.marginTop = '16px';
  
  // Create mini score indicators for each category
  Object.entries(scoreData.categories).forEach(([key, category]) => {
    const miniScoreContainer = document.createElement('div');
    miniScoreContainer.style.display = 'flex';
    miniScoreContainer.style.alignItems = 'center';
    miniScoreContainer.style.gap = '8px';
    miniScoreContainer.style.flex = '1';
    miniScoreContainer.style.minWidth = '180px';
    
    // Mini score circle
    const miniCircle = document.createElement('div');
    miniCircle.style.width = '36px';
    miniCircle.style.height = '36px';
    miniCircle.style.borderRadius = '50%';
    miniCircle.style.display = 'flex';
    miniCircle.style.justifyContent = 'center';
    miniCircle.style.alignItems = 'center';
    miniCircle.style.color = 'white';
    miniCircle.style.fontWeight = '600';
    miniCircle.style.fontSize = '14px';
    
    // Set color based on category score
    if (category.score >= 80) {
      miniCircle.style.backgroundColor = '#22c55e';
    } else if (category.score >= 60) {
      miniCircle.style.backgroundColor = '#eab308';
    } else {
      miniCircle.style.backgroundColor = '#ef4444';
    }
    
    miniCircle.textContent = category.score;
    
    // Category label
    const miniLabel = document.createElement('div');
    miniLabel.textContent = category.name;
    miniLabel.style.fontSize = '14px';
    miniLabel.style.color = 'var(--color-text-primary)';
    
    miniScoreContainer.appendChild(miniCircle);
    miniScoreContainer.appendChild(miniLabel);
    
    categoryScoresContainer.appendChild(miniScoreContainer);
  });
  
  // Add components to card
  card.appendChild(scoreContainer);
  card.appendChild(createDivider());
  card.appendChild(categoryScoresContainer);
}

/**
 * Create category score card
 * @param {string} categoryKey - Category key
 * @param {Object} data - Category data
 * @returns {HTMLElement} Category score card element
 */
function createCategoryScoreCard(categoryKey, data) {
  const card = document.createElement('div');
  card.classList.add('category-score-card');
  card.style.background = 'var(--color-card-bg)';
  card.style.borderRadius = '12px';
  card.style.padding = '24px';
  card.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
  
  // Card header with icon
  const cardHeader = document.createElement('div');
  cardHeader.style.display = 'flex';
  cardHeader.style.alignItems = 'center';
  cardHeader.style.gap = '12px';
  cardHeader.style.marginBottom = '16px';
  
  // Icon
  const iconContainer = document.createElement('div');
  iconContainer.style.width = '36px';
  iconContainer.style.height = '36px';
  iconContainer.style.borderRadius = '8px';
  iconContainer.style.background = 'var(--color-primary)';
  iconContainer.style.display = 'flex';
  iconContainer.style.justifyContent = 'center';
  iconContainer.style.alignItems = 'center';
  iconContainer.style.color = 'white';
  iconContainer.innerHTML = data.icon;
  
  // Category name
  const categoryName = document.createElement('h3');
  categoryName.textContent = data.name;
  categoryName.style.fontSize = '16px';
  categoryName.style.fontWeight = '600';
  categoryName.style.color = 'var(--color-text-primary)';
  
  cardHeader.appendChild(iconContainer);
  cardHeader.appendChild(categoryName);
  
  // Score display
  const scoreDisplay = document.createElement('div');
  scoreDisplay.style.display = 'flex';
  scoreDisplay.style.alignItems = 'center';
  scoreDisplay.style.gap = '12px';
  scoreDisplay.style.marginBottom = '16px';
  
  // Score number
  const scoreNumber = document.createElement('div');
  scoreNumber.textContent = data.score;
  scoreNumber.style.fontSize = '28px';
  scoreNumber.style.fontWeight = '700';
  
  // Set color based on score
  if (data.score >= 80) {
    scoreNumber.style.color = '#22c55e';
  } else if (data.score >= 60) {
    scoreNumber.style.color = '#eab308';
  } else {
    scoreNumber.style.color = '#ef4444';
  }
  
  // Grade display
  const gradeDisplay = document.createElement('div');
  gradeDisplay.textContent = data.grade;
  gradeDisplay.style.width = '36px';
  gradeDisplay.style.height = '36px';
  gradeDisplay.style.display = 'flex';
  gradeDisplay.style.justifyContent = 'center';
  gradeDisplay.style.alignItems = 'center';
  gradeDisplay.style.borderRadius = '50%';
  gradeDisplay.style.fontSize = '16px';
  gradeDisplay.style.fontWeight = '600';
  gradeDisplay.style.color = 'white';
  
  // Set background color based on grade
  if (data.grade === 'A') {
    gradeDisplay.style.backgroundColor = '#22c55e';
  } else if (data.grade === 'B') {
    gradeDisplay.style.backgroundColor = '#84cc16';
  } else if (data.grade === 'C') {
    gradeDisplay.style.backgroundColor = '#eab308';
  } else if (data.grade === 'D') {
    gradeDisplay.style.backgroundColor = '#f97316';
  } else {
    gradeDisplay.style.backgroundColor = '#ef4444';
  }
  
  scoreDisplay.appendChild(scoreNumber);
  scoreDisplay.appendChild(gradeDisplay);
  
  // Description
  const description = document.createElement('p');
  description.textContent = data.description;
  description.style.fontSize = '14px';
  description.style.color = 'var(--color-text-secondary)';
  description.style.marginBottom = '16px';
  
  // Add components to card
  card.appendChild(cardHeader);
  card.appendChild(scoreDisplay);
  card.appendChild(description);
  
  return card;
}

/**
 * Create recommendations section
 * @param {Array} recommendations - Array of recommendation objects
 * @returns {HTMLElement} Recommendations section element
 */
function createRecommendationsSection(recommendations) {
  const section = document.createElement('div');
  section.classList.add('recommendations-section');
  section.style.marginTop = '32px';
  
  // Section header
  const header = createSectionHeader(
    'Your Personalized Recommendations',
    'Focus on these key actions to improve your financial wellness'
  );
  section.appendChild(header);
  
  // No recommendations message
  if (!recommendations || recommendations.length === 0) {
    const noRecommendations = document.createElement('p');
    noRecommendations.textContent = 'Great job! We don\'t have any specific recommendations at this time. Continue your current financial habits.';
    noRecommendations.style.textAlign = 'center';
    noRecommendations.style.padding = '24px';
    noRecommendations.style.color = 'var(--color-text-secondary)';
    section.appendChild(noRecommendations);
    return section;
  }
  
  // Recommendations container
  const recommendationsContainer = document.createElement('div');
  recommendationsContainer.style.display = 'grid';
  recommendationsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  recommendationsContainer.style.gap = '16px';
  
  // Sort recommendations by priority: high, medium, low
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  // Create recommendation cards
  sortedRecommendations.forEach(recommendation => {
    const recommendationCard = createRecommendationCard(recommendation);
    recommendationsContainer.appendChild(recommendationCard);
  });
  
  section.appendChild(recommendationsContainer);
  return section;
}

/**
 * Create recommendation card
 * @param {Object} recommendation - Recommendation object
 * @returns {HTMLElement} Recommendation card element
 */
function createRecommendationCard(recommendation) {
  const card = document.createElement('div');
  card.classList.add('recommendation-card');
  card.style.background = 'var(--color-card-bg)';
  card.style.borderRadius = '12px';
  card.style.padding = '20px';
  card.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.gap = '12px';
  card.style.border = '1px solid var(--color-border)';
  
  // Priority badge
  const priorityBadge = document.createElement('div');
  priorityBadge.style.display = 'inline-block';
  priorityBadge.style.padding = '4px 8px';
  priorityBadge.style.borderRadius = '4px';
  priorityBadge.style.fontSize = '12px';
  priorityBadge.style.fontWeight = '600';
  priorityBadge.style.textTransform = 'uppercase';
  priorityBadge.style.marginBottom = '8px';
  priorityBadge.style.alignSelf = 'flex-start';
  
  // Set badge style based on priority
  if (recommendation.priority === 'high') {
    priorityBadge.textContent = 'High Priority';
    priorityBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
    priorityBadge.style.color = '#ef4444';
  } else if (recommendation.priority === 'medium') {
    priorityBadge.textContent = 'Medium Priority';
    priorityBadge.style.backgroundColor = 'rgba(234, 179, 8, 0.15)';
    priorityBadge.style.color = '#eab308';
  } else {
    priorityBadge.textContent = 'Good Practice';
    priorityBadge.style.backgroundColor = 'rgba(34, 197, 94, 0.15)';
    priorityBadge.style.color = '#22c55e';
  }
  
  // Title
  const title = document.createElement('h4');
  title.textContent = recommendation.title;
  title.style.fontSize = '16px';
  title.style.fontWeight = '600';
  title.style.color = 'var(--color-text-primary)';
  
  // Description
  const description = document.createElement('p');
  description.textContent = recommendation.description;
  description.style.fontSize = '14px';
  description.style.color = 'var(--color-text-secondary)';
  description.style.lineHeight = '1.5';
  
  // Add components to card
  card.appendChild(priorityBadge);
  card.appendChild(title);
  card.appendChild(description);
  
  return card;
}

/**
 * Create loading indicator
 * @returns {HTMLElement} Loading indicator element
 */
function createLoadingIndicator() {
  const loadingContainer = document.createElement('div');
  loadingContainer.style.display = 'flex';
  loadingContainer.style.flexDirection = 'column';
  loadingContainer.style.alignItems = 'center';
  loadingContainer.style.justifyContent = 'center';
  loadingContainer.style.padding = '24px';
  loadingContainer.style.gap = '16px';
  
  const spinner = document.createElement('div');
  spinner.style.width = '40px';
  spinner.style.height = '40px';
  spinner.style.border = '4px solid var(--color-border)';
  spinner.style.borderTopColor = 'var(--color-primary)';
  spinner.style.borderRadius = '50%';
  spinner.style.animation = 'spin 1s linear infinite';
  
  // Add keyframes for spinner animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  const loadingText = document.createElement('p');
  loadingText.textContent = 'Calculating your financial wellness score...';
  loadingText.style.color = 'var(--color-text-secondary)';
  loadingText.style.fontSize = '14px';
  
  loadingContainer.appendChild(spinner);
  loadingContainer.appendChild(loadingText);
  
  return loadingContainer;
}

/**
 * Create divider element
 * @returns {HTMLElement} Divider element
 */
function createDivider() {
  const divider = document.createElement('hr');
  divider.style.border = 'none';
  divider.style.height = '1px';
  divider.style.backgroundColor = 'var(--color-border)';
  divider.style.margin = '16px 0';
  return divider;
}

/**
 * Helper function to add displayPageTitle for main.js compatibility
 * @param {string} title - The page title to display
 */
function displayPageTitle(title) {
  const titleElement = document.getElementById('page-title');
  if (titleElement) {
    titleElement.textContent = title;
  }
}