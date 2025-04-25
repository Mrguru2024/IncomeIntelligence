/**
 * Gamified Savings Challenge Page
 * Provides UI for users to browse, select, and manage savings challenges
 */

// Implementing standalone functions instead of importing from savings-challenges.js

/**
 * Generate a new savings challenge
 * @param {Object} options - Challenge options
 * @returns {Object} - Challenge object
 */
function generateSavingsChallenge(options = {}) {
  const defaultOptions = {
    type: options.type || 'daily',
    duration: options.duration || 30,
    difficulty: options.difficulty || 'medium',
    category: options.category || 'general',
    targetAmount: options.targetAmount || 0
  };
  
  const challenges = {
    daily: [
      { name: 'Coffee Skip', description: 'Skip your daily coffee purchase', amount: 5 },
      { name: 'Lunch Saver', description: 'Bring lunch from home instead of eating out', amount: 12 },
      { name: 'No-Spend Day', description: 'Challenge yourself to spend nothing for a day', amount: 25 },
      { name: 'Commute Hack', description: 'Find a cheaper way to commute today', amount: 10 },
      { name: 'Digital Detox', description: 'Avoid online shopping for the day', amount: 15 }
    ],
    weekly: [
      { name: 'Grocery Budget', description: 'Reduce your grocery bill by 20% this week', amount: 30 },
      { name: 'Entertainment Cut', description: 'Skip one paid entertainment expense this week', amount: 25 },
      { name: 'Meal Prep Master', description: 'Prep all meals for the week to avoid takeout', amount: 60 },
      { name: 'Service Audit', description: 'Review and cut one subscription service', amount: 15 },
      { name: 'Side Hustle', description: 'Earn extra money through a side project', amount: 100 }
    ],
    monthly: [
      { name: 'Bill Negotiator', description: 'Call and negotiate a lower rate on one monthly bill', amount: 50 },
      { name: 'Automatic Saver', description: 'Set up an automatic transfer to savings', amount: 100 },
      { name: 'Declutter Sale', description: 'Sell unused items around your home', amount: 150 },
      { name: 'Dining Out Fast', description: 'Cook all meals at home for a month', amount: 300 },
      { name: 'Impulse Purchase Block', description: 'Implement a 48-hour rule before purchases', amount: 200 }
    ]
  };
  
  // Select challenge type
  const typeOptions = challenges[defaultOptions.type] || challenges.daily;
  
  // Adjust for difficulty
  let multiplier = 1;
  if (defaultOptions.difficulty === 'easy') multiplier = 0.7;
  if (defaultOptions.difficulty === 'hard') multiplier = 1.5;
  
  // Select a random challenge or use targetAmount if specified
  let challenge;
  if (defaultOptions.targetAmount > 0) {
    // Find challenge closest to target amount
    challenge = [...typeOptions].sort((a, b) => 
      Math.abs(a.amount - defaultOptions.targetAmount) - Math.abs(b.amount - defaultOptions.targetAmount)
    )[0];
  } else {
    challenge = typeOptions[Math.floor(Math.random() * typeOptions.length)];
  }
  
  // Create final challenge object
  return {
    id: `challenge-${Date.now()}`,
    name: challenge.name,
    description: challenge.description,
    type: defaultOptions.type,
    duration: defaultOptions.duration,
    difficulty: defaultOptions.difficulty,
    category: defaultOptions.category,
    amount: Math.round(challenge.amount * multiplier),
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + defaultOptions.duration * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
    completed: false,
    status: 'active'
  };
}

/**
 * Get available challenges for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - Array of available challenges
 */
async function getAvailableChallenges(userId) {
  // In a real app, this would fetch from a database or API
  return [
    {
      id: 'challenge-1',
      name: 'Coffee Skip',
      description: 'Skip your daily coffee purchase',
      type: 'daily',
      duration: 30,
      difficulty: 'easy',
      category: 'food',
      amount: 5,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 25,
      completed: false,
      status: 'active'
    },
    {
      id: 'challenge-2',
      name: 'Meal Prep Master',
      description: 'Prep all meals for the week to avoid takeout',
      type: 'weekly',
      duration: 4,
      difficulty: 'medium',
      category: 'food',
      amount: 60,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 25,
      completed: false,
      status: 'active'
    },
    {
      id: 'challenge-3',
      name: 'Bill Negotiator',
      description: 'Call and negotiate a lower rate on one monthly bill',
      type: 'once',
      duration: 1,
      difficulty: 'hard',
      category: 'bills',
      amount: 50,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 0,
      completed: false,
      status: 'not_started'
    }
  ];
}

/**
 * Update a challenge's progress or status
 * @param {number} userId - User ID
 * @param {string} challengeId - Challenge ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} - Updated challenge
 */
async function updateChallenge(userId, challengeId, updates) {
  console.log(`Updating challenge ${challengeId} for user ${userId} with:`, updates);
  return { ...updates, id: challengeId };
}

/**
 * Get challenge statistics for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Challenge statistics
 */
async function getChallengeStatistics(userId) {
  return {
    totalChallenges: 15,
    completedChallenges: 8,
    activeChallenges: 3,
    totalSaved: 520,
    streakDays: 14,
    achievementLevel: 3
  };
}

/**
 * Get recommended challenges for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - Array of recommended challenges
 */
async function getRecommendedChallenges(userId) {
  // In a real app, this would use an algorithm based on user behavior
  return [
    {
      id: 'rec-challenge-1',
      name: 'Subscription Audit',
      description: 'Review all your subscriptions and cancel unused ones',
      type: 'once',
      difficulty: 'medium',
      category: 'subscriptions',
      potentialSavings: 120
    },
    {
      id: 'rec-challenge-2',
      name: '30-Day No Eating Out',
      description: 'Cook all meals at home for a month',
      type: 'monthly',
      difficulty: 'hard',
      category: 'food',
      potentialSavings: 300
    }
  ];
}

/**
 * Calculate achievement level
 * @param {Object} stats - User statistics
 * @returns {number} - Achievement level
 */
function calculateAchievementLevel(stats) {
  const { completedChallenges, totalSaved, streakDays } = stats;
  
  // Simple algorithm that factors in different metrics
  const challengeScore = completedChallenges * 10;
  const savingsScore = totalSaved / 100;
  const streakScore = streakDays * 5;
  
  const totalScore = challengeScore + savingsScore + streakScore;
  
  // Map score to levels
  if (totalScore < 50) return 1;
  if (totalScore < 100) return 2;
  if (totalScore < 200) return 3;
  if (totalScore < 400) return 4;
  return 5;
}

/**
 * Generate leaderboard data
 * @returns {Promise<Array>} - Leaderboard data
 */
async function generateLeaderboard() {
  return [
    { rank: 1, username: 'SavingQueen', points: 1240, avatar: '👑' },
    { rank: 2, username: 'BudgetMaster', points: 980, avatar: '🌟' },
    { rank: 3, username: 'FrugalFox', points: 875, avatar: '🦊' },
    { rank: 4, username: 'WealthWizard', points: 720, avatar: '🧙' },
    { rank: 5, username: 'MoneyMaker', points: 650, avatar: '💰' }
  ];
}

/**
 * Fetch user data for challenges page
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} - User financial data
 */
async function fetchUserData(userId) {
  try {
    // Simulated API call to get user's financial data
    const challenges = await getAvailableChallenges(userId);
    const stats = await getChallengeStatistics(userId);
    const recommendations = await getRecommendedChallenges(userId);
    
    return {
      id: userId,
      challenges,
      stats,
      recommendations,
      preferences: {
        preferredCategories: ['food', 'entertainment', 'bills'],
        difficultyPreference: 'medium'
      }
    };
  } catch (error) {
    console.error('Error loading challenges data:', error);
    throw error;
  }
}

/**
 * Render the Savings Challenge page
 * @param {number} userId - The user ID
 * @returns {HTMLElement} - The rendered page element
 */
