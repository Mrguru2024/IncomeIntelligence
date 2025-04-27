/**
 * Toast notification component
 * Provides simple toast notifications for the application
 */

// Export functions for ES Module support
export { createToast, clearAllToasts };

// Keep track of active toasts
let activeToasts = [];
let toastContainer;

/**
 * Initialize the toast container
 * @returns {HTMLElement} - The toast container element
 */
function initToastContainer() {
  if (toastContainer) return toastContainer;
  
  // Create container
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.style.position = 'fixed';
  toastContainer.style.bottom = '20px';
  toastContainer.style.right = '20px';
  toastContainer.style.zIndex = '9999';
  toastContainer.style.display = 'flex';
  toastContainer.style.flexDirection = 'column';
  toastContainer.style.alignItems = 'flex-end';
  toastContainer.style.gap = '10px';
  
  // Add to body
  document.body.appendChild(toastContainer);
  
  return toastContainer;
}

/**
 * Create a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, info, warning)
 * @param {number} duration - How long to display the toast (ms)
 * @returns {HTMLElement} - The toast element
 */
// Define function to be exported and also attached to window
function createToast(message, type = 'info', duration = 3000) {
  // Initialize container if needed
  const container = initToastContainer();
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '6px';
  toast.style.marginBottom = '8px';
  toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.minWidth = '200px';
  toast.style.maxWidth = '350px';
  toast.style.animation = 'toast-slide-in 0.3s ease';
  toast.style.cursor = 'pointer';
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(100%)';
  
  // Set colors based on type
  switch (type) {
    case 'success':
      toast.style.backgroundColor = '#e9f7ef';
      toast.style.border = '1px solid #4CAF50';
      toast.style.color = '#2e7d32';
      break;
    case 'error':
      toast.style.backgroundColor = '#FFEBEE';
      toast.style.border = '1px solid #F44336';
      toast.style.color = '#c62828';
      break;
    case 'warning':
      toast.style.backgroundColor = '#FFF8E1';
      toast.style.border = '1px solid #FFC107';
      toast.style.color = '#ff8f00';
      break;
    default: // info
      toast.style.backgroundColor = '#E3F2FD';
      toast.style.border = '1px solid #2196F3';
      toast.style.color = '#0277bd';
  }
  
  // Icon based on type
  let icon;
  switch (type) {
    case 'success':
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      break;
    case 'error':
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
      break;
    case 'warning':
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
      break;
    default: // info
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }
  
  // Create icon span
  const iconSpan = document.createElement('span');
  iconSpan.style.marginRight = '10px';
  iconSpan.style.display = 'flex';
  iconSpan.style.alignItems = 'center';
  iconSpan.innerHTML = icon;
  
  // Create message span
  const messageSpan = document.createElement('span');
  messageSpan.style.flex = '1';
  messageSpan.style.fontSize = '14px';
  messageSpan.textContent = message;
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = 'inherit';
  closeButton.style.cursor = 'pointer';
  closeButton.style.marginLeft = '10px';
  closeButton.style.padding = '0';
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  
  // Add elements to toast
  toast.appendChild(iconSpan);
  toast.appendChild(messageSpan);
  toast.appendChild(closeButton);
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toast-slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes toast-slide-out {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Function to remove toast
  const removeToast = () => {
    toast.style.animation = 'toast-slide-out 0.3s ease forwards';
    
    // Wait for animation to complete
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
      
      // Remove from active toasts array
      activeToasts = activeToasts.filter(t => t !== toast);
      
      // Remove container if no active toasts
      if (activeToasts.length === 0 && container.parentNode) {
        container.parentNode.removeChild(container);
        toastContainer = null;
      }
    }, 300);
  };
  
  // Add event listeners
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    removeToast();
  });
  
  toast.addEventListener('click', () => {
    removeToast();
  });
  
  // Add toast to container
  container.appendChild(toast);
  activeToasts.push(toast);
  
  // Start animation
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });
  
  // Auto-remove after duration
  setTimeout(removeToast, duration);
  
  return toast;
}

/**
 * Remove all active toasts
 */
function clearAllToasts() {
  if (!toastContainer) return;
  
  // Remove each toast
  activeToasts.forEach(toast => {
    if (toastContainer.contains(toast)) {
      toastContainer.removeChild(toast);
    }
  });
  
  // Clear array
  activeToasts = [];
  
  // Remove container
  if (toastContainer.parentNode) {
    toastContainer.parentNode.removeChild(toastContainer);
    toastContainer = null;
  }
}

// Also attach functions to window for non-module script access
window.createToast = createToast;
window.clearAllToasts = clearAllToasts;