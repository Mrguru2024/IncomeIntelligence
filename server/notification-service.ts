import { sendEmail } from './email-service';
import { sendNotificationEmail, sendReminderEmail, sendSms, sendInvoiceSms } from './email-service';
import { storage } from './storage';
import { Notification, Reminder } from '@shared/schema';
// Dynamically import the queue module
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Initialize with null, will be populated asynchronously
let emailQueue: any = null;

// Load the queue module asynchronously
(async () => {
  try {
    // Use dynamic import for the queue.cjs module
    const queueModule = await import('./utils/queue.cjs');
    emailQueue = queueModule.default.emailQueue;
    console.log('Queue module loaded successfully');
  } catch (error) {
    console.error('Error loading queue module:', error);
  }
})();

/**
 * In-memory notifications queue for batch processing (fallback if Redis is unavailable)
 */
const notificationQueue: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  createdAt: Date;
}[] = [];

/**
 * Queue a notification for delivery using Redis Queue
 * @param notification The notification to queue
 */
export async function queueNotification(notification: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}) {
  try {
    // Use Redis queue if available
    if (emailQueue) {
      await emailQueue.add('notification', {
        ...notification,
        createdAt: new Date().toISOString(),
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      });
      console.log(`Notification queued in Redis: ${notification.title}`);
    } else {
      // Fallback to legacy in-memory queue if Redis not available
      console.log('Redis queue not available, adding to in-memory queue');
      notificationQueue.push({
        ...notification,
        createdAt: new Date()
      });
      
      // Process queue if it reaches a certain size
      if (notificationQueue.length >= 5) {
        processNotificationQueue();
      }
    }
  } catch (error) {
    console.error('Error queueing notification:', error);
    // Add to in-memory queue as fallback
    notificationQueue.push({
      ...notification,
      createdAt: new Date()
    });
  }
}

/**
 * Process a single notification (used for direct processing)
 * @param notification The notification to process
 */
async function processNotification(notification: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  createdAt: Date;
}) {
  try {
    // Store notification in database
    await storeNotification(notification);
    
    // Get user for sending notifications
    const user = await storage.getUserById(parseInt(notification.userId));
    
    if (!user) {
      console.error(`User ${notification.userId} not found for notification ${notification.title}`);
      return false;
    }
    
    // Process notification based on type
    switch(notification.type) {
      case 'welcome':
        // Send welcome email
        if (user.email && user.settings?.emailNotifications !== false) {
          await sendNotificationEmail({
            to: user.email,
            subject: 'Welcome to Stackr Finance',
            userName: user.firstName || user.username || 'User',
            notificationText: 'Thank you for registering with Stackr Finance. We\'re excited to help you manage your finances better!',
            actionUrl: notification.link || 'https://stackr.finance/dashboard',
            actionText: 'Get Started',
          });
        }
        break;
        
      case 'password_reset':
        // Send password reset email
        if (user.email) {
          await sendNotificationEmail({
            to: user.email,
            subject: 'Password Reset Request',
            userName: user.firstName || user.username || 'User',
            notificationText: notification.message,
            actionUrl: notification.link,
            actionText: 'Reset Password',
          });
        }
        break;
        
      case 'payment_receipt':
        // Send payment receipt email
        if (user.email && user.settings?.emailNotifications !== false) {
          await sendNotificationEmail({
            to: user.email,
            subject: 'Payment Receipt - Stackr Finance',
            userName: user.firstName || user.username || 'User',
            notificationText: notification.message,
            actionUrl: notification.link,
            actionText: 'View Receipt',
          });
        }
        break;
        
      case 'mentorship_accepted':
        // Send mentorship acceptance email
        if (user.email && user.settings?.emailNotifications !== false) {
          await sendNotificationEmail({
            to: user.email,
            subject: 'Mentorship Request Accepted',
            userName: user.firstName || user.username || 'User',
            notificationText: notification.message,
            actionUrl: notification.link,
            actionText: 'View Mentorship Details',
          });
        }
        break;
        
      case 'security_alert':
        // Send security alert via email and SMS
        if (user.email && user.settings?.emailNotifications !== false) {
          await sendNotificationEmail({
            to: user.email,
            subject: '⚠️ Security Alert - Stackr Finance',
            userName: user.firstName || user.username || 'User',
            notificationText: notification.message,
            actionUrl: notification.link,
            actionText: 'Review Activity',
          });
        }
        
        // Send security SMS alert
        if (user.phoneNumber && user.settings?.smsAlerts !== false) {
          await sendSms({
            to: user.phoneNumber,
            message: `Stackr Security Alert: ${notification.message}`,
          });
        }
        
        // If this is an admin alert, send to all admins
        if (notification.message.includes('admin')) {
          // Get admin users
          const admins = await storage.getAdminUsers();
          for (const admin of admins) {
            if (admin.phoneNumber) {
              await sendSms({
                to: admin.phoneNumber,
                message: `ADMIN ALERT: ${notification.message}`,
              });
            }
          }
        }
        break;
        
      case 'important':
      case 'alert':
        // Send important notification via email
        if (user.email && user.settings?.emailNotifications !== false) {
          await sendNotificationEmail({
            to: user.email,
            subject: notification.title,
            userName: user.firstName || user.username || 'User',
            notificationText: notification.message,
            actionUrl: notification.link,
            actionText: 'View Details',
          });
        }
        break;
        
      default:
        // Standard notification - no external delivery
        break;
    }
    
    return true;
  } catch (error) {
    console.error('Error processing notification:', error);
    return false;
  }
}

