/**
 * Gamified Savings Challenge Generator
 * This module allows users to create and participate in personalized savings challenges
 * with gamification elements like achievements, streaks, and rewards.
 */

import { isAuthenticated, getCurrentUser } from './auth.js';
import { createToast } from './components/toast.js';
import { renderSidebar } from './sidebar.js';
import { formatCurrency } from './utils.js';

// State management for savings challenges
let activeChallenges = [];
let completedChallenges = [];
let suggestedChallenges = [];

// Challenge templates with different difficulty levels and themes
const CHALLENGE_TEMPLATES = [
  {
    id: 'coffee_break',
    title: 'Coffee Break Challenge',
    description: 'Skip your daily coffee shop visit and save that money instead',
    duration: 30, // days
    targetAmount: 150,
    difficulty: 'easy',
    category: 'daily_habits',
    savingsFrequency: 'daily',
    tipAmount: 5, // estimated daily savings
    image: '☕',
    rewards: ['Coffee Break Badge', '10% progress toward Financial Freedom achievement'],
    milestones: [
      { progress: 25, reward: 'One week streak badge' },
      { progress: 50, reward: 'Two week streak badge' },
      { progress: 75, reward: 'Coffee Connoisseur badge' },
      { progress: 100, reward: 'Challenge Complete badge + 50 points' }
    ]
  },
  {
    id: 'lunch_master',
    title: 'Lunch Master Challenge',
    description: 'Bring lunch from home instead of eating out for a month',
    duration: 30,
    targetAmount: 300,
    difficulty: 'medium',
    category: 'daily_habits',
    savingsFrequency: 'daily',
    tipAmount: 10,
    image: '🍱',
    rewards: ['Meal Prep Master Badge', '15% progress toward Financial Freedom achievement'],
    milestones: [
      { progress: 25, reward: 'One week streak badge' },
      { progress: 50, reward: 'Two week streak badge' },
      { progress: 75, reward: 'Home Chef badge' },
      { progress: 100, reward: 'Challenge Complete badge + 100 points' }
    ]
  },
  {
    id: 'no_spend',
    title: 'No-Spend Weekend Challenge',
    description: 'Go an entire weekend without spending any money',
    duration: 60, // across multiple weekends
    targetAmount: 500,
    difficulty: 'hard',
    category: 'lifestyle',
    savingsFrequency: 'weekly',
    tipAmount: 125,
    image: '💰',
    rewards: ['Frugal Master Badge', '20% progress toward Financial Freedom achievement'],
    milestones: [
      { progress: 25, reward: 'One month badge' },
      { progress: 50, reward: 'Halfway Hero badge' },
      { progress: 75, reward: 'Almost There badge' },
      { progress: 100, reward: 'Challenge Complete badge + 200 points' }
    ]
  },
  {
    id: '52_week',
    title: '52-Week Savings Challenge',
    description: 'Save an increasing amount each week for a year',
    duration: 365,
    targetAmount: 1378, // sum of numbers 1-52
    difficulty: 'expert',
    category: 'long_term',
    savingsFrequency: 'weekly',
    tipAmount: 26.50, // average weekly amount
    image: '📅',
    rewards: ['Savings Superstar Badge', '30% progress toward Financial Freedom achievement'],
    milestones: [
      { progress: 25, reward: '3-month milestone badge' },
      { progress: 50, reward: '6-month milestone badge' },
      { progress: 75, reward: '9-month milestone badge' },
      { progress: 100, reward: 'Challenge Complete badge + 500 points' }
    ]
  },
  {
    id: '1000_steps',
    title: '$1000 in 100 Days Challenge',
    description: 'Save $10 every day for 100 days to reach $1000',
    duration: 100,
    targetAmount: 1000,
    difficulty: 'hard',
    category: 'goal_based',
    savingsFrequency: 'daily',
    tipAmount: 10,
    image: '🔢',
    rewards: ['Consistent Saver Badge', '25% progress toward Financial Freedom achievement'],
    milestones: [
      { progress: 25, reward: '$250 milestone badge' },
      { progress: 50, reward: '$500 milestone badge' },
      { progress: 75, reward: '$750 milestone badge' },
      { progress: 100, reward: 'Challenge Complete badge + 350 points' }
    ]
  },
  {
    id: 'spare_change',
    title: 'Spare Change Challenge',
    description: 'Save all your spare change and small bills for a month',
    duration: 30,
    targetAmount: 100,
    difficulty: 'easy',
    category: 'beginner',
    savingsFrequency: 'daily',
    tipAmount: 3.33,
    image: '🪙',
    rewards: ['Coin Collector Badge', '10% progress toward Financial Freedom achievement'],
    milestones: [
      { progress: 25, reward: 'Week 1 complete badge' },
      { progress: 50, reward: 'Halfway Hero badge' },
      { progress: 75, reward: 'Almost There badge' },
      { progress: 100, reward: 'Challenge Complete badge + 75 points' }
    ]
  },
  {
    id: 'subscription_detox',
    title: 'Subscription Detox Challenge',
    description: 'Cancel unused subscriptions and save that money instead',
    duration: 90,
    targetAmount: 200,
    difficulty: 'medium',
    category: 'smart_spending',
    savingsFrequency: 'monthly',
    tipAmount: 66.67,
    image: '📺',
    rewards: ['Subscription Slasher Badge', '15% progress toward Financial Freedom achievement'],
    milestones: [
      { progress: 25, reward: '1-month milestone badge' },
      { progress: 50, reward: '2-month milestone badge' },
      { progress: 75, reward: 'Almost There badge' },
      { progress: 100, reward: 'Challenge Complete badge + 150 points' }
    ]
  }
];

/**
 * Generate personalized challenge suggestions based on user profile and preferences
 * @returns {Array} Array of suggested challenges
 */
function generateChallengeSuggestions() {
  // In a real app, this would be based on user data, spending patterns, etc.
  // For demo, just return a few random challenges
  return CHALLENGE_TEMPLATES
    .sort(() => 0.5 - Math.random()) // Shuffle array
    .slice(0, 3); // Get first 3 items
}

/**
 * Initialize a new savings challenge for the user
 * @param {string} challengeId - ID of the challenge template to start
 * @returns {Object} The newly created challenge object
 */
