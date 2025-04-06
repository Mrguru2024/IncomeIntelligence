
import { Request, Response, NextFunction } from 'express';

export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  next();
};

export function setupFirebaseAdmin() {
  return true;
}
