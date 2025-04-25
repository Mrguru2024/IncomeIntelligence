/**
 * Gamified Savings Challenge Page
 * Provides UI for users to browse, select, and manage savings challenges
 */

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
      { name: 'No-Spend Day', description: 'Challenge yourself to spend nothing for a day', amount: 25 }
    ],
    weekly: [
      { name: 'Grocery Budget', description: 'Reduce your grocery bill by 20% this week', amount: 30 },
      { name: 'Entertainment Cut', description: 'Skip one paid entertainment expense this week', amount: 25 },
      { name: 'Meal Prep Master', description: 'Prep all meals for the week to avoid takeout', amount: 60 }
    ],
    monthly: [
      { name: 'Bill Negotiator', description: 'Call and negotiate a lower rate on one monthly bill', amount: 50 },
      { name: 'Automatic Saver', description: 'Set up an automatic transfer to savings', amount: 100 },
      { name: 'Declutter Sale', description: 'Sell unused items around your home', amount: 150 }
    ]
  };
  
  // Select challenge type
  const typeOptions = challenges[defaultOptions.type] || challenges.daily;
  
  // Select a random challenge or use targetAmount
  let challenge;
  if (defaultOptions.targetAmount > 0) {
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
    amount: Math.round(challenge.amount),
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
    }
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
    
    return {
      id: userId,
      challenges,
      stats: {
        totalChallenges: 15,
        completedChallenges: 8,
        activeChallenges: 3,
        totalSaved: 520,
        streakDays: 14
      },
      recommendations: []
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
  // Create main container
  const container = document.createElement('div');
  container.className = 'challenges-page';
  container.style.maxWidth = '100%';
  container.style.margin = '0 auto';
  container.style.padding = '2rem';
  container.style.fontFamily = 'Inter, system-ui, sans-serif';
  container.style.color = '#333';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'challenges-header';
  header.style.marginBottom = '1.5rem';
  
  const pageTitle = document.createElement('h1');
  pageTitle.textContent = 'Savings Challenges';
  pageTitle.style.fontSize = '2rem';
  pageTitle.style.fontWeight = '700';
  pageTitle.style.marginBottom = '0.5rem';
  pageTitle.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 60%)';
  pageTitle.style.WebkitBackgroundClip = 'text';
  pageTitle.style.WebkitTextFillColor = 'transparent';
  pageTitle.style.backgroundClip = 'text';
  
  const pageDescription = document.createElement('p');
  pageDescription.textContent = 'Gamify your savings journey with fun challenges that help you reach your financial goals!';
  pageDescription.style.fontSize = '1rem';
  pageDescription.style.color = '#666';
  pageDescription.style.maxWidth = '800px';
  
  header.appendChild(pageTitle);
  header.appendChild(pageDescription);
  container.appendChild(header);
  
  try {
    // Get user's financial data and existing challenges
    const userData = await fetchUserData(userId);
    
    // Create challenges grid
    const challengesGrid = document.createElement('div');
    challengesGrid.style.display = 'grid';
    challengesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    challengesGrid.style.gap = '1.5rem';
    challengesGrid.style.marginBottom = '2rem';
    
    // Add challenges to grid
    if (userData.challenges && userData.challenges.length > 0) {
      userData.challenges.forEach(challenge => {
        const card = createChallengeCard(challenge);
        challengesGrid.appendChild(card);
      });
    } else {
      const emptyState = document.createElement('div');
      emptyState.style.gridColumn = '1 / -1';
      emptyState.style.padding = '2rem';
      emptyState.style.backgroundColor = '#f8f9fa';
      emptyState.style.borderRadius = '8px';
      emptyState.style.textAlign = 'center';
      
      const emptyTitle = document.createElement('h3');
      emptyTitle.textContent = 'No Active Challenges';
      emptyTitle.style.marginBottom = '1rem';
      
      const emptyDescription = document.createElement('p');
      emptyDescription.textContent = 'You don\'t have any active challenges yet. Get started by creating a new challenge below!';
      
      emptyState.appendChild(emptyTitle);
      emptyState.appendChild(emptyDescription);
      challengesGrid.appendChild(emptyState);
    }
    
    container.appendChild(challengesGrid);
    
    // Add "Create New Challenge" button
    const newChallengeButton = document.createElement('button');
    newChallengeButton.textContent = '+ Create New Challenge';
    newChallengeButton.style.backgroundColor = 'var(--color-primary)';
    newChallengeButton.style.color = 'white';
    newChallengeButton.style.padding = '0.75rem 1.5rem';
    newChallengeButton.style.border = 'none';
    newChallengeButton.style.borderRadius = '8px';
    newChallengeButton.style.fontWeight = '600';
    newChallengeButton.style.fontSize = '1rem';
    newChallengeButton.style.cursor = 'pointer';
    newChallengeButton.style.marginBottom = '2rem';
    newChallengeButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    
    newChallengeButton.addEventListener('click', () => {
      alert('Creating a new challenge! (Feature coming soon)');
    });
    
    container.appendChild(newChallengeButton);
    
  } catch (error) {
    console.error('Error loading challenges data:', error);
    
    // Show error message
    const errorContainer = document.createElement('div');
    errorContainer.style.padding = '2rem';
    errorContainer.style.backgroundColor = '#fff5f5';
    errorContainer.style.borderRadius = '8px';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.color = '#e53e3e';
    
    const errorTitle = document.createElement('h3');
    errorTitle.textContent = 'Error Loading Challenges';
    errorTitle.style.marginBottom = '1rem';
    
    const errorDescription = document.createElement('p');
    errorDescription.textContent = 'We couldn\'t load your challenges data. Please try again later.';
    
    errorContainer.appendChild(errorTitle);
    errorContainer.appendChild(errorDescription);
    container.appendChild(errorContainer);
  }
  
  return container;
}

