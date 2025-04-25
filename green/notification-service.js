/**
 * Notification Service for Stackr Finance
 * Handles in-app notifications, email notifications, and browser push notifications
 */

// Store for user notifications (in-memory for the GREEN version)
const notificationsStore = {
  // Map of userId to array of notification objects
  notifications: {},
  
  // Set to track which users have unread notifications
  unreadNotifications: new Set()
};

// Notification types
const NOTIFICATION_TYPES = {
  ACHIEVEMENT: 'achievement',
  PAYMENT_REMINDER: 'payment_reminder',
  GOAL_PROGRESS: 'goal_progress',
  FINANCIAL_SUMMARY: 'financial_summary',
  SAVINGS_MILESTONE: 'savings_milestone',
  SPENDING_ALERT: 'spending_alert',
  SYSTEM: 'system'
};

// Notification priorities
const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * Create a new notification for a user
 * @param {string} userId - The user ID to send notification to
 * @param {Object} notificationData - The notification data
 * @param {string} notificationData.type - Type of notification (see NOTIFICATION_TYPES)
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.priority - Priority level (see NOTIFICATION_PRIORITIES)
 * @param {Object} notificationData.data - Optional additional data
 * @param {boolean} notificationData.showInApp - Whether to show in app (default true)
 * @param {boolean} notificationData.sendEmail - Whether to send via email (default false)
 * @param {boolean} notificationData.sendPush - Whether to send as browser push (default false)
 * @returns {Object} The created notification object
 */