function startChallenge(challengeId) {
  const template = CHALLENGE_TEMPLATES.find(c => c.id === challengeId);
  
  if (!template) {
    throw new Error(`Challenge template with ID ${challengeId} not found`);
  }
  
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + template.duration);
  
  const newChallenge = {
    ...template,
    startDate: now,
    endDate: endDate,
    currentAmount: 0,
    progress: 0,
    entries: [],
    lastUpdated: now,
    status: 'active',
    milestonesClaimed: template.milestones.map(m => ({ ...m, claimed: false }))
  };
  
  // Add to active challenges
  activeChallenges.push(newChallenge);
  
  // Save to local storage
  saveChallengesToStorage();
  
  return newChallenge;
}

/**
 * Record a savings amount toward a challenge
 * @param {string} challengeId - ID of the challenge
 * @param {number} amount - Amount saved
 * @param {string} notes - Optional notes about this savings entry
 * @returns {Object} Updated challenge object
 */
function recordSavings(challengeId, amount, notes = '') {
  const challenge = activeChallenges.find(c => c.id === challengeId);
  
  if (!challenge) {
    throw new Error(`Active challenge with ID ${challengeId} not found`);
  }
  
  const entry = {
    date: new Date(),
    amount: amount,
    notes: notes
  };
  
  // Add the entry
  challenge.entries.push(entry);
  
  // Update totals
  challenge.currentAmount += amount;
  challenge.progress = Math.min(100, Math.round((challenge.currentAmount / challenge.targetAmount) * 100));
  challenge.lastUpdated = new Date();
  
  // Check if challenge is complete
  if (challenge.currentAmount >= challenge.targetAmount) {
    completeChallenge(challengeId);
  } else {
    // Check for milestone achievements
    checkAndAwardMilestones(challenge);
    
    // Save changes
    saveChallengesToStorage();
  }
  
  return challenge;
}

/**
 * Check if any milestones have been reached and award them
 * @param {Object} challenge - The challenge object
 */
function checkAndAwardMilestones(challenge) {
  challenge.milestonesClaimed.forEach((milestone, index) => {
    if (!milestone.claimed && challenge.progress >= challenge.milestones[index].progress) {
      // Mark milestone as claimed
      milestone.claimed = true;
      
      // Show notification
      createToast({
        title: 'Milestone Achieved!',
        message: `You've earned: ${challenge.milestones[index].reward}`,
        type: 'success',
        duration: 5000
      });
    }
  });
}

/**
 * Mark a challenge as complete and move it to completed challenges
 * @param {string} challengeId - ID of the challenge to complete
 */
function completeChallenge(challengeId) {
  const index = activeChallenges.findIndex(c => c.id === challengeId);
  
  if (index === -1) {
    throw new Error(`Active challenge with ID ${challengeId} not found`);
  }
  
  const challenge = activeChallenges[index];
  challenge.status = 'completed';
  challenge.completedDate = new Date();
  
  // Move to completed challenges
  completedChallenges.push(challenge);
  activeChallenges.splice(index, 1);
  
  // Save changes
  saveChallengesToStorage();
  
  // Show completion notification
  createToast({
    title: 'Challenge Completed!',
    message: `Congratulations! You've completed the ${challenge.title} challenge.`,
    type: 'success',
    duration: 7000
  });
  
  return challenge;
}

/**
 * Cancel an active challenge
 * @param {string} challengeId - ID of the challenge to cancel
 */
function cancelChallenge(challengeId) {
  const index = activeChallenges.findIndex(c => c.id === challengeId);
  
  if (index === -1) {
    throw new Error(`Active challenge with ID ${challengeId} not found`);
  }
  
  // Remove the challenge
  activeChallenges.splice(index, 1);
  
  // Save changes
  saveChallengesToStorage();
  
  createToast({
    title: 'Challenge Cancelled',
    message: 'The challenge has been cancelled.',
    type: 'info',
    duration: 3000
  });
}

/**
 * Save challenges to local storage
 */
function saveChallengesToStorage() {
  if (isAuthenticated()) {
    const userId = getCurrentUser().id;
    localStorage.setItem(`stackr_active_challenges_${userId}`, JSON.stringify(activeChallenges));
    localStorage.setItem(`stackr_completed_challenges_${userId}`, JSON.stringify(completedChallenges));
  }
}

/**
 * Load challenges from local storage
 */
function loadChallengesFromStorage() {
  if (isAuthenticated()) {
    const userId = getCurrentUser().id;
    
    const storedActive = localStorage.getItem(`stackr_active_challenges_${userId}`);
    if (storedActive) {
      activeChallenges = JSON.parse(storedActive);
      
      // Convert string dates back to Date objects
      activeChallenges.forEach(challenge => {
        challenge.startDate = new Date(challenge.startDate);
        challenge.endDate = new Date(challenge.endDate);
        challenge.lastUpdated = new Date(challenge.lastUpdated);
        challenge.entries.forEach(entry => {
          entry.date = new Date(entry.date);
        });
      });
    }
    
    const storedCompleted = localStorage.getItem(`stackr_completed_challenges_${userId}`);
    if (storedCompleted) {
      completedChallenges = JSON.parse(storedCompleted);
      
      // Convert string dates back to Date objects
      completedChallenges.forEach(challenge => {
        challenge.startDate = new Date(challenge.startDate);
        challenge.endDate = new Date(challenge.endDate);
        challenge.lastUpdated = new Date(challenge.lastUpdated);
        challenge.completedDate = new Date(challenge.completedDate);
        challenge.entries.forEach(entry => {
          entry.date = new Date(entry.date);
        });
      });
    }
  }
}

/**
 * Calculate statistics about challenge progress
 * @returns {Object} Challenge statistics
 */
function getChallengeStats() {
  const totalActive = activeChallenges.length;
  const totalCompleted = completedChallenges.length;
  const totalSaved = [...activeChallenges, ...completedChallenges].reduce((sum, challenge) => sum + challenge.currentAmount, 0);
  const streakDays = calculateCurrentStreak();
  
  return {
    totalActive,
    totalCompleted,
    totalSaved,
    streakDays
  };
}

