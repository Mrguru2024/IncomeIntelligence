import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Middleware to check if the user has an active Pro subscription
 * This middleware should be used after the requireAuth middleware
 */
export const requireProSubscription = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Check if user has an active Pro subscription
    // For development, we'll mock the subscription status based on user data
    const user = await storage.getUser(req.user.id);
    const subscription = user ? {
      status: user.subscriptionActive ? 'active' : 'inactive',
      plan: user.subscriptionTier || 'free'
    } : null;
    
    // Allow if user has Pro or Lifetime subscription
    if (
      subscription && 
      (subscription.status === 'active' || subscription.status === 'lifetime') &&
      (subscription.plan === 'pro' || subscription.plan === 'lifetime')
    ) {
      return next();
    }

    // Special bypass for development environment
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      console.log('Development mode: bypassing Pro subscription requirement');
      return next();
    }
    
    // No active Pro subscription
    return res.status(403).json({ 
      message: 'This feature requires a Pro subscription',
      upgradeUrl: '/pricing'
    });
  } catch (error) {
    console.error('Error checking Pro subscription:', error);
    
    // In case of an error, still allow in development mode
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      console.log('Development mode: bypassing Pro subscription requirement due to error');
      return next();
    }
    
    res.status(500).json({ message: 'Failed to verify subscription status' });
  }
};