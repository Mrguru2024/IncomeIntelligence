/**
 * Notification Demo Page
 * Showcases the notification system with sample notifications
 */

import { initNotificationUI, openNotificationPanel } from './notification-ui.js';
import {
  createNotification,
  createAchievementNotification,
  createPaymentReminderNotification,
  createGoalProgressNotification,
  createFinancialSummaryNotification,
  createSpendingAlertNotification,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES
} from './notification-service.js';
import { simulateTransaction } from './guardrails-notifications.js';
import { generateWeeklySummary, generateMonthlySummary } from './financial-summary.js';
import { initializeAchievements, checkAchievements, updateLoginStreak, trackGoalProgress } from './achievement-service.js';

/**
 * Render the notification demo page
 * @returns {HTMLElement} The demo page element
 */
export function renderNotificationDemoPage() {
  // Create container
  const container = document.createElement('div');
  container.className = 'notification-demo-page';
  container.style.padding = '2rem';
  container.style.maxWidth = '1200px';
  container.style.margin = '0 auto';
  
  // Create page title
  const pageTitle = document.createElement('h1');
  pageTitle.textContent = 'Notification System Demo';
  pageTitle.style.fontSize = '2rem';
  pageTitle.style.marginBottom = '1rem';
  pageTitle.style.background = 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%)';
  pageTitle.style.WebkitBackgroundClip = 'text';
  pageTitle.style.WebkitTextFillColor = 'transparent';
  
  // Create page description
  const pageDescription = document.createElement('p');
  pageDescription.textContent = 'This page demonstrates the notification system. Click the buttons below to generate different types of notifications.';
  pageDescription.style.fontSize = '1rem';
  pageDescription.style.marginBottom = '2rem';
  pageDescription.style.color = '#666';
  
  // Create notification container (if not exists)
  let notificationContainer = document.getElementById('notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.top = '72px';
    notificationContainer.style.right = '16px';
    notificationContainer.style.width = '320px';
    notificationContainer.style.maxWidth = '90vw';
    notificationContainer.style.zIndex = '9999';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification panel toggle
  const openPanelBtn = document.createElement('button');
  openPanelBtn.textContent = 'Open Notification Panel';
  openPanelBtn.style.padding = '0.75rem 1.5rem';
  openPanelBtn.style.backgroundColor = 'var(--color-primary)';
  openPanelBtn.style.color = 'white';
  openPanelBtn.style.border = 'none';
  openPanelBtn.style.borderRadius = '8px';
  openPanelBtn.style.fontSize = '1rem';
  openPanelBtn.style.fontWeight = '600';
  openPanelBtn.style.cursor = 'pointer';
  openPanelBtn.style.marginBottom = '2rem';
  openPanelBtn.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  
  openPanelBtn.addEventListener('click', () => {
    const userId = window.appState?.user?.id || 'demo-user';
    openNotificationPanel(userId);
  });
  
  // Create demo cards grid
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  grid.style.gap = '1.5rem';
  grid.style.marginBottom = '2rem';
  
  // Add demo notification cards
  grid.appendChild(createDemoCard(
    'Achievement Notifications',
    'Send notifications for accomplishments and milestones',
    createAchievementDemo
  ));
  
  grid.appendChild(createDemoCard(
    'Payment Reminders',
    'Send reminders for upcoming payments and bills',
    createPaymentReminderDemo
  ));
  
  grid.appendChild(createDemoCard(
    'Goal Progress',
    'Track and notify about savings goal progress',
    createGoalProgressDemo
  ));
  
  grid.appendChild(createDemoCard(
    'Financial Summaries',
    'Weekly and monthly financial report notifications',
    createFinancialSummaryDemo
  ));
  
  grid.appendChild(createDemoCard(
    'Spending Alerts',
    'Notify when spending approaches or exceeds limits',
    createSpendingAlertDemo
  ));
  
  grid.appendChild(createDemoCard(
    'Custom Notifications',
    'Create custom notifications with different priorities',
    createCustomNotificationDemo
  ));
  
  // Assemble page
  container.appendChild(pageTitle);
  container.appendChild(pageDescription);
  container.appendChild(openPanelBtn);
  container.appendChild(grid);
  
  // Initialize notification UI
  setTimeout(() => {
    initNotificationUI(window.appState || { user: { id: 'demo-user' } });
    
    // Initialize achievements for demo user
    const userId = window.appState?.user?.id || 'demo-user';
    initializeAchievements(userId);
    updateLoginStreak(userId);
  }, 500);
  
  return container;
}