/**
 * Calculate the current streak of days with challenge progress
 * @returns {number} Number of consecutive days with progress
 */
function calculateCurrentStreak() {
  // This is a simplified version - in a real app, this would be more sophisticated
  if (!activeChallenges.length) {
    return 0;
  }
  
  // Sort all entries by date, most recent first
  const allEntries = activeChallenges.flatMap(c => c.entries).sort((a, b) => b.date - a.date);
  
  if (!allEntries.length) {
    return 0;
  }
  
  let streak = 1;
  let currentDate = new Date(allEntries[0].date);
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 1; i < allEntries.length; i++) {
    const entryDate = new Date(allEntries[i].date);
    entryDate.setHours(0, 0, 0, 0);
    
    const daysBetween = Math.round((currentDate - entryDate) / (1000 * 60 * 60 * 24));
    
    if (daysBetween === 1) {
      streak++;
      currentDate = entryDate;
    } else if (daysBetween > 1) {
      break;
    }
  }
  
  return streak;
}

/**
 * Get challenge suggestions
 * @returns {Array} Suggested challenges
 */
function getSuggestedChallenges() {
  if (suggestedChallenges.length === 0) {
    suggestedChallenges = generateChallengeSuggestions();
  }
  return suggestedChallenges;
}

/**
 * Refresh challenge suggestions
 */
function refreshSuggestions() {
  suggestedChallenges = generateChallengeSuggestions();
}

/**
 * Return all active challenges
 * @returns {Array} Active challenges
 */
function getActiveChallenges() {
  return activeChallenges;
}

/**
 * Return all completed challenges
 * @returns {Array} Completed challenges
 */
function getCompletedChallenges() {
  return completedChallenges;
}

/**
 * Get a specific challenge by ID
 * @param {string} challengeId - ID of the challenge to get
 * @returns {Object} The challenge object
 */
function getChallengeById(challengeId) {
  return [...activeChallenges, ...completedChallenges].find(c => c.id === challengeId);
}

/**
 * Render the savings challenges page
 * @param {string} containerId - ID of the container element
 */
