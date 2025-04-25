/**
 * Notification UI Component for Stackr Finance
 * Renders notification elements and handles user interactions
 */

import {
  getUserNotifications,
  getUnreadNotifications,
  hasUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  clearAllNotifications,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES
} from './notification-service.js';

/**
 * Initialize the notification UI
 * @param {Object} appState - Application state object
 */
export function initNotificationUI(appState) {
  // Check if notification elements exist
  const notificationContainer = document.getElementById('notification-container');
  if (!notificationContainer) {
    createNotificationElements();
  }
  
  // Initialize notification badge in sidebar/header
  updateNotificationBadge(appState.user.id);
  
  // Setup notification polling (check for new notifications every minute)
  setInterval(() => {
    updateNotificationBadge(appState.user.id);
  }, 60000);
}

/**
 * Create notification UI elements
 * @private
 */
function createNotificationElements() {
  // Create notification container for toasts
  const notificationContainer = document.createElement('div');
  notificationContainer.id = 'notification-container';
  notificationContainer.style.position = 'fixed';
  notificationContainer.style.top = '72px';
  notificationContainer.style.right = '16px';
  notificationContainer.style.width = '320px';
  notificationContainer.style.maxWidth = '90vw';
  notificationContainer.style.zIndex = '9999';
  
  // Create notification panel (for viewing all notifications)
  const notificationPanel = document.createElement('div');
  notificationPanel.id = 'notification-panel';
  notificationPanel.style.position = 'fixed';
  notificationPanel.style.top = '64px';
  notificationPanel.style.right = '0';
  notificationPanel.style.width = '400px';
  notificationPanel.style.maxWidth = '100vw';
  notificationPanel.style.height = 'calc(100vh - 64px)';
  notificationPanel.style.backgroundColor = 'white';
  notificationPanel.style.boxShadow = '-2px 0 8px rgba(0, 0, 0, 0.1)';
  notificationPanel.style.zIndex = '1000';
  notificationPanel.style.transform = 'translateX(100%)';
  notificationPanel.style.transition = 'transform 0.3s ease';
  notificationPanel.style.display = 'flex';
  notificationPanel.style.flexDirection = 'column';
  
  // Create panel header
  const panelHeader = document.createElement('div');
  panelHeader.style.padding = '16px';
  panelHeader.style.borderBottom = '1px solid #eee';
  panelHeader.style.display = 'flex';
  panelHeader.style.justifyContent = 'space-between';
  panelHeader.style.alignItems = 'center';
  
  const panelTitle = document.createElement('h3');
  panelTitle.textContent = 'Notifications';
  panelTitle.style.margin = '0';
  panelTitle.style.fontSize = '18px';
  panelTitle.style.fontWeight = '600';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = '#666';
  closeButton.style.width = '32px';
  closeButton.style.height = '32px';
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.borderRadius = '4px';
  
  closeButton.addEventListener('mouseover', () => {
    closeButton.style.backgroundColor = '#f5f5f5';
  });
  
  closeButton.addEventListener('mouseout', () => {
    closeButton.style.backgroundColor = 'transparent';
  });
  
  closeButton.addEventListener('click', () => {
    closeNotificationPanel();
  });
  
  panelHeader.appendChild(panelTitle);
  panelHeader.appendChild(closeButton);
  
  // Create panel actions
  const panelActions = document.createElement('div');
  panelActions.style.padding = '8px 16px';
  panelActions.style.borderBottom = '1px solid #eee';
  panelActions.style.display = 'flex';
  panelActions.style.gap = '8px';
  
  const markAllReadBtn = document.createElement('button');
  markAllReadBtn.textContent = 'Mark all as read';
  markAllReadBtn.id = 'mark-all-read';
  markAllReadBtn.style.fontSize = '14px';
  markAllReadBtn.style.padding = '6px 12px';
  markAllReadBtn.style.border = 'none';
  markAllReadBtn.style.backgroundColor = 'transparent';
  markAllReadBtn.style.color = 'var(--color-primary)';
  markAllReadBtn.style.cursor = 'pointer';
  markAllReadBtn.style.borderRadius = '4px';
  
  markAllReadBtn.addEventListener('mouseover', () => {
    markAllReadBtn.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
  });
  
  markAllReadBtn.addEventListener('mouseout', () => {
    markAllReadBtn.style.backgroundColor = 'transparent';
  });
  
  const clearAllBtn = document.createElement('button');
  clearAllBtn.textContent = 'Clear all';
  clearAllBtn.id = 'clear-all-notifications';
  clearAllBtn.style.fontSize = '14px';
  clearAllBtn.style.padding = '6px 12px';
  clearAllBtn.style.border = 'none';
  clearAllBtn.style.backgroundColor = 'transparent';
  clearAllBtn.style.color = '#666';
  clearAllBtn.style.cursor = 'pointer';
  clearAllBtn.style.borderRadius = '4px';
  
  clearAllBtn.addEventListener('mouseover', () => {
    clearAllBtn.style.backgroundColor = '#f5f5f5';
  });
  
  clearAllBtn.addEventListener('mouseout', () => {
    clearAllBtn.style.backgroundColor = 'transparent';
  });
  
  panelActions.appendChild(markAllReadBtn);
  panelActions.appendChild(clearAllBtn);
  
  // Create notifications list container
  const notificationsList = document.createElement('div');
  notificationsList.id = 'notifications-list';
  notificationsList.style.flex = '1';
  notificationsList.style.overflowY = 'auto';
  notificationsList.style.padding = '8px 16px';
  
  // Create empty state for when there are no notifications
  const emptyState = document.createElement('div');
  emptyState.id = 'notifications-empty-state';
  emptyState.style.display = 'flex';
  emptyState.style.flexDirection = 'column';
  emptyState.style.alignItems = 'center';
  emptyState.style.justifyContent = 'center';
  emptyState.style.padding = '32px 16px';
  emptyState.style.color = '#666';
  emptyState.style.textAlign = 'center';
  
  const emptyIcon = document.createElement('div');
  emptyIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';
  emptyIcon.style.marginBottom = '16px';
  emptyIcon.style.color = '#ccc';
  
  const emptyTitle = document.createElement('h4');
  emptyTitle.textContent = 'No Notifications';
  emptyTitle.style.margin = '0 0 8px 0';
  emptyTitle.style.fontSize = '16px';
  emptyTitle.style.fontWeight = '600';
  
  const emptyText = document.createElement('p');
  emptyText.textContent = 'You don\'t have any notifications yet.';
  emptyText.style.margin = '0';
  emptyText.style.fontSize = '14px';
  
  emptyState.appendChild(emptyIcon);
  emptyState.appendChild(emptyTitle);
  emptyState.appendChild(emptyText);
  notificationsList.appendChild(emptyState);
  
  // Assemble panel
  notificationPanel.appendChild(panelHeader);
  notificationPanel.appendChild(panelActions);
  notificationPanel.appendChild(notificationsList);
  
  // Add everything to body
  document.body.appendChild(notificationContainer);
  document.body.appendChild(notificationPanel);
  
  // Add event listeners to action buttons
  markAllReadBtn.addEventListener('click', () => {
    const userId = window.appState?.user?.id;
    if (userId) {
      const count = markAllNotificationsAsRead(userId);
      updateNotificationBadge(userId);
      renderNotificationsList(userId);
      
      // Show toast if notifications were marked as read
      if (count > 0) {
        showToast(`Marked ${count} notifications as read`);
      }
    }
  });
  
  clearAllBtn.addEventListener('click', () => {
    const userId = window.appState?.user?.id;
    if (userId) {
      const count = clearAllNotifications(userId);
      updateNotificationBadge(userId);
      renderNotificationsList(userId);
      
      // Show toast if notifications were cleared
      if (count > 0) {
        showToast(`Cleared ${count} notifications`);
      }
    }
  });
}