export async function renderChallengesPage(userId) {
  // Get viewport width for responsive design
  const width = window.innerWidth;
  const isMobile = width < 768;
  const isSmallMobile = width < 500;
  const isExtraSmallMobile = width < 350;
  
  // Create main container
  const container = document.createElement('div');
  container.className = 'challenges-page';
  container.style.maxWidth = '100%';
  container.style.margin = '0 auto';
  container.style.padding = isExtraSmallMobile ? '1rem' : isSmallMobile ? '1.5rem' : '2rem';
  container.style.fontFamily = 'Inter, system-ui, sans-serif';
  container.style.color = '#333';
  container.style.minHeight = '100vh';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'challenges-header';
  header.style.marginBottom = '1.5rem';
  
  const pageTitle = document.createElement('h1');
  pageTitle.textContent = 'Savings Challenges';
  pageTitle.style.fontSize = isSmallMobile ? '1.75rem' : '2rem';
  pageTitle.style.fontWeight = '700';
  pageTitle.style.marginBottom = '0.5rem';
  pageTitle.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 60%)';
  pageTitle.style.WebkitBackgroundClip = 'text';
  pageTitle.style.WebkitTextFillColor = 'transparent';
  pageTitle.style.backgroundClip = 'text';
  
  const pageDescription = document.createElement('p');
  pageDescription.textContent = 'Gamify your savings journey with fun challenges that help you reach your financial goals!';
  pageDescription.style.fontSize = isSmallMobile ? '0.9rem' : '1rem';
  pageDescription.style.color = '#666';
  pageDescription.style.maxWidth = '800px';
  
  header.appendChild(pageTitle);
  header.appendChild(pageDescription);
  
  // Create content section with loading indicator initially
  const contentSection = document.createElement('div');
  contentSection.className = 'challenges-content';
  
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
  loadingText.textContent = 'Loading your savings challenges...';
  
  // Add spinner animation if not already added
  if (!document.querySelector('style[data-spinner]')) {
    const styleSheet = document.createElement('style');
    styleSheet.setAttribute('data-spinner', 'true');
    styleSheet.textContent = `
      @keyframes spinner-rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
  }
  
  loadingIndicator.appendChild(spinner);
  loadingIndicator.appendChild(loadingText);
  contentSection.appendChild(loadingIndicator);
  
  // Load user data and challenges
  try {
    // Get user's financial data and existing challenges
    const userData = await fetchUserData(userId);
    
    // Hide loading indicator
    loadingIndicator.style.display = 'none';
    
    // Create tabs for different sections
    const tabsContainer = createTabsContainer();
    contentSection.appendChild(tabsContainer);
    
    // Create tab content container
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    tabContent.style.marginTop = '1.5rem';
    contentSection.appendChild(tabContent);
    
    // Create the different tabs
    const activeChallengesTab = createActiveChallengesSection(userData);
    const browseChallengesTab = createBrowseChallengesSection(userData);
    const achievementsTab = createAchievementsSection(userData);
    const leaderboardTab = createLeaderboardSection(userId);
    
    // Initially show active challenges tab
    tabContent.appendChild(activeChallengesTab);
    
    // Add event listeners to tabs
    const tabs = tabsContainer.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show appropriate tab content
        tabContent.innerHTML = '';
        const tabId = tab.dataset.tabId;
        
        switch (tabId) {
          case 'active':
            tabContent.appendChild(activeChallengesTab);
            break;
          case 'browse':
            tabContent.appendChild(browseChallengesTab);
            break;
          case 'achievements':
            tabContent.appendChild(achievementsTab);
            break;
          case 'leaderboard':
            tabContent.appendChild(leaderboardTab);
            break;
        }
      });
    });
  } catch (error) {
    console.error('Error loading challenges data:', error);
    
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
    errorMessage.textContent = 'Error loading challenges data. Please try again later.';
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
  
  // Assemble the page
  container.appendChild(header);
  container.appendChild(contentSection);
  
  return container;
}

/**
 * Create tabs container for navigation
 * @returns {HTMLElement} - The tabs container
 */
function createTabsContainer() {
  const container = document.createElement('div');
  container.className = 'tabs-container';
  container.style.display = 'flex';
  container.style.borderBottom = '1px solid #e2e8f0';
  container.style.overflowX = 'auto';
  container.style.scrollbarWidth = 'none'; // Hide scrollbar in Firefox
  container.style.msOverflowStyle = 'none'; // Hide scrollbar in IE
  container.style.paddingBottom = '2px';
  
  // Hide webkit scrollbar
  container.style.cssText += `
    &::-webkit-scrollbar {
      display: none;
    }
  `;
  
  // Create tabs
  const tabs = [
    { id: 'active', label: 'Active Challenges', icon: '🏆' },
    { id: 'browse', label: 'Browse Challenges', icon: '🔍' },
    { id: 'achievements', label: 'Achievements', icon: '✨' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏅' }
  ];
  
  tabs.forEach((tab, index) => {
    const tabElement = document.createElement('div');
    tabElement.className = 'tab';
    tabElement.dataset.tabId = tab.id;
    tabElement.style.padding = '0.75rem 1rem';
    tabElement.style.cursor = 'pointer';
    tabElement.style.fontWeight = '600';
    tabElement.style.whiteSpace = 'nowrap';
    tabElement.style.color = '#718096';
    tabElement.style.borderBottom = '2px solid transparent';
    tabElement.style.transition = 'all 0.2s ease';
    tabElement.style.display = 'flex';
    tabElement.style.alignItems = 'center';
    
    // First tab is active by default
    if (index === 0) {
      tabElement.classList.add('active');
      tabElement.style.color = 'var(--color-primary)';
      tabElement.style.borderBottomColor = 'var(--color-primary)';
    }
    
    // Tab hover effect
    tabElement.addEventListener('mouseover', () => {
      if (!tabElement.classList.contains('active')) {
        tabElement.style.color = 'var(--color-primary-light)';
      }
    });
    
    tabElement.addEventListener('mouseout', () => {
      if (!tabElement.classList.contains('active')) {
        tabElement.style.color = '#718096';
      }
    });
    
    // Icon
    const icon = document.createElement('span');
    icon.textContent = tab.icon;
    icon.style.marginRight = '0.5rem';
    icon.style.fontSize = '1.25rem';
    
    // Label
    const label = document.createElement('span');
    label.textContent = tab.label;
    
    tabElement.appendChild(icon);
    tabElement.appendChild(label);
    container.appendChild(tabElement);
  });
  
  return container;
}

/**
 * Create active challenges section
 * @param {Object} userData - User's data including challenges
 * @returns {HTMLElement} - The active challenges section
 */
function createActiveChallengesSection(userData) {
  const section = document.createElement('div');
  section.className = 'active-challenges-section';
  
  // Filter active challenges
  const activeChallenges = (userData.challenges || []).filter(challenge => 
    challenge.status === 'active'
  );
  
  // Create section for active challenges
  const activeChallengesContainer = document.createElement('div');
  activeChallengesContainer.className = 'active-challenges-container';
  activeChallengesContainer.style.marginBottom = '2rem';
  
  // If there are active challenges, display them
  if (activeChallenges.length > 0) {
    const activeHeader = document.createElement('h2');
    activeHeader.textContent = 'Your Active Challenges';
    activeHeader.style.fontSize = '1.5rem';
    activeHeader.style.fontWeight = '600';
    activeHeader.style.marginBottom = '1rem';
    
    activeChallengesContainer.appendChild(activeHeader);
    
    // Create grid for challenges
    const challengesGrid = document.createElement('div');
    challengesGrid.style.display = 'grid';
    challengesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    challengesGrid.style.gap = '1.5rem';
    
    // Add each active challenge
    activeChallenges.forEach(challenge => {
      const challengeCard = createChallengeCard(challenge, true, userData);
      challengesGrid.appendChild(challengeCard);
    });
    
    activeChallengesContainer.appendChild(challengesGrid);
  } else {
    // No active challenges message
    const emptyState = document.createElement('div');
    emptyState.style.textAlign = 'center';
    emptyState.style.padding = '3rem 1rem';
    emptyState.style.backgroundColor = '#f7fafc';
    emptyState.style.borderRadius = '8px';
    emptyState.style.marginBottom = '2rem';
    
    const emptyIcon = document.createElement('div');
    emptyIcon.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    `;
    emptyIcon.style.marginBottom = '1rem';
    
    const emptyTitle = document.createElement('h3');
    emptyTitle.textContent = 'No Active Challenges';
    emptyTitle.style.fontSize = '1.25rem';
    emptyTitle.style.fontWeight = '600';
    emptyTitle.style.marginBottom = '0.5rem';
    
    const emptyDescription = document.createElement('p');
    emptyDescription.textContent = 'Start a new savings challenge to kickstart your financial goals!';
    emptyDescription.style.color = '#718096';
    emptyDescription.style.marginBottom = '1.5rem';
    
    const browseButton = document.createElement('button');
    browseButton.textContent = 'Browse Challenges';
    browseButton.style.padding = '0.75rem 1.5rem';
    browseButton.style.backgroundColor = 'var(--color-primary)';
    browseButton.style.color = 'white';
    browseButton.style.border = 'none';
    browseButton.style.borderRadius = '8px';
    browseButton.style.fontWeight = '600';
    browseButton.style.cursor = 'pointer';
    
    browseButton.addEventListener('click', () => {
      // Activate the browse tab
      document.querySelector('.tab[data-tab-id="browse"]').click();
    });
    
    emptyState.appendChild(emptyIcon);
    emptyState.appendChild(emptyTitle);
    emptyState.appendChild(emptyDescription);
    emptyState.appendChild(browseButton);
    
    activeChallengesContainer.appendChild(emptyState);
  }
  
  section.appendChild(activeChallengesContainer);
  
  // Get savings statistics
  const statistics = getChallengeStatistics(userData.challenges || []);
  
  // Create statistics dashboard
  const statsDashboard = document.createElement('div');
  statsDashboard.className = 'stats-dashboard';
  statsDashboard.style.display = 'grid';
  statsDashboard.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
  statsDashboard.style.gap = '1rem';
  statsDashboard.style.marginBottom = '2rem';
  
  // Create stats cards
  const statsData = [
    { label: 'Total Saved', value: formatCurrency(statistics.totalSaved), icon: '💰' },
    { label: 'Challenges Completed', value: statistics.totalCompleted, icon: '🏆' },
    { label: 'Current Streak', value: `${statistics.currentStreak} days`, icon: '🔥' },
    { label: 'Points Earned', value: statistics.totalPoints, icon: '✨' }
  ];
  
  statsData.forEach(stat => {
    const statCard = document.createElement('div');
    statCard.className = 'stat-card';
    statCard.style.backgroundColor = 'white';
    statCard.style.border = '1px solid #e2e8f0';
    statCard.style.borderRadius = '8px';
    statCard.style.padding = '1.5rem';
    statCard.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    
    const statIcon = document.createElement('div');
    statIcon.textContent = stat.icon;
    statIcon.style.fontSize = '2rem';
    statIcon.style.marginBottom = '0.5rem';
    
    const statValue = document.createElement('div');
    statValue.textContent = stat.value;
    statValue.style.fontSize = '1.5rem';
    statValue.style.fontWeight = '700';
    statValue.style.marginBottom = '0.25rem';
    
    const statLabel = document.createElement('div');
    statLabel.textContent = stat.label;
    statLabel.style.fontSize = '0.875rem';
    statLabel.style.color = '#718096';
    
    statCard.appendChild(statIcon);
    statCard.appendChild(statValue);
    statCard.appendChild(statLabel);
    
    statsDashboard.appendChild(statCard);
  });
  
  section.appendChild(statsDashboard);
  
  // Create recommended challenges section
  const recommendedChallenges = getRecommendedChallenges(userData);
  
  if (recommendedChallenges.length > 0) {
    const recommendedHeader = document.createElement('h2');
    recommendedHeader.textContent = 'Recommended for You';
    recommendedHeader.style.fontSize = '1.5rem';
    recommendedHeader.style.fontWeight = '600';
    recommendedHeader.style.marginBottom = '1rem';
    
    const recommendedDescription = document.createElement('p');
    recommendedDescription.textContent = 'Based on your financial profile and past challenges, we recommend these savings challenges:';
    recommendedDescription.style.color = '#718096';
    recommendedDescription.style.marginBottom = '1.5rem';
    
    section.appendChild(recommendedHeader);
    section.appendChild(recommendedDescription);
    
    // Create grid for recommended challenges
    const recommendedGrid = document.createElement('div');
    recommendedGrid.style.display = 'grid';
    recommendedGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    recommendedGrid.style.gap = '1.5rem';
    
    // Add each recommended challenge
    recommendedChallenges.forEach(challenge => {
      const challengeCard = createRecommendedChallengeCard(challenge, userData);
      recommendedGrid.appendChild(challengeCard);
    });
    
    section.appendChild(recommendedGrid);
  }
  
  return section;
}

/**
 * Create browse challenges section
 * @param {Object} userData - User's data including challenges
 * @returns {HTMLElement} - The browse challenges section
 */
