/**
 * Guardrails Feature Implementation for Stackr Finance GREEN Edition
 * This module handles spending limits and budget guardrails
 */

// Default spending categories and their configurations
const spendingCategories = [
  { id: 'housing', name: 'Housing', color: '#4299e1' },
  { id: 'food', name: 'Food & Dining', color: '#48bb78' },
  { id: 'transportation', name: 'Transportation', color: '#ecc94b' },
  { id: 'utilities', name: 'Utilities', color: '#9f7aea' },
  { id: 'entertainment', name: 'Entertainment', color: '#ed64a6' },
  { id: 'shopping', name: 'Shopping', color: '#667eea' },
  { id: 'health', name: 'Health & Medical', color: '#f56565' },
  { id: 'personal', name: 'Personal', color: '#38b2ac' },
  { id: 'education', name: 'Education', color: '#ed8936' },
  { id: 'other', name: 'Other', color: '#a0aec0' }
];

// Periods for spending limits
const limitPeriods = [
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' }
];

// Sample data for initial spending limits (will be stored in localStorage)
const defaultLimits = [
  {
    id: 'limit-1',
    category: 'food',
    amount: 300,
    period: 'monthly',
    notifyAtPercent: 75,
    enabled: true
  },
  {
    id: 'limit-2',
    category: 'entertainment',
    amount: 100,
    period: 'monthly',
    notifyAtPercent: 90,
    enabled: true
  }
];

// Store for spending limits
class GuardrailsStore {
  constructor() {
    this.initialized = false;
    this.limits = [];
    this.userId = null;
  }

  // Initialize store with user data
  init(userId) {
    if (this.initialized && this.userId === userId) return;
    
    this.userId = userId;
    this.loadFromStorage();
    this.initialized = true;
  }

  // Load data from localStorage
  loadFromStorage() {
    try {
      const storedLimits = localStorage.getItem(`stackr-guardrails-${this.userId}`);
      this.limits = storedLimits ? JSON.parse(storedLimits) : [...defaultLimits];
    } catch (error) {
      console.error('Error loading guardrails data:', error);
      this.limits = [...defaultLimits];
    }
  }

  // Save data to localStorage
  saveToStorage() {
    try {
      localStorage.setItem(`stackr-guardrails-${this.userId}`, JSON.stringify(this.limits));
    } catch (error) {
      console.error('Error saving guardrails data:', error);
    }
  }

  // Get all spending limits
  getLimits() {
    return [...this.limits];
  }

  // Add a new spending limit
  addLimit(limit) {
    const newLimit = {
      ...limit,
      id: `limit-${Date.now()}`
    };
    this.limits.push(newLimit);
    this.saveToStorage();
    return newLimit;
  }

  // Update an existing spending limit
  updateLimit(id, updates) {
    const index = this.limits.findIndex(limit => limit.id === id);
    if (index !== -1) {
      this.limits[index] = { ...this.limits[index], ...updates };
      this.saveToStorage();
      return this.limits[index];
    }
    return null;
  }

  // Delete a spending limit
  deleteLimit(id) {
    const index = this.limits.findIndex(limit => limit.id === id);
    if (index !== -1) {
      const deleted = this.limits.splice(index, 1)[0];
      this.saveToStorage();
      return deleted;
    }
    return null;
  }

  // Toggle a spending limit (enable/disable)
  toggleLimit(id) {
    const limit = this.limits.find(limit => limit.id === id);
    if (limit) {
      limit.enabled = !limit.enabled;
      this.saveToStorage();
      return limit;
    }
    return null;
  }
}

// Create a global store instance
const guardrailsStore = new GuardrailsStore();

/**
 * Initialize the Guardrails page
 * @param {string} userId - Current user ID
 * @returns {HTMLElement} - The guardrails page element
 */
