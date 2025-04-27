/**
 * Spending Guardrails Feature
 * Allows users to set category-based spending limits and receive notifications
 * when they're approaching or exceeding their limits
 */

// Global variables
let currentUserId = null;
let currentUserProfile = null;
let spendingLimits = [];
let currentPage = 'dashboard';
let currentCycleFilter = 'monthly'; // 'weekly' or 'monthly'

// Import expense categories for consistent reference
let expenseCategories = [];

document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the guardrails page
  const guardrailsContainer = document.getElementById('guardrails-container');
  if (!guardrailsContainer) return;

  // Initialize the toast system
  try {
    import('./components/toast.js').then(toastModule => {
      // Make the showToast function globally available
      window.showToast = toastModule.showToast;
      initializeGuardrailsPage();
    }).catch(error => {
      console.error('Error importing toast module:', error);
      initializeGuardrailsPage();
    });
  } catch (error) {
    console.error('Error setting up toast system:', error);
    initializeGuardrailsPage();
  }
});

/**
 * Initialize the guardrails page
 */
async function initializeGuardrailsPage() {
  console.log('Initializing Guardrails page...');
  
  try {
    // Import user profile module and get expense categories
    const userProfileModule = await import('./user-profile.js');
    const schemaData = await fetch('/api/schema/expense-categories').then(res => res.json());
    expenseCategories = schemaData.expenseCategories || [];
    
    // Get current user ID
    currentUserId = getCurrentUserId();
    
    if (!currentUserId) {
      showError('User ID not found. Please log in again.');
      return;
    }
    
    // Load user profile
    currentUserProfile = await userProfileModule.initUserProfile(currentUserId);
    
    if (!currentUserProfile) {
      showError('Failed to load profile data. Please try again later.');
      return;
    }
    
    // Load spending limits
    await loadSpendingLimits();
    
    // Render the page
    renderGuardrailsPage();
    setupGuardrailsEventListeners();
    
  } catch (error) {
    console.error('Error initializing Guardrails page:', error);
    showError('Failed to initialize Guardrails page. Please try again later.');
  }
}

/**
 * Get the current user ID from app state or localStorage
 * @returns {string|null} User ID or null if not found
 */
function getCurrentUserId() {
  // Try to get from window.appState first
  if (window.appState && window.appState.user && window.appState.user.id) {
    return window.appState.user.id;
  }
  
  // Fall back to localStorage
  try {
    const userData = localStorage.getItem('stackrUser');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
  }
  
  return null;
}

/**
 * Load spending limits from API
 */
