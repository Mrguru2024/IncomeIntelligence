/**
 * Financial Wellness Page
 * Renders a comprehensive financial wellness dashboard for users
 */
// Implementing standalone functions instead of importing from wellness-scorecard.js

/**
 * Load user financial data
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} - User financial data
 */
async function loadUserFinancialData(userId) {
  // Simulated API call with mock data
  return {
    incomeData: { 
      sources: ['Primary Job', 'Side Gig'], 
      allocation: { needs: 40, wants: 30, savings: 30 } 
    },
    savingsData: { 
      rate: 15, 
      totalSavings: 15000 
    },
    debtData: { 
      totalDebt: 25000, 
      monthlyPayments: 500, 
      monthlyIncome: 4000 
    },
    emergencyFund: { 
      months: 3 
    },
    investmentData: { 
      growthRate: 5, 
      diversification: 7 
    },
    goals: [
      { name: 'Emergency Fund', target: 20000, current: 15000 },
      { name: 'Retirement', target: 1000000, current: 50000 }
    ]
  };
}

/**
 * Render wellness scorecard
 * @param {Object} userData - User financial data
 * @param {string} containerId - Container ID
 */
function renderWellnessScorecard(userData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Create scorecard container
  const scorecard = document.createElement('div');
  scorecard.className = 'wellness-scorecard';
  scorecard.style.backgroundColor = '#fff';
  scorecard.style.borderRadius = '12px';
  scorecard.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
  scorecard.style.padding = '2rem';
  scorecard.style.width = '100%';
  scorecard.style.maxWidth = '800px';
  scorecard.style.margin = '0 auto';
  
  // Create header with overall score
  const scoreHeader = document.createElement('div');
  scoreHeader.style.display = 'flex';
  scoreHeader.style.alignItems = 'center';
  scoreHeader.style.justifyContent = 'space-between';
  scoreHeader.style.marginBottom = '2rem';
  
  // Calculate overall score
  const score = calculateScore(userData).totalScore;
  
  // Score display
  const scoreDisplay = document.createElement('div');
  scoreDisplay.style.display = 'flex';
  scoreDisplay.style.alignItems = 'center';
  scoreDisplay.style.gap = '1rem';
  
  const scoreCircle = document.createElement('div');
  scoreCircle.style.width = '80px';
  scoreCircle.style.height = '80px';
  scoreCircle.style.borderRadius = '50%';
  scoreCircle.style.backgroundColor = getScoreColor(score);
  scoreCircle.style.display = 'flex';
  scoreCircle.style.alignItems = 'center';
  scoreCircle.style.justifyContent = 'center';
  scoreCircle.style.color = 'white';
  
  const scoreValue = document.createElement('span');
  scoreValue.textContent = Math.round(score);
  scoreValue.style.fontWeight = 'bold';
  scoreValue.style.fontSize = '1.75rem';
  
  scoreCircle.appendChild(scoreValue);
  
  const scoreInfo = document.createElement('div');
  const scoreLabel = document.createElement('h3');
  scoreLabel.textContent = 'Overall Financial Wellness';
  scoreLabel.style.fontSize = '1.25rem';
  scoreLabel.style.margin = '0 0 0.5rem 0';
  
  const scoreDescription = document.createElement('p');
  scoreDescription.textContent = getScoreDescription(score);
  scoreDescription.style.fontSize = '0.875rem';
  scoreDescription.style.margin = '0';
  scoreDescription.style.color = '#666';
  
  scoreInfo.appendChild(scoreLabel);
  scoreInfo.appendChild(scoreDescription);
  
  scoreDisplay.appendChild(scoreCircle);
  scoreDisplay.appendChild(scoreInfo);
  
  scoreHeader.appendChild(scoreDisplay);
  
  // Create body with detailed scores
  const scoreBody = document.createElement('div');
  scoreBody.style.display = 'grid';
  scoreBody.style.gridTemplateColumns = 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))';
  scoreBody.style.gap = '1.5rem';
  
  // Create category scores
  const categories = [
    { name: 'Income', value: Math.min(userData.incomeData.sources.length * 5, 20), max: 20, icon: '💼' },
    { name: 'Savings', value: Math.min(userData.savingsData.rate, 20), max: 20, icon: '💰' },
    { name: 'Debt', value: Math.min(20, 20 * (1 - (userData.debtData.monthlyPayments / userData.debtData.monthlyIncome))), max: 20, icon: '📉' },
    { name: 'Emergency Fund', value: Math.min(userData.emergencyFund.months * 3, 15), max: 15, icon: '🛡️' },
    { name: 'Investments', value: Math.min(userData.investmentData.growthRate * 2, 15), max: 15, icon: '📈' },
    { name: 'Goals', value: Math.min(userData.goals.length * 3, 10), max: 10, icon: '🎯' }
  ];
  
  categories.forEach(category => {
    const categoryCard = document.createElement('div');
    categoryCard.style.backgroundColor = '#f9f9f9';
    categoryCard.style.borderRadius = '8px';
    categoryCard.style.padding = '1.5rem';
    categoryCard.style.display = 'flex';
    categoryCard.style.flexDirection = 'column';
    categoryCard.style.gap = '0.5rem';
    
    const categoryHeader = document.createElement('div');
    categoryHeader.style.display = 'flex';
    categoryHeader.style.alignItems = 'center';
    categoryHeader.style.gap = '0.75rem';
    categoryHeader.style.marginBottom = '0.5rem';
    
    const categoryIcon = document.createElement('span');
    categoryIcon.textContent = category.icon;
    categoryIcon.style.fontSize = '1.5rem';
    
    const categoryName = document.createElement('h4');
    categoryName.textContent = category.name;
    categoryName.style.margin = '0';
    categoryName.style.fontSize = '1.1rem';
    
    categoryHeader.appendChild(categoryIcon);
    categoryHeader.appendChild(categoryName);
    
    const categoryScoreContainer = document.createElement('div');
    categoryScoreContainer.style.display = 'flex';
    categoryScoreContainer.style.alignItems = 'center';
    categoryScoreContainer.style.justifyContent = 'space-between';
    
    const categoryScoreValue = document.createElement('span');
    categoryScoreValue.textContent = `${Math.round(category.value)}/${category.max}`;
    categoryScoreValue.style.fontWeight = 'bold';
    
    categoryScoreContainer.appendChild(categoryScoreValue);
    
    const progressBar = document.createElement('div');
    progressBar.style.width = '100%';
    progressBar.style.height = '8px';
    progressBar.style.backgroundColor = '#e2e8f0';
    progressBar.style.borderRadius = '4px';
    progressBar.style.marginTop = '0.5rem';
    
    const progress = document.createElement('div');
    progress.style.width = `${(category.value / category.max) * 100}%`;
    progress.style.height = '100%';
    progress.style.borderRadius = '4px';
    progress.style.backgroundColor = getScoreColor(category.value / category.max * 100);
    
    progressBar.appendChild(progress);
    
    categoryCard.appendChild(categoryHeader);
    categoryCard.appendChild(categoryScoreContainer);
    categoryCard.appendChild(progressBar);
    
    scoreBody.appendChild(categoryCard);
  });
  
  // Assemble scorecard
  scorecard.appendChild(scoreHeader);
  scorecard.appendChild(scoreBody);
  
  // Append to container
  container.appendChild(scorecard);
}

