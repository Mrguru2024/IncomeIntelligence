import { Request, Response, NextFunction } from 'express';
//import { verifyAuth } from './firebase-auth'; // Firebase auth removed
import { verifyToken, JwtPayload } from '../utils/security';
import { storage } from '../storage';

// Define User type to match the User type in Express.Request
type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  [key: string]: any;
};

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to authenticate JWT token from Authorization header
 * Adds the decoded user data to the request object as req.user
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Get authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // Set user data in request
  req.user = {
    id: payload.id,
    username: payload.username,
    email: payload.email,
    role: payload.role || 'user'
  };

  next();
};

/**
 * Middleware to require authentication using either session or token
 * Combines session-based and token-based authentication
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Environment check for development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
  // Special handling for onboarding routes in development mode
  if (isDevelopment && req.path.includes('/onboarding') || req.path.includes('/profile') || req.path.includes('/goals')) {
    console.log('Development mode: bypassing authentication for onboarding route');
    
    // If userId param exists, extract and create a mock user
    const userId = req.params.userId;
    if (userId) {
      req.user = {
        id: parseInt(userId),
        username: 'developmentUser',
        email: 'dev@example.com',
        role: 'user'
      };
    }
    return next();
  }
  
  // Check if already authenticated via session
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // Check if authentication via token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (token) {
    // Log for debugging
    console.log('Verifying auth token:', token.substring(0, 10) + '...');
    
    // Verify token
    const payload = verifyToken(token);
    if (payload) {
      // Set user data in request
      req.user = {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role || 'user'
      };
      return next();
    } else {
      console.log('Token verification failed');
    }
  }
  
  // Special bypass for testing in development environment
  if (isDevelopment) {
    console.log('Development mode: bypassing authentication requirements');
    
    // Create mock user data for development
    req.user = {
      id: 1,
      username: 'developmentUser',
      email: 'dev@example.com',
      role: 'user'
    };
    return next();
  }
  
  // No valid authentication found
  return res.status(401).json({ message: 'Authentication required' });
};

/**
 * Middleware to require admin role
 * Authenticates the user and then checks admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Use requireAuth middleware first to authenticate
  requireAuth(req, res, () => {
    // After authentication, check admin role
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    
    return res.status(403).json({ message: 'Admin access required' });
  });
};

/**
 * Middleware to check if authenticated user matches requested user ID
 * or if the user is an admin
 */
export const requireSelfOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const requestedUserId = parseInt(req.params.userId, 10);

  if (isNaN(requestedUserId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  // Allow if user ID matches or if user is admin
  if (req.user.id === requestedUserId || req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({ message: 'Access denied' });
};

/**
 * Optional authentication middleware
 * Sets user data if token is valid, but doesn't require it
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // Get authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format

  if (!token) {
    return next(); // Allow request to proceed without user
  }

  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    return next(); // Invalid token, proceed without user
  }

  // Set user data in request
  req.user = {
    id: payload.id,
    username: payload.username,
    email: payload.email,
    role: payload.role || 'user'
  };

  next();
};

/**
 * Middleware to check if authenticated user matches userId in request body
 */
export const checkUserMatch = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userId = req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Allow if user ID matches or if user is admin
  if (req.user.id === userId || req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({ message: 'Access denied' });
};