/**
 * Create a demo card for a notification type
 * @param {string} title - Card title
 * @param {string} description - Card description
 * @param {Function} demoFunction - Function to run when button is clicked
 * @returns {HTMLElement} Card element
 */
function createDemoCard(title, description, demoFunction) {
  const card = document.createElement('div');
  card.className = 'notification-demo-card';
  card.style.backgroundColor = 'white';
  card.style.borderRadius = '12px';
  card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  card.style.padding = '1.5rem';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  
  const cardTitle = document.createElement('h3');
  cardTitle.textContent = title;
  cardTitle.style.fontSize = '1.25rem';
  cardTitle.style.marginBottom = '0.5rem';
  cardTitle.style.fontWeight = '600';
  
  const cardDescription = document.createElement('p');
  cardDescription.textContent = description;
  cardDescription.style.fontSize = '0.875rem';
  cardDescription.style.marginBottom = '1.5rem';
  cardDescription.style.color = '#666';
  cardDescription.style.flex = '1';
  
  const button = document.createElement('button');
  button.textContent = 'Generate Notification';
  button.style.padding = '0.75rem 1rem';
  button.style.backgroundColor = 'var(--color-primary-light, #4f46e5)';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '6px';
  button.style.fontSize = '0.875rem';
  button.style.fontWeight = '500';
  button.style.cursor = 'pointer';
  button.style.transition = 'background-color 0.2s ease';
  
  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = 'var(--color-primary, #4338ca)';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = 'var(--color-primary-light, #4f46e5)';
  });
  
  button.addEventListener('click', () => {
    const userId = window.appState?.user?.id || 'demo-user';
    demoFunction(userId);
  });
  
  card.appendChild(cardTitle);
  card.appendChild(cardDescription);
  card.appendChild(button);
  
  return card;
}

/**
 * Create an achievement notification demo
 * @param {string} userId - User ID
 */
function createAchievementDemo(userId) {
  const achievements = [
    {
      title: 'Savings Milestone',
      message: '🎉 You\'ve saved your first $500! Keep up the great work!'
    },
    {
      title: 'Streak Master',
      message: '🔥 You\'ve stayed under budget for 7 consecutive days!'
    },
    {
      title: 'Budget Expert',
      message: '📊 You\'ve stayed within 5% of your budget for a full month!'
    }
  ];
  
  const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];
  
  createAchievementNotification(
    userId,
    `Achievement Unlocked: ${randomAchievement.title}`,
    randomAchievement.message,
    true, // Show in app
    false, // Don't send email
    false  // Don't send push
  );
  
  // Also update achievement system
  const mockUserData = {
    totalSaved: 500 + Math.floor(Math.random() * 500),
    budgetStreak: 7 + Math.floor(Math.random() * 30),
    completedChallenges: 1 + Math.floor(Math.random() * 5)
  };
  
  checkAchievements(userId, mockUserData);
}

/**
 * Create a payment reminder notification demo
 * @param {string} userId - User ID
 */
