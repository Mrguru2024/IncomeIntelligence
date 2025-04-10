/**
 * Plaid Link integration for the GREEN version
 * This file provides the functionality to connect to bank accounts via Plaid
 */

let plaidLinkHandler = null;

/**
 * Create a Plaid Link handler for connecting bank accounts
 * @param {string} linkToken - Plaid Link token from API
 * @param {Function} onSuccess - Callback when user successfully links account
 * @param {Function} onExit - Callback when user exits without linking
 * @returns {Object} - Plaid Link handler
 */
function createPlaidLink(linkToken, onSuccess, onExit) {
  // Dynamically load the Plaid Link script if it's not already loaded
  if (!document.getElementById('plaid-link-script')) {
    const script = document.createElement('script');
    script.id = 'plaid-link-script';
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    document.head.appendChild(script);
    
    // Wait for script to load before initializing
    return new Promise((resolve) => {
      script.onload = () => {
        initializePlaidLink(linkToken, onSuccess, onExit).then(resolve);
      };
    });
  } else {
    return initializePlaidLink(linkToken, onSuccess, onExit);
  }
}

/**
 * Initialize Plaid Link once the script is loaded
 * @param {string} linkToken - Plaid Link token from API
 * @param {Function} onSuccess - Callback when user successfully links account
 * @param {Function} onExit - Callback when user exits without linking
 * @returns {Promise<Object>} - Plaid Link handler
 */
function initializePlaidLink(linkToken, onSuccess, onExit) {
  return new Promise((resolve) => {
    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: (public_token, metadata) => {
        if (onSuccess) {
          onSuccess(public_token, metadata);
        }
      },
      onExit: (err, metadata) => {
        if (onExit) {
          onExit(err, metadata);
        }
      },
      onLoad: () => {
        // Handler is ready to use
        plaidLinkHandler = handler;
        resolve(handler);
      },
      onEvent: (eventName, metadata) => {
        console.log('Plaid Link Event:', eventName, metadata);
      },
    });
  });
}

/**
 * Open Plaid Link to connect a bank account
 * @param {number} userId - User ID for the current user
 * @returns {Promise<Object>} - Result of the bank connection
 */
export async function connectBankAccount(userId) {
  try {
    // Show loading indicator
    showLoading('Preparing to connect to your bank...');
    
    // Get a link token from the server
    const response = await fetch('/api/plaid/create-link-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get link token');
    }
    
    const { linkToken } = await response.json();
    
    // Create and open Plaid Link
    hideLoading();
    
    const handler = await createPlaidLink(
      linkToken,
      async (public_token, metadata) => {
        showLoading('Connecting to your bank...');
        
        // Exchange public token for access token
        try {
          const exchangeResponse = await fetch('/api/plaid/exchange-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              publicToken: public_token,
              metadata,
            }),
          });
          
          if (!exchangeResponse.ok) {
            const errorData = await exchangeResponse.json();
            throw new Error(errorData.message || 'Failed to exchange token');
          }
          
          const { connectionId } = await exchangeResponse.json();
          
          // Sync transactions for the new connection
          await syncTransactions(connectionId);
          
          showSuccess('Bank connected successfully!');
          // Reload connection data
          setTimeout(() => {
            window.location.hash = '#bankconnections';
            window.location.reload();
          }, 1500);
        } catch (error) {
          showError(error.message || 'Failed to connect bank account');
        } finally {
          hideLoading();
        }
      },
      (err, metadata) => {
        if (err) {
          showError(err.message || 'Error connecting to bank');
        }
      }
    );
    
    handler.open();
    return handler;
  } catch (error) {
    hideLoading();
    showError(error.message || 'Failed to connect bank account');
    throw error;
  }
}

/**
 * Sync transactions for a bank connection
 * @param {number} connectionId - Bank connection ID
 * @returns {Promise} - Result of sync operation
 */
export async function syncTransactions(connectionId) {
  try {
    showLoading('Syncing transactions...');
    
    const response = await fetch(`/api/bank-connections/${connectionId}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to sync transactions');
    }
    
    showSuccess('Transactions synced successfully!');
    return response.json();
  } catch (error) {
    showError(error.message || 'Failed to sync transactions');
    throw error;
  } finally {
    hideLoading();
  }
}

/**
 * Import positive transactions as income
 * @param {number} connectionId - Bank connection ID
 * @returns {Promise} - Result of import operation
 */
export async function importTransactionsAsIncome(connectionId) {
  try {
    showLoading('Importing transactions as income...');
    
    const response = await fetch(`/api/bank-connections/${connectionId}/import-income`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to import transactions');
    }
    
    showSuccess('Transactions imported as income successfully!');
    return response.json();
  } catch (error) {
    showError(error.message || 'Failed to import transactions');
    throw error;
  } finally {
    hideLoading();
  }
}

// Utility functions for UI feedback

function showLoading(message) {
  // Check if loading element already exists
  let loadingEl = document.getElementById('plaid-loading');
  if (!loadingEl) {
    loadingEl = document.createElement('div');
    loadingEl.id = 'plaid-loading';
    loadingEl.classList.add('loading-overlay');
    
    const spinnerEl = document.createElement('div');
    spinnerEl.classList.add('loading-spinner');
    
    const messageEl = document.createElement('div');
    messageEl.classList.add('loading-message');
    
    loadingEl.appendChild(spinnerEl);
    loadingEl.appendChild(messageEl);
    document.body.appendChild(loadingEl);
    
    // Add styles if not already present
    if (!document.getElementById('plaid-loading-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'plaid-loading-styles';
      styleEl.textContent = `
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          color: white;
        }
        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 4px solid white;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        .loading-message {
          font-size: 16px;
          font-weight: 500;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }
  
  // Update message
  const messageEl = loadingEl.querySelector('.loading-message');
  if (messageEl) {
    messageEl.textContent = message;
  }
  
  // Show the loading overlay
  loadingEl.style.display = 'flex';
}

function hideLoading() {
  const loadingEl = document.getElementById('plaid-loading');
  if (loadingEl) {
    loadingEl.style.display = 'none';
  }
}

function showSuccess(message) {
  // Create toast notification
  createToast(message, 'success');
}

function showError(message) {
  // Create toast notification
  createToast(message, 'error');
}

function createToast(message, type = 'info') {
  // Check if toast container exists
  let toastContainer = document.getElementById('plaid-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'plaid-toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '10000';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.classList.add('plaid-toast');
  toast.classList.add(`plaid-toast-${type}`);
  
  toast.style.backgroundColor = type === 'error' ? '#f44336' : '#4caf50';
  toast.style.color = 'white';
  toast.style.padding = '12px 20px';
  toast.style.marginBottom = '10px';
  toast.style.borderRadius = '4px';
  toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.justifyContent = 'space-between';
  toast.style.minWidth = '300px';
  toast.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 2.7s';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  toast.style.transition = 'opacity 0.3s, transform 0.3s';
  
  // Add content
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '18px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.marginLeft = '10px';
  closeButton.onclick = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  };
  
  toast.appendChild(messageDiv);
  toast.appendChild(closeButton);
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Show toast with animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}