/**
 * Process queued notifications by storing them in the database
 * and sending email/SMS notifications based on type
 */
export async function processNotificationQueue() {
  if (notificationQueue.length === 0) {
    return;
  }
  
  console.log(`Processing ${notificationQueue.length} notifications`);
  
  const notificationsToProcess = [...notificationQueue];
  notificationQueue.length = 0; // Clear the queue
  
  for (const notification of notificationsToProcess) {
    try {
      // Store notification in database
      await storeNotification(notification);
      
      // Get user for sending notifications
      const user = await storage.getUserById(parseInt(notification.userId));
      
      if (!user) {
        console.error(`User ${notification.userId} not found for notification ${notification.title}`);
        continue;
      }
      
      // Process notification based on type
      switch(notification.type) {
        case 'welcome':
          // Send welcome email
          if (user.email && user.settings?.emailNotifications !== false) {
            await sendNotificationEmail({
              to: user.email,
              subject: 'Welcome to Stackr Finance',
              userName: user.firstName || user.username || 'User',
              notificationText: 'Thank you for registering with Stackr Finance. We\'re excited to help you manage your finances better!',
              actionUrl: notification.link || 'https://stackr.finance/dashboard',
              actionText: 'Get Started',
            });
          }
          break;
          
        case 'password_reset':
          // Send password reset email
          if (user.email) {
            await sendNotificationEmail({
              to: user.email,
              subject: 'Password Reset Request',
              userName: user.firstName || user.username || 'User',
              notificationText: notification.message,
              actionUrl: notification.link,
              actionText: 'Reset Password',
            });
          }
          break;
          
        case 'payment_receipt':
          // Send payment receipt email
          if (user.email && user.settings?.emailNotifications !== false) {
            await sendNotificationEmail({
              to: user.email,
              subject: 'Payment Receipt - Stackr Finance',
              userName: user.firstName || user.username || 'User',
              notificationText: notification.message,
              actionUrl: notification.link,
              actionText: 'View Receipt',
            });
          }
          break;
          
        case 'mentorship_accepted':
          // Send mentorship acceptance email
          if (user.email && user.settings?.emailNotifications !== false) {
            await sendNotificationEmail({
              to: user.email,
              subject: 'Mentorship Request Accepted',
              userName: user.firstName || user.username || 'User',
              notificationText: notification.message,
              actionUrl: notification.link,
              actionText: 'View Mentorship Details',
            });
          }
          break;
          
        case 'security_alert':
          // Send security alert via email and SMS
          if (user.email && user.settings?.emailNotifications !== false) {
            await sendNotificationEmail({
              to: user.email,
              subject: '⚠️ Security Alert - Stackr Finance',
              userName: user.firstName || user.username || 'User',
              notificationText: notification.message,
              actionUrl: notification.link,
              actionText: 'Review Activity',
            });
          }
          
          // Send security SMS alert
          if (user.phoneNumber && user.settings?.smsAlerts !== false) {
            await sendSms({
              to: user.phoneNumber,
              message: `Stackr Security Alert: ${notification.message}`,
            });
          }
          
          // If this is an admin alert, send to all admins
          if (notification.message.includes('admin')) {
            // Get admin users
            const admins = await storage.getAdminUsers();
            for (const admin of admins) {
              if (admin.phoneNumber) {
                await sendSms({
                  to: admin.phoneNumber,
                  message: `ADMIN ALERT: ${notification.message}`,
                });
              }
            }
          }
          break;
          
        case 'important':
        case 'alert':
          // Send important notification via email
          if (user.email && user.settings?.emailNotifications !== false) {
            await sendNotificationEmail({
              to: user.email,
              subject: notification.title,
              userName: user.firstName || user.username || 'User',
              notificationText: notification.message,
              actionUrl: notification.link,
              actionText: 'View Details',
            });
          }
          break;
          
        default:
          // Standard notification - no external delivery
          break;
      }
    } catch (error) {
      console.error('Error processing notification:', error);
      // Put failed notification back in the queue
      notificationQueue.push(notification);
    }
  }
}

