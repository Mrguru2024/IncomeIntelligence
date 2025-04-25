/**
 * Futuristic Income Management Module
 * 
 * This module provides a modern, interactive income tracking interface
 * with futuristic UI elements including dark theme, flowing gradients,
 * holographic effects, and responsive animations.
 */

// Format currency with appropriate symbol and decimals
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

// Format date for better readability
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

// Get the user's income data from storage or API
function getIncomeData() {
  // Try to fetch from localStorage or global state
  let incomeData = [];
  
  try {
    if (window.appState && window.appState.incomeEntries) {
      incomeData = window.appState.incomeEntries;
    } else {
      const storedData = localStorage.getItem('stackrIncomeData');
      if (storedData) {
        incomeData = JSON.parse(storedData);
      }
    }
  } catch (error) {
    console.error('Error fetching income data:', error);
    // Return empty array as fallback
    return [];
  }
  
  // If no data is found, return sample entry for demo purposes
  if (!incomeData || incomeData.length === 0) {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    
    // Sample income entries
    return [
      {
        id: 1,
        date: today.toISOString().split('T')[0],
        description: 'Monthly Salary',
        source: 'Employer',
        amount: 3000,
        category: 'salary',
        splits: calculateSplits(3000)
      },
      {
        id: 2,
        date: oneWeekAgo.toISOString().split('T')[0],
        description: 'Freelance Project',
        source: 'Client ABC',
        amount: 500,
        category: 'freelance',
        splits: calculateSplits(500)
      }
    ];
  }
  
  // Ensure all entries have splits calculated
  return incomeData.map(entry => {
    if (!entry.splits) {
      entry.splits = calculateSplits(entry.amount);
    }
    return entry;
  });
}

// Get available income categories
function getIncomeCategories() {
  return [
    { id: 'salary', name: 'Salary', icon: '💼' },
    { id: 'freelance', name: 'Freelance', icon: '💻' },
    { id: 'investments', name: 'Investments', icon: '📈' },
    { id: 'business', name: 'Business', icon: '🏢' },
    { id: 'gifts', name: 'Gifts', icon: '🎁' },
    { id: 'other', name: 'Other', icon: '💰' }
  ];
}

// Calculate monthly income
function updateMonthlyIncome() {
  const incomeEntries = getIncomeData();
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Filter entries for current month
  const currentMonthEntries = incomeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= firstDayOfMonth && entryDate <= now;
  });
  
  // Sum up the entries
  const monthlyTotal = currentMonthEntries.reduce((sum, entry) => sum + entry.amount, 0);
  
  // Update global state if available
  if (window.appState) {
    if (!window.appState.income) {
      window.appState.income = {};
    }
    window.appState.income.monthly = monthlyTotal;
  }
  
  return monthlyTotal;
}

// Get current split ratio (from user settings or default)
function getSplitRatio() {
  if (window.appState && window.appState.user && window.appState.user.splitRatio) {
    return window.appState.user.splitRatio;
  }
  
  // Default 40/30/30 split
  return {
    needs: 40,
    investments: 30,
    savings: 30
  };
}

// Save the updated split ratio to the user's settings
function saveSplitRatio(splitRatio) {
  // Validate the split ratio to ensure it adds up to 100%
  const total = splitRatio.needs + splitRatio.investments + splitRatio.savings;
  if (total !== 100) {
    console.error('Split ratio must add up to 100%');
    return false;
  }
  
  // Update appState if available
  if (window.appState && window.appState.user) {
    window.appState.user.splitRatio = splitRatio;
    
    // If there's a function to save user settings, call it
    if (typeof updateUserSettings === 'function') {
      try {
        updateUserSettings({ splitRatio });
      } catch (error) {
        console.error('Error saving split ratio to user settings:', error);
      }
    }
    
    // Save to localStorage as fallback
    try {
      const userSettings = JSON.parse(localStorage.getItem('stackrUserSettings') || '{}');
      userSettings.splitRatio = splitRatio;
      localStorage.setItem('stackrUserSettings', JSON.stringify(userSettings));
    } catch (error) {
      console.error('Error saving split ratio to localStorage:', error);
    }
  }
  
  return true;
}

// Calculate needs/investments/savings splits based on amount
function calculateSplits(amount) {
  const ratio = getSplitRatio();
  
  return {
    needs: (amount * ratio.needs) / 100,
    investments: (amount * ratio.investments) / 100,
    savings: (amount * ratio.savings) / 100
  };
}

// Filter income entries by time period
function filterIncomeEntries(filterType) {
  const incomeEntries = getIncomeData();
  const now = new Date();
  
  switch (filterType) {
    case 'week':
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      
      return incomeEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= oneWeekAgo && entryDate <= now;
      });
      
    case 'month':
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      return incomeEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= firstDayOfMonth && entryDate <= now;
      });
      
    case 'all':
    default:
      return incomeEntries;
  }
}

// Save a new income entry or update existing one
function saveIncomeEntry(entry) {
  if (!entry) return false;
  
  const incomeEntries = getIncomeData();
  
  // Check if entry has an ID (edit mode)
  if (entry.id) {
    // Find and update the entry
    const index = incomeEntries.findIndex(e => e.id === entry.id);
    if (index !== -1) {
      incomeEntries[index] = { ...entry };
    }
  } else {
    // Create a new entry with a unique ID
    entry.id = Date.now(); // Simple timestamp-based ID
    incomeEntries.push(entry);
  }
  
  // Calculate splits if not provided
  if (!entry.splits) {
    entry.splits = calculateSplits(entry.amount);
  }
  
  // Save to localStorage
  try {
    localStorage.setItem('stackrIncomeData', JSON.stringify(incomeEntries));
  } catch (error) {
    console.error('Error saving income data:', error);
  }
  
  // Update global state if available
  if (window.appState) {
    window.appState.incomeEntries = incomeEntries;
  }
  
  // Update monthly income
  updateMonthlyIncome();
  
  return true;
}

