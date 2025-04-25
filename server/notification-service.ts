import { storage } from './storage';
import { sendNotificationEmail, sendReminderEmail } from './email-service';
import { addDays, addWeeks, addMonths } from 'date-fns';
import { InsertNotification } from '@shared/schema';

export type NotificationType = 'info' | 'warning' | 'success' | 'reminder';

export interface NotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  sendEmail?: boolean;
  sendPush?: boolean;
  metadata?: any;
}

export class NotificationService {
  /**
   * Send a notification to the client-side for immediate processing
   * This is used for real-time notifications like guardrails alerts
   */
  async sendNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    read: boolean;
    createdAt: Date;
  }): Promise<void> {
    try {
      // Convert userId from string to number
      const userId = parseInt(notification.userId, 10);
      if (isNaN(userId)) {
        console.error('Invalid userId for notification:', notification.userId);
        return;
      }
      
      // Create a notification record in the database
      const notificationPayload: InsertNotification = {
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type as any, // Cast to match the expected type
        isRead: notification.read,
        metadata: notification.data || null
      };
      
      await storage.createNotification(notificationPayload);
      
      // In a real implementation, we would emit this notification to connected clients 
      // through WebSockets or Server-Sent Events
      console.log(`Notification sent to user ${userId}: ${notification.title}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
  
  /**
   * Create a new notification and optionally send it via configured channels
   */
  async createNotification(notificationData: NotificationRequest): Promise<any> {
    try {
      // First, save the notification in the database
      const notificationPayload: InsertNotification = {
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        isRead: false,
        metadata: notificationData.metadata ? notificationData.metadata : null
      };
      
      const notification = await storage.createNotification(notificationPayload);
      
      // Get user data for sending notifications
      const user = await storage.getUser(notificationData.userId);
      
      if (!user) {
        console.error(`User with ID ${notificationData.userId} not found`);
        return notification;
      }
      
      // Send email if requested and user has an email
      if (notificationData.sendEmail && user.email) {
        await sendNotificationEmail(
          user.email,
          notificationData.title,
          notificationData.message,
          notificationData.type
        );
      }
      
      // Send push notification if requested (to be implemented)
      if (notificationData.sendPush) {
        // Future implementation for push notifications
        console.log('Push notification requested but not implemented yet');
      }
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
  
  /**
   * Send reminder notifications for upcoming reminders
   */
  async sendReminderNotifications(): Promise<void> {
    try {
      // Get all active reminders that are due today
      const dueReminders = await storage.getDueReminders(1); // Placeholder for now, we'll update the call later
      
      for (const reminder of dueReminders) {
        // Get user data
        const user = await storage.getUser(reminder.userId);
        
        if (!user || !user.email) {
          console.log(`Cannot send reminder: User with ID ${reminder.userId} not found or has no email`);
          continue;
        }
        
        // Create a notification record
        await this.createNotification({
          userId: reminder.userId,
          title: reminder.title,
          message: reminder.message,
          type: 'reminder',
          sendEmail: true,
          metadata: { reminderId: reminder.id }
        });
        
        // Send email directly for the reminder
        await sendReminderEmail(
          user.email,
          reminder.title,
          reminder.message,
          reminder.nextRemindAt
        );
        
        // Mark reminder as sent
        await storage.markReminderSent(reminder.id);
        
        // Update next due date based on frequency
        await this.updateReminderNextDate(reminder);
      }
    } catch (error) {
      console.error('Error sending reminder notifications:', error);
    }
  }
  
  /**
   * Update a reminder's next date based on its frequency
   */
  private async updateReminderNextDate(reminder: any): Promise<void> {
    // Check if this is a one-time reminder
    if (reminder.frequency === 'once') {
      // For one-time reminders, just mark as inactive
      await storage.updateReminder(reminder.id, { isActive: false });
      return;
    }
    
    // Calculate the next remind date based on frequency
    let nextDate = new Date(reminder.nextRemindAt);
    
    switch (reminder.frequency) {
      case 'daily':
        nextDate = addDays(nextDate, 1);
        break;
      case 'weekly':
        nextDate = addWeeks(nextDate, 1);
        break;
      case 'biweekly':
        nextDate = addWeeks(nextDate, 2);
        break;
      case 'monthly':
        nextDate = addMonths(nextDate, 1);
        break;
      case 'quarterly':
        nextDate = addMonths(nextDate, 3);
        break;
      case 'yearly':
        nextDate = addMonths(nextDate, 12);
        break;
      default:
        return; // Unknown frequency, don't update
    }
    
    await storage.updateReminderNextDate(reminder.id, nextDate);
  }
}

export const notificationService = new NotificationService();