export function renderSavingsChallengesPage(containerId = 'app') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  // Render sidebar with savings challenges section active
  renderSidebar('savingschallenges');
  
  // Load challenges from storage
  loadChallengesFromStorage();
  
  // Create page wrapper
  const pageWrapper = document.createElement('div');
  pageWrapper.className = 'savings-challenges-wrapper';
  pageWrapper.style.padding = '20px';
  pageWrapper.style.maxWidth = '1200px';
  pageWrapper.style.margin = '0 auto';
  
  // Add page header
  const header = document.createElement('div');
  header.style.marginBottom = '24px';
  
  // Stackr logo at the top
  const logoContainer = document.createElement('div');
  logoContainer.style.display = 'flex';
  logoContainer.style.justifyContent = 'center';
  logoContainer.style.marginBottom = '24px';
  logoContainer.style.cursor = 'pointer';
  
  const logo = document.createElement('img');
  logo.src = '/green/public/stackr-logo.svg';
  logo.alt = 'Stackr Logo';
  logo.style.width = '180px';
  logo.style.height = 'auto';
  
  // Add click event to redirect to dashboard
  logoContainer.addEventListener('click', () => {
    window.location.hash = '#dashboard';
  });
  
  logoContainer.appendChild(logo);
  header.appendChild(logoContainer);
  
  // Page title
  const title = document.createElement('h1');
  title.textContent = 'Savings Challenges';
  title.style.fontSize = '32px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '8px';
  title.style.textAlign = 'center';
  title.style.background = 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)';
  title.style.WebkitBackgroundClip = 'text';
  title.style.backgroundClip = 'text';
  title.style.color = 'transparent';
  header.appendChild(title);
  
  // Page description
  const description = document.createElement('p');
  description.textContent = 'Gamify your savings goals with fun challenges to boost your financial progress.';
  description.style.fontSize = '16px';
  description.style.color = '#6b7280';
  description.style.marginBottom = '24px';
  description.style.textAlign = 'center';
  header.appendChild(description);
  
  pageWrapper.appendChild(header);
  
  // Stats cards
  const stats = getChallengeStats();
  const statsContainer = document.createElement('div');
  statsContainer.style.display = 'grid';
  statsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
  statsContainer.style.gap = '16px';
  statsContainer.style.marginBottom = '32px';
  
  const createStatCard = (title, value, icon) => {
    const card = document.createElement('div');
    card.style.backgroundColor = 'white';
    card.style.borderRadius = '8px';
    card.style.padding = '16px';
    card.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.justifyContent = 'center';
    
    const iconEl = document.createElement('div');
    iconEl.textContent = icon;
    iconEl.style.fontSize = '32px';
    iconEl.style.marginBottom = '8px';
    card.appendChild(iconEl);
    
    const valueEl = document.createElement('div');
    valueEl.textContent = value;
    valueEl.style.fontSize = '24px';
    valueEl.style.fontWeight = 'bold';
    valueEl.style.marginBottom = '4px';
    card.appendChild(valueEl);
    
    const titleEl = document.createElement('div');
    titleEl.textContent = title;
    titleEl.style.fontSize = '14px';
    titleEl.style.color = '#6b7280';
    card.appendChild(titleEl);
    
    return card;
  };
  
  statsContainer.appendChild(createStatCard('Active Challenges', stats.totalActive.toString(), '🏆'));
  statsContainer.appendChild(createStatCard('Completed', stats.totalCompleted.toString(), '✅'));
  statsContainer.appendChild(createStatCard('Total Saved', formatCurrency(stats.totalSaved), '💰'));
  statsContainer.appendChild(createStatCard('Day Streak', stats.streakDays.toString(), '🔥'));
  
  pageWrapper.appendChild(statsContainer);
  
  // Active challenges section
  const activeChallengesSection = document.createElement('div');
  activeChallengesSection.style.marginBottom = '40px';
  
  const activeChallengesTitle = document.createElement('h2');
  activeChallengesTitle.textContent = 'Active Challenges';
  activeChallengesTitle.style.fontSize = '24px';
  activeChallengesTitle.style.fontWeight = 'bold';
  activeChallengesTitle.style.marginBottom = '16px';
  activeChallengesTitle.style.color = '#111827';
  activeChallengesSection.appendChild(activeChallengesTitle);
  
  if (activeChallenges.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.style.backgroundColor = '#f9fafb';
    emptyState.style.padding = '32px';
    emptyState.style.borderRadius = '8px';
    emptyState.style.textAlign = 'center';
    
    const emptyIcon = document.createElement('div');
    emptyIcon.textContent = '🏆';
    emptyIcon.style.fontSize = '48px';
    emptyIcon.style.marginBottom = '16px';
    emptyState.appendChild(emptyIcon);
    
    const emptyText = document.createElement('p');
    emptyText.textContent = "You don't have any active challenges. Start one from the suggestions below!";
    emptyText.style.color = '#6b7280';
    emptyText.style.marginBottom = '16px';
    emptyState.appendChild(emptyText);
    
    activeChallengesSection.appendChild(emptyState);
  } else {
    const challengesGrid = document.createElement('div');
    challengesGrid.style.display = 'grid';
    challengesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    challengesGrid.style.gap = '16px';
    
    activeChallenges.forEach(challenge => {
      challengesGrid.appendChild(createChallengeCard(challenge, true));
    });
    
    activeChallengesSection.appendChild(challengesGrid);
  }
  
  pageWrapper.appendChild(activeChallengesSection);
  
  // Suggested challenges section
  const suggestedChallengesSection = document.createElement('div');
  suggestedChallengesSection.style.marginBottom = '40px';
  
  const suggestedHeader = document.createElement('div');
  suggestedHeader.style.display = 'flex';
  suggestedHeader.style.justifyContent = 'space-between';
  suggestedHeader.style.alignItems = 'center';
  suggestedHeader.style.marginBottom = '16px';
  
  const suggestedTitle = document.createElement('h2');
  suggestedTitle.textContent = 'Suggested Challenges';
  suggestedTitle.style.fontSize = '24px';
  suggestedTitle.style.fontWeight = 'bold';
  suggestedTitle.style.color = '#111827';
  suggestedHeader.appendChild(suggestedTitle);
  
  const refreshButton = document.createElement('button');
  refreshButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Refresh';
  refreshButton.style.display = 'flex';
  refreshButton.style.alignItems = 'center';
  refreshButton.style.gap = '8px';
  refreshButton.style.padding = '8px 16px';
  refreshButton.style.backgroundColor = '#f9fafb';
  refreshButton.style.border = '1px solid #e5e7eb';
  refreshButton.style.borderRadius = '6px';
  refreshButton.style.cursor = 'pointer';
  refreshButton.style.transition = 'all 0.2s ease';
  
  refreshButton.addEventListener('mouseenter', () => {
    refreshButton.style.backgroundColor = '#f3f4f6';
  });
  
  refreshButton.addEventListener('mouseleave', () => {
    refreshButton.style.backgroundColor = '#f9fafb';
  });
  
  refreshButton.addEventListener('click', () => {
    refreshSuggestions();
    renderSavingsChallengesPage(containerId);
  });
  
  suggestedHeader.appendChild(refreshButton);
  suggestedChallengesSection.appendChild(suggestedHeader);
  
  const suggestedGrid = document.createElement('div');
  suggestedGrid.style.display = 'grid';
  suggestedGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  suggestedGrid.style.gap = '16px';
  
  getSuggestedChallenges().forEach(challenge => {
    suggestedGrid.appendChild(createChallengeCard(challenge, false));
  });
  
  suggestedChallengesSection.appendChild(suggestedGrid);
  pageWrapper.appendChild(suggestedChallengesSection);
  
  // Completed challenges section (collapsed by default)
  if (completedChallenges.length > 0) {
    const completedSection = document.createElement('div');
    completedSection.style.marginBottom = '40px';
    
    const completedHeader = document.createElement('div');
    completedHeader.style.display = 'flex';
    completedHeader.style.justifyContent = 'space-between';
    completedHeader.style.alignItems = 'center';
    completedHeader.style.marginBottom = '16px';
    completedHeader.style.cursor = 'pointer';
    
    const completedTitle = document.createElement('h2');
    completedTitle.textContent = 'Completed Challenges';
    completedTitle.style.fontSize = '24px';
    completedTitle.style.fontWeight = 'bold';
    completedTitle.style.color = '#111827';
    completedHeader.appendChild(completedTitle);
    
    const expandIcon = document.createElement('div');
    expandIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    completedHeader.appendChild(expandIcon);
    
    completedSection.appendChild(completedHeader);
    
    const completedGrid = document.createElement('div');
    completedGrid.style.display = 'none';
    completedGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    completedGrid.style.gap = '16px';
    
    completedChallenges.forEach(challenge => {
      completedGrid.appendChild(createChallengeCard(challenge, false, true));
    });
    
    completedSection.appendChild(completedGrid);
    
    completedHeader.addEventListener('click', () => {
      if (completedGrid.style.display === 'none') {
        completedGrid.style.display = 'grid';
        expandIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
      } else {
        completedGrid.style.display = 'none';
        expandIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      }
    });
    
    pageWrapper.appendChild(completedSection);
  }
  
  container.appendChild(pageWrapper);
}

/**
 * Create a challenge card for display
 * @param {Object} challenge - Challenge data
 * @param {boolean} isActive - Whether this is an active challenge
 * @param {boolean} isCompleted - Whether this is a completed challenge
 * @returns {HTMLElement} The challenge card element
 */