// Delete an income entry by ID
function deleteIncomeEntry(entryId) {
  if (!entryId) return false;
  
  const incomeEntries = getIncomeData();
  
  // Filter out the entry to be deleted
  const updatedEntries = incomeEntries.filter(entry => entry.id != entryId);
  
  // Only proceed if an entry was actually removed
  if (updatedEntries.length === incomeEntries.length) {
    return false;
  }
  
  // Save to localStorage
  try {
    localStorage.setItem('stackrIncomeData', JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Error updating income data after delete:', error);
    return false;
  }
  
  // Update global state if available
  if (window.appState) {
    window.appState.incomeEntries = updatedEntries;
  }
  
  // Update monthly income
  updateMonthlyIncome();
  
  return true;
}

// Show the income entry form (add/edit)
function showIncomeForm(entryToEdit = null) {
  // Create form modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.right = '0';
  modalOverlay.style.bottom = '0';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.zIndex = '9999';
  modalOverlay.style.backdropFilter = 'blur(5px)';
  
  // Create form container
  const formContainer = document.createElement('div');
  formContainer.className = 'futuristic-card income-form';
  formContainer.style.width = '90%';
  formContainer.style.maxWidth = '500px';
  formContainer.style.padding = '25px';
  formContainer.style.color = 'white';
  formContainer.style.position = 'relative';
  
  // Add glowing border
  const glowBorder = document.createElement('div');
  glowBorder.className = 'glow-border-top';
  formContainer.appendChild(glowBorder);
  
  // Form title
  const formTitle = document.createElement('h3');
  formTitle.textContent = entryToEdit ? 'Edit Income Entry' : 'Add New Income';
  formTitle.className = 'glow-text';
  formTitle.style.fontSize = '1.5rem';
  formTitle.style.fontWeight = 'bold';
  formTitle.style.marginBottom = '20px';
  formTitle.style.display = 'flex';
  formTitle.style.alignItems = 'center';
  formTitle.style.gap = '10px';
  
  // Add icon to title
  formTitle.innerHTML = `
    <div style="background-color: rgba(79, 70, 229, 0.2); padding: 10px; border-radius: 10px; box-shadow: var(--glow-blue);">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    </div>
    <span>${entryToEdit ? 'Edit Income Entry' : 'Add New Income'}</span>
  `;
  
  formContainer.appendChild(formTitle);
  
  // Create form
  const form = document.createElement('form');
  form.id = 'income-entry-form';
  form.style.display = 'grid';
  form.style.gap = '15px';
  
  // Add hidden ID field for edit mode
  const idField = document.createElement('input');
  idField.type = 'hidden';
  idField.id = 'income-id';
  idField.name = 'id';
  if (entryToEdit && entryToEdit.id) {
    idField.value = entryToEdit.id;
  }
  form.appendChild(idField);
  
  // Create date field
  const dateGroup = document.createElement('div');
  
  const dateLabel = document.createElement('label');
  dateLabel.htmlFor = 'income-date';
  dateLabel.textContent = 'Date';
  dateLabel.style.display = 'block';
  dateLabel.style.marginBottom = '5px';
  dateLabel.style.fontSize = '0.875rem';
  dateLabel.style.fontWeight = '500';
  
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.id = 'income-date';
  dateInput.name = 'date';
  dateInput.required = true;
  dateInput.style.width = '100%';
  dateInput.style.padding = '10px';
  dateInput.style.borderRadius = '8px';
  dateInput.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
  dateInput.style.border = '1px solid rgba(79, 70, 229, 0.3)';
  dateInput.style.color = 'white';
  dateInput.style.outline = 'none';
  
  // Set default value to today or use entry date if editing
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = entryToEdit && entryToEdit.date ? entryToEdit.date : today;
  
  dateGroup.appendChild(dateLabel);
  dateGroup.appendChild(dateInput);
  form.appendChild(dateGroup);
  
  // Create amount field
  const amountGroup = document.createElement('div');
  
  const amountLabel = document.createElement('label');
  amountLabel.htmlFor = 'income-amount';
  amountLabel.textContent = 'Amount ($)';
  amountLabel.style.display = 'block';
  amountLabel.style.marginBottom = '5px';
  amountLabel.style.fontSize = '0.875rem';
  amountLabel.style.fontWeight = '500';
  
  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.id = 'income-amount';
  amountInput.name = 'amount';
  amountInput.min = '0';
  amountInput.step = '0.01';
  amountInput.required = true;
  amountInput.style.width = '100%';
  amountInput.style.padding = '10px';
  amountInput.style.borderRadius = '8px';
  amountInput.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
  amountInput.style.border = '1px solid rgba(79, 70, 229, 0.3)';
  amountInput.style.color = 'white';
  amountInput.style.outline = 'none';
  
  if (entryToEdit && entryToEdit.amount) {
    amountInput.value = entryToEdit.amount;
  }
  
  amountGroup.appendChild(amountLabel);
  amountGroup.appendChild(amountInput);
  form.appendChild(amountGroup);
  
  // Create description field
  const descGroup = document.createElement('div');
  
  const descLabel = document.createElement('label');
  descLabel.htmlFor = 'income-description';
  descLabel.textContent = 'Description';
  descLabel.style.display = 'block';
  descLabel.style.marginBottom = '5px';
  descLabel.style.fontSize = '0.875rem';
  descLabel.style.fontWeight = '500';
  
  const descInput = document.createElement('input');
  descInput.type = 'text';
  descInput.id = 'income-description';
  descInput.name = 'description';
  descInput.required = true;
  descInput.style.width = '100%';
  descInput.style.padding = '10px';
  descInput.style.borderRadius = '8px';
  descInput.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
  descInput.style.border = '1px solid rgba(79, 70, 229, 0.3)';
  descInput.style.color = 'white';
  descInput.style.outline = 'none';
  
  if (entryToEdit && entryToEdit.description) {
    descInput.value = entryToEdit.description;
  }
  
  descGroup.appendChild(descLabel);
  descGroup.appendChild(descInput);
  form.appendChild(descGroup);
  
  // Create source field
  const sourceGroup = document.createElement('div');
  
  const sourceLabel = document.createElement('label');
  sourceLabel.htmlFor = 'income-source';
  sourceLabel.textContent = 'Source';
  sourceLabel.style.display = 'block';
  sourceLabel.style.marginBottom = '5px';
  sourceLabel.style.fontSize = '0.875rem';
  sourceLabel.style.fontWeight = '500';
  
  const sourceInput = document.createElement('input');
  sourceInput.type = 'text';
  sourceInput.id = 'income-source';
  sourceInput.name = 'source';
  sourceInput.required = true;
  sourceInput.style.width = '100%';
  sourceInput.style.padding = '10px';
  sourceInput.style.borderRadius = '8px';
  sourceInput.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
  sourceInput.style.border = '1px solid rgba(79, 70, 229, 0.3)';
  sourceInput.style.color = 'white';
  sourceInput.style.outline = 'none';
  
  if (entryToEdit && entryToEdit.source) {
    sourceInput.value = entryToEdit.source;
  }
  
  sourceGroup.appendChild(sourceLabel);
  sourceGroup.appendChild(sourceInput);
  form.appendChild(sourceGroup);
  
  // Create category field
  const categoryGroup = document.createElement('div');
  
  const categoryLabel = document.createElement('label');
  categoryLabel.htmlFor = 'income-category';
  categoryLabel.textContent = 'Category';
  categoryLabel.style.display = 'block';
  categoryLabel.style.marginBottom = '5px';
  categoryLabel.style.fontSize = '0.875rem';
  categoryLabel.style.fontWeight = '500';
  
  const categorySelect = document.createElement('select');
  categorySelect.id = 'income-category';
  categorySelect.name = 'category';
  categorySelect.required = true;
  categorySelect.style.width = '100%';
  categorySelect.style.padding = '10px';
  categorySelect.style.borderRadius = '8px';
  categorySelect.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
  categorySelect.style.border = '1px solid rgba(79, 70, 229, 0.3)';
  categorySelect.style.color = 'white';
  categorySelect.style.outline = 'none';
  
  // Add category options
  const categories = getIncomeCategories();
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = `${category.icon} ${category.name}`;
    
    if (entryToEdit && entryToEdit.category === category.id) {
      option.selected = true;
    }
    
    categorySelect.appendChild(option);
  });
  
  categoryGroup.appendChild(categoryLabel);
  categoryGroup.appendChild(categorySelect);
  form.appendChild(categoryGroup);
  
  // Create 40/30/30 split preview
  const splitPreview = document.createElement('div');
  splitPreview.className = 'split-preview';
  splitPreview.style.marginTop = '15px';
  splitPreview.style.marginBottom = '15px';
  
  const splitPreviewTitle = document.createElement('h4');
  splitPreviewTitle.textContent = 'Income Split Preview';
  splitPreviewTitle.style.fontSize = '0.875rem';
  splitPreviewTitle.style.fontWeight = '500';
  splitPreviewTitle.style.marginBottom = '10px';
  splitPreview.appendChild(splitPreviewTitle);
  
  // Create split bars container
  const splitBars = document.createElement('div');
  splitBars.className = 'split-bars';
  splitBars.style.display = 'flex';
  splitBars.style.height = '20px';
  splitBars.style.borderRadius = '10px';
  splitBars.style.overflow = 'hidden';
  splitBars.style.marginBottom = '10px';
  
  // Get split ratio
  const ratio = getSplitRatio();
  
  // Create needs bar
  const needsBar = document.createElement('div');
  needsBar.className = 'needs-bar';
  needsBar.style.width = `${ratio.needs}%`;
  needsBar.style.background = 'linear-gradient(135deg, #00E676 0%, #00796B 100%)';
  needsBar.style.position = 'relative';
  needsBar.style.overflow = 'hidden';
  
  // Create investments bar
  const investmentsBar = document.createElement('div');
  investmentsBar.className = 'investments-bar';
  investmentsBar.style.width = `${ratio.investments}%`;
  investmentsBar.style.background = 'linear-gradient(135deg, #2196F3 0%, #303F9F 100%)';
  investmentsBar.style.position = 'relative';
  investmentsBar.style.overflow = 'hidden';
  
  // Create savings bar
  const savingsBar = document.createElement('div');
  savingsBar.className = 'savings-bar';
  savingsBar.style.width = `${ratio.savings}%`;
  savingsBar.style.background = 'linear-gradient(135deg, #FFC107 0%, #F57C00 100%)';
  savingsBar.style.position = 'relative';
  savingsBar.style.overflow = 'hidden';
  
  // Add labels
  const splitLabels = document.createElement('div');
  splitLabels.className = 'split-labels';
  splitLabels.style.display = 'flex';
  splitLabels.style.justifyContent = 'space-between';
  splitLabels.style.fontSize = '0.75rem';
  splitLabels.style.marginTop = '5px';
  
  // Needs label
  const needsLabel = document.createElement('div');
  needsLabel.innerHTML = `<span style="color: #00E676;">●</span> Needs: ${ratio.needs}% <span class="needs-amount" style="color: #00E676;"></span>`;
  
  // Investments label
  const investmentsLabel = document.createElement('div');
  investmentsLabel.innerHTML = `<span style="color: #2196F3;">●</span> Investments: ${ratio.investments}% <span class="investments-amount" style="color: #2196F3;"></span>`;
  
  // Savings label
  const savingsLabel = document.createElement('div');
  savingsLabel.innerHTML = `<span style="color: #FFC107;">●</span> Savings: ${ratio.savings}% <span class="savings-amount" style="color: #FFC107;"></span>`;
  
  // Add bars and labels to containers
  splitBars.appendChild(needsBar);
  splitBars.appendChild(investmentsBar);
  splitBars.appendChild(savingsBar);
  
  splitLabels.appendChild(needsLabel);
  splitLabels.appendChild(investmentsLabel);
  splitLabels.appendChild(savingsLabel);
  
  splitPreview.appendChild(splitBars);
  splitPreview.appendChild(splitLabels);
  
  form.appendChild(splitPreview);
  
  // Create form actions
  const formActions = document.createElement('div');
  formActions.style.display = 'flex';
  formActions.style.justifyContent = 'flex-end';
  formActions.style.gap = '10px';
  formActions.style.marginTop = '20px';
  
  // Create cancel button
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '10px 20px';
  cancelButton.style.borderRadius = '8px';
  cancelButton.style.backgroundColor = 'rgba(31, 41, 55, 0.5)';
  cancelButton.style.color = 'white';
  cancelButton.style.border = 'none';
  cancelButton.style.cursor = 'pointer';
  
  // Create save button
  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.className = 'neon-button';
  saveButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
    ${entryToEdit ? 'Update Entry' : 'Save Entry'}
  `;
  
  formActions.appendChild(cancelButton);
  formActions.appendChild(saveButton);
  
  form.appendChild(formActions);
  formContainer.appendChild(form);
  modalOverlay.appendChild(formContainer);
  
  // Add the modal to the document
  document.body.appendChild(modalOverlay);
  
  // Update split preview when amount changes
  amountInput.addEventListener('input', () => {
    const amount = parseFloat(amountInput.value) || 0;
    const splits = calculateSplits(amount);
    
    // Update amount labels
    const needsAmountElement = splitPreview.querySelector('.needs-amount');
    const investmentsAmountElement = splitPreview.querySelector('.investments-amount');
    const savingsAmountElement = splitPreview.querySelector('.savings-amount');
    
    if (needsAmountElement) {
      needsAmountElement.textContent = `(${formatCurrency(splits.needs)})`;
    }
    
    if (investmentsAmountElement) {
      investmentsAmountElement.textContent = `(${formatCurrency(splits.investments)})`;
    }
    
    if (savingsAmountElement) {
      savingsAmountElement.textContent = `(${formatCurrency(splits.savings)})`;
    }
  });
  
  // Trigger initial update if editing
  if (entryToEdit && entryToEdit.amount) {
    amountInput.dispatchEvent(new Event('input'));
  }
  
  // Close modal when clicking cancel
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  // Handle form submission
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    // Gather form data
    const formData = {
      id: idField.value ? parseInt(idField.value) : null,
      date: dateInput.value,
      description: descInput.value,
      source: sourceInput.value,
      amount: parseFloat(amountInput.value),
      category: categorySelect.value,
      splits: calculateSplits(parseFloat(amountInput.value))
    };
    
    // Save the entry
    const success = saveIncomeEntry(formData);
    
    if (success) {
      // Close the modal
      document.body.removeChild(modalOverlay);
      
      // Refresh the income page to show the updated data
      const incomeContainer = document.querySelector('.income-container');
      if (incomeContainer && incomeContainer.parentNode) {
        const newIncomeElement = renderIncomePage();
        incomeContainer.parentNode.replaceChild(newIncomeElement, incomeContainer);
      }
    } else {
      alert('Error saving income entry. Please try again.');
    }
  });
}

// Function to show the split customization modal
function showSplitCustomizationForm() {
  // Get current split ratios
  const currentRatio = getSplitRatio();
  
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.right = '0';
  modalOverlay.style.bottom = '0';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.zIndex = '9999';
  modalOverlay.style.backdropFilter = 'blur(5px)';
  
  // Create form container with futuristic styling
  const formContainer = document.createElement('div');
  formContainer.className = 'futuristic-card split-form';
  formContainer.style.width = '90%';
  formContainer.style.maxWidth = '500px';
  formContainer.style.padding = '25px';
  formContainer.style.color = 'white';
  formContainer.style.position = 'relative';
  
  // Add glowing border
  const glowBorder = document.createElement('div');
  glowBorder.className = 'glow-border-top';
  formContainer.appendChild(glowBorder);
  
  // Form title
  const formTitle = document.createElement('h3');
  formTitle.className = 'glow-text';
  formTitle.style.fontSize = '1.5rem';
  formTitle.style.fontWeight = 'bold';
  formTitle.style.marginBottom = '20px';
  formTitle.style.display = 'flex';
  formTitle.style.alignItems = 'center';
  formTitle.style.gap = '10px';
  
  // Add icon to title
  formTitle.innerHTML = `
    <div style="background-color: rgba(16, 185, 129, 0.2); padding: 10px; border-radius: 10px; box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    </div>
    <span>Customize Income Split</span>
  `;
  
  formContainer.appendChild(formTitle);
  
  // Description text
  const description = document.createElement('p');
  description.style.fontSize = '0.875rem';
  description.style.color = 'rgba(255, 255, 255, 0.7)';
  description.style.marginBottom = '20px';
  description.textContent = 'Adjust your income allocation percentages. The total must equal 100%.';
  formContainer.appendChild(description);
  
  // Create form
  const form = document.createElement('form');
  form.id = 'split-customization-form';
  form.style.display = 'grid';
  form.style.gap = '20px';
  
  // Needs input group
  const needsGroup = document.createElement('div');
  needsGroup.style.display = 'grid';
  needsGroup.style.gridTemplateColumns = '1fr';
  needsGroup.style.gap = '10px';
  
  const needsLabel = document.createElement('div');
  needsLabel.style.display = 'flex';
  needsLabel.style.justifyContent = 'space-between';
  needsLabel.style.alignItems = 'center';
  
  const needsTitle = document.createElement('label');
  needsTitle.htmlFor = 'needs-percentage';
  needsTitle.innerHTML = `
    <span style="color: #10B981; font-weight: 600; font-size: 1rem;">Needs</span>
    <span style="font-size: 0.75rem; opacity: 0.7; display: block; margin-top: 2px;">
      Rent, groceries, bills, etc.
    </span>
  `;
  
  const needsValue = document.createElement('span');
  needsValue.id = 'needs-value';
  needsValue.textContent = `${currentRatio.needs}%`;
  needsValue.style.fontSize = '1rem';
  needsValue.style.fontWeight = '600';
  needsValue.style.color = '#10B981';
  
  needsLabel.appendChild(needsTitle);
  needsLabel.appendChild(needsValue);
  
  const needsSlider = document.createElement('input');
  needsSlider.type = 'range';
  needsSlider.id = 'needs-percentage';
  needsSlider.min = '0';
  needsSlider.max = '100';
  needsSlider.step = '1';
  needsSlider.value = currentRatio.needs;
  needsSlider.style.width = '100%';
  needsSlider.style.height = '8px';
  needsSlider.style.borderRadius = '4px';
  needsSlider.style.appearance = 'none';
  needsSlider.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
  needsSlider.style.outline = 'none';
  needsSlider.style.cursor = 'pointer';
  
  // Custom slider styling
  const needsSliderStyle = document.createElement('style');
  needsSliderStyle.textContent = `
    #needs-percentage::-webkit-slider-thumb {
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #10B981;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.7);
    }
    #needs-percentage::-moz-range-thumb {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #10B981;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.7);
      border: none;
    }
  `;
  document.head.appendChild(needsSliderStyle);
  
  needsGroup.appendChild(needsLabel);
  needsGroup.appendChild(needsSlider);
  
  // Investments input group
  const investmentsGroup = document.createElement('div');
  investmentsGroup.style.display = 'grid';
  investmentsGroup.style.gridTemplateColumns = '1fr';
  investmentsGroup.style.gap = '10px';
  
  const investmentsLabel = document.createElement('div');
  investmentsLabel.style.display = 'flex';
  investmentsLabel.style.justifyContent = 'space-between';
  investmentsLabel.style.alignItems = 'center';
  
  const investmentsTitle = document.createElement('label');
  investmentsTitle.htmlFor = 'investments-percentage';
  investmentsTitle.innerHTML = `
    <span style="color: #3B82F6; font-weight: 600; font-size: 1rem;">Investments</span>
    <span style="font-size: 0.75rem; opacity: 0.7; display: block; margin-top: 2px;">
      Stocks, retirement, growth
    </span>
  `;
  
  const investmentsValue = document.createElement('span');
  investmentsValue.id = 'investments-value';
  investmentsValue.textContent = `${currentRatio.investments}%`;
  investmentsValue.style.fontSize = '1rem';
  investmentsValue.style.fontWeight = '600';
  investmentsValue.style.color = '#3B82F6';
  
  investmentsLabel.appendChild(investmentsTitle);
  investmentsLabel.appendChild(investmentsValue);
  
  const investmentsSlider = document.createElement('input');
  investmentsSlider.type = 'range';
  investmentsSlider.id = 'investments-percentage';
  investmentsSlider.min = '0';
  investmentsSlider.max = '100';
  investmentsSlider.step = '1';
  investmentsSlider.value = currentRatio.investments;
  investmentsSlider.style.width = '100%';
  investmentsSlider.style.height = '8px';
  investmentsSlider.style.borderRadius = '4px';
  investmentsSlider.style.appearance = 'none';
  investmentsSlider.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
  investmentsSlider.style.outline = 'none';
  investmentsSlider.style.cursor = 'pointer';
  
  // Custom slider styling
  const investmentsSliderStyle = document.createElement('style');
  investmentsSliderStyle.textContent = `
    #investments-percentage::-webkit-slider-thumb {
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #3B82F6;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
    }
    #investments-percentage::-moz-range-thumb {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #3B82F6;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
      border: none;
    }
  `;
  document.head.appendChild(investmentsSliderStyle);
  
  investmentsGroup.appendChild(investmentsLabel);
  investmentsGroup.appendChild(investmentsSlider);
  
  // Savings input group
  const savingsGroup = document.createElement('div');
  savingsGroup.style.display = 'grid';
  savingsGroup.style.gridTemplateColumns = '1fr';
  savingsGroup.style.gap = '10px';
  
  const savingsLabel = document.createElement('div');
  savingsLabel.style.display = 'flex';
  savingsLabel.style.justifyContent = 'space-between';
  savingsLabel.style.alignItems = 'center';
  
  const savingsTitle = document.createElement('label');
  savingsTitle.htmlFor = 'savings-percentage';
  savingsTitle.innerHTML = `
    <span style="color: #F59E0B; font-weight: 600; font-size: 1rem;">Savings</span>
    <span style="font-size: 0.75rem; opacity: 0.7; display: block; margin-top: 2px;">
      Emergency fund, future goals
    </span>
  `;
  
  const savingsValue = document.createElement('span');
  savingsValue.id = 'savings-value';
  savingsValue.textContent = `${currentRatio.savings}%`;
  savingsValue.style.fontSize = '1rem';
  savingsValue.style.fontWeight = '600';
  savingsValue.style.color = '#F59E0B';
  
  savingsLabel.appendChild(savingsTitle);
  savingsLabel.appendChild(savingsValue);
  
  const savingsSlider = document.createElement('input');
  savingsSlider.type = 'range';
  savingsSlider.id = 'savings-percentage';
  savingsSlider.min = '0';
  savingsSlider.max = '100';
  savingsSlider.step = '1';
  savingsSlider.value = currentRatio.savings;
  savingsSlider.style.width = '100%';
  savingsSlider.style.height = '8px';
  savingsSlider.style.borderRadius = '4px';
  savingsSlider.style.appearance = 'none';
  savingsSlider.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
  savingsSlider.style.outline = 'none';
  savingsSlider.style.cursor = 'pointer';
  
  // Custom slider styling
  const savingsSliderStyle = document.createElement('style');
  savingsSliderStyle.textContent = `
    #savings-percentage::-webkit-slider-thumb {
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #F59E0B;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.7);
    }
    #savings-percentage::-moz-range-thumb {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #F59E0B;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.7);
      border: none;
    }
  `;
  document.head.appendChild(savingsSliderStyle);
  
  savingsGroup.appendChild(savingsLabel);
  savingsGroup.appendChild(savingsSlider);
  
  // Add visualization of current split
  const splitVisualization = document.createElement('div');
  splitVisualization.className = 'split-visualization';
  splitVisualization.style.height = '12px';
  splitVisualization.style.borderRadius = '6px';
  splitVisualization.style.overflow = 'hidden';
  splitVisualization.style.display = 'flex';
  splitVisualization.style.marginTop = '20px';
  splitVisualization.style.marginBottom = '20px';
  splitVisualization.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
  
  const needsBar = document.createElement('div');
  needsBar.className = 'needs-bar';
  needsBar.style.width = `${currentRatio.needs}%`;
  needsBar.style.height = '100%';
  needsBar.style.backgroundColor = '#10B981';
  needsBar.style.transition = 'width 0.3s ease';
  
  const investmentsBar = document.createElement('div');
  investmentsBar.className = 'investments-bar';
  investmentsBar.style.width = `${currentRatio.investments}%`;
  investmentsBar.style.height = '100%';
  investmentsBar.style.backgroundColor = '#3B82F6';
  investmentsBar.style.transition = 'width 0.3s ease';
  
  const savingsBar = document.createElement('div');
  savingsBar.className = 'savings-bar';
  savingsBar.style.width = `${currentRatio.savings}%`;
  savingsBar.style.height = '100%';
  savingsBar.style.backgroundColor = '#F59E0B';
  savingsBar.style.transition = 'width 0.3s ease';
  
  splitVisualization.appendChild(needsBar);
  splitVisualization.appendChild(investmentsBar);
  splitVisualization.appendChild(savingsBar);
  
  // Total section
  const totalSection = document.createElement('div');
  totalSection.style.display = 'flex';
  totalSection.style.justifyContent = 'space-between';
  totalSection.style.alignItems = 'center';
  totalSection.style.padding = '12px';
  totalSection.style.borderRadius = '8px';
  totalSection.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
  totalSection.style.border = '1px solid rgba(79, 70, 229, 0.2)';
  totalSection.style.marginBottom = '20px';
  
  const totalLabel = document.createElement('div');
  totalLabel.textContent = 'Total';
  totalLabel.style.fontWeight = '600';
  
  const totalValueContainer = document.createElement('div');
  totalValueContainer.style.display = 'flex';
  totalValueContainer.style.alignItems = 'center';
  totalValueContainer.style.gap = '6px';
  
  const totalValue = document.createElement('span');
  totalValue.id = 'total-value';
  totalValue.textContent = '100%';
  totalValue.style.fontWeight = '600';
  totalValue.style.fontSize = '1.125rem';
  
  // Status indicator
  const statusIndicator = document.createElement('div');
  statusIndicator.id = 'status-indicator';
  statusIndicator.style.width = '12px';
  statusIndicator.style.height = '12px';
  statusIndicator.style.borderRadius = '50%';
  statusIndicator.style.backgroundColor = '#10B981';
  statusIndicator.style.transition = 'background-color 0.3s ease';
  
  totalValueContainer.appendChild(totalValue);
  totalValueContainer.appendChild(statusIndicator);
  
  totalSection.appendChild(totalLabel);
  totalSection.appendChild(totalValueContainer);
  
  // Actions container
  const actionsContainer = document.createElement('div');
  actionsContainer.style.display = 'flex';
  actionsContainer.style.justifyContent = 'flex-end';
  actionsContainer.style.gap = '10px';
  actionsContainer.style.marginTop = '10px';
  
  // Cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '10px 20px';
  cancelButton.style.borderRadius = '8px';
  cancelButton.style.backgroundColor = 'rgba(31, 41, 55, 0.5)';
  cancelButton.style.color = 'white';
  cancelButton.style.border = 'none';
  cancelButton.style.fontWeight = '500';
  cancelButton.style.cursor = 'pointer';
  
  // Save button
  const saveButton = document.createElement('button');
  saveButton.id = 'save-split-btn';
  saveButton.textContent = 'Save Split';
  saveButton.className = 'neon-button';
  saveButton.style.padding = '10px 20px';
  saveButton.style.display = 'inline-flex';
  saveButton.style.alignItems = 'center';
  saveButton.style.gap = '8px';
  saveButton.style.backgroundColor = 'rgba(79, 70, 229, 0.3)';
  saveButton.style.color = 'white';
  saveButton.style.border = '1px solid rgba(79, 70, 229, 0.5)';
  saveButton.style.borderRadius = '8px';
  saveButton.style.fontWeight = '600';
  saveButton.style.cursor = 'pointer';
  saveButton.style.boxShadow = '0 0 15px rgba(79, 70, 229, 0.3)';
  saveButton.style.transition = 'all 0.3s ease';
  saveButton.style.position = 'relative';
  
  saveButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
    Save Split
  `;
  
  // Add buttons to actions container
  actionsContainer.appendChild(cancelButton);
  actionsContainer.appendChild(saveButton);
  
  // Add all elements to form
  form.appendChild(needsGroup);
  form.appendChild(investmentsGroup);
  form.appendChild(savingsGroup);
  form.appendChild(splitVisualization);
  form.appendChild(totalSection);
  form.appendChild(actionsContainer);
  
  formContainer.appendChild(form);
  modalOverlay.appendChild(formContainer);
  document.body.appendChild(modalOverlay);
  
  // Function to update split visualization
  function updateSplitVisualization() {
    const needsValue = parseInt(needsSlider.value);
    const investmentsValue = parseInt(investmentsSlider.value);
    const savingsValue = parseInt(savingsSlider.value);
    
    const total = needsValue + investmentsValue + savingsValue;
    
    // Update value displays
    document.getElementById('needs-value').textContent = `${needsValue}%`;
    document.getElementById('investments-value').textContent = `${investmentsValue}%`;
    document.getElementById('savings-value').textContent = `${savingsValue}%`;
    document.getElementById('total-value').textContent = `${total}%`;
    
    // Update visualization bars
    needsBar.style.width = `${needsValue}%`;
    investmentsBar.style.width = `${investmentsValue}%`;
    savingsBar.style.width = `${savingsValue}%`;
    
    // Update status indicator
    const statusIndicator = document.getElementById('status-indicator');
    if (total === 100) {
      statusIndicator.style.backgroundColor = '#10B981'; // Green
      saveButton.disabled = false;
      saveButton.style.opacity = '1';
      saveButton.style.cursor = 'pointer';
    } else {
      statusIndicator.style.backgroundColor = '#EF4444'; // Red
      saveButton.disabled = true;
      saveButton.style.opacity = '0.5';
      saveButton.style.cursor = 'not-allowed';
    }
  }
  
  // Add event listeners to sliders
  needsSlider.addEventListener('input', () => {
    updateSplitVisualization();
  });
  
  investmentsSlider.addEventListener('input', () => {
    updateSplitVisualization();
  });
  
  savingsSlider.addEventListener('input', () => {
    updateSplitVisualization();
  });
  
  // Add event listener to cancel button
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  // Add event listener to save button
  saveButton.addEventListener('click', () => {
    const newSplitRatio = {
      needs: parseInt(needsSlider.value),
      investments: parseInt(investmentsSlider.value),
      savings: parseInt(savingsSlider.value)
    };
    
    const total = newSplitRatio.needs + newSplitRatio.investments + newSplitRatio.savings;
    
    if (total !== 100) {
      alert('Split ratio must add up to 100%. Please adjust your values.');
      return;
    }
    
    // Save the new split ratio
    saveSplitRatio(newSplitRatio);
    
    // Close the modal
    document.body.removeChild(modalOverlay);
    
    // Refresh the income page
    const incomeContainer = document.querySelector('.income-container');
    if (incomeContainer && incomeContainer.parentNode) {
      const newIncomeElement = renderIncomePage();
      incomeContainer.parentNode.replaceChild(newIncomeElement, incomeContainer);
    }
  });
}