/**
 * Create notification badge in header/sidebar
 * @param {string} userId - User ID
 * @private
 */
function createNotificationBadge(userId) {
  // Check if header notifications button exists first
  let notificationsBtn = document.getElementById('header-notifications-button');
  
  // If not, create one
  if (!notificationsBtn) {
    // Find header icons container
    const headerIcons = document.querySelector('.header-icons');
    if (headerIcons) {
      notificationsBtn = document.createElement('button');
      notificationsBtn.id = 'header-notifications-button';
      notificationsBtn.className = 'header-icon-button';
      notificationsBtn.setAttribute('aria-label', 'Notifications');
      
      notificationsBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';
      
      // Insert before last child (usually the profile button)
      headerIcons.insertBefore(notificationsBtn, headerIcons.lastChild);
      
      // Add click handler to open notification panel
      notificationsBtn.addEventListener('click', () => {
        openNotificationPanel(userId);
      });
    }
  }
  
  // Create badge element if not exists
  if (notificationsBtn && !document.getElementById('notification-badge')) {
    const badge = document.createElement('span');
    badge.id = 'notification-badge';
    badge.style.position = 'absolute';
    badge.style.top = '2px';
    badge.style.right = '2px';
    badge.style.width = '8px';
    badge.style.height = '8px';
    badge.style.borderRadius = '50%';
    badge.style.backgroundColor = 'var(--color-error, red)';
    badge.style.display = 'none';
    
    // Set position relative on button for absolute positioning of badge
    notificationsBtn.style.position = 'relative';
    
    notificationsBtn.appendChild(badge);
  }
}

