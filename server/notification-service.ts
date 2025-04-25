import { sendEmail } from './email-service';
import { sendNotificationEmail, sendReminderEmail } from './email-service';
import { storage } from './storage';
import { Notification, Reminder } from '@shared/schema';

/**
 * In-memory notifications queue for batch processing
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
 * Queue a notification for delivery
 * @param notification The notification to queue
 */
export function queueNotification(notification: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}) {
  notificationQueue.push({
    ...notification,
    createdAt: new Date(),
  });
  
  // Process queue if it reaches a certain size
  if (notificationQueue.length >= 5) {
    processNotificationQueue();
  }
}

/**
 * Process queued notifications by storing them in the database
 * and sending email notifications if relevant
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
      
      // Send email if it's an important notification
      if (notification.type === 'important' || notification.type === 'alert') {
        const user = await storage.getUserById(parseInt(notification.userId));
        
        if (user && user.email && user.settings?.emailNotifications !== false) {
          await sendNotificationEmail({
            to: user.email,
            subject: notification.title,
            userName: user.firstName || user.username || 'User',
            notificationText: notification.message,
            actionUrl: notification.link,
            actionText: 'View Details',
          });
        }
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