function createBrowseChallengesSection(userData) {
  const section = document.createElement('div');
  section.className = 'browse-challenges-section';
  
  // Get available challenges
  const availableChallenges = getAvailableChallenges(userData);
  
  // Create filters section
  const filtersSection = document.createElement('div');
  filtersSection.className = 'filters-section';
  filtersSection.style.marginBottom = '2rem';
  filtersSection.style.display = 'flex';
  filtersSection.style.flexWrap = 'wrap';
  filtersSection.style.alignItems = 'center';
  filtersSection.style.gap = '1rem';
  
  // Create search input
  const searchContainer = document.createElement('div');
  searchContainer.style.flex = '1';
  searchContainer.style.minWidth = '250px';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search challenges...';
  searchInput.style.width = '100%';
  searchInput.style.padding = '0.75rem 1rem';
  searchInput.style.border = '1px solid #e2e8f0';
  searchInput.style.borderRadius = '8px';
  searchInput.style.fontSize = '1rem';
  
  searchContainer.appendChild(searchInput);
  
  // Create filter dropdowns
  const difficultyFilter = document.createElement('select');
  difficultyFilter.style.padding = '0.75rem 1rem';
  difficultyFilter.style.border = '1px solid #e2e8f0';
  difficultyFilter.style.borderRadius = '8px';
  difficultyFilter.style.backgroundColor = 'white';
  difficultyFilter.style.fontSize = '1rem';
  
  const difficultyOptions = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];
  
  difficultyOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    difficultyFilter.appendChild(optionElement);
  });
  
  // Create sort dropdown
  const sortFilter = document.createElement('select');
  sortFilter.style.padding = '0.75rem 1rem';
  sortFilter.style.border = '1px solid #e2e8f0';
  sortFilter.style.borderRadius = '8px';
  sortFilter.style.backgroundColor = 'white';
  sortFilter.style.fontSize = '1rem';
  
  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'duration-asc', label: 'Duration (Short to Long)' },
    { value: 'duration-desc', label: 'Duration (Long to Short)' },
    { value: 'amount-asc', label: 'Amount (Low to High)' },
    { value: 'amount-desc', label: 'Amount (High to Low)' }
  ];
  
  sortOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    sortFilter.appendChild(optionElement);
  });
  
  filtersSection.appendChild(searchContainer);
  filtersSection.appendChild(difficultyFilter);
  filtersSection.appendChild(sortFilter);
  
  // Create challenges grid
  const challengesGrid = document.createElement('div');
  challengesGrid.className = 'challenges-grid';
  challengesGrid.style.display = 'grid';
  challengesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  challengesGrid.style.gap = '1.5rem';
  
  // Function to render challenges based on filters
  function renderChallenges() {
    // Clear existing challenges
    challengesGrid.innerHTML = '';
    
    // Get filter values
    const searchTerm = searchInput.value.toLowerCase();
    const difficulty = difficultyFilter.value;
    const sort = sortFilter.value;
    
    // Filter challenges
    let filteredChallenges = availableChallenges.filter(challenge => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        challenge.name.toLowerCase().includes(searchTerm) || 
        challenge.description.toLowerCase().includes(searchTerm);
      
      // Difficulty filter
      const matchesDifficulty = difficulty === 'all' || challenge.difficulty === difficulty;
      
      return matchesSearch && matchesDifficulty;
    });
    
    // Sort challenges
    switch (sort) {
      case 'duration-asc':
        filteredChallenges.sort((a, b) => a.duration - b.duration);
        break;
      case 'duration-desc':
        filteredChallenges.sort((a, b) => b.duration - a.duration);
        break;
      case 'amount-asc':
        filteredChallenges.sort((a, b) => a.targetAmount - b.targetAmount);
        break;
      case 'amount-desc':
        filteredChallenges.sort((a, b) => b.targetAmount - a.targetAmount);
        break;
      // For recommended, we'll use the original order
    }
    
    // Add challenge cards to grid
    filteredChallenges.forEach(challenge => {
      const challengeCard = createBrowseChallengeCard(challenge, userData);
      challengesGrid.appendChild(challengeCard);
    });
    
    // Show empty state if no challenges match filters
    if (filteredChallenges.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.style.gridColumn = '1 / -1'; // Span all columns
      emptyState.style.textAlign = 'center';
      emptyState.style.padding = '3rem 1rem';
      emptyState.style.backgroundColor = '#f7fafc';
      emptyState.style.borderRadius = '8px';
      
      const emptyIcon = document.createElement('div');
      emptyIcon.innerHTML = `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      `;
      emptyIcon.style.marginBottom = '1rem';
      
      const emptyText = document.createElement('p');
      emptyText.textContent = 'No challenges match your filters. Try adjusting your search criteria.';
      emptyText.style.color = '#718096';
      
      emptyState.appendChild(emptyIcon);
      emptyState.appendChild(emptyText);
      
      challengesGrid.appendChild(emptyState);
    }
  }
  
  // Add event listeners to filters
  searchInput.addEventListener('input', renderChallenges);
  difficultyFilter.addEventListener('change', renderChallenges);
  sortFilter.addEventListener('change', renderChallenges);
  
  // Initial render
  renderChallenges();
  
  section.appendChild(filtersSection);
  section.appendChild(challengesGrid);
  
  // Create design your own challenge section
  const customSection = document.createElement('div');
  customSection.className = 'custom-challenge-section';
  customSection.style.marginTop = '3rem';
  customSection.style.padding = '2rem';
  customSection.style.backgroundColor = '#f7fafc';
  customSection.style.borderRadius = '12px';
  customSection.style.textAlign = 'center';
  
  const customTitle = document.createElement('h2');
  customTitle.textContent = 'Want a Custom Challenge?';
  customTitle.style.fontSize = '1.5rem';
  customTitle.style.fontWeight = '600';
  customTitle.style.marginBottom = '1rem';
  
  const customDescription = document.createElement('p');
  customDescription.textContent = 'Create a personalized savings challenge that fits your specific goals and preferences.';
  customDescription.style.color = '#718096';
  customDescription.style.marginBottom = '1.5rem';
  customDescription.style.maxWidth = '600px';
  customDescription.style.margin = '0 auto 1.5rem';
  
  const customButton = document.createElement('button');
  customButton.textContent = 'Design Your Own Challenge';
  customButton.style.padding = '0.75rem 1.5rem';
  customButton.style.backgroundColor = 'var(--color-primary)';
  customButton.style.color = 'white';
  customButton.style.border = 'none';
  customButton.style.borderRadius = '8px';
  customButton.style.fontWeight = '600';
  customButton.style.cursor = 'pointer';
  
  customButton.addEventListener('click', () => {
    // Show custom challenge modal
    showCustomChallengeModal(userData);
  });
  
  customSection.appendChild(customTitle);
  customSection.appendChild(customDescription);
  customSection.appendChild(customButton);
  
  section.appendChild(customSection);
  
  return section;
}

/**
 * Create achievements section
 * @param {Object} userData - User's data including challenges
 * @returns {HTMLElement} - The achievements section
 */