/**
 * Store a notification in the database
 * @param notification The notification to store
 */
async function storeNotification(notification: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  createdAt: Date;
}) {
  try {
    await storage.createNotification({
      userId: parseInt(notification.userId),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link,
      read: false,
      createdAt: notification.createdAt,
    });
    return true;
  } catch (error) {
    console.error('Error storing notification:', error);
    return false;
  }
}

/**
 * Process and send reminders that are due
 */
export async function processReminders() {
  try {
    const now = new Date();
    const reminders = await storage.getReminders();
    const dueReminders = reminders.filter(reminder => 
      reminder.nextReminderDate && new Date(reminder.nextReminderDate) <= now && !reminder.completed
    );
    
    console.log(`Processing ${dueReminders.length} due reminders`);
    
    for (const reminder of dueReminders) {
      await processReminder(reminder);
    }
    
    return dueReminders.length;
  } catch (error) {
    console.error('Error processing reminders:', error);
    return 0;
  }
}

/**
 * Process an individual reminder
 * @param reminder The reminder to process
 */
async function processReminder(reminder: Reminder) {
  try {
    const user = await storage.getUserById(reminder.userId);
    
    if (!user) {
      console.error(`User ${reminder.userId} not found for reminder ${reminder.id}`);
      return false;
    }
    
    // Send email notification
    if (user.email && user.settings?.emailReminders !== false) {
      await sendReminderEmail({
        to: user.email,
        subject: `Reminder: ${reminder.title}`,
        userName: user.firstName || user.username || 'User',
        reminderText: reminder.description || reminder.title,
        dueDate: reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString() : undefined,
        amount: reminder.amount,
        category: reminder.category,
      });
    }
    
    // Send SMS for bill reminders if user has phone number and SMS notifications enabled
    if (reminder.category === 'bill' && user.phoneNumber && user.settings?.smsReminders !== false) {
      const dueDate = reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString() : 'soon';
      const amountText = reminder.amount ? `$${reminder.amount}` : '';
      
      // Send SMS notification for bill reminder
      await sendSms({
        to: user.phoneNumber,
        message: `Stackr Reminder: Your ${reminder.title} ${amountText} is due ${dueDate}. ${reminder.description || ''}`,
      });
      
      console.log(`SMS bill reminder sent to ${user.phoneNumber} for reminder ${reminder.id}`);
    }
    
    // Create in-app notification
    await storage.createNotification({
      userId: reminder.userId,
      title: `Reminder: ${reminder.title}`,
      message: reminder.description || 'Your scheduled reminder is due.',
      type: 'reminder',
      read: false,
      createdAt: new Date(),
    });
    
    // Update reminder's next date based on frequency
    const nextDate = calculateNextReminderDate(reminder);
    
    if (nextDate) {
      await storage.updateReminderNextDate(reminder.id, nextDate);
    } else {
      // If no next date (one-time reminder), mark as completed
      await storage.updateReminderStatus(reminder.id, true);
    }
    
    return true;
  } catch (error) {
    console.error(`Error processing reminder ${reminder.id}:`, error);
    return false;
  }
}

/**
 * Calculate the next reminder date based on frequency
 * @param reminder The reminder to calculate next date for
 * @returns The next reminder date or null if it's a one-time reminder
 */
function calculateNextReminderDate(reminder: Reminder): Date | null {
  if (!reminder.frequency || reminder.frequency === 'once') {
    return null; // One-time reminder
  }
  
  const now = new Date();
  const nextDate = new Date(now);
  
  switch (reminder.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      return null;
  }
  
  return nextDate;
}

/**
 * Initialize the notification service
 * Sets up timers for processing the notification queue and reminders
 */
export function initializeNotificationService() {
  console.log('Initializing notification service');
  
  // Process notification queue every 5 minutes
  setInterval(processNotificationQueue, 5 * 60 * 1000);
  
  // Process reminders every hour
  setInterval(processReminders, 60 * 60 * 1000);
  
  // Initial processing
  setTimeout(() => {
    processNotificationQueue();
    processReminders();
  }, 5000);
  
  return true;
}