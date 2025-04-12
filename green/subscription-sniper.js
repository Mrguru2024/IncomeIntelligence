/**
 * Subscription Sniper - Track and optimize recurring subscriptions
 * This module helps users identify and manage their subscription services
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

// Get app subscription data or generate sample data
function getSubscriptionData() {
  if (!appState.subscriptions || appState.subscriptions.length === 0) {
    // Sample subscription data
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return [
      {
        id: 1,
        name: 'Netflix',
        category: 'entertainment',
        amount: 19.99,
        billingCycle: 'monthly',
        nextBillingDate: nextMonth.toISOString(),
        logo: '🎬',
        active: true,
        essential: false,
        usage: 'high',
        notes: 'Family plan',
        addedDate: today.toISOString()
      },
      {
        id: 2,
        name: 'Spotify Premium',
        category: 'entertainment',
        amount: 9.99,
        billingCycle: 'monthly',
        nextBillingDate: nextMonth.toISOString(),
        logo: '🎵',
        active: true,
        essential: false,
        usage: 'high',
        notes: 'Individual plan',
        addedDate: today.toISOString()
      },
      {
        id: 3,
        name: 'Adobe Creative Cloud',
        category: 'productivity',
        amount: 52.99,
        billingCycle: 'monthly',
        nextBillingDate: nextMonth.toISOString(),
        logo: '🎨',
        active: true,
        essential: true,
        usage: 'medium',
        notes: 'Work subscription',
        addedDate: today.toISOString()
      },
      {
        id: 4,
        name: 'Gym Membership',
        category: 'health',
        amount: 29.99,
        billingCycle: 'monthly',
        nextBillingDate: nextMonth.toISOString(),
        logo: '💪',
        active: true,
        essential: true,
        usage: 'low',
        notes: 'Planet Fitness',
        addedDate: today.toISOString()
      },
      {
        id: 5,
        name: 'Amazon Prime',
        category: 'shopping',
        amount: 139,
        billingCycle: 'annual',
        nextBillingDate: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString(),
        logo: '📦',
        active: true,
        essential: false,
        usage: 'high',
        notes: 'Includes Prime Video and free shipping',
        addedDate: today.toISOString()
      },
      {
        id: 6,
        name: 'Cloud Storage',
        category: 'technology',
        amount: 9.99,
        billingCycle: 'monthly',
        nextBillingDate: nextMonth.toISOString(),
        logo: '☁️',
        active: true,
        essential: true,
        usage: 'high',
        notes: 'Google One 2TB plan',
        addedDate: today.toISOString()
      },
      {
        id: 7,
        name: 'News Subscription',
        category: 'content',
        amount: 4.99,
        billingCycle: 'monthly',
        nextBillingDate: nextWeek.toISOString(),
        logo: '📰',
        active: true,
        essential: false,
        usage: 'low',
        notes: 'Digital edition',
        addedDate: today.toISOString()
      }
    ];
  }
  
  return appState.subscriptions;
}

// Get categories for subscriptions
function getSubscriptionCategories() {
  return [
    { id: 'entertainment', name: 'Entertainment', icon: '🍿' },
    { id: 'productivity', name: 'Productivity', icon: '💼' },
    { id: 'health', name: 'Health & Fitness', icon: '🏃‍♂️' },
    { id: 'shopping', name: 'Shopping', icon: '🛒' },
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'content', name: 'Content & Media', icon: '📱' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'food', name: 'Food & Drink', icon: '🍕' },
    { id: 'other', name: 'Other', icon: '📌' }
  ];
}

// Calculate monthly subscription costs
function calculateMonthlyCost(subscriptions) {
  if (!subscriptions || subscriptions.length === 0) {
    return 0;
  }
  
  return subscriptions.reduce((total, sub) => {
    if (!sub.active) return total;
    
    const amount = sub.amount;
    
    // Convert to monthly amount based on billing cycle
    switch (sub.billingCycle) {
      case 'weekly':
        return total + (amount * 4.33); // Average weeks in a month
      case 'monthly':
        return total + amount;
      case 'quarterly':
        return total + (amount / 3);
      case 'biannual':
        return total + (amount / 6);
      case 'annual':
        return total + (amount / 12);
      default:
        return total + amount;
    }
  }, 0);
}

// Calculate annual subscription costs
function calculateAnnualCost(subscriptions) {
  if (!subscriptions || subscriptions.length === 0) {
    return 0;
  }
  
  return subscriptions.reduce((total, sub) => {
    if (!sub.active) return total;
    
    const amount = sub.amount;
    
    // Convert to annual amount based on billing cycle
    switch (sub.billingCycle) {
      case 'weekly':
        return total + (amount * 52);
      case 'monthly':
        return total + (amount * 12);
      case 'quarterly':
        return total + (amount * 4);
      case 'biannual':
        return total + (amount * 2);
      case 'annual':
        return total + amount;
      default:
        return total + (amount * 12);
    }
  }, 0);
}

// Generate optimization suggestions
function generateOptimizationSuggestions(subscriptions) {
  if (!subscriptions || subscriptions.length === 0) {
    return [];
  }
  
  const suggestions = [];
  
  // Find low usage subscriptions
  const lowUsage = subscriptions.filter(sub => sub.active && sub.usage === 'low' && !sub.essential);
  if (lowUsage.length > 0) {
    const totalSavings = lowUsage.reduce((total, sub) => {
      const amount = sub.amount;
      
      // Convert to annual amount based on billing cycle
      switch (sub.billingCycle) {
        case 'weekly':
          return total + (amount * 52);
        case 'monthly':
          return total + (amount * 12);
        case 'quarterly':
          return total + (amount * 4);
        case 'biannual':
          return total + (amount * 2);
        case 'annual':
          return total + amount;
        default:
          return total + (amount * 12);
      }
    }, 0);
    
    suggestions.push({
      title: 'Low Usage Subscriptions',
      description: `You have ${lowUsage.length} subscription${lowUsage.length > 1 ? 's' : ''} with low usage. Consider cancelling or pausing them.`,
      impact: `Potential annual savings: ${formatCurrency(totalSavings)}`,
      items: lowUsage.map(sub => sub.name)
    });
  }
  
  // Find subscriptions in the same category for potential bundling
  const categories = {};
  subscriptions.forEach(sub => {
    if (!sub.active) return;
    
    if (!categories[sub.category]) {
      categories[sub.category] = [];
    }
    categories[sub.category].push(sub);
  });
  
  const bundlingOpportunities = Object.values(categories).filter(subs => subs.length >= 2);
  
  if (bundlingOpportunities.length > 0) {
    bundlingOpportunities.forEach(subs => {
      if (subs.length >= 2) {
        const category = getSubscriptionCategories().find(cat => cat.id === subs[0].category)?.name || subs[0].category;
        
        suggestions.push({
          title: `${category} Bundle Opportunity`,
          description: `You have ${subs.length} subscriptions in the ${category} category. Look for bundle deals.`,
          impact: 'Potential for savings through bundling',
          items: subs.map(sub => sub.name)
        });
      }
    });
  }
  
  // Find annual vs monthly payment savings
  const monthlySubscriptions = subscriptions.filter(sub => sub.active && sub.billingCycle === 'monthly');
  if (monthlySubscriptions.length > 0) {
    suggestions.push({
      title: 'Annual Payment Savings',
      description: `${monthlySubscriptions.length} subscription${monthlySubscriptions.length > 1 ? 's' : ''} might offer discounts for annual payment.`,
      impact: 'Typically 10-20% savings on annual plans',
      items: monthlySubscriptions.map(sub => sub.name)
    });
  }
  
  return suggestions;
}

// Get upcoming billing dates
function getUpcomingBillings(subscriptions, daysAhead = 30) {
  if (!subscriptions || subscriptions.length === 0) {
    return [];
  }
  
  const today = new Date();
  const cutoffDate = new Date();
  cutoffDate.setDate(today.getDate() + daysAhead);
  
  // Filter for subscriptions with billing dates in the next {daysAhead} days
  return subscriptions
    .filter(sub => {
      if (!sub.active) return false;
      
      const billingDate = new Date(sub.nextBillingDate);
      return billingDate >= today && billingDate <= cutoffDate;
    })
    .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate));
}

// Save subscription to app state
function saveSubscription(subscription) {
  if (!appState.subscriptions) {
    appState.subscriptions = [];
  }
  
  // Generate ID if not provided
  if (!subscription.id) {
    subscription.id = Date.now();
  }
  
  // If editing an existing subscription, replace it
  const existingIndex = appState.subscriptions.findIndex(sub => sub.id === subscription.id);
  if (existingIndex !== -1) {
    appState.subscriptions[existingIndex] = subscription;
  } else {
    // Add new subscription
    appState.subscriptions.push(subscription);
  }
  
  // Save to local storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('stackr-finance-state', JSON.stringify(appState));
      console.log('Subscription saved successfully');
    } catch (error) {
      console.error('Error saving subscription to localStorage:', error);
    }
  }
  
  return subscription;
}

// Delete subscription
function deleteSubscription(subscriptionId) {
  if (!appState.subscriptions) return false;
  
  const initialLength = appState.subscriptions.length;
  appState.subscriptions = appState.subscriptions.filter(sub => sub.id !== subscriptionId);
  
  if (appState.subscriptions.length < initialLength) {
    // Save to local storage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('stackr-finance-state', JSON.stringify(appState));
        console.log('Subscription deleted successfully');
      } catch (error) {
        console.error('Error saving state to localStorage after deletion:', error);
      }
    }
    
    return true;
  }
  
  return false;
}

// Render Subscription Sniper page
export function renderSubscriptionSniperPage() {
  // Check if premium feature
  const isPremium = appState.user?.subscription?.tier === 'pro' || 
                   appState.user?.subscription?.tier === 'lifetime';
  
  // Main container
  const sniperContainer = document.createElement('div');
  sniperContainer.className = 'subscription-sniper-container p-4 max-w-6xl mx-auto';
  
  // If not premium, show upgrade message
  if (!isPremium) {
    const upgradeContainer = document.createElement('div');
    upgradeContainer.className = 'upgrade-container';
    upgradeContainer.innerHTML = `
      <div class="text-center p-8 mb-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
        <h1 class="text-3xl font-bold mb-4">Subscription Sniper</h1>
        <p class="text-lg mb-4">Track and optimize your recurring subscriptions</p>
        <div class="max-w-lg mx-auto">
          <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 class="text-xl font-semibold mb-3">Premium Feature</h2>
            <p class="mb-4">Subscription Sniper is a premium feature available on Pro and Lifetime plans.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="feature-item flex items-start">
                <div class="mr-2 text-primary">✓</div>
                <div>Track all your subscriptions in one place</div>
              </div>
              <div class="feature-item flex items-start">
                <div class="mr-2 text-primary">✓</div>
                <div>Get notified before billing dates</div>
              </div>
              <div class="feature-item flex items-start">
                <div class="mr-2 text-primary">✓</div>
                <div>Identify subscription overlap</div>
              </div>
              <div class="feature-item flex items-start">
                <div class="mr-2 text-primary">✓</div>
                <div>Find savings opportunities</div>
              </div>
            </div>
            
            <a href="#subscriptions" class="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-primary-dark">
              Upgrade to Pro
            </a>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="subscription-preview">
              <img src="https://placehold.co/600x300" alt="Subscription Sniper Preview" class="w-full h-auto rounded-lg mb-4">
              <p class="text-sm text-gray-600 text-center">Track and optimize all your recurring payments</p>
            </div>
          </div>
        </div>
      </div>
    `;
    sniperContainer.appendChild(upgradeContainer);
    return sniperContainer;
  }
  
  // Get subscription data
  const subscriptions = getSubscriptionData();
  const categories = getSubscriptionCategories();
  
  // Calculate costs
  const monthlyCost = calculateMonthlyCost(subscriptions);
  const annualCost = calculateAnnualCost(subscriptions);
  const activeCount = subscriptions.filter(sub => sub.active).length;
  
  // Get optimization suggestions
  const suggestions = generateOptimizationSuggestions(subscriptions);
  
  // Get upcoming billings
  const upcomingBillings = getUpcomingBillings(subscriptions);
  
  // Header section
  const header = document.createElement('header');
  header.className = 'mb-6';
  header.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold mb-1">Subscription Sniper</h1>
        <p class="text-gray-600">Track and optimize your recurring subscriptions</p>
      </div>
      <div class="mt-4 md:mt-0">
        <button id="add-subscription-btn" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
          + Add Subscription
        </button>
      </div>
    </div>
  `;
  sniperContainer.appendChild(header);
  
  // Summary cards
  const summarySection = document.createElement('section');
  summarySection.className = 'summary-cards grid grid-cols-1 md:grid-cols-3 gap-4 mb-8';
  
  // Monthly cost card
  const monthlyCard = document.createElement('div');
  monthlyCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  monthlyCard.innerHTML = `
    <div class="card-header mb-2">
      <h3 class="text-lg font-semibold">Monthly Cost</h3>
    </div>
    <div class="card-value text-2xl font-bold">${formatCurrency(monthlyCost)}</div>
    <div class="text-sm text-gray-600 mt-1">${activeCount} active subscriptions</div>
  `;
  
  // Annual cost card
  const annualCard = document.createElement('div');
  annualCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  annualCard.innerHTML = `
    <div class="card-header mb-2">
      <h3 class="text-lg font-semibold">Annual Cost</h3>
    </div>
    <div class="card-value text-2xl font-bold">${formatCurrency(annualCost)}</div>
    <div class="text-sm text-gray-600 mt-1">${formatCurrency(monthlyCost)} per month average</div>
  `;
  
  // Upcoming bills card
  const upcomingCard = document.createElement('div');
  upcomingCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  upcomingCard.innerHTML = `
    <div class="card-header mb-2">
      <h3 class="text-lg font-semibold">Upcoming Bills</h3>
    </div>
    ${upcomingBillings.length > 0 ? `
      <div class="upcoming-list">
        ${upcomingBillings.slice(0, 3).map(sub => `
          <div class="flex justify-between items-center py-1 border-b last:border-0">
            <div class="flex items-center">
              <span class="mr-2">${sub.logo}</span>
              <span>${sub.name}</span>
            </div>
            <div>
              <span class="font-medium">${formatCurrency(sub.amount)}</span>
              <span class="text-sm text-gray-600 ml-1">${formatDate(sub.nextBillingDate)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      ${upcomingBillings.length > 3 ? `
        <div class="text-sm text-center mt-2">
          <a href="#" class="text-primary hover:underline" id="view-all-upcoming">
            View all ${upcomingBillings.length} upcoming
          </a>
        </div>
      ` : ''}
    ` : `
      <div class="text-center py-4 text-gray-500">
        No upcoming bills in the next 30 days
      </div>
    `}
  `;
  
  summarySection.appendChild(monthlyCard);
  summarySection.appendChild(annualCard);
  summarySection.appendChild(upcomingCard);
  sniperContainer.appendChild(summarySection);
  
  // Optimization insights section
  const insightsSection = document.createElement('section');
  insightsSection.className = 'insights-section mb-8';
  insightsSection.innerHTML = `
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <h2 class="text-xl font-semibold mb-4">Optimization Insights</h2>
      
      ${suggestions.length > 0 ? `
        <div class="insights-list space-y-4">
          ${suggestions.map(suggestion => `
            <div class="insight-item p-4 border border-gray-100 rounded-lg">
              <div class="flex items-start">
                <div class="insight-icon mr-3 bg-primary/10 p-2 rounded-full">
                  <span class="text-xl">💡</span>
                </div>
                <div class="flex-1">
                  <h3 class="font-medium mb-1">${suggestion.title}</h3>
                  <p class="text-sm mb-2">${suggestion.description}</p>
                  <p class="text-sm text-primary font-medium mb-2">${suggestion.impact}</p>
                  
                  ${suggestion.items && suggestion.items.length > 0 ? `
                    <div class="items-list bg-gray-50 p-2 rounded-md">
                      ${suggestion.items.map(item => `
                        <div class="text-sm py-1">${item}</div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="text-center py-8 text-gray-500">
          <p>No optimization suggestions available yet</p>
          <p class="text-sm mt-2">Add more subscriptions to get personalized insights</p>
        </div>
      `}
    </div>
  `;
  sniperContainer.appendChild(insightsSection);
  
  // Subscriptions list
  const subscriptionsSection = document.createElement('section');
  subscriptionsSection.className = 'subscriptions-section mb-8';
  subscriptionsSection.innerHTML = `
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Your Subscriptions</h2>
        <div class="flex space-x-2">
          <select id="subscription-filter" class="p-2 border rounded-md text-sm">
            <option value="all">All Categories</option>
            ${categories.map(category => `
              <option value="${category.id}">${category.icon} ${category.name}</option>
            `).join('')}
          </select>
          <select id="subscription-sort" class="p-2 border rounded-md text-sm">
            <option value="name">Name</option>
            <option value="amount">Amount</option>
            <option value="date">Next Billing</option>
          </select>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" id="subscription-entries">
            ${subscriptions.map((subscription, index) => {
              const category = categories.find(cat => cat.id === subscription.category) || { name: 'Other', icon: '📌' };
              
              return `
                <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${!subscription.active ? 'opacity-50' : ''}" data-subscription-id="${subscription.id}">
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="text-xl mr-2">${subscription.logo}</div>
                      <div>
                        <div class="font-medium">${subscription.name}</div>
                        <div class="text-xs text-gray-500">${subscription.notes || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="inline-flex items-center">
                      <span class="mr-1">${category.icon}</span>
                      ${category.name}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    ${formatCurrency(subscription.amount)}
                    <div class="text-xs text-gray-500">${subscription.billingCycle}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    ${subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    ${formatDate(subscription.nextBillingDate)}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 text-xs rounded-full ${
                      subscription.usage === 'high' ? 'bg-green-100 text-green-800' : 
                      subscription.usage === 'medium' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }">
                      ${subscription.usage.charAt(0).toUpperCase() + subscription.usage.slice(1)}
                    </span>
                    ${subscription.essential ? '<span class="ml-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Essential</span>' : ''}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <button class="edit-subscription-btn text-blue-600 hover:text-blue-800 mr-2">
                      Edit
                    </button>
                    <button class="toggle-subscription-btn ${subscription.active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'} mr-2">
                      ${subscription.active ? 'Pause' : 'Activate'}
                    </button>
                    <button class="delete-subscription-btn text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      
      ${subscriptions.length === 0 ? `
        <div class="text-center py-8 text-gray-500">
          <p>No subscriptions found</p>
          <button id="add-first-subscription-btn" class="mt-2 text-primary hover:underline">Add your first subscription</button>
        </div>
      ` : ''}
    </div>
  `;
  sniperContainer.appendChild(subscriptionsSection);
  
  // Category breakdown
  const breakdownSection = document.createElement('section');
  breakdownSection.className = 'breakdown-section mb-8 grid grid-cols-1 md:grid-cols-2 gap-6';
  
  // Category breakdown chart
  const categoryBreakdown = document.createElement('div');
  categoryBreakdown.className = 'category-breakdown bg-white p-4 rounded-lg shadow-sm';
  categoryBreakdown.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Category Breakdown</h2>
    <div class="chart-container" style="height: 250px;">
      <canvas id="categoryChart"></canvas>
    </div>
  `;
  
  // Essential vs Non-essential breakdown
  const essentialBreakdown = document.createElement('div');
  essentialBreakdown.className = 'essential-breakdown bg-white p-4 rounded-lg shadow-sm';
  
  // Calculate essential vs non-essential
  const essentialTotal = subscriptions
    .filter(sub => sub.active && sub.essential)
    .reduce((total, sub) => {
      return total + (sub.billingCycle === 'monthly' ? sub.amount : sub.amount / 12);
    }, 0);
    
  const nonEssentialTotal = subscriptions
    .filter(sub => sub.active && !sub.essential)
    .reduce((total, sub) => {
      return total + (sub.billingCycle === 'monthly' ? sub.amount : sub.amount / 12);
    }, 0);
  
  essentialBreakdown.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Essential vs Non-Essential</h2>
    <div class="chart-container" style="height: 250px;">
      <canvas id="essentialChart"></canvas>
    </div>
    <div class="grid grid-cols-2 gap-4 mt-4">
      <div class="text-center">
        <div class="text-sm font-medium text-gray-500">Essential</div>
        <div class="text-xl font-bold">${formatCurrency(essentialTotal)}/mo</div>
        <div class="text-sm text-gray-600">${Math.round((essentialTotal / monthlyCost) * 100)}% of total</div>
      </div>
      <div class="text-center">
        <div class="text-sm font-medium text-gray-500">Non-Essential</div>
        <div class="text-xl font-bold">${formatCurrency(nonEssentialTotal)}/mo</div>
        <div class="text-sm text-gray-600">${Math.round((nonEssentialTotal / monthlyCost) * 100)}% of total</div>
      </div>
    </div>
  `;
  
  breakdownSection.appendChild(categoryBreakdown);
  breakdownSection.appendChild(essentialBreakdown);
  sniperContainer.appendChild(breakdownSection);
  
  // Subscription form modal
  const modalContainer = document.createElement('div');
  modalContainer.id = 'subscription-modal';
  modalContainer.className = 'modal-container fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
  modalContainer.style.backdropFilter = 'blur(3px)';
  
  modalContainer.innerHTML = `
    <div class="modal-content bg-white rounded-lg w-full max-w-md p-6 relative">
      <button id="close-modal-btn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
      <h3 class="text-xl font-bold mb-4" id="modal-title">Add Subscription</h3>
      
      <form id="subscription-form">
        <input type="hidden" id="subscription-id">
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label for="subscription-name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" id="subscription-name" required
                   class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          <div>
            <label for="subscription-logo" class="block text-sm font-medium text-gray-700 mb-1">Logo/Icon</label>
            <input type="text" id="subscription-logo" placeholder="Emoji or icon"
                   class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label for="subscription-amount" class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" id="subscription-amount" min="0" step="0.01" required
                   class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          <div>
            <label for="subscription-billing-cycle" class="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
            <select id="subscription-billing-cycle" required
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="weekly">Weekly</option>
              <option value="monthly" selected>Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="biannual">Biannual</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>
        
        <div class="mb-4">
          <label for="subscription-category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select id="subscription-category" required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            ${categories.map(category => `
              <option value="${category.id}">${category.icon} ${category.name}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="mb-4">
          <label for="subscription-date" class="block text-sm font-medium text-gray-700 mb-1">Next Billing Date</label>
          <input type="date" id="subscription-date" required
                 class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label for="subscription-usage" class="block text-sm font-medium text-gray-700 mb-1">Usage Level</label>
            <select id="subscription-usage" required
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="high">High (Regular)</option>
              <option value="medium">Medium (Occasional)</option>
              <option value="low">Low (Rarely)</option>
            </select>
          </div>
          <div class="flex items-end">
            <label class="flex items-center p-2 cursor-pointer">
              <input type="checkbox" id="subscription-essential"
                     class="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded">
              <span class="ml-2 text-sm">Essential</span>
            </label>
            <label class="flex items-center p-2 cursor-pointer ml-4">
              <input type="checkbox" id="subscription-active" checked
                     class="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded">
              <span class="ml-2 text-sm">Active</span>
            </label>
          </div>
        </div>
        
        <div class="mb-6">
          <label for="subscription-notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea id="subscription-notes" rows="2"
                   class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
        </div>
        
        <div class="flex justify-end">
          <button type="button" id="cancel-subscription-btn" 
                  class="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" id="save-subscription-btn"
                  class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
            Save Subscription
          </button>
        </div>
      </form>
    </div>
  `;
  sniperContainer.appendChild(modalContainer);
  
  // Add event listeners
  setTimeout(() => {
    // Add subscription button
    const addSubscriptionBtn = sniperContainer.querySelector('#add-subscription-btn');
    if (addSubscriptionBtn) {
      addSubscriptionBtn.addEventListener('click', () => {
        const modal = sniperContainer.querySelector('#subscription-modal');
        const modalTitle = modal.querySelector('#modal-title');
        const form = modal.querySelector('#subscription-form');
        
        // Reset form
        form.reset();
        document.getElementById('subscription-id').value = '';
        
        // Set default date to next month
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        document.getElementById('subscription-date').valueAsDate = nextMonth;
        
        // Set default values
        document.getElementById('subscription-logo').value = '📱';
        document.getElementById('subscription-active').checked = true;
        
        // Update modal title
        modalTitle.textContent = 'Add Subscription';
        
        // Show modal
        modal.classList.remove('hidden');
      });
    }
    
    // Add first subscription button (shown when no subscriptions exist)
    const addFirstSubscriptionBtn = sniperContainer.querySelector('#add-first-subscription-btn');
    if (addFirstSubscriptionBtn) {
      addFirstSubscriptionBtn.addEventListener('click', () => {
        const addSubscriptionBtn = sniperContainer.querySelector('#add-subscription-btn');
        if (addSubscriptionBtn) {
          addSubscriptionBtn.click();
        }
      });
    }
    
    // Close modal buttons
    const closeModalBtn = sniperContainer.querySelector('#close-modal-btn');
    const cancelSubscriptionBtn = sniperContainer.querySelector('#cancel-subscription-btn');
    
    [closeModalBtn, cancelSubscriptionBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          const modal = sniperContainer.querySelector('#subscription-modal');
          modal.classList.add('hidden');
        });
      }
    });
    
    // Edit subscription buttons
    const editButtons = sniperContainer.querySelectorAll('.edit-subscription-btn');
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        const subscriptionId = parseInt(row.dataset.subscriptionId);
        
        // Find the subscription
        const subscription = subscriptions.find(s => s.id === subscriptionId);
        if (!subscription) return;
        
        // Populate the form
        document.getElementById('subscription-id').value = subscription.id;
        document.getElementById('subscription-name').value = subscription.name;
        document.getElementById('subscription-logo').value = subscription.logo;
        document.getElementById('subscription-amount').value = subscription.amount;
        document.getElementById('subscription-billing-cycle').value = subscription.billingCycle;
        document.getElementById('subscription-category').value = subscription.category;
        document.getElementById('subscription-date').value = new Date(subscription.nextBillingDate).toISOString().split('T')[0];
        document.getElementById('subscription-usage').value = subscription.usage;
        document.getElementById('subscription-essential').checked = subscription.essential;
        document.getElementById('subscription-active').checked = subscription.active;
        document.getElementById('subscription-notes').value = subscription.notes || '';
        
        // Update modal title
        document.getElementById('modal-title').textContent = 'Edit Subscription';
        
        // Show modal
        document.getElementById('subscription-modal').classList.remove('hidden');
      });
    });
    
    // Toggle subscription buttons
    const toggleButtons = sniperContainer.querySelectorAll('.toggle-subscription-btn');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        const subscriptionId = parseInt(row.dataset.subscriptionId);
        
        // Find the subscription
        const subscription = subscriptions.find(s => s.id === subscriptionId);
        if (!subscription) return;
        
        // Toggle active status
        subscription.active = !subscription.active;
        
        // Save the updated subscription
        saveSubscription(subscription);
        
        // Refresh the page
        window.location.reload();
      });
    });
    
    // Delete subscription buttons
    const deleteButtons = sniperContainer.querySelectorAll('.delete-subscription-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (confirm('Are you sure you want to delete this subscription?')) {
          const row = e.target.closest('tr');
          const subscriptionId = parseInt(row.dataset.subscriptionId);
          
          // Delete the subscription
          if (deleteSubscription(subscriptionId)) {
            // Refresh the page
            window.location.reload();
          }
        }
      });
    });
    
    // Subscription form submission
    const subscriptionForm = sniperContainer.querySelector('#subscription-form');
    if (subscriptionForm) {
      subscriptionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const id = document.getElementById('subscription-id').value ? parseInt(document.getElementById('subscription-id').value) : null;
        const name = document.getElementById('subscription-name').value;
        const logo = document.getElementById('subscription-logo').value;
        const amount = parseFloat(document.getElementById('subscription-amount').value);
        const billingCycle = document.getElementById('subscription-billing-cycle').value;
        const category = document.getElementById('subscription-category').value;
        const nextBillingDate = document.getElementById('subscription-date').value;
        const usage = document.getElementById('subscription-usage').value;
        const essential = document.getElementById('subscription-essential').checked;
        const active = document.getElementById('subscription-active').checked;
        const notes = document.getElementById('subscription-notes').value;
        
        // Create subscription object
        const subscription = {
          id,
          name,
          logo,
          amount,
          billingCycle,
          category,
          nextBillingDate: new Date(nextBillingDate).toISOString(),
          usage,
          essential,
          active,
          notes,
          addedDate: id ? subscriptions.find(s => s.id === id)?.addedDate : new Date().toISOString()
        };
        
        // Save the subscription
        saveSubscription(subscription);
        
        // Close the modal
        document.getElementById('subscription-modal').classList.add('hidden');
        
        // Refresh the page
        window.location.reload();
      });
    }
    
    // Subscription filter
    const subscriptionFilter = sniperContainer.querySelector('#subscription-filter');
    const subscriptionSort = sniperContainer.querySelector('#subscription-sort');
    
    function applyFiltersAndSort() {
      const filterValue = subscriptionFilter.value;
      const sortValue = subscriptionSort.value;
      
      // Clone the subscriptions array
      let filteredSubscriptions = [...subscriptions];
      
      // Apply category filter
      if (filterValue !== 'all') {
        filteredSubscriptions = filteredSubscriptions.filter(sub => sub.category === filterValue);
      }
      
      // Apply sorting
      filteredSubscriptions.sort((a, b) => {
        if (sortValue === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortValue === 'amount') {
          // Convert to monthly amount for fair comparison
          const aMonthly = a.billingCycle === 'monthly' ? a.amount : 
                         a.billingCycle === 'annual' ? a.amount / 12 :
                         a.billingCycle === 'quarterly' ? a.amount / 3 :
                         a.billingCycle === 'biannual' ? a.amount / 6 :
                         a.amount * 4.33; // weekly
                         
          const bMonthly = b.billingCycle === 'monthly' ? b.amount : 
                         b.billingCycle === 'annual' ? b.amount / 12 :
                         b.billingCycle === 'quarterly' ? b.amount / 3 :
                         b.billingCycle === 'biannual' ? b.amount / 6 :
                         b.amount * 4.33; // weekly
                         
          return bMonthly - aMonthly; // Higher amount first
        } else if (sortValue === 'date') {
          return new Date(a.nextBillingDate) - new Date(b.nextBillingDate);
        }
        
        return 0;
      });
      
      // Rebuild the table with filtered and sorted subscriptions
      const tableBody = sniperContainer.querySelector('#subscription-entries');
      
      if (filteredSubscriptions.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4 text-gray-500">
              No subscriptions found matching your filters
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = filteredSubscriptions.map((subscription, index) => {
          const category = categories.find(cat => cat.id === subscription.category) || { name: 'Other', icon: '📌' };
          
          return `
            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${!subscription.active ? 'opacity-50' : ''}" data-subscription-id="${subscription.id}">
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-xl mr-2">${subscription.logo}</div>
                  <div>
                    <div class="font-medium">${subscription.name}</div>
                    <div class="text-xs text-gray-500">${subscription.notes || ''}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                <span class="inline-flex items-center">
                  <span class="mr-1">${category.icon}</span>
                  ${category.name}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                ${formatCurrency(subscription.amount)}
                <div class="text-xs text-gray-500">${subscription.billingCycle}</div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                ${subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                ${formatDate(subscription.nextBillingDate)}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                <span class="px-2 py-1 text-xs rounded-full ${
                  subscription.usage === 'high' ? 'bg-green-100 text-green-800' : 
                  subscription.usage === 'medium' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'
                }">
                  ${subscription.usage.charAt(0).toUpperCase() + subscription.usage.slice(1)}
                </span>
                ${subscription.essential ? '<span class="ml-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Essential</span>' : ''}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                <button class="edit-subscription-btn text-blue-600 hover:text-blue-800 mr-2">
                  Edit
                </button>
                <button class="toggle-subscription-btn ${subscription.active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'} mr-2">
                  ${subscription.active ? 'Pause' : 'Activate'}
                </button>
                <button class="delete-subscription-btn text-red-600 hover:text-red-800">
                  Delete
                </button>
              </td>
            </tr>
          `;
        }).join('');
        
        // Re-attach event listeners
        const newEditButtons = tableBody.querySelectorAll('.edit-subscription-btn');
        newEditButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const subscriptionId = parseInt(row.dataset.subscriptionId);
            
            // Find the subscription
            const subscription = subscriptions.find(s => s.id === subscriptionId);
            if (!subscription) return;
            
            // Populate the form
            document.getElementById('subscription-id').value = subscription.id;
            document.getElementById('subscription-name').value = subscription.name;
            document.getElementById('subscription-logo').value = subscription.logo;
            document.getElementById('subscription-amount').value = subscription.amount;
            document.getElementById('subscription-billing-cycle').value = subscription.billingCycle;
            document.getElementById('subscription-category').value = subscription.category;
            document.getElementById('subscription-date').value = new Date(subscription.nextBillingDate).toISOString().split('T')[0];
            document.getElementById('subscription-usage').value = subscription.usage;
            document.getElementById('subscription-essential').checked = subscription.essential;
            document.getElementById('subscription-active').checked = subscription.active;
            document.getElementById('subscription-notes').value = subscription.notes || '';
            
            // Update modal title
            document.getElementById('modal-title').textContent = 'Edit Subscription';
            
            // Show modal
            document.getElementById('subscription-modal').classList.remove('hidden');
          });
        });
        
        const newToggleButtons = tableBody.querySelectorAll('.toggle-subscription-btn');
        newToggleButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const subscriptionId = parseInt(row.dataset.subscriptionId);
            
            // Find the subscription
            const subscription = subscriptions.find(s => s.id === subscriptionId);
            if (!subscription) return;
            
            // Toggle active status
            subscription.active = !subscription.active;
            
            // Save the updated subscription
            saveSubscription(subscription);
            
            // Refresh the page
            window.location.reload();
          });
        });
        
        const newDeleteButtons = tableBody.querySelectorAll('.delete-subscription-btn');
        newDeleteButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            if (confirm('Are you sure you want to delete this subscription?')) {
              const row = e.target.closest('tr');
              const subscriptionId = parseInt(row.dataset.subscriptionId);
              
              // Delete the subscription
              if (deleteSubscription(subscriptionId)) {
                // Refresh the page
                window.location.reload();
              }
            }
          });
        });
      }
    }
    
    if (subscriptionFilter) {
      subscriptionFilter.addEventListener('change', applyFiltersAndSort);
    }
    
    if (subscriptionSort) {
      subscriptionSort.addEventListener('change', applyFiltersAndSort);
    }
    
    // Render charts
    try {
      // Check if charting library is available
      if (typeof Chart !== 'undefined') {
        // Calculate category totals
        const categoryTotals = {};
        categories.forEach(category => {
          categoryTotals[category.id] = 0;
        });
        
        subscriptions.forEach(sub => {
          if (!sub.active) return;
          
          // Convert to monthly amount
          const monthlyAmount = sub.billingCycle === 'monthly' ? sub.amount : 
                              sub.billingCycle === 'annual' ? sub.amount / 12 :
                              sub.billingCycle === 'quarterly' ? sub.amount / 3 :
                              sub.billingCycle === 'biannual' ? sub.amount / 6 :
                              sub.amount * 4.33; // weekly
          
          if (categoryTotals[sub.category] !== undefined) {
            categoryTotals[sub.category] += monthlyAmount;
          } else {
            categoryTotals[sub.category] = monthlyAmount;
          }
        });
        
        // Filter out categories with zero amount
        const categoryData = categories
          .filter(category => categoryTotals[category.id] > 0)
          .map(category => ({
            id: category.id,
            name: category.name,
            icon: category.icon,
            amount: categoryTotals[category.id]
          }))
          .sort((a, b) => b.amount - a.amount);
        
        // Category chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx && categoryData.length > 0) {
          new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
              labels: categoryData.map(cat => cat.name),
              datasets: [{
                data: categoryData.map(cat => cat.amount),
                backgroundColor: [
                  'rgba(52, 168, 83, 0.8)',
                  'rgba(66, 133, 244, 0.8)',
                  'rgba(251, 188, 5, 0.8)',
                  'rgba(234, 67, 53, 0.8)',
                  'rgba(128, 0, 128, 0.8)',
                  'rgba(0, 128, 128, 0.8)',
                  'rgba(128, 128, 0, 0.8)',
                  'rgba(0, 0, 128, 0.8)',
                  'rgba(128, 0, 0, 0.8)',
                  'rgba(0, 128, 0, 0.8)'
                ]
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right'
                },
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
        
        // Essential chart
        const essentialCtx = document.getElementById('essentialChart');
        if (essentialCtx) {
          new Chart(essentialCtx, {
            type: 'pie',
            data: {
              labels: ['Essential', 'Non-Essential'],
              datasets: [{
                data: [essentialTotal, nonEssentialTotal],
                backgroundColor: [
                  'rgba(66, 133, 244, 0.8)',
                  'rgba(251, 188, 5, 0.8)'
                ]
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
        const chartContainers = sniperContainer.querySelectorAll('.chart-container');
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
    
    // View all upcoming button
    const viewAllUpcomingBtn = sniperContainer.querySelector('#view-all-upcoming');
    if (viewAllUpcomingBtn) {
      viewAllUpcomingBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Create modal to show all upcoming billings
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.style.backdropFilter = 'blur(3px)';
        
        modal.innerHTML = `
          <div class="bg-white rounded-lg w-full max-w-2xl p-6 relative">
            <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            <h3 class="text-xl font-bold mb-4">Upcoming Billings (Next 30 Days)</h3>
            
            <div class="overflow-y-auto max-h-96">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Date</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  ${upcomingBillings.map((sub, index) => {
                    const daysLeft = Math.ceil((new Date(sub.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24));
                    
                    return `
                      <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                        <td class="px-4 py-3 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="text-xl mr-2">${sub.logo}</div>
                            <div class="font-medium">${sub.name}</div>
                          </div>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          ${formatCurrency(sub.amount)}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm">
                          ${formatDate(sub.nextBillingDate)}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm">
                          <span class="px-2 py-1 text-xs rounded-full ${
                            daysLeft <= 3 ? 'bg-red-100 text-red-800' : 
                            daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }">
                            ${daysLeft} day${daysLeft !== 1 ? 's' : ''}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="flex justify-end mt-4">
              <button class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                Close
              </button>
            </div>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners to close modal
        const closeButton = modal.querySelector('button');
        closeButton.addEventListener('click', () => {
          document.body.removeChild(modal);
        });
        
        const closeButtonFooter = modal.querySelector('.flex button');
        closeButtonFooter.addEventListener('click', () => {
          document.body.removeChild(modal);
        });
      });
    }
  }, 100);
  
  return sniperContainer;
}