function createAchievementsSection(userData) {
  const section = document.createElement('div');
  section.className = 'achievements-section';
  
  // Get user's challenges and calculate statistics
  const challenges = userData.challenges || [];
  const completedChallenges = challenges.filter(c => c.status === 'completed');
  const statistics = getChallengeStatistics(challenges);
  const achievementLevel = calculateAchievementLevel(completedChallenges);
  
  // Create achievement level card
  const levelCard = document.createElement('div');
  levelCard.className = 'level-card';
  levelCard.style.backgroundColor = 'white';
  levelCard.style.border = '1px solid #e2e8f0';
  levelCard.style.borderRadius = '12px';
  levelCard.style.padding = '2rem';
  levelCard.style.marginBottom = '2rem';
  levelCard.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  levelCard.style.display = 'flex';
  levelCard.style.flexDirection = window.innerWidth < 768 ? 'column' : 'row';
  levelCard.style.alignItems = 'center';
  levelCard.style.gap = '2rem';
  
  // Level icon and info
  const levelInfo = document.createElement('div');
  levelInfo.style.textAlign = 'center';
  levelInfo.style.flex = '1';
  
  const levelIcon = document.createElement('div');
  levelIcon.textContent = achievementLevel.icon;
  levelIcon.style.fontSize = '4rem';
  levelIcon.style.marginBottom = '0.5rem';
  
  const levelName = document.createElement('h2');
  levelName.textContent = achievementLevel.level;
  levelName.style.fontSize = '2rem';
  levelName.style.fontWeight = '700';
  levelName.style.marginBottom = '0.5rem';
  
  const levelSubtitle = document.createElement('p');
  levelSubtitle.textContent = `${achievementLevel.challengesCompleted} challenges completed`;
  levelSubtitle.style.color = '#718096';
  levelSubtitle.style.marginBottom = '1rem';
  
  const pointsDisplay = document.createElement('div');
  pointsDisplay.textContent = `${achievementLevel.totalPoints} points`;
  pointsDisplay.style.fontWeight = '600';
  pointsDisplay.style.color = 'var(--color-primary)';
  
  levelInfo.appendChild(levelIcon);
  levelInfo.appendChild(levelName);
  levelInfo.appendChild(levelSubtitle);
  levelInfo.appendChild(pointsDisplay);
  
  // Progress to next level
  const progressContainer = document.createElement('div');
  progressContainer.style.flex = '2';
  
  if (achievementLevel.nextLevel) {
    const nextLevelTitle = document.createElement('div');
    nextLevelTitle.textContent = `Next Level: ${achievementLevel.nextLevel}`;
    nextLevelTitle.style.fontWeight = '600';
    nextLevelTitle.style.marginBottom = '0.5rem';
    
    const progressOuter = document.createElement('div');
    progressOuter.style.height = '12px';
    progressOuter.style.backgroundColor = '#e2e8f0';
    progressOuter.style.borderRadius = '6px';
    progressOuter.style.overflow = 'hidden';
    progressOuter.style.marginBottom = '0.5rem';
    
    const progressInner = document.createElement('div');
    progressInner.style.height = '100%';
    progressInner.style.width = `${achievementLevel.progressToNextLevel}%`;
    progressInner.style.backgroundColor = 'var(--color-primary)';
    progressInner.style.borderRadius = '6px';
    
    const progressText = document.createElement('div');
    progressText.textContent = `${achievementLevel.progressToNextLevel}% complete • ${achievementLevel.requiredForNextLevel} more challenge${achievementLevel.requiredForNextLevel !== 1 ? 's' : ''} to reach ${achievementLevel.nextLevel}`;
    progressText.style.fontSize = '0.875rem';
    progressText.style.color = '#718096';
    
    progressOuter.appendChild(progressInner);
    
    progressContainer.appendChild(nextLevelTitle);
    progressContainer.appendChild(progressOuter);
    progressContainer.appendChild(progressText);
  } else {
    const maxLevelMessage = document.createElement('div');
    maxLevelMessage.textContent = 'Congratulations! You\'ve reached the highest achievement level!';
    maxLevelMessage.style.fontWeight = '600';
    maxLevelMessage.style.color = 'var(--color-primary)';
    
    progressContainer.appendChild(maxLevelMessage);
  }
  
  // Bonus info
  const bonusInfo = document.createElement('div');
  bonusInfo.style.backgroundColor = '#f7fafc';
  bonusInfo.style.padding = '1rem';
  bonusInfo.style.borderRadius = '8px';
  bonusInfo.style.marginTop = '1rem';
  
  const bonusTitle = document.createElement('div');
  bonusTitle.textContent = `${achievementLevel.level} Bonus: ${(achievementLevel.bonusMultiplier - 1) * 100}% Extra Points`;
  bonusTitle.style.fontWeight = '600';
  bonusTitle.style.marginBottom = '0.5rem';
  
  const bonusDescription = document.createElement('div');
  bonusDescription.textContent = 'This bonus is applied to all new challenge completions!';
  bonusDescription.style.fontSize = '0.875rem';
  bonusDescription.style.color = '#718096';
  
  bonusInfo.appendChild(bonusTitle);
  bonusInfo.appendChild(bonusDescription);
  
  progressContainer.appendChild(bonusInfo);
  
  levelCard.appendChild(levelInfo);
  levelCard.appendChild(progressContainer);
  
  section.appendChild(levelCard);
  
  // Create badges section
  const badgesSection = document.createElement('div');
  badgesSection.className = 'badges-section';
  badgesSection.style.marginBottom = '2rem';
  
  const badgesTitle = document.createElement('h2');
  badgesTitle.textContent = 'Your Badges';
  badgesTitle.style.fontSize = '1.5rem';
  badgesTitle.style.fontWeight = '600';
  badgesTitle.style.marginBottom = '1rem';
  
  const badgesGrid = document.createElement('div');
  badgesGrid.style.display = 'grid';
  badgesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
  badgesGrid.style.gap = '1.5rem';
  
  if (statistics.badges.length > 0) {
    statistics.badges.forEach(badge => {
      const badgeCard = document.createElement('div');
      badgeCard.className = 'badge-card';
      badgeCard.style.backgroundColor = 'white';
      badgeCard.style.border = '1px solid #e2e8f0';
      badgeCard.style.borderRadius = '8px';
      badgeCard.style.padding = '1.5rem';
      badgeCard.style.textAlign = 'center';
      badgeCard.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      
      const badgeIcon = document.createElement('div');
      badgeIcon.textContent = badge.icon;
      badgeIcon.style.fontSize = '2.5rem';
      badgeIcon.style.marginBottom = '0.75rem';
      
      const badgeName = document.createElement('div');
      badgeName.textContent = badge.name;
      badgeName.style.fontWeight = '600';
      badgeName.style.marginBottom = '0.25rem';
      
      const badgeDescription = document.createElement('div');
      badgeDescription.textContent = badge.description;
      badgeDescription.style.fontSize = '0.75rem';
      badgeDescription.style.color = '#718096';
      badgeDescription.style.marginBottom = '0.5rem';
      
      const badgeDate = document.createElement('div');
      const date = new Date(badge.date);
      badgeDate.textContent = date.toLocaleDateString();
      badgeDate.style.fontSize = '0.75rem';
      badgeDate.style.color = '#a0aec0';
      
      badgeCard.appendChild(badgeIcon);
      badgeCard.appendChild(badgeName);
      badgeCard.appendChild(badgeDescription);
      badgeCard.appendChild(badgeDate);
      
      badgesGrid.appendChild(badgeCard);
    });
  } else {
    const emptyBadges = document.createElement('div');
    emptyBadges.style.gridColumn = '1 / -1';
    emptyBadges.style.textAlign = 'center';
    emptyBadges.style.padding = '3rem 1rem';
    emptyBadges.style.backgroundColor = '#f7fafc';
    emptyBadges.style.borderRadius = '8px';
    
    const emptyIcon = document.createElement('div');
    emptyIcon.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    `;
    emptyIcon.style.marginBottom = '1rem';
    
    const emptyText = document.createElement('p');
    emptyText.textContent = 'No badges earned yet. Complete challenges to earn badges!';
    emptyText.style.color = '#718096';
    
    emptyBadges.appendChild(emptyIcon);
    emptyBadges.appendChild(emptyText);
    
    badgesGrid.appendChild(emptyBadges);
  }
  
  badgesSection.appendChild(badgesTitle);
  badgesSection.appendChild(badgesGrid);
  
  section.appendChild(badgesSection);
  
  // Create challenge history section
  const historySection = document.createElement('div');
  historySection.className = 'history-section';
  
  const historyTitle = document.createElement('h2');
  historyTitle.textContent = 'Challenge History';
  historyTitle.style.fontSize = '1.5rem';
  historyTitle.style.fontWeight = '600';
  historyTitle.style.marginBottom = '1rem';
  
  const historyList = document.createElement('div');
  historyList.style.display = 'flex';
  historyList.style.flexDirection = 'column';
  historyList.style.gap = '1rem';
  
  if (completedChallenges.length > 0) {
    // Sort completed challenges by completion date
    const sortedChallenges = [...completedChallenges].sort((a, b) => {
      return new Date(b.completedDate || 0) - new Date(a.completedDate || 0);
    });
    
    sortedChallenges.forEach(challenge => {
      const historyItem = document.createElement('div');
      historyItem.style.display = 'flex';
      historyItem.style.alignItems = 'center';
      historyItem.style.padding = '1rem';
      historyItem.style.backgroundColor = 'white';
      historyItem.style.border = '1px solid #e2e8f0';
      historyItem.style.borderRadius = '8px';
      historyItem.style.gap = '1rem';
      
      const statusIcon = document.createElement('div');
      statusIcon.textContent = '✅';
      statusIcon.style.fontSize = '1.5rem';
      
      const challengeInfo = document.createElement('div');
      challengeInfo.style.flex = '1';
      
      const challengeName = document.createElement('div');
      challengeName.textContent = challenge.name;
      challengeName.style.fontWeight = '600';
      
      const challengeDescription = document.createElement('div');
      challengeDescription.textContent = `Saved ${formatCurrency(challenge.currentAmount)} • ${formatDateRange(challenge.startDate, challenge.completedDate || challenge.endDate)}`;
      challengeDescription.style.fontSize = '0.875rem';
      challengeDescription.style.color = '#718096';
      
      challengeInfo.appendChild(challengeName);
      challengeInfo.appendChild(challengeDescription);
      
      const amount = document.createElement('div');
      amount.textContent = challenge.currentAmount ? formatCurrency(challenge.currentAmount) : '$0';
      amount.style.fontWeight = '600';
      amount.style.color = 'var(--color-primary)';
      
      historyItem.appendChild(statusIcon);
      historyItem.appendChild(challengeInfo);
      historyItem.appendChild(amount);
      
      historyList.appendChild(historyItem);
    });
  } else {
    const emptyHistory = document.createElement('div');
    emptyHistory.style.textAlign = 'center';
    emptyHistory.style.padding = '3rem 1rem';
    emptyHistory.style.backgroundColor = '#f7fafc';
    emptyHistory.style.borderRadius = '8px';
    
    const emptyIcon = document.createElement('div');
    emptyIcon.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    `;
    emptyIcon.style.marginBottom = '1rem';
    
    const emptyText = document.createElement('p');
    emptyText.textContent = 'No completed challenges yet. Start a challenge to see your history!';
    emptyText.style.color = '#718096';
    
    emptyHistory.appendChild(emptyIcon);
    emptyHistory.appendChild(emptyText);
    
    historyList.appendChild(emptyHistory);
  }
  
  historySection.appendChild(historyTitle);
  historySection.appendChild(historyList);
  
  section.appendChild(historySection);
  
  return section;
}

/**
 * Create leaderboard section
 * @param {number} userId - Current user's ID
 * @returns {HTMLElement} - The leaderboard section
 */
