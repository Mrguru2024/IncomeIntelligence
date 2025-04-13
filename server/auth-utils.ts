import jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface JWTPayload {
  id: number;
  email: string;
  role?: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'nk7n456vXBYz9qrT3uLWsG8EmDcP5hKfAgd2QRxZJF', { expiresIn: '7d' });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'nk7n456vXBYz9qrT3uLWsG8EmDcP5hKfAgd2QRxZJF') as JWTPayload;
};

export const extractTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};
