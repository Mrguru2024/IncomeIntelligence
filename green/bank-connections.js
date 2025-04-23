/**
 * Bank Connections Management Module
 * This module handles displaying and managing bank connections for the GREEN version
 */

import { connectBankAccount, syncTransactions, importTransactionsAsIncome } from './plaid-link.js';

// Store connections data
let userConnections = [];
let connectionAccounts = {};

/**
 * Fetch all bank connections for the current user
 * @param {number} userId - Current user ID
 * @returns {Promise<Array>} - Array of bank connections
 */
async function fetchUserConnections(userId) {
  try {
    const response = await fetch(`/api/bank-connections/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch bank connections');
    }
    
    userConnections = await response.json();
    return userConnections;
  } catch (error) {
    console.error('Error fetching bank connections:', error);
    return [];
  }
}

/**
 * Fetch accounts for a specific bank connection
 * @param {number} connectionId - Bank connection ID
 * @returns {Promise<Array>} - Array of bank accounts
 */
async function fetchConnectionAccounts(connectionId) {
  try {
    const response = await fetch(`/api/bank-connections/${connectionId}/accounts`);
    if (!response.ok) {
      throw new Error('Failed to fetch bank accounts');
    }
    
    const accounts = await response.json();
    connectionAccounts[connectionId] = accounts;
    return accounts;
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    connectionAccounts[connectionId] = [];
    return [];
  }
}

/**
 * Format currency value
 * @param {string|number} value - The currency value to format
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(value) {
  if (!value && value !== 0) return 'N/A';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(numValue);
}

/**
 * Format date string
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Create bank connection card element
 * @param {Object} connection - Bank connection data
 * @returns {HTMLElement} - Connection card element
 */
function createConnectionCard(connection) {
  // Create card container
  const card = document.createElement('div');
  card.classList.add('bank-connection-card');
  card.style.border = '1px solid var(--color-border)';
  card.style.borderRadius = 'var(--radius-lg)';
  card.style.background = 'var(--color-card)';
  card.style.overflow = 'hidden';
  card.style.marginBottom = '16px';
  card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  
  // Card header
  const header = document.createElement('div');
  header.classList.add('card-header');
  header.style.padding = '16px';
  header.style.borderBottom = '1px solid var(--color-border)';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.background = 'var(--color-card)';
  
  // Institution info
  const institutionInfo = document.createElement('div');
  institutionInfo.style.display = 'flex';
  institutionInfo.style.alignItems = 'center';
  
  const institutionIcon = document.createElement('div');
  institutionIcon.classList.add('institution-icon');
  institutionIcon.style.width = '40px';
  institutionIcon.style.height = '40px';
  institutionIcon.style.borderRadius = '8px';
  institutionIcon.style.background = 'var(--color-primary-light)';
  institutionIcon.style.display = 'flex';
  institutionIcon.style.alignItems = 'center';
  institutionIcon.style.justifyContent = 'center';
  institutionIcon.style.marginRight = '12px';
  institutionIcon.style.color = 'var(--color-primary)';
  institutionIcon.style.fontWeight = 'bold';
  institutionIcon.style.fontSize = '16px';
  institutionIcon.textContent = connection.institutionName.substring(0, 1);
  
  const institutionName = document.createElement('div');
  institutionName.classList.add('institution-name');
  institutionName.style.fontWeight = 'bold';
  institutionName.style.fontSize = '16px';
  institutionName.textContent = connection.institutionName;
  
  institutionInfo.appendChild(institutionIcon);
  institutionInfo.appendChild(institutionName);
  
  // Status badge
  const statusBadge = document.createElement('div');
  statusBadge.classList.add('status-badge');
  statusBadge.style.padding = '4px 8px';
  statusBadge.style.borderRadius = '12px';
  statusBadge.style.fontSize = '12px';
  statusBadge.style.fontWeight = 'medium';
  
  if (connection.status === 'active') {
    statusBadge.style.background = '#e6f7e6';
    statusBadge.style.color = '#2e7d32';
    statusBadge.textContent = 'Active';
  } else {
    statusBadge.style.background = '#ffebee';
    statusBadge.style.color = '#c62828';
    statusBadge.textContent = connection.status.charAt(0).toUpperCase() + connection.status.slice(1);
  }
  
  header.appendChild(institutionInfo);
  header.appendChild(statusBadge);
  
  // Card content
  const content = document.createElement('div');
  content.classList.add('card-content');
  content.style.padding = '16px';
  
  // Last updated info
  const lastUpdated = document.createElement('div');
  lastUpdated.style.marginBottom = '16px';
  lastUpdated.style.fontSize = '14px';
  lastUpdated.style.color = 'var(--color-text-secondary)';
  
  const lastSyncTime = connection.metadata?.lastSyncTime || null;
  lastUpdated.textContent = `Last synced: ${formatDate(lastSyncTime)}`;
  
  content.appendChild(lastUpdated);
  
  // Accounts container
  const accountsContainer = document.createElement('div');
  accountsContainer.classList.add('accounts-container');
  accountsContainer.style.marginBottom = '16px';
  accountsContainer.dataset.connectionId = connection.id;
  
  // Loading indicator for accounts
  const accountsLoading = document.createElement('div');
  accountsLoading.classList.add('accounts-loading');
  accountsLoading.style.padding = '8px 0';
  accountsLoading.style.fontSize = '14px';
  accountsLoading.style.color = 'var(--color-text-secondary)';
  accountsLoading.textContent = 'Loading accounts...';
  
  accountsContainer.appendChild(accountsLoading);
  
  content.appendChild(accountsContainer);
  
  // Card actions
  const actions = document.createElement('div');
  actions.classList.add('card-actions');
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  
  // Sync button
  const syncBtn = document.createElement('button');
  syncBtn.classList.add('btn', 'btn-secondary');
  syncBtn.style.display = 'flex';
  syncBtn.style.alignItems = 'center';
  syncBtn.style.gap = '4px';
  syncBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg> Sync';
  
  syncBtn.addEventListener('click', async () => {
    try {
      await syncTransactions(connection.id);
      // Refresh the page after successful sync
      window.location.reload();
    } catch (error) {
      console.error('Error syncing transactions:', error);
    }
  });
  
  // Import button
  const importBtn = document.createElement('button');
  importBtn.classList.add('btn', 'btn-secondary');
  importBtn.style.display = 'flex';
  importBtn.style.alignItems = 'center';
  importBtn.style.gap = '4px';
  importBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M5 15l7 7 7-7"/></svg> Import';
  
  importBtn.addEventListener('click', async () => {
    try {
      await importTransactionsAsIncome(connection.id);
      // Refresh the page after successful import
      window.location.reload();
    } catch (error) {
      console.error('Error importing transactions:', error);
    }
  });
  
  actions.appendChild(syncBtn);
  actions.appendChild(importBtn);
  
  content.appendChild(actions);
  
  // Append all parts to card
  card.appendChild(header);
  card.appendChild(content);
  
  // Load accounts for this connection
  fetchConnectionAccounts(connection.id).then(accounts => {
    // Remove loading indicator
    accountsContainer.innerHTML = '';
    
    if (accounts.length === 0) {
      const noAccountsMsg = document.createElement('div');
      noAccountsMsg.style.padding = '8px 0';
      noAccountsMsg.style.fontSize = '14px';
      noAccountsMsg.style.color = 'var(--color-text-secondary)';
      noAccountsMsg.textContent = 'No accounts found';
      
      accountsContainer.appendChild(noAccountsMsg);
      return;
    }
    
    // Create accounts table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '14px';
    
    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="text-align: left; padding: 8px 4px; border-bottom: 1px solid var(--color-border);">Account</th>
        <th style="text-align: right; padding: 8px 4px; border-bottom: 1px solid var(--color-border);">Available</th>
        <th style="text-align: right; padding: 8px 4px; border-bottom: 1px solid var(--color-border);">Current</th>
      </tr>
    `;
    
    // Table body
    const tbody = document.createElement('tbody');
    
    accounts.forEach(account => {
      const tr = document.createElement('tr');
      
      // Account info cell
      const accountCell = document.createElement('td');
      accountCell.style.padding = '8px 4px';
      accountCell.style.borderBottom = '1px solid var(--color-border)';
      
      const accountInfo = document.createElement('div');
      
      const accountName = document.createElement('div');
      accountName.style.fontWeight = '500';
      accountName.textContent = account.accountName;
      
      const accountType = document.createElement('div');
      accountType.style.fontSize = '12px';
      accountType.style.color = 'var(--color-text-secondary)';
      accountType.textContent = `${account.accountType}${account.accountSubtype ? ` · ${account.accountSubtype}` : ''}${account.mask ? ` · ••••${account.mask}` : ''}`;
      
      accountInfo.appendChild(accountName);
      accountInfo.appendChild(accountType);
      accountCell.appendChild(accountInfo);
      
      // Available balance cell
      const availableCell = document.createElement('td');
      availableCell.style.padding = '8px 4px';
      availableCell.style.textAlign = 'right';
      availableCell.style.borderBottom = '1px solid var(--color-border)';
      availableCell.textContent = formatCurrency(account.balanceAvailable);
      
      // Current balance cell
      const currentCell = document.createElement('td');
      currentCell.style.padding = '8px 4px';
      currentCell.style.textAlign = 'right';
      currentCell.style.borderBottom = '1px solid var(--color-border)';
      currentCell.textContent = formatCurrency(account.balanceCurrent);
      
      tr.appendChild(accountCell);
      tr.appendChild(availableCell);
      tr.appendChild(currentCell);
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    accountsContainer.appendChild(table);
  });
  
  return card;
}

/**
 * Render the bank connections page
 * @param {number} userId - Current user ID
 * @returns {HTMLElement} - Bank connections page element
 */
/**
 * Check if a user has any bank accounts connected
 * @param {string|number} userId - User ID
 * @returns {Promise<boolean>} - True if user has at least one bank account connected
 */
export async function hasBankConnections(userId) {
  try {
    const connections = await fetchUserConnections(userId);
    return connections && connections.length > 0;
  } catch (error) {
    console.error('Error checking bank connections:', error);
    return false;
  }
}

/**
 * Get bank connection status badge element
 * @param {string|number} userId - User ID
 * @returns {Promise<HTMLElement>} - Status badge element
 */
export async function getBankConnectionStatusBadge(userId) {
  const statusBadge = document.createElement('div');
  statusBadge.style.display = 'inline-flex';
  statusBadge.style.alignItems = 'center';
  statusBadge.style.gap = '6px';
  statusBadge.style.padding = '4px 10px';
  statusBadge.style.borderRadius = '20px';
  statusBadge.style.fontSize = '13px';
  statusBadge.style.fontWeight = '500';
  
  // Start with a loading status
  statusBadge.style.backgroundColor = '#f9f9f9';
  statusBadge.style.color = '#888888';
  statusBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> <span>Checking...</span>';
  
  try {
    const hasConnections = await hasBankConnections(userId);
    
    if (hasConnections) {
      statusBadge.style.backgroundColor = '#E8F5E9';
      statusBadge.style.color = '#2E7D32';
      statusBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Bank Connected</span>';
    } else {
      statusBadge.style.backgroundColor = '#FFF8E1';
      statusBadge.style.color = '#F57C00';
      statusBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> <span>No Bank Connected</span>';
    }
  } catch (error) {
    statusBadge.style.backgroundColor = '#FFEBEE';
    statusBadge.style.color = '#C62828';
    statusBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> <span>Connection Error</span>';
  }
  
  return statusBadge;
}

// Import responsive utilities
import { responsive } from './sidebar.js';

export async function renderBankConnectionsPage(userId) {
  // Create page container
  const container = document.createElement('div');
  container.classList.add('bank-connections-page');
  container.style.padding = responsive.isMobile() ? '16px' : '24px';
  container.style.width = '100%';
  container.style.maxWidth = '1200px';
  container.style.margin = '0 auto';
  
  // Page header
  const header = document.createElement('div');
  header.classList.add('page-header');
  header.style.marginBottom = '24px';
  
  const title = document.createElement('h1');
  title.classList.add('page-title');
  title.style.fontSize = '24px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '8px';
  title.textContent = 'Bank Connections';
  
  const description = document.createElement('p');
  description.classList.add('page-description');
  description.style.fontSize = '16px';
  description.style.color = 'var(--color-text-secondary)';
  description.style.marginBottom = '24px';
  description.textContent = 'Connect your bank accounts to automatically import transactions and track your finances.';
  
  header.appendChild(title);
  header.appendChild(description);
  
  // Add bank button
  const addBankButton = document.createElement('button');
  addBankButton.classList.add('btn', 'btn-primary');
  addBankButton.style.display = 'flex';
  addBankButton.style.alignItems = 'center';
  addBankButton.style.gap = '8px';
  addBankButton.style.marginBottom = '24px';
  addBankButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg> Connect Bank';
  
  addBankButton.addEventListener('click', () => {
    connectBankAccount(userId);
  });
  
  // Connections container
  const connectionsContainer = document.createElement('div');
  connectionsContainer.classList.add('connections-container');
  
  // Loading indicator
  const loadingEl = document.createElement('div');
  loadingEl.classList.add('loading-indicator');
  loadingEl.style.textAlign = 'center';
  loadingEl.style.padding = '40px 0';
  loadingEl.style.color = 'var(--color-text-secondary)';
  loadingEl.textContent = 'Loading bank connections...';
  
  connectionsContainer.appendChild(loadingEl);
  
  // Load bank connections
  fetchUserConnections(userId).then(connections => {
    // Clear loading
    connectionsContainer.innerHTML = '';
    
    if (connections.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.classList.add('empty-state');
      emptyState.style.textAlign = 'center';
      emptyState.style.padding = '40px 0';
      emptyState.style.color = 'var(--color-text-secondary)';
      emptyState.style.background = 'var(--color-card)';
      emptyState.style.borderRadius = 'var(--radius-lg)';
      emptyState.style.marginBottom = '24px';
      
      const emptyIcon = document.createElement('div');
      emptyIcon.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/><path d="M15 9h0M9 9h0"/><path d="M10 13h4"/><path d="M4 9h1M4 13h1"/><path d="M19 9h1M19 13h1"/></svg>';
      emptyIcon.style.marginBottom = '16px';
      
      const emptyTitle = document.createElement('h3');
      emptyTitle.style.fontSize = '18px';
      emptyTitle.style.fontWeight = 'bold';
      emptyTitle.style.marginBottom = '8px';
      emptyTitle.textContent = 'No bank accounts connected';
      
      const emptyText = document.createElement('p');
      emptyText.style.marginBottom = '16px';
      emptyText.textContent = 'Connect your bank accounts to automatically import transactions.';
      
      const emptyButton = document.createElement('button');
      emptyButton.classList.add('btn', 'btn-primary');
      emptyButton.textContent = 'Connect Bank';
      emptyButton.addEventListener('click', () => {
        connectBankAccount(userId);
      });
      
      emptyState.appendChild(emptyIcon);
      emptyState.appendChild(emptyTitle);
      emptyState.appendChild(emptyText);
      emptyState.appendChild(emptyButton);
      
      connectionsContainer.appendChild(emptyState);
    } else {
      // Render each connection
      connections.forEach(connection => {
        const card = createConnectionCard(connection);
        connectionsContainer.appendChild(card);
      });
    }
  });
  
  // Combine all elements
  container.appendChild(header);
  container.appendChild(addBankButton);
  container.appendChild(connectionsContainer);
  
  return container;
}