function createLeaderboardSection(userId) {
  const section = document.createElement('div');
  section.className = 'leaderboard-section';
  
  // Create period tabs
  const periodTabs = document.createElement('div');
  periodTabs.className = 'period-tabs';
  periodTabs.style.display = 'flex';
  periodTabs.style.marginBottom = '1.5rem';
  periodTabs.style.borderBottom = '1px solid #e2e8f0';
  
  const periods = [
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
    { id: 'allTime', label: 'All Time' }
  ];
  
  periods.forEach((period, index) => {
    const tab = document.createElement('div');
    tab.dataset.periodId = period.id;
    tab.textContent = period.label;
    tab.style.padding = '0.75rem 1.5rem';
    tab.style.cursor = 'pointer';
    tab.style.borderBottom = '2px solid transparent';
    
    // First tab is active by default
    if (index === 0) {
      tab.style.borderBottomColor = 'var(--color-primary)';
      tab.style.color = 'var(--color-primary)';
      tab.style.fontWeight = '600';
    }
    
    tab.addEventListener('click', () => {
      // Remove active styles from all tabs
      periodTabs.querySelectorAll('div').forEach(t => {
        t.style.borderBottomColor = 'transparent';
        t.style.color = '#718096';
        t.style.fontWeight = '400';
      });
      
      // Add active styles to current tab
      tab.style.borderBottomColor = 'var(--color-primary)';
      tab.style.color = 'var(--color-primary)';
      tab.style.fontWeight = '600';
      
      // Update leaderboard
      updateLeaderboard(period.id);
    });
    
    periodTabs.appendChild(tab);
  });
  
  section.appendChild(periodTabs);
  
  // Create leaderboard container
  const leaderboardContainer = document.createElement('div');
  leaderboardContainer.className = 'leaderboard-container';
  
  // Function to fetch and update leaderboard
  async function updateLeaderboard(period) {
    // Create loading state
    leaderboardContainer.innerHTML = '';
    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.style.display = 'flex';
    loadingIndicator.style.justifyContent = 'center';
    loadingIndicator.style.padding = '2rem';
    
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.width = '40px';
    spinner.style.height = '40px';
    spinner.style.borderRadius = '50%';
    spinner.style.border = '4px solid rgba(66, 153, 225, 0.3)';
    spinner.style.borderTopColor = '#4299e1';
    spinner.style.animation = 'spinner-rotate 1s linear infinite';
    
    loadingIndicator.appendChild(spinner);
    leaderboardContainer.appendChild(loadingIndicator);
    
    try {
      // Fetch leaderboard data from API
      // For demo, we'll use mock data with an artificial delay
      const users = await fetchLeaderboardData(period);
      
      // Clear loading indicator
      leaderboardContainer.innerHTML = '';
      
      // Create table for top users
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      
      // Create table header
      const thead = document.createElement('thead');
      thead.style.backgroundColor = '#f7fafc';
      
      const headerRow = document.createElement('tr');
      
      const headers = [
        { width: '10%', label: 'Rank' },
        { width: '40%', label: 'User' },
        { width: '15%', label: 'Level' },
        { width: '15%', label: 'Points' },
        { width: '20%', label: 'Saved' }
      ];
      
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.label;
        th.style.padding = '0.75rem 1rem';
        th.style.textAlign = 'left';
        th.style.fontWeight = '600';
        th.style.color = '#4a5568';
        th.style.width = header.width;
        
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create table body
      const tbody = document.createElement('tbody');
      
      users.forEach((user, index) => {
        const row = document.createElement('tr');
        
        // Highlight the current user
        if (user.userId === userId) {
          row.style.backgroundColor = 'rgba(66, 153, 225, 0.1)';
        }
        
        // Add border between rows
        row.style.borderBottom = '1px solid #e2e8f0';
        
        // Rank cell
        const rankCell = document.createElement('td');
        rankCell.style.padding = '1rem';
        
        const rankBadge = document.createElement('div');
        rankBadge.style.display = 'inline-flex';
        rankBadge.style.alignItems = 'center';
        rankBadge.style.justifyContent = 'center';
        rankBadge.style.width = '30px';
        rankBadge.style.height = '30px';
        rankBadge.style.borderRadius = '50%';
        rankBadge.style.fontWeight = '600';
        
        // Special styling for top 3
        if (index === 0) {
          rankBadge.style.backgroundColor = '#faf089';
          rankBadge.style.color = '#975a16';
          rankBadge.textContent = '1';
        } else if (index === 1) {
          rankBadge.style.backgroundColor = '#e2e8f0';
          rankBadge.style.color = '#4a5568';
          rankBadge.textContent = '2';
        } else if (index === 2) {
          rankBadge.style.backgroundColor = '#ed8936';
          rankBadge.style.color = '#7b341e';
          rankBadge.textContent = '3';
        } else {
          rankBadge.textContent = (index + 1).toString();
        }
        
        rankCell.appendChild(rankBadge);
        
        // User cell
        const userCell = document.createElement('td');
        userCell.style.padding = '1rem';
        
        const userContainer = document.createElement('div');
        userContainer.style.display = 'flex';
        userContainer.style.alignItems = 'center';
        userContainer.style.gap = '0.75rem';
        
        const avatar = document.createElement('div');
        avatar.style.width = '36px';
        avatar.style.height = '36px';
        avatar.style.backgroundColor = 'var(--color-primary-light)';
        avatar.style.borderRadius = '50%';
        avatar.style.display = 'flex';
        avatar.style.alignItems = 'center';
        avatar.style.justifyContent = 'center';
        avatar.style.color = 'var(--color-primary)';
        avatar.style.fontWeight = '600';
        avatar.textContent = user.name.charAt(0).toUpperCase();
        
        const userName = document.createElement('div');
        userName.style.fontWeight = '600';
        userName.textContent = user.name;
        
        userContainer.appendChild(avatar);
        userContainer.appendChild(userName);
        
        userCell.appendChild(userContainer);
        
        // Level cell
        const levelCell = document.createElement('td');
        levelCell.style.padding = '1rem';
        
        const levelContainer = document.createElement('div');
        levelContainer.style.display = 'flex';
        levelContainer.style.alignItems = 'center';
        levelContainer.style.gap = '0.5rem';
        
        const levelIcon = document.createElement('span');
        levelIcon.textContent = user.achievementIcon;
        
        const levelText = document.createElement('span');
        levelText.textContent = user.achievementLevel;
        
        levelContainer.appendChild(levelIcon);
        levelContainer.appendChild(levelText);
        
        levelCell.appendChild(levelContainer);
        
        // Points cell
        const pointsCell = document.createElement('td');
        pointsCell.style.padding = '1rem';
        pointsCell.style.fontWeight = '600';
        pointsCell.textContent = user.points.toLocaleString();
        
        // Saved cell
        const savedCell = document.createElement('td');
        savedCell.style.padding = '1rem';
        savedCell.style.fontWeight = '600';
        savedCell.style.color = 'var(--color-primary)';
        savedCell.textContent = formatCurrency(user.totalSaved);
        
        // Add cells to row
        row.appendChild(rankCell);
        row.appendChild(userCell);
        row.appendChild(levelCell);
        row.appendChild(pointsCell);
        row.appendChild(savedCell);
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      leaderboardContainer.appendChild(table);
      
      // Add "Your Position" section if user not in top 10
      const currentUserInTop = users.some(user => user.userId === userId);
      
      if (!currentUserInTop) {
        const yourPositionSection = document.createElement('div');
        yourPositionSection.style.marginTop = '2rem';
        yourPositionSection.style.padding = '1rem';
        yourPositionSection.style.backgroundColor = 'rgba(66, 153, 225, 0.1)';
        yourPositionSection.style.borderRadius = '8px';
        
        const yourPositionTitle = document.createElement('div');
        yourPositionTitle.textContent = 'Your Position';
        yourPositionTitle.style.fontWeight = '600';
        yourPositionTitle.style.marginBottom = '0.5rem';
        
        // Find user in full leaderboard (simulated)
        const position = Math.floor(Math.random() * 20) + 11; // Random position outside top 10
        
        const positionInfo = document.createElement('div');
        positionInfo.style.display = 'flex';
        positionInfo.style.alignItems = 'center';
        positionInfo.style.justifyContent = 'space-between';
        
        const rankInfo = document.createElement('div');
        rankInfo.style.display = 'flex';
        rankInfo.style.alignItems = 'center';
        rankInfo.style.gap = '0.75rem';
        
        const rankBadge = document.createElement('div');
        rankBadge.style.display = 'inline-flex';
        rankBadge.style.alignItems = 'center';
        rankBadge.style.justifyContent = 'center';
        rankBadge.style.width = '30px';
        rankBadge.style.height = '30px';
        rankBadge.style.borderRadius = '50%';
        rankBadge.textContent = position.toString();
        
        const userName = document.createElement('div');
        userName.style.fontWeight = '600';
        userName.textContent = 'You';
        
        rankInfo.appendChild(rankBadge);
        rankInfo.appendChild(userName);
        
        const pointsInfo = document.createElement('div');
        pointsInfo.textContent = '350 points';
        pointsInfo.style.fontWeight = '600';
        
        positionInfo.appendChild(rankInfo);
        positionInfo.appendChild(pointsInfo);
        
        yourPositionSection.appendChild(yourPositionTitle);
        yourPositionSection.appendChild(positionInfo);
        
        leaderboardContainer.appendChild(yourPositionSection);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      
      // Show error message
      leaderboardContainer.innerHTML = '';
      
      const errorMessage = document.createElement('div');
      errorMessage.style.textAlign = 'center';
      errorMessage.style.padding = '2rem';
      errorMessage.style.color = '#e53e3e';
      errorMessage.textContent = 'Failed to load leaderboard. Please try again later.';
      
      leaderboardContainer.appendChild(errorMessage);
    }
  }
  
  section.appendChild(leaderboardContainer);
  
  // Initial update
  updateLeaderboard('weekly');
  
  return section;
}

/**
 * Create a challenge card for active challenges
 * @param {Object} challenge - Challenge data
 * @param {boolean} isActive - Whether this is an active challenge
 * @param {Object} userData - User data for updating the challenge
 * @returns {HTMLElement} - Challenge card element
 */
function createChallengeCard(challenge, isActive, userData) {
  const card = document.createElement('div');
  card.className = 'challenge-card';
  card.style.backgroundColor = 'white';
  card.style.border = '1px solid #e2e8f0';
  card.style.borderRadius = '12px';
  card.style.overflow = 'hidden';
  card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  
  // Get theme colors
  const themeColors = challenge.theme.colors;
  
  // Create header
  const header = document.createElement('div');
  header.style.backgroundColor = themeColors.primary;
  header.style.padding = '1.5rem';
  header.style.color = 'white';
  
  const title = document.createElement('h3');
  title.textContent = challenge.name;
  title.style.fontSize = '1.25rem';
  title.style.fontWeight = '700';
  title.style.marginBottom = '0.5rem';
  
  const description = document.createElement('p');
  description.textContent = challenge.description;
  description.style.fontSize = '0.875rem';
  description.style.opacity = '0.9';
  
  header.appendChild(title);
  header.appendChild(description);
  
  // Create body
  const body = document.createElement('div');
  body.style.padding = '1.5rem';
  
  // Progress section
  const progressSection = document.createElement('div');
  progressSection.style.marginBottom = '1.5rem';
  
  const progressLabel = document.createElement('div');
  progressLabel.style.display = 'flex';
  progressLabel.style.justifyContent = 'space-between';
  progressLabel.style.marginBottom = '0.5rem';
  
  const progressText = document.createElement('div');
  progressText.textContent = `Progress: ${challenge.progress}%`;
  progressText.style.fontWeight = '600';
  
  const amountText = document.createElement('div');
  amountText.textContent = `${formatCurrency(challenge.currentAmount)} / ${formatCurrency(challenge.targetAmount)}`;
  
  progressLabel.appendChild(progressText);
  progressLabel.appendChild(amountText);
  
  const progressBar = document.createElement('div');
  progressBar.style.height = '10px';
  progressBar.style.backgroundColor = '#e2e8f0';
  progressBar.style.borderRadius = '5px';
  progressBar.style.overflow = 'hidden';
  
  const progressFill = document.createElement('div');
  progressFill.style.height = '100%';
  progressFill.style.width = `${challenge.progress}%`;
  progressFill.style.backgroundColor = themeColors.primary;
  progressFill.style.borderRadius = '5px';
  
  progressBar.appendChild(progressFill);
  
  progressSection.appendChild(progressLabel);
  progressSection.appendChild(progressBar);
  
  // Challenge info section
  const infoSection = document.createElement('div');
  infoSection.style.display = 'grid';
  infoSection.style.gridTemplateColumns = '1fr 1fr';
  infoSection.style.gap = '1rem';
  infoSection.style.marginBottom = '1.5rem';
  
  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
  
  const infoItems = [
    { label: 'Started', value: formatDate(challenge.startDate) },
    { label: 'Ends', value: formatDate(challenge.endDate) },
    { label: 'Days Left', value: daysLeft },
    { label: 'Streak', value: `${challenge.streakCount || 0} days` }
  ];
  
  infoItems.forEach(item => {
    const infoItem = document.createElement('div');
    
    const infoLabel = document.createElement('div');
    infoLabel.textContent = item.label;
    infoLabel.style.fontSize = '0.75rem';
    infoLabel.style.color = '#718096';
    infoLabel.style.marginBottom = '0.25rem';
    
    const infoValue = document.createElement('div');
    infoValue.textContent = item.value;
    infoValue.style.fontWeight = '600';
    
    infoItem.appendChild(infoLabel);
    infoItem.appendChild(infoValue);
    
    infoSection.appendChild(infoItem);
  });
  
  // Current milestone
  let currentMilestone = null;
  for (let i = challenge.milestones.length - 1; i >= 0; i--) {
    if (!challenge.milestones[i].achieved) {
      currentMilestone = challenge.milestones[i];
      break;
    }
  }
  
  if (currentMilestone) {
    const milestoneSection = document.createElement('div');
    milestoneSection.style.marginBottom = '1.5rem';
    milestoneSection.style.padding = '1rem';
    milestoneSection.style.backgroundColor = '#f7fafc';
    milestoneSection.style.borderRadius = '8px';
    
    const milestoneHeader = document.createElement('div');
    milestoneHeader.style.display = 'flex';
    milestoneHeader.style.alignItems = 'center';
    milestoneHeader.style.gap = '0.5rem';
    milestoneHeader.style.marginBottom = '0.5rem';
    
    const milestoneIcon = document.createElement('span');
    milestoneIcon.textContent = currentMilestone.icon;
    
    const milestoneTitle = document.createElement('div');
    milestoneTitle.textContent = 'Next Milestone';
    milestoneTitle.style.fontWeight = '600';
    
    milestoneHeader.appendChild(milestoneIcon);
    milestoneHeader.appendChild(milestoneTitle);
    
    const milestoneInfo = document.createElement('div');
    milestoneInfo.textContent = `${currentMilestone.name}: ${formatCurrency(currentMilestone.amount)}`;
    milestoneInfo.style.fontSize = '0.875rem';
    
    milestoneSection.appendChild(milestoneHeader);
    milestoneSection.appendChild(milestoneInfo);
    
    body.appendChild(milestoneSection);
  }
  
  // Action section
  const actionSection = document.createElement('div');
  
  if (isActive) {
    const addFundsButton = document.createElement('button');
    addFundsButton.textContent = 'Record Contribution';
    addFundsButton.style.width = '100%';
    addFundsButton.style.padding = '0.75rem';
    addFundsButton.style.backgroundColor = themeColors.primary;
    addFundsButton.style.color = 'white';
    addFundsButton.style.border = 'none';
    addFundsButton.style.borderRadius = '8px';
    addFundsButton.style.fontWeight = '600';
    addFundsButton.style.cursor = 'pointer';
    
    addFundsButton.addEventListener('click', () => {
      // Show add funds modal
      showAddFundsModal(challenge, userData);
    });
    
    actionSection.appendChild(addFundsButton);
  } else {
    const joinButton = document.createElement('button');
    joinButton.textContent = 'Join Challenge';
    joinButton.style.width = '100%';
    joinButton.style.padding = '0.75rem';
    joinButton.style.backgroundColor = themeColors.primary;
    joinButton.style.color = 'white';
    joinButton.style.border = 'none';
    joinButton.style.borderRadius = '8px';
    joinButton.style.fontWeight = '600';
    joinButton.style.cursor = 'pointer';
    
    joinButton.addEventListener('click', () => {
      // Join challenge
      joinChallenge(challenge, userData);
    });
    
    actionSection.appendChild(joinButton);
  }
  
  body.appendChild(progressSection);
  body.appendChild(infoSection);
  body.appendChild(actionSection);
  
  card.appendChild(header);
  card.appendChild(body);
  
  return card;
}

/**
 * Create a challenge card for recommended challenges
 * @param {Object} challenge - Challenge data
 * @param {Object} userData - User data
 * @returns {HTMLElement} - Challenge card element
 */
function createRecommendedChallengeCard(challenge, userData) {
  const card = document.createElement('div');
  card.className = 'recommended-challenge-card';
  card.style.backgroundColor = 'white';
  card.style.border = '1px solid #e2e8f0';
  card.style.borderRadius = '12px';
  card.style.overflow = 'hidden';
  card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  
  // Get theme from THEME_COLORS
  const themeColors = THEME_COLORS[challenge.theme] || THEME_COLORS.space;
  
  // Create header
  const header = document.createElement('div');
  header.style.backgroundColor = themeColors.primary;
  header.style.padding = '1.5rem';
  header.style.color = 'white';
  header.style.position = 'relative';
  
  // Add 'Recommended' badge
  const badge = document.createElement('div');
  badge.textContent = 'Recommended';
  badge.style.position = 'absolute';
  badge.style.top = '0.75rem';
  badge.style.right = '0.75rem';
  badge.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  badge.style.padding = '0.25rem 0.75rem';
  badge.style.borderRadius = '4px';
  badge.style.fontSize = '0.75rem';
  badge.style.fontWeight = '600';
  
  const title = document.createElement('h3');
  title.textContent = challenge.name;
  title.style.fontSize = '1.25rem';
  title.style.fontWeight = '700';
  title.style.marginBottom = '0.5rem';
  
  const description = document.createElement('p');
  description.textContent = challenge.description;
  description.style.fontSize = '0.875rem';
  description.style.opacity = '0.9';
  
  header.appendChild(badge);
  header.appendChild(title);
  header.appendChild(description);
  
  // Create body
  const body = document.createElement('div');
  body.style.padding = '1.5rem';
  
  // Challenge details
  const detailsSection = document.createElement('div');
  detailsSection.style.marginBottom = '1.5rem';
  
  const detailsItems = [
    { label: 'Duration', value: `${challenge.duration} days` },
    { label: 'Target Amount', value: formatCurrency(challenge.targetAmount) },
    { label: 'Difficulty', value: capitalizeFirstLetter(challenge.difficulty) }
  ];
  
  const detailsGrid = document.createElement('div');
  detailsGrid.style.display = 'grid';
  detailsGrid.style.gridTemplateColumns = '1fr 1fr 1fr';
  detailsGrid.style.gap = '1rem';
  
  detailsItems.forEach(item => {
    const detailItem = document.createElement('div');
    
    const detailLabel = document.createElement('div');
    detailLabel.textContent = item.label;
    detailLabel.style.fontSize = '0.75rem';
    detailLabel.style.color = '#718096';
    detailLabel.style.marginBottom = '0.25rem';
    
    const detailValue = document.createElement('div');
    detailValue.textContent = item.value;
    detailValue.style.fontWeight = '600';
    
    detailItem.appendChild(detailLabel);
    detailItem.appendChild(detailValue);
    
    detailsGrid.appendChild(detailItem);
  });
  
  detailsSection.appendChild(detailsGrid);
  
  // Reason section
  const reasonSection = document.createElement('div');
  reasonSection.style.marginBottom = '1.5rem';
  reasonSection.style.padding = '1rem';
  reasonSection.style.backgroundColor = '#f7fafc';
  reasonSection.style.borderRadius = '8px';
  
  const reasonHeader = document.createElement('div');
  reasonHeader.style.fontWeight = '600';
  reasonHeader.style.marginBottom = '0.5rem';
  reasonHeader.textContent = 'Why this challenge?';
  
  const reasonText = document.createElement('div');
  reasonText.textContent = challenge.reason;
  reasonText.style.fontSize = '0.875rem';
  
  reasonSection.appendChild(reasonHeader);
  reasonSection.appendChild(reasonText);
  
  // Action section
  const actionButton = document.createElement('button');
  actionButton.textContent = 'Start Challenge';
  actionButton.style.width = '100%';
  actionButton.style.padding = '0.75rem';
  actionButton.style.backgroundColor = themeColors.primary;
  actionButton.style.color = 'white';
  actionButton.style.border = 'none';
  actionButton.style.borderRadius = '8px';
  actionButton.style.fontWeight = '600';
  actionButton.style.cursor = 'pointer';
  
  actionButton.addEventListener('click', () => {
    // Start recommended challenge
    startRecommendedChallenge(challenge, userData);
  });
  
  body.appendChild(detailsSection);
  body.appendChild(reasonSection);
  body.appendChild(actionButton);
  
  card.appendChild(header);
  card.appendChild(body);
  
  return card;
}

/**
 * Create a challenge card for the browse page
 * @param {Object} challenge - Challenge data
 * @param {Object} userData - User data
 * @returns {HTMLElement} - Challenge card element
 */
function createBrowseChallengeCard(challenge, userData) {
  const card = document.createElement('div');
  card.className = 'browse-challenge-card';
  card.style.backgroundColor = 'white';
  card.style.border = '1px solid #e2e8f0';
  card.style.borderRadius = '12px';
  card.style.overflow = 'hidden';
  card.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
  card.style.transition = 'box-shadow 0.2s ease, transform 0.2s ease';
  
  // Hover effect
  card.addEventListener('mouseover', () => {
    card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    card.style.transform = 'translateY(-2px)';
  });
  
  card.addEventListener('mouseout', () => {
    card.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    card.style.transform = 'translateY(0)';
  });
  
  // Get theme colors
  const themeColors = challenge.theme.colors;
  
  // Create header
  const header = document.createElement('div');
  header.style.backgroundColor = themeColors.primary;
  header.style.padding = '1.5rem';
  header.style.color = 'white';
  
  const title = document.createElement('h3');
  title.textContent = challenge.name;
  title.style.fontSize = '1.25rem';
  title.style.fontWeight = '700';
  title.style.marginBottom = '0.5rem';
  
  const description = document.createElement('p');
  description.textContent = challenge.description;
  description.style.fontSize = '0.875rem';
  description.style.opacity = '0.9';
  
  header.appendChild(title);
  header.appendChild(description);
  
  // Create body
  const body = document.createElement('div');
  body.style.padding = '1.5rem';
  
  // Challenge details
  const detailsSection = document.createElement('div');
  detailsSection.style.marginBottom = '1.5rem';
  
  const detailsItems = [
    { label: 'Theme', value: challenge.theme.name },
    { label: 'Duration', value: `${challenge.duration} days` },
    { label: 'Target Amount', value: formatCurrency(challenge.targetAmount) },
    { label: 'Difficulty', value: capitalizeFirstLetter(challenge.difficulty) }
  ];
  
  const detailsGrid = document.createElement('div');
  detailsGrid.style.display = 'grid';
  detailsGrid.style.gridTemplateColumns = '1fr 1fr';
  detailsGrid.style.gap = '1rem';
  
  detailsItems.forEach(item => {
    const detailItem = document.createElement('div');
    
    const detailLabel = document.createElement('div');
    detailLabel.textContent = item.label;
    detailLabel.style.fontSize = '0.75rem';
    detailLabel.style.color = '#718096';
    detailLabel.style.marginBottom = '0.25rem';
    
    const detailValue = document.createElement('div');
    detailValue.textContent = item.value;
    detailValue.style.fontWeight = '600';
    
    detailItem.appendChild(detailLabel);
    detailItem.appendChild(detailValue);
    
    detailsGrid.appendChild(detailItem);
  });
  
  detailsSection.appendChild(detailsGrid);
  
  // Theme description
  const themeSection = document.createElement('div');
  themeSection.style.marginBottom = '1.5rem';
  themeSection.style.padding = '1rem';
  themeSection.style.backgroundColor = '#f7fafc';
  themeSection.style.borderRadius = '8px';
  
  const themeText = document.createElement('div');
  themeText.textContent = challenge.themeDescription;
  themeText.style.fontSize = '0.875rem';
  themeText.style.fontStyle = 'italic';
  
  themeSection.appendChild(themeText);
  
  // Action button
  const actionButton = document.createElement('button');
  actionButton.textContent = 'Start Challenge';
  actionButton.style.width = '100%';
  actionButton.style.padding = '0.75rem';
  actionButton.style.backgroundColor = themeColors.primary;
  actionButton.style.color = 'white';
  actionButton.style.border = 'none';
  actionButton.style.borderRadius = '8px';
  actionButton.style.fontWeight = '600';
  actionButton.style.cursor = 'pointer';
  
  actionButton.addEventListener('click', () => {
    // Start challenge
    startChallenge(challenge, userData);
  });
  
  body.appendChild(detailsSection);
  body.appendChild(themeSection);
  body.appendChild(actionButton);
  
  card.appendChild(header);
  card.appendChild(body);
  
  return card;
}

/**
 * Show modal for adding funds to a challenge
 * @param {Object} challenge - Challenge data
 * @param {Object} userData - User data
 */
function showAddFundsModal(challenge, userData) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '1000';
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.maxWidth = '500px';
  modal.style.width = '90%';
  modal.style.overflow = 'hidden';
  modal.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
  
  // Create modal header
  const header = document.createElement('div');
  header.style.backgroundColor = challenge.theme.colors.primary;
  header.style.padding = '1.5rem';
  header.style.color = 'white';
  
  const title = document.createElement('h3');
  title.textContent = `Add to ${challenge.name}`;
  title.style.fontSize = '1.25rem';
  title.style.fontWeight = '700';
  title.style.marginBottom = '0.5rem';
  
  const description = document.createElement('p');
  description.textContent = 'Record your contribution to this challenge';
  description.style.fontSize = '0.875rem';
  description.style.opacity = '0.9';
  
  header.appendChild(title);
  header.appendChild(description);
  
  // Create modal body
  const body = document.createElement('div');
  body.style.padding = '1.5rem';
  
  // Progress info
  const progressInfo = document.createElement('div');
  progressInfo.style.marginBottom = '1.5rem';
  progressInfo.style.padding = '1rem';
  progressInfo.style.backgroundColor = '#f7fafc';
  progressInfo.style.borderRadius = '8px';
  progressInfo.style.textAlign = 'center';
  
  const currentAmount = document.createElement('div');
  currentAmount.textContent = `Current progress: ${formatCurrency(challenge.currentAmount)} / ${formatCurrency(challenge.targetAmount)}`;
  currentAmount.style.marginBottom = '0.5rem';
  
  const remainingAmount = document.createElement('div');
  remainingAmount.textContent = `Remaining: ${formatCurrency(Math.max(0, challenge.targetAmount - challenge.currentAmount))}`;
  remainingAmount.style.fontWeight = '600';
  
  progressInfo.appendChild(currentAmount);
  progressInfo.appendChild(remainingAmount);
  
  // Create form
  const form = document.createElement('form');
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '1.5rem';
  
  // Amount input
  const amountGroup = document.createElement('div');
  
  const amountLabel = document.createElement('label');
  amountLabel.textContent = 'Contribution Amount';
  amountLabel.style.display = 'block';
  amountLabel.style.marginBottom = '0.5rem';
  amountLabel.style.fontWeight = '600';
  
  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.min = '0.01';
  amountInput.step = '0.01';
  amountInput.placeholder = 'Enter amount';
  amountInput.required = true;
  amountInput.style.width = '100%';
  amountInput.style.padding = '0.75rem';
  amountInput.style.border = '1px solid #e2e8f0';
  amountInput.style.borderRadius = '8px';
  amountInput.style.fontSize = '1rem';
  
  // Suggested amounts
  const suggestedAmounts = document.createElement('div');
  suggestedAmounts.style.display = 'flex';
  suggestedAmounts.style.gap = '0.5rem';
  suggestedAmounts.style.marginTop = '0.5rem';
  
  // Generate suggested amounts based on challenge
  const dailyTarget = challenge.dailyTargets.find(target => target.amount > 0)?.amount || 10;
  const suggestedValues = [
    Math.round(dailyTarget),
    Math.round(dailyTarget * 1.5),
    Math.round(dailyTarget * 2)
  ];
  
  suggestedValues.forEach(value => {
    const suggestionButton = document.createElement('button');
    suggestionButton.type = 'button';
    suggestionButton.textContent = formatCurrency(value);
    suggestionButton.style.padding = '0.5rem';
    suggestionButton.style.border = '1px solid #e2e8f0';
    suggestionButton.style.borderRadius = '4px';
    suggestionButton.style.backgroundColor = 'white';
    suggestionButton.style.fontSize = '0.875rem';
    suggestionButton.style.cursor = 'pointer';
    
    suggestionButton.addEventListener('click', () => {
      amountInput.value = value;
    });
    
    suggestedAmounts.appendChild(suggestionButton);
  });
  
  amountGroup.appendChild(amountLabel);
  amountGroup.appendChild(amountInput);
  amountGroup.appendChild(suggestedAmounts);
  
  // Date input
  const dateGroup = document.createElement('div');
  
  const dateLabel = document.createElement('label');
  dateLabel.textContent = 'Contribution Date';
  dateLabel.style.display = 'block';
  dateLabel.style.marginBottom = '0.5rem';
  dateLabel.style.fontWeight = '600';
  
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.required = true;
  dateInput.style.width = '100%';
  dateInput.style.padding = '0.75rem';
  dateInput.style.border = '1px solid #e2e8f0';
  dateInput.style.borderRadius = '8px';
  dateInput.style.fontSize = '1rem';
  
  // Set default date to today
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  dateInput.value = `${year}-${month}-${day}`;
  
  dateGroup.appendChild(dateLabel);
  dateGroup.appendChild(dateInput);
  
  // Buttons
  const buttonsGroup = document.createElement('div');
  buttonsGroup.style.display = 'flex';
  buttonsGroup.style.gap = '1rem';
  buttonsGroup.style.marginTop = '1rem';
  
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';
  cancelButton.style.flex = '1';
  cancelButton.style.padding = '0.75rem';
  cancelButton.style.border = '1px solid #e2e8f0';
  cancelButton.style.borderRadius = '8px';
  cancelButton.style.backgroundColor = 'white';
  cancelButton.style.fontWeight = '600';
  cancelButton.style.cursor = 'pointer';
  
  cancelButton.addEventListener('click', () => {
    // Close modal
    document.body.removeChild(overlay);
  });
  
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Add Contribution';
  submitButton.style.flex = '1';
  submitButton.style.padding = '0.75rem';
  submitButton.style.backgroundColor = challenge.theme.colors.primary;
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '8px';
  submitButton.style.fontWeight = '600';
  submitButton.style.cursor = 'pointer';
  
  buttonsGroup.appendChild(cancelButton);
  buttonsGroup.appendChild(submitButton);
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(amountInput.value);
    const date = new Date(dateInput.value);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    
    // Update challenge
    try {
      const updatedChallenge = await updateChallengeContribution(
        challenge.id,
        amount,
        date,
        userData.id
      );
      
      // Show success message
      alert('Contribution added successfully!');
      
      // Close modal
      document.body.removeChild(overlay);
      
      // Refresh page
      window.location.reload();
    } catch (error) {
      console.error('Error updating challenge:', error);
      alert('Failed to add contribution. Please try again.');
    }
  });
  
  form.appendChild(amountGroup);
  form.appendChild(dateGroup);
  form.appendChild(buttonsGroup);
  
  body.appendChild(progressInfo);
  body.appendChild(form);
  
  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);
  
  document.body.appendChild(overlay);
}