function createChallengeCard(challenge, isActive, isCompleted = false) {
  const card = document.createElement('div');
  card.style.backgroundColor = 'white';
  card.style.borderRadius = '12px';
  card.style.overflow = 'hidden';
  card.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
  card.style.border = '1px solid #e5e7eb';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  
  // Card header
  const cardHeader = document.createElement('div');
  cardHeader.style.padding = '16px';
  cardHeader.style.borderBottom = '1px solid #e5e7eb';
  cardHeader.style.display = 'flex';
  cardHeader.style.alignItems = 'center';
  cardHeader.style.gap = '12px';
  
  const emoji = document.createElement('div');
  emoji.textContent = challenge.image;
  emoji.style.fontSize = '32px';
  cardHeader.appendChild(emoji);
  
  const headerText = document.createElement('div');
  
  const cardTitle = document.createElement('h3');
  cardTitle.textContent = challenge.title;
  cardTitle.style.fontSize = '18px';
  cardTitle.style.fontWeight = 'bold';
  cardTitle.style.marginBottom = '4px';
  headerText.appendChild(cardTitle);
  
  const difficultyBadge = document.createElement('span');
  difficultyBadge.textContent = challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1);
  difficultyBadge.style.fontSize = '12px';
  difficultyBadge.style.padding = '2px 8px';
  difficultyBadge.style.borderRadius = '9999px';
  
  // Set color based on difficulty
  switch (challenge.difficulty) {
    case 'easy':
      difficultyBadge.style.backgroundColor = '#d1fae5';
      difficultyBadge.style.color = '#065f46';
      break;
    case 'medium':
      difficultyBadge.style.backgroundColor = '#e0e7ff';
      difficultyBadge.style.color = '#3730a3';
      break;
    case 'hard':
      difficultyBadge.style.backgroundColor = '#fee2e2';
      difficultyBadge.style.color = '#991b1b';
      break;
    case 'expert':
      difficultyBadge.style.backgroundColor = '#fef3c7';
      difficultyBadge.style.color = '#92400e';
      break;
  }
  
  headerText.appendChild(difficultyBadge);
  cardHeader.appendChild(headerText);
  card.appendChild(cardHeader);
  
  // Card body
  const cardBody = document.createElement('div');
  cardBody.style.padding = '16px';
  cardBody.style.flex = '1';
  
  const description = document.createElement('p');
  description.textContent = challenge.description;
  description.style.marginBottom = '16px';
  description.style.color = '#6b7280';
  description.style.fontSize = '14px';
  cardBody.appendChild(description);
  
  // Challenge details
  const detailsGrid = document.createElement('div');
  detailsGrid.style.display = 'grid';
  detailsGrid.style.gridTemplateColumns = '1fr 1fr';
  detailsGrid.style.gap = '8px 16px';
  detailsGrid.style.marginBottom = '16px';
  
  const createDetailItem = (label, value) => {
    const item = document.createElement('div');
    
    const labelEl = document.createElement('div');
    labelEl.textContent = label;
    labelEl.style.fontSize = '12px';
    labelEl.style.color = '#6b7280';
    item.appendChild(labelEl);
    
    const valueEl = document.createElement('div');
    valueEl.textContent = value;
    valueEl.style.fontSize = '14px';
    valueEl.style.fontWeight = '500';
    item.appendChild(valueEl);
    
    return item;
  };
  
  detailsGrid.appendChild(createDetailItem('Target Amount', formatCurrency(challenge.targetAmount)));
  detailsGrid.appendChild(createDetailItem('Duration', `${challenge.duration} days`));
  detailsGrid.appendChild(createDetailItem('Savings Frequency', challenge.savingsFrequency.charAt(0).toUpperCase() + challenge.savingsFrequency.slice(1)));
  detailsGrid.appendChild(createDetailItem('Tip Amount', formatCurrency(challenge.tipAmount)));
  
  cardBody.appendChild(detailsGrid);
  
  // Progress bar for active challenges
  if (isActive || isCompleted) {
    const progressContainer = document.createElement('div');
    progressContainer.style.marginBottom = '16px';
    
    const progressLabel = document.createElement('div');
    progressLabel.style.display = 'flex';
    progressLabel.style.justifyContent = 'space-between';
    progressLabel.style.marginBottom = '4px';
    
    const progressText = document.createElement('div');
    progressText.textContent = 'Progress';
    progressText.style.fontSize = '14px';
    progressText.style.color = '#6b7280';
    progressLabel.appendChild(progressText);
    
    const progressPercent = document.createElement('div');
    progressPercent.textContent = `${challenge.progress}%`;
    progressPercent.style.fontSize = '14px';
    progressPercent.style.fontWeight = '500';
    progressLabel.appendChild(progressPercent);
    
    progressContainer.appendChild(progressLabel);
    
    const progressBarContainer = document.createElement('div');
    progressBarContainer.style.height = '8px';
    progressBarContainer.style.backgroundColor = '#e5e7eb';
    progressBarContainer.style.borderRadius = '4px';
    progressBarContainer.style.overflow = 'hidden';
    
    const progressBar = document.createElement('div');
    progressBar.style.height = '100%';
    progressBar.style.width = `${challenge.progress}%`;
    progressBar.style.backgroundColor = isCompleted ? '#10b981' : '#6366f1';
    progressBar.style.borderRadius = '4px';
    
    progressBarContainer.appendChild(progressBar);
    progressContainer.appendChild(progressBarContainer);
    
    // For active challenges, show amount
    if (isActive) {
      const amountContainer = document.createElement('div');
      amountContainer.style.marginTop = '8px';
      amountContainer.style.display = 'flex';
      amountContainer.style.justifyContent = 'space-between';
      
      const savedLabel = document.createElement('div');
      savedLabel.textContent = 'Saved';
      savedLabel.style.fontSize = '12px';
      savedLabel.style.color = '#6b7280';
      amountContainer.appendChild(savedLabel);
      
      const savedAmount = document.createElement('div');
      savedAmount.textContent = `${formatCurrency(challenge.currentAmount)} of ${formatCurrency(challenge.targetAmount)}`;
      savedAmount.style.fontSize = '12px';
      savedAmount.style.fontWeight = '500';
      amountContainer.appendChild(savedAmount);
      
      progressContainer.appendChild(amountContainer);
    }
    
    cardBody.appendChild(progressContainer);
  }
  
  // If completed, show completion details
  if (isCompleted && challenge.completedDate) {
    const completionInfo = document.createElement('div');
    completionInfo.style.backgroundColor = '#f0fdf4';
    completionInfo.style.padding = '12px';
    completionInfo.style.borderRadius = '6px';
    completionInfo.style.marginBottom = '16px';
    
    const completionIcon = document.createElement('div');
    completionIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    completionIcon.style.marginBottom = '8px';
    completionInfo.appendChild(completionIcon);
    
    const completionTitle = document.createElement('div');
    completionTitle.textContent = 'Challenge Completed!';
    completionTitle.style.fontWeight = '600';
    completionTitle.style.marginBottom = '4px';
    completionInfo.appendChild(completionTitle);
    
    const completionDate = document.createElement('div');
    completionDate.textContent = `Completed on ${challenge.completedDate.toLocaleDateString()}`;
    completionDate.style.fontSize = '12px';
    completionDate.style.color = '#059669';
    completionInfo.appendChild(completionDate);
    
    cardBody.appendChild(completionInfo);
  }
  
  card.appendChild(cardBody);
  
  // Card footer with actions
  const cardFooter = document.createElement('div');
  cardFooter.style.padding = '16px';
  cardFooter.style.borderTop = '1px solid #e5e7eb';
  cardFooter.style.display = 'flex';
  cardFooter.style.alignItems = 'center';
  cardFooter.style.justifyContent = 'space-between';
  
  if (isActive) {
    // For active challenges, show Add Progress and Cancel buttons
    const addProgressButton = document.createElement('button');
    addProgressButton.textContent = 'Add Progress';
    addProgressButton.style.padding = '8px 16px';
    addProgressButton.style.backgroundColor = '#6366f1';
    addProgressButton.style.color = 'white';
    addProgressButton.style.border = 'none';
    addProgressButton.style.borderRadius = '6px';
    addProgressButton.style.fontWeight = '500';
    addProgressButton.style.cursor = 'pointer';
    addProgressButton.style.transition = 'all 0.2s ease';
    
    addProgressButton.addEventListener('mouseenter', () => {
      addProgressButton.style.backgroundColor = '#4f46e5';
    });
    
    addProgressButton.addEventListener('mouseleave', () => {
      addProgressButton.style.backgroundColor = '#6366f1';
    });
    
    addProgressButton.addEventListener('click', () => {
      showAddProgressModal(challenge.id);
    });
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = 'transparent';
    cancelButton.style.color = '#6b7280';
    cancelButton.style.border = 'none';
    cancelButton.style.fontWeight = '500';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.transition = 'all 0.2s ease';
    
    cancelButton.addEventListener('mouseenter', () => {
      cancelButton.style.color = '#111827';
    });
    
    cancelButton.addEventListener('mouseleave', () => {
      cancelButton.style.color = '#6b7280';
    });
    
    cancelButton.addEventListener('click', () => {
      showCancelConfirmationModal(challenge.id);
    });
    
    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '8px';
    buttonGroup.appendChild(addProgressButton);
    buttonGroup.appendChild(cancelButton);
    
    cardFooter.appendChild(buttonGroup);
  } else if (!isCompleted) {
    // For suggested challenges, show Start Challenge button
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Challenge';
    startButton.style.padding = '8px 16px';
    startButton.style.backgroundColor = '#6366f1';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '6px';
    startButton.style.fontWeight = '500';
    startButton.style.cursor = 'pointer';
    startButton.style.transition = 'all 0.2s ease';
    
    startButton.addEventListener('mouseenter', () => {
      startButton.style.backgroundColor = '#4f46e5';
    });
    
    startButton.addEventListener('mouseleave', () => {
      startButton.style.backgroundColor = '#6366f1';
    });
    
    startButton.addEventListener('click', () => {
      startChallenge(challenge.id);
      renderSavingsChallengesPage();
      createToast({
        title: 'Challenge Started!',
        message: `You've started the ${challenge.title} challenge.`,
        type: 'success',
        duration: 5000
      });
    });
    
    cardFooter.appendChild(startButton);
  } else {
    // For completed challenges, show a "View Details" button
    const viewDetailsButton = document.createElement('button');
    viewDetailsButton.textContent = 'View Details';
    viewDetailsButton.style.padding = '8px 16px';
    viewDetailsButton.style.backgroundColor = '#f9fafb';
    viewDetailsButton.style.color = '#111827';
    viewDetailsButton.style.border = '1px solid #e5e7eb';
    viewDetailsButton.style.borderRadius = '6px';
    viewDetailsButton.style.fontWeight = '500';
    viewDetailsButton.style.cursor = 'pointer';
    viewDetailsButton.style.transition = 'all 0.2s ease';
    
    viewDetailsButton.addEventListener('mouseenter', () => {
      viewDetailsButton.style.backgroundColor = '#f3f4f6';
    });
    
    viewDetailsButton.addEventListener('mouseleave', () => {
      viewDetailsButton.style.backgroundColor = '#f9fafb';
    });
    
    viewDetailsButton.addEventListener('click', () => {
      showChallengeDetailsModal(challenge.id);
    });
    
    cardFooter.appendChild(viewDetailsButton);
  }
  
  card.appendChild(cardFooter);
  
  return card;
}

