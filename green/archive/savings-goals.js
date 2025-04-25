/**
 * Savings Goals component for Stackr Finance
 * This module helps users track progress towards financial goals
 */

import { appState } from './src/main.js';

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Get goal categories
function getGoalCategories() {
  return [
    { id: 'emergency', name: 'Emergency Fund', icon: '🚨', color: '#f87171' },
    { id: 'vacation', name: 'Vacation', icon: '✈️', color: '#60a5fa' },
    { id: 'home', name: 'Home Purchase', icon: '🏠', color: '#34d399' },
    { id: 'car', name: 'Vehicle', icon: '🚗', color: '#a78bfa' },
    { id: 'education', name: 'Education', icon: '🎓', color: '#fbbf24' },
    { id: 'retirement', name: 'Retirement', icon: '👵', color: '#ec4899' },
    { id: 'wedding', name: 'Wedding', icon: '💍', color: '#8b5cf6' },
    { id: 'gadget', name: 'Electronics', icon: '📱', color: '#6366f1' },
    { id: 'debt', name: 'Debt Payoff', icon: '💳', color: '#ef4444' },
    { id: 'investment', name: 'Investment', icon: '📈', color: '#10b981' },
    { id: 'other', name: 'Other', icon: '🎯', color: '#6b7280' }
  ];
}

// Get goals from app state or generate sample data
function getSavingsGoals() {
  if (!appState.goals || appState.goals.length === 0) {
    const today = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    
    const yearEnd = new Date(today.getFullYear(), 11, 31);
    
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    return [
      {
        id: 1,
        name: 'Emergency Fund',
        category: 'emergency',
        target: 10000,
        current: 6500,
        startDate: new Date(today.getFullYear(), today.getMonth() - 3, 15).toISOString(),
        targetDate: sixMonthsLater.toISOString(),
        priority: 'high',
        notes: '6 months of living expenses',
        contributions: [
          {
            id: 1,
            date: new Date(today.getFullYear(), today.getMonth() - 2, 15).toISOString(),
            amount: 2000,
            source: 'Initial deposit'
          },
          {
            id: 2,
            date: new Date(today.getFullYear(), today.getMonth() - 1, 15).toISOString(),
            amount: 2000,
            source: 'Monthly transfer'
          },
          {
            id: 3,
            date: new Date(today.getFullYear(), today.getMonth(), 15).toISOString(),
            amount: 2500,
            source: 'Bonus'
          }
        ]
      },
      {
        id: 2,
        name: 'New Laptop',
        category: 'gadget',
        target: 2500,
        current: 1200,
        startDate: new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString(),
        targetDate: yearEnd.toISOString(),
        priority: 'medium',
        notes: 'MacBook Pro for freelance work',
        contributions: [
          {
            id: 1,
            date: new Date(today.getFullYear(), today.getMonth() - 2, 15).toISOString(),
            amount: 500,
            source: 'Initial savings'
          },
          {
            id: 2,
            date: new Date(today.getFullYear(), today.getMonth() - 1, 15).toISOString(),
            amount: 400,
            source: 'Monthly transfer'
          },
          {
            id: 3,
            date: new Date(today.getFullYear(), today.getMonth(), 15).toISOString(),
            amount: 300,
            source: 'Side gig'
          }
        ]
      },
      {
        id: 3,
        name: 'Summer Vacation',
        category: 'vacation',
        target: 3000,
        current: 2200,
        startDate: new Date(today.getFullYear(), today.getMonth() - 4, 1).toISOString(),
        targetDate: new Date(today.getFullYear(), 6, 1).toISOString(),
        priority: 'medium',
        notes: 'Beach vacation with friends',
        contributions: [
          {
            id: 1,
            date: new Date(today.getFullYear(), today.getMonth() - 4, 15).toISOString(),
            amount: 600,
            source: 'Initial savings'
          },
          {
            id: 2,
            date: new Date(today.getFullYear(), today.getMonth() - 3, 15).toISOString(),
            amount: 500,
            source: 'Monthly transfer'
          },
          {
            id: 3,
            date: new Date(today.getFullYear(), today.getMonth() - 2, 15).toISOString(),
            amount: 550,
            source: 'Monthly transfer'
          },
          {
            id: 4,
            date: new Date(today.getFullYear(), today.getMonth() - 1, 15).toISOString(),
            amount: 550,
            source: 'Monthly transfer'
          }
        ]
      }
    ];
  }
  
  return appState.goals;
}

// Calculate goal progress
function calculateGoalProgress(goal) {
  if (!goal) return 0;
  
  const progressPercent = Math.min(100, Math.round((goal.current / goal.target) * 100));
  return progressPercent;
}

// Calculate time progress
function calculateTimeProgress(goal) {
  if (!goal) return 0;
  
  const now = new Date();
  const startDate = new Date(goal.startDate);
  const targetDate = new Date(goal.targetDate);
  
  // If the target date is in the past, return 100%
  if (now > targetDate) return 100;
  
  // Calculate total duration and elapsed time
  const totalDuration = targetDate - startDate;
  const elapsedTime = now - startDate;
  
  // Calculate progress percentage
  const progressPercent = Math.min(100, Math.round((elapsedTime / totalDuration) * 100));
  return progressPercent;
}

