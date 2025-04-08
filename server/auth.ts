import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { storage } from './storage';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { JWTPayload, generateToken, verifyToken, extractTokenFromRequest } from './auth-utils';
import { generateSecureToken } from './utils/security';
import { authenticateToken, requireAuth } from './middleware/authMiddleware';
import express from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authRouter = express.Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user[0].id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: user[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existingUser = await db.select().from(users).where(eq(users.email, email));

    if (existingUser.length) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      role: 'user',
      accountStatus: 'active'
    }).returning();

    const token = jwt.sign({ userId: newUser[0].id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: newUser[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


export async function getCurrentUser(req: Request, res: Response) {
  try {
    // The user object should be attached by the auth middleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user data' });
  }
}

/**
 * Setup authentication routes
 */
export function setupAuth(app: Express) {
  // Register a new user
  app.use('/api/auth', authRouter);

  // Get current authenticated user
  app.get('/api/auth/user', authenticateToken, getCurrentUser);

  // Logout (client-side only - just for API completeness)
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    return res.status(200).json({ message: 'Logout successful' });
  });

  // Change password (authenticated)
  app.post('/api/auth/change-password', authenticateToken, requireAuth, async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = z.object({
            currentPassword: z.string().min(1),
            newPassword: z.string().min(8).max(100),
            confirmPassword: z.string()
        }).refine(data => data.newPassword === data.confirmPassword, {
            message: "Passwords don't match",
            path: ["confirmPassword"]
        }).parse(req.body);

        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Get the full user with password
        const user = await storage.getUser(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await storage.updateUser(user.id, { password: hashedPassword });

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const validationError = fromZodError(error);
            return res.status(400).json({ message: validationError.message });
        }
        console.error('Change password error:', error);
        return res.status(500).json({ message: 'Failed to change password' });
    }
});


  // Update user profile (authenticated)
  app.patch('/api/auth/profile', authenticateToken, requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const validatedData = insertUserSchema.partial().omit({
        password: true,
        username: true,
        email: true
      }).parse(req.body);

      // Update user
      const updatedUser = await storage.updateUser(req.user.id, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;

      return res.status(200).json({
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Update profile error:', error);
      return res.status(500).json({ message: 'Failed to update profile' });
    }
  });
}