/**
 * Show a modal to add progress to a challenge
 * @param {string} challengeId - ID of the challenge
 */
function showAddProgressModal(challengeId) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) return;
  
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '9999';
  
  // Create modal container
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.padding = '24px';
  modal.style.maxWidth = '400px';
  modal.style.width = '90%';
  
  // Create modal header
  const header = document.createElement('div');
  header.style.marginBottom = '16px';
  
  const title = document.createElement('h2');
  title.textContent = 'Add Progress';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '8px';
  header.appendChild(title);
  
  const subtitle = document.createElement('p');
  subtitle.textContent = challenge.title;
  subtitle.style.fontSize = '14px';
  subtitle.style.color = '#6b7280';
  header.appendChild(subtitle);
  
  modal.appendChild(header);
  
  // Create form
  const form = document.createElement('form');
  
  // Amount field
  const amountGroup = document.createElement('div');
  amountGroup.style.marginBottom = '16px';
  
  const amountLabel = document.createElement('label');
  amountLabel.textContent = 'Amount Saved';
  amountLabel.style.display = 'block';
  amountLabel.style.marginBottom = '4px';
  amountLabel.style.fontSize = '14px';
  amountLabel.style.fontWeight = '500';
  amountGroup.appendChild(amountLabel);
  
  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.min = '0.01';
  amountInput.step = '0.01';
  amountInput.placeholder = '0.00';
  amountInput.required = true;
  amountInput.style.width = '100%';
  amountInput.style.padding = '8px 12px';
  amountInput.style.border = '1px solid #e5e7eb';
  amountInput.style.borderRadius = '6px';
  amountInput.style.fontSize = '16px';
  amountGroup.appendChild(amountInput);
  
  // Suggested amounts
  const suggestedAmounts = document.createElement('div');
  suggestedAmounts.style.display = 'flex';
  suggestedAmounts.style.gap = '8px';
  suggestedAmounts.style.marginTop = '8px';
  
  const createSuggestedAmount = (amount) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = formatCurrency(amount);
    button.style.padding = '4px 8px';
    button.style.border = '1px solid #e5e7eb';
    button.style.borderRadius = '4px';
    button.style.backgroundColor = '#f9fafb';
    button.style.fontSize = '12px';
    button.style.cursor = 'pointer';
    
    button.addEventListener('click', () => {
      amountInput.value = amount.toString();
    });
    
    return button;
  };
  
  suggestedAmounts.appendChild(createSuggestedAmount(challenge.tipAmount));
  suggestedAmounts.appendChild(createSuggestedAmount(challenge.tipAmount * 2));
  suggestedAmounts.appendChild(createSuggestedAmount(challenge.tipAmount * 5));
  
  amountGroup.appendChild(suggestedAmounts);
  form.appendChild(amountGroup);
  
  // Notes field
  const notesGroup = document.createElement('div');
  notesGroup.style.marginBottom = '24px';
  
  const notesLabel = document.createElement('label');
  notesLabel.textContent = 'Notes (Optional)';
  notesLabel.style.display = 'block';
  notesLabel.style.marginBottom = '4px';
  notesLabel.style.fontSize = '14px';
  notesLabel.style.fontWeight = '500';
  notesGroup.appendChild(notesLabel);
  
  const notesInput = document.createElement('textarea');
  notesInput.placeholder = 'What did you do to save this money?';
  notesInput.style.width = '100%';
  notesInput.style.padding = '8px 12px';
  notesInput.style.border = '1px solid #e5e7eb';
  notesInput.style.borderRadius = '6px';
  notesInput.style.fontSize = '14px';
  notesInput.style.minHeight = '80px';
  notesInput.style.resize = 'vertical';
  notesGroup.appendChild(notesInput);
  
  form.appendChild(notesGroup);
  
  // Buttons
  const buttonGroup = document.createElement('div');
  buttonGroup.style.display = 'flex';
  buttonGroup.style.justifyContent = 'flex-end';
  buttonGroup.style.gap = '8px';
  
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '8px 16px';
  cancelButton.style.backgroundColor = '#f9fafb';
  cancelButton.style.color = '#111827';
  cancelButton.style.border = '1px solid #e5e7eb';
  cancelButton.style.borderRadius = '6px';
  cancelButton.style.fontWeight = '500';
  cancelButton.style.cursor = 'pointer';
  
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.textContent = 'Save Progress';
  saveButton.style.padding = '8px 16px';
  saveButton.style.backgroundColor = '#6366f1';
  saveButton.style.color = 'white';
  saveButton.style.border = 'none';
  saveButton.style.borderRadius = '6px';
  saveButton.style.fontWeight = '500';
  saveButton.style.cursor = 'pointer';
  
  buttonGroup.appendChild(cancelButton);
  buttonGroup.appendChild(saveButton);
  
  form.appendChild(buttonGroup);
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
      createToast({
        title: 'Invalid Amount',
        message: 'Please enter a valid amount greater than zero.',
        type: 'error',
        duration: 3000
      });
      return;
    }
    
    try {
      recordSavings(challengeId, amount, notesInput.value);
      document.body.removeChild(overlay);
      renderSavingsChallengesPage();
      
      createToast({
        title: 'Progress Added!',
        message: `Added ${formatCurrency(amount)} to your challenge.`,
        type: 'success',
        duration: 3000
      });
    } catch (error) {
      createToast({
        title: 'Error',
        message: error.message,
        type: 'error',
        duration: 3000
      });
    }
  });
  
  modal.appendChild(form);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