// Calculate monthly contribution needed
function calculateMonthlyContribution(goal) {
  if (!goal) return 0;
  
  const now = new Date();
  const targetDate = new Date(goal.targetDate);
  
  // If the target date is in the past, return the full remaining amount
  if (now > targetDate) return goal.target - goal.current;
  
  // Calculate months remaining
  const monthsRemaining = (targetDate.getFullYear() - now.getFullYear()) * 12 + 
                          (targetDate.getMonth() - now.getMonth());
  
  // If less than a month remains, return the full remaining amount
  if (monthsRemaining < 1) return goal.target - goal.current;
  
  // Calculate monthly contribution needed
  const remaining = goal.target - goal.current;
  const monthlyContribution = remaining / monthsRemaining;
  
  return monthlyContribution;
}

// Save goal to app state
function saveGoal(goal) {
  if (!appState.goals) {
    appState.goals = [];
  }
  
  // Generate ID if not provided
  if (!goal.id) {
    goal.id = Date.now();
  }
  
  // If editing an existing goal, replace it
  const existingIndex = appState.goals.findIndex(g => g.id === goal.id);
  if (existingIndex !== -1) {
    appState.goals[existingIndex] = goal;
  } else {
    // Add new goal
    appState.goals.push(goal);
  }
  
  // Save to local storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('stackr-finance-state', JSON.stringify(appState));
      console.log('Goal saved successfully');
    } catch (error) {
      console.error('Error saving goal to localStorage:', error);
    }
  }
  
  return goal;
}

// Delete goal
function deleteGoal(goalId) {
  if (!appState.goals) return false;
  
  const initialLength = appState.goals.length;
  appState.goals = appState.goals.filter(goal => goal.id !== goalId);
  
  if (appState.goals.length < initialLength) {
    // Save to local storage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('stackr-finance-state', JSON.stringify(appState));
        console.log('Goal deleted successfully');
      } catch (error) {
        console.error('Error saving state to localStorage after deletion:', error);
      }
    }
    
    return true;
  }
  
  return false;
}

// Add contribution to goal
function addContribution(goalId, contribution) {
  if (!appState.goals) return false;
  
  const goal = appState.goals.find(g => g.id === goalId);
  if (!goal) return false;
  
  // Generate ID for contribution if not provided
  if (!contribution.id) {
    contribution.id = Date.now();
  }
  
  // Initialize contributions array if not exists
  if (!goal.contributions) {
    goal.contributions = [];
  }
  
  // Add contribution
  goal.contributions.push(contribution);
  
  // Update current amount
  goal.current += contribution.amount;
  
  // Save to local storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('stackr-finance-state', JSON.stringify(appState));
      console.log('Contribution added successfully');
    } catch (error) {
      console.error('Error saving contribution to localStorage:', error);
    }
  }
  
  return goal;
}

// Format time remaining
function formatTimeRemaining(targetDateStr) {
  const targetDate = new Date(targetDateStr);
  const now = new Date();
  
  // If target date is in the past
  if (now > targetDate) {
    return 'Past due';
  }
  
  const diff = targetDate - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days < 1) {
    return 'Due today';
  }
  
  if (days === 1) {
    return '1 day remaining';
  }
  
  if (days < 30) {
    return `${days} days remaining`;
  }
  
  const months = Math.floor(days / 30);
  
  if (months === 1) {
    return '1 month remaining';
  }
  
  if (months < 12) {
    return `${months} months remaining`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 1 && remainingMonths === 0) {
    return '1 year remaining';
  }
  
  if (remainingMonths === 0) {
    return `${years} years remaining`;
  }
  
  if (years === 1) {
    return `1 year, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} remaining`;
  }
  
  return `${years} years, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} remaining`;
}