function initGuardrailsPage(userId) {
  guardrailsStore.init(userId);
  
  // Create main container
  const container = document.createElement('div');
  container.className = 'guardrails-container';
  container.style.maxWidth = '1000px';
  container.style.margin = '0 auto';
  container.style.padding = '24px';
  
  // Add page header
  const header = document.createElement('div');
  header.style.marginBottom = '24px';
  header.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <div style="margin-right: 12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <h1 style="font-size: 24px; font-weight: bold; margin: 0;">Stackr Guardrails</h1>
    </div>
    <p style="color: #666; margin-top: 8px;">
      Set weekly or monthly spending limits by category and get alerted before you overspend.
    </p>
  `;
  container.appendChild(header);
  
  // Render current spending limits
  container.appendChild(renderCurrentLimits());
  
  // Render form to add new limits
  container.appendChild(renderAddLimitForm());
  
  // Render info section
  container.appendChild(renderInfoSection());
  
  return container;
}

/**
 * Render the section showing current spending limits
 * @returns {HTMLElement} - Element containing current limits
 */
function renderCurrentLimits() {
  const limits = guardrailsStore.getLimits();
  
  const section = document.createElement('div');
  section.className = 'current-limits';
  section.style.marginBottom = '24px';
  
  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = 'Your Spending Limits';
  sectionTitle.style.fontSize = '18px';
  sectionTitle.style.fontWeight = 'bold';
  sectionTitle.style.marginBottom = '16px';
  section.appendChild(sectionTitle);
  
  if (limits.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.style.padding = '20px';
    emptyState.style.backgroundColor = '#f8f9fa';
    emptyState.style.borderRadius = '8px';
    emptyState.style.border = '1px solid #e2e8f0';
    emptyState.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3 style="margin: 0 0 0 8px; font-weight: bold;">No spending limits set</h3>
      </div>
      <p style="margin: 0;">You haven't set any spending limits yet. Create your first one below.</p>
    `;
    section.appendChild(emptyState);
  } else {
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    
    // Check if we're on a foldable device
    const isFoldableDevice = window.innerWidth < 400;
    
    // Enhanced responsive grid for different screen sizes:
    // - For foldable devices (closed): Single column layout with narrower cards
    // - For mobile: Single column but wider 
    // - For tablets and larger: Multi-column layout
    if (isFoldableDevice) {
      console.log("Using special grid layout for foldable device");
      grid.style.gridTemplateColumns = '1fr'; // Single column for foldable devices
      grid.style.gap = '12px'; // Smaller gap for foldable devices
    } else if (window.innerWidth < 640) {
      console.log("Using mobile grid layout");
      grid.style.gridTemplateColumns = '1fr'; // Single column for mobile
      grid.style.gap = '16px';
    } else {
      console.log("Using standard grid layout");
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
      grid.style.gap = '16px';
    }
    
    limits.forEach(limit => {
      const card = createLimitCard(limit);
      grid.appendChild(card);
    });
    
    section.appendChild(grid);
  }
  
  return section;
}

/**
 * Create a card for an individual spending limit
 * @param {Object} limit - The spending limit data
 * @returns {HTMLElement} - Card element for the limit
 */