/**
 * Create a challenge card
 * @param {Object} challenge - The challenge data
 * @returns {HTMLElement} - The challenge card element
 */
function createChallengeCard(challenge) {
  const card = document.createElement('div');
  card.className = 'challenge-card';
  card.style.backgroundColor = 'white';
  card.style.borderRadius = '8px';
  card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  card.style.padding = '1.5rem';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  
  // Card header
  const header = document.createElement('div');
  header.style.marginBottom = '1rem';
  
  const title = document.createElement('h3');
  title.textContent = challenge.name;
  title.style.fontSize = '1.25rem';
  title.style.fontWeight = '600';
  title.style.marginBottom = '0.5rem';
  
  const description = document.createElement('p');
  description.textContent = challenge.description;
  description.style.fontSize = '0.875rem';
  description.style.color = '#666';
  
  header.appendChild(title);
  header.appendChild(description);
  
  // Challenge details
  const details = document.createElement('div');
  details.style.display = 'flex';
  details.style.justifyContent = 'space-between';
  details.style.marginBottom = '1rem';
  
  const typeContainer = document.createElement('div');
  const typeLabel = document.createElement('span');
  typeLabel.textContent = 'Type';
  typeLabel.style.fontSize = '0.75rem';
  typeLabel.style.color = '#888';
  typeLabel.style.display = 'block';
  
  const typeValue = document.createElement('span');
  typeValue.textContent = challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1);
  typeValue.style.fontWeight = '600';
  
  typeContainer.appendChild(typeLabel);
  typeContainer.appendChild(typeValue);
  
  const amountContainer = document.createElement('div');
  const amountLabel = document.createElement('span');
  amountLabel.textContent = 'Savings';
  amountLabel.style.fontSize = '0.75rem';
  amountLabel.style.color = '#888';
  amountLabel.style.display = 'block';
  
  const amountValue = document.createElement('span');
  amountValue.textContent = `$${challenge.amount}`;
  amountValue.style.fontWeight = '600';
  amountValue.style.color = '#38a169';
  
  amountContainer.appendChild(amountLabel);
  amountContainer.appendChild(amountValue);
  
  details.appendChild(typeContainer);
  details.appendChild(amountContainer);
  
  // Progress indicator
  const progressContainer = document.createElement('div');
  progressContainer.style.marginBottom = '1rem';
  
  const progressLabel = document.createElement('div');
  progressLabel.style.display = 'flex';
  progressLabel.style.justifyContent = 'space-between';
  progressLabel.style.marginBottom = '0.5rem';
  
  const progressText = document.createElement('span');
  progressText.textContent = 'Progress';
  progressText.style.fontSize = '0.875rem';
  
  const progressPercentage = document.createElement('span');
  progressPercentage.textContent = `${challenge.progress}%`;
  progressPercentage.style.fontSize = '0.875rem';
  progressPercentage.style.fontWeight = '600';
  
  progressLabel.appendChild(progressText);
  progressLabel.appendChild(progressPercentage);
  
  const progressBar = document.createElement('div');
  progressBar.style.height = '8px';
  progressBar.style.backgroundColor = '#e2e8f0';
  progressBar.style.borderRadius = '4px';
  progressBar.style.overflow = 'hidden';
  
  const progressFill = document.createElement('div');
  progressFill.style.height = '100%';
  progressFill.style.width = `${challenge.progress}%`;
  progressFill.style.backgroundColor = '#4299e1';
  progressFill.style.borderRadius = '4px';
  
  progressBar.appendChild(progressFill);
  
  progressContainer.appendChild(progressLabel);
  progressContainer.appendChild(progressBar);
  
  // Card actions
  const actions = document.createElement('div');
  actions.style.marginTop = 'auto';
  actions.style.display = 'flex';
  actions.style.justifyContent = 'space-between';
  
  const updateButton = document.createElement('button');
  updateButton.textContent = 'Update Progress';
  updateButton.style.backgroundColor = '#4299e1';
  updateButton.style.color = 'white';
  updateButton.style.padding = '0.5rem 1rem';
  updateButton.style.borderRadius = '4px';
  updateButton.style.border = 'none';
  updateButton.style.fontSize = '0.875rem';
  updateButton.style.fontWeight = '600';
  updateButton.style.cursor = 'pointer';
  
  updateButton.addEventListener('click', () => {
    alert(`Updating progress for challenge: ${challenge.name}`);
  });
  
  const abandonButton = document.createElement('button');
  abandonButton.textContent = 'Abandon';
  abandonButton.style.backgroundColor = 'transparent';
  abandonButton.style.color = '#e53e3e';
  abandonButton.style.padding = '0.5rem 1rem';
  abandonButton.style.borderRadius = '4px';
  abandonButton.style.border = '1px solid #e53e3e';
  abandonButton.style.fontSize = '0.875rem';
  abandonButton.style.fontWeight = '600';
  abandonButton.style.cursor = 'pointer';
  
  abandonButton.addEventListener('click', () => {
    if (confirm(`Are you sure you want to abandon the "${challenge.name}" challenge?`)) {
      alert(`Challenge abandoned: ${challenge.name}`);
    }
  });
  
  actions.appendChild(updateButton);
  actions.appendChild(abandonButton);
  
  // Assemble card
  card.appendChild(header);
  card.appendChild(details);
  card.appendChild(progressContainer);
  card.appendChild(actions);
  
  return card;
}