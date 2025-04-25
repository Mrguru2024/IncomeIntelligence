/**
 * Income management component for Stackr Finance
 * This module handles tracking and categorizing income based on the 40/30/30 split.
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

// Generate income data if not available
function getIncomeData() {
  if (!appState.incomeEntries || appState.incomeEntries.length === 0) {
    // Generate sample income data if none exists
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return [
      {
        id: 1,
        date: today.toISOString(),
        amount: 3500,
        source: 'Primary Job',
        description: 'Monthly salary',
        category: 'salary',
        splits: {
          needs: 1400,
          investments: 1050,
          savings: 1050
        }
      },
      {
        id: 2,
        date: today.toISOString(),
        amount: 500,
        source: 'Freelance',
        description: 'Website development',
        category: 'freelance',
        splits: {
          needs: 200,
          investments: 150,
          savings: 150
        }
      },
      {
        id: 3,
        date: lastMonth.toISOString(),
        amount: 3500,
        source: 'Primary Job',
        description: 'Monthly salary',
        category: 'salary',
        splits: {
          needs: 1400,
          investments: 1050,
          savings: 1050
        }
      }
    ];
  }
  
  return appState.incomeEntries;
}

// Save income entry to application state
function saveIncomeEntry(incomeEntry) {
  // Generate unique ID if not provided
  if (!incomeEntry.id) {
    incomeEntry.id = Date.now();
  }
  
  // Ensure app state has incomeEntries array
  if (!appState.incomeEntries) {
    appState.incomeEntries = [];
  }
  
  // If editing an existing entry, replace it
  const existingIndex = appState.incomeEntries.findIndex(entry => entry.id === incomeEntry.id);
  if (existingIndex !== -1) {
    appState.incomeEntries[existingIndex] = incomeEntry;
  } else {
    // Otherwise add as new entry
    appState.incomeEntries.push(incomeEntry);
  }
  
  // Calculate monthly income total
  updateMonthlyIncome();
  
  // Save to local storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('stackr-finance-state', JSON.stringify(appState));
      console.log('Income entry saved successfully');
    } catch (error) {
      console.error('Error saving income entry to localStorage:', error);
    }
  }
  
  return incomeEntry;
}

// Calculate and update monthly income
function updateMonthlyIncome() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Filter for current month's income
  const currentMonthIncome = appState.incomeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });
  
  // Calculate total
  const monthlyTotal = currentMonthIncome.reduce((sum, entry) => sum + entry.amount, 0);
  
  // Update app state
  if (!appState.income) {
    appState.income = { monthly: monthlyTotal };
  } else {
    appState.income.monthly = monthlyTotal;
  }
  
  return monthlyTotal;
}

// Delete income entry
function deleteIncomeEntry(entryId) {
  if (!appState.incomeEntries) return false;
  
  const initialLength = appState.incomeEntries.length;
  appState.incomeEntries = appState.incomeEntries.filter(entry => entry.id !== entryId);
  
  if (appState.incomeEntries.length < initialLength) {
    // Entry was deleted, update monthly total
    updateMonthlyIncome();
    
    // Save to local storage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('stackr-finance-state', JSON.stringify(appState));
        console.log('Income entry deleted successfully');
      } catch (error) {
        console.error('Error saving state to localStorage after deletion:', error);
      }
    }
    
    return true;
  }
  
  return false;
}

// Get user's split ratio
function getSplitRatio() {
  if (appState.user && appState.user.splitRatio) {
    return appState.user.splitRatio;
  }
  
  // Default 40/30/30 split
  return { 
    needs: 40, 
    investments: 30, 
    savings: 30 
  };
}

// Calculate split amounts based on income amount and user's split ratio
function calculateSplits(amount) {
  const splitRatio = getSplitRatio();
  
  const needs = Math.round((amount * splitRatio.needs) / 100);
  const investments = Math.round((amount * splitRatio.investments) / 100);
  
  // Handle rounding errors by calculating savings as the remainder
  const savings = amount - needs - investments;
  
  return {
    needs,
    investments,
    savings
  };
}

// Get income categories with icons
function getIncomeCategories() {
  return [
    { id: 'salary', name: 'Salary', icon: '💼' },
    { id: 'freelance', name: 'Freelance', icon: '🖥️' },
    { id: 'investment', name: 'Investment', icon: '📈' },
    { id: 'gift', name: 'Gift', icon: '🎁' },
    { id: 'refund', name: 'Refund', icon: '💸' },
    { id: 'other', name: 'Other', icon: '🔹' }
  ];
}

// Function to filter income entries based on time period
function filterIncomeEntries(filterValue) {
  const incomeEntries = appState.incomeEntries || [];
  const incomeEntriesContainer = document.getElementById('income-entries');
  if (!incomeEntriesContainer) return;
  
  let filteredEntries = [...incomeEntries];
  
  // Filter based on selected time period
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  if (filterValue === 'month') {
    filteredEntries = incomeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
  } else if (filterValue === 'year') {
    filteredEntries = incomeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === currentYear;
    });
  }
  
  // Get income categories
  const incomeCategories = getIncomeCategories();
  
  // Sort entries by date (newest first)
  filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Update table with filtered entries
  incomeEntriesContainer.innerHTML = filteredEntries.map((entry, index) => {
    const category = incomeCategories.find(cat => cat.id === entry.category) || { name: 'Other', icon: '🔹' };
    
    return `
      <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}" data-entry-id="${entry.id}">
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
          ${formatDate(entry.date)}
        </td>
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
          ${entry.source}
        </td>
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
          <span class="inline-flex items-center">
            <span class="mr-1">${category.icon}</span>
            ${category.name}
          </span>
        </td>
        <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
          ${formatCurrency(entry.amount)}
        </td>
        <td class="px-4 py-3 text-sm text-gray-900">
          <div class="flex flex-col">
            <div class="text-xs flex justify-between">
              <span>Needs:</span>
              <span>${formatCurrency(entry.splits.needs)}</span>
            </div>
            <div class="text-xs flex justify-between">
              <span>Investments:</span>
              <span>${formatCurrency(entry.splits.investments)}</span>
            </div>
            <div class="text-xs flex justify-between">
              <span>Savings:</span>
              <span>${formatCurrency(entry.splits.savings)}</span>
            </div>
          </div>
        </td>
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
          <button class="edit-income-btn text-blue-600 hover:text-blue-800 mr-3">
            Edit
          </button>
          <button class="delete-income-btn text-red-600 hover:text-red-800">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
  // No entries message
  if (filteredEntries.length === 0) {
    const tableContainer = incomeEntriesContainer.closest('.overflow-x-auto');
    const noEntriesContainer = document.createElement('div');
    noEntriesContainer.className = 'text-center py-8 text-gray-500';
    noEntriesContainer.innerHTML = `
      <p>No income entries found for the selected period</p>
      <button id="add-first-income-btn" class="mt-2 text-primary hover:underline">Add your first income</button>
    `;
    
    // Replace table with no entries message
    tableContainer.innerHTML = '';
    tableContainer.appendChild(noEntriesContainer);
  }
  
  // Reattach event listeners to buttons
  const newEditButtons = document.querySelectorAll('.edit-income-btn');
  newEditButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const entryId = parseInt(row.dataset.entryId, 10);
      const entry = incomeEntries.find(e => e.id === entryId);
      
      if (entry) {
        editIncomeEntry(entry);
      }
    });
  });
  
  const newDeleteButtons = document.querySelectorAll('.delete-income-btn');
  newDeleteButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const entryId = parseInt(row.dataset.entryId, 10);
      
      if (confirm('Are you sure you want to delete this income entry?')) {
        const success = deleteIncomeEntry(entryId);
        if (success) {
          filterIncomeEntries(filterValue); // Refresh the list
        }
      }
    });
  });
  
  return filteredEntries;
}

// Helper function to edit an income entry
function editIncomeEntry(entry) {
  const modal = document.getElementById('income-modal');
  const modalTitle = document.getElementById('modal-title');
  const form = document.getElementById('income-form');
  const idInput = document.getElementById('income-id');
  const dateInput = document.getElementById('income-date');
  const amountInput = document.getElementById('income-amount');
  const sourceInput = document.getElementById('income-source');
  const descriptionInput = document.getElementById('income-description');
  const categoryInput = document.getElementById('income-category');
  
  // Set form values
  idInput.value = entry.id;
  dateInput.valueAsDate = new Date(entry.date);
  amountInput.value = entry.amount;
  sourceInput.value = entry.source;
  descriptionInput.value = entry.description || '';
  categoryInput.value = entry.category;
  
  // Update split preview
  updateSplitPreview(entry.amount);
  
  // Update modal title
  modalTitle.textContent = 'Edit Income';
  
  // Show modal
  modal.classList.remove('hidden');
}

// Helper function to update split preview
function updateSplitPreview(amount) {
  const splits = calculateSplits(parseFloat(amount) || 0);
  
  document.getElementById('preview-needs').textContent = formatCurrency(splits.needs);
  document.getElementById('preview-investments').textContent = formatCurrency(splits.investments);
  document.getElementById('preview-savings').textContent = formatCurrency(splits.savings);
}

// Function to handle edit income button clicks
function handleEditIncome(event) {
  const entryId = event.target.dataset.id || event.target.closest('tr').dataset.entryId;
  const entry = appState.incomeEntries.find(e => e.id == entryId);
  
  if (entry) {
    editIncomeEntry(entry);
  }
}

// Function to handle delete income button clicks
function handleDeleteIncome(event) {
  const entryId = event.target.dataset.id || event.target.closest('tr').dataset.entryId;
  
  if (confirm('Are you sure you want to delete this income entry?')) {
    const success = deleteIncomeEntry(parseInt(entryId, 10));
    if (success) {
      // Refresh the view based on current view type
      const currentFilter = document.getElementById('income-filter').value;
      filterIncomeEntries(currentFilter);
    }
  }
}

export function renderIncomePage(userId) {
  // Create ultra-modern container with dark theme
  const incomeContainer = document.createElement('div');
  incomeContainer.className = 'income-container';
  incomeContainer.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  
  // Add cyberpunk/futuristic theme to the page
  const pageTheme = document.createElement('style');
  pageTheme.textContent = `
    .income-container {
      --theme-primary: #4F46E5;
      --theme-primary-dark: #4338CA;
      --theme-secondary: #10B981;
      --theme-accent: #F59E0B;
      --theme-dark: #111827;
      --theme-dark-mid: #1F2937;
      --theme-dark-light: #374151;
      --glow-blue: 0 0 15px rgba(79, 70, 229, 0.5);
      --glow-green: 0 0 15px rgba(16, 185, 129, 0.5);
      --glow-yellow: 0 0 15px rgba(245, 158, 11, 0.5);
      color-scheme: dark;
      background-color: var(--theme-dark);
      color: white;
      position: relative;
      z-index: 0;
      overflow: hidden;
      padding-bottom: 2rem;
    }
    
    /* Futuristic header gradient */
    .income-header {
      background: linear-gradient(120deg, var(--theme-dark-mid), var(--theme-dark-light));
      border-radius: 12px;
      border-left: 2px solid var(--theme-primary);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      position: relative;
      overflow: hidden;
    }
    
    .income-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.7), transparent);
    }
    
    .income-card {
      background-color: var(--theme-dark-mid);
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .income-card::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to right bottom, rgba(255,255,255,0.03), transparent 40%);
      z-index: 1;
      pointer-events: none;
    }
    
    .income-card:hover {
      transform: translateY(-5px);
    }
    
    /* Futuristic neon borders and glows */
    .neon-border-blue {
      box-shadow: var(--glow-blue);
      border: 1px solid rgba(79, 70, 229, 0.5);
    }
    
    .neon-border-green {
      box-shadow: var(--glow-green);
      border: 1px solid rgba(16, 185, 129, 0.5);
    }
    
    .neon-border-yellow {
      box-shadow: var(--glow-yellow);
      border: 1px solid rgba(245, 158, 11, 0.5);
    }
    
    /* Digital circuit background */
    .circuit-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.05)' fill-rule='evenodd'/%3E%3C/svg%3E");
      z-index: -1;
      opacity: 0.3;
    }
    
    /* Glowing button */
    .glow-button {
      background-color: var(--theme-primary);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
      z-index: 1;
      text-transform: uppercase;
      font-size: 0.875rem;
    }
    
    .glow-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: all 0.6s;
      z-index: -1;
    }
    
    .glow-button:hover::before {
      left: 100%;
    }
    
    .glow-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(79, 70, 229, 0.4);
    }
    
    /* Animations */
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    
    @keyframes circuit-flow {
      0% { opacity: 0.1; }
      50% { opacity: 0.3; }
      100% { opacity: 0.1; }
    }
    
    .circuit-overlay {
      animation: circuit-flow 10s infinite;
    }
    
    .pulse-soft {
      animation: pulse 3s infinite ease-in-out;
    }
    
    .float-animation {
      animation: float 6s infinite ease-in-out;
    }
    
    /* Responsive data grid */
    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .hoverable-card {
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .hoverable-card:hover {
      transform: scale(1.02);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    
    .income-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 1rem;
    }
    
    .income-table th {
      background-color: rgba(31, 41, 55, 0.8);
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      padding: 1rem;
      text-align: left;
    }
    
    .income-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .income-table tr:hover td {
      background-color: rgba(79, 70, 229, 0.1);
    }
    
    .income-table tr:last-child td {
      border-bottom: none;
    }
    
    /* Progress bars */
    .progress-bar {
      height: 8px;
      border-radius: 4px;
      background-color: rgba(255, 255, 255, 0.1);
      overflow: hidden;
      position: relative;
    }
    
    .progress-value {
      height: 100%;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--theme-primary), var(--theme-primary-dark));
      position: relative;
      transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .progress-value::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.15) 50%, 
        transparent 100%);
      animation: progress-shine 2s infinite;
    }
    
    @keyframes progress-shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
  document.head.appendChild(pageTheme);
  
  // Add circuit overlay
  const circuitOverlay = document.createElement('div');
  circuitOverlay.className = 'circuit-overlay';
  incomeContainer.appendChild(circuitOverlay);
  
  // Get income data and categories
  const incomeEntries = getIncomeData();
  const incomeCategories = getIncomeCategories();
  
  // Get appState from window if available
  const appState = window.appState || { income: { monthly: 0 } };
  
  // Calculate total and monthly income
  const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const monthlyIncome = appState.income?.monthly || updateMonthlyIncome();
  
  // Split ratio
  const splitRatio = getSplitRatio();
  
  // Futuristic header section
  const header = document.createElement('header');
  header.className = 'income-header mb-6';
  
  // Add glowing border animation
  const headerGlow = document.createElement('div');
  headerGlow.className = 'absolute bottom-0 left-0 w-full h-[2px]';
  headerGlow.style.background = 'linear-gradient(90deg, transparent, var(--theme-primary), transparent)';
  headerGlow.style.animation = 'pulse 4s infinite ease-in-out';
  header.appendChild(headerGlow);
  
  // Header content
  const headerContent = document.createElement('div');
  headerContent.className = 'flex flex-col md:flex-row md:items-center md:justify-between relative z-10';
  
  // Title section with futuristic styling
  const titleSection = document.createElement('div');
  titleSection.innerHTML = `
    <div class="flex items-center">
      <div class="mr-3 bg-indigo-600 p-2 rounded-lg" style="box-shadow: var(--glow-blue);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-white" style="text-shadow: 0 0 10px rgba(79, 70, 229, 0.3);">
          Income Command Center
        </h1>
        <div class="flex items-center">
          <div class="h-1 w-1 bg-green-500 rounded-full mr-2 pulse-soft"></div>
          <p class="text-indigo-200">40/30/30 Split Management System</p>
        </div>
      </div>
    </div>
  `;
  
  // Button section
  const buttonSection = document.createElement('div'); 
  buttonSection.className = 'mt-4 md:mt-0';
  
  // Create glowing add button
  const addButton = document.createElement('button');
  addButton.id = 'add-income-btn';
  addButton.className = 'glow-button';
  addButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block mr-1">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Record Income
  `;
  
  buttonSection.appendChild(addButton);
  
  // Assemble header
  headerContent.appendChild(titleSection);
  headerContent.appendChild(buttonSection);
  header.appendChild(headerContent);
  incomeContainer.appendChild(header);
  
  // Summary cards
  const summarySection = document.createElement('section');
  summarySection.className = 'summary-cards grid grid-cols-1 md:grid-cols-3 gap-4 mb-8';
  
  // Monthly income card with futuristic design
  const monthlyCard = document.createElement('div');
  monthlyCard.className = 'card bg-gradient-to-br from-indigo-900 to-purple-900 p-5 rounded-lg shadow-lg border border-indigo-500/20 relative overflow-hidden';
  
  // Add subtle animated background pattern
  const patternOverlay = document.createElement('div');
  patternOverlay.className = 'absolute inset-0 opacity-10';
  patternOverlay.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M15 0C6.716 0 0 6.716 0 15c0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15zm0 5c5.514 0 10 4.486 10 10s-4.486 10-10 10S5 20.514 5 15 9.486 5 15 5z\' fill=\'%23FFF\' fill-opacity=\'.5\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")';
  monthlyCard.appendChild(patternOverlay);
  
  // Create card content
  const cardContent = document.createElement('div');
  cardContent.className = 'relative z-10';
  cardContent.innerHTML = `
    <div class="card-header mb-3">
      <h3 class="text-lg font-semibold text-white flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        Monthly Income
      </h3>
    </div>
    <div class="card-value text-3xl font-bold text-white bg-white/10 rounded-lg px-4 py-3 inline-block">
      ${formatCurrency(monthlyIncome)}
    </div>
    <div class="text-sm text-indigo-200 mt-2 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      Current month
    </div>
  `;
  monthlyCard.appendChild(cardContent);
  
  // Add pulsing animation
  const pulseEffect = document.createElement('div');
  pulseEffect.className = 'absolute inset-0 pulse-effect opacity-0';
  pulseEffect.style.background = 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)';
  monthlyCard.appendChild(pulseEffect);
  
  // Add animation style
  const pulseAnimation = document.createElement('style');
  pulseAnimation.textContent = `
    @keyframes pulse {
      0% { opacity: 0; transform: scale(0.95); }
      50% { opacity: 0.2; }
      100% { opacity: 0; transform: scale(1.05); }
    }
    .pulse-effect {
      animation: pulse 3s infinite;
    }
  `;
  document.head.appendChild(pulseAnimation);
  
  // Split allocation card with enhanced visualization - futuristic design
  const splitCard = document.createElement('div');
  splitCard.className = 'card bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg shadow-lg border border-slate-700';
  
  const cardHeader = document.createElement('div');
  cardHeader.className = 'card-header mb-4 flex justify-between items-center';
  cardHeader.innerHTML = `
    <h3 class="text-lg font-semibold text-white">Split Allocation</h3>
    <div class="px-3 py-1 text-sm bg-indigo-600 text-white cursor-pointer rounded-full transform hover:scale-105 transition-all duration-300 flex items-center gap-1" id="customize-ratio-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> 
      Customize
    </div>
  `;
  splitCard.appendChild(cardHeader);
  
  // Create a highly interactive advanced split visualization with holographic style
  const visualizationContainer = document.createElement('div');
  visualizationContainer.className = 'mt-4 mb-6 relative';
  
  // Add holographic effect overlay
  const holoEffect = document.createElement('div');
  holoEffect.className = 'absolute inset-0 pointer-events-none';
  holoEffect.style.background = 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)';
  holoEffect.style.backgroundSize = '10px 100%';
  holoEffect.style.zIndex = '5';
  visualizationContainer.appendChild(holoEffect);
  
  // Add stacked visualization elements
  const barBackground = document.createElement('div');
  barBackground.className = 'bg-gray-800/50 rounded-lg p-4';
  barBackground.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.5)';
  
  // Create the animated split bar
  const barContainer = document.createElement('div');
  barContainer.className = 'flex mt-1 relative h-16 rounded-lg overflow-hidden shadow-xl';
  
  // Create advanced connector lines
  const connectorLines = document.createElement('div');
  connectorLines.className = 'absolute inset-0 pointer-events-none';
  connectorLines.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'connectPattern\' patternUnits=\'userSpaceOnUse\' width=\'40\' height=\'40\' patternTransform=\'rotate(45)\'%3E%3Cline x1=\'0\' y1=\'0\' x2=\'40\' y2=\'0\' stroke=\'%23ffffff10\' stroke-width=\'1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23connectPattern)\'/%3E%3C/svg%3E")';
  barContainer.appendChild(connectorLines);
  
  // Needs bar section 
  const needsBar = document.createElement('div');
  needsBar.className = 'interactive-bar needs-bar';
  needsBar.style.width = `${splitRatio.needs}%`;
  needsBar.style.background = 'linear-gradient(135deg, #00E676 0%, #00796B 100%)';
  needsBar.style.position = 'relative';
  needsBar.style.overflow = 'hidden';
  needsBar.style.height = '100%';
  needsBar.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  needsBar.style.borderRight = '1px solid rgba(255,255,255,0.2)';
  needsBar.style.boxShadow = '0 0 15px rgba(0, 230, 118, 0.3)';
  
  // Holographic label
  const needsLabel = document.createElement('div');
  needsLabel.className = 'absolute inset-0 flex items-center justify-center z-10';
  needsLabel.innerHTML = `
    <div class="text-center">
      <div class="text-white text-sm font-bold" style="text-shadow: 0 0 5px rgba(0, 230, 118, 0.8);">${splitRatio.needs}%</div>
      <div class="text-white/75 text-xs">NEEDS</div>
    </div>
  `;
  needsBar.appendChild(needsLabel);
  
  // Animated flow effect
  const needsFlow = document.createElement('div');
  needsFlow.className = 'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent';
  needsFlow.style.animation = 'flow 3s infinite';
  needsFlow.style.width = '50%';
  needsFlow.style.transform = 'skewX(45deg)';
  needsBar.appendChild(needsFlow);
  
  // Digital particles
  const needsParticles = document.createElement('div');
  needsParticles.className = 'absolute inset-0';
  needsParticles.style.backgroundImage = 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)';
  needsParticles.style.backgroundSize = '10px 10px';
  needsParticles.style.opacity = '0.5';
  needsBar.appendChild(needsParticles);
  
  // Investments bar section with similar effects 
  const investmentsBar = document.createElement('div');
  investmentsBar.className = 'interactive-bar investments-bar';
  investmentsBar.style.width = `${splitRatio.investments}%`;
  investmentsBar.style.background = 'linear-gradient(135deg, #2196F3 0%, #303F9F 100%)';
  investmentsBar.style.position = 'relative';
  investmentsBar.style.overflow = 'hidden';
  investmentsBar.style.height = '100%';
  investmentsBar.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  investmentsBar.style.borderRight = '1px solid rgba(255,255,255,0.2)';
  investmentsBar.style.boxShadow = '0 0 15px rgba(33, 150, 243, 0.3)';
  
  // Holographic label
  const investmentsLabel = document.createElement('div');
  investmentsLabel.className = 'absolute inset-0 flex items-center justify-center z-10';
  investmentsLabel.innerHTML = `
    <div class="text-center">
      <div class="text-white text-sm font-bold" style="text-shadow: 0 0 5px rgba(33, 150, 243, 0.8);">${splitRatio.investments}%</div>
      <div class="text-white/75 text-xs">INVEST</div>
    </div>
  `;
  investmentsBar.appendChild(investmentsLabel);
  
  // Animated flow effect
  const investmentsFlow = document.createElement('div');
  investmentsFlow.className = 'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent';
  investmentsFlow.style.animation = 'flow 3s infinite';
  investmentsFlow.style.animationDelay = '0.5s';
  investmentsFlow.style.width = '50%';
  investmentsFlow.style.transform = 'skewX(45deg)';
  investmentsBar.appendChild(investmentsFlow);
  
  // Digital particles
  const investmentsParticles = document.createElement('div');
  investmentsParticles.className = 'absolute inset-0';
  investmentsParticles.style.backgroundImage = 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)';
  investmentsParticles.style.backgroundSize = '10px 10px';
  investmentsParticles.style.opacity = '0.5';
  investmentsBar.appendChild(investmentsParticles);
  
  // Savings bar section with similar effects
  const savingsBar = document.createElement('div');
  savingsBar.className = 'interactive-bar savings-bar';
  savingsBar.style.width = `${splitRatio.savings}%`;
  savingsBar.style.background = 'linear-gradient(135deg, #FFC107 0%, #E65100 100%)';
  savingsBar.style.position = 'relative';
  savingsBar.style.overflow = 'hidden';
  savingsBar.style.height = '100%';
  savingsBar.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  savingsBar.style.boxShadow = '0 0 15px rgba(255, 193, 7, 0.3)';
  
  // Holographic label
  const savingsLabel = document.createElement('div');
  savingsLabel.className = 'absolute inset-0 flex items-center justify-center z-10';
  savingsLabel.innerHTML = `
    <div class="text-center">
      <div class="text-white text-sm font-bold" style="text-shadow: 0 0 5px rgba(255, 193, 7, 0.8);">${splitRatio.savings}%</div>
      <div class="text-white/75 text-xs">SAVE</div>
    </div>
  `;
  savingsBar.appendChild(savingsLabel);
  
  // Animated flow effect
  const savingsFlow = document.createElement('div');
  savingsFlow.className = 'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent';
  savingsFlow.style.animation = 'flow 3s infinite';
  savingsFlow.style.animationDelay = '1s';
  savingsFlow.style.width = '50%';
  savingsFlow.style.transform = 'skewX(45deg)';
  savingsBar.appendChild(savingsFlow);
  
  // Digital particles
  const savingsParticles = document.createElement('div');
  savingsParticles.className = 'absolute inset-0';
  savingsParticles.style.backgroundImage = 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)';
  savingsParticles.style.backgroundSize = '10px 10px';
  savingsParticles.style.opacity = '0.5';
  savingsBar.appendChild(savingsParticles);
  
  // Add the bar sections to the container
  barContainer.appendChild(needsBar);
  barContainer.appendChild(investmentsBar);
  barContainer.appendChild(savingsBar);
  
  // Add interactive hover effects
  const interactiveBarStyles = document.createElement('style');
  interactiveBarStyles.textContent = `
    .interactive-bar {
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .interactive-bar:hover {
      transform: translateY(-5px);
      filter: brightness(1.3);
      z-index: 10;
    }
    .interactive-bar:active {
      transform: translateY(-2px);
    }
    @keyframes pulse-border {
      0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
      70% { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
      100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
    }
  `;
  document.head.appendChild(interactiveBarStyles);
  
  // Add scale markers below the bar
  const scaleMarkers = document.createElement('div');
  scaleMarkers.className = 'flex justify-between mt-1 px-2';
  scaleMarkers.innerHTML = `
    <div class="text-xs text-indigo-300">0%</div>
    <div class="text-xs text-indigo-300">25%</div>
    <div class="text-xs text-indigo-300">50%</div>
    <div class="text-xs text-indigo-300">75%</div>
    <div class="text-xs text-indigo-300">100%</div>
  `;
  
  // Assemble the visualization
  barBackground.appendChild(barContainer);
  barBackground.appendChild(scaleMarkers);
  visualizationContainer.appendChild(barBackground);
  
  // Add the container to the split card
  splitCard.appendChild(visualizationContainer);
  
  // Add flowing animation styles
  const animationStyle = document.createElement('style');
  animationStyle.textContent = `
    @keyframes flow {
      0% { transform: translateX(-100%) skewX(15deg); }
      100% { transform: translateX(200%) skewX(15deg); }
    }
    .glow-effect {
      width: 30%;
      height: 100%;
      transform: skewX(15deg);
      animation: flow 3s infinite;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    }
    .split-bar:hover {
      filter: brightness(1.2);
      transform: translateY(-2px);
      transition: all 0.3s ease;
    }
  `;
  document.head.appendChild(animationStyle);
  
  splitCard.appendChild(barContainer);
  
  // Create futuristic 3D-style allocation cards
  const monthlySplits = calculateSplits(monthlyIncome);
  
  // Container with 3D effect
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'grid grid-cols-3 gap-4 mt-8 pb-4';
  
  // Needs Category Card - Holographic style
  const needsCard = document.createElement('div');
  needsCard.className = 'hoverable-card relative income-card overflow-hidden';
  needsCard.style.background = 'linear-gradient(135deg, rgba(0, 230, 118, 0.1), rgba(0, 121, 107, 0.3))';
  needsCard.style.borderRadius = '12px';
  needsCard.style.border = '1px solid rgba(0, 230, 118, 0.3)';
  needsCard.style.boxShadow = 'var(--glow-green)';
  
  // Add pattern background
  const needsPattern = document.createElement('div');
  needsPattern.className = 'absolute inset-0 z-0 opacity-10';
  needsPattern.style.backgroundImage = 'radial-gradient(rgba(0, 230, 118, 0.4) 1px, transparent 1px)';
  needsPattern.style.backgroundSize = '20px 20px';
  needsCard.appendChild(needsPattern);
  
  // Add top glowing border
  const needsGlowBorder = document.createElement('div');
  needsGlowBorder.className = 'absolute top-0 left-0 right-0 h-[1px]';
  needsGlowBorder.style.background = 'linear-gradient(90deg, transparent, #00E676, transparent)';
  needsCard.appendChild(needsGlowBorder);
  
  // Card content
  const needsContent = document.createElement('div');
  needsContent.className = 'relative z-10 p-4 text-center';
  needsContent.innerHTML = `
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center">
        <div class="h-2 w-2 rounded-full bg-green-400 mr-2 pulse-soft"></div>
        <h3 class="text-white text-md uppercase tracking-wider font-medium">Needs</h3>
      </div>
      <div class="text-green-400 text-sm font-medium">${splitRatio.needs}%</div>
    </div>
    <div class="text-2xl font-bold text-white mb-1" style="text-shadow: 0 0 10px rgba(0, 230, 118, 0.5)">
      ${formatCurrency(monthlySplits.needs)}
    </div>
    <div class="text-xs text-green-300 mb-3">Monthly allocation</div>
    <div class="progress-bar mb-3">
      <div class="progress-value" style="width: ${splitRatio.needs}%; background: linear-gradient(90deg, #00E676, #00C853);"></div>
    </div>
    <div class="flex justify-between text-xs text-gray-400">
      <div>Essential expenses</div>
      <div>Bills, housing, food</div>
    </div>
  `;
  needsCard.appendChild(needsContent);
  
  // Investments Category Card - with similar style
  const investmentsCard = document.createElement('div');
  investmentsCard.className = 'hoverable-card relative income-card overflow-hidden';
  investmentsCard.style.background = 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(48, 63, 159, 0.3))';
  investmentsCard.style.borderRadius = '12px';
  investmentsCard.style.border = '1px solid rgba(33, 150, 243, 0.3)';
  investmentsCard.style.boxShadow = 'var(--glow-blue)';
  
  // Add pattern background
  const investmentsPattern = document.createElement('div');
  investmentsPattern.className = 'absolute inset-0 z-0 opacity-10';
  investmentsPattern.style.backgroundImage = 'radial-gradient(rgba(33, 150, 243, 0.4) 1px, transparent 1px)';
  investmentsPattern.style.backgroundSize = '20px 20px';
  investmentsCard.appendChild(investmentsPattern);
  
  // Add top glowing border
  const investmentsGlowBorder = document.createElement('div');
  investmentsGlowBorder.className = 'absolute top-0 left-0 right-0 h-[1px]';
  investmentsGlowBorder.style.background = 'linear-gradient(90deg, transparent, #2196F3, transparent)';
  investmentsCard.appendChild(investmentsGlowBorder);
  
  // Card content
  const investmentsContent = document.createElement('div');
  investmentsContent.className = 'relative z-10 p-4 text-center';
  investmentsContent.innerHTML = `
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center">
        <div class="h-2 w-2 rounded-full bg-blue-400 mr-2 pulse-soft"></div>
        <h3 class="text-white text-md uppercase tracking-wider font-medium">Investments</h3>
      </div>
      <div class="text-blue-400 text-sm font-medium">${splitRatio.investments}%</div>
    </div>
    <div class="text-2xl font-bold text-white mb-1" style="text-shadow: 0 0 10px rgba(33, 150, 243, 0.5)">
      ${formatCurrency(monthlySplits.investments)}
    </div>
    <div class="text-xs text-blue-300 mb-3">Monthly allocation</div>
    <div class="progress-bar mb-3">
      <div class="progress-value" style="width: ${splitRatio.investments}%; background: linear-gradient(90deg, #2196F3, #1565C0);"></div>
    </div>
    <div class="flex justify-between text-xs text-gray-400">
      <div>Growth capital</div>
      <div>Stocks, crypto, funds</div>
    </div>
  `;
  investmentsCard.appendChild(investmentsContent);
  
  // Savings Category Card - with similar style
  const savingsCard = document.createElement('div');
  savingsCard.className = 'hoverable-card relative income-card overflow-hidden';
  savingsCard.style.background = 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(230, 81, 0, 0.3))';
  savingsCard.style.borderRadius = '12px';
  savingsCard.style.border = '1px solid rgba(255, 193, 7, 0.3)';
  savingsCard.style.boxShadow = 'var(--glow-yellow)';
  
  // Add pattern background
  const savingsPattern = document.createElement('div');
  savingsPattern.className = 'absolute inset-0 z-0 opacity-10';
  savingsPattern.style.backgroundImage = 'radial-gradient(rgba(255, 193, 7, 0.4) 1px, transparent 1px)';
  savingsPattern.style.backgroundSize = '20px 20px';
  savingsCard.appendChild(savingsPattern);
  
  // Add top glowing border
  const savingsGlowBorder = document.createElement('div');
  savingsGlowBorder.className = 'absolute top-0 left-0 right-0 h-[1px]';
  savingsGlowBorder.style.background = 'linear-gradient(90deg, transparent, #FFC107, transparent)';
  savingsCard.appendChild(savingsGlowBorder);
  
  // Card content
  const savingsContent = document.createElement('div');
  savingsContent.className = 'relative z-10 p-4 text-center';
  savingsContent.innerHTML = `
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center">
        <div class="h-2 w-2 rounded-full bg-yellow-400 mr-2 pulse-soft"></div>
        <h3 class="text-white text-md uppercase tracking-wider font-medium">Savings</h3>
      </div>
      <div class="text-yellow-400 text-sm font-medium">${splitRatio.savings}%</div>
    </div>
    <div class="text-2xl font-bold text-white mb-1" style="text-shadow: 0 0 10px rgba(255, 193, 7, 0.5)">
      ${formatCurrency(monthlySplits.savings)}
    </div>
    <div class="text-xs text-yellow-300 mb-3">Monthly allocation</div>
    <div class="progress-bar mb-3">
      <div class="progress-value" style="width: ${splitRatio.savings}%; background: linear-gradient(90deg, #FFC107, #FF8F00);"></div>
    </div>
    <div class="flex justify-between text-xs text-gray-400">
      <div>Financial security</div>
      <div>Emergency, goals</div>
    </div>
  `;
  savingsCard.appendChild(savingsContent);
  
  // Add cards to the container
  detailsContainer.appendChild(needsCard);
  detailsContainer.appendChild(investmentsCard);
  detailsContainer.appendChild(savingsCard);
  splitCard.appendChild(detailsContainer);
  
  // Add a toggle button to switch between bar and pie visualization (to be implemented)
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'flex justify-end mt-2';
  toggleContainer.innerHTML = `
    <div class="flex text-xs bg-gray-100 rounded-md overflow-hidden">
      <button id="view-bar" class="px-2 py-1 bg-primary text-white">Bar</button>
      <button id="view-pie" class="px-2 py-1 text-gray-700 hover:bg-gray-200">Pie</button>
    </div>
  `;
  splitCard.appendChild(toggleContainer);
  
  // Add event listeners after the card is appended to the DOM
  setTimeout(() => {
    // Customize ratio button
    const customizeBtn = document.getElementById('customize-ratio-btn');
    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => {
        // Show ratio customization modal (to be implemented)
        alert('Ratio customization coming soon! Current split: ' + 
              `Needs: ${splitRatio.needs}%, Investments: ${splitRatio.investments}%, Savings: ${splitRatio.savings}%`);
      });
    }
    
    // View toggle buttons
    const barBtn = document.getElementById('view-bar');
    const pieBtn = document.getElementById('view-pie');
    
    if (barBtn && pieBtn) {
      barBtn.addEventListener('click', () => {
        barBtn.classList.add('bg-primary', 'text-white');
        barBtn.classList.remove('text-gray-700', 'hover:bg-gray-200');
        pieBtn.classList.remove('bg-primary', 'text-white');
        pieBtn.classList.add('text-gray-700', 'hover:bg-gray-200');
        // Show bar view (already visible by default)
      });
      
      pieBtn.addEventListener('click', () => {
        pieBtn.classList.add('bg-primary', 'text-white');
        pieBtn.classList.remove('text-gray-700', 'hover:bg-gray-200');
        barBtn.classList.remove('bg-primary', 'text-white');
        barBtn.classList.add('text-gray-700', 'hover:bg-gray-200');
        // Show pie chart visualization (to be implemented)
        alert('Pie chart visualization coming soon!');
      });
    }
  }, 100);
  
  
  // This month's splits card - futuristic theme
  const monthSplitCard = document.createElement('div');
  monthSplitCard.className = 'card bg-gradient-to-r from-slate-800 to-slate-900 p-5 rounded-lg shadow-lg border border-indigo-900/30';
  
  // Monthly splits were already calculated above, reuse that variable
  
  // Create card contents
  const splitCardHeader = document.createElement('div');
  splitCardHeader.className = 'card-header mb-3';
  splitCardHeader.innerHTML = `
    <h3 class="text-lg font-semibold text-white flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
      This Month's Splits
    </h3>
  `;
  monthSplitCard.appendChild(splitCardHeader);
  
  // Create animated cards for each category
  const splitCardsContainer = document.createElement('div');
  splitCardsContainer.className = 'grid grid-cols-3 gap-3';
  
  // Needs Card
  const needsCard = document.createElement('div');
  needsCard.className = 'relative rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:z-10';
  needsCard.innerHTML = `
    <div class="absolute inset-0 bg-gradient-to-br from-green-500 to-green-700 opacity-90"></div>
    <div class="relative p-3 text-center">
      <div class="text-sm font-medium text-white">Needs</div>
      <div class="text-xl font-bold text-white mt-1">${formatCurrency(monthlySplits.needs)}</div>
      <div class="text-xs text-white/80 mt-1">${splitRatio.needs}% of income</div>
    </div>
  `;
  splitCardsContainer.appendChild(needsCard);
  
  // Investments Card
  const investmentsCard = document.createElement('div');
  investmentsCard.className = 'relative rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:z-10';
  investmentsCard.innerHTML = `
    <div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 opacity-90"></div>
    <div class="relative p-3 text-center">
      <div class="text-sm font-medium text-white">Investments</div>
      <div class="text-xl font-bold text-white mt-1">${formatCurrency(monthlySplits.investments)}</div>
      <div class="text-xs text-white/80 mt-1">${splitRatio.investments}% of income</div>
    </div>
  `;
  splitCardsContainer.appendChild(investmentsCard);
  
  // Savings Card
  const savingsCard = document.createElement('div');
  savingsCard.className = 'relative rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:z-10';
  savingsCard.innerHTML = `
    <div class="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-700 opacity-90"></div>
    <div class="relative p-3 text-center">
      <div class="text-sm font-medium text-white">Savings</div>
      <div class="text-xl font-bold text-white mt-1">${formatCurrency(monthlySplits.savings)}</div>
      <div class="text-xs text-white/80 mt-1">${splitRatio.savings}% of income</div>
    </div>
  `;
  splitCardsContainer.appendChild(savingsCard);
  
  monthSplitCard.appendChild(splitCardsContainer);
  
  summarySection.appendChild(monthlyCard);
  summarySection.appendChild(splitCard);
  summarySection.appendChild(monthSplitCard);
  incomeContainer.appendChild(summarySection);
  
  // Futuristic Income history section
  const historySection = document.createElement('section');
  historySection.className = 'income-history mb-8';
  
  // Create container with cyberpunk styling
  const historyContainer = document.createElement('div');
  historyContainer.className = 'mt-12 relative';
  
  // Add cyberpunk container styling
  historyContainer.style.background = 'linear-gradient(to bottom, rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.95))';
  historyContainer.style.borderRadius = '16px';
  historyContainer.style.overflow = 'hidden';
  historyContainer.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(79, 70, 229, 0.2)';
  historyContainer.style.border = '1px solid rgba(79, 70, 229, 0.2)';
  historyContainer.style.padding = '1.5rem';
  
  // Add digital circuits background
  const circuitBg = document.createElement('div');
  circuitBg.className = 'absolute inset-0 z-0 opacity-5';
  circuitBg.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zm20.97 0l9.315 9.314-1.414 1.414L34.828 0h2.83zM22.344 0L13.03 9.314l1.414 1.414L25.172 0h-2.83zM32 0l12.142 12.142-1.414 1.414L30 .828 17.272 13.556l-1.414-1.414L28 0h4zM.284 0l28 28-1.414 1.414L0 2.544V0h.284zM0 5.373l25.456 25.455-1.414 1.415L0 8.2V5.374zm0 5.656l22.627 22.627-1.414 1.414L0 13.86v-2.83zm0 5.656l19.8 19.8-1.415 1.413L0 19.514v-2.83zm0 5.657l16.97 16.97-1.414 1.415L0 25.172v-2.83zM0 28l14.142 14.142-1.414 1.414L0 30.828V28zm0 5.657L11.314 44.97l-1.414 1.414L0 36.485v-2.83zm0 5.657L8.485 47.8l-1.414 1.414L0 42.143v-2.83zm0 5.657l5.657 5.657-1.414 1.415L0 47.8v-2.83zm0 5.657l2.828 2.83-1.414 1.413L0 53.456v-2.83zM54.627 60L30 35.373 5.373 60H8.2L30 38.2 51.8 60h2.827zm-5.656 0L30 41.03 11.03 60h2.828L30 43.858 46.142 60h2.83zm-5.656 0L30 46.686 16.686 60h2.83L30 49.515 40.485 60h2.83zm-5.657 0L30 52.343 22.344 60h2.83L30 55.172 34.828 60h2.83zM32 60l-2-2-2 2h4zM59.716 0l-28 28 1.414 1.414L60 2.544V0h-.284zM60 5.373L34.544 30.828l1.414 1.415L60 8.2V5.374zm0 5.656L37.373 33.656l1.414 1.414L60 13.86v-2.83zm0 5.656l-19.8 19.8 1.415 1.413L60 19.514v-2.83zm0 5.657l-16.97 16.97 1.414 1.415L60 25.172v-2.83zM60 28L45.858 42.142l1.414 1.414L60 30.828V28zm0 5.657L48.686 44.97l1.414 1.414L60 36.485v-2.83zm0 5.657L51.515 47.8l1.414 1.414L60 42.143v-2.83zm0 5.657l-5.657 5.657 1.414 1.415L60 47.8v-2.83zm0 5.657l-2.828 2.83 1.414 1.413L60 53.456v-2.83zM39.9 16.385l1.414-1.414L30 3.658 18.686 14.97l1.415 1.415 9.9-9.9 9.9 9.9zm-2.83 2.828l1.415-1.414L30 9.313 21.515 17.8l1.414 1.413L30 11.9l7.07 7.07z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")';
  historyContainer.appendChild(circuitBg);
  
  // Add glowing edges
  const topGlow = document.createElement('div');
  topGlow.className = 'absolute top-0 left-0 right-0 h-[1px]';
  topGlow.style.background = 'linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.7), transparent)';
  historyContainer.appendChild(topGlow);
  
  const leftGlow = document.createElement('div');
  leftGlow.className = 'absolute top-0 bottom-0 left-0 w-[1px]';
  leftGlow.style.background = 'linear-gradient(180deg, transparent, rgba(79, 70, 229, 0.7), transparent)';
  historyContainer.appendChild(leftGlow);
  
  // Table header with holographic effect
  const tableHeader = document.createElement('div');
  tableHeader.className = 'flex justify-between items-center mb-6 relative z-10';
  
  // Title with holographic effect
  const tableTitle = document.createElement('div');
  tableTitle.className = 'flex items-center';
  tableTitle.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="bg-indigo-600 p-2 rounded-lg" style="box-shadow: var(--glow-blue);">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>
      </div>
      <div>
        <h2 class="text-xl font-bold text-white" style="text-shadow: 0 0 5px rgba(79, 70, 229, 0.5);">Income History</h2>
        <div class="flex items-center text-xs text-indigo-300">
          <div class="h-1 w-1 bg-indigo-400 rounded-full mr-2 pulse-soft"></div>
          <span>Secure Transaction Records</span>
        </div>
      </div>
    </div>
  `;
  
  // Filter options with futuristic style
  const filterOptions = document.createElement('div');
  filterOptions.className = 'filter-options relative flex items-center space-x-2';
  filterOptions.innerHTML = `
    <div class="flex gap-2">
      <button id="filter-none" class="px-3 py-1 text-sm rounded-lg bg-indigo-600/80 text-white hover:bg-indigo-600 transition-colors border border-indigo-500/50">
        All Entries
      </button>
      <button id="filter-month" class="px-3 py-1 text-sm rounded-lg bg-gray-800 text-indigo-300 hover:bg-gray-700 transition-colors border border-indigo-500/20">
        By Month
      </button>
      <button id="filter-week" class="px-3 py-1 text-sm rounded-lg bg-gray-800 text-indigo-300 hover:bg-gray-700 transition-colors border border-indigo-500/20">
        By Week
      </button>
    </div>
    <button id="export-income" class="text-indigo-400 hover:text-indigo-300 text-sm p-1 flex items-center gap-1 bg-gray-800 py-1 px-3 rounded-lg border border-indigo-500/20 hover:border-indigo-500/50 transition-all">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      Export
    </button>
  `;
  
  // Assemble the header
  tableHeader.appendChild(tableTitle);
  tableHeader.appendChild(filterOptions);
  historyContainer.appendChild(tableHeader);
  
  // Create the table content container
  const tableContent = document.createElement('div');
  tableContent.className = 'relative z-10';
  
  if (incomeEntries.length === 0) {
    // Create beautiful empty state with holographic effect
    const emptyState = document.createElement('div');
    emptyState.className = 'p-10 rounded-lg border border-dashed border-indigo-500/30 relative overflow-hidden';
    emptyState.style.background = 'linear-gradient(135deg, rgba(67, 56, 202, 0.05), rgba(79, 70, 229, 0.05))';
    
    // Add animated pulse glow
    const emptyGlow = document.createElement('div');
    emptyGlow.className = 'absolute inset-0 z-0';
    emptyGlow.style.background = 'radial-gradient(circle at center, rgba(79, 70, 229, 0.2) 0%, transparent 70%)';
    emptyGlow.style.animation = 'pulse 4s infinite ease-in-out';
    emptyState.appendChild(emptyGlow);
    
    // Empty state content
    emptyState.innerHTML += `
      <div class="text-center relative z-10">
        <div class="bg-indigo-500/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-400"><path d="M12 5v14M5 12h14"></path></svg>
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">No Income Entries Yet</h3>
        <p class="text-indigo-300 mb-6 max-w-md mx-auto">Start tracking your income to see your progress and optimize your 40/30/30 split strategy.</p>
        <button id="add-first-income" class="glow-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block mr-2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Record Your First Income
        </button>
      </div>
    `;
    tableContent.appendChild(emptyState);
  } else {
    // Create futuristic table with income entries
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'overflow-hidden rounded-lg border border-gray-800';
    tableWrapper.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    
    const table = document.createElement('table');
    table.className = 'min-w-full income-table';
    
    // Create cyberpunk style table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th class="w-28">Date</th>
        <th>Description</th>
        <th>Source</th>
        <th class="text-right">Amount</th>
        <th class="text-center">Actions</th>
      </tr>
    `;
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
    // Sort incomeEntries by date (most recent first)
    const sortedEntries = [...incomeEntries].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    // Display latest 10 entries or all if less than 10
    const displayEntries = sortedEntries.slice(0, 10);
    
    displayEntries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.className = 'hoverable-row';
      
      // Create a glowing row effect on hover
      const glowStyle = document.createElement('style');
      glowStyle.textContent = `
        .hoverable-row {
          position: relative;
          transition: all 0.3s ease;
        }
        .hoverable-row:hover {
          background: rgba(79, 70, 229, 0.1);
        }
        .hoverable-row:hover td:first-child::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 4px;
          background: linear-gradient(to bottom, var(--theme-primary), var(--theme-primary-dark));
        }
      `;
      document.head.appendChild(glowStyle);
      
      row.innerHTML = `
        <td>${formatDate(entry.date)}</td>
        <td>
          <div class="font-medium">${entry.description || 'N/A'}</div>
        </td>
        <td>
          <span class="px-2 py-1 rounded-full text-xs bg-gray-800 text-gray-300">${entry.source}</span>
        </td>
        <td class="text-right font-mono font-semibold text-green-400">${formatCurrency(entry.amount)}</td>
        <td class="text-center">
          <div class="flex justify-center space-x-2">
            <button data-id="${entry.id}" class="edit-entry p-1 rounded-md hover:bg-gray-700 text-blue-400 hover:text-blue-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </button>
            <button data-id="${entry.id}" class="delete-entry p-1 rounded-md hover:bg-gray-700 text-red-400 hover:text-red-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    tableContent.appendChild(tableWrapper);
    
    // If there are more entries, show a "View All" button
    if (incomeEntries.length > 10) {
      const viewAllContainer = document.createElement('div');
      viewAllContainer.className = 'mt-4 text-center';
      
      // Create neon button effect
      const viewAllBtn = document.createElement('button');
      viewAllBtn.id = 'view-all-income';
      viewAllBtn.className = 'relative inline-flex items-center px-4 py-2 bg-indigo-900/50 text-indigo-300 hover:text-white rounded-md overflow-hidden transition-all hover:bg-indigo-800/50';
      viewAllBtn.style.border = '1px solid rgba(79, 70, 229, 0.3)';
      viewAllBtn.style.boxShadow = '0 0 10px rgba(79, 70, 229, 0.2)';
      
      viewAllBtn.innerHTML = `
        <span class="relative z-10 flex items-center">
          <span>View All ${incomeEntries.length} Entries</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </span>
      `;
      
      // Add flowing line animation
      const flowLine = document.createElement('div');
      flowLine.className = 'absolute inset-0 overflow-hidden';
      flowLine.innerHTML = `
        <div class="absolute inset-0 bg-indigo-800/30"></div>
        <div class="absolute top-0 left-0 w-full h-full transform -translate-x-full" style="
          background: linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.3), transparent);
          animation: flow-button 2s infinite;
        "></div>
      `;
      
      // Add animation keyframes
      const flowAnimation = document.createElement('style');
      flowAnimation.textContent = `
        @keyframes flow-button {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `;
      document.head.appendChild(flowAnimation);
      
      viewAllBtn.appendChild(flowLine);
      viewAllContainer.appendChild(viewAllBtn);
      tableContent.appendChild(viewAllContainer);
    }
  }
  
  // Add the table content to the container
  historyContainer.appendChild(tableContent);
  
  // Add container to the section
  historySection.appendChild(historyContainer);
  incomeContainer.appendChild(historySection);
  
  // Add event listeners
  setTimeout(() => {
    // Add button event
    const addIncomeBtn = document.getElementById('add-income-btn');
    if (addIncomeBtn) {
      addIncomeBtn.addEventListener('click', showIncomeForm);
    }
    
    // Add first income button (for empty state)
    const addFirstIncomeBtn = document.getElementById('add-first-income');
    if (addFirstIncomeBtn) {
      addFirstIncomeBtn.addEventListener('click', showIncomeForm);
    }
    
    // Filter buttons
    const filterNoneBtn = document.getElementById('filter-none');
    const filterMonthBtn = document.getElementById('filter-month');
    const filterWeekBtn = document.getElementById('filter-week');
    
    if (filterNoneBtn && filterMonthBtn && filterWeekBtn) {
      // Filter by time period
      filterNoneBtn.addEventListener('click', () => {
        filterIncomeEntries('all');
        
        // Update active state
        filterNoneBtn.classList.add('bg-indigo-600/80', 'text-white');
        filterNoneBtn.classList.remove('bg-gray-800', 'text-indigo-300');
        
        filterMonthBtn.classList.remove('bg-indigo-600/80', 'text-white');
        filterMonthBtn.classList.add('bg-gray-800', 'text-indigo-300');
        
        filterWeekBtn.classList.remove('bg-indigo-600/80', 'text-white');
        filterWeekBtn.classList.add('bg-gray-800', 'text-indigo-300');
      });
      
      filterMonthBtn.addEventListener('click', () => {
        filterIncomeEntries('month');
        
        // Update active state
        filterMonthBtn.classList.add('bg-indigo-600/80', 'text-white');
        filterMonthBtn.classList.remove('bg-gray-800', 'text-indigo-300');
        
        filterNoneBtn.classList.remove('bg-indigo-600/80', 'text-white');
        filterNoneBtn.classList.add('bg-gray-800', 'text-indigo-300');
        
        filterWeekBtn.classList.remove('bg-indigo-600/80', 'text-white');
        filterWeekBtn.classList.add('bg-gray-800', 'text-indigo-300');
      });
      
      filterWeekBtn.addEventListener('click', () => {
        filterIncomeEntries('week');
        
        // Update active state
        filterWeekBtn.classList.add('bg-indigo-600/80', 'text-white');
        filterWeekBtn.classList.remove('bg-gray-800', 'text-indigo-300');
        
        filterNoneBtn.classList.remove('bg-indigo-600/80', 'text-white');
        filterNoneBtn.classList.add('bg-gray-800', 'text-indigo-300');
        
        filterMonthBtn.classList.remove('bg-indigo-600/80', 'text-white');
        filterMonthBtn.classList.add('bg-gray-800', 'text-indigo-300');
      });
    }
    
    // Edit and delete buttons
    const editButtons = document.querySelectorAll('.edit-entry');
    const deleteButtons = document.querySelectorAll('.delete-entry');
    
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const entryId = button.getAttribute('data-id');
        const entry = incomeEntries.find(entry => entry.id === parseInt(entryId) || entry.id === entryId);
        if (entry) {
          editIncomeEntry(entry);
        }
      });
    });
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const entryId = button.getAttribute('data-id');
        showDeleteConfirmation(entryId);
      });
    });
    
    // View all button
    const viewAllBtn = document.getElementById('view-all-income');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        // To be implemented
        alert('Full income history view coming soon!');
      });
    }
    
    // Export button
    const exportBtn = document.getElementById('export-income');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        alert('Export functionality coming soon!');
      });
    }
  }, 0);
  incomeContainer.appendChild(historySection);
  
  // Income form modal
  const modalContainer = document.createElement('div');
  modalContainer.id = 'income-modal';
  modalContainer.className = 'modal-container fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
  modalContainer.style.backdropFilter = 'blur(3px)';
  
  modalContainer.innerHTML = `
    <div class="modal-content bg-white rounded-lg w-full max-w-md p-6 relative">
      <button id="close-modal-btn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
      <h3 class="text-xl font-bold mb-4" id="modal-title">Add Income</h3>
      
      <form id="income-form">
        <input type="hidden" id="income-id">
        
        <div class="mb-4">
          <label for="income-date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" id="income-date" required
                 class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        
        <div class="mb-4">
          <label for="income-amount" class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input type="number" id="income-amount" min="0" step="0.01" required
                 class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        
        <div class="mb-4">
          <label for="income-source" class="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <input type="text" id="income-source" required
                 class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        
        <div class="mb-4">
          <label for="income-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="income-description" rows="2"
                   class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
        </div>
        
        <div class="mb-4">
          <label for="income-category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select id="income-category" required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            ${incomeCategories.map(category => `
              <option value="${category.id}">${category.icon} ${category.name}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="mb-6 border-t border-gray-200 pt-4">
          <h4 class="font-medium mb-2">Income Split Preview</h4>
          <div class="flex mb-2">
            <div id="preview-needs-bar" style="width: ${splitRatio.needs}%; background-color: #34A853; height: 12px; border-radius: 4px 0 0 4px;"></div>
            <div id="preview-investments-bar" style="width: ${splitRatio.investments}%; background-color: #4285F4; height: 12px;"></div>
            <div id="preview-savings-bar" style="width: ${splitRatio.savings}%; background-color: #FBBC05; height: 12px; border-radius: 0 4px 4px 0;"></div>
          </div>
          
          <div class="grid grid-cols-3 gap-2 text-center">
            <div>
              <div class="text-xs font-medium">Needs</div>
              <div id="preview-needs" class="text-sm font-semibold">$0.00</div>
            </div>
            <div>
              <div class="text-xs font-medium">Investments</div>
              <div id="preview-investments" class="text-sm font-semibold">$0.00</div>
            </div>
            <div>
              <div class="text-xs font-medium">Savings</div>
              <div id="preview-savings" class="text-sm font-semibold">$0.00</div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button type="button" id="cancel-income-btn" 
                  class="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" id="save-income-btn"
                  class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
            Save Income
          </button>
        </div>
      </form>
    </div>
  `;
  incomeContainer.appendChild(modalContainer);
  
  // Add event listeners
  setTimeout(() => {
    // Add income button
    const addIncomeBtn = incomeContainer.querySelector('#add-income-btn');
    if (addIncomeBtn) {
      addIncomeBtn.addEventListener('click', () => {
        const modal = incomeContainer.querySelector('#income-modal');
        const modalTitle = modal.querySelector('#modal-title');
        const form = modal.querySelector('#income-form');
        
        // Reset form
        form.reset();
        document.getElementById('income-id').value = '';
        
        // Set default date to today
        document.getElementById('income-date').valueAsDate = new Date();
        
        // Update modal title
        modalTitle.textContent = 'Add Income';
        
        // Show modal
        modal.classList.remove('hidden');
      });
    }
    
    // Add first income button (shown when no income entries exist)
    const addFirstIncomeBtn = incomeContainer.querySelector('#add-first-income-btn');
    if (addFirstIncomeBtn) {
      addFirstIncomeBtn.addEventListener('click', () => {
        const addIncomeBtn = incomeContainer.querySelector('#add-income-btn');
        if (addIncomeBtn) {
          addIncomeBtn.click();
        }
      });
    }
    
    // Close modal buttons
    const closeModalBtn = incomeContainer.querySelector('#close-modal-btn');
    const cancelIncomeBtn = incomeContainer.querySelector('#cancel-income-btn');
    
    [closeModalBtn, cancelIncomeBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          const modal = incomeContainer.querySelector('#income-modal');
          modal.classList.add('hidden');
        });
      }
    });
    
    // Preview calculation for input amount
    const amountInput = incomeContainer.querySelector('#income-amount');
    if (amountInput) {
      amountInput.addEventListener('input', () => {
        const amount = parseFloat(amountInput.value) || 0;
        const splits = calculateSplits(amount);
        
        // Update preview values
        document.getElementById('preview-needs').textContent = formatCurrency(splits.needs);
        document.getElementById('preview-investments').textContent = formatCurrency(splits.investments);
        document.getElementById('preview-savings').textContent = formatCurrency(splits.savings);
      });
    }
    
    // Edit income buttons
    const editButtons = incomeContainer.querySelectorAll('.edit-income-btn');
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        const entryId = parseInt(row.dataset.entryId);
        
        // Find the income entry
        const entry = incomeEntries.find(i => i.id === entryId);
        if (!entry) return;
        
        // Populate the form
        document.getElementById('income-id').value = entry.id;
        document.getElementById('income-date').value = new Date(entry.date).toISOString().split('T')[0];
        document.getElementById('income-amount').value = entry.amount;
        document.getElementById('income-source').value = entry.source;
        document.getElementById('income-description').value = entry.description || '';
        document.getElementById('income-category').value = entry.category;
        
        // Update split preview
        const splits = calculateSplits(entry.amount);
        document.getElementById('preview-needs').textContent = formatCurrency(splits.needs);
        document.getElementById('preview-investments').textContent = formatCurrency(splits.investments);
        document.getElementById('preview-savings').textContent = formatCurrency(splits.savings);
        
        // Update modal title
        document.getElementById('modal-title').textContent = 'Edit Income';
        
        // Show modal
        document.getElementById('income-modal').classList.remove('hidden');
      });
    });
    
    // Delete income buttons
    const deleteButtons = incomeContainer.querySelectorAll('.delete-income-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (confirm('Are you sure you want to delete this income entry?')) {
          const row = e.target.closest('tr');
          const entryId = parseInt(row.dataset.entryId);
          
          // Delete the entry
          if (deleteIncomeEntry(entryId)) {
            // Remove the row from the table
            row.remove();
            
            // Check if table is now empty
            const incomeEntries = incomeContainer.querySelector('#income-entries');
            if (incomeEntries && incomeEntries.children.length === 0) {
              incomeEntries.innerHTML = `
                <tr>
                  <td colspan="6" class="text-center py-4 text-gray-500">
                    No income entries found
                    <div>
                      <button id="add-first-income-btn" class="mt-2 text-primary hover:underline">
                        Add your first income
                      </button>
                    </div>
                  </td>
                </tr>
              `;
              
              // Re-add event listener to the new button
              const newAddFirstBtn = incomeEntries.querySelector('#add-first-income-btn');
              if (newAddFirstBtn) {
                newAddFirstBtn.addEventListener('click', () => {
                  const addIncomeBtn = incomeContainer.querySelector('#add-income-btn');
                  if (addIncomeBtn) {
                    addIncomeBtn.click();
                  }
                });
              }
            }
            
            // Update summary cards
            const monthlyCard = incomeContainer.querySelector('.summary-cards').children[0];
            monthlyCard.querySelector('.card-value').textContent = formatCurrency(appState.income.monthly);
            
            const monthSplitCard = incomeContainer.querySelector('.summary-cards').children[2];
            const monthlySplits = calculateSplits(appState.income.monthly);
            
            const splitElements = monthSplitCard.querySelectorAll('.text-xl');
            splitElements[0].textContent = formatCurrency(monthlySplits.needs);
            splitElements[1].textContent = formatCurrency(monthlySplits.investments);
            splitElements[2].textContent = formatCurrency(monthlySplits.savings);
          }
        }
      });
    });
    
    // Income form submission
    const incomeForm = incomeContainer.querySelector('#income-form');
    if (incomeForm) {
      incomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const id = document.getElementById('income-id').value ? parseInt(document.getElementById('income-id').value) : null;
        const date = document.getElementById('income-date').value;
        const amount = parseFloat(document.getElementById('income-amount').value);
        const source = document.getElementById('income-source').value;
        const description = document.getElementById('income-description').value;
        const category = document.getElementById('income-category').value;
        
        // Calculate splits
        const splits = calculateSplits(amount);
        
        // Create income entry object
        const incomeEntry = {
          id,
          date: new Date(date).toISOString(),
          amount,
          source,
          description,
          category,
          splits
        };
        
        // Save the entry
        const savedEntry = saveIncomeEntry(incomeEntry);
        
        // Close the modal
        document.getElementById('income-modal').classList.add('hidden');
        
        // Refresh the page to show the new entry
        // In a real app, you would just update the DOM
        window.location.reload();
      });
    }
    
    // Function to render weekly view of income entries
    function renderWeeklyView() {
      const filterValue = incomeFilter ? incomeFilter.value : 'month';
      
      // Filter entries based on selected time period
      let filteredEntries = [...incomeEntries];
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (filterValue === 'month') {
        filteredEntries = incomeEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });
      } else if (filterValue === 'year') {
        filteredEntries = incomeEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getFullYear() === currentYear;
        });
      }
      
      // Group entries by week
      const weeks = {};
      
      filteredEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const weekStart = new Date(entryDate);
        // Set to Sunday of the week
        weekStart.setDate(entryDate.getDate() - entryDate.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeks[weekKey]) {
          weeks[weekKey] = {
            start: weekStart,
            end: weekEnd,
            entries: [],
            total: 0,
            splits: { needs: 0, investments: 0, savings: 0 }
          };
        }
        
        weeks[weekKey].entries.push(entry);
        weeks[weekKey].total += parseFloat(entry.amount);
        
        // Add to splits
        if (entry.splits) {
          weeks[weekKey].splits.needs += parseFloat(entry.splits.needs);
          weeks[weekKey].splits.investments += parseFloat(entry.splits.investments);
          weeks[weekKey].splits.savings += parseFloat(entry.splits.savings);
        }
      });
      
      // Convert to array and sort by start date (most recent first)
      const weeklyGroups = Object.values(weeks).sort((a, b) => b.start - a.start);
      
      // Replace income history container with weekly view
      const historyContainer = incomeContainer.querySelector('.income-history');
      if (!historyContainer) return;
      
      const weeklyViewContainer = document.createElement('div');
      weeklyViewContainer.className = 'bg-white p-4 rounded-lg shadow-sm';
      
      if (weeklyGroups.length === 0) {
        weeklyViewContainer.innerHTML = `
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Income History - Weekly View</h3>
            <div class="flex mt-2 sm:mt-0">
              <div class="mr-3 horizontal-scroll scrollbar-none flex gap-2">
                <button id="filter-none" class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                  All Entries
                </button>
                <button id="filter-month" class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                  By Month
                </button>
                <button id="filter-week" class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-primary text-white hover:bg-primary-dark">
                  By Week
                </button>
                <button id="filter-category" class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                  By Category
                </button>
              </div>
              <select id="income-filter" class="p-2 border rounded-md text-sm">
                <option value="all">All Time</option>
                <option value="month" selected>This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          <div class="text-center py-8 text-gray-500">
            <p>No income entries found for the selected period</p>
            <button id="add-first-income-btn" class="mt-2 text-primary hover:underline">Add your first income</button>
          </div>
        `;
      } else {
        const currentWeek = weeklyGroups[0];
        
        weeklyViewContainer.innerHTML = `
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Income History - Weekly View</h3>
            <div class="flex mt-2 sm:mt-0">
              <div class="mr-3 horizontal-scroll scrollbar-none flex gap-2">
                <button id="filter-none" class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                  All Entries
                </button>
                <button id="filter-month" class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                  By Month
                </button>
                <button id="filter-week" class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-primary text-white hover:bg-primary-dark">
                  By Week
                </button>
                <button id="filter-category" class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                  By Category
                </button>
              </div>
              <select id="income-filter" class="p-2 border rounded-md text-sm">
                <option value="all">All Time</option>
                <option value="month" selected>This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          
          <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Weekly Income Summary</h3>
              <div class="flex items-center">
                <button id="prev-week-btn" class="p-1 rounded-md hover:bg-gray-100 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <span id="current-week-label" class="text-sm">
                  ${formatDate(currentWeek.start)} - ${formatDate(currentWeek.end)}
                </span>
                <button id="next-week-btn" class="p-1 rounded-md hover:bg-gray-100 ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-500 mb-1">Week Total</h4>
                <div class="text-2xl font-bold">${formatCurrency(currentWeek.total)}</div>
                <div class="mt-3">
                  <div class="h-1 bg-gray-200 rounded-full">
                    <div class="h-1 bg-primary rounded-full" style="width: 100%"></div>
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-500 mb-1">Weekly Breakdown</h4>
                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <div class="text-xs font-medium">Needs</div>
                    <div class="text-lg font-semibold text-green-600">${formatCurrency(currentWeek.splits.needs)}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium">Investments</div>
                    <div class="text-lg font-semibold text-blue-600">${formatCurrency(currentWeek.splits.investments)}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium">Savings</div>
                    <div class="text-lg font-semibold text-yellow-600">${formatCurrency(currentWeek.splits.savings)}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <h4 class="text-md font-medium mb-3">Week Entries</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  ${currentWeek.entries.map((entry, index) => {
                    const category = incomeCategories.find(cat => cat.id === entry.category) || { name: 'Other', icon: '🔹' };
                    
                    return `
                      <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}" data-entry-id="${entry.id}">
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          ${formatDate(entry.date)}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          ${entry.source}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <span class="inline-flex items-center">
                            <span class="mr-1">${category.icon}</span>
                            ${category.name}
                          </span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${formatCurrency(entry.amount)}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <button class="edit-income-btn text-blue-600 hover:text-blue-800 mr-3" data-id="${entry.id}">
                            Edit
                          </button>
                          <button class="delete-income-btn text-red-600 hover:text-red-800" data-id="${entry.id}">
                            Delete
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
      
      // Replace existing view with weekly view
      const existingView = historyContainer.querySelector('.income-history > div');
      if (existingView) {
        historyContainer.replaceChild(weeklyViewContainer, existingView);
      } else {
        historyContainer.appendChild(weeklyViewContainer);
      }
      
      // Add event listeners for week navigation
      if (weeklyGroups.length > 0) {
        let currentWeekIndex = 0;
        
        const updateWeekDisplay = () => {
          const weekGroup = weeklyGroups[currentWeekIndex];
          const weekLabel = weeklyViewContainer.querySelector('#current-week-label');
          const weekTotal = weeklyViewContainer.querySelector('.text-2xl.font-bold');
          const needsAmount = weeklyViewContainer.querySelectorAll('.text-lg.font-semibold')[0];
          const investmentsAmount = weeklyViewContainer.querySelectorAll('.text-lg.font-semibold')[1];
          const savingsAmount = weeklyViewContainer.querySelectorAll('.text-lg.font-semibold')[2];
          
          if (weekLabel) weekLabel.textContent = `${formatDate(weekGroup.start)} - ${formatDate(weekGroup.end)}`;
          if (weekTotal) weekTotal.textContent = formatCurrency(weekGroup.total);
          
          if (needsAmount) needsAmount.textContent = formatCurrency(weekGroup.splits.needs);
          if (investmentsAmount) investmentsAmount.textContent = formatCurrency(weekGroup.splits.investments);
          if (savingsAmount) savingsAmount.textContent = formatCurrency(weekGroup.splits.savings);
          
          // Replace table body with new entries
          const tableBody = weeklyViewContainer.querySelector('tbody');
          if (tableBody) {
            tableBody.innerHTML = weekGroup.entries.map((entry, index) => {
              const category = incomeCategories.find(cat => cat.id === entry.category) || { name: 'Other', icon: '🔹' };
              
              return `
                <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}" data-entry-id="${entry.id}">
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${formatDate(entry.date)}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${entry.source}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <span class="inline-flex items-center">
                      <span class="mr-1">${category.icon}</span>
                      ${category.name}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${formatCurrency(entry.amount)}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <button class="edit-income-btn text-blue-600 hover:text-blue-800 mr-3" data-id="${entry.id}">
                      Edit
                    </button>
                    <button class="delete-income-btn text-red-600 hover:text-red-800" data-id="${entry.id}">
                      Delete
                    </button>
                  </td>
                </tr>
              `;
            }).join('');
            
            // Reattach event listeners to edit/delete buttons
            weeklyViewContainer.querySelectorAll('.edit-income-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                const entryId = this.dataset.id;
                const entry = incomeEntries.find(e => e.id == entryId);
                if (entry) {
                  showIncomeModal(entry);
                }
              });
            });
            
            weeklyViewContainer.querySelectorAll('.delete-income-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                const entryId = this.dataset.id;
                if (confirm('Are you sure you want to delete this income entry?')) {
                  deleteIncomeEntry(parseInt(entryId, 10));
                  renderWeeklyView(); // Refresh the view
                }
              });
            });
          }
        };
        
        // Previous week button
        const prevWeekBtn = weeklyViewContainer.querySelector('#prev-week-btn');
        if (prevWeekBtn) {
          prevWeekBtn.addEventListener('click', () => {
            if (currentWeekIndex < weeklyGroups.length - 1) {
              currentWeekIndex++;
              updateWeekDisplay();
            }
          });
        }
        
        // Next week button
        const nextWeekBtn = weeklyViewContainer.querySelector('#next-week-btn');
        if (nextWeekBtn) {
          nextWeekBtn.addEventListener('click', () => {
            if (currentWeekIndex > 0) {
              currentWeekIndex--;
              updateWeekDisplay();
            }
          });
        }
        
        // Initial setup of edit/delete event listeners
        weeklyViewContainer.querySelectorAll('.edit-income-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const entryId = this.dataset.id;
            const entry = incomeEntries.find(e => e.id == entryId);
            if (entry) {
              showIncomeModal(entry);
            }
          });
        });
        
        weeklyViewContainer.querySelectorAll('.delete-income-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const entryId = this.dataset.id;
            if (confirm('Are you sure you want to delete this income entry?')) {
              deleteIncomeEntry(parseInt(entryId, 10));
              renderWeeklyView(); // Refresh the view
            }
          });
        });
      }
      
      // Reattach filter change event
      const newIncomeFilter = weeklyViewContainer.querySelector('#income-filter');
      if (newIncomeFilter && incomeFilter) {
        newIncomeFilter.value = incomeFilter.value;
        newIncomeFilter.addEventListener('change', () => {
          incomeFilter.value = newIncomeFilter.value;
          renderWeeklyView();
        });
      }
      
      // Reattach view buttons event listeners
      const viewButtons = {
        none: weeklyViewContainer.querySelector('#filter-none'),
        month: weeklyViewContainer.querySelector('#filter-month'),
        week: weeklyViewContainer.querySelector('#filter-week'),
        category: weeklyViewContainer.querySelector('#filter-category')
      };
      
      if (viewButtons.none) {
        viewButtons.none.addEventListener('click', () => {
          const filterBtn = incomeContainer.querySelector('#filter-none');
          if (filterBtn) filterBtn.click();
        });
      }
      
      if (viewButtons.month) {
        viewButtons.month.addEventListener('click', () => {
          const filterBtn = incomeContainer.querySelector('#filter-month');
          if (filterBtn) filterBtn.click();
        });
      }
      
      if (viewButtons.category) {
        viewButtons.category.addEventListener('click', () => {
          const filterBtn = incomeContainer.querySelector('#filter-category');
          if (filterBtn) filterBtn.click();
        });
      }
      
      // Add first income button
      const addFirstIncomeBtn = weeklyViewContainer.querySelector('#add-first-income-btn');
      if (addFirstIncomeBtn) {
        addFirstIncomeBtn.addEventListener('click', () => {
          showIncomeModal();
        });
      }
    }
    
    // Income filter
    const incomeFilter = incomeContainer.querySelector('#income-filter');
    if (incomeFilter) {
      incomeFilter.addEventListener('change', () => {
        const filterValue = incomeFilter.value;
        const now = new Date();
        
        // Filter income entries based on selection
        let filteredEntries = [...incomeEntries];
        
        if (filterValue === 'month') {
          // Filter to current month
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          filteredEntries = incomeEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
          });
        } else if (filterValue === 'year') {
          // Filter to current year
          const currentYear = now.getFullYear();
          
          filteredEntries = incomeEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === currentYear;
          });
        }
        
        // Rebuild the table with filtered entries
        const tableBody = incomeContainer.querySelector('#income-entries');
        
        if (filteredEntries.length === 0) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="6" class="text-center py-4 text-gray-500">
                No income entries found for the selected period
              </td>
            </tr>
          `;
        } else {
          tableBody.innerHTML = filteredEntries.map((entry, index) => {
            const category = incomeCategories.find(cat => cat.id === entry.category) || { name: 'Other', icon: '🔹' };
            
            return `
              <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}" data-entry-id="${entry.id}">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  ${formatDate(entry.date)}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  ${entry.source}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <span class="inline-flex items-center">
                    <span class="mr-1">${category.icon}</span>
                    ${category.name}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${formatCurrency(entry.amount)}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  <div class="flex flex-col">
                    <div class="text-xs flex justify-between">
                      <span>Needs:</span>
                      <span>${formatCurrency(entry.splits.needs)}</span>
                    </div>
                    <div class="text-xs flex justify-between">
                      <span>Investments:</span>
                      <span>${formatCurrency(entry.splits.investments)}</span>
                    </div>
                    <div class="text-xs flex justify-between">
                      <span>Savings:</span>
                      <span>${formatCurrency(entry.splits.savings)}</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <button class="edit-income-btn text-blue-600 hover:text-blue-800 mr-3">
                    Edit
                  </button>
                  <button class="delete-income-btn text-red-600 hover:text-red-800">
                    Delete
                  </button>
                </td>
              </tr>
            `;
          }).join('');
          
          // Re-attach event listeners
          const newEditButtons = tableBody.querySelectorAll('.edit-income-btn');
          newEditButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
              const row = e.target.closest('tr');
              const entryId = parseInt(row.dataset.entryId);
              
              // Find the income entry
              const entry = incomeEntries.find(i => i.id === entryId);
              if (!entry) return;
              
              // Populate the form
              document.getElementById('income-id').value = entry.id;
              document.getElementById('income-date').value = new Date(entry.date).toISOString().split('T')[0];
              document.getElementById('income-amount').value = entry.amount;
              document.getElementById('income-source').value = entry.source;
              document.getElementById('income-description').value = entry.description || '';
              document.getElementById('income-category').value = entry.category;
              
              // Update split preview
              const splits = calculateSplits(entry.amount);
              document.getElementById('preview-needs').textContent = formatCurrency(splits.needs);
              document.getElementById('preview-investments').textContent = formatCurrency(splits.investments);
              document.getElementById('preview-savings').textContent = formatCurrency(splits.savings);
              
              // Update modal title
              document.getElementById('modal-title').textContent = 'Edit Income';
              
              // Show modal
              document.getElementById('income-modal').classList.remove('hidden');
            });
          });
          
          const newDeleteButtons = tableBody.querySelectorAll('.delete-income-btn');
          newDeleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
              if (confirm('Are you sure you want to delete this income entry?')) {
                const row = e.target.closest('tr');
                const entryId = parseInt(row.dataset.entryId);
                
                // Delete the entry
                if (deleteIncomeEntry(entryId)) {
                  // Remove the row from the table
                  row.remove();
                  
                  // Check if table is now empty
                  if (tableBody.children.length === 0) {
                    tableBody.innerHTML = `
                      <tr>
                        <td colspan="6" class="text-center py-4 text-gray-500">
                          No income entries found for the selected period
                        </td>
                      </tr>
                    `;
                  }
                  
                  // Update summary cards
                  const monthlyCard = incomeContainer.querySelector('.summary-cards').children[0];
                  monthlyCard.querySelector('.card-value').textContent = formatCurrency(appState.income.monthly);
                  
                  const monthSplitCard = incomeContainer.querySelector('.summary-cards').children[2];
                  const monthlySplits = calculateSplits(appState.income.monthly);
                  
                  const splitElements = monthSplitCard.querySelectorAll('.text-xl');
                  splitElements[0].textContent = formatCurrency(monthlySplits.needs);
                  splitElements[1].textContent = formatCurrency(monthlySplits.investments);
                  splitElements[2].textContent = formatCurrency(monthlySplits.savings);
                }
              }
            });
          });
        }
      });
    }
  }, 100);
  
  return incomeContainer;
}