/**
 * Save wellness score
 * @param {number} userId - User ID
 * @param {Object} scoreData - Score data
 * @returns {Promise<void>}
 */
async function saveWellnessScore(userId, scoreData) {
  // In a real app, this would be an API call
  console.log(`Saved score ${scoreData.totalScore} for user ${userId}`);
  return Promise.resolve();
}

/**
 * Get score color based on value
 * @param {number} score - Score value
 * @returns {string} - CSS color value
 */
function getScoreColor(score) {
  if (score >= 80) return '#48bb78'; // Green
  if (score >= 60) return '#4299e1'; // Blue
  if (score >= 40) return '#ed8936'; // Orange
  return '#e53e3e'; // Red
}

/**
 * Get score description based on value
 * @param {number} score - Score value
 * @returns {string} - Score description
 */
function getScoreDescription(score) {
  if (score >= 80) return 'Excellent financial health - you\'re on the right track!';
  if (score >= 60) return 'Good financial standing - with a few improvements you can excel.';
  if (score >= 40) return 'Fair financial condition - focus on key areas to improve.';
  return 'Needs attention - consider working with a financial advisor.';
}

/**
 * Render the financial wellness page
 * @param {number} userId - The user ID
 * @returns {HTMLElement} - The rendered page element
 */
export async function renderWellnessPage(userId) {
  // Get viewport width for responsive design
  const width = window.innerWidth;
  const isMobile = width < 768;
  const isSmallMobile = width < 500;
  const isExtraSmallMobile = width < 350;
  
  // Create main container
  const container = document.createElement('div');
  container.className = 'wellness-page';
  container.style.maxWidth = '100%';
  container.style.margin = '0 auto';
  container.style.padding = isExtraSmallMobile ? '1rem' : isSmallMobile ? '1.5rem' : '2rem';
  container.style.fontFamily = 'Inter, system-ui, sans-serif';
  container.style.color = '#333';
  container.style.minHeight = '100vh';
  
  // Create page header
  const header = document.createElement('div');
  header.className = 'wellness-header';
  header.style.marginBottom = '2rem';
  
  const pageTitle = document.createElement('h1');
  pageTitle.textContent = 'Financial Wellness';
  pageTitle.style.fontSize = isSmallMobile ? '1.75rem' : '2rem';
  pageTitle.style.fontWeight = '700';
  pageTitle.style.marginBottom = '0.5rem';
  
  const pageDescription = document.createElement('p');
  pageDescription.textContent = 'Track your financial health and get personalized recommendations to improve your financial wellness.';
  pageDescription.style.fontSize = isSmallMobile ? '0.9rem' : '1rem';
  pageDescription.style.color = '#666';
  pageDescription.style.maxWidth = '800px';
  
  header.appendChild(pageTitle);
  header.appendChild(pageDescription);
  
  // Create loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.style.display = 'flex';
  loadingIndicator.style.flexDirection = 'column';
  loadingIndicator.style.alignItems = 'center';
  loadingIndicator.style.justifyContent = 'center';
  loadingIndicator.style.padding = '2rem';
  loadingIndicator.style.textAlign = 'center';
  
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.style.display = 'inline-block';
  spinner.style.width = '40px';
  spinner.style.height = '40px';
  spinner.style.borderRadius = '50%';
  spinner.style.border = '4px solid rgba(66, 153, 225, 0.3)';
  spinner.style.borderTopColor = '#4299e1';
  spinner.style.animation = 'spinner-rotate 1s linear infinite';
  spinner.style.marginBottom = '1rem';
  
  const loadingText = document.createElement('p');
  loadingText.textContent = 'Loading your financial wellness data...';
  
  loadingIndicator.appendChild(spinner);
  loadingIndicator.appendChild(loadingText);
  
  // Add spinner animation
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spinner-rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
  
  // Create content section
  const contentSection = document.createElement('div');
  contentSection.className = 'wellness-content';
  contentSection.appendChild(loadingIndicator);
  
  // Add scorecard container
  const scorecardContainer = document.createElement('div');
  scorecardContainer.id = 'wellness-scorecard-container';
  scorecardContainer.style.display = 'none'; // Hidden initially, will be shown when data loads
  
  // Create actions/controls section
  const actionsSection = document.createElement('div');
  actionsSection.className = 'wellness-actions';
  actionsSection.style.marginTop = '2rem';
  actionsSection.style.display = 'flex';
  actionsSection.style.flexDirection = isMobile ? 'column' : 'row';
  actionsSection.style.gap = '1rem';
  actionsSection.style.justifyContent = 'flex-start';
  actionsSection.style.display = 'none'; // Hidden initially
  
  // Refresh button
  const refreshButton = document.createElement('button');
  refreshButton.className = 'refresh-btn';
  refreshButton.textContent = 'Refresh Score';
  refreshButton.style.padding = '0.75rem 1.5rem';
  refreshButton.style.backgroundColor = '#4299e1';
  refreshButton.style.color = 'white';
  refreshButton.style.border = 'none';
  refreshButton.style.borderRadius = '8px';
  refreshButton.style.fontWeight = '600';
  refreshButton.style.cursor = 'pointer';
  refreshButton.style.display = 'flex';
  refreshButton.style.alignItems = 'center';
  refreshButton.style.justifyContent = 'center';
  refreshButton.style.gap = '0.5rem';
  
  // Refreshing indicator
  const refreshingIndicator = document.createElement('span');
  refreshingIndicator.className = 'refreshing-indicator';
  refreshingIndicator.style.display = 'none'; // Hidden initially
  refreshingIndicator.style.width = '16px';
  refreshingIndicator.style.height = '16px';
  refreshingIndicator.style.borderRadius = '50%';
  refreshingIndicator.style.border = '2px solid rgba(255, 255, 255, 0.3)';
  refreshingIndicator.style.borderTopColor = 'white';
  refreshingIndicator.style.animation = 'spinner-rotate 1s linear infinite';
  
  refreshButton.appendChild(refreshingIndicator);
  
  // Refresh button click handler
  refreshButton.addEventListener('click', async () => {
    // Show refreshing indicator
    refreshingIndicator.style.display = 'inline-block';
    refreshButton.disabled = true;
    
    try {
      // Load fresh data
      const userData = await loadUserFinancialData(userId);
      
      // Render new scorecard
      scorecardContainer.innerHTML = '';
      renderWellnessScorecard(userData, 'wellness-scorecard-container');
      
      // Calculate and save score
      const scoreData = calculateScore(userData);
      await saveWellnessScore(userId, scoreData);
      
    } catch (error) {
      console.error('Error refreshing wellness score:', error);
      const errorToast = createToast('Error refreshing data. Please try again.', 'error');
      container.appendChild(errorToast);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        errorToast.style.opacity = '0';
        setTimeout(() => {
          errorToast.remove();
        }, 300);
      }, 3000);
    } finally {
      // Hide refreshing indicator
      refreshingIndicator.style.display = 'none';
      refreshButton.disabled = false;
    }
  });
  
  // Add buttons to actions section
  actionsSection.appendChild(refreshButton);
  
  // Assemble page
  container.appendChild(header);
  container.appendChild(contentSection);
  contentSection.appendChild(scorecardContainer);
  container.appendChild(actionsSection);
  
  // Load user data and render scorecard
  try {
    const userData = await loadUserFinancialData(userId);
    
    // Hide loading indicator and show scorecard
    loadingIndicator.style.display = 'none';
    scorecardContainer.style.display = 'block';
    actionsSection.style.display = isMobile ? 'flex' : 'flex';
    
    // Render scorecard - ensure DOM is ready
    setTimeout(() => {
      renderWellnessScorecard(userData, 'wellness-scorecard-container');
    }, 0);
    
  } catch (error) {
    console.error('Error loading wellness data:', error);
    
    // Show error message
    loadingIndicator.innerHTML = '';
    
    const errorIcon = document.createElement('div');
    errorIcon.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    `;
    errorIcon.style.marginBottom = '1rem';
    
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Error loading financial data. Please try again later.';
    errorMessage.style.marginBottom = '1.5rem';
    
    const retryButton = document.createElement('button');
    retryButton.textContent = 'Retry';
    retryButton.style.padding = '0.75rem 1.5rem';
    retryButton.style.backgroundColor = '#4299e1';
    retryButton.style.color = 'white';
    retryButton.style.border = 'none';
    retryButton.style.borderRadius = '8px';
    retryButton.style.fontWeight = '600';
    retryButton.style.cursor = 'pointer';
    
    retryButton.addEventListener('click', () => {
      // Reload the page to try again
      window.location.reload();
    });
    
    loadingIndicator.appendChild(errorIcon);
    loadingIndicator.appendChild(errorMessage);
    loadingIndicator.appendChild(retryButton);
  }
  
  return container;
}

/**
 * Create toast notification
 * @param {string} message - The toast message
 * @param {string} type - Toast type (success, error, info)
 * @returns {HTMLElement} - The toast element
 */
function createToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.position = 'fixed';
  toast.style.bottom = '2rem';
  toast.style.right = '2rem';
  toast.style.padding = '1rem 1.5rem';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '0.75rem';
  toast.style.transition = 'opacity 0.3s ease';
  toast.style.zIndex = '1000';
  
  // Set colors based on type
  if (type === 'success') {
    toast.style.backgroundColor = '#48bb78';
    toast.style.color = 'white';
  } else if (type === 'error') {
    toast.style.backgroundColor = '#e53e3e';
    toast.style.color = 'white';
  } else {
    toast.style.backgroundColor = '#4299e1';
    toast.style.color = 'white';
  }
  
  // Add icon
  const icon = document.createElement('span');
  if (type === 'success') {
    icon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
  } else if (type === 'error') {
    icon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `;
  } else {
    icon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;
  }
  
  const text = document.createElement('span');
  text.textContent = message;
  
  toast.appendChild(icon);
  toast.appendChild(text);
  
  return toast;
}