/**
 * Show modal for creating a custom challenge
 * @param {Object} userData - User data
 */
function showCustomChallengeModal(userData) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '1000';
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.maxWidth = '600px';
  modal.style.width = '90%';
  modal.style.maxHeight = '90vh';
  modal.style.overflow = 'auto';
  modal.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
  
  // Create modal header
  const header = document.createElement('div');
  header.style.backgroundColor = 'var(--color-primary)';
  header.style.padding = '1.5rem';
  header.style.color = 'white';
  header.style.position = 'sticky';
  header.style.top = '0';
  
  const title = document.createElement('h3');
  title.textContent = 'Design Your Own Challenge';
  title.style.fontSize = '1.25rem';
  title.style.fontWeight = '700';
  title.style.marginBottom = '0.5rem';
  
  const description = document.createElement('p');
  description.textContent = 'Create a personalized savings challenge that fits your goals';
  description.style.fontSize = '0.875rem';
  description.style.opacity = '0.9';
  
  header.appendChild(title);
  header.appendChild(description);
  
  // Create modal body
  const body = document.createElement('div');
  body.style.padding = '1.5rem';
  
  // Create form
  const form = document.createElement('form');
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '1.5rem';
  
  // Challenge type
  const typeGroup = document.createElement('div');
  
  const typeLabel = document.createElement('label');
  typeLabel.textContent = 'Challenge Type';
  typeLabel.style.display = 'block';
  typeLabel.style.marginBottom = '0.5rem';
  typeLabel.style.fontWeight = '600';
  
  const typeSelect = document.createElement('select');
  typeSelect.required = true;
  typeSelect.style.width = '100%';
  typeSelect.style.padding = '0.75rem';
  typeSelect.style.border = '1px solid #e2e8f0';
  typeSelect.style.borderRadius = '8px';
  typeSelect.style.fontSize = '1rem';
  typeSelect.style.backgroundColor = 'white';
  
  // Add options for each challenge type
  Object.entries(CHALLENGE_TYPES).forEach(([type, info]) => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = `${info.name} - ${info.description}`;
    typeSelect.appendChild(option);
  });
  
  typeGroup.appendChild(typeLabel);
  typeGroup.appendChild(typeSelect);
  
  // Challenge theme
  const themeGroup = document.createElement('div');
  
  const themeLabel = document.createElement('label');
  themeLabel.textContent = 'Theme';
  themeLabel.style.display = 'block';
  themeLabel.style.marginBottom = '0.5rem';
  themeLabel.style.fontWeight = '600';
  
  const themeSelect = document.createElement('select');
  themeSelect.required = true;
  themeSelect.style.width = '100%';
  themeSelect.style.padding = '0.75rem';
  themeSelect.style.border = '1px solid #e2e8f0';
  themeSelect.style.borderRadius = '8px';
  themeSelect.style.fontSize = '1rem';
  themeSelect.style.backgroundColor = 'white';
  
  // Add options for each theme
  CHALLENGE_THEMES.forEach(theme => {
    const option = document.createElement('option');
    option.value = theme.id;
    option.textContent = `${theme.name} - ${theme.description}`;
    themeSelect.appendChild(option);
  });
  
  themeGroup.appendChild(themeLabel);
  themeGroup.appendChild(themeSelect);
  
  // Duration
  const durationGroup = document.createElement('div');
  
  const durationLabel = document.createElement('label');
  durationLabel.textContent = 'Duration (days)';
  durationLabel.style.display = 'block';
  durationLabel.style.marginBottom = '0.5rem';
  durationLabel.style.fontWeight = '600';
  
  const durationRow = document.createElement('div');
  durationRow.style.display = 'flex';
  durationRow.style.alignItems = 'center';
  durationRow.style.gap = '1rem';
  
  const durationInput = document.createElement('input');
  durationInput.type = 'range';
  durationInput.min = '7';
  durationInput.max = '90';
  durationInput.value = '30';
  durationInput.style.flex = '1';
  
  const durationValue = document.createElement('div');
  durationValue.textContent = '30 days';
  durationValue.style.width = '80px';
  durationValue.style.textAlign = 'center';
  durationValue.style.fontWeight = '600';
  
  durationInput.addEventListener('input', () => {
    durationValue.textContent = `${durationInput.value} days`;
  });
  
  durationRow.appendChild(durationInput);
  durationRow.appendChild(durationValue);
  
  durationGroup.appendChild(durationLabel);
  durationGroup.appendChild(durationRow);
  
  // Target amount
  const targetGroup = document.createElement('div');
  
  const targetLabel = document.createElement('label');
  targetLabel.textContent = 'Target Amount';
  targetLabel.style.display = 'block';
  targetLabel.style.marginBottom = '0.5rem';
  targetLabel.style.fontWeight = '600';
  
  const targetInput = document.createElement('input');
  targetInput.type = 'number';
  targetInput.min = '1';
  targetInput.step = '1';
  targetInput.placeholder = 'Enter target amount';
  targetInput.required = true;
  targetInput.style.width = '100%';
  targetInput.style.padding = '0.75rem';
  targetInput.style.border = '1px solid #e2e8f0';
  targetInput.style.borderRadius = '8px';
  targetInput.style.fontSize = '1rem';
  
  // Update target amount based on selected challenge type and duration
  function updateTargetAmount() {
    const challengeType = typeSelect.value;
    const duration = parseInt(durationInput.value);
    const challengeInfo = CHALLENGE_TYPES[challengeType];
    
    if (challengeInfo) {
      const amount = calculateTargetAmount(challengeInfo, userData, duration);
      targetInput.value = amount;
    }
  }
  
  // Add event listeners to update target amount
  typeSelect.addEventListener('change', updateTargetAmount);
  durationInput.addEventListener('input', updateTargetAmount);
  
  // Set initial target amount
  setTimeout(updateTargetAmount, 0);
  
  targetGroup.appendChild(targetLabel);
  targetGroup.appendChild(targetInput);
  
  // Buttons
  const buttonsGroup = document.createElement('div');
  buttonsGroup.style.display = 'flex';
  buttonsGroup.style.gap = '1rem';
  buttonsGroup.style.marginTop = '1rem';
  
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';
  cancelButton.style.flex = '1';
  cancelButton.style.padding = '0.75rem';
  cancelButton.style.border = '1px solid #e2e8f0';
  cancelButton.style.borderRadius = '8px';
  cancelButton.style.backgroundColor = 'white';
  cancelButton.style.fontWeight = '600';
  cancelButton.style.cursor = 'pointer';
  
  cancelButton.addEventListener('click', () => {
    // Close modal
    document.body.removeChild(overlay);
  });
  
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Create Challenge';
  submitButton.style.flex = '1';
  submitButton.style.padding = '0.75rem';
  submitButton.style.backgroundColor = 'var(--color-primary)';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '8px';
  submitButton.style.fontWeight = '600';
  submitButton.style.cursor = 'pointer';
  
  buttonsGroup.appendChild(cancelButton);
  buttonsGroup.appendChild(submitButton);
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const challengeType = typeSelect.value;
    const theme = themeSelect.value;
    const duration = parseInt(durationInput.value);
    const targetAmount = parseFloat(targetInput.value);
    
    if (isNaN(targetAmount) || targetAmount <= 0) {
      alert('Please enter a valid target amount.');
      return;
    }
    
    // Create custom challenge
    try {
      await createCustomChallenge(
        userData.id,
        {
          challengeType,
          theme,
          duration,
          targetAmount
        }
      );
      
      // Show success message
      alert('Challenge created successfully!');
      
      // Close modal
      document.body.removeChild(overlay);
      
      // Refresh page
      window.location.reload();
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Please try again.');
    }
  });
  
  form.appendChild(typeGroup);
  form.appendChild(themeGroup);
  form.appendChild(durationGroup);
  form.appendChild(targetGroup);
  form.appendChild(buttonsGroup);
  
  body.appendChild(form);
  
  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);
  
  document.body.appendChild(overlay);
}