/**
 * Show a modal to confirm cancellation of a challenge
 * @param {string} challengeId - ID of the challenge to cancel
 */
function showCancelConfirmationModal(challengeId) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) return;
  
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '9999';
  
  // Create modal container
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.padding = '24px';
  modal.style.maxWidth = '400px';
  modal.style.width = '90%';
  
  // Create modal content
  const content = document.createElement('div');
  
  const title = document.createElement('h2');
  title.textContent = 'Cancel Challenge?';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '16px';
  content.appendChild(title);
  
  const message = document.createElement('p');
  message.textContent = `Are you sure you want to cancel the "${challenge.title}" challenge? Your progress will be lost.`;
  message.style.fontSize = '14px';
  message.style.color = '#6b7280';
  message.style.marginBottom = '24px';
  content.appendChild(message);
  
  // Buttons
  const buttonGroup = document.createElement('div');
  buttonGroup.style.display = 'flex';
  buttonGroup.style.justifyContent = 'flex-end';
  buttonGroup.style.gap = '8px';
  
  const cancelButtonAction = document.createElement('button');
  cancelButtonAction.textContent = 'No, Keep Challenge';
  cancelButtonAction.style.padding = '8px 16px';
  cancelButtonAction.style.backgroundColor = '#f9fafb';
  cancelButtonAction.style.color = '#111827';
  cancelButtonAction.style.border = '1px solid #e5e7eb';
  cancelButtonAction.style.borderRadius = '6px';
  cancelButtonAction.style.fontWeight = '500';
  cancelButtonAction.style.cursor = 'pointer';
  
  cancelButtonAction.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  const confirmButton = document.createElement('button');
  confirmButton.textContent = 'Yes, Cancel Challenge';
  confirmButton.style.padding = '8px 16px';
  confirmButton.style.backgroundColor = '#ef4444';
  confirmButton.style.color = 'white';
  confirmButton.style.border = 'none';
  confirmButton.style.borderRadius = '6px';
  confirmButton.style.fontWeight = '500';
  confirmButton.style.cursor = 'pointer';
  
  confirmButton.addEventListener('click', () => {
    try {
      cancelChallenge(challengeId);
      document.body.removeChild(overlay);
      renderSavingsChallengesPage();
    } catch (error) {
      createToast({
        title: 'Error',
        message: error.message,
        type: 'error',
        duration: 3000
      });
    }
  });
  
  buttonGroup.appendChild(cancelButtonAction);
  buttonGroup.appendChild(confirmButton);
  
  content.appendChild(buttonGroup);
  modal.appendChild(content);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