/**
 * Helper function to calculate score (wrapper for the wellness-scorecard function)
 * @param {Object} userData - User financial data
 * @returns {Object} - Score data
 */
function calculateScore(userData) {
  // This would normally call the function from wellness-scorecard.js
  // But for simplicity, we'll create a stub implementation here
  const calculateWellnessScore = (userData) => {
    // Default values if any data is missing
    const {
      incomeData = { sources: [], allocation: {} },
      savingsData = { rate: 0, totalSavings: 0 },
      debtData = { totalDebt: 0, monthlyPayments: 0, monthlyIncome: 1 },
      emergencyFund = { months: 0 },
      investmentData = { growthRate: 0, diversification: 0 },
      goals = []
    } = userData;
    
    // This is a simplified calculation - the actual logic is in wellness-scorecard.js
    let totalScore = 0;
    
    // Income score (max 20)
    const incomeScore = Math.min(incomeData.sources.length * 5, 20);
    totalScore += incomeScore;
    
    // Savings score (max 20)
    const savingsScore = Math.min(savingsData.rate, 20);
    totalScore += savingsScore;
    
    // Debt score (max 20)
    const debtScore = debtData.totalDebt > 0 ? 
      Math.min(20, 20 * (1 - (debtData.monthlyPayments / debtData.monthlyIncome))) : 20;
    totalScore += debtScore;
    
    // Emergency fund score (max 15)
    const emergencyScore = Math.min(emergencyFund.months * 3, 15);
    totalScore += emergencyScore;
    
    // Investment score (max 15)
    const investmentScore = Math.min(investmentData.growthRate * 2, 15);
    totalScore += investmentScore;
    
    // Goals score (max 10)
    const goalsScore = Math.min(goals.length * 3, 10);
    totalScore += goalsScore;
    
    // Normalize score to 0-100
    totalScore = Math.min(100, totalScore);
    
    return {
      totalScore,
      timestamp: new Date().toISOString()
    };
  };
  
  return calculateWellnessScore(userData);
}