/**
 * Join an existing challenge
 * @param {Object} challenge - Challenge to join
 * @param {Object} userData - User data
 */
async function joinChallenge(challenge, userData) {
  try {
    // Generate the complete challenge using the savings-challenges.js module
    const completeChallenge = generateSavingsChallenge(userData, {
      challengeType: challenge.id,
      theme: challenge.theme.id,
      duration: challenge.duration
    });
    
    // Save the challenge to the user's account
    await saveChallenge(completeChallenge, userData.id);
    
    // Show success message
    alert('Challenge joined successfully!');
    
    // Refresh page
    window.location.reload();
  } catch (error) {
    console.error('Error joining challenge:', error);
    alert('Failed to join challenge. Please try again.');
  }
}

/**
 * Start a recommended challenge
 * @param {Object} challenge - Recommended challenge
 * @param {Object} userData - User data
 */
async function startRecommendedChallenge(challenge, userData) {
  try {
    // Generate the complete challenge using the savings-challenges.js module
    const completeChallenge = generateSavingsChallenge(userData, {
      challengeType: challenge.type,
      theme: challenge.theme,
      duration: challenge.duration,
      targetAmount: challenge.targetAmount
    });
    
    // Save the challenge to the user's account
    await saveChallenge(completeChallenge, userData.id);
    
    // Show success message
    alert('Challenge started successfully!');
    
    // Refresh page
    window.location.reload();
  } catch (error) {
    console.error('Error starting challenge:', error);
    alert('Failed to start challenge. Please try again.');
  }
}