/**
 * Update notification badge display
 * @param {string} userId - User ID 
 */
function updateNotificationBadge(userId) {
  // Create badge if it doesn't exist
  createNotificationBadge(userId);
  
  // Get badge element
  const badge = document.getElementById('notification-badge');
  if (!badge) return;
  
  // Check if user has unread notifications
  const hasUnread = hasUnreadNotifications(userId);
  
  // Update badge visibility
  badge.style.display = hasUnread ? 'block' : 'none';
}

/**
 * Open the notification panel
 * @param {string} userId - User ID
 */
export function openNotificationPanel(userId) {
  const panel = document.getElementById('notification-panel');
  if (!panel) {
    createNotificationElements();
    
    // Get the panel again
    const newPanel = document.getElementById('notification-panel');
    if (newPanel) {
      newPanel.style.transform = 'translateX(0)';
    }
  } else {
    panel.style.transform = 'translateX(0)';
  }
  
  // Render notifications list
  renderNotificationsList(userId);
}

/**
 * Close the notification panel
 */
export function closeNotificationPanel() {
  const panel = document.getElementById('notification-panel');
  if (panel) {
    panel.style.transform = 'translateX(100%)';
  }
}

/**
 * Render the list of notifications
 * @param {string} userId - User ID
 */
function renderNotificationsList(userId) {
  const listContainer = document.getElementById('notifications-list');
  const emptyState = document.getElementById('notifications-empty-state');
  
  if (!listContainer) return;
  
  // Clear existing notifications
  Array.from(listContainer.children)
    .forEach(child => {
      if (child.id !== 'notifications-empty-state') {
        child.remove();
      }
    });
  
  // Get user notifications
  const notifications = getUserNotifications(userId);
  
  // Show empty state if no notifications
  if (!notifications || notifications.length === 0) {
    if (emptyState) {
      emptyState.style.display = 'flex';
    }
    return;
  }
  
  // Hide empty state
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Sort notifications by date (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Create notification items
  sortedNotifications.forEach(notification => {
    const notificationItem = createNotificationItem(notification, userId);
    listContainer.appendChild(notificationItem);
  });
}

/**
 * Create a notification item for the list
 * @param {Object} notification - Notification object
 * @param {string} userId - User ID
 * @returns {HTMLElement} Notification item element
 */
function createNotificationItem(notification, userId) {
  const item = document.createElement('div');
  item.className = 'notification-item';
  item.setAttribute('data-notification-id', notification.id);
  item.style.padding = '12px';
  item.style.borderBottom = '1px solid #eee';
  item.style.display = 'flex';
  item.style.position = 'relative';
  item.style.transition = 'background-color 0.2s ease';
  
  // Set background color based on read status
  if (!notification.read) {
    item.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.05)';
  } else {
    item.style.backgroundColor = 'transparent';
  }
  
  // Hover effect
  item.addEventListener('mouseover', () => {
    item.style.backgroundColor = notification.read ? 
      'rgba(0, 0, 0, 0.03)' : 
      'rgba(var(--color-primary-rgb), 0.1)';
  });
  
  item.addEventListener('mouseout', () => {
    item.style.backgroundColor = notification.read ? 
      'transparent' : 
      'rgba(var(--color-primary-rgb), 0.05)';
  });
  
  // Add icon based on notification type
  const iconContainer = document.createElement('div');
  iconContainer.style.marginRight = '12px';
  iconContainer.style.minWidth = '24px';
  
  // Get icon for notification type
  let iconSvg = '';
  let iconColor = 'var(--color-primary)';
  
  switch (notification.type) {
    case NOTIFICATION_TYPES.ACHIEVEMENT:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>';
      iconColor = '#f59e0b'; // Amber
      break;
    case NOTIFICATION_TYPES.PAYMENT_REMINDER:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
      iconColor = '#ef4444'; // Red
      break;
    case NOTIFICATION_TYPES.GOAL_PROGRESS:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>';
      iconColor = '#3b82f6'; // Blue
      break;
    case NOTIFICATION_TYPES.FINANCIAL_SUMMARY:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>';
      iconColor = '#10b981'; // Green
      break;
    case NOTIFICATION_TYPES.SAVINGS_MILESTONE:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>';
      iconColor = '#8b5cf6'; // Purple
      break;
    case NOTIFICATION_TYPES.SPENDING_ALERT:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>';
      iconColor = '#ef4444'; // Red
      break;
    default:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }
  
  iconContainer.innerHTML = iconSvg;
  iconContainer.style.color = iconColor;
  
  // Create content
  const content = document.createElement('div');
  content.style.flex = '1';
  
  // Create title
  const title = document.createElement('h4');
  title.textContent = notification.title;
  title.style.margin = '0 0 4px 0';
  title.style.fontSize = '16px';
  title.style.fontWeight = notification.read ? '500' : '600';
  
  // Create message
  const message = document.createElement('p');
  message.textContent = notification.message;
  message.style.margin = '0 0 8px 0';
  message.style.fontSize = '14px';
  message.style.color = '#666';
  
  // Create timestamp
  const timestamp = document.createElement('span');
  const timeAgo = getTimeAgo(new Date(notification.createdAt));
  timestamp.textContent = timeAgo;
  timestamp.style.fontSize = '12px';
  timestamp.style.color = '#999';
  
  // Assemble content
  content.appendChild(title);
  content.appendChild(message);
  content.appendChild(timestamp);
  
  // Create action buttons
  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.flexDirection = 'column';
  actions.style.gap = '4px';
  actions.style.marginLeft = '12px';
  
  // Read/Unread button
  const readBtn = document.createElement('button');
  readBtn.innerHTML = notification.read ? 
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>' :
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  
  readBtn.title = notification.read ? 'Mark as unread' : 'Mark as read';
  readBtn.style.border = 'none';
  readBtn.style.backgroundColor = 'transparent';
  readBtn.style.cursor = 'pointer';
  readBtn.style.padding = '4px';
  readBtn.style.color = '#666';
  readBtn.style.borderRadius = '4px';
  
  readBtn.addEventListener('mouseover', () => {
    readBtn.style.backgroundColor = '#f5f5f5';
  });
  
  readBtn.addEventListener('mouseout', () => {
    readBtn.style.backgroundColor = 'transparent';
  });
  
  readBtn.addEventListener('click', () => {
    if (notification.read) {
      // Mark as unread functionality would go here
      // This is just a placeholder as the service doesn't have this method yet
      showToast('Marking as unread not implemented yet');
    } else {
      // Mark as read
      markNotificationAsRead(userId, notification.id);
      updateNotificationBadge(userId);
      renderNotificationsList(userId);
    }
  });
  
  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
  deleteBtn.title = 'Delete notification';
  deleteBtn.style.border = 'none';
  deleteBtn.style.backgroundColor = 'transparent';
  deleteBtn.style.cursor = 'pointer';
  deleteBtn.style.padding = '4px';
  deleteBtn.style.color = '#666';
  deleteBtn.style.borderRadius = '4px';
  
  deleteBtn.addEventListener('mouseover', () => {
    deleteBtn.style.backgroundColor = '#fee2e2';
    deleteBtn.style.color = '#ef4444';
  });
  
  deleteBtn.addEventListener('mouseout', () => {
    deleteBtn.style.backgroundColor = 'transparent';
    deleteBtn.style.color = '#666';
  });
  
  deleteBtn.addEventListener('click', () => {
    dismissNotification(userId, notification.id);
    renderNotificationsList(userId);
  });
  
  // Add buttons to actions
  actions.appendChild(readBtn);
  actions.appendChild(deleteBtn);
  
  // Assemble item
  item.appendChild(iconContainer);
  item.appendChild(content);
  item.appendChild(actions);
  
  // Add click handler to mark as read when clicked
  item.addEventListener('click', (event) => {
    // Don't mark as read if clicking action buttons
    if (event.target.closest('button')) {
      return;
    }
    
    if (!notification.read) {
      markNotificationAsRead(userId, notification.id);
      updateNotificationBadge(userId);
      renderNotificationsList(userId);
    }
  });
  
  return item;
}

/**
 * Format timestamp as relative time (e.g. "2 hours ago")
 * @param {Date} date - Date object
 * @returns {string} Relative time string
 */
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  } else {
    // Format as date
    return date.toLocaleDateString();
  }
}

/**
 * Show a toast message
 * @param {string} message - Message to display
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '16px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%) translateY(100%)';
  toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  toast.style.color = 'white';
  toast.style.padding = '8px 16px';
  toast.style.borderRadius = '4px';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = '500';
  toast.style.zIndex = '10000';
  toast.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  
  // Auto dismiss
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100%)';
    toast.style.opacity = '0';
    
    // Remove after animation
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}