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

export function renderIncomePage() {
  // Main container
  const incomeContainer = document.createElement('div');
  incomeContainer.className = 'income-container';
  
  // Get income data and categories
  const incomeEntries = getIncomeData();
  const incomeCategories = getIncomeCategories();
  
  // Calculate total and monthly income
  const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const monthlyIncome = appState.income?.monthly || updateMonthlyIncome();
  
  // Split ratio
  const splitRatio = getSplitRatio();
  
  // Header section
  const header = document.createElement('header');
  header.className = 'income-header mb-6';
  header.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold mb-1">Income Management</h1>
        <p class="text-gray-600">Track and categorize your income with the 40/30/30 split</p>
      </div>
      <div class="mt-4 md:mt-0">
        <button id="add-income-btn" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
          + Add Income
        </button>
      </div>
    </div>
  `;
  incomeContainer.appendChild(header);
  
  // Summary cards
  const summarySection = document.createElement('section');
  summarySection.className = 'summary-cards grid grid-cols-1 md:grid-cols-3 gap-4 mb-8';
  
  // Monthly income card
  const monthlyCard = document.createElement('div');
  monthlyCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  monthlyCard.innerHTML = `
    <div class="card-header mb-2">
      <h3 class="text-lg font-semibold">Monthly Income</h3>
    </div>
    <div class="card-value text-2xl font-bold">${formatCurrency(monthlyIncome)}</div>
    <div class="text-sm text-gray-600 mt-1">Current month</div>
  `;
  
  // Split allocation card
  const splitCard = document.createElement('div');
  splitCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  splitCard.innerHTML = `
    <div class="card-header mb-2">
      <h3 class="text-lg font-semibold">Split Allocation</h3>
    </div>
    <div class="flex mt-2">
      <div style="width: ${splitRatio.needs}%; background-color: #34A853; height: 24px; border-radius: 4px 0 0 4px;"></div>
      <div style="width: ${splitRatio.investments}%; background-color: #4285F4; height: 24px;"></div>
      <div style="width: ${splitRatio.savings}%; background-color: #FBBC05; height: 24px; border-radius: 0 4px 4px 0;"></div>
    </div>
    <div class="flex justify-between text-sm mt-2">
      <div>
        <div class="font-semibold">Needs</div>
        <div>${splitRatio.needs}%</div>
      </div>
      <div>
        <div class="font-semibold">Investments</div>
        <div>${splitRatio.investments}%</div>
      </div>
      <div>
        <div class="font-semibold">Savings</div>
        <div>${splitRatio.savings}%</div>
      </div>
    </div>
  `;
  
  // This month's splits card
  const monthSplitCard = document.createElement('div');
  monthSplitCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  
  const monthlySplits = calculateSplits(monthlyIncome);
  
  monthSplitCard.innerHTML = `
    <div class="card-header mb-2">
      <h3 class="text-lg font-semibold">This Month's Splits</h3>
    </div>
    <div class="grid grid-cols-3 gap-2 text-center">
      <div>
        <div class="text-sm font-medium">Needs</div>
        <div class="text-xl font-semibold text-green-600">${formatCurrency(monthlySplits.needs)}</div>
      </div>
      <div>
        <div class="text-sm font-medium">Investments</div>
        <div class="text-xl font-semibold text-blue-600">${formatCurrency(monthlySplits.investments)}</div>
      </div>
      <div>
        <div class="text-sm font-medium">Savings</div>
        <div class="text-xl font-semibold text-yellow-600">${formatCurrency(monthlySplits.savings)}</div>
      </div>
    </div>
  `;
  
  summarySection.appendChild(monthlyCard);
  summarySection.appendChild(splitCard);
  summarySection.appendChild(monthSplitCard);
  incomeContainer.appendChild(summarySection);
  
  // Income history section
  const historySection = document.createElement('section');
  historySection.className = 'income-history mb-8';
  historySection.innerHTML = `
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Income History</h3>
        <div class="flex mt-2 sm:mt-0">
          <div class="mr-3 horizontal-scroll scrollbar-none flex gap-2">
            <button id="filter-none" class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
              All Entries
            </button>
            <button id="filter-month" class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-primary text-white hover:bg-primary-dark">
              By Month
            </button>
            <button id="filter-week" class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
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
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Split Details</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" id="income-entries">
            ${incomeEntries.map((entry, index) => {
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
            }).join('')}
          </tbody>
        </table>
      </div>
      
      ${incomeEntries.length === 0 ? `
        <div class="text-center py-8 text-gray-500">
          <p>No income entries found</p>
          <button id="add-first-income-btn" class="mt-2 text-primary hover:underline">Add your first income</button>
        </div>
      ` : ''}
    </div>
  `;
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