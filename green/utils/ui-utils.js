/**
 * UI Utilities
 * 
 * A collection of utility functions for handling common UI operations
 */

/**
 * Shows a toast notification
 * @param {string} title - The title of the toast
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, warning, info)
 * @param {number} duration - How long to show the toast in ms
 */
export function showToast(title, message, type = 'info', duration = 4000) {
  // Create container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Add icon based on type
  let icon = '';
  switch (type) {
    case 'success':
      icon = '<i class="fas fa-check-circle"></i>';
      break;
    case 'error':
      icon = '<i class="fas fa-exclamation-circle"></i>';
      break;
    case 'warning':
      icon = '<i class="fas fa-exclamation-triangle"></i>';
      break;
    case 'info':
    default:
      icon = '<i class="fas fa-info-circle"></i>';
      break;
  }
  
  toast.innerHTML = `
    <div class="toast-header">
      ${icon}
      <span class="toast-title">${title}</span>
      <button class="toast-close">&times;</button>
    </div>
    <div class="toast-body">${message}</div>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Add visible class after a small delay (for animation)
  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);
  
  // Add close button functionality
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    closeToast(toast);
  });
  
  // Auto close after duration
  if (duration) {
    setTimeout(() => {
      closeToast(toast);
    }, duration);
  }
  
  return toast;
}

/**
 * Closes a toast notification
 * @param {HTMLElement} toast - The toast element to close
 */
function closeToast(toast) {
  toast.classList.remove('visible');
  toast.classList.add('hiding');
  
  // Remove from DOM after animation
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
    
    // If no more toasts, remove container
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer && toastContainer.children.length === 0) {
      document.body.removeChild(toastContainer);
    }
  }, 300);
}

// Loading overlay instance
let loadingOverlay = null;
let loadingMessage = null;

/**
 * Shows a loading overlay
 * @param {string} message - Optional message to display
 */
export function showLoading(message = 'Loading...') {
  // Create overlay if it doesn't exist
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    
    loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading-message';
    
    loadingOverlay.appendChild(spinner);
    loadingOverlay.appendChild(loadingMessage);
    document.body.appendChild(loadingOverlay);
  }
  
  // Update message
  loadingMessage.textContent = message;
  
  // Show overlay
  loadingOverlay.classList.add('visible');
  document.body.classList.add('no-scroll');
}

/**
 * Hides the loading overlay
 */
export function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove('visible');
    document.body.classList.remove('no-scroll');
  }
}

/**
 * Shows a confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 * @param {string} type - Dialog type (info, warning, error, success)
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if canceled
 */
export function showConfirm(title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'info') {
  return new Promise((resolve) => {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    
    // Create modal dialog
    const modal = document.createElement('div');
    modal.className = `modal-dialog confirm-dialog confirm-${type}`;
    
    // Add icon based on type
    let icon = '';
    switch (type) {
      case 'success':
        icon = '<i class="fas fa-check-circle"></i>';
        break;
      case 'error':
        icon = '<i class="fas fa-exclamation-circle"></i>';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation-triangle"></i>';
        break;
      case 'info':
      default:
        icon = '<i class="fas fa-info-circle"></i>';
        break;
    }
    
    modal.innerHTML = `
      <div class="modal-header">
        ${icon}
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">${message}</div>
      <div class="modal-footer">
        <button class="btn btn-secondary cancel-btn">${cancelText}</button>
        <button class="btn btn-primary confirm-btn">${confirmText}</button>
      </div>
    `;
    
    // Append to body
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    document.body.classList.add('no-scroll');
    
    // Add visible class after a small delay (for animation)
    setTimeout(() => {
      backdrop.classList.add('visible');
    }, 10);
    
    // Close function
    function closeModal(result) {
      backdrop.classList.remove('visible');
      
      // Remove from DOM after animation
      setTimeout(() => {
        document.body.removeChild(backdrop);
        document.body.classList.remove('no-scroll');
        resolve(result);
      }, 300);
    }
    
    // Add event listeners
    const closeButton = modal.querySelector('.modal-close');
    const cancelButton = modal.querySelector('.cancel-btn');
    const confirmButton = modal.querySelector('.confirm-btn');
    
    closeButton.addEventListener('click', () => closeModal(false));
    cancelButton.addEventListener('click', () => closeModal(false));
    confirmButton.addEventListener('click', () => closeModal(true));
    
    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(false);
      }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', escHandler);
        closeModal(false);
      }
    });
  });
}

/**
 * Shows a prompt dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} defaultValue - Default input value
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 * @returns {Promise<string|null>} - Resolves to input value if confirmed, null if canceled
 */
export function showPrompt(title, message, defaultValue = '', confirmText = 'OK', cancelText = 'Cancel') {
  return new Promise((resolve) => {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    
    // Create modal dialog
    const modal = document.createElement('div');
    modal.className = 'modal-dialog prompt-dialog';
    
    modal.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <p>${message}</p>
        <input type="text" class="form-input prompt-input" value="${defaultValue}">
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary cancel-btn">${cancelText}</button>
        <button class="btn btn-primary confirm-btn">${confirmText}</button>
      </div>
    `;
    
    // Append to body
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    document.body.classList.add('no-scroll');
    
    // Add visible class after a small delay (for animation)
    setTimeout(() => {
      backdrop.classList.add('visible');
      // Focus the input
      modal.querySelector('.prompt-input').focus();
    }, 10);
    
    // Close function
    function closeModal(result) {
      backdrop.classList.remove('visible');
      
      // Remove from DOM after animation
      setTimeout(() => {
        document.body.removeChild(backdrop);
        document.body.classList.remove('no-scroll');
        resolve(result);
      }, 300);
    }
    
    // Add event listeners
    const closeButton = modal.querySelector('.modal-close');
    const cancelButton = modal.querySelector('.cancel-btn');
    const confirmButton = modal.querySelector('.confirm-btn');
    const input = modal.querySelector('.prompt-input');
    
    closeButton.addEventListener('click', () => closeModal(null));
    cancelButton.addEventListener('click', () => closeModal(null));
    confirmButton.addEventListener('click', () => closeModal(input.value));
    
    // Submit on enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        closeModal(input.value);
      }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', escHandler);
        closeModal(null);
      }
    });
  });
}