import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/security';
import { storage } from '../storage';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: string;
        [key: string]: any;
      };
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
 * Middleware to require authentication
 * Must be used after authenticateToken middleware
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  next();
};

/**
 * Middleware to require admin role
 * Must be used after authenticateToken middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
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