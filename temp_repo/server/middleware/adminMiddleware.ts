import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the authenticated user has admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // First make sure user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: Authentication required' });
  }
  
  // Then check for admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  // User has admin role, proceed
  next();
}