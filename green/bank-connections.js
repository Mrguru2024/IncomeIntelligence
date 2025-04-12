/**
 * Bank Connections module for Stackr Finance
 * This module handles connecting bank accounts via Plaid API
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

// Get bank connections from app state or generate sample data
function getBankConnections() {
  if (!appState.bankConnections || appState.bankConnections.length === 0) {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    return [
      {
        id: 1,
        name: 'Demo Bank',
        type: 'checking',
        institution: 'Chase',
        logo: '🏦',
        balance: 2547.89,
        availableBalance: 2499.77,
        accountNumber: 'xxxx7890',
        routingNumber: 'xxxxxx0123',
        accountType: 'personal',
        lastUpdated: today.toISOString(),
        recentTransactions: [
          {
            id: 1,
            date: today.toISOString(),
            description: 'Coffee Shop',
            amount: -4.75,
            category: 'Food & Dining'
          },
          {
            id: 2,
            date: lastWeek.toISOString(),
            description: 'Payroll Deposit',
            amount: 1250.00,
            category: 'Income'
          },
          {
            id: 3,
            date: lastWeek.toISOString(),
            description: 'Grocery Store',
            amount: -78.45,
            category: 'Groceries'
          }
        ]
      },
      {
        id: 2,
        name: 'Demo Savings',
        type: 'savings',
        institution: 'Wells Fargo',
        logo: '💰',
        balance: 15325.62,
        availableBalance: 15325.62,
        accountNumber: 'xxxx4567',
        routingNumber: 'xxxxxx7890',
        accountType: 'personal',
        lastUpdated: today.toISOString(),
        recentTransactions: [
          {
            id: 1,
            date: lastWeek.toISOString(),
            description: 'Transfer from Checking',
            amount: 500.00,
            category: 'Transfer'
          },
          {
            id: 2,
            date: lastWeek.toISOString(),
            description: 'Interest Payment',
            amount: 5.62,
            category: 'Income'
          }
        ]
      }
    ];
  }
  
  return appState.bankConnections;
}

// Get account types for filter
function getAccountTypes() {
  return [
    { id: 'checking', name: 'Checking', icon: '🏦' },
    { id: 'savings', name: 'Savings', icon: '💰' },
    { id: 'credit', name: 'Credit Card', icon: '💳' },
    { id: 'investment', name: 'Investment', icon: '📈' },
    { id: 'loan', name: 'Loan', icon: '🏠' },
    { id: 'other', name: 'Other', icon: '📌' }
  ];
}

// Calculate total connected balance
function calculateTotalBalance(connections) {
  if (!connections || connections.length === 0) {
    return 0;
  }
  
  return connections.reduce((total, connection) => {
    // Only add positive balances (exclude credit cards, loans)
    if (connection.balance > 0) {
      return total + connection.balance;
    }
    return total;
  }, 0);
}

// Calculate total debt
function calculateTotalDebt(connections) {
  if (!connections || connections.length === 0) {
    return 0;
  }
  
  return connections.reduce((total, connection) => {
    // Only add negative balances (credit cards, loans)
    if (connection.balance < 0) {
      return total + Math.abs(connection.balance);
    }
    return total;
  }, 0);
}

// Format Plaid Link token - in a real implementation, this would fetch from a server
async function getPlaidLinkToken() {
  // Simulate a server request with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real implementation, this would be a valid token from the server
      resolve('link-sandbox-abcdef-123456');
    }, 1000);
  });
}

// Simulate adding a bank account
function addBankAccount(accountData) {
  if (!appState.bankConnections) {
    appState.bankConnections = [];
  }
  
  // Generate ID if not provided
  if (!accountData.id) {
    accountData.id = Date.now();
  }
  
  // Set last updated to now
  accountData.lastUpdated = new Date().toISOString();
  
  // Add to app state
  appState.bankConnections.push(accountData);
  
  // Save to local storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('stackr-finance-state', JSON.stringify(appState));
      console.log('Bank account added successfully');
    } catch (error) {
      console.error('Error saving bank account to localStorage:', error);
    }
  }
  
  return accountData;
}

// Initialize Plaid and create a handler
function setupPlaidLink(onSuccess) {
  // Check if Plaid script is already loaded
  if (window.Plaid) {
    createPlaidHandler(onSuccess);
    return;
  }
  
  // Load Plaid Link script
  const script = document.createElement('script');
  script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
  script.async = true;
  
  script.onload = () => {
    createPlaidHandler(onSuccess);
  };
  
  script.onerror = () => {
    console.error('Failed to load Plaid Link script');
    // Show a fallback UI
    showPlaidFallbackUI();
  };
  
  document.head.appendChild(script);
}

// Create Plaid Link handler
function createPlaidHandler(onSuccess) {
  getPlaidLinkToken()
    .then(token => {
      // In a real implementation, this would use the actual Plaid Link
      // For this demo, we'll simulate the Plaid flow with a custom UI
      
      console.log('Would initialize Plaid with token:', token);
      showPlaidSimulationUI(onSuccess);
    })
    .catch(error => {
      console.error('Error getting Plaid link token:', error);
      showPlaidFallbackUI();
    });
}

// Show a fallback UI when Plaid isn't available
function showPlaidFallbackUI() {
  const container = document.createElement('div');
  container.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  container.style.backdropFilter = 'blur(3px)';
  
  container.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <h2 class="text-xl font-bold mb-4">Connect Bank Account</h2>
      <p class="mb-4">Unable to connect to the banking service at this time.</p>
      <p class="mb-6 text-gray-600">Please try again later or contact support if the issue persists.</p>
      
      <div class="flex justify-end">
        <button id="plaid-fallback-close" class="px-4 py-2 bg-primary text-white rounded-md">
          Close
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);
  
  // Close button event listener
  const closeButton = container.querySelector('#plaid-fallback-close');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(container);
  });
}

// Show a simulation of the Plaid UI for demo purposes
function showPlaidSimulationUI(onSuccess) {
  const container = document.createElement('div');
  container.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  container.style.backdropFilter = 'blur(3px)';
  
  container.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Connect Your Bank</h2>
        <button id="plaid-sim-close" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
      </div>
      
      <div class="mb-6">
        <div class="text-sm text-gray-600 mb-2">Most Popular Banks</div>
        <div class="grid grid-cols-3 gap-4">
          <button class="bank-option p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
            <div class="text-2xl mb-2">🏦</div>
            <div class="text-sm">Chase</div>
          </button>
          <button class="bank-option p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
            <div class="text-2xl mb-2">🏦</div>
            <div class="text-sm">Bank of America</div>
          </button>
          <button class="bank-option p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
            <div class="text-2xl mb-2">🏦</div>
            <div class="text-sm">Wells Fargo</div>
          </button>
        </div>
      </div>
      
      <div class="mb-6">
        <div class="relative">
          <input type="text" placeholder="Search for your bank" 
                 class="w-full p-3 border border-gray-300 rounded-lg pl-10">
          <div class="absolute left-3 top-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div id="plaid-sim-step-1">
        <div class="flex justify-end">
          <button id="plaid-sim-continue" class="px-4 py-2 bg-primary text-white rounded-md">
            Continue
          </button>
        </div>
      </div>
      
      <div id="plaid-sim-step-2" class="hidden">
        <h3 class="font-medium mb-4">Enter your credentials</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input type="text" value="demo_user" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" value="••••••••" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="flex justify-end">
          <button id="plaid-sim-submit" class="px-4 py-2 bg-primary text-white rounded-md">
            Submit
          </button>
        </div>
      </div>
      
      <div id="plaid-sim-step-3" class="hidden">
        <div class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <div class="mt-2">Connecting to your bank...</div>
        </div>
      </div>
      
      <div id="plaid-sim-step-4" class="hidden">
        <div class="text-center py-4">
          <div class="inline-block rounded-full h-16 w-16 bg-green-100 text-green-600 flex items-center justify-center text-2xl mb-2">✓</div>
          <h3 class="font-medium mb-1">Connection Successful!</h3>
          <p class="text-sm text-gray-600 mb-4">Your accounts have been connected.</p>
          
          <div class="text-left border rounded-lg p-3 mb-4">
            <div class="font-medium">Demo Checking Account</div>
            <div class="text-sm text-gray-600">Balance: $2,547.89</div>
          </div>
          
          <div class="text-left border rounded-lg p-3 mb-4">
            <div class="font-medium">Demo Savings Account</div>
            <div class="text-sm text-gray-600">Balance: $15,325.62</div>
          </div>
          
          <button id="plaid-sim-finish" class="px-6 py-2 bg-primary text-white rounded-md">
            Finish
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);
  
  // Close button event listener
  const closeButton = container.querySelector('#plaid-sim-close');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(container);
  });
  
  // Continue button (Step 1 to 2)
  const continueButton = container.querySelector('#plaid-sim-continue');
  continueButton.addEventListener('click', () => {
    container.querySelector('#plaid-sim-step-1').classList.add('hidden');
    container.querySelector('#plaid-sim-step-2').classList.remove('hidden');
  });
  
  // Submit button (Step 2 to 3)
  const submitButton = container.querySelector('#plaid-sim-submit');
  submitButton.addEventListener('click', () => {
    container.querySelector('#plaid-sim-step-2').classList.add('hidden');
    container.querySelector('#plaid-sim-step-3').classList.remove('hidden');
    
    // Simulate loading
    setTimeout(() => {
      container.querySelector('#plaid-sim-step-3').classList.add('hidden');
      container.querySelector('#plaid-sim-step-4').classList.remove('hidden');
    }, 2000);
  });
  
  // Bank option buttons (Skip to step 2)
  const bankOptions = container.querySelectorAll('.bank-option');
  bankOptions.forEach(option => {
    option.addEventListener('click', () => {
      container.querySelector('#plaid-sim-step-1').classList.add('hidden');
      container.querySelector('#plaid-sim-step-2').classList.remove('hidden');
    });
  });
  
  // Finish button (Step 4 to done)
  const finishButton = container.querySelector('#plaid-sim-finish');
  finishButton.addEventListener('click', () => {
    document.body.removeChild(container);
    
    // Simulate adding the accounts
    const checking = {
      id: Date.now(),
      name: 'Demo Checking',
      type: 'checking',
      institution: 'Demo Bank',
      logo: '🏦',
      balance: 2547.89,
      availableBalance: 2499.77,
      accountNumber: 'xxxx7890',
      routingNumber: 'xxxxxx0123',
      accountType: 'personal',
      lastUpdated: new Date().toISOString(),
      recentTransactions: [
        {
          id: 1,
          date: new Date().toISOString(),
          description: 'Coffee Shop',
          amount: -4.75,
          category: 'Food & Dining'
        },
        {
          id: 2,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Payroll Deposit',
          amount: 1250.00,
          category: 'Income'
        },
        {
          id: 3,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Grocery Store',
          amount: -78.45,
          category: 'Groceries'
        }
      ]
    };
    
    const savings = {
      id: Date.now() + 1,
      name: 'Demo Savings',
      type: 'savings',
      institution: 'Demo Bank',
      logo: '💰',
      balance: 15325.62,
      availableBalance: 15325.62,
      accountNumber: 'xxxx4567',
      routingNumber: 'xxxxxx7890',
      accountType: 'personal',
      lastUpdated: new Date().toISOString(),
      recentTransactions: [
        {
          id: 1,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Transfer from Checking',
          amount: 500.00,
          category: 'Transfer'
        },
        {
          id: 2,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Interest Payment',
          amount: 5.62,
          category: 'Income'
        }
      ]
    };
    
    addBankAccount(checking);
    addBankAccount(savings);
    
    if (onSuccess) {
      onSuccess();
    }
  });
}

// Render the Bank Connections page
export function renderBankConnectionsPage() {
  // Main container
  const connectionsContainer = document.createElement('div');
  connectionsContainer.className = 'bank-connections-container p-4 max-w-6xl mx-auto';
  
  // Get bank connections
  const connections = getBankConnections();
  const accountTypes = getAccountTypes();
  
  // Calculate totals
  const totalAssets = calculateTotalBalance(connections);
  const totalDebt = calculateTotalDebt(connections);
  const netWorth = totalAssets - totalDebt;
  
  // Header section
  const header = document.createElement('header');
  header.className = 'mb-6';
  header.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold mb-1">Bank Connections</h1>
        <p class="text-gray-600">Manage your linked bank accounts</p>
      </div>
      <div class="mt-4 md:mt-0">
        <button id="connect-bank-btn" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
          + Connect Bank
        </button>
      </div>
    </div>
  `;
  connectionsContainer.appendChild(header);
  
  // Balance summary cards
  const summarySection = document.createElement('section');
  summarySection.className = 'summary-cards grid grid-cols-1 md:grid-cols-3 gap-4 mb-8';
  
  // Total assets card
  const assetsCard = document.createElement('div');
  assetsCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  assetsCard.innerHTML = `
    <div class="card-header mb-2">
      <h3 class="text-lg font-semibold">Total Assets</h3>
    </div>
    <div class="card-value text-2xl font-bold">${formatCurrency(totalAssets)}</div>
    <div class="text-sm text-gray-600 mt-1">${connections.filter(conn => conn.balance > 0).length} accounts</div>
  `;
  
  // Total debt card
  const debtCard = document.createElement('div');
  debtCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  debtCard.innerHTML = `
    <div class="card-header mb-2">
      <h3 class="text-lg font-semibold">Total Debt</h3>
    </div>
    <div class="card-value text-2xl font-bold">${formatCurrency(totalDebt)}</div>
    <div class="text-sm text-gray-600 mt-1">${connections.filter(conn => conn.balance < 0).length || 0} accounts</div>
  `;
  
  // Net worth card
  const netWorthCard = document.createElement('div');
  netWorthCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  netWorthCard.innerHTML = `
    <div class="card-header mb-2">
      <h3 class="text-lg font-semibold">Net Worth</h3>
    </div>
    <div class="card-value text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}">${formatCurrency(netWorth)}</div>
    <div class="text-sm text-gray-600 mt-1">Assets - Debts</div>
  `;
  
  summarySection.appendChild(assetsCard);
  summarySection.appendChild(debtCard);
  summarySection.appendChild(netWorthCard);
  connectionsContainer.appendChild(summarySection);
  
  // Connected accounts section
  const accountsSection = document.createElement('section');
  accountsSection.className = 'accounts-section mb-8';
  accountsSection.innerHTML = `
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Connected Accounts</h2>
        <div class="flex space-x-2">
          <select id="account-filter" class="p-2 border rounded-md text-sm">
            <option value="all">All Account Types</option>
            ${accountTypes.map(type => `
              <option value="${type.id}">${type.icon} ${type.name}</option>
            `).join('')}
          </select>
          <select id="account-sort" class="p-2 border rounded-md text-sm">
            <option value="balance">Balance</option>
            <option value="name">Name</option>
            <option value="date">Last Updated</option>
          </select>
        </div>
      </div>
      
      ${connections.length > 0 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="accounts-grid">
          ${connections.map(account => {
            const accountType = accountTypes.find(type => type.id === account.type) || { name: 'Other', icon: '📌' };
            
            return `
              <div class="account-card border rounded-lg overflow-hidden" data-account-id="${account.id}" data-account-type="${account.type}">
                <div class="account-header bg-gray-50 p-4 flex justify-between items-center border-b">
                  <div class="flex items-center">
                    <div class="text-2xl mr-2">${account.logo || accountType.icon}</div>
                    <div>
                      <div class="font-medium">${account.name}</div>
                      <div class="text-xs text-gray-500">${account.institution}</div>
                    </div>
                  </div>
                  <div class="account-actions">
                    <button class="text-gray-500 hover:text-gray-700 view-account-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="account-body p-4">
                  <div class="flex justify-between mb-3">
                    <div class="text-sm text-gray-500">Balance</div>
                    <div class="font-medium">${formatCurrency(account.balance)}</div>
                  </div>
                  <div class="flex justify-between mb-3">
                    <div class="text-sm text-gray-500">Available</div>
                    <div class="font-medium">${formatCurrency(account.availableBalance)}</div>
                  </div>
                  <div class="flex justify-between text-xs text-gray-500">
                    <div>Last updated</div>
                    <div>${formatDate(account.lastUpdated)}</div>
                  </div>
                </div>
                <div class="account-footer p-4 border-t bg-gray-50">
                  <div class="text-sm text-gray-600">Recent Transactions</div>
                  ${account.recentTransactions && account.recentTransactions.length > 0 ? `
                    <div class="recent-transactions mt-2 space-y-1">
                      ${account.recentTransactions.slice(0, 2).map(transaction => `
                        <div class="transaction-item flex justify-between items-center text-sm">
                          <div class="transaction-name truncate max-w-[120px]">${transaction.description}</div>
                          <div class="transaction-amount ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'} font-medium">
                            ${formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      `).join('')}
                    </div>
                    <div class="text-center mt-2">
                      <button class="view-transactions-btn text-primary text-xs hover:underline">
                        View all transactions
                      </button>
                    </div>
                  ` : `
                    <div class="text-center py-2 text-gray-500 text-xs">
                      No recent transactions
                    </div>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="text-center py-8 text-gray-500">
          <p>No bank accounts connected</p>
          <button id="connect-first-bank-btn" class="mt-2 text-primary hover:underline">Connect your first bank</button>
        </div>
      `}
    </div>
  `;
  connectionsContainer.appendChild(accountsSection);
  
  // Add event listeners
  setTimeout(() => {
    // Connect bank button
    const connectBankBtn = connectionsContainer.querySelector('#connect-bank-btn');
    if (connectBankBtn) {
      connectBankBtn.addEventListener('click', () => {
        setupPlaidLink(() => {
          // Refresh the page after successful connection
          window.location.reload();
        });
      });
    }
    
    // Connect first bank button (shown when no accounts exist)
    const connectFirstBankBtn = connectionsContainer.querySelector('#connect-first-bank-btn');
    if (connectFirstBankBtn) {
      connectFirstBankBtn.addEventListener('click', () => {
        const connectBankBtn = connectionsContainer.querySelector('#connect-bank-btn');
        if (connectBankBtn) {
          connectBankBtn.click();
        }
      });
    }
    
    // Account filter
    const accountFilter = connectionsContainer.querySelector('#account-filter');
    const accountSort = connectionsContainer.querySelector('#account-sort');
    
    function applyFiltersAndSort() {
      const filterValue = accountFilter.value;
      const sortValue = accountSort.value;
      
      // Get all account cards
      const accountCards = connectionsContainer.querySelectorAll('.account-card');
      const accountsGrid = connectionsContainer.querySelector('#accounts-grid');
      
      // Applied filtered accounts
      let visibleCount = 0;
      
      accountCards.forEach(card => {
        const accountType = card.dataset.accountType;
        
        // Apply type filter
        if (filterValue === 'all' || accountType === filterValue) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });
      
      // Show no results message if no accounts match filter
      const noResultsMessage = connectionsContainer.querySelector('.no-results-message');
      
      if (visibleCount === 0) {
        if (!noResultsMessage) {
          const message = document.createElement('div');
          message.className = 'no-results-message text-center py-4 text-gray-500';
          message.textContent = 'No accounts match the selected filter';
          accountsGrid.appendChild(message);
        }
      } else if (noResultsMessage) {
        noResultsMessage.remove();
      }
      
      // Apply sorting - since we're using a grid layout, we need to remove and re-append in the right order
      if (sortValue !== 'none') {
        const accountsArray = Array.from(accountCards);
        
        accountsArray.sort((a, b) => {
          // Only sort cards that are visible
          if (a.style.display === 'none' || b.style.display === 'none') {
            return 0;
          }
          
          const aId = a.dataset.accountId;
          const bId = b.dataset.accountId;
          
          const aAccount = connections.find(acc => acc.id == aId);
          const bAccount = connections.find(acc => acc.id == bId);
          
          if (!aAccount || !bAccount) return 0;
          
          if (sortValue === 'balance') {
            return bAccount.balance - aAccount.balance;
          } else if (sortValue === 'name') {
            return aAccount.name.localeCompare(bAccount.name);
          } else if (sortValue === 'date') {
            return new Date(bAccount.lastUpdated) - new Date(aAccount.lastUpdated);
          }
          
          return 0;
        });
        
        // Reappend in sorted order
        accountsArray.forEach(card => {
          accountsGrid.appendChild(card);
        });
      }
    }
    
    if (accountFilter) {
      accountFilter.addEventListener('change', applyFiltersAndSort);
    }
    
    if (accountSort) {
      accountSort.addEventListener('change', applyFiltersAndSort);
    }
    
    // View account buttons
    const viewAccountBtns = connectionsContainer.querySelectorAll('.view-account-btn');
    viewAccountBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.account-card');
        const accountId = card.dataset.accountId;
        
        // Find the account
        const account = connections.find(acc => acc.id == accountId);
        if (!account) return;
        
        // Show account details modal
        showAccountDetailsModal(account);
      });
    });
    
    // View transactions buttons
    const viewTransactionsBtns = connectionsContainer.querySelectorAll('.view-transactions-btn');
    viewTransactionsBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.account-card');
        const accountId = card.dataset.accountId;
        
        // Find the account
        const account = connections.find(acc => acc.id == accountId);
        if (!account) return;
        
        // Show transactions modal
        showTransactionsModal(account);
      });
    });
  }, 100);
  
  return connectionsContainer;
}

// Show account details modal
function showAccountDetailsModal(account) {
  const accountType = getAccountTypes().find(type => type.id === account.type) || { name: 'Other', icon: '📌' };
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.style.backdropFilter = 'blur(3px)';
  
  modal.innerHTML = `
    <div class="bg-white rounded-lg w-full max-w-lg p-6 relative">
      <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      
      <div class="flex items-center mb-6">
        <div class="text-3xl mr-3">${account.logo || accountType.icon}</div>
        <div>
          <h2 class="text-xl font-bold">${account.name}</h2>
          <div class="text-gray-600">${account.institution}</div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-500 mb-1">Current Balance</div>
          <div class="text-xl font-bold">${formatCurrency(account.balance)}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-500 mb-1">Available Balance</div>
          <div class="text-xl font-bold">${formatCurrency(account.availableBalance)}</div>
        </div>
      </div>
      
      <div class="border-t border-b py-4 mb-6">
        <h3 class="font-medium mb-3">Account Details</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-500 mb-1">Account Type</div>
            <div>${accountType.name}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Account Number</div>
            <div>${account.accountNumber}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Routing Number</div>
            <div>${account.routingNumber}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Last Updated</div>
            <div>${formatDate(account.lastUpdated)}</div>
          </div>
        </div>
      </div>
      
      <div class="flex space-x-3">
        <button class="view-all-transactions flex-1 px-4 py-2 bg-primary text-white rounded-md">
          View Transactions
        </button>
        <button class="disconnect-account px-4 py-2 border border-gray-300 rounded-md text-gray-700">
          Disconnect
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close button event listener
  const closeButton = modal.querySelector('button');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // View all transactions button
  const viewTransactionsBtn = modal.querySelector('.view-all-transactions');
  viewTransactionsBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
    showTransactionsModal(account);
  });
  
  // Disconnect account button
  const disconnectBtn = modal.querySelector('.disconnect-account');
  disconnectBtn.addEventListener('click', () => {
    if (confirm(`Are you sure you want to disconnect the "${account.name}" account?`)) {
      // Simulate disconnecting the account by removing it from state
      if (appState.bankConnections) {
        appState.bankConnections = appState.bankConnections.filter(conn => conn.id !== account.id);
        
        // Save to local storage
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            localStorage.setItem('stackr-finance-state', JSON.stringify(appState));
            console.log('Bank account disconnected successfully');
          } catch (error) {
            console.error('Error saving to localStorage:', error);
          }
        }
      }
      
      document.body.removeChild(modal);
      
      // Refresh the page
      window.location.reload();
    }
  });
}

// Show transactions modal
function showTransactionsModal(account) {
  // Generate more transactions if few exist
  let transactions = account.recentTransactions || [];
  
  if (transactions.length < 10) {
    // Add some additional transactions
    const sampleTransactions = [
      { description: 'Grocery Store', amount: -52.37, category: 'Groceries' },
      { description: 'Gas Station', amount: -35.82, category: 'Transportation' },
      { description: 'Pharmacy', amount: -18.75, category: 'Health' },
      { description: 'Restaurant', amount: -42.18, category: 'Dining' },
      { description: 'Online Retailer', amount: -67.99, category: 'Shopping' },
      { description: 'Utility Bill', amount: -85.23, category: 'Utilities' },
      { description: 'Mobile Phone', amount: -75.00, category: 'Utilities' },
      { description: 'Streaming Service', amount: -12.99, category: 'Entertainment' },
      { description: 'Transfer', amount: 200.00, category: 'Transfer' },
      { description: 'ATM Withdrawal', amount: -80.00, category: 'Cash' }
    ];
    
    const existingCount = transactions.length;
    const additionalNeeded = 10 - existingCount;
    
    for (let i = 0; i < additionalNeeded; i++) {
      const sample = sampleTransactions[Math.floor(Math.random() * sampleTransactions.length)];
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      transactions.push({
        id: Date.now() + i,
        date: date.toISOString(),
        description: sample.description,
        amount: sample.amount,
        category: sample.category
      });
    }
    
    // Sort by date, newest first
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.style.backdropFilter = 'blur(3px)';
  
  modal.innerHTML = `
    <div class="bg-white rounded-lg w-full max-w-3xl p-6 relative max-h-[90vh] flex flex-col">
      <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      
      <div class="flex items-center mb-6">
        <h2 class="text-xl font-bold">${account.name} Transactions</h2>
      </div>
      
      <div class="flex space-x-3 mb-4">
        <div class="flex-1">
          <input type="text" placeholder="Search transactions..." class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        <select class="p-2 border border-gray-300 rounded-md">
          <option value="all">All Categories</option>
          <option value="income">Income</option>
          <option value="expenses">Expenses</option>
        </select>
      </div>
      
      <div class="overflow-y-auto flex-1">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${transactions.map((transaction, index) => `
              <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  ${formatDate(transaction.date)}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  ${transaction.description}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  ${transaction.category}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}">
                  ${formatCurrency(transaction.amount)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="flex justify-end mt-4">
        <button class="px-4 py-2 bg-primary text-white rounded-md">
          Export Transactions
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close button event listener
  const closeButton = modal.querySelector('button');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Export button event listener
  const exportButton = modal.querySelector('.flex.justify-end button');
  exportButton.addEventListener('click', () => {
    alert('Export functionality will be available in a future update!');
  });
}