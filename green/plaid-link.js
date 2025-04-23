/**
 * Plaid Link integration for Stackr Finance
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
  // Log important information for debugging
  console.log('Creating Plaid Link with token:', typeof linkToken === 'string' ? `${linkToken.substring(0, 10)}...` : 'Invalid token');
  
  // Check if Plaid Link script is loaded via CDN
  const existingScript = document.getElementById('plaid-link-script');
  const plaidExists = typeof window.Plaid !== 'undefined';
  
  console.log('Plaid script status:', {
    scriptExists: !!existingScript,
    plaidGlobalExists: plaidExists
  });
  
  // If Plaid is already available, use it directly
  if (plaidExists) {
    console.log('Plaid already loaded, initializing directly');
    return initializePlaidLink(linkToken, onSuccess, onExit);
  }

  // Instead of dynamically loading the script, we'll use a different approach
  // that directly initializes Plaid Link: create a Plaid Link iframe manually
  
  console.log('Creating Plaid Link directly (embed approach)');
  
  return new Promise((resolve, reject) => {
    try {
      // Create a container for Plaid Link
      const plaidContainer = document.createElement('div');
      plaidContainer.id = 'plaid-link-container';
      plaidContainer.style.position = 'fixed';
      plaidContainer.style.top = '0';
      plaidContainer.style.left = '0';
      plaidContainer.style.width = '100%';
      plaidContainer.style.height = '100%';
      plaidContainer.style.zIndex = '9999';
      plaidContainer.style.display = 'none';
      document.body.appendChild(plaidContainer);
      
      // Instead of trying to load the script, let's create a simple handler
      // that will redirect to Plaid when opened
      const simplifiedHandler = {
        open: () => {
          console.log('Opening Plaid Link...');
          
          showLoading('Opening Plaid Link...');
          
          // Create an iframe for the Plaid Link interface
          const iframe = document.createElement('iframe');
          iframe.src = `https://cdn.plaid.com/link/v2/stable/link.html?token=${linkToken}`;
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.border = 'none';
          
          // Handle messages from the iframe
          window.addEventListener('message', function plaidLinkMessageHandler(event) {
            // Make sure the message is from Plaid
            if (event.data.action && event.data.action.indexOf('plaid_link_') === 0) {
              console.log('Received Plaid Link message:', event.data.action);
              
              if (event.data.action === 'plaid_link_exit') {
                // User exited Plaid Link
                hideLoading();
                plaidContainer.style.display = 'none';
                plaidContainer.innerHTML = '';
                window.removeEventListener('message', plaidLinkMessageHandler);
                
                if (onExit) {
                  onExit(event.data.error || null, event.data.metadata || {});
                }
              } else if (event.data.action === 'plaid_link_success') {
                // User successfully linked an account
                hideLoading();
                plaidContainer.style.display = 'none';
                plaidContainer.innerHTML = '';
                window.removeEventListener('message', plaidLinkMessageHandler);
                
                if (onSuccess) {
                  onSuccess(event.data.public_token, event.data.metadata || {});
                }
              }
            }
          });
          
          // Display the iframe
          plaidContainer.innerHTML = '';
          plaidContainer.appendChild(iframe);
          plaidContainer.style.display = 'block';
          hideLoading();
        }
      };
      
      console.log('Created simplified Plaid Link handler');
      resolve(simplifiedHandler);
    } catch (error) {
      console.error('Error creating simplified Plaid Link handler:', error);
      reject(error);
    }
  });
}

/**
 * Initialize Plaid Link once the script is loaded
 * @param {string} linkToken - Plaid Link token from API
 * @param {Function} onSuccess - Callback when user successfully links account
 * @param {Function} onExit - Callback when user exits without linking
 * @returns {Promise<Object>} - Plaid Link handler
 */
function initializePlaidLink(linkToken, onSuccess, onExit) {
  return new Promise((resolve, reject) => {
    // Check if Plaid is available
    if (!window.Plaid) {
      console.error('Plaid script not loaded or initialized correctly');
      showError('Plaid integration not available. Please try again later.');
      reject(new Error('Plaid not initialized'));
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('Error creating Plaid Link handler:', error);
      showError('Failed to initialize Plaid Link. Please try again later.');
      reject(error);
    }
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
    
    try {
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
            console.error('Error in onSuccess callback:', error);
            showError(error.message || 'Failed to connect bank account');
          } finally {
            hideLoading();
          }
        },
        (err, metadata) => {
          hideLoading();
          if (err) {
            console.log('User exited Plaid Link:', err);
            showError(err.message || 'Error connecting to bank');
          } else {
            console.log('User exited Plaid Link without error');
          }
        }
      );
      
      if (handler) {
        handler.open();
        return handler;
      } else {
        throw new Error('Could not create Plaid Link handler');
      }
    } catch (error) {
      console.error('Error creating or opening Plaid Link:', error);
      showError('Could not initialize Plaid Link. Please try again later.');
      return null;
    }
  } catch (error) {
    console.error('Error in connectBankAccount:', error);
    hideLoading();
    showError(error.message || 'Failed to connect bank account');
    return null;
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