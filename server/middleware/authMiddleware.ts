import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/security';

// Extend Express Request interface to add user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        [key: string]: any;
      };
    }
  }
}

/**
 * Middleware to protect routes - verifies and extracts JWT token
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    
    // Extract and verify token
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
    
    // Add user data to request for use in route handlers
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
}

/**
 * Check if the requesting user matches the user ID from the route parameter
 * Used to ensure users can only access their own resources
 */
export function checkUserMatch(req: Request, res: Response, next: NextFunction) {
  // Check if user exists in request (set by requireAuth middleware)
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }
  
  // Get user ID from route parameter
  const userIdParam = req.params.userId || req.params.id;
  
  if (!userIdParam) {
    return res.status(400).json({
      status: 'error',
      message: 'User ID parameter missing from route'
    });
  }
  
  const paramUserId = parseInt(userIdParam, 10);
  
  // Check if the authenticated user matches the requested user
  if (req.user.id !== paramUserId) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied: You can only access your own resources'
    });
  }
  
  next();
}

/**
 * Optional authentication middleware - populates req.user if token is valid
 * but does not require authentication to continue
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract and verify token
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      if (decoded) {
        // Add user data to request
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    // Continue even if token is invalid
    next();
  }
}