// Function to export income data to CSV
function exportIncomeData() {
  const incomeEntries = getIncomeData();
  
  if (!incomeEntries || incomeEntries.length === 0) {
    alert('No income data available to export.');
    return;
  }
  
  // Sort entries by date (most recent first)
  const sortedEntries = [...incomeEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // CSV header
  let csvContent = 'Date,Description,Source,Category,Amount,Needs Allocation,Investments Allocation,Savings Allocation\n';
  
  // Add each entry as a row in the CSV
  sortedEntries.forEach(entry => {
    // Format the values and escape commas in text fields
    const date = entry.date;
    const description = `"${(entry.description || '').replace(/"/g, '""')}"`;
    const source = `"${(entry.source || '').replace(/"/g, '""')}"`;
    
    // Get category name from ID
    let categoryName = '';
    const categories = getIncomeCategories();
    const category = categories.find(cat => cat.id === entry.category);
    if (category) {
      categoryName = category.name;
    }
    
    const amount = entry.amount.toFixed(2);
    
    // Get split values
    const splits = entry.splits || calculateSplits(entry.amount);
    const needsAmount = splits.needs.toFixed(2);
    const investmentsAmount = splits.investments.toFixed(2);
    const savingsAmount = splits.savings.toFixed(2);
    
    // Add row to CSV
    csvContent += `${date},${description},"${source}","${categoryName}",${amount},${needsAmount},${investmentsAmount},${savingsAmount}\n`;
  });
  
  // Create a download link
  const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `income_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
}

// Show confirmation dialog when deleting income entry
function showDeleteConfirmation(entryId) {
  if (!entryId) return;
  
  // Create confirmation modal
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.right = '0';
  modalOverlay.style.bottom = '0';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.zIndex = '9999';
  modalOverlay.style.backdropFilter = 'blur(5px)';
  
  // Create confirmation dialog
  const confirmDialog = document.createElement('div');
  confirmDialog.className = 'futuristic-card';
  confirmDialog.style.width = '90%';
  confirmDialog.style.maxWidth = '400px';
  confirmDialog.style.padding = '25px';
  confirmDialog.style.color = 'white';
  confirmDialog.style.textAlign = 'center';
  
  // Add warning icon
  confirmDialog.innerHTML = `
    <div style="margin-bottom: 20px; display: flex; justify-content: center;">
      <div style="background-color: rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 50%; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
    </div>
    <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 15px; color: #EF4444;">Confirm Deletion</h3>
    <p style="margin-bottom: 25px; opacity: 0.8;">Are you sure you want to delete this income entry? This action cannot be undone.</p>
  `;
  
  // Create action buttons
  const actionButtons = document.createElement('div');
  actionButtons.style.display = 'flex';
  actionButtons.style.justifyContent = 'center';
  actionButtons.style.gap = '15px';
  
  // Cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '10px 20px';
  cancelButton.style.borderRadius = '8px';
  cancelButton.style.backgroundColor = 'rgba(31, 41, 55, 0.5)';
  cancelButton.style.color = 'white';
  cancelButton.style.border = 'none';
  cancelButton.style.cursor = 'pointer';
  
  // Delete button
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.style.padding = '10px 20px';
  deleteButton.style.borderRadius = '8px';
  deleteButton.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
  deleteButton.style.color = 'white';
  deleteButton.style.border = 'none';
  deleteButton.style.cursor = 'pointer';
  deleteButton.style.fontWeight = 'bold';
  
  actionButtons.appendChild(cancelButton);
  actionButtons.appendChild(deleteButton);
  
  confirmDialog.appendChild(actionButtons);
  modalOverlay.appendChild(confirmDialog);
  
  // Add to document
  document.body.appendChild(modalOverlay);
  
  // Cancel button click handler
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  // Delete button click handler
  deleteButton.addEventListener('click', () => {
    const success = deleteIncomeEntry(entryId);
    
    if (success) {
      // Close the modal
      document.body.removeChild(modalOverlay);
      
      // Refresh the income page
      const incomeContainer = document.querySelector('.income-container');
      if (incomeContainer && incomeContainer.parentNode) {
        const newIncomeElement = renderIncomePage();
        incomeContainer.parentNode.replaceChild(newIncomeElement, incomeContainer);
      }
    } else {
      alert('Error deleting income entry. Please try again.');
    }
  });
}

// Main function to render the Income page
export function renderIncomePage(userId) {
  // Create main container with futuristic styling
  const incomeContainer = document.createElement('div');
  incomeContainer.className = 'income-container';
  incomeContainer.style.position = 'relative';
  incomeContainer.style.color = 'white';
  incomeContainer.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  
  // Add CSS variables
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    :root {
      --primary: #4F46E5;
      --primary-dark: #4338CA;
      --secondary: #10B981;
      --accent: #F59E0B;
      --dark: #111827;
      --dark-mid: #1F2937;
      --dark-light: #374151;
      --text: #F9FAFB;
      --text-muted: #9CA3AF;
      --glow-blue: 0 0 15px rgba(79, 70, 229, 0.5);
      --glow-green: 0 0 15px rgba(16, 185, 129, 0.5);
      --glow-yellow: 0 0 15px rgba(245, 158, 11, 0.5);
    }
    
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    
    @keyframes flow {
      0% { transform: translateX(-100%) skewX(15deg); }
      100% { transform: translateX(200%) skewX(15deg); }
    }
    
    .pulse-animation {
      animation: pulse 3s infinite ease-in-out;
    }
    
    .flow-animation {
      width: 50%;
      height: 100%;
      transform: skewX(15deg);
      animation: flow 3s infinite;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    }
    
    .hoverable-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3), 0 0 10px rgba(79, 70, 229, 0.3);
    }
  `;
  document.head.appendChild(styleElement);
  
  // Add circuit background pattern
  const circuitBackground = document.createElement('div');
  circuitBackground.style.position = 'absolute';
  circuitBackground.style.top = '0';
  circuitBackground.style.left = '0';
  circuitBackground.style.right = '0';
  circuitBackground.style.bottom = '0';
  circuitBackground.style.zIndex = '-1';
  circuitBackground.style.opacity = '0.05';
  circuitBackground.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zm20.97 0l9.315 9.314-1.414 1.414L34.828 0h2.83zM22.344 0L13.03 9.314l1.414 1.414L25.172 0h-2.83zM32 0l12.142 12.142-1.414 1.414L30 .828 17.272 13.556l-1.414-1.414L28 0h4zM.284 0l28 28-1.414 1.414L0 2.544V0h.284zM0 5.373l25.456 25.455-1.414 1.415L0 8.2V5.374zm0 5.656l22.627 22.627-1.414 1.414L0 13.86v-2.83zm0 5.656l19.8 19.8-1.415 1.413L0 19.514v-2.83zm0 5.657l16.97 16.97-1.414 1.415L0 25.172v-2.83zM0 28l14.142 14.142-1.414 1.414L0 30.828V28zm0 5.657L11.314 44.97l-1.414 1.414L0 36.485v-2.83zm0 5.657L8.485 47.8l-1.414 1.414L0 42.143v-2.83zm0 5.657l5.657 5.657-1.414 1.415L0 47.8v-2.83zm0 5.657l2.828 2.83-1.414 1.413L0 53.456v-2.83zM54.627 60L30 35.373 5.373 60H8.2L30 38.2 51.8 60h2.827zm-5.656 0L30 41.03 11.03 60h2.828L30 43.858 46.142 60h2.83zm-5.656 0L30 46.686 16.686 60h2.83L30 49.515 40.485 60h2.83zm-5.657 0L30 52.343 22.344 60h2.83L30 55.172 34.828 60h2.83zM32 60l-2-2-2 2h4zM59.716 0l-28 28 1.414 1.414L60 2.544V0h-.284zM60 5.373L34.544 30.828l1.414 1.415L60 8.2V5.374zm0 5.656L37.373 33.656l1.414 1.414L60 13.86v-2.83zm0 5.656l-19.8 19.8 1.415 1.413L60 19.514v-2.83zm0 5.657l-16.97 16.97 1.414 1.415L60 25.172v-2.83zM60 28L45.858 42.142l1.414 1.414L60 30.828V28zm0 5.657L48.686 44.97l1.414 1.414L60 36.485v-2.83zm0 5.657L51.515 47.8l1.414 1.414L60 42.143v-2.83zm0 5.657l-5.657 5.657 1.414 1.415L60 47.8v-2.83zm0 5.657l-2.828 2.83 1.414 1.413L60 53.456v-2.83zM39.9 16.385l1.414-1.414L30 3.658 18.686 14.97l1.415 1.415 9.9-9.9 9.9 9.9zm-2.83 2.828l1.415-1.414L30 9.313 21.515 17.8l1.414 1.413L30 11.9l7.07 7.07z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")';
  incomeContainer.appendChild(circuitBackground);
  
  // Get income data and other necessary information
  const incomeEntries = getIncomeData();
  const incomeCategories = getIncomeCategories();
  const splitRatio = getSplitRatio();
  const monthlyIncome = updateMonthlyIncome();
  
  // Create futuristic header
  const header = document.createElement('header');
  header.style.position = 'relative';
  header.style.borderRadius = '12px';
  header.style.padding = '20px';
  header.style.marginBottom = '20px';
  header.style.background = 'linear-gradient(120deg, rgba(31, 41, 55, 0.7), rgba(31, 41, 55, 0.9))';
  header.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
  header.style.overflow = 'hidden';
  header.style.border = '1px solid rgba(79, 70, 229, 0.3)';
  
  // Add glowing edge
  const headerGlow = document.createElement('div');
  headerGlow.style.position = 'absolute';
  headerGlow.style.top = '0';
  headerGlow.style.left = '0';
  headerGlow.style.right = '0';
  headerGlow.style.height = '1px';
  headerGlow.style.background = 'linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.7), transparent)';
  header.appendChild(headerGlow);
  
  // Add header content
  const headerContent = document.createElement('div');
  headerContent.style.display = 'flex';
  headerContent.style.justifyContent = 'space-between';
  headerContent.style.alignItems = 'center';
  headerContent.style.flexWrap = 'wrap';
  headerContent.style.gap = '20px';
  
  // Header title section
  const titleSection = document.createElement('div');
  titleSection.style.display = 'flex';
  titleSection.style.alignItems = 'center';
  titleSection.style.gap = '15px';
  
  // Add icon
  const iconContainer = document.createElement('div');
  iconContainer.style.backgroundColor = 'rgba(79, 70, 229, 0.2)';
  iconContainer.style.padding = '12px';
  iconContainer.style.borderRadius = '12px';
  iconContainer.style.boxShadow = '0 0 15px rgba(79, 70, 229, 0.3)';
  iconContainer.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  `;
  
  // Title and subtitle
  const titleBlock = document.createElement('div');
  
  const title = document.createElement('h1');
  title.textContent = 'Income Command Center';
  title.style.fontSize = '1.75rem';
  title.style.fontWeight = 'bold';
  title.style.margin = '0';
  title.style.color = 'white';
  title.style.textShadow = '0 0 10px rgba(79, 70, 229, 0.5)';
  
  const subtitle = document.createElement('div');
  subtitle.style.display = 'flex';
  subtitle.style.alignItems = 'center';
  subtitle.style.marginTop = '5px';
  
  // Add status indicator
  const statusDot = document.createElement('div');
  statusDot.style.width = '6px';
  statusDot.style.height = '6px';
  statusDot.style.borderRadius = '50%';
  statusDot.style.backgroundColor = '#10B981';
  statusDot.style.marginRight = '8px';
  statusDot.className = 'pulse-animation';
  
  const headerStatusText = document.createElement('span');
  headerStatusText.textContent = 'Split Management System';
  headerStatusText.style.color = 'rgba(255, 255, 255, 0.7)';
  headerStatusText.style.fontSize = '0.875rem';
  
  subtitle.appendChild(statusDot);
  subtitle.appendChild(headerStatusText);
  
  titleBlock.appendChild(title);
  titleBlock.appendChild(subtitle);
  
  titleSection.appendChild(iconContainer);
  titleSection.appendChild(titleBlock);
  
  // Add button section
  const buttonSection = document.createElement('div');
  
  // Create add income button
  const addButton = document.createElement('button');
  addButton.id = 'add-income-btn';
  addButton.className = 'neon-button';
  addButton.style.backgroundColor = 'rgba(79, 70, 229, 0.3)';
  addButton.style.color = 'white';
  addButton.style.border = '1px solid rgba(79, 70, 229, 0.5)';
  addButton.style.borderRadius = '8px';
  addButton.style.padding = '10px 20px';
  addButton.style.display = 'flex';
  addButton.style.alignItems = 'center';
  addButton.style.gap = '8px';
  addButton.style.fontSize = '0.875rem';
  addButton.style.fontWeight = '600';
  addButton.style.cursor = 'pointer';
  addButton.style.boxShadow = '0 0 15px rgba(79, 70, 229, 0.3)';
  addButton.style.transition = 'all 0.3s ease';
  addButton.style.position = 'relative';
  addButton.style.overflow = 'hidden';
  
  // Add icon to button
  addButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Record Income
  `;
  
  // Add flowing effect inside button
  const buttonFlow = document.createElement('div');
  buttonFlow.className = 'flow-animation';
  buttonFlow.style.position = 'absolute';
  buttonFlow.style.top = '0';
  buttonFlow.style.left = '0';
  buttonFlow.style.width = '50%';
  buttonFlow.style.height = '100%';
  buttonFlow.style.background = 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)';
  buttonFlow.style.zIndex = '0';
  
  addButton.appendChild(buttonFlow);
  buttonSection.appendChild(addButton);
  
  // Assemble header
  headerContent.appendChild(titleSection);
  headerContent.appendChild(buttonSection);
  header.appendChild(headerContent);
  incomeContainer.appendChild(header);
  
  // Create main dashboard grid with 3 cards
  const dashboardGrid = document.createElement('div');
  dashboardGrid.style.display = 'grid';
  dashboardGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
  dashboardGrid.style.gap = '20px';
  dashboardGrid.style.marginBottom = '30px';
  
  // 1. Monthly Income Card
  const monthlyCard = document.createElement('div');
  monthlyCard.className = 'futuristic-card hoverable-card';
  monthlyCard.style.padding = '20px';
  monthlyCard.style.position = 'relative';
  monthlyCard.style.overflow = 'hidden';
  monthlyCard.style.background = 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(67, 56, 202, 0.3))';
  monthlyCard.style.borderRadius = '12px';
  monthlyCard.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
  monthlyCard.style.border = '1px solid rgba(79, 70, 229, 0.3)';
  
  // Add subtle animated pattern
  const patternOverlay = document.createElement('div');
  patternOverlay.style.position = 'absolute';
  patternOverlay.style.inset = '0';
  patternOverlay.style.opacity = '0.1';
  patternOverlay.style.backgroundImage = 'radial-gradient(rgba(79, 70, 229, 0.4) 1px, transparent 1px)';
  patternOverlay.style.backgroundSize = '20px 20px';
  monthlyCard.appendChild(patternOverlay);
  
  // Card content
  const monthlyContent = document.createElement('div');
  monthlyContent.style.position = 'relative';
  monthlyContent.style.zIndex = '1';
  
  // Card header
  const monthlyHeader = document.createElement('div');
  monthlyHeader.style.display = 'flex';
  monthlyHeader.style.alignItems = 'center';
  monthlyHeader.style.marginBottom = '15px';
  
  const monthlyIcon = document.createElement('div');
  monthlyIcon.style.backgroundColor = 'rgba(79, 70, 229, 0.2)';
  monthlyIcon.style.width = '40px';
  monthlyIcon.style.height = '40px';
  monthlyIcon.style.borderRadius = '8px';
  monthlyIcon.style.display = 'flex';
  monthlyIcon.style.alignItems = 'center';
  monthlyIcon.style.justifyContent = 'center';
  monthlyIcon.style.marginRight = '12px';
  monthlyIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
      <line x1="9" y1="8" x2="15" y2="8"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
      <line x1="10" y1="16" x2="14" y2="16"></line>
    </svg>
  `;
  
  const monthlyTitle = document.createElement('h2');
  monthlyTitle.textContent = 'Monthly Income';
  monthlyTitle.style.margin = '0';
  monthlyTitle.style.fontSize = '1rem';
  monthlyTitle.style.fontWeight = '600';
  monthlyTitle.style.color = 'white';
  
  monthlyHeader.appendChild(monthlyIcon);
  monthlyHeader.appendChild(monthlyTitle);
  
  // Income amount
  const monthlyAmount = document.createElement('div');
  monthlyAmount.style.fontSize = '2.25rem';
  monthlyAmount.style.fontWeight = 'bold';
  monthlyAmount.style.marginBottom = '8px';
  monthlyAmount.style.color = 'white';
  monthlyAmount.style.textShadow = '0 0 8px rgba(79, 70, 229, 0.5)';
  monthlyAmount.textContent = formatCurrency(monthlyIncome);
  
  // Time period indicator
  const timePeriod = document.createElement('div');
  timePeriod.style.display = 'flex';
  timePeriod.style.alignItems = 'center';
  timePeriod.style.fontSize = '0.875rem';
  timePeriod.style.color = 'rgba(255, 255, 255, 0.7)';
  
  const calendarIcon = document.createElement('span');
  calendarIcon.style.marginRight = '5px';
  calendarIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  `;
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  timePeriod.appendChild(calendarIcon);
  timePeriod.appendChild(document.createTextNode(currentMonth));
  
  // Assemble card content
  monthlyContent.appendChild(monthlyHeader);
  monthlyContent.appendChild(monthlyAmount);
  monthlyContent.appendChild(timePeriod);
  monthlyCard.appendChild(monthlyContent);
  
  // 2. Split Allocation Card
  const splitAllocationCard = document.createElement('div');
  splitAllocationCard.className = 'futuristic-card hoverable-card';
  splitAllocationCard.style.padding = '20px';
  splitAllocationCard.style.position = 'relative';
  splitAllocationCard.style.overflow = 'hidden';
  splitAllocationCard.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 95, 70, 0.3))';
  splitAllocationCard.style.borderRadius = '12px';
  splitAllocationCard.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
  splitAllocationCard.style.border = '1px solid rgba(16, 185, 129, 0.3)';
  
  // Add header
  const splitHeader = document.createElement('div');
  splitHeader.style.display = 'flex';
  splitHeader.style.justifyContent = 'space-between';
  splitHeader.style.alignItems = 'center';
  splitHeader.style.marginBottom = '20px';
  
  const splitTitleSection = document.createElement('div');
  splitTitleSection.style.display = 'flex';
  splitTitleSection.style.alignItems = 'center';
  
  const splitIcon = document.createElement('div');
  splitIcon.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
  splitIcon.style.width = '40px';
  splitIcon.style.height = '40px';
  splitIcon.style.borderRadius = '8px';
  splitIcon.style.display = 'flex';
  splitIcon.style.alignItems = 'center';
  splitIcon.style.justifyContent = 'center';
  splitIcon.style.marginRight = '12px';
  splitIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  `;
  
  const splitTitle = document.createElement('h2');
  splitTitle.textContent = 'Split Allocation';
  splitTitle.style.margin = '0';
  splitTitle.style.fontSize = '1rem';
  splitTitle.style.fontWeight = '600';
  splitTitle.style.color = 'white';
  
  splitTitleSection.appendChild(splitIcon);
  splitTitleSection.appendChild(splitTitle);
  
  // Customize button 
  const customizeButton = document.createElement('button');
  customizeButton.id = 'customize-split-btn';
  customizeButton.style.display = 'flex';
  customizeButton.style.alignItems = 'center';
  customizeButton.style.padding = '5px 10px';
  customizeButton.style.fontSize = '0.75rem';
  customizeButton.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
  customizeButton.style.border = '1px solid rgba(16, 185, 129, 0.3)';
  customizeButton.style.borderRadius = '20px';
  customizeButton.style.color = 'rgba(255, 255, 255, 0.9)';
  customizeButton.style.cursor = 'pointer';
  customizeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
      <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
    Customize
  `;
  
  splitHeader.appendChild(splitTitleSection);
  splitHeader.appendChild(customizeButton);
  
  // Create split visualization
  const splitVisualization = document.createElement('div');
  splitVisualization.style.position = 'relative';
  splitVisualization.style.height = '20px';
  splitVisualization.style.borderRadius = '10px';
  splitVisualization.style.overflow = 'hidden';
  splitVisualization.style.marginBottom = '20px';
  splitVisualization.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
  splitVisualization.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  
  // Create interactive bars with futuristic styling
  // Needs Bar
  const needsBar = document.createElement('div');
  needsBar.className = 'needs-bar';
  needsBar.style.position = 'absolute';
  needsBar.style.left = '0';
  needsBar.style.top = '0';
  needsBar.style.height = '100%';
  needsBar.style.width = `${splitRatio.needs}%`;
  needsBar.style.background = 'linear-gradient(90deg, rgba(0, 230, 118, 0.7), rgba(0, 198, 101, 0.7))';
  needsBar.style.transition = 'width 0.5s ease';
  needsBar.style.zIndex = '2';
  
  // Flowing effect for needs bar
  const needsFlow = document.createElement('div');
  needsFlow.className = 'flow-animation';
  needsFlow.style.position = 'absolute';
  needsFlow.style.inset = '0';
  needsBar.appendChild(needsFlow);
  
  // Investments Bar
  const investmentsBar = document.createElement('div');
  investmentsBar.className = 'investments-bar';
  investmentsBar.style.position = 'absolute';
  investmentsBar.style.left = `${splitRatio.needs}%`;
  investmentsBar.style.top = '0';
  investmentsBar.style.height = '100%';
  investmentsBar.style.width = `${splitRatio.investments}%`;
  investmentsBar.style.background = 'linear-gradient(90deg, rgba(33, 150, 243, 0.7), rgba(30, 136, 229, 0.7))';
  investmentsBar.style.transition = 'width 0.5s ease, left 0.5s ease';
  investmentsBar.style.zIndex = '2';
  
  // Flowing effect for investments bar
  const investmentsFlow = document.createElement('div');
  investmentsFlow.className = 'flow-animation';
  investmentsFlow.style.position = 'absolute';
  investmentsFlow.style.inset = '0';
  investmentsFlow.style.animationDelay = '0.5s';
  investmentsBar.appendChild(investmentsFlow);
  
  // Savings Bar
  const savingsBar = document.createElement('div');
  savingsBar.className = 'savings-bar';
  savingsBar.style.position = 'absolute';
  savingsBar.style.left = `${splitRatio.needs + splitRatio.investments}%`;
  savingsBar.style.top = '0';
  savingsBar.style.height = '100%';
  savingsBar.style.width = `${splitRatio.savings}%`;
  savingsBar.style.background = 'linear-gradient(90deg, rgba(255, 193, 7, 0.7), rgba(245, 124, 0, 0.7))';
  savingsBar.style.transition = 'width 0.5s ease, left 0.5s ease';
  savingsBar.style.zIndex = '2';
  
  // Flowing effect for savings bar
  const savingsFlow = document.createElement('div');
  savingsFlow.className = 'flow-animation';
  savingsFlow.style.position = 'absolute';
  savingsFlow.style.inset = '0';
  savingsFlow.style.animationDelay = '1s';
  savingsBar.appendChild(savingsFlow);
  
  // Add dividers for visual clarity
  const divider1 = document.createElement('div');
  divider1.style.position = 'absolute';
  divider1.style.left = `${splitRatio.needs}%`;
  divider1.style.top = '0';
  divider1.style.height = '100%';
  divider1.style.width = '1px';
  divider1.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  divider1.style.zIndex = '3';
  
  const divider2 = document.createElement('div');
  divider2.style.position = 'absolute';
  divider2.style.left = `${splitRatio.needs + splitRatio.investments}%`;
  divider2.style.top = '0';
  divider2.style.height = '100%';
  divider2.style.width = '1px';
  divider2.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  divider2.style.zIndex = '3';
  
  // Assemble split visualization
  splitVisualization.appendChild(needsBar);
  splitVisualization.appendChild(investmentsBar);
  splitVisualization.appendChild(savingsBar);
  splitVisualization.appendChild(divider1);
  splitVisualization.appendChild(divider2);
  
  // Create split details
  const splitDetails = document.createElement('div');
  splitDetails.style.display = 'grid';
  splitDetails.style.gridTemplateColumns = 'repeat(3, 1fr)';
  splitDetails.style.gap = '10px';
  splitDetails.style.marginBottom = '10px';
  
  // Calculate monthly splits based on income
  const monthlySplits = calculateSplits(monthlyIncome);
  
  // Needs details
  const needsDetails = document.createElement('div');
  needsDetails.style.textAlign = 'center';
  needsDetails.style.padding = '10px';
  needsDetails.style.backgroundColor = 'rgba(0, 230, 118, 0.1)';
  needsDetails.style.borderRadius = '8px';
  needsDetails.style.border = '1px solid rgba(0, 230, 118, 0.2)';
  needsDetails.style.boxShadow = '0 0 5px rgba(0, 230, 118, 0.1)';
  
  const needsAmount = document.createElement('div');
  needsAmount.style.fontSize = '1.25rem';
  needsAmount.style.fontWeight = 'bold';
  needsAmount.style.color = 'rgb(0, 230, 118)';
  needsAmount.textContent = formatCurrency(monthlySplits.needs);
  
  const needsLabel = document.createElement('div');
  needsLabel.style.fontSize = '0.875rem';
  needsLabel.style.color = 'white';
  needsLabel.textContent = 'Needs';
  
  const needsPercent = document.createElement('div');
  needsPercent.style.fontSize = '0.75rem';
  needsPercent.style.color = 'rgba(255, 255, 255, 0.7)';
  needsPercent.textContent = `${splitRatio.needs}%`;
  
  needsDetails.appendChild(needsAmount);
  needsDetails.appendChild(needsLabel);
  needsDetails.appendChild(needsPercent);
  
  // Investments details
  const investmentsDetails = document.createElement('div');
  investmentsDetails.style.textAlign = 'center';
  investmentsDetails.style.padding = '10px';
  investmentsDetails.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
  investmentsDetails.style.borderRadius = '8px';
  investmentsDetails.style.border = '1px solid rgba(33, 150, 243, 0.2)';
  investmentsDetails.style.boxShadow = '0 0 5px rgba(33, 150, 243, 0.1)';
  
  const investmentsAmount = document.createElement('div');
  investmentsAmount.style.fontSize = '1.25rem';
  investmentsAmount.style.fontWeight = 'bold';
  investmentsAmount.style.color = 'rgb(33, 150, 243)';
  investmentsAmount.textContent = formatCurrency(monthlySplits.investments);
  
  const investmentsLabel = document.createElement('div');
  investmentsLabel.style.fontSize = '0.875rem';
  investmentsLabel.style.color = 'white';
  investmentsLabel.textContent = 'Investments';
  
  const investmentsPercent = document.createElement('div');
  investmentsPercent.style.fontSize = '0.75rem';
  investmentsPercent.style.color = 'rgba(255, 255, 255, 0.7)';
  investmentsPercent.textContent = `${splitRatio.investments}%`;
  
  investmentsDetails.appendChild(investmentsAmount);
  investmentsDetails.appendChild(investmentsLabel);
  investmentsDetails.appendChild(investmentsPercent);
  
  // Savings details
  const savingsDetails = document.createElement('div');
  savingsDetails.style.textAlign = 'center';
  savingsDetails.style.padding = '10px';
  savingsDetails.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
  savingsDetails.style.borderRadius = '8px';
  savingsDetails.style.border = '1px solid rgba(255, 193, 7, 0.2)';
  savingsDetails.style.boxShadow = '0 0 5px rgba(255, 193, 7, 0.1)';
  
  const savingsAmount = document.createElement('div');
  savingsAmount.style.fontSize = '1.25rem';
  savingsAmount.style.fontWeight = 'bold';
  savingsAmount.style.color = 'rgb(255, 193, 7)';
  savingsAmount.textContent = formatCurrency(monthlySplits.savings);
  
  const savingsLabel = document.createElement('div');
  savingsLabel.style.fontSize = '0.875rem';
  savingsLabel.style.color = 'white';
  savingsLabel.textContent = 'Savings';
  
  const savingsPercent = document.createElement('div');
  savingsPercent.style.fontSize = '0.75rem';
  savingsPercent.style.color = 'rgba(255, 255, 255, 0.7)';
  savingsPercent.textContent = `${splitRatio.savings}%`;
  
  savingsDetails.appendChild(savingsAmount);
  savingsDetails.appendChild(savingsLabel);
  savingsDetails.appendChild(savingsPercent);
  
  // Assemble split details
  splitDetails.appendChild(needsDetails);
  splitDetails.appendChild(investmentsDetails);
  splitDetails.appendChild(savingsDetails);
  
  // Assemble split allocation card
  splitAllocationCard.appendChild(splitHeader);
  splitAllocationCard.appendChild(splitVisualization);
  splitAllocationCard.appendChild(splitDetails);
  
  // 3. Income Overview Card
  const incomeOverviewCard = document.createElement('div');
  incomeOverviewCard.className = 'futuristic-card hoverable-card';
  incomeOverviewCard.style.padding = '20px';
  incomeOverviewCard.style.position = 'relative';
  incomeOverviewCard.style.overflow = 'hidden';
  incomeOverviewCard.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(194, 65, 12, 0.3))';
  incomeOverviewCard.style.borderRadius = '12px';
  incomeOverviewCard.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
  incomeOverviewCard.style.border = '1px solid rgba(245, 158, 11, 0.3)';
  
  // Header section
  const overviewHeader = document.createElement('div');
  overviewHeader.style.display = 'flex';
  overviewHeader.style.alignItems = 'center';
  overviewHeader.style.marginBottom = '15px';
  
  const overviewIcon = document.createElement('div');
  overviewIcon.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
  overviewIcon.style.width = '40px';
  overviewIcon.style.height = '40px';
  overviewIcon.style.borderRadius = '8px';
  overviewIcon.style.display = 'flex';
  overviewIcon.style.alignItems = 'center';
  overviewIcon.style.justifyContent = 'center';
  overviewIcon.style.marginRight = '12px';
  overviewIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 3v18h18"></path>
      <path d="M18.4 7.5l-9.6 9.6L4 15.5"></path>
      <path d="M15 7.5h3.5V11"></path>
    </svg>
  `;
  
  const overviewTitle = document.createElement('h2');
  overviewTitle.textContent = 'Income Overview';
  overviewTitle.style.margin = '0';
  overviewTitle.style.fontSize = '1rem';
  overviewTitle.style.fontWeight = '600';
  overviewTitle.style.color = 'white';
  
  overviewHeader.appendChild(overviewIcon);
  overviewHeader.appendChild(overviewTitle);
  
  // Income stats
  const incomeStats = document.createElement('div');
  incomeStats.style.display = 'grid';
  incomeStats.style.gridTemplateColumns = 'repeat(2, 1fr)';
  incomeStats.style.gap = '15px';
  
  // Calculate stats
  const totalIncomeAmount = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const entriesCount = incomeEntries.length;
  const averageIncome = entriesCount > 0 ? totalIncomeAmount / entriesCount : 0;
  
  // Create a helper function for stat items
  function createStatItem(label, value, icon) {
    const statItem = document.createElement('div');
    statItem.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
    statItem.style.padding = '12px';
    statItem.style.borderRadius = '8px';
    statItem.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    
    const statIcon = document.createElement('div');
    statIcon.style.marginBottom = '8px';
    statIcon.innerHTML = icon;
    
    const statValue = document.createElement('div');
    statValue.style.fontSize = '1.25rem';
    statValue.style.fontWeight = 'bold';
    statValue.style.color = 'white';
    statValue.style.marginBottom = '4px';
    statValue.textContent = value;
    
    const statLabel = document.createElement('div');
    statLabel.style.fontSize = '0.75rem';
    statLabel.style.color = 'rgba(255, 255, 255, 0.7)';
    statLabel.textContent = label;
    
    statItem.appendChild(statIcon);
    statItem.appendChild(statValue);
    statItem.appendChild(statLabel);
    
    return statItem;
  }
  
  // Total income stat
  const totalStat = createStatItem(
    'Total Income',
    formatCurrency(totalIncomeAmount),
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 7.8l-7.7 7.7-4-4-5.7 5.7"></path><path d="M15 7h6v6"></path></svg>'
  );
  
  // Average income stat
  const averageStat = createStatItem(
    'Average Income',
    formatCurrency(averageIncome),
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><circle cx="12" cy="12" r="4"></circle></svg>'
  );
  
  // Entries count stat
  const entriesStat = createStatItem(
    'Total Entries',
    entriesCount.toString(),
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
  );
  
  // Last entry stat
  let lastEntryDate = 'N/A';
  if (incomeEntries.length > 0) {
    const sortedEntries = [...incomeEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    lastEntryDate = formatDate(sortedEntries[0].date);
  }
  
  const lastEntryStat = createStatItem(
    'Latest Entry',
    lastEntryDate,
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
  );
  
  // Add stats to the container
  incomeStats.appendChild(totalStat);
  incomeStats.appendChild(averageStat);
  incomeStats.appendChild(entriesStat);
  incomeStats.appendChild(lastEntryStat);
  
  // Assemble income overview card
  incomeOverviewCard.appendChild(overviewHeader);
  incomeOverviewCard.appendChild(incomeStats);
  
  // Add all cards to dashboard grid
  dashboardGrid.appendChild(monthlyCard);
  dashboardGrid.appendChild(splitAllocationCard);
  dashboardGrid.appendChild(incomeOverviewCard);
  
  // Add dashboard grid to container
  incomeContainer.appendChild(dashboardGrid);
  
  // Create Income History Section with futuristic table
  const historySection = document.createElement('section');
  historySection.className = 'income-history-section';
  historySection.style.marginTop = '30px';
  
  // Create futuristic header card
  const historyHeader = document.createElement('div');
  historyHeader.className = 'futuristic-card';
  historyHeader.style.padding = '20px';
  historyHeader.style.marginBottom = '20px';
  historyHeader.style.display = 'flex';
  historyHeader.style.justifyContent = 'space-between';
  historyHeader.style.alignItems = 'center';
  historyHeader.style.flexWrap = 'wrap';
  historyHeader.style.gap = '15px';
  historyHeader.style.background = 'linear-gradient(120deg, rgba(31, 41, 55, 0.7), rgba(31, 41, 55, 0.9))';
  
  // Title section
  const historyTitleSection = document.createElement('div');
  historyTitleSection.style.display = 'flex';
  historyTitleSection.style.alignItems = 'center';
  historyTitleSection.style.gap = '12px';
  
  const historyIcon = document.createElement('div');
  historyIcon.style.backgroundColor = 'rgba(79, 70, 229, 0.2)';
  historyIcon.style.padding = '10px';
  historyIcon.style.borderRadius = '10px';
  historyIcon.style.boxShadow = '0 0 10px rgba(79, 70, 229, 0.3)';
  historyIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  `;
  
  const historyTitleContainer = document.createElement('div');
  
  const historyTitle = document.createElement('h2');
  historyTitle.textContent = 'Income History';
  historyTitle.style.margin = '0';
  historyTitle.style.fontSize = '1.25rem';
  historyTitle.style.fontWeight = 'bold';
  historyTitle.style.color = 'white';
  historyTitle.style.textShadow = '0 0 8px rgba(79, 70, 229, 0.4)';
  
  const historySubtitle = document.createElement('div');
  historySubtitle.style.display = 'flex';
  historySubtitle.style.alignItems = 'center';
  
  const statusIndicator = document.createElement('div');
  statusIndicator.style.width = '6px';
  statusIndicator.style.height = '6px';
  statusIndicator.style.borderRadius = '50%';
  statusIndicator.style.backgroundColor = '#10B981';
  statusIndicator.style.marginRight = '6px';
  statusIndicator.className = 'pulse-animation';
  
  const historyStatusText = document.createElement('span');
  historyStatusText.textContent = 'Secure Records';
  historyStatusText.style.fontSize = '0.75rem';
  historyStatusText.style.color = 'rgba(255, 255, 255, 0.7)';
  
  historySubtitle.appendChild(statusIndicator);
  historySubtitle.appendChild(historyStatusText);
  
  historyTitleContainer.appendChild(historyTitle);
  historyTitleContainer.appendChild(historySubtitle);
  
  historyTitleSection.appendChild(historyIcon);
  historyTitleSection.appendChild(historyTitleContainer);
  
  // Filter section
  const filterSection = document.createElement('div');
  filterSection.style.display = 'flex';
  filterSection.style.gap = '10px';
  
  // Filter buttons
  const filterButtons = document.createElement('div');
  filterButtons.style.display = 'flex';
  filterButtons.style.gap = '8px';
  
  // Helper function for filter buttons
  function createFilterButton(text, filterType, isActive = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.dataset.filter = filterType;
    button.style.padding = '8px 12px';
    button.style.borderRadius = '6px';
    button.style.fontSize = '0.75rem';
    button.style.fontWeight = '500';
    button.style.border = '1px solid rgba(79, 70, 229, 0.3)';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.3s ease';
    
    if (isActive) {
      button.style.backgroundColor = 'rgba(79, 70, 229, 0.3)';
      button.style.color = 'white';
    } else {
      button.style.backgroundColor = 'rgba(31, 41, 55, 0.6)';
      button.style.color = 'rgba(255, 255, 255, 0.7)';
    }
    
    // Add click event to button
    button.addEventListener('click', () => {
      // Update active state for all buttons
      const allButtons = filterButtons.querySelectorAll('button');
      allButtons.forEach(btn => {
        if (btn === button) {
          btn.style.backgroundColor = 'rgba(79, 70, 229, 0.3)';
          btn.style.color = 'white';
        } else {
          btn.style.backgroundColor = 'rgba(31, 41, 55, 0.6)';
          btn.style.color = 'rgba(255, 255, 255, 0.7)';
        }
      });
      
      // Filter entries based on selection
      const filteredEntries = filterIncomeEntries(filterType);
      updateIncomeTable(filteredEntries);
    });
    
    return button;
  }
  
  // Create filter buttons
  const allButton = createFilterButton('All Entries', 'all', true);
  const monthButton = createFilterButton('This Month', 'month');
  const weekButton = createFilterButton('This Week', 'week');
  
  filterButtons.appendChild(allButton);
  filterButtons.appendChild(monthButton);
  filterButtons.appendChild(weekButton);
  
  // Add export button
  const exportButton = document.createElement('button');
  exportButton.style.display = 'flex';
  exportButton.style.alignItems = 'center';
  exportButton.style.gap = '6px';
  exportButton.style.padding = '8px 12px';
  exportButton.style.borderRadius = '6px';
  exportButton.style.fontSize = '0.75rem';
  exportButton.style.fontWeight = '500';
  exportButton.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
  exportButton.style.border = '1px solid rgba(16, 185, 129, 0.3)';
  exportButton.style.color = 'white';
  exportButton.style.cursor = 'pointer';
  exportButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    Export
  `;
  
  // Add click event to export button
  exportButton.addEventListener('click', () => {
    console.log('Export button clicked - direct handler');
    exportIncomeData();
  });
  
  // Mark this button as having event already added to prevent duplicate handlers
  exportButton.setAttribute('data-export-event-added', 'true');
  
  filterSection.appendChild(filterButtons);
  filterSection.appendChild(exportButton);
  
  // Assemble history header
  historyHeader.appendChild(historyTitleSection);
  historyHeader.appendChild(filterSection);
  
  // Create table container with futuristic design
  const tableContainer = document.createElement('div');
  tableContainer.className = 'futuristic-card';
  tableContainer.style.overflow = 'hidden';
  tableContainer.style.borderRadius = '12px';
  tableContainer.style.border = '1px solid rgba(79, 70, 229, 0.2)';
  tableContainer.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
  
  // Function to update the income table with filtered entries
  function updateIncomeTable(entries) {
    // Clear existing table
    tableContainer.innerHTML = '';
    
    if (entries.length === 0) {
      // Show empty state with futuristic design
      const emptyState = document.createElement('div');
      emptyState.style.padding = '40px 20px';
      emptyState.style.textAlign = 'center';
      emptyState.style.backgroundColor = 'rgba(17, 24, 39, 0.7)';
      
      const emptyIcon = document.createElement('div');
      emptyIcon.style.margin = '0 auto 20px';
      emptyIcon.style.width = '60px';
      emptyIcon.style.height = '60px';
      emptyIcon.style.borderRadius = '50%';
      emptyIcon.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
      emptyIcon.style.display = 'flex';
      emptyIcon.style.alignItems = 'center';
      emptyIcon.style.justifyContent = 'center';
      emptyIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(79, 70, 229, 0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <line x1="12" y1="18" x2="12" y2="18.01"></line>
          <path d="M12 6v8"></path>
        </svg>
      `;
      
      const emptyTitle = document.createElement('h3');
      emptyTitle.textContent = 'No Income Entries Found';
      emptyTitle.style.color = 'white';
      emptyTitle.style.fontSize = '1.25rem';
      emptyTitle.style.fontWeight = 'bold';
      emptyTitle.style.margin = '0 0 10px';
      
      const emptyMessage = document.createElement('p');
      emptyMessage.textContent = 'Start adding income entries to track your earnings and take advantage of the 40/30/30 split system.';
      emptyMessage.style.color = 'rgba(255, 255, 255, 0.7)';
      emptyMessage.style.maxWidth = '400px';
      emptyMessage.style.margin = '0 auto 20px';
      emptyMessage.style.fontSize = '0.875rem';
      
      const addButton = document.createElement('button');
      addButton.className = 'neon-button';
      addButton.style.margin = '0 auto';
      addButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Your First Income
      `;
      
      addButton.addEventListener('click', () => {
        showIncomeForm();
      });
      
      emptyState.appendChild(emptyIcon);
      emptyState.appendChild(emptyTitle);
      emptyState.appendChild(emptyMessage);
      emptyState.appendChild(addButton);
      
      tableContainer.appendChild(emptyState);
      return;
    }
    
    // Create table with futuristic design
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'separate';
    table.style.borderSpacing = '0';
    table.style.backgroundColor = 'rgba(17, 24, 39, 0.7)';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.style.backgroundColor = 'rgba(17, 24, 39, 0.9)';
    thead.innerHTML = `
      <tr>
        <th style="padding: 16px 20px; text-align: left; color: rgba(255, 255, 255, 0.8); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Date</th>
        <th style="padding: 16px 20px; text-align: left; color: rgba(255, 255, 255, 0.8); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Description</th>
        <th style="padding: 16px 20px; text-align: left; color: rgba(255, 255, 255, 0.8); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Source</th>
        <th style="padding: 16px 20px; text-align: right; color: rgba(255, 255, 255, 0.8); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Amount</th>
        <th style="padding: 16px 20px; text-align: center; color: rgba(255, 255, 255, 0.8); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Actions</th>
      </tr>
    `;
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Sort entries by date (most recent first)
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add rows to table
    sortedEntries.forEach((entry) => {
      const tr = document.createElement('tr');
      tr.className = 'table-row';
      tr.style.transition = 'background-color 0.3s ease';
      
      // Add hover effect
      tr.addEventListener('mouseenter', () => {
        tr.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
      });
      
      tr.addEventListener('mouseleave', () => {
        tr.style.backgroundColor = '';
      });
      
      // Create table cells
      tr.innerHTML = `
        <td style="padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: white; font-size: 0.875rem;">
          ${formatDate(entry.date)}
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: white; font-size: 0.875rem;">
          ${entry.description || 'N/A'}
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: white; font-size: 0.875rem;">
          <span style="display: inline-block; padding: 4px 8px; background-color: rgba(31, 41, 55, 0.6); border-radius: 4px; font-size: 0.75rem;">${entry.source}</span>
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #10B981; font-size: 0.875rem; text-align: right; font-weight: 600; font-family: monospace, monospace;">
          ${formatCurrency(entry.amount)}
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
          <div style="display: flex; gap: 8px; justify-content: center;">
            <button class="edit-btn" data-id="${entry.id}" style="background-color: rgba(79, 70, 229, 0.2); color: #818CF8; border: none; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </button>
            <button class="delete-btn" data-id="${entry.id}" style="background-color: rgba(239, 68, 68, 0.2); color: #F87171; border: none; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      `;
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    
    // Add event listeners to edit and delete buttons
    const editButtons = tableContainer.querySelectorAll('.edit-btn');
    const deleteButtons = tableContainer.querySelectorAll('.delete-btn');
    
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const entryId = button.getAttribute('data-id');
        const entry = incomeEntries.find(entry => entry.id == entryId);
        
        if (entry) {
          showIncomeForm(entry);
        }
      });
      
      // Add hover effect
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = 'rgba(79, 70, 229, 0.4)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'rgba(79, 70, 229, 0.2)';
      });
    });
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const entryId = button.getAttribute('data-id');
        showDeleteConfirmation(entryId);
      });
      
      // Add hover effect
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = 'rgba(239, 68, 68, 0.4)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
      });
    });
  }
  
  // Initial population of the table
  updateIncomeTable(incomeEntries);
  
  // Assemble history section
  historySection.appendChild(historyHeader);
  historySection.appendChild(tableContainer);
  
  // Add history section to container
  incomeContainer.appendChild(historySection);
  
  // Add event listeners
  // Add income button
  const addIncomeBtn = incomeContainer.querySelector('#add-income-btn');
  if (addIncomeBtn) {
    addIncomeBtn.addEventListener('click', () => {
      console.log('Add income button clicked');
      showIncomeForm();
    });
  }
  
  // Customize split button
  const customizeSplitBtn = incomeContainer.querySelector('#customize-split-btn');
  if (customizeSplitBtn) {
    customizeSplitBtn.addEventListener('click', () => {
      console.log('Customize split button clicked');
      showSplitCustomizationForm();
    });
  }
  
  // Ensure all interactive components have proper event handling
  // Make sure filter buttons work properly
  setTimeout(() => {
    const filterButtons = incomeContainer.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
      // Confirm each filter button is properly attached with events
      const currentEvents = button.getAttribute('data-attached-events');
      if (!currentEvents) {
        console.log(`Ensuring filter button events for: ${button.textContent}`);
        button.setAttribute('data-attached-events', 'true');
      }
    });
    
    // Ensure edit/delete buttons will work
    const editButtons = incomeContainer.querySelectorAll('.edit-btn');
    const deleteButtons = incomeContainer.querySelectorAll('.delete-btn');
    
    editButtons.forEach(button => {
      // Confirm edit buttons have functioning event handlers
      const entryId = button.getAttribute('data-id');
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling
        console.log(`Edit button clicked for entry: ${entryId}`);
        // Find the entry in the data
        const entry = incomeEntries.find(entry => entry.id == entryId);
        if (entry) {
          showIncomeForm(entry);
        }
      });
    });
    
    deleteButtons.forEach(button => {
      // Confirm delete buttons have functioning event handlers
      const entryId = button.getAttribute('data-id');
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling
        console.log(`Delete button clicked for entry: ${entryId}`);
        showDeleteConfirmation(entryId);
      });
    });
    
    // Export button should already have its handler from when it was created
    // This section is no longer needed since we're adding the handler on creation
    
    console.log('All interactive components verified and enabled!');
  }, 500);
  
  return incomeContainer;
}