function createLimitCard(limit) {
  const category = spendingCategories.find(c => c.id === limit.category) || { name: 'Category', color: '#718096' };
  
  const card = document.createElement('div');
  card.className = 'limit-card';
  card.style.borderRadius = '8px';
  card.style.border = '1px solid #e2e8f0';
  card.style.borderLeft = `4px solid ${category.color}`;
  card.style.padding = '16px';
  card.style.backgroundColor = limit.enabled ? 'white' : '#f8f9fa';
  card.style.opacity = limit.enabled ? '1' : '0.7';
  card.style.transition = 'all 0.2s ease';
  
  // Card header with category name and toggle
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '12px';
  
  const title = document.createElement('div');
  title.style.display = 'flex';
  title.style.alignItems = 'center';
  
  // Category icon
  const icon = document.createElement('div');
  icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${category.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  `;
  icon.style.marginRight = '8px';
  title.appendChild(icon);
  
  // Category name
  const name = document.createElement('h3');
  name.textContent = category.name;
  name.style.margin = '0';
  name.style.fontWeight = 'bold';
  name.style.fontSize = '16px';
  title.appendChild(name);
  
  header.appendChild(title);
  
  // Toggle switch
  const toggleLabel = document.createElement('label');
  toggleLabel.className = 'toggle-switch';
  toggleLabel.style.position = 'relative';
  toggleLabel.style.display = 'inline-block';
  toggleLabel.style.width = '40px';
  toggleLabel.style.height = '20px';
  
  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.checked = limit.enabled;
  toggleInput.style.opacity = '0';
  toggleInput.style.width = '0';
  toggleInput.style.height = '0';
  toggleInput.addEventListener('change', () => {
    guardrailsStore.toggleLimit(limit.id);
    // Re-render the page
    const container = document.querySelector('.guardrails-container');
    if (container) {
      const parent = container.parentNode;
      parent.replaceChild(initGuardrailsPage(guardrailsStore.userId), container);
    }
  });
  
  const toggleSlider = document.createElement('span');
  toggleSlider.className = 'slider';
  toggleSlider.style.position = 'absolute';
  toggleSlider.style.cursor = 'pointer';
  toggleSlider.style.top = '0';
  toggleSlider.style.left = '0';
  toggleSlider.style.right = '0';
  toggleSlider.style.bottom = '0';
  toggleSlider.style.backgroundColor = limit.enabled ? category.color : '#ccc';
  toggleSlider.style.transition = '.4s';
  toggleSlider.style.borderRadius = '34px';
  
  // Add slider circle
  const sliderCircle = document.createElement('span');
  sliderCircle.style.position = 'absolute';
  sliderCircle.style.content = '""';
  sliderCircle.style.height = '16px';
  sliderCircle.style.width = '16px';
  sliderCircle.style.left = limit.enabled ? '22px' : '2px';
  sliderCircle.style.bottom = '2px';
  sliderCircle.style.backgroundColor = 'white';
  sliderCircle.style.transition = '.4s';
  sliderCircle.style.borderRadius = '50%';
  toggleSlider.appendChild(sliderCircle);
  
  toggleLabel.appendChild(toggleInput);
  toggleLabel.appendChild(toggleSlider);
  header.appendChild(toggleLabel);
  
  card.appendChild(header);
  
  // Card description (Period)
  const description = document.createElement('p');
  description.textContent = limit.period === 'weekly' ? 'Weekly spending limit' : 'Monthly spending limit';
  description.style.margin = '0 0 16px 0';
  description.style.color = '#666';
  description.style.fontSize = '14px';
  card.appendChild(description);
  
  // Card content
  const content = document.createElement('div');
  content.style.marginBottom = '16px';
  
  // Amount row
  const amountRow = document.createElement('div');
  amountRow.style.display = 'flex';
  amountRow.style.justifyContent = 'space-between';
  amountRow.style.alignItems = 'center';
  amountRow.style.marginBottom = '8px';
  
  const amountLabel = document.createElement('span');
  amountLabel.textContent = 'Limit Amount';
  amountLabel.style.color = '#666';
  amountLabel.style.fontSize = '14px';
  amountRow.appendChild(amountLabel);
  
  const amount = document.createElement('span');
  amount.textContent = `$${limit.amount}`;
  amount.style.fontSize = '18px';
  amount.style.fontWeight = 'bold';
  amountRow.appendChild(amount);
  
  content.appendChild(amountRow);
  
  // Alert threshold row
  const thresholdRow = document.createElement('div');
  thresholdRow.style.display = 'flex';
  thresholdRow.style.justifyContent = 'space-between';
  thresholdRow.style.alignItems = 'center';
  
  const thresholdLabel = document.createElement('span');
  thresholdLabel.textContent = 'Alert Threshold';
  thresholdLabel.style.color = '#666';
  thresholdLabel.style.fontSize = '14px';
  thresholdRow.appendChild(thresholdLabel);
  
  const threshold = document.createElement('div');
  threshold.style.display = 'flex';
  threshold.style.alignItems = 'center';
  
  // Alert icon
  threshold.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ed8936" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  `;
  
  const thresholdValue = document.createElement('span');
  thresholdValue.textContent = `${limit.notifyAtPercent}%`;
  threshold.appendChild(thresholdValue);
  thresholdRow.appendChild(threshold);
  
  content.appendChild(thresholdRow);
  card.appendChild(content);
  
  // Card footer with delete button
  const footer = document.createElement('div');
  footer.style.textAlign = 'right';
  
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-limit-btn';
  deleteButton.style.backgroundColor = 'transparent';
  deleteButton.style.border = '1px solid #e53e3e';
  deleteButton.style.color = '#e53e3e';
  deleteButton.style.padding = '6px 12px';
  deleteButton.style.borderRadius = '4px';
  deleteButton.style.cursor = 'pointer';
  deleteButton.style.fontSize = '12px';
  deleteButton.style.display = 'inline-flex';
  deleteButton.style.alignItems = 'center';
  deleteButton.style.transition = 'all 0.2s ease';
  
  deleteButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
    Remove
  `;
  
  deleteButton.addEventListener('mouseenter', () => {
    deleteButton.style.backgroundColor = '#e53e3e';
    deleteButton.style.color = 'white';
  });
  
  deleteButton.addEventListener('mouseleave', () => {
    deleteButton.style.backgroundColor = 'transparent';
    deleteButton.style.color = '#e53e3e';
  });
  
  deleteButton.addEventListener('click', () => {
    if (confirm(`Are you sure you want to delete the ${category.name} spending limit?`)) {
      guardrailsStore.deleteLimit(limit.id);
      // Re-render the page
      const container = document.querySelector('.guardrails-container');
      if (container) {
        const parent = container.parentNode;
        parent.replaceChild(initGuardrailsPage(guardrailsStore.userId), container);
      }
    }
  });
  
  footer.appendChild(deleteButton);
  card.appendChild(footer);
  
  return card;
}

/**
 * Render the form to add a new spending limit
 * @returns {HTMLElement} - Form element to add limits
 */
function renderAddLimitForm() {
  const formCard = document.createElement('div');
  formCard.className = 'add-limit-form';
  formCard.style.border = '1px solid #e2e8f0';
  formCard.style.borderRadius = '8px';
  formCard.style.padding = '24px';
  formCard.style.marginBottom = '24px';
  
  // Form header
  const header = document.createElement('div');
  header.style.marginBottom = '16px';
  
  const title = document.createElement('h2');
  title.textContent = 'Create New Spending Limit';
  title.style.margin = '0 0 8px 0';
  title.style.fontSize = '18px';
  title.style.fontWeight = 'bold';
  header.appendChild(title);
  
  const description = document.createElement('p');
  description.textContent = 'Set up a new category-based spending limit to help track and control your expenses.';
  description.style.margin = '0';
  description.style.color = '#666';
  header.appendChild(description);
  
  formCard.appendChild(header);
  
  // Form content
  const form = document.createElement('form');
  form.id = 'new-limit-form';
  form.style.display = 'grid';
  form.style.gap = '16px';
  
  // Row 1: Category and Period selects
  const row1 = document.createElement('div');
  row1.style.display = 'grid';
  row1.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
  row1.style.gap = '16px';
  
  // Category select
  const categoryGroup = document.createElement('div');
  
  const categoryLabel = document.createElement('label');
  categoryLabel.htmlFor = 'limit-category';
  categoryLabel.textContent = 'Expense Category';
  categoryLabel.style.display = 'block';
  categoryLabel.style.marginBottom = '8px';
  categoryLabel.style.fontWeight = '500';
  categoryGroup.appendChild(categoryLabel);
  
  const categorySelect = document.createElement('select');
  categorySelect.id = 'limit-category';
  categorySelect.name = 'category';
  categorySelect.style.width = '100%';
  categorySelect.style.padding = '8px';
  categorySelect.style.borderRadius = '4px';
  categorySelect.style.border = '1px solid #cbd5e0';
  
  spendingCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
  
  categoryGroup.appendChild(categorySelect);
  row1.appendChild(categoryGroup);
  
  // Period select
  const periodGroup = document.createElement('div');
  
  const periodLabel = document.createElement('label');
  periodLabel.htmlFor = 'limit-period';
  periodLabel.textContent = 'Time Period';
  periodLabel.style.display = 'block';
  periodLabel.style.marginBottom = '8px';
  periodLabel.style.fontWeight = '500';
  periodGroup.appendChild(periodLabel);
  
  const periodSelect = document.createElement('select');
  periodSelect.id = 'limit-period';
  periodSelect.name = 'period';
  periodSelect.style.width = '100%';
  periodSelect.style.padding = '8px';
  periodSelect.style.borderRadius = '4px';
  periodSelect.style.border = '1px solid #cbd5e0';
  
  limitPeriods.forEach(period => {
    const option = document.createElement('option');
    option.value = period.id;
    option.textContent = period.name;
    periodSelect.appendChild(option);
  });
  
  periodGroup.appendChild(periodSelect);
  row1.appendChild(periodGroup);
  
  form.appendChild(row1);
  
  // Amount input
  const amountGroup = document.createElement('div');
  
  const amountLabel = document.createElement('label');
  amountLabel.htmlFor = 'limit-amount';
  amountLabel.textContent = 'Spending Limit Amount ($)';
  amountLabel.style.display = 'block';
  amountLabel.style.marginBottom = '8px';
  amountLabel.style.fontWeight = '500';
  amountGroup.appendChild(amountLabel);
  
  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.id = 'limit-amount';
  amountInput.name = 'amount';
  amountInput.min = '1';
  amountInput.step = '1';
  amountInput.value = '200';
  amountInput.style.width = '100%';
  amountInput.style.padding = '8px';
  amountInput.style.borderRadius = '4px';
  amountInput.style.border = '1px solid #cbd5e0';
  amountGroup.appendChild(amountInput);
  
  form.appendChild(amountGroup);
  
  // Alert threshold group
  const thresholdGroup = document.createElement('div');
  
  const thresholdLabelContainer = document.createElement('div');
  thresholdLabelContainer.style.display = 'flex';
  thresholdLabelContainer.style.justifyContent = 'space-between';
  thresholdLabelContainer.style.alignItems = 'center';
  thresholdLabelContainer.style.marginBottom = '8px';
  
  const thresholdLabel = document.createElement('label');
  thresholdLabel.htmlFor = 'limit-threshold';
  thresholdLabel.textContent = 'Alert Threshold (80%)';
  thresholdLabel.style.fontWeight = '500';
  thresholdLabelContainer.appendChild(thresholdLabel);
  
  const thresholdValue = document.createElement('span');
  thresholdValue.id = 'threshold-display';
  thresholdValue.textContent = 'Alert at $160';
  thresholdValue.style.fontSize = '14px';
  thresholdValue.style.color = '#666';
  thresholdLabelContainer.appendChild(thresholdValue);
  
  thresholdGroup.appendChild(thresholdLabelContainer);
  
  // Slider container
  const sliderContainer = document.createElement('div');
  sliderContainer.style.position = 'relative';
  sliderContainer.style.height = '30px';
  
  // Slider track
  const sliderTrack = document.createElement('div');
  sliderTrack.style.position = 'absolute';
  sliderTrack.style.width = '100%';
  sliderTrack.style.height = '6px';
  sliderTrack.style.borderRadius = '3px';
  sliderTrack.style.backgroundColor = '#e2e8f0';
  sliderTrack.style.top = '50%';
  sliderTrack.style.transform = 'translateY(-50%)';
  sliderContainer.appendChild(sliderTrack);
  
  // Slider fill
  const sliderFill = document.createElement('div');
  sliderFill.id = 'threshold-fill';
  sliderFill.style.position = 'absolute';
  sliderFill.style.width = '80%';
  sliderFill.style.height = '6px';
  sliderFill.style.borderRadius = '3px';
  sliderFill.style.backgroundColor = '#4299e1';
  sliderFill.style.top = '50%';
  sliderFill.style.transform = 'translateY(-50%)';
  sliderContainer.appendChild(sliderFill);
  
  // Slider input
  const sliderInput = document.createElement('input');
  sliderInput.id = 'limit-threshold';
  sliderInput.name = 'notifyAtPercent';
  sliderInput.type = 'range';
  sliderInput.min = '10';
  sliderInput.max = '100';
  sliderInput.step = '5';
  sliderInput.value = '80';
  sliderInput.style.position = 'absolute';
  sliderInput.style.width = '100%';
  sliderInput.style.top = '50%';
  sliderInput.style.transform = 'translateY(-50%)';
  sliderInput.style.appearance = 'none';
  sliderInput.style.background = 'transparent';
  sliderInput.style.cursor = 'pointer';
  sliderInput.style.zIndex = '2';
  
  // Update the threshold display and fill when the slider is moved
  sliderInput.addEventListener('input', () => {
    const percent = sliderInput.value;
    const amount = amountInput.value;
    const alertAmount = (amount * percent / 100).toFixed(2);
    
    thresholdLabel.textContent = `Alert Threshold (${percent}%)`;
    thresholdValue.textContent = `Alert at $${alertAmount}`;
    sliderFill.style.width = `${percent}%`;
  });
  
  // Update the threshold when the amount changes
  amountInput.addEventListener('input', () => {
    const percent = sliderInput.value;
    const amount = amountInput.value;
    const alertAmount = (amount * percent / 100).toFixed(2);
    
    thresholdValue.textContent = `Alert at $${alertAmount}`;
  });
  
  sliderContainer.appendChild(sliderInput);
  thresholdGroup.appendChild(sliderContainer);
  
  // Slider info
  const sliderInfo = document.createElement('p');
  sliderInfo.textContent = "You'll receive notifications when your spending reaches this percentage of your limit.";
  sliderInfo.style.margin = '8px 0 0 0';
  sliderInfo.style.fontSize = '14px';
  sliderInfo.style.color = '#666';
  thresholdGroup.appendChild(sliderInfo);
  
  form.appendChild(thresholdGroup);
  
  // Form actions
  const actions = document.createElement('div');
  actions.style.textAlign = 'right';
  actions.style.marginTop = '16px';
  
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Add Spending Limit';
  submitButton.style.backgroundColor = '#4299e1';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '4px';
  submitButton.style.padding = '10px 16px';
  submitButton.style.fontWeight = '500';
  submitButton.style.cursor = 'pointer';
  submitButton.style.transition = 'background-color 0.2s';
  
  submitButton.addEventListener('mouseenter', () => {
    submitButton.style.backgroundColor = '#3182ce';
  });
  
  submitButton.addEventListener('mouseleave', () => {
    submitButton.style.backgroundColor = '#4299e1';
  });
  
  actions.appendChild(submitButton);
  form.appendChild(actions);
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const newLimit = {
      category: formData.get('category'),
      period: formData.get('period'),
      amount: parseInt(formData.get('amount'), 10),
      notifyAtPercent: parseInt(formData.get('notifyAtPercent'), 10),
      enabled: true
    };
    
    guardrailsStore.addLimit(newLimit);
    
    // Show toast message
    showToast('New spending limit added successfully!');
    
    // Reset form
    form.reset();
    
    // Set default values
    categorySelect.value = 'food';
    periodSelect.value = 'monthly';
    amountInput.value = '200';
    sliderInput.value = '80';
    thresholdLabel.textContent = 'Alert Threshold (80%)';
    thresholdValue.textContent = 'Alert at $160';
    sliderFill.style.width = '80%';
    
    // Re-render the page
    const container = document.querySelector('.guardrails-container');
    if (container) {
      const parent = container.parentNode;
      parent.replaceChild(initGuardrailsPage(guardrailsStore.userId), container);
    }
  });
  
  formCard.appendChild(form);
  return formCard;
}

/**
 * Render info section about Guardrails feature
 * @returns {HTMLElement} - Info section element
 */
function renderInfoSection() {
  const section = document.createElement('div');
  section.style.backgroundColor = '#f8f9fa';
  section.style.borderRadius = '8px';
  section.style.border = '1px solid #e2e8f0';
  section.style.padding = '20px';
  
  // Info header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.marginBottom = '12px';
  
  const icon = document.createElement('div');
  icon.style.marginRight = '12px';
  icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4299e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `;
  header.appendChild(icon);
  
  const title = document.createElement('h3');
  title.textContent = 'About Stackr Guardrails';
  title.style.margin = '0';
  title.style.fontWeight = 'bold';
  title.style.fontSize = '16px';
  header.appendChild(title);
  
  section.appendChild(header);
  
  // Info content
  const content = document.createElement('div');
  
  const paragraph1 = document.createElement('p');
  paragraph1.textContent = 'Guardrails help you stay on track with your financial goals by preventing overspending in specific categories.';
  paragraph1.style.margin = '0 0 8px 0';
  content.appendChild(paragraph1);
  
  const paragraph2 = document.createElement('p');
  paragraph2.textContent = 'When you approach or exceed your set limits, Stackr will notify you to help keep your spending in check.';
  paragraph2.style.margin = '0';
  content.appendChild(paragraph2);
  
  section.appendChild(content);
  
  return section;
}

/**
 * Show a toast notification
 * @param {string} message - Message to display in the toast
 */
function showToast(message) {
  // Check if toast container exists
  let toastContainer = document.getElementById('toast-container');
  
  if (!toastContainer) {
    // Create toast container
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.backgroundColor = '#4299e1';
  toast.style.color = 'white';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '4px';
  toast.style.marginTop = '8px';
  toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.minWidth = '280px';
  toast.style.maxWidth = '400px';
  toast.style.animation = 'slideIn 0.3s, fadeOut 0.3s 2.7s';
  
  // Toast icon
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px;">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <path d="M9 12l2 2 4-4"></path>
    </svg>
    <span>${message}</span>
  `;
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
  
  // Add styles for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// Export the necessary functions
export { initGuardrailsPage };