/**
 * Show a modal with challenge details
 * @param {string} challengeId - ID of the challenge
 */
function showChallengeDetailsModal(challengeId) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) return;
  
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '9999';
  
  // Create modal container
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.padding = '24px';
  modal.style.maxWidth = '500px';
  modal.style.width = '90%';
  modal.style.maxHeight = '90vh';
  modal.style.overflowY = 'auto';
  
  // Create modal header
  const header = document.createElement('div');
  header.style.marginBottom = '16px';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.gap = '16px';
  
  const emoji = document.createElement('div');
  emoji.textContent = challenge.image;
  emoji.style.fontSize = '36px';
  header.appendChild(emoji);
  
  const headerText = document.createElement('div');
  
  const title = document.createElement('h2');
  title.textContent = challenge.title;
  title.style.fontSize = '24px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '4px';
  headerText.appendChild(title);
  
  const subtitle = document.createElement('div');
  subtitle.textContent = challenge.status === 'completed' ? 'Completed Challenge' : 'Challenge Details';
  subtitle.style.fontSize = '14px';
  subtitle.style.color = '#6b7280';
  headerText.appendChild(subtitle);
  
  header.appendChild(headerText);
  
  const closeButton = document.createElement('button');
  closeButton.style.marginLeft = 'auto';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  header.appendChild(closeButton);
  modal.appendChild(header);
  
  // Challenge description
  const description = document.createElement('p');
  description.textContent = challenge.description;
  description.style.marginBottom = '24px';
  description.style.color = '#6b7280';
  modal.appendChild(description);
  
  // Challenge milestones
  const milestonesSection = document.createElement('div');
  milestonesSection.style.marginBottom = '24px';
  
  const milestonesTitle = document.createElement('h3');
  milestonesTitle.textContent = 'Milestones';
  milestonesTitle.style.fontSize = '18px';
  milestonesTitle.style.fontWeight = '600';
  milestonesTitle.style.marginBottom = '12px';
  milestonesSection.appendChild(milestonesTitle);
  
  const milestonesList = document.createElement('div');
  milestonesList.style.display = 'grid';
  milestonesList.style.gap = '12px';
  
  challenge.milestones.forEach((milestone, index) => {
    const isClaimed = challenge.milestonesClaimed?.[index]?.claimed || false;
    
    const milestoneItem = document.createElement('div');
    milestoneItem.style.display = 'flex';
    milestoneItem.style.alignItems = 'center';
    milestoneItem.style.gap = '12px';
    milestoneItem.style.padding = '8px 12px';
    milestoneItem.style.borderRadius = '6px';
    milestoneItem.style.backgroundColor = isClaimed ? '#f0fdf4' : '#f9fafb';
    
    const checkIcon = document.createElement('div');
    checkIcon.innerHTML = isClaimed 
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>';
    milestoneItem.appendChild(checkIcon);
    
    const milestoneText = document.createElement('div');
    
    const milestoneProgress = document.createElement('div');
    milestoneProgress.textContent = `${milestone.progress}% Complete`;
    milestoneProgress.style.fontSize = '14px';
    milestoneProgress.style.fontWeight = '500';
    milestoneText.appendChild(milestoneProgress);
    
    const milestoneReward = document.createElement('div');
    milestoneReward.textContent = milestone.reward;
    milestoneReward.style.fontSize = '12px';
    milestoneReward.style.color = isClaimed ? '#059669' : '#6b7280';
    milestoneText.appendChild(milestoneReward);
    
    milestoneItem.appendChild(milestoneText);
    milestonesList.appendChild(milestoneItem);
  });
  
  milestonesSection.appendChild(milestonesList);
  modal.appendChild(milestonesSection);
  
  // Challenge entries
  if (challenge.entries && challenge.entries.length > 0) {
    const entriesSection = document.createElement('div');
    
    const entriesTitle = document.createElement('h3');
    entriesTitle.textContent = 'Savings Entries';
    entriesTitle.style.fontSize = '18px';
    entriesTitle.style.fontWeight = '600';
    entriesTitle.style.marginBottom = '12px';
    entriesSection.appendChild(entriesTitle);
    
    const entriesList = document.createElement('div');
    entriesList.style.display = 'grid';
    entriesList.style.gap = '8px';
    
    challenge.entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      
      const entryItem = document.createElement('div');
      entryItem.style.display = 'flex';
      entryItem.style.justifyContent = 'space-between';
      entryItem.style.padding = '8px';
      entryItem.style.borderBottom = '1px solid #e5e7eb';
      
      const entryLeft = document.createElement('div');
      
      const entryDateEl = document.createElement('div');
      entryDateEl.textContent = entryDate.toLocaleDateString();
      entryDateEl.style.fontSize = '14px';
      entryDateEl.style.fontWeight = '500';
      entryLeft.appendChild(entryDateEl);
      
      if (entry.notes) {
        const entryNotes = document.createElement('div');
        entryNotes.textContent = entry.notes;
        entryNotes.style.fontSize = '12px';
        entryNotes.style.color = '#6b7280';
        entryLeft.appendChild(entryNotes);
      }
      
      entryItem.appendChild(entryLeft);
      
      const entryAmount = document.createElement('div');
      entryAmount.textContent = formatCurrency(entry.amount);
      entryAmount.style.fontSize = '14px';
      entryAmount.style.fontWeight = '500';
      entryItem.appendChild(entryAmount);
      
      entriesList.appendChild(entryItem);
    });
    
    entriesSection.appendChild(entriesList);
    modal.appendChild(entriesSection);
  }
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// Export public functions
export {
  renderSavingsChallengesPage,
  startChallenge,
  recordSavings,
  cancelChallenge,
  getActiveChallenges,
  getCompletedChallenges,
  getChallengeStats
};