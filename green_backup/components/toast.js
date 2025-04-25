/**
 * Toast Notification Component for Stackr Finance GREEN Edition
 * Creates and manages toast notifications throughout the application
 */

// Global toast container reference
let toastContainer = null;

/**
 * Toast types with associated styles
 */
const TOAST_TYPES = {
  SUCCESS: {
    bgColor: 'var(--color-success-light, #E8F5E9)',
    borderColor: 'var(--color-success, #4CAF50)',
    textColor: 'var(--color-success-dark, #2E7D32)',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
  },
  ERROR: {
    bgColor: 'var(--color-error-light, #FFEBEE)',
    borderColor: 'var(--color-error, #F44336)',
    textColor: 'var(--color-error-dark, #C62828)',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
  },
  WARNING: {
    bgColor: 'var(--color-warning-light, #FFF8E1)',
    borderColor: 'var(--color-warning, #FFC107)',
    textColor: 'var(--color-warning-dark, #FF8F00)',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
  },
  INFO: {
    bgColor: 'var(--color-info-light, #E3F2FD)',
    borderColor: 'var(--color-info, #2196F3)',
    textColor: 'var(--color-info-dark, #0D47A1)',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  },
  PRO: {
    bgColor: 'var(--color-pro-light, #F3E5F5)',
    borderColor: 'var(--color-pro, #9C27B0)',
    textColor: 'var(--color-pro-dark, #6A1B9A)',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
  }
};

/**
 * Initialize the toast container
 * @returns {HTMLElement} - Toast container element
 */
function initToastContainer() {
  // If container already exists, return it
  if (toastContainer) {
    return toastContainer;
  }
  
  // Create container
  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    max-width: 100%;
    pointer-events: none;
  `;
  
  document.body.appendChild(toastContainer);
  return toastContainer;
}

/**
 * Create and show a toast notification
 * @param {Object} options - Toast configuration options
 * @param {string} options.message - Message to display in the toast
 * @param {string} [options.type='INFO'] - Toast type (SUCCESS, ERROR, WARNING, INFO, PRO)
 * @param {number} [options.duration=5000] - Duration in milliseconds before auto-dismiss
 * @param {Function} [options.onClose] - Callback function when toast is closed
 * @param {string} [options.actionText] - Text for action button (optional)
 * @param {Function} [options.onAction] - Callback for action button click (optional)
 * @returns {Object} - Toast controller with close method
 */
export function createToast(options) {
  const { 
    message, 
    type = 'INFO', 
    duration = 5000, 
    onClose, 
    actionText,
    onAction 
  } = options;
  
  // Get container
  const container = initToastContainer();
  
  // Get style based on type
  const toastStyle = TOAST_TYPES[type] || TOAST_TYPES.INFO;
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `
    display: flex;
    align-items: flex-start;
    background-color: ${toastStyle.bgColor};
    color: ${toastStyle.textColor};
    border-left: 4px solid ${toastStyle.borderColor};
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-bottom: 8px;
    min-width: 300px;
    max-width: 450px;
    transform: translateX(120%);
    transition: transform 0.3s ease;
    pointer-events: auto;
    position: relative;
  `;
  
  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.className = 'toast-icon';
  iconContainer.style.cssText = `
    margin-right: 12px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  iconContainer.innerHTML = toastStyle.icon;
  
  // Create content container
  const contentContainer = document.createElement('div');
  contentContainer.className = 'toast-content';
  contentContainer.style.cssText = `
    flex-grow: 1;
  `;
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = 'toast-message';
  messageElement.style.cssText = `
    margin-bottom: ${actionText ? '8px' : '0'};
  `;
  messageElement.textContent = message;
  
  contentContainer.appendChild(messageElement);
  
  // Create action button if actionText is provided
  if (actionText && typeof onAction === 'function') {
    const actionButton = document.createElement('button');
    actionButton.className = 'toast-action';
    actionButton.textContent = actionText;
    actionButton.style.cssText = `
      background: none;
      border: none;
      color: ${toastStyle.borderColor};
      font-weight: bold;
      padding: 4px 8px;
      margin-top: 4px;
      cursor: pointer;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
    `;
    actionButton.addEventListener('click', (e) => {
      e.stopPropagation();
      onAction();
      removeToast();
    });
    contentContainer.appendChild(actionButton);
  }
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.className = 'toast-close';
  closeButton.style.cssText = `
    background: none;
    border: none;
    color: ${toastStyle.textColor};
    opacity: 0.7;
    cursor: pointer;
    margin-left: 8px;
    padding: 0;
  `;
  closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    removeToast();
  });
  
  // Add elements to toast
  toast.appendChild(iconContainer);
  toast.appendChild(contentContainer);
  toast.appendChild(closeButton);
  
  // Add toast to container
  container.appendChild(toast);
  
  // Slide in animation (after a small delay to ensure DOM update)
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Set up auto-dismiss
  let timeout;
  if (duration > 0) {
    timeout = setTimeout(removeToast, duration);
  }
  
  // Function to remove toast
  function removeToast() {
    clearTimeout(timeout);
    
    // Slide out animation
    toast.style.transform = 'translateX(120%)';
    
    // Remove after animation
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      
      // Call onClose callback if provided
      if (typeof onClose === 'function') {
        onClose();
      }
    }, 300);
  }
  
  // Return controller
  return {
    close: removeToast
  };
}

/**
 * Success toast shorthand
 * @param {string} message - Success message
 * @param {number} [duration=5000] - Duration in milliseconds
 */
export function showSuccessToast(message, duration = 5000) {
  return createToast({
    message,
    type: 'SUCCESS',
    duration
  });
}

/**
 * Error toast shorthand
 * @param {string} message - Error message
 * @param {number} [duration=6000] - Duration in milliseconds (errors show longer by default)
 */
export function showErrorToast(message, duration = 6000) {
  return createToast({
    message,
    type: 'ERROR',
    duration
  });
}

/**
 * Warning toast shorthand
 * @param {string} message - Warning message
 * @param {number} [duration=5000] - Duration in milliseconds
 */
export function showWarningToast(message, duration = 5000) {
  return createToast({
    message,
    type: 'WARNING',
    duration
  });
}

/**
 * Info toast shorthand
 * @param {string} message - Info message
 * @param {number} [duration=4000] - Duration in milliseconds (info shows shorter by default)
 */
export function showInfoToast(message, duration = 4000) {
  return createToast({
    message,
    type: 'INFO',
    duration
  });
}

/**
 * Pro feature toast with upgrade action
 * @param {string} message - Message about the Pro feature
 */
export function showProFeatureToast(message) {
  return createToast({
    message,
    type: 'PRO',
    duration: 7000,
    actionText: 'Upgrade Now',
    onAction: () => {
      // Navigate to pricing page
      window.location.hash = 'pricing';
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initToastContainer);