/**
 * Start a challenge from the browse page
 * @param {Object} challenge - Challenge to start
 * @param {Object} userData - User data
 */
async function startChallenge(challenge, userData) {
  try {
    // Generate the complete challenge using the savings-challenges.js module
    const completeChallenge = generateSavingsChallenge(userData, {
      challengeType: challenge.id,
      theme: challenge.theme.id,
      duration: challenge.duration,
      targetAmount: challenge.targetAmount
    });
    
    // Save the challenge to the user's account
    await saveChallenge(completeChallenge, userData.id);
    
    // Show success message
    alert('Challenge started successfully!');
    
    // Refresh page
    window.location.reload();
  } catch (error) {
    console.error('Error starting challenge:', error);
    alert('Failed to start challenge. Please try again.');
  }
}

/**
 * Create a custom challenge
 * @param {number} userId - User ID
 * @param {Object} options - Challenge options
 */
async function createCustomChallenge(userId, options) {
  try {
    // Fetch user data
    const userData = await fetchUserData(userId);
    
    // Generate the complete challenge using the savings-challenges.js module
    const completeChallenge = generateSavingsChallenge(userData, {
      challengeType: options.challengeType,
      theme: options.theme,
      duration: options.duration,
      targetAmount: options.targetAmount
    });
    
    // Save the challenge to the user's account
    await saveChallenge(completeChallenge, userId);
    
    return true;
  } catch (error) {
    console.error('Error creating custom challenge:', error);
    throw error;
  }
}

/**
 * Update a challenge with a new contribution
 * @param {string} challengeId - Challenge ID
 * @param {number} amount - Contribution amount
 * @param {Date} date - Contribution date
 * @param {number} userId - User ID
 * @returns {Object} - Updated challenge
 */
async function updateChallengeContribution(challengeId, amount, date, userId) {
  try {
    // Get user data and find the challenge
    const userData = await fetchUserData(userId);
    const challenge = userData.challenges.find(c => c.id === challengeId);
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }
    
    // Update the challenge using the savings-challenges.js module
    const updatedChallenge = updateChallenge(challenge, amount, date);
    
    // Save the updated challenge
    await updateSavedChallenge(updatedChallenge, userId);
    
    return updatedChallenge;
  } catch (error) {
    console.error('Error updating challenge contribution:', error);
    throw error;
  }
}

// Helper functions

/**
 * Format a currency value
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  // Handle null, undefined, or non-numeric values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }
  
  return '$' + Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

/**
 * Format a date
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Format a date range
 * @param {string} startDateString - Start date ISO string
 * @param {string} endDateString - End date ISO string
 * @returns {string} - Formatted date range
 */
function formatDateRange(startDateString, endDateString) {
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - String to capitalize
 * @returns {string} - Capitalized string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Calculate a target amount for a challenge
 * This is a simplified version of the function in savings-challenges.js
 * @param {Object} challengeInfo - Challenge type info
 * @param {Object} userData - User financial data
 * @param {number} duration - Challenge duration
 * @returns {number} - Target amount
 */
function calculateTargetAmount(challengeInfo, userData, duration) {
  const monthlyIncome = userData.monthlyIncome || 3000;
  
  // Simple calculation based on challenge type and duration
  switch (challengeInfo.id) {
    case 'DAILY':
      return Math.round(monthlyIncome * 0.01 * (duration / 30));
    case 'WEEKLY':
      return Math.round(monthlyIncome * 0.05 * (duration / 30));
    case 'MONTHLY':
      return Math.round(monthlyIncome * 0.2 * (duration / 30));
    case 'ROUND_UP':
      return Math.round(monthlyIncome * 0.02 * (duration / 30));
    case 'NO_SPEND':
      return Math.round(monthlyIncome * 0.1 * (duration / 30));
    case 'SAVING_SPRINT':
      return Math.round(monthlyIncome * 0.15 * (duration / 30));
    case 'INCREMENTAL':
      return Math.round(monthlyIncome * 0.08 * (duration / 30));
    case 'DECLUTTER':
      return Math.round(monthlyIncome * 0.05 * (duration / 30));
    case 'HABIT_SWAP':
      return Math.round(monthlyIncome * 0.03 * (duration / 30));
    case 'AUTOMATION':
      return Math.round(monthlyIncome * 0.1 * (duration / 30));
    default:
      return Math.round(monthlyIncome * 0.05 * (duration / 30));
  }
}

// API functions

/**
 * Fetch user data including challenges
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - User data
 */
async function fetchUserData(userId) {
  try {
    // In a real implementation, this would call an API
    // For demo purposes, we'll return mock data
    return {
      id: userId,
      name: 'Demo User',
      email: 'user@example.com',
      monthlyIncome: 4000,
      savingsRate: 15,
      challenges: []
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

/**
 * Save a challenge to the user's account
 * @param {Object} challenge - Challenge to save
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Saved challenge
 */
async function saveChallenge(challenge, userId) {
  try {
    // In a real implementation, this would call an API
    console.log('Saving challenge:', challenge);
    return challenge;
  } catch (error) {
    console.error('Error saving challenge:', error);
    throw error;
  }
}

/**
 * Update a saved challenge
 * @param {Object} challenge - Updated challenge
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Updated challenge
 */
async function updateSavedChallenge(challenge, userId) {
  try {
    // In a real implementation, this would call an API
    console.log('Updating challenge:', challenge);
    return challenge;
  } catch (error) {
    console.error('Error updating challenge:', error);
    throw error;
  }
}

/**
 * Fetch leaderboard data
 * @param {string} period - Time period (weekly, monthly, allTime)
 * @returns {Promise<Array>} - Leaderboard users
 */
async function fetchLeaderboardData(period) {
  try {
    // In a real implementation, this would call an API
    // For demo purposes, we'll return mock data
    return [
      {
        userId: 1,
        name: 'John Doe',
        avatar: null,
        challengesCompleted: 12,
        achievementLevel: 'Gold',
        achievementIcon: '🥇',
        points: 1250,
        streak: 21,
        totalSaved: 2350
      },
      {
        userId: 2,
        name: 'Jane Smith',
        avatar: null,
        challengesCompleted: 10,
        achievementLevel: 'Gold',
        achievementIcon: '🥇',
        points: 1120,
        streak: 14,
        totalSaved: 1980
      },
      {
        userId: 3,
        name: 'Bob Johnson',
        avatar: null,
        challengesCompleted: 8,
        achievementLevel: 'Silver',
        achievementIcon: '🥈',
        points: 950,
        streak: 7,
        totalSaved: 1450
      },
      {
        userId: 4,
        name: 'Alice Williams',
        avatar: null,
        challengesCompleted: 6,
        achievementLevel: 'Silver',
        achievementIcon: '🥈',
        points: 780,
        streak: 0,
        totalSaved: 1200
      },
      {
        userId: 5,
        name: 'Charlie Brown',
        avatar: null,
        challengesCompleted: 5,
        achievementLevel: 'Bronze',
        achievementIcon: '🥉',
        points: 650,
        streak: 5,
        totalSaved: 980
      }
    ];
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    throw error;
  }
}