function createPaymentReminderDemo(userId) {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 3);
  
  const paymentTypes = [
    {
      title: 'Rent Payment Reminder',
      message: `Your rent payment of $1,200 is due on ${dueDate.toLocaleDateString()}.`,
      data: {
        type: 'Rent',
        amount: 1200,
        dueDate: dueDate.toISOString(),
        paymentMethod: 'Bank Transfer'
      }
    },
    {
      title: 'Utility Bill Reminder',
      message: `Your electric bill of $85.75 is due on ${dueDate.toLocaleDateString()}.`,
      data: {
        type: 'Utilities',
        amount: 85.75,
        dueDate: dueDate.toISOString(),
        paymentMethod: 'Credit Card'
      }
    },
    {
      title: 'Subscription Renewal',
      message: `Your streaming service subscription ($14.99) will renew on ${dueDate.toLocaleDateString()}.`,
      data: {
        type: 'Subscription',
        amount: 14.99,
        dueDate: dueDate.toISOString(),
        paymentMethod: 'Credit Card'
      }
    }
  ];
  
  const randomPayment = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
  
  createPaymentReminderNotification(
    userId,
    randomPayment.title,
    randomPayment.message,
    randomPayment.data,
    true, // Show in app
    false, // Don't send email for demo
    false  // Don't send push for demo
  );
}

/**
 * Create a goal progress notification demo
 * @param {string} userId - User ID
 */
function createGoalProgressDemo(userId) {
  const goals = [
    {
      name: 'Emergency Fund',
      target: 5000,
      current: 1250,
      previousAmount: 1000
    },
    {
      name: 'Vacation Fund',
      target: 2000,
      current: 1000,
      previousAmount: 800
    },
    {
      name: 'New Laptop',
      target: 1500,
      current: 1500,
      previousAmount: 1350
    }
  ];
  
  const randomGoal = goals[Math.floor(Math.random() * goals.length)];
  
  // Track goal progress using achievement service
  trackGoalProgress(userId, randomGoal);
}

/**
 * Create a financial summary notification demo
 * @param {string} userId - User ID
 */
function createFinancialSummaryDemo(userId) {
  const summaryTypes = ['weekly', 'monthly'];
  const randomType = summaryTypes[Math.floor(Math.random() * summaryTypes.length)];
  
  if (randomType === 'weekly') {
    generateWeeklySummary(userId);
  } else {
    generateMonthlySummary(userId);
  }
}

/**
 * Create a spending alert notification demo
 * @param {string} userId - User ID
 */
function createSpendingAlertDemo(userId) {
  // Create some mock spending limits
  const spendingLimits = [
    { category: 'Dining', amount: '300', period: 'monthly' },
    { category: 'Shopping', amount: '200', period: 'monthly' },
    { category: 'Entertainment', amount: '150', period: 'monthly' },
    { category: 'Transportation', amount: '250', period: 'monthly' }
  ];
  
  // Simulate a transaction against these limits
  simulateTransaction(userId, spendingLimits);
}

/**
 * Create a custom notification demo
 * @param {string} userId - User ID
 */
function createCustomNotificationDemo(userId) {
  const priorities = [
    NOTIFICATION_PRIORITIES.LOW,
    NOTIFICATION_PRIORITIES.MEDIUM,
    NOTIFICATION_PRIORITIES.HIGH,
    NOTIFICATION_PRIORITIES.URGENT
  ];
  
  const messages = [
    {
      title: 'Welcome to Notification System',
      message: 'This is a custom notification to demonstrate the notification system.'
    },
    {
      title: 'App Update Available',
      message: 'A new version of Stackr Finance is available with exciting new features!'
    },
    {
      title: 'Security Alert',
      message: 'We detected a login from a new device. Please verify it was you.'
    },
    {
      title: 'Limited Time Offer',
      message: 'Upgrade to Stackr Pro today and get 20% off for the first year!'
    }
  ];
  
  const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  createNotification(
    userId,
    {
      type: NOTIFICATION_TYPES.SYSTEM,
      title: randomMessage.title,
      message: randomMessage.message,
      priority: randomPriority,
      showInApp: true,
      sendEmail: false,
      sendPush: false
    }
  );
}