async function loadSpendingLimits() {
  try {
    const response = await fetch(`/api/spending-limits?userId=${currentUserId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch spending limits');
    }
    
    const data = await response.json();
    spendingLimits = data.limits || [];
    
    // Sort by category
    spendingLimits.sort((a, b) => {
      const catA = getCategoryById(a.category);
      const catB = getCategoryById(b.category);
      return catA.name.localeCompare(catB.name);
    });
    
  } catch (error) {
    console.error('Error loading spending limits:', error);
    throw error;
  }
}

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {Object} Category object with id, name, icon, color
 */
function getCategoryById(categoryId) {
  return expenseCategories.find(cat => cat.id === categoryId) || 
    { id: categoryId, name: categoryId, icon: 'moreHorizontal', color: 'gray' };
}

/**
 * Render the guardrails page
 */
function renderGuardrailsPage() {
  const container = document.getElementById('guardrails-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Header section
  const header = document.createElement('div');
  header.className = 'guardrails-header';
  header.style.display = 'flex';
  header.style.flexDirection = 'column';
  header.style.marginBottom = '2rem';
  header.style.padding = '1.5rem';
  header.style.background = 'linear-gradient(to right, #4F46E5, #7C3AED)';
  header.style.borderRadius = '12px';
  header.style.color = 'white';
  
  const title = document.createElement('h1');
  title.textContent = 'Spending Guardrails';
  title.style.fontSize = '28px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '0.5rem';
  
  const description = document.createElement('p');
  description.textContent = 'Set category spending limits to stay on track with your financial goals.';
  description.style.fontSize = '16px';
  description.style.opacity = '0.9';
  description.style.marginBottom = '1.5rem';
  
  // Tabs for different views
  const tabs = document.createElement('div');
  tabs.className = 'guardrails-tabs';
  tabs.style.display = 'flex';
  tabs.style.gap = '1rem';
  tabs.style.marginBottom = '1rem';
  
  const dashboardTab = createTab('Dashboard', currentPage === 'dashboard', () => {
    currentPage = 'dashboard';
    renderGuardrailsPage();
  });
  
  const manageTab = createTab('Manage Limits', currentPage === 'manage', () => {
    currentPage = 'manage';
    renderGuardrailsPage();
  });
  
  const historyTab = createTab('Spending History', currentPage === 'history', () => {
    currentPage = 'history';
    renderGuardrailsPage();
  });
  
  tabs.appendChild(dashboardTab);
  tabs.appendChild(manageTab);
  tabs.appendChild(historyTab);
  
  header.appendChild(title);
  header.appendChild(description);
  header.appendChild(tabs);
  
  container.appendChild(header);
  
  // Content area
  const content = document.createElement('div');
  content.className = 'guardrails-content';
  content.style.padding = '0 0.5rem';
  
  // Render the appropriate content based on currentPage
  switch (currentPage) {
    case 'dashboard':
      renderDashboardView(content);
      break;
    case 'manage':
      renderManageLimitsView(content);
      break;
    case 'history':
      renderHistoryView(content);
      break;
  }
  
  container.appendChild(content);
}

/**
 * Create a tab element
 * @param {string} text - Tab text
 * @param {boolean} active - Whether tab is active
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} Tab element
 */
function createTab(text, active, onClick) {
  const tab = document.createElement('button');
  tab.className = 'guardrails-tab';
  tab.textContent = text;
  tab.style.padding = '0.75rem 1.25rem';
  tab.style.borderRadius = '8px';
  tab.style.border = 'none';
  tab.style.fontWeight = active ? 'bold' : 'normal';
  tab.style.backgroundColor = active ? 'rgba(255, 255, 255, 0.2)' : 'transparent';
  tab.style.color = 'white';
  tab.style.cursor = 'pointer';
  tab.style.transition = 'background-color 0.3s';
  
  tab.addEventListener('click', onClick);
  
  return tab;
}

/**
 * Render the dashboard view
 * @param {HTMLElement} container - Content container
 */
function renderDashboardView(container) {
  // If no limits, show empty state
  if (spendingLimits.length === 0) {
    renderEmptyState(container, 'No spending limits set', 'Create your first spending limit to start tracking your expenses by category.', () => {
      currentPage = 'manage';
      renderGuardrailsPage();
    });
    return;
  }
  
  // Cycle selector
  const cycleSelector = document.createElement('div');
  cycleSelector.style.display = 'flex';
  cycleSelector.style.justifyContent = 'flex-end';
  cycleSelector.style.marginBottom = '1rem';
  
  const cycleLabel = document.createElement('span');
  cycleLabel.textContent = 'View: ';
  cycleLabel.style.marginRight = '0.5rem';
  cycleLabel.style.alignSelf = 'center';
  cycleLabel.style.color = '#6B7280';
  
  const weeklyBtn = document.createElement('button');
  weeklyBtn.textContent = 'Weekly';
  weeklyBtn.className = 'cycle-btn';
  weeklyBtn.style.padding = '0.5rem 1rem';
  weeklyBtn.style.border = 'none';
  weeklyBtn.style.borderRadius = '6px 0 0 6px';
  weeklyBtn.style.backgroundColor = currentCycleFilter === 'weekly' ? '#4F46E5' : '#E5E7EB';
  weeklyBtn.style.color = currentCycleFilter === 'weekly' ? 'white' : '#374151';
  weeklyBtn.style.fontWeight = currentCycleFilter === 'weekly' ? 'bold' : 'normal';
  weeklyBtn.style.cursor = 'pointer';
  
  const monthlyBtn = document.createElement('button');
  monthlyBtn.textContent = 'Monthly';
  monthlyBtn.className = 'cycle-btn';
  monthlyBtn.style.padding = '0.5rem 1rem';
  monthlyBtn.style.border = 'none';
  monthlyBtn.style.borderRadius = '0 6px 6px 0';
  monthlyBtn.style.backgroundColor = currentCycleFilter === 'monthly' ? '#4F46E5' : '#E5E7EB';
  monthlyBtn.style.color = currentCycleFilter === 'monthly' ? 'white' : '#374151';
  monthlyBtn.style.fontWeight = currentCycleFilter === 'monthly' ? 'bold' : 'normal';
  monthlyBtn.style.cursor = 'pointer';
  
  weeklyBtn.addEventListener('click', () => {
    currentCycleFilter = 'weekly';
    renderGuardrailsPage();
  });
  
  monthlyBtn.addEventListener('click', () => {
    currentCycleFilter = 'monthly';
    renderGuardrailsPage();
  });
  
  cycleSelector.appendChild(cycleLabel);
  cycleSelector.appendChild(weeklyBtn);
  cycleSelector.appendChild(monthlyBtn);
  
  container.appendChild(cycleSelector);
  
  // Filter the limits by cycle
  const filteredLimits = spendingLimits.filter(limit => limit.cycle === currentCycleFilter);
  
  if (filteredLimits.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.padding = '2rem';
    emptyMessage.style.backgroundColor = '#F9FAFB';
    emptyMessage.style.borderRadius = '8px';
    emptyMessage.style.marginTop = '1rem';
    
    const emptyText = document.createElement('p');
    emptyText.textContent = `No ${currentCycleFilter} spending limits set. Switch to another view or create new limits.`;
    emptyText.style.color = '#6B7280';
    emptyText.style.marginBottom = '1rem';
    
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Spending Limit';
    addBtn.style.padding = '0.75rem 1.5rem';
    addBtn.style.backgroundColor = '#4F46E5';
    addBtn.style.color = 'white';
    addBtn.style.border = 'none';
    addBtn.style.borderRadius = '6px';
    addBtn.style.fontWeight = 'bold';
    addBtn.style.cursor = 'pointer';
    
    addBtn.addEventListener('click', () => {
      currentPage = 'manage';
      renderGuardrailsPage();
    });
    
    emptyMessage.appendChild(emptyText);
    emptyMessage.appendChild(addBtn);
    container.appendChild(emptyMessage);
    return;
  }
  
  // Grid of spending limit cards
  const limitsGrid = document.createElement('div');
  limitsGrid.style.display = 'grid';
  limitsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  limitsGrid.style.gap = '1rem';
  limitsGrid.style.marginTop = '1rem';
  
  // Sample current spending data (in a real app, this would come from the API)
  // This would be fetched in loadSpendingLimits()
  const sampleSpendingData = {
    'housing': { spent: 1450, status: 'good' },
    'food': { spent: 380, status: 'warning' },
    'transportation': { spent: 210, status: 'good' },
    'entertainment': { spent: 320, status: 'over' },
    'utilities': { spent: 180, status: 'good' }
  };
  
  // Create a card for each spending limit
  filteredLimits.forEach(limit => {
    const category = getCategoryById(limit.category);
    const spent = sampleSpendingData[limit.category]?.spent || 0;
    const status = sampleSpendingData[limit.category]?.status || 'good';
    
    const percentSpent = Math.min(100, (spent / limit.limitAmount) * 100);
    
    // Card for the spending limit
    const card = document.createElement('div');
    card.className = 'spending-limit-card';
    card.style.backgroundColor = 'white';
    card.style.borderRadius = '12px';
    card.style.padding = '1.5rem';
    card.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    card.style.border = '1px solid #E5E7EB';
    card.style.position = 'relative';
    
    // Category header
    const cardHeader = document.createElement('div');
    cardHeader.style.display = 'flex';
    cardHeader.style.alignItems = 'center';
    cardHeader.style.marginBottom = '1rem';
    
    // Category icon
    const iconBg = document.createElement('div');
    iconBg.style.width = '40px';
    iconBg.style.height = '40px';
    iconBg.style.borderRadius = '50%';
    iconBg.style.backgroundColor = getCategoryColor(category.color, 0.15);
    iconBg.style.display = 'flex';
    iconBg.style.alignItems = 'center';
    iconBg.style.justifyContent = 'center';
    iconBg.style.marginRight = '1rem';
    
    const iconSvg = getCategoryIcon(category.icon, getCategoryColor(category.color));
    iconBg.innerHTML = iconSvg;
    
    const categoryName = document.createElement('h3');
    categoryName.textContent = category.name;
    categoryName.style.fontSize = '18px';
    categoryName.style.fontWeight = 'bold';
    categoryName.style.margin = '0';
    
    cardHeader.appendChild(iconBg);
    cardHeader.appendChild(categoryName);
    
    // Status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.style.position = 'absolute';
    statusIndicator.style.top = '1.5rem';
    statusIndicator.style.right = '1.5rem';
    statusIndicator.style.width = '10px';
    statusIndicator.style.height = '10px';
    statusIndicator.style.borderRadius = '50%';
    
    if (status === 'good') {
      statusIndicator.style.backgroundColor = '#10B981'; // Green
    } else if (status === 'warning') {
      statusIndicator.style.backgroundColor = '#F59E0B'; // Amber
    } else if (status === 'over') {
      statusIndicator.style.backgroundColor = '#EF4444'; // Red
    }
    
    // Amount section
    const amountSection = document.createElement('div');
    amountSection.style.marginBottom = '1rem';
    
    const spentAmount = document.createElement('div');
    spentAmount.style.display = 'flex';
    spentAmount.style.justifyContent = 'space-between';
    spentAmount.style.alignItems = 'flex-end';
    spentAmount.style.marginBottom = '0.5rem';
    
    const spentLabel = document.createElement('span');
    spentLabel.textContent = 'Spent:';
    spentLabel.style.color = '#6B7280';
    spentLabel.style.fontSize = '14px';
    
    const spentValue = document.createElement('span');
    spentValue.textContent = `$${spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    spentValue.style.fontSize = '20px';
    spentValue.style.fontWeight = 'bold';
    
    spentAmount.appendChild(spentLabel);
    spentAmount.appendChild(spentValue);
    
    const limitAmount = document.createElement('div');
    limitAmount.style.display = 'flex';
    limitAmount.style.justifyContent = 'space-between';
    limitAmount.style.alignItems = 'flex-end';
    
    const limitLabel = document.createElement('span');
    limitLabel.textContent = 'Limit:';
    limitLabel.style.color = '#6B7280';
    limitLabel.style.fontSize = '14px';
    
    const limitValue = document.createElement('span');
    limitValue.textContent = `$${limit.limitAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    limitValue.style.color = '#6B7280';
    
    limitAmount.appendChild(limitLabel);
    limitAmount.appendChild(limitValue);
    
    amountSection.appendChild(spentAmount);
    amountSection.appendChild(limitAmount);
    
    // Progress bar
    const progressContainer = document.createElement('div');
    progressContainer.style.height = '8px';
    progressContainer.style.backgroundColor = '#E5E7EB';
    progressContainer.style.borderRadius = '4px';
    progressContainer.style.marginBottom = '1rem';
    
    const progressBar = document.createElement('div');
    progressBar.style.height = '100%';
    progressBar.style.width = `${percentSpent}%`;
    progressBar.style.borderRadius = '4px';
    
    if (percentSpent < 70) {
      progressBar.style.backgroundColor = '#10B981'; // Green
    } else if (percentSpent < 100) {
      progressBar.style.backgroundColor = '#F59E0B'; // Amber
    } else {
      progressBar.style.backgroundColor = '#EF4444'; // Red
    }
    
    progressContainer.appendChild(progressBar);
    
    // Remaining
    const remaining = document.createElement('div');
    remaining.style.fontSize = '14px';
    remaining.style.color = '#6B7280';
    remaining.style.textAlign = 'right';
    
    const remainingAmount = Math.max(0, limit.limitAmount - spent);
    remaining.textContent = `$${remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining`;
    
    // Edit and Delete buttons
    const actionsContainer = document.createElement('div');
    actionsContainer.style.display = 'flex';
    actionsContainer.style.gap = '0.5rem';
    actionsContainer.style.marginTop = '1rem';
    
    const editButton = document.createElement('button');
    editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    editButton.style.backgroundColor = '#F3F4F6';
    editButton.style.border = 'none';
    editButton.style.borderRadius = '6px';
    editButton.style.padding = '0.5rem';
    editButton.style.cursor = 'pointer';
    editButton.style.color = '#4B5563';
    
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
    deleteButton.style.backgroundColor = '#FEE2E2';
    deleteButton.style.border = 'none';
    deleteButton.style.borderRadius = '6px';
    deleteButton.style.padding = '0.5rem';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.color = '#B91C1C';
    
    // Event listeners for edit and delete
    editButton.addEventListener('click', () => {
      editSpendingLimit(limit);
    });
    
    deleteButton.addEventListener('click', () => {
      deleteSpendingLimit(limit);
    });
    
    actionsContainer.appendChild(editButton);
    actionsContainer.appendChild(deleteButton);
    
    // Assemble the card
    card.appendChild(statusIndicator);
    card.appendChild(cardHeader);
    card.appendChild(amountSection);
    card.appendChild(progressContainer);
    card.appendChild(remaining);
    card.appendChild(actionsContainer);
    
    limitsGrid.appendChild(card);
  });
  
  container.appendChild(limitsGrid);
}

/**
 * Render the manage limits view
 * @param {HTMLElement} container - Content container
 */
function renderManageLimitsView(container) {
  // Header with add button
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '1.5rem';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Manage Spending Limits';
  heading.style.fontSize = '20px';
  heading.style.fontWeight = 'bold';
  heading.style.margin = '0';
  
  const addButton = document.createElement('button');
  addButton.textContent = 'Add New Limit';
  addButton.style.display = 'flex';
  addButton.style.alignItems = 'center';
  addButton.style.padding = '0.75rem 1.5rem';
  addButton.style.backgroundColor = '#4F46E5';
  addButton.style.color = 'white';
  addButton.style.border = 'none';
  addButton.style.borderRadius = '6px';
  addButton.style.fontWeight = 'bold';
  addButton.style.cursor = 'pointer';
  
  addButton.addEventListener('click', () => {
    showSpendingLimitModal();
  });
  
  header.appendChild(heading);
  header.appendChild(addButton);
  
  container.appendChild(header);
  
  // If no limits, show empty state
  if (spendingLimits.length === 0) {
    renderEmptyState(container, 'No spending limits set', 'Create your first spending limit to start tracking your expenses by category.', () => {
      showSpendingLimitModal();
    });
    return;
  }
  
  // Spending limits table
  const table = document.createElement('table');
  table.className = 'spending-limits-table';
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginTop = '1rem';
  
  // Table header
  const thead = document.createElement('thead');
  thead.style.backgroundColor = '#F9FAFB';
  
  const headerRow = document.createElement('tr');
  
  const headers = ['Category', 'Limit Amount', 'Cycle', 'Status', 'Actions'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.padding = '0.75rem 1rem';
    th.style.textAlign = 'left';
    th.style.fontWeight = 'medium';
    th.style.color = '#6B7280';
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Table body
  const tbody = document.createElement('tbody');
  
  spendingLimits.forEach(limit => {
    const category = getCategoryById(limit.category);
    
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid #E5E7EB';
    
    // Category cell
    const categoryCell = document.createElement('td');
    categoryCell.style.padding = '1rem';
    
    const categoryContent = document.createElement('div');
    categoryContent.style.display = 'flex';
    categoryContent.style.alignItems = 'center';
    
    const iconBg = document.createElement('div');
    iconBg.style.width = '32px';
    iconBg.style.height = '32px';
    iconBg.style.borderRadius = '50%';
    iconBg.style.backgroundColor = getCategoryColor(category.color, 0.15);
    iconBg.style.display = 'flex';
    iconBg.style.alignItems = 'center';
    iconBg.style.justifyContent = 'center';
    iconBg.style.marginRight = '0.75rem';
    
    const iconSvg = getCategoryIcon(category.icon, getCategoryColor(category.color));
    iconBg.innerHTML = iconSvg;
    
    const categoryName = document.createElement('span');
    categoryName.textContent = category.name;
    categoryName.style.fontWeight = '500';
    
    categoryContent.appendChild(iconBg);
    categoryContent.appendChild(categoryName);
    
    categoryCell.appendChild(categoryContent);
    
    // Limit amount cell
    const amountCell = document.createElement('td');
    amountCell.textContent = `$${limit.limitAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    amountCell.style.padding = '1rem';
    
    // Cycle cell
    const cycleCell = document.createElement('td');
    cycleCell.textContent = limit.cycle.charAt(0).toUpperCase() + limit.cycle.slice(1);
    cycleCell.style.padding = '1rem';
    
    // Status cell
    const statusCell = document.createElement('td');
    statusCell.style.padding = '1rem';
    
    const statusBadge = document.createElement('span');
    statusBadge.style.display = 'inline-block';
    statusBadge.style.padding = '0.25rem 0.75rem';
    statusBadge.style.borderRadius = '9999px';
    statusBadge.style.fontSize = '12px';
    statusBadge.style.fontWeight = 'medium';
    
    if (limit.isActive) {
      statusBadge.textContent = 'Active';
      statusBadge.style.backgroundColor = '#DCFCE7';
      statusBadge.style.color = '#166534';
    } else {
      statusBadge.textContent = 'Inactive';
      statusBadge.style.backgroundColor = '#F3F4F6';
      statusBadge.style.color = '#6B7280';
    }
    
    statusCell.appendChild(statusBadge);
    
    // Actions cell
    const actionsCell = document.createElement('td');
    actionsCell.style.padding = '1rem';
    
    const actionsContainer = document.createElement('div');
    actionsContainer.style.display = 'flex';
    actionsContainer.style.gap = '0.5rem';
    
    const editButton = document.createElement('button');
    editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    editButton.style.backgroundColor = '#F3F4F6';
    editButton.style.border = 'none';
    editButton.style.borderRadius = '6px';
    editButton.style.padding = '0.5rem';
    editButton.style.cursor = 'pointer';
    editButton.style.color = '#4B5563';
    
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
    deleteButton.style.backgroundColor = '#FEE2E2';
    deleteButton.style.border = 'none';
    deleteButton.style.borderRadius = '6px';
    deleteButton.style.padding = '0.5rem';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.color = '#B91C1C';
    
    // Status toggle
    const toggleButton = document.createElement('button');
    if (limit.isActive) {
      toggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      toggleButton.style.backgroundColor = '#E0F2FE';
      toggleButton.style.color = '#0369A1';
    } else {
      toggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
      toggleButton.style.backgroundColor = '#F3F4F6';
      toggleButton.style.color = '#6B7280';
    }
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '6px';
    toggleButton.style.padding = '0.5rem';
    toggleButton.style.cursor = 'pointer';
    
    // Event listeners
    editButton.addEventListener('click', () => {
      editSpendingLimit(limit);
    });
    
    deleteButton.addEventListener('click', () => {
      deleteSpendingLimit(limit);
    });
    
    toggleButton.addEventListener('click', () => {
      toggleSpendingLimit(limit);
    });
    
    actionsContainer.appendChild(toggleButton);
    actionsContainer.appendChild(editButton);
    actionsContainer.appendChild(deleteButton);
    
    actionsCell.appendChild(actionsContainer);
    
    // Add cells to row
    row.appendChild(categoryCell);
    row.appendChild(amountCell);
    row.appendChild(cycleCell);
    row.appendChild(statusCell);
    row.appendChild(actionsCell);
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
}

/**
 * Render the history view
 * @param {HTMLElement} container - Content container
 */
function renderHistoryView(container) {
  // Header with filter options
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '1.5rem';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Spending History';
  heading.style.fontSize = '20px';
  heading.style.fontWeight = 'bold';
  heading.style.margin = '0';
  
  const filterContainer = document.createElement('div');
  filterContainer.style.display = 'flex';
  filterContainer.style.gap = '1rem';
  
  // Date filter dropdown
  const dateFilter = document.createElement('select');
  dateFilter.style.padding = '0.5rem';
  dateFilter.style.border = '1px solid #E5E7EB';
  dateFilter.style.borderRadius = '6px';
  dateFilter.style.backgroundColor = 'white';
  
  const dateOptions = [
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-3-months', label: 'Last 3 Months' }
  ];
  
  dateOptions.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label;
    dateFilter.appendChild(opt);
  });
  
  // Category filter dropdown
  const categoryFilter = document.createElement('select');
  categoryFilter.style.padding = '0.5rem';
  categoryFilter.style.border = '1px solid #E5E7EB';
  categoryFilter.style.borderRadius = '6px';
  categoryFilter.style.backgroundColor = 'white';
  
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Categories';
  categoryFilter.appendChild(allOption);
  
  expenseCategories.forEach(category => {
    const opt = document.createElement('option');
    opt.value = category.id;
    opt.textContent = category.name;
    categoryFilter.appendChild(opt);
  });
  
  filterContainer.appendChild(dateFilter);
  filterContainer.appendChild(categoryFilter);
  
  header.appendChild(heading);
  header.appendChild(filterContainer);
  
  container.appendChild(header);
  
  // Sample spending history data (in a real app, this would come from the API)
  const sampleHistoryData = [
    { id: 1, category: 'food', description: 'Grocery shopping', amount: 85.27, date: new Date(2025, 3, 25) },
    { id: 2, category: 'entertainment', description: 'Movie tickets', amount: 32.50, date: new Date(2025, 3, 23) },
    { id: 3, category: 'transportation', description: 'Gas station', amount: 45.00, date: new Date(2025, 3, 21) },
    { id: 4, category: 'food', description: 'Restaurant dinner', amount: 62.30, date: new Date(2025, 3, 20) },
    { id: 5, category: 'housing', description: 'Electricity bill', amount: 110.45, date: new Date(2025, 3, 18) },
    { id: 6, category: 'entertainment', description: 'Streaming subscription', amount: 14.99, date: new Date(2025, 3, 15) },
    { id: 7, category: 'food', description: 'Coffee shop', amount: 5.75, date: new Date(2025, 3, 15) },
    { id: 8, category: 'transportation', description: 'Ride share', amount: 24.50, date: new Date(2025, 3, 12) }
  ];
  
  // Check if we have data to display
  if (sampleHistoryData.length === 0) {
    renderEmptyState(container, 'No spending history found', 'Your spending history will appear here once you start tracking expenses.', null);
    return;
  }
  
  // Create the spending history table
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  
  // Table header
  const thead = document.createElement('thead');
  thead.style.backgroundColor = '#F9FAFB';
  
  const headerRow = document.createElement('tr');
  
  const headers = ['Date', 'Category', 'Description', 'Amount'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.padding = '0.75rem 1rem';
    th.style.textAlign = headerText === 'Amount' ? 'right' : 'left';
    th.style.fontWeight = 'medium';
    th.style.color = '#6B7280';
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Table body
  const tbody = document.createElement('tbody');
  
  sampleHistoryData.forEach(item => {
    const category = getCategoryById(item.category);
    
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid #E5E7EB';
    
    // Date cell
    const dateCell = document.createElement('td');
    dateCell.textContent = item.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    dateCell.style.padding = '1rem';
    dateCell.style.color = '#6B7280';
    
    // Category cell
    const categoryCell = document.createElement('td');
    categoryCell.style.padding = '1rem';
    
    const categoryContent = document.createElement('div');
    categoryContent.style.display = 'flex';
    categoryContent.style.alignItems = 'center';
    
    const iconBg = document.createElement('div');
    iconBg.style.width = '28px';
    iconBg.style.height = '28px';
    iconBg.style.borderRadius = '50%';
    iconBg.style.backgroundColor = getCategoryColor(category.color, 0.15);
    iconBg.style.display = 'flex';
    iconBg.style.alignItems = 'center';
    iconBg.style.justifyContent = 'center';
    iconBg.style.marginRight = '0.5rem';
    
    const iconSvg = getCategoryIcon(category.icon, getCategoryColor(category.color), 14);
    iconBg.innerHTML = iconSvg;
    
    const categoryName = document.createElement('span');
    categoryName.textContent = category.name;
    
    categoryContent.appendChild(iconBg);
    categoryContent.appendChild(categoryName);
    
    categoryCell.appendChild(categoryContent);
    
    // Description cell
    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = item.description;
    descriptionCell.style.padding = '1rem';
    
    // Amount cell
    const amountCell = document.createElement('td');
    amountCell.textContent = `$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    amountCell.style.padding = '1rem';
    amountCell.style.textAlign = 'right';
    amountCell.style.fontWeight = '500';
    
    // Add cells to row
    row.appendChild(dateCell);
    row.appendChild(categoryCell);
    row.appendChild(descriptionCell);
    row.appendChild(amountCell);
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
}

/**
 * Render empty state when no data is available
 * @param {HTMLElement} container - Container element
 * @param {string} title - Empty state title
 * @param {string} description - Empty state description
 * @param {Function|null} actionCallback - Callback for action button
 */
function renderEmptyState(container, title, description, actionCallback) {
  const emptyState = document.createElement('div');
  emptyState.style.display = 'flex';
  emptyState.style.flexDirection = 'column';
  emptyState.style.alignItems = 'center';
  emptyState.style.justifyContent = 'center';
  emptyState.style.padding = '4rem 2rem';
  emptyState.style.backgroundColor = '#F9FAFB';
  emptyState.style.borderRadius = '12px';
  emptyState.style.textAlign = 'center';
  
  // Icon
  const iconContainer = document.createElement('div');
  iconContainer.style.width = '64px';
  iconContainer.style.height = '64px';
  iconContainer.style.borderRadius = '50%';
  iconContainer.style.backgroundColor = '#E0E7FF';
  iconContainer.style.display = 'flex';
  iconContainer.style.alignItems = 'center';
  iconContainer.style.justifyContent = 'center';
  iconContainer.style.marginBottom = '1.5rem';
  
  iconContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
  
  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  titleElement.style.fontSize = '18px';
  titleElement.style.fontWeight = 'bold';
  titleElement.style.marginBottom = '0.5rem';
  
  const descriptionElement = document.createElement('p');
  descriptionElement.textContent = description;
  descriptionElement.style.color = '#6B7280';
  descriptionElement.style.marginBottom = '1.5rem';
  
  emptyState.appendChild(iconContainer);
  emptyState.appendChild(titleElement);
  emptyState.appendChild(descriptionElement);
  
  if (actionCallback) {
    const actionButton = document.createElement('button');
    actionButton.textContent = 'Add Spending Limit';
    actionButton.style.padding = '0.75rem 1.5rem';
    actionButton.style.backgroundColor = '#4F46E5';
    actionButton.style.color = 'white';
    actionButton.style.border = 'none';
    actionButton.style.borderRadius = '6px';
    actionButton.style.fontWeight = 'bold';
    actionButton.style.cursor = 'pointer';
    
    actionButton.addEventListener('click', actionCallback);
    
    emptyState.appendChild(actionButton);
  }
  
  container.appendChild(emptyState);
}

/**
 * Show modal to add or edit a spending limit
 * @param {Object} existingLimit - Existing limit to edit (optional)
 */
function showSpendingLimitModal(existingLimit = null) {
  const isEditing = !!existingLimit;
  
  // Create modal backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.style.position = 'fixed';
  backdrop.style.top = '0';
  backdrop.style.left = '0';
  backdrop.style.width = '100%';
  backdrop.style.height = '100%';
  backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  backdrop.style.display = 'flex';
  backdrop.style.alignItems = 'center';
  backdrop.style.justifyContent = 'center';
  backdrop.style.zIndex = '1000';
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'spending-limit-modal';
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.padding = '2rem';
  modal.style.width = '100%';
  modal.style.maxWidth = '500px';
  modal.style.maxHeight = '90vh';
  modal.style.overflowY = 'auto';
  
  // Modal header
  const header = document.createElement('div');
  header.style.marginBottom = '1.5rem';
  
  const title = document.createElement('h2');
  title.textContent = isEditing ? 'Edit Spending Limit' : 'Add New Spending Limit';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '0.5rem';
  
  const description = document.createElement('p');
  description.textContent = isEditing
    ? 'Update your spending limit settings.'
    : 'Set a new spending limit to help manage your budget.';
  description.style.color = '#6B7280';
  description.style.margin = '0';
  
  header.appendChild(title);
  header.appendChild(description);
  
  // Form
  const form = document.createElement('form');
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '1.5rem';
  
  // Category select
  const categoryGroup = document.createElement('div');
  
  const categoryLabel = document.createElement('label');
  categoryLabel.htmlFor = 'category';
  categoryLabel.textContent = 'Category';
  categoryLabel.style.display = 'block';
  categoryLabel.style.marginBottom = '0.5rem';
  categoryLabel.style.fontWeight = '500';
  
  const categorySelect = document.createElement('select');
  categorySelect.id = 'category';
  categorySelect.name = 'category';
  categorySelect.style.width = '100%';
  categorySelect.style.padding = '0.75rem';
  categorySelect.style.border = '1px solid #E5E7EB';
  categorySelect.style.borderRadius = '6px';
  categorySelect.style.backgroundColor = 'white';
  
  expenseCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    
    if (isEditing && existingLimit.category === category.id) {
      option.selected = true;
    }
    
    categorySelect.appendChild(option);
  });
  
  categoryGroup.appendChild(categoryLabel);
  categoryGroup.appendChild(categorySelect);
  
  // Amount input
  const amountGroup = document.createElement('div');
  
  const amountLabel = document.createElement('label');
  amountLabel.htmlFor = 'limitAmount';
  amountLabel.textContent = 'Limit Amount';
  amountLabel.style.display = 'block';
  amountLabel.style.marginBottom = '0.5rem';
  amountLabel.style.fontWeight = '500';
  
  const amountContainer = document.createElement('div');
  amountContainer.style.position = 'relative';
  
  const amountPrefix = document.createElement('div');
  amountPrefix.textContent = '$';
  amountPrefix.style.position = 'absolute';
  amountPrefix.style.left = '0.75rem';
  amountPrefix.style.top = '50%';
  amountPrefix.style.transform = 'translateY(-50%)';
  amountPrefix.style.color = '#6B7280';
  
  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.id = 'limitAmount';
  amountInput.name = 'limitAmount';
  amountInput.placeholder = '0.00';
  amountInput.min = '0';
  amountInput.step = '0.01';
  amountInput.style.width = '100%';
  amountInput.style.padding = '0.75rem';
  amountInput.style.paddingLeft = '2rem';
  amountInput.style.border = '1px solid #E5E7EB';
  amountInput.style.borderRadius = '6px';
  
  if (isEditing) {
    amountInput.value = existingLimit.limitAmount;
  }
  
  amountContainer.appendChild(amountPrefix);
  amountContainer.appendChild(amountInput);
  
  amountGroup.appendChild(amountLabel);
  amountGroup.appendChild(amountContainer);
  
  // Cycle select
  const cycleGroup = document.createElement('div');
  
  const cycleLabel = document.createElement('label');
  cycleLabel.htmlFor = 'cycle';
  cycleLabel.textContent = 'Cycle';
  cycleLabel.style.display = 'block';
  cycleLabel.style.marginBottom = '0.5rem';
  cycleLabel.style.fontWeight = '500';
  
  const cycleSelect = document.createElement('select');
  cycleSelect.id = 'cycle';
  cycleSelect.name = 'cycle';
  cycleSelect.style.width = '100%';
  cycleSelect.style.padding = '0.75rem';
  cycleSelect.style.border = '1px solid #E5E7EB';
  cycleSelect.style.borderRadius = '6px';
  cycleSelect.style.backgroundColor = 'white';
  
  const cycleOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];
  
  cycleOptions.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label;
    
    if (isEditing && existingLimit.cycle === option.value) {
      opt.selected = true;
    }
    
    cycleSelect.appendChild(opt);
  });
  
  cycleGroup.appendChild(cycleLabel);
  cycleGroup.appendChild(cycleSelect);
  
  // Active status
  const statusGroup = document.createElement('div');
  
  const statusCheckbox = document.createElement('input');
  statusCheckbox.type = 'checkbox';
  statusCheckbox.id = 'isActive';
  statusCheckbox.name = 'isActive';
  statusCheckbox.checked = isEditing ? existingLimit.isActive : true;
  statusCheckbox.style.marginRight = '0.5rem';
  
  const statusLabel = document.createElement('label');
  statusLabel.htmlFor = 'isActive';
  statusLabel.textContent = 'Active';
  statusLabel.style.fontWeight = '500';
  
  statusGroup.appendChild(statusCheckbox);
  statusGroup.appendChild(statusLabel);
  
  // Form actions
  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.justifyContent = 'flex-end';
  actions.style.gap = '1rem';
  actions.style.marginTop = '1rem';
  
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '0.75rem 1.5rem';
  cancelButton.style.border = '1px solid #E5E7EB';
  cancelButton.style.borderRadius = '6px';
  cancelButton.style.backgroundColor = 'white';
  cancelButton.style.color = '#4B5563';
  cancelButton.style.fontWeight = '500';
  cancelButton.style.cursor = 'pointer';
  
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = isEditing ? 'Update Limit' : 'Add Limit';
  submitButton.style.padding = '0.75rem 1.5rem';
  submitButton.style.backgroundColor = '#4F46E5';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '6px';
  submitButton.style.fontWeight = 'bold';
  submitButton.style.cursor = 'pointer';
  
  actions.appendChild(cancelButton);
  actions.appendChild(submitButton);
  
  // Add form elements
  form.appendChild(categoryGroup);
  form.appendChild(amountGroup);
  form.appendChild(cycleGroup);
  form.appendChild(statusGroup);
  form.appendChild(actions);
  
  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      userId: currentUserId,
      category: categorySelect.value,
      limitAmount: parseFloat(amountInput.value),
      cycle: cycleSelect.value,
      isActive: statusCheckbox.checked
    };
    
    if (isNaN(formData.limitAmount) || formData.limitAmount <= 0) {
      showError('Please enter a valid limit amount greater than zero.');
      return;
    }
    
    try {
      if (isEditing) {
        formData.id = existingLimit.id;
        await updateSpendingLimit(formData);
      } else {
        await addSpendingLimit(formData);
      }
      
      // Close modal
      document.body.removeChild(backdrop);
      
      // Reload spending limits and refresh the page
      await loadSpendingLimits();
      renderGuardrailsPage();
      
      showSuccess(isEditing ? 'Spending limit updated successfully!' : 'New spending limit added successfully!');
    } catch (error) {
      console.error('Error saving spending limit:', error);
      showError(isEditing ? 'Failed to update spending limit. Please try again.' : 'Failed to add spending limit. Please try again.');
    }
  });
  
  // Handle cancel
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(backdrop);
  });
  
  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(form);
  backdrop.appendChild(modal);
  
  // Add modal to document
  document.body.appendChild(backdrop);
  
  // Close on background click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      document.body.removeChild(backdrop);
    }
  });
}

/**
 * Add a new spending limit
 * @param {Object} limitData - Spending limit data
 * @returns {Promise} Promise resolving to the created limit
 */
async function addSpendingLimit(limitData) {
  try {
    const response = await fetch('/api/spending-limits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(limitData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to add spending limit');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding spending limit:', error);
    throw error;
  }
}

/**
 * Update an existing spending limit
 * @param {Object} limitData - Updated spending limit data
 * @returns {Promise} Promise resolving to the updated limit
 */
async function updateSpendingLimit(limitData) {
  try {
    const response = await fetch(`/api/spending-limits/${limitData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(limitData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update spending limit');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating spending limit:', error);
    throw error;
  }
}

/**
 * Delete a spending limit
 * @param {Object} limit - The limit to delete
 */
async function deleteSpendingLimit(limit) {
  // Show confirmation dialog
  if (!confirm(`Are you sure you want to delete the ${getCategoryById(limit.category).name} spending limit?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/spending-limits/${limit.id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete spending limit');
    }
    
    // Reload spending limits and refresh the page
    await loadSpendingLimits();
    renderGuardrailsPage();
    
    showSuccess('Spending limit deleted successfully!');
  } catch (error) {
    console.error('Error deleting spending limit:', error);
    showError('Failed to delete spending limit. Please try again.');
  }
}

/**
 * Toggle a spending limit's active status
 * @param {Object} limit - The limit to toggle
 */
async function toggleSpendingLimit(limit) {
  try {
    const updatedLimit = {
      ...limit,
      isActive: !limit.isActive
    };
    
    await updateSpendingLimit(updatedLimit);
    
    // Reload spending limits and refresh the page
    await loadSpendingLimits();
    renderGuardrailsPage();
    
    showSuccess(`Spending limit ${updatedLimit.isActive ? 'activated' : 'deactivated'} successfully!`);
  } catch (error) {
    console.error('Error toggling spending limit:', error);
    showError('Failed to update spending limit. Please try again.');
  }
}

/**
 * Edit an existing spending limit
 * @param {Object} limit - The limit to edit
 */
function editSpendingLimit(limit) {
  showSpendingLimitModal(limit);
}

/**
 * Set up event listeners for the guardrails page
 */
function setupGuardrailsEventListeners() {
  // Event listeners will be added in the renderGuardrailsPage function
  // This is a placeholder for any global event listeners
}

/**
 * Show an error message
 * @param {string} message - Error message
 */
function showError(message) {
  try {
    import('./components/toast.js').then(toast => {
      toast.showToast(message, 'error');
    }).catch(() => {
      // Fallback to window.showToast or alert
      if (window.showToast) {
        window.showToast(message, 'error');
      } else {
        alert(message);
      }
    });
  } catch (e) {
    // If import fails, use fallback
    if (window.showToast) {
      window.showToast(message, 'error');
    } else {
      alert(message);
    }
  }
}

/**
 * Show a success message
 * @param {string} message - Success message
 */
function showSuccess(message) {
  try {
    import('./components/toast.js').then(toast => {
      toast.showToast(message, 'success');
    }).catch(() => {
      // Fallback to window.showToast or alert
      if (window.showToast) {
        window.showToast(message, 'success');
      } else {
        alert(message);
      }
    });
  } catch (e) {
    // If import fails, use fallback
    if (window.showToast) {
      window.showToast(message, 'success');
    } else {
      alert(message);
    }
  }
}

/**
 * Get the category color with optional opacity
 * @param {string} color - Color name
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} CSS color value
 */
function getCategoryColor(color, opacity = 1) {
  const colorMap = {
    slate: opacity < 1 ? `rgba(100, 116, 139, ${opacity})` : '#64748B',
    red: opacity < 1 ? `rgba(239, 68, 68, ${opacity})` : '#EF4444',
    blue: opacity < 1 ? `rgba(59, 130, 246, ${opacity})` : '#3B82F6',
    amber: opacity < 1 ? `rgba(245, 158, 11, ${opacity})` : '#F59E0B',
    emerald: opacity < 1 ? `rgba(16, 185, 129, ${opacity})` : '#10B981',
    purple: opacity < 1 ? `rgba(168, 85, 247, ${opacity})` : '#A855F7',
    pink: opacity < 1 ? `rgba(236, 72, 153, ${opacity})` : '#EC4899',
    indigo: opacity < 1 ? `rgba(99, 102, 241, ${opacity})` : '#6366F1',
    rose: opacity < 1 ? `rgba(244, 63, 94, ${opacity})` : '#F43F5E',
    green: opacity < 1 ? `rgba(34, 197, 94, ${opacity})` : '#22C55E',
    gray: opacity < 1 ? `rgba(107, 114, 128, ${opacity})` : '#6B7280',
    teal: opacity < 1 ? `rgba(20, 184, 166, ${opacity})` : '#14B8A6',
    violet: opacity < 1 ? `rgba(139, 92, 246, ${opacity})` : '#8B5CF6',
    cyan: opacity < 1 ? `rgba(6, 182, 212, ${opacity})` : '#06B6D4',
    lime: opacity < 1 ? `rgba(132, 204, 22, ${opacity})` : '#84CC16',
    orange: opacity < 1 ? `rgba(249, 115, 22, ${opacity})` : '#F97316',
    sky: opacity < 1 ? `rgba(14, 165, 233, ${opacity})` : '#0EA5E9'
  };
  
  return colorMap[color] || (opacity < 1 ? `rgba(107, 114, 128, ${opacity})` : '#6B7280');
}

/**
 * Get the category icon SVG
 * @param {string} icon - Icon name
 * @param {string} color - Icon color
 * @param {number} size - Icon size
 * @returns {string} SVG markup
 */
function getCategoryIcon(icon, color, size = 18) {
  const iconMap = {
    home: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    utensils: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12l5-5 5 5"></path><path d="M12 7v10"></path></svg>`,
    car: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="8.5" cy="12" r="2.5"></circle><circle cx="15.5" cy="12" r="2.5"></circle></svg>`,
    plug: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 18v-6"></path><path d="M8 12h8"></path></svg>`,
    stethoscope: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="4"></circle><path d="M16 10v2a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4v-2"></path><line x1="12" y1="14" x2="12" y2="20"></line></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    film: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>`,
    graduationCap: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
    creditCard: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
    piggyBank: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10h.01"></path><path d="M8 18h.01"></path><path d="M16 18h.01"></path><path d="M21 14l1 6h-2a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3H2l1-6h1v-2a7 7 0 0 1 14 0v2h4z"></path></svg>`,
    moreHorizontal: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>`,
    pieChart: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`
  };
  
  return iconMap[icon] || iconMap.moreHorizontal;
}

export { initializeGuardrailsPage };