// Render the Savings Goals page
export function renderSavingsGoalsPage() {
  // Main container
  const goalsContainer = document.createElement('div');
  goalsContainer.className = 'savings-goals-container p-4 max-w-6xl mx-auto';
  
  // Get savings goals and categories
  const goals = getSavingsGoals();
  const categories = getGoalCategories();
  
  // Calculate totals
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  
  // Header section
  const header = document.createElement('header');
  header.className = 'mb-6';
  header.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold mb-1">Savings Goals</h1>
        <p class="text-gray-600">Track progress towards your financial goals</p>
      </div>
      <div class="mt-4 md:mt-0">
        <button id="add-goal-btn" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
          + Add Goal
        </button>
      </div>
    </div>
  `;
  goalsContainer.appendChild(header);
  
  // Summary cards
  const summarySection = document.createElement('section');
  summarySection.className = 'summary-cards grid grid-cols-1 md:grid-cols-3 gap-4 mb-8';
  
  // Total progress card
  const progressCard = document.createElement('div');
  progressCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  progressCard.innerHTML = `
    <div class="card-header mb-2">
      <h3 class="text-lg font-semibold">Overall Progress</h3>
    </div>
    <div class="card-value text-2xl font-bold">${overallProgress}%</div>
    <div class="text-sm text-gray-600 mt-1">${formatCurrency(totalSaved)} of ${formatCurrency(totalTarget)}</div>
    
    <div class="mt-3">
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-primary h-2.5 rounded-full" style="width: ${overallProgress}%"></div>
      </div>
    </div>
  `;
  
  // Active goals card
  const activeCard = document.createElement('div');
  activeCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  activeCard.innerHTML = `
    <div class="card-header mb-2">
      <h3 class="text-lg font-semibold">Active Goals</h3>
    </div>
    <div class="card-value text-2xl font-bold">${goals.length}</div>
    <div class="text-sm text-gray-600 mt-1">
      ${goals.filter(goal => calculateGoalProgress(goal) >= 100).length} completed
    </div>
    
    <div class="mt-3 pt-3 border-t border-gray-100">
      <div class="grid grid-cols-3 gap-2">
        <div class="text-center">
          <div class="text-sm font-medium">High Priority</div>
          <div class="text-xl">${goals.filter(goal => goal.priority === 'high').length}</div>
        </div>
        <div class="text-center">
          <div class="text-sm font-medium">Medium</div>
          <div class="text-xl">${goals.filter(goal => goal.priority === 'medium').length}</div>
        </div>
        <div class="text-center">
          <div class="text-sm font-medium">Low</div>
          <div class="text-xl">${goals.filter(goal => goal.priority === 'low' || !goal.priority).length}</div>
        </div>
      </div>
    </div>
  `;
  
  // Next goals card
  const nextGoalsCard = document.createElement('div');
  nextGoalsCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  
  // Sort goals by time progress
  const sortedGoals = [...goals].sort((a, b) => {
    return new Date(a.targetDate) - new Date(b.targetDate);
  });
  
  const nextGoals = sortedGoals.filter(goal => calculateGoalProgress(goal) < 100).slice(0, 2);
  
  nextGoalsCard.innerHTML = `
    <div class="card-header mb-2">
      <h3 class="text-lg font-semibold">Upcoming Goals</h3>
    </div>
    
    ${nextGoals.length > 0 ? `
      <div class="next-goals space-y-3">
        ${nextGoals.map(goal => {
          const category = categories.find(cat => cat.id === goal.category) || { name: 'Other', icon: '🎯' };
          const progress = calculateGoalProgress(goal);
          
          return `
            <div class="goal-item flex items-center">
              <div class="goal-icon mr-3 text-2xl">${category.icon}</div>
              <div class="flex-1">
                <div class="font-medium">${goal.name}</div>
                <div class="text-xs text-gray-600">${formatTimeRemaining(goal.targetDate)}</div>
                <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div class="h-1.5 rounded-full" style="width: ${progress}%; background-color: ${category.color}"></div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium">${formatCurrency(goal.current)}</div>
                <div class="text-xs text-gray-600">of ${formatCurrency(goal.target)}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : `
      <div class="text-center py-4 text-gray-500">
        <p>No active goals</p>
        <p class="text-sm">Create a new savings goal to get started</p>
      </div>
    `}
  `;
  
  summarySection.appendChild(progressCard);
  summarySection.appendChild(activeCard);
  summarySection.appendChild(nextGoalsCard);
  goalsContainer.appendChild(summarySection);
  
  // Goals list section
  const goalsListSection = document.createElement('section');
  goalsListSection.className = 'goals-list mb-8';
  goalsListSection.innerHTML = `
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Your Goals</h2>
        <div class="flex space-x-2">
          <select id="goals-filter" class="p-2 border rounded-md text-sm">
            <option value="all">All Categories</option>
            ${categories.map(category => `
              <option value="${category.id}">${category.icon} ${category.name}</option>
            `).join('')}
          </select>
          <select id="goals-sort" class="p-2 border rounded-md text-sm">
            <option value="progress">Progress</option>
            <option value="date">Target Date</option>
            <option value="amount">Amount</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>
      
      ${goals.length > 0 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="goals-grid">
          ${goals.map(goal => {
            const category = categories.find(cat => cat.id === goal.category) || { name: 'Other', icon: '🎯', color: '#6b7280' };
            const progress = calculateGoalProgress(goal);
            const timeProgress = calculateTimeProgress(goal);
            const monthlyAmount = calculateMonthlyContribution(goal);
            
            // Determine status badge
            let statusBadge = '';
            let statusClass = '';
            
            if (progress >= 100) {
              statusBadge = 'Completed';
              statusClass = 'bg-green-100 text-green-800';
            } else if (timeProgress > 90 && progress < 90) {
              statusBadge = 'At Risk';
              statusClass = 'bg-red-100 text-red-800';
            } else if (timeProgress > progress + 10) {
              statusBadge = 'Behind';
              statusClass = 'bg-yellow-100 text-yellow-800';
            } else if (progress > timeProgress + 10) {
              statusBadge = 'Ahead';
              statusClass = 'bg-blue-100 text-blue-800';
            } else {
              statusBadge = 'On Track';
              statusClass = 'bg-gray-100 text-gray-800';
            }
            
            return `
              <div class="goal-card border rounded-lg overflow-hidden" data-goal-id="${goal.id}" data-category="${goal.category}" data-priority="${goal.priority || 'low'}">
                <div class="goal-header p-4 flex justify-between items-center border-b" style="background-color: ${category.color}15">
                  <div class="flex items-center">
                    <div class="text-2xl mr-2" style="color: ${category.color}">${category.icon}</div>
                    <div>
                      <div class="font-medium">${goal.name}</div>
                      <div class="text-xs text-gray-500">${category.name}</div>
                    </div>
                  </div>
                  <div>
                    <span class="px-2 py-1 text-xs rounded-full ${statusClass}">
                      ${statusBadge}
                    </span>
                  </div>
                </div>
                <div class="goal-body p-4">
                  <div class="flex justify-between mb-1">
                    <div class="text-sm text-gray-500">Progress</div>
                    <div class="font-medium">${progress}%</div>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                    <div class="h-1.5 rounded-full" style="width: ${progress}%; background-color: ${category.color}"></div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div class="text-sm text-gray-500">Saved</div>
                      <div class="font-medium">${formatCurrency(goal.current)}</div>
                    </div>
                    <div>
                      <div class="text-sm text-gray-500">Target</div>
                      <div class="font-medium">${formatCurrency(goal.target)}</div>
                    </div>
                  </div>
                  
                  <div class="goal-details text-sm">
                    <div class="flex justify-between mb-1">
                      <div class="text-gray-500">Target Date</div>
                      <div>${formatDate(goal.targetDate)}</div>
                    </div>
                    <div class="flex justify-between mb-1">
                      <div class="text-gray-500">Remaining</div>
                      <div>${formatCurrency(goal.target - goal.current)}</div>
                    </div>
                    <div class="flex justify-between">
                      <div class="text-gray-500">Monthly Amount</div>
                      <div>${formatCurrency(monthlyAmount)}</div>
                    </div>
                  </div>
                </div>
                <div class="goal-footer p-4 border-t flex justify-between bg-gray-50">
                  <button class="contribute-btn text-sm text-primary hover:underline">
                    Add Contribution
                  </button>
                  <div class="flex space-x-2">
                    <button class="view-goal-btn text-sm text-gray-500 hover:underline">
                      View
                    </button>
                    <button class="edit-goal-btn text-sm text-blue-600 hover:underline">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="text-center py-8 text-gray-500">
          <p>No savings goals found</p>
          <button id="add-first-goal-btn" class="mt-2 text-primary hover:underline">Create your first goal</button>
        </div>
      `}
    </div>
  `;
  goalsContainer.appendChild(goalsListSection);
  
  // Achievement progress section
  const achievementSection = document.createElement('section');
  achievementSection.className = 'achievement-section mb-8 grid grid-cols-1 md:grid-cols-2 gap-6';
  
  // Contributions chart card
  const contributionsCard = document.createElement('div');
  contributionsCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  contributionsCard.innerHTML = `
    <h3 class="text-lg font-semibold mb-4">Contribution History</h3>
    <div class="chart-container" style="height: 250px;">
      <canvas id="contributionsChart"></canvas>
    </div>
  `;
  
  // Goal categories breakdown
  const categoriesCard = document.createElement('div');
  categoriesCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  
  // Calculate category totals
  const categoryTotals = {};
  categories.forEach(category => {
    categoryTotals[category.id] = 0;
  });
  
  goals.forEach(goal => {
    if (categoryTotals[goal.category] !== undefined) {
      categoryTotals[goal.category] += goal.current;
    }
  });
  
  categoriesCard.innerHTML = `
    <h3 class="text-lg font-semibold mb-4">Goals by Category</h3>
    <div class="chart-container" style="height: 250px;">
      <canvas id="categoriesChart"></canvas>
    </div>
  `;
  
  achievementSection.appendChild(contributionsCard);
  achievementSection.appendChild(categoriesCard);
  goalsContainer.appendChild(achievementSection);
  
  // Financial planning tips
  const tipsSection = document.createElement('section');
  tipsSection.className = 'tips-section mb-8';
  tipsSection.innerHTML = `
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <h3 class="text-lg font-semibold mb-4">Savings Tips & Strategies</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="tip-card border rounded-lg p-4">
          <div class="text-xl mb-2">💰</div>
          <h4 class="font-medium mb-2">50/30/20 Rule</h4>
          <p class="text-sm text-gray-600">Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment.</p>
        </div>
        
        <div class="tip-card border rounded-lg p-4">
          <div class="text-xl mb-2">🏦</div>
          <h4 class="font-medium mb-2">Automate Savings</h4>
          <p class="text-sm text-gray-600">Set up automatic transfers to your savings accounts on payday to make saving effortless.</p>
        </div>
        
        <div class="tip-card border rounded-lg p-4">
          <div class="text-xl mb-2">🧮</div>
          <h4 class="font-medium mb-2">Pay Yourself First</h4>
          <p class="text-sm text-gray-600">Treat savings as a non-negotiable expense by setting aside money before spending on discretionary items.</p>
        </div>
      </div>
    </div>
  `;
  goalsContainer.appendChild(tipsSection);
  
  // Goal form modal
  const goalModal = document.createElement('div');
  goalModal.id = 'goal-modal';
  goalModal.className = 'modal-container fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
  goalModal.style.backdropFilter = 'blur(3px)';
  
  goalModal.innerHTML = `
    <div class="modal-content bg-white rounded-lg w-full max-w-md p-6 relative">
      <button id="close-goal-modal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
      <h3 class="text-xl font-bold mb-4" id="goal-modal-title">Add Savings Goal</h3>
      
      <form id="goal-form">
        <input type="hidden" id="goal-id">
        
        <div class="mb-4">
          <label for="goal-name" class="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
          <input type="text" id="goal-name" required placeholder="e.g., Emergency Fund"
                 class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        
        <div class="mb-4">
          <label for="goal-category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select id="goal-category" required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            ${categories.map(category => `
              <option value="${category.id}">${category.icon} ${category.name}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label for="goal-target" class="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
            <input type="number" id="goal-target" min="1" step="1" required placeholder="5000"
                   class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          <div>
            <label for="goal-current" class="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
            <input type="number" id="goal-current" min="0" step="1" required placeholder="0"
                   class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label for="goal-start-date" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" id="goal-start-date" required
                   class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          <div>
            <label for="goal-target-date" class="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
            <input type="date" id="goal-target-date" required
                   class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
        </div>
        
        <div class="mb-4">
          <label for="goal-priority" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select id="goal-priority" required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="high">High Priority</option>
            <option value="medium" selected>Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
        
        <div class="mb-6">
          <label for="goal-notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea id="goal-notes" rows="2" placeholder="Additional details about your goal"
                   class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
        </div>
        
        <div class="flex justify-end">
          <button type="button" id="cancel-goal-btn" 
                  class="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" id="save-goal-btn"
                  class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
            Save Goal
          </button>
        </div>
      </form>
    </div>
  `;
  goalsContainer.appendChild(goalModal);
  
  // Contribution modal
  const contributionModal = document.createElement('div');
  contributionModal.id = 'contribution-modal';
  contributionModal.className = 'modal-container fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
  contributionModal.style.backdropFilter = 'blur(3px)';
  
  contributionModal.innerHTML = `
    <div class="modal-content bg-white rounded-lg w-full max-w-md p-6 relative">
      <button id="close-contribution-modal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
      <h3 class="text-xl font-bold mb-4">Add Contribution</h3>
      
      <div id="contribution-goal-info" class="mb-4 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center mb-2">
          <div id="contribution-goal-icon" class="text-2xl mr-2"></div>
          <div id="contribution-goal-name" class="font-medium"></div>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-gray-500">Current</div>
            <div id="contribution-goal-current" class="font-medium"></div>
          </div>
          <div>
            <div class="text-gray-500">Target</div>
            <div id="contribution-goal-target" class="font-medium"></div>
          </div>
        </div>
      </div>
      
      <form id="contribution-form">
        <input type="hidden" id="contribution-goal-id">
        
        <div class="mb-4">
          <label for="contribution-amount" class="block text-sm font-medium text-gray-700 mb-1">Contribution Amount</label>
          <input type="number" id="contribution-amount" min="1" step="1" required placeholder="500"
                 class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        
        <div class="mb-4">
          <label for="contribution-date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" id="contribution-date" required
                 class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        
        <div class="mb-6">
          <label for="contribution-source" class="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <input type="text" id="contribution-source" placeholder="e.g., Savings transfer, Bonus"
                 class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        
        <div class="flex justify-end">
          <button type="button" id="cancel-contribution-btn" 
                  class="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" id="save-contribution-btn"
                  class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
            Add Contribution
          </button>
        </div>
      </form>
    </div>
  `;
  goalsContainer.appendChild(contributionModal);
  
  // Goal details modal
  const detailsModal = document.createElement('div');
  detailsModal.id = 'details-modal';
  detailsModal.className = 'modal-container fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
  detailsModal.style.backdropFilter = 'blur(3px)';
  
  detailsModal.innerHTML = `
    <div class="modal-content bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
      <button id="close-details-modal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
      
      <div class="flex items-center mb-6">
        <div id="details-goal-icon" class="text-3xl mr-3"></div>
        <div>
          <h2 id="details-goal-name" class="text-xl font-bold"></h2>
          <div id="details-goal-category" class="text-gray-600"></div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-500 mb-1">Progress</div>
          <div id="details-progress-bar" class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div id="details-progress-value" class="h-2.5 rounded-full"></div>
          </div>
          <div class="flex justify-between text-sm">
            <div id="details-progress-percent"></div>
            <div id="details-time-remaining"></div>
          </div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-500 mb-1">Amount</div>
          <div class="flex justify-between items-end">
            <div id="details-current-amount" class="text-xl font-bold"></div>
            <div id="details-target-amount" class="text-sm text-gray-600"></div>
          </div>
          <div id="details-needed-amount" class="text-sm mt-1"></div>
        </div>
      </div>
      
      <div class="border-t border-b py-4 mb-6 grid grid-cols-2 gap-4">
        <div>
          <div class="text-sm text-gray-500 mb-1">Start Date</div>
          <div id="details-start-date"></div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">Target Date</div>
          <div id="details-target-date"></div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">Priority</div>
          <div id="details-priority"></div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">Monthly Needed</div>
          <div id="details-monthly-amount"></div>
        </div>
      </div>
      
      <div class="mb-4">
        <h3 class="font-medium mb-2">Notes</h3>
        <div id="details-notes" class="text-sm bg-gray-50 p-3 rounded-lg"></div>
      </div>
      
      <h3 class="font-medium mb-2">Contribution History</h3>
      <div class="overflow-y-auto flex-1" id="details-contributions-container">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
            </tr>
          </thead>
          <tbody id="details-contributions" class="bg-white divide-y divide-gray-200">
            <!-- Contribution history rows will be added here -->
            <tr>
              <td colspan="3" class="text-center py-4 text-gray-500">
                <p>No contributions yet</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="flex justify-between mt-4 pt-4 border-t">
        <div>
          <button id="delete-goal-btn" class="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50">
            Delete Goal
          </button>
        </div>
        <div class="flex space-x-3">
          <button id="details-edit-btn" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            Edit Goal
          </button>
          <button id="details-contribute-btn" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
            Add Contribution
          </button>
        </div>
      </div>
    </div>
  `;
  goalsContainer.appendChild(detailsModal);
  
  // Add event listeners
  setTimeout(() => {
    // Add goal button
    const addGoalBtn = goalsContainer.querySelector('#add-goal-btn');
    if (addGoalBtn) {
      addGoalBtn.addEventListener('click', () => {
        const modal = goalsContainer.querySelector('#goal-modal');
        const modalTitle = modal.querySelector('#goal-modal-title');
        const form = modal.querySelector('#goal-form');
        
        // Reset form
        form.reset();
        document.getElementById('goal-id').value = '';
        
        // Set default dates
        const today = new Date();
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
        
        document.getElementById('goal-start-date').valueAsDate = today;
        document.getElementById('goal-target-date').valueAsDate = sixMonthsLater;
        
        // Update modal title
        modalTitle.textContent = 'Add Savings Goal';
        
        // Show modal
        modal.classList.remove('hidden');
      });
    }
    
    // Add first goal button (shown when no goals exist)
    const addFirstGoalBtn = goalsContainer.querySelector('#add-first-goal-btn');
    if (addFirstGoalBtn) {
      addFirstGoalBtn.addEventListener('click', () => {
        const addGoalBtn = goalsContainer.querySelector('#add-goal-btn');
        if (addGoalBtn) {
          addGoalBtn.click();
        }
      });
    }
    
    // Close goal modal buttons
    const closeGoalBtn = goalsContainer.querySelector('#close-goal-modal');
    const cancelGoalBtn = goalsContainer.querySelector('#cancel-goal-btn');
    
    [closeGoalBtn, cancelGoalBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          const modal = goalsContainer.querySelector('#goal-modal');
          modal.classList.add('hidden');
        });
      }
    });
    
    // Close contribution modal buttons
    const closeContributionBtn = goalsContainer.querySelector('#close-contribution-modal');
    const cancelContributionBtn = goalsContainer.querySelector('#cancel-contribution-btn');
    
    [closeContributionBtn, cancelContributionBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          const modal = goalsContainer.querySelector('#contribution-modal');
          modal.classList.add('hidden');
        });
      }
    });
    
    // Close details modal button
    const closeDetailsBtn = goalsContainer.querySelector('#close-details-modal');
    if (closeDetailsBtn) {
      closeDetailsBtn.addEventListener('click', () => {
        const modal = goalsContainer.querySelector('#details-modal');
        modal.classList.add('hidden');
      });
    }
    
    // Edit goal buttons
    const editButtons = goalsContainer.querySelectorAll('.edit-goal-btn');
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.goal-card');
        const goalId = parseInt(card.dataset.goalId);
        
        // Find the goal
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;
        
        // Populate the form
        document.getElementById('goal-id').value = goal.id;
        document.getElementById('goal-name').value = goal.name;
        document.getElementById('goal-category').value = goal.category;
        document.getElementById('goal-target').value = goal.target;
        document.getElementById('goal-current').value = goal.current;
        document.getElementById('goal-start-date').value = new Date(goal.startDate).toISOString().split('T')[0];
        document.getElementById('goal-target-date').value = new Date(goal.targetDate).toISOString().split('T')[0];
        document.getElementById('goal-priority').value = goal.priority || 'medium';
        document.getElementById('goal-notes').value = goal.notes || '';
        
        // Update modal title
        document.getElementById('goal-modal-title').textContent = 'Edit Savings Goal';
        
        // Show modal
        document.getElementById('goal-modal').classList.remove('hidden');
      });
    });
    
    // Contribute buttons
    const contributeButtons = goalsContainer.querySelectorAll('.contribute-btn');
    contributeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.goal-card');
        const goalId = parseInt(card.dataset.goalId);
        
        showContributionModal(goalId);
      });
    });
    
    // View goal buttons
    const viewButtons = goalsContainer.querySelectorAll('.view-goal-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.goal-card');
        const goalId = parseInt(card.dataset.goalId);
        
        showGoalDetailsModal(goalId);
      });
    });
    
    // Details modal buttons
    const detailsEditBtn = goalsContainer.querySelector('#details-edit-btn');
    if (detailsEditBtn) {
      detailsEditBtn.addEventListener('click', () => {
        const goalId = parseInt(document.getElementById('details-goal-name').dataset.goalId);
        
        // Hide details modal
        document.getElementById('details-modal').classList.add('hidden');
        
        // Find the goal element and trigger its edit button
        const goalCard = document.querySelector(`.goal-card[data-goal-id="${goalId}"]`);
        if (goalCard) {
          const editBtn = goalCard.querySelector('.edit-goal-btn');
          if (editBtn) {
            editBtn.click();
          }
        }
      });
    }
    
    const detailsContributeBtn = goalsContainer.querySelector('#details-contribute-btn');
    if (detailsContributeBtn) {
      detailsContributeBtn.addEventListener('click', () => {
        const goalId = parseInt(document.getElementById('details-goal-name').dataset.goalId);
        
        // Hide details modal
        document.getElementById('details-modal').classList.add('hidden');
        
        // Show contribution modal
        showContributionModal(goalId);
      });
    }
    
    const deleteGoalBtn = goalsContainer.querySelector('#delete-goal-btn');
    if (deleteGoalBtn) {
      deleteGoalBtn.addEventListener('click', () => {
        const goalId = parseInt(document.getElementById('details-goal-name').dataset.goalId);
        
        if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
          // Delete the goal
          if (deleteGoal(goalId)) {
            // Hide details modal
            document.getElementById('details-modal').classList.add('hidden');
            
            // Refresh the page
            window.location.reload();
          }
        }
      });
    }
    
    // Goal form submission
    const goalForm = goalsContainer.querySelector('#goal-form');
    if (goalForm) {
      goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const id = document.getElementById('goal-id').value ? parseInt(document.getElementById('goal-id').value) : null;
        const name = document.getElementById('goal-name').value;
        const category = document.getElementById('goal-category').value;
        const target = parseFloat(document.getElementById('goal-target').value);
        const current = parseFloat(document.getElementById('goal-current').value);
        const startDate = document.getElementById('goal-start-date').value;
        const targetDate = document.getElementById('goal-target-date').value;
        const priority = document.getElementById('goal-priority').value;
        const notes = document.getElementById('goal-notes').value;
        
        // Create goal object
        const goal = {
          id,
          name,
          category,
          target,
          current,
          startDate: new Date(startDate).toISOString(),
          targetDate: new Date(targetDate).toISOString(),
          priority,
          notes,
          contributions: id ? goals.find(g => g.id === id)?.contributions || [] : []
        };
        
        // Save the goal
        saveGoal(goal);
        
        // Close the modal
        document.getElementById('goal-modal').classList.add('hidden');
        
        // Refresh the page
        window.location.reload();
      });
    }
    
    // Contribution form submission
    const contributionForm = goalsContainer.querySelector('#contribution-form');
    if (contributionForm) {
      contributionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const goalId = parseInt(document.getElementById('contribution-goal-id').value);
        const amount = parseFloat(document.getElementById('contribution-amount').value);
        const date = document.getElementById('contribution-date').value;
        const source = document.getElementById('contribution-source').value;
        
        // Create contribution object
        const contribution = {
          id: Date.now(),
          date: new Date(date).toISOString(),
          amount,
          source
        };
        
        // Add contribution to goal
        addContribution(goalId, contribution);
        
        // Close the modal
        document.getElementById('contribution-modal').classList.add('hidden');
        
        // Refresh the page
        window.location.reload();
      });
    }
    
    // Goals filter
    const goalsFilter = goalsContainer.querySelector('#goals-filter');
    const goalsSort = goalsContainer.querySelector('#goals-sort');
    
    function applyFiltersAndSort() {
      const filterValue = goalsFilter.value;
      const sortValue = goalsSort.value;
      
      // Get all goal cards
      const goalCards = goalsContainer.querySelectorAll('.goal-card');
      const goalsGrid = goalsContainer.querySelector('#goals-grid');
      
      // Applied filtered goals
      let visibleCount = 0;
      
      goalCards.forEach(card => {
        const category = card.dataset.category;
        
        // Apply category filter
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });
      
      // Show no results message if no goals match filter
      const noResultsMessage = goalsContainer.querySelector('.no-results-message');
      
      if (visibleCount === 0) {
        if (!noResultsMessage) {
          const message = document.createElement('div');
          message.className = 'no-results-message text-center py-4 text-gray-500';
          message.textContent = 'No goals match the selected filter';
          goalsGrid.appendChild(message);
        }
      } else if (noResultsMessage) {
        noResultsMessage.remove();
      }
      
      // Apply sorting
      if (sortValue !== 'none') {
        const goalsArray = Array.from(goalCards);
        
        goalsArray.sort((a, b) => {
          // Only sort cards that are visible
          if (a.style.display === 'none' || b.style.display === 'none') {
            return 0;
          }
          
          const aId = parseInt(a.dataset.goalId);
          const bId = parseInt(b.dataset.goalId);
          
          const aGoal = goals.find(g => g.id === aId);
          const bGoal = goals.find(g => g.id === bId);
          
          if (!aGoal || !bGoal) return 0;
          
          if (sortValue === 'progress') {
            const aProgress = calculateGoalProgress(aGoal);
            const bProgress = calculateGoalProgress(bGoal);
            return bProgress - aProgress;
          } else if (sortValue === 'date') {
            return new Date(aGoal.targetDate) - new Date(bGoal.targetDate);
          } else if (sortValue === 'amount') {
            return bGoal.target - aGoal.target;
          } else if (sortValue === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[bGoal.priority || 'low'] - priorityOrder[aGoal.priority || 'low'];
          }
          
          return 0;
        });
        
        // Reappend in sorted order
        goalsArray.forEach(card => {
          goalsGrid.appendChild(card);
        });
      }
    }
    
    if (goalsFilter) {
      goalsFilter.addEventListener('change', applyFiltersAndSort);
    }
    
    if (goalsSort) {
      goalsSort.addEventListener('change', applyFiltersAndSort);
    }
    
    // Render charts
    try {
      // Check if charting library is available
      if (typeof Chart !== 'undefined') {
        // Prepare contribution history data
        const last6Months = [];
        const contributionData = [];
        
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = month.toLocaleDateString('en-US', { month: 'short' });
          last6Months.push(monthName);
          
          // Calculate total contributions for each month
          const monthTotal = goals.reduce((sum, goal) => {
            const monthContributions = (goal.contributions || []).filter(contribution => {
              const contribDate = new Date(contribution.date);
              return contribDate.getMonth() === month.getMonth() && 
                     contribDate.getFullYear() === month.getFullYear();
            });
            
            return sum + monthContributions.reduce((contribSum, contribution) => 
              contribSum + contribution.amount, 0);
          }, 0);
          
          contributionData.push(monthTotal);
        }
        
        // Contributions chart
        const contributionsCtx = document.getElementById('contributionsChart');
        if (contributionsCtx) {
          new Chart(contributionsCtx, {
            type: 'bar',
            data: {
              labels: last6Months,
              datasets: [{
                label: 'Monthly Contributions',
                data: contributionData,
                backgroundColor: 'rgba(52, 168, 83, 0.7)',
                borderColor: 'rgba(52, 168, 83, 1)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString();
                    }
                  }
                }
              }
            }
          });
        }
        
        // Prepare category data
        const categoryData = [];
        const categoryLabels = [];
        const categoryColors = [];
        
        for (const category of categories) {
          // Calculate total for this category
          const categoryTotal = goals.reduce((sum, goal) => {
            if (goal.category === category.id) {
              return sum + goal.current;
            }
            return sum;
          }, 0);
          
          if (categoryTotal > 0) {
            categoryData.push(categoryTotal);
            categoryLabels.push(category.name);
            categoryColors.push(category.color);
          }
        }
        
        // Categories chart
        const categoriesCtx = document.getElementById('categoriesChart');
        if (categoriesCtx) {
          new Chart(categoriesCtx, {
            type: 'doughnut',
            data: {
              labels: categoryLabels,
              datasets: [{
                data: categoryData,
                backgroundColor: categoryColors,
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                      return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    }
                  }
                }
              }
            }
          });
        }
      } else {
        console.warn('Chart.js not available, skipping chart rendering');
        
        // Add a note about charts not being available
        const chartContainers = goalsContainer.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
          container.innerHTML = `
            <div class="flex items-center justify-center h-full">
              <div class="text-center text-gray-500">
                <p>Charts visualization requires Chart.js</p>
                <p class="text-sm mt-2">Data is still being tracked</p>
              </div>
            </div>
          `;
        });
      }
    } catch (error) {
      console.error('Error rendering charts:', error);
    }
  }, 100);
  
  // Function to show the contribution modal
  function showContributionModal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const category = categories.find(cat => cat.id === goal.category) || { name: 'Other', icon: '🎯' };
    
    // Populate the contribution form
    document.getElementById('contribution-goal-id').value = goal.id;
    document.getElementById('contribution-goal-icon').textContent = category.icon;
    document.getElementById('contribution-goal-name').textContent = goal.name;
    document.getElementById('contribution-goal-current').textContent = formatCurrency(goal.current);
    document.getElementById('contribution-goal-target').textContent = formatCurrency(goal.target);
    
    // Set default date to today
    document.getElementById('contribution-date').valueAsDate = new Date();
    
    // Clear other fields
    document.getElementById('contribution-amount').value = '';
    document.getElementById('contribution-source').value = '';
    
    // Show the modal
    document.getElementById('contribution-modal').classList.remove('hidden');
  }
  
  // Function to show the goal details modal
  function showGoalDetailsModal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const category = categories.find(cat => cat.id === goal.category) || { name: 'Other', icon: '🎯', color: '#6b7280' };
    const progress = calculateGoalProgress(goal);
    const monthlyAmount = calculateMonthlyContribution(goal);
    
    // Populate the goal details
    const nameEl = document.getElementById('details-goal-name');
    nameEl.textContent = goal.name;
    nameEl.dataset.goalId = goal.id;
    
    document.getElementById('details-goal-icon').textContent = category.icon;
    document.getElementById('details-goal-category').textContent = category.name;
    document.getElementById('details-progress-percent').textContent = `${progress}% complete`;
    document.getElementById('details-time-remaining').textContent = formatTimeRemaining(goal.targetDate);
    
    const progressBar = document.getElementById('details-progress-value');
    progressBar.style.width = `${progress}%`;
    progressBar.style.backgroundColor = category.color;
    
    document.getElementById('details-current-amount').textContent = formatCurrency(goal.current);
    document.getElementById('details-target-amount').textContent = `of ${formatCurrency(goal.target)}`;
    document.getElementById('details-needed-amount').textContent = `${formatCurrency(goal.target - goal.current)} more needed`;
    
    document.getElementById('details-start-date').textContent = formatDate(goal.startDate);
    document.getElementById('details-target-date').textContent = formatDate(goal.targetDate);
    
    const priorityEl = document.getElementById('details-priority');
    priorityEl.textContent = goal.priority ? goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1) : 'Low';
    
    document.getElementById('details-monthly-amount').textContent = formatCurrency(monthlyAmount);
    document.getElementById('details-notes').textContent = goal.notes || 'No notes added.';
    
    // Populate contribution history
    const contributionsContainer = document.getElementById('details-contributions');
    if (goal.contributions && goal.contributions.length > 0) {
      // Sort contributions by date (newest first)
      const sortedContributions = [...goal.contributions].sort((a, b) => 
        new Date(b.date) - new Date(a.date));
      
      contributionsContainer.innerHTML = sortedContributions.map((contribution, index) => `
        <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
            ${formatDate(contribution.date)}
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
            ${formatCurrency(contribution.amount)}
          </td>
          <td class="px-4 py-3 text-sm text-gray-900">
            ${contribution.source || '-'}
          </td>
        </tr>
      `).join('');
    } else {
      contributionsContainer.innerHTML = `
        <tr>
          <td colspan="3" class="text-center py-4 text-gray-500">
            <p>No contributions yet</p>
          </td>
        </tr>
      `;
    }
    
    // Show the modal
    document.getElementById('details-modal').classList.remove('hidden');
  }
  
  return goalsContainer;
}