import { Request, Response, NextFunction } from 'express';

export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  // For now, just pass through
  next();
};

export function setupFirebaseAdmin() {
  return true;
}