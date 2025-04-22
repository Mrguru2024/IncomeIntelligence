
import jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface JWTPayload {
  id: number;
  email: string;
  role?: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
};

export const extractTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};