function createNotification(userId, notificationData) {
  // Ensure the user has a notifications array
  if (!notificationsStore.notifications[userId]) {
    notificationsStore.notifications[userId] = [];
  }
  
  // Create notification object with defaults
  const notification = {
    id: `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: notificationData.type || NOTIFICATION_TYPES.SYSTEM,
    title: notificationData.title || 'Notification',
    message: notificationData.message || '',
    priority: notificationData.priority || NOTIFICATION_PRIORITIES.MEDIUM,
    data: notificationData.data || {},
    showInApp: notificationData.showInApp !== false, // Default to true
    sendEmail: notificationData.sendEmail || false,
    sendPush: notificationData.sendPush || false,
    read: false,
    dismissed: false,
    createdAt: new Date().toISOString()
  };
  
  // Add to store
  notificationsStore.notifications[userId].push(notification);
  
  // Mark user as having unread notifications
  notificationsStore.unreadNotifications.add(userId);
  
  // Handle email notifications if enabled
  if (notification.sendEmail) {
    sendEmailNotification(userId, notification);
  }
  
  // Handle push notifications if enabled
  if (notification.sendPush) {
    sendPushNotification(userId, notification);
  }
  
  // Display in-app notification if user is active
  if (notification.showInApp) {
    displayInAppNotification(notification);
  }
  
  return notification;
}

/**
 * Get all notifications for a user
 * @param {string} userId - User ID
 * @returns {Array} Array of notification objects
 */
function getUserNotifications(userId) {
  return notificationsStore.notifications[userId] || [];
}

/**
 * Get all unread notifications for a user
 * @param {string} userId - User ID
 * @returns {Array} Array of unread notification objects
 */
function getUnreadNotifications(userId) {
  const userNotifications = notificationsStore.notifications[userId] || [];
  return userNotifications.filter(notification => !notification.read);
}

/**
 * Check if a user has unread notifications
 * @param {string} userId - User ID
 * @returns {boolean} Whether the user has unread notifications
 */
function hasUnreadNotifications(userId) {
  return notificationsStore.unreadNotifications.has(userId);
}

/**
 * Mark a notification as read
 * @param {string} userId - User ID
 * @param {string} notificationId - Notification ID
 * @returns {boolean} Success
 */
function markNotificationAsRead(userId, notificationId) {
  const userNotifications = notificationsStore.notifications[userId];
  if (!userNotifications) return false;
  
  const notification = userNotifications.find(n => n.id === notificationId);
  if (!notification) return false;
  
  notification.read = true;
  
  // Check if all notifications are read
  const allRead = userNotifications.every(n => n.read);
  if (allRead) {
    notificationsStore.unreadNotifications.delete(userId);
  }
  
  return true;
}

/**
 * Mark all notifications for a user as read
 * @param {string} userId - User ID
 * @returns {number} Number of notifications marked as read
 */
function markAllNotificationsAsRead(userId) {
  const userNotifications = notificationsStore.notifications[userId];
  if (!userNotifications) return 0;
  
  let count = 0;
  userNotifications.forEach(notification => {
    if (!notification.read) {
      notification.read = true;
      count++;
    }
  });
  
  // Remove user from unread notifications set
  notificationsStore.unreadNotifications.delete(userId);
  
  return count;
}

/**
 * Dismiss a notification
 * @param {string} userId - User ID
 * @param {string} notificationId - Notification ID
 * @returns {boolean} Success
 */
function dismissNotification(userId, notificationId) {
  const userNotifications = notificationsStore.notifications[userId];
  if (!userNotifications) return false;
  
  const notification = userNotifications.find(n => n.id === notificationId);
  if (!notification) return false;
  
  notification.dismissed = true;
  
  return true;
}

/**
 * Clear all notifications for a user
 * @param {string} userId - User ID
 * @returns {number} Number of notifications cleared
 */
function clearAllNotifications(userId) {
  const userNotifications = notificationsStore.notifications[userId];
  if (!userNotifications) return 0;
  
  const count = userNotifications.length;
  notificationsStore.notifications[userId] = [];
  notificationsStore.unreadNotifications.delete(userId);
  
  return count;
}

/**
 * Send email notification (stub for GREEN version)
 * @param {string} userId - User ID
 * @param {Object} notification - Notification object
 * @private
 */
function sendEmailNotification(userId, notification) {
  // In the GREEN version, this is just a stub
  console.log(`[Email Notification] To User ${userId}: ${notification.title} - ${notification.message}`);
}

/**
 * Send browser push notification (stub for GREEN version)
 * @param {string} userId - User ID 
 * @param {Object} notification - Notification object
 * @private
 */
function sendPushNotification(userId, notification) {
  // In the GREEN version, this is just a stub
  console.log(`[Push Notification] To User ${userId}: ${notification.title} - ${notification.message}`);
}

/**
 * Display in-app notification if the user is active
 * @param {Object} notification - Notification object 
 * @private
 */
function displayInAppNotification(notification) {
  // Check if user is active and notification element exists
  const notificationElement = document.getElementById('notification-container');
  if (!notificationElement) return;
  
  // Create toast notification
  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.setAttribute('data-notification-id', notification.id);
  
  // Set style based on priority
  let priorityColor = '#3b82f6'; // Default blue
  switch (notification.priority) {
    case NOTIFICATION_PRIORITIES.LOW:
      priorityColor = '#10b981'; // Green
      break;
    case NOTIFICATION_PRIORITIES.MEDIUM:
      priorityColor = '#3b82f6'; // Blue
      break;
    case NOTIFICATION_PRIORITIES.HIGH:
      priorityColor = '#f59e0b'; // Amber
      break;
    case NOTIFICATION_PRIORITIES.URGENT:
      priorityColor = '#ef4444'; // Red
      break;
  }
  
  // Style the toast
  toast.style.position = 'relative';
  toast.style.padding = '12px 16px';
  toast.style.backgroundColor = 'white';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  toast.style.marginBottom = '8px';
  toast.style.display = 'flex';
  toast.style.flexDirection = 'column';
  toast.style.borderLeft = `4px solid ${priorityColor}`;
  toast.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  toast.style.transform = 'translateX(100%)';
  toast.style.opacity = '0';
  
  // Add title
  const title = document.createElement('h4');
  title.textContent = notification.title;
  title.style.margin = '0 0 4px 0';
  title.style.fontSize = '16px';
  title.style.fontWeight = '600';
  
  // Add message
  const message = document.createElement('p');
  message.textContent = notification.message;
  message.style.margin = '0';
  message.style.fontSize = '14px';
  message.style.color = '#666';
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '8px';
  closeButton.style.right = '8px';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '18px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = '#666';
  
  closeButton.addEventListener('click', () => {
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    
    // Remove after animation
    setTimeout(() => {
      toast.remove();
    }, 300);
  });
  
  // Add icon based on notification type
  const iconContainer = document.createElement('div');
  iconContainer.style.position = 'absolute';
  iconContainer.style.top = '12px';
  iconContainer.style.right = '36px';
  
  let iconSvg = '';
  switch (notification.type) {
    case NOTIFICATION_TYPES.ACHIEVEMENT:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>';
      break;
    case NOTIFICATION_TYPES.PAYMENT_REMINDER:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
      break;
    case NOTIFICATION_TYPES.GOAL_PROGRESS:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>';
      break;
    case NOTIFICATION_TYPES.FINANCIAL_SUMMARY:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>';
      break;
    case NOTIFICATION_TYPES.SAVINGS_MILESTONE:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>';
      break;
    case NOTIFICATION_TYPES.SPENDING_ALERT:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>';
      break;
    default:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }
  
  iconContainer.innerHTML = iconSvg;
  iconContainer.style.color = priorityColor;
  
  // Assemble toast
  toast.appendChild(title);
  toast.appendChild(message);
  toast.appendChild(closeButton);
  toast.appendChild(iconContainer);
  
  // Add to notification container
  notificationElement.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  }, 10);
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      
      // Remove after animation
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }
  }, 5000);
}

/**
 * Create an achievement notification
 * @param {string} userId - User ID
 * @param {string} title - Achievement title
 * @param {string} message - Achievement message
 * @param {boolean} showInApp - Whether to show in app (default true)
 * @param {boolean} sendEmail - Whether to send via email (default false)
 * @param {boolean} sendPush - Whether to send as browser push (default false)
 * @returns {Object} The created notification
 */
function createAchievementNotification(userId, title, message, showInApp = true, sendEmail = false, sendPush = false) {
  return createNotification(userId, {
    type: NOTIFICATION_TYPES.ACHIEVEMENT,
    title,
    message,
    priority: NOTIFICATION_PRIORITIES.MEDIUM,
    showInApp,
    sendEmail,
    sendPush
  });
}

/**
 * Create a payment reminder notification
 * @param {string} userId - User ID
 * @param {string} title - Reminder title
 * @param {string} message - Reminder message
 * @param {Object} paymentData - Payment data
 * @param {boolean} showInApp - Whether to show in app (default true)
 * @param {boolean} sendEmail - Whether to send via email (default true)
 * @param {boolean} sendPush - Whether to send as browser push (default false)
 * @returns {Object} The created notification
 */
function createPaymentReminderNotification(userId, title, message, paymentData, showInApp = true, sendEmail = true, sendPush = false) {
  return createNotification(userId, {
    type: NOTIFICATION_TYPES.PAYMENT_REMINDER,
    title,
    message,
    priority: NOTIFICATION_PRIORITIES.HIGH,
    data: { payment: paymentData },
    showInApp,
    sendEmail,
    sendPush
  });
}

/**
 * Create a goal progress notification
 * @param {string} userId - User ID
 * @param {string} title - Goal title
 * @param {string} message - Progress message
 * @param {Object} goalData - Goal data
 * @param {boolean} showInApp - Whether to show in app (default true)
 * @param {boolean} sendEmail - Whether to send via email (default false)
 * @param {boolean} sendPush - Whether to send as browser push (default false)
 * @returns {Object} The created notification
 */
function createGoalProgressNotification(userId, title, message, goalData, showInApp = true, sendEmail = false, sendPush = false) {
  return createNotification(userId, {
    type: NOTIFICATION_TYPES.GOAL_PROGRESS,
    title,
    message,
    priority: NOTIFICATION_PRIORITIES.MEDIUM,
    data: { goal: goalData },
    showInApp,
    sendEmail,
    sendPush
  });
}

/**
 * Create a financial summary notification
 * @param {string} userId - User ID
 * @param {string} title - Summary title
 * @param {string} message - Summary message
 * @param {Object} summaryData - Summary data
 * @param {boolean} showInApp - Whether to show in app (default true)
 * @param {boolean} sendEmail - Whether to send via email (default true)
 * @param {boolean} sendPush - Whether to send as browser push (default false)
 * @returns {Object} The created notification
 */
function createFinancialSummaryNotification(userId, title, message, summaryData, showInApp = true, sendEmail = true, sendPush = false) {
  return createNotification(userId, {
    type: NOTIFICATION_TYPES.FINANCIAL_SUMMARY,
    title,
    message,
    priority: NOTIFICATION_PRIORITIES.LOW,
    data: { summary: summaryData },
    showInApp,
    sendEmail,
    sendPush
  });
}

/**
 * Create a spending alert notification
 * @param {string} userId - User ID
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Object} spendingData - Spending data
 * @param {boolean} showInApp - Whether to show in app (default true)
 * @param {boolean} sendEmail - Whether to send via email (default false)
 * @param {boolean} sendPush - Whether to send as browser push (default true)
 * @returns {Object} The created notification
 */
function createSpendingAlertNotification(userId, title, message, spendingData, showInApp = true, sendEmail = false, sendPush = true) {
  return createNotification(userId, {
    type: NOTIFICATION_TYPES.SPENDING_ALERT,
    title,
    message,
    priority: NOTIFICATION_PRIORITIES.HIGH,
    data: { spending: spendingData },
    showInApp,
    sendEmail,
    sendPush
  });
}

// Export notification service
export {
  // Constants
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  
  // Core functions
  createNotification,
  getUserNotifications,
  getUnreadNotifications,
  hasUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  clearAllNotifications,
  
  // Helper functions for specific notification types
  createAchievementNotification,
  createPaymentReminderNotification,
  createGoalProgressNotification,
  createFinancialSummaryNotification,
  createSpendingAlertNotification
};