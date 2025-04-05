import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { storage } from './storage';
import { InsertUser, insertUserSchema } from '@shared/schema';
import { generateToken, hashPassword, verifyPassword, generateSecureToken } from './utils/security';
import { authenticateToken, requireAuth } from './middleware/authMiddleware';
import { sendVerificationEmail, sendPasswordResetEmail } from './email-service';

// Add proper validation for registration and login
const registerSchema = insertUserSchema.extend({
  password: z.string().min(8).max(100),
  email: z.string().email(),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1)
});

/**
 * Setup authentication routes
 */
export function setupAuth(app: Express) {
  // Register a new user
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      // Validate input data
      const validatedData = registerSchema.parse(req.body);
      const { confirmPassword, ...userData } = validatedData;
      
      // Check if username/email already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Generate verification token
      const verificationToken = generateSecureToken();
      
      // Hash the password
      const hashedPassword = hashPassword(userData.password);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        verificationToken
      });
      
      // Send verification email
      try {
        await sendVerificationEmail(user.email, user.username, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue registration process even if email fails
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
      
      return res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Registration failed' });
    }
  });
  
  // Login user
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      // Validate input data
      const { identifier, password } = loginSchema.parse(req.body);
      
      // Find user by username or email
      let user = await storage.getUserByUsername(identifier);
      if (!user) {
        user = await storage.getUserByEmail(identifier);
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check if account is active
      if (user.accountStatus !== 'active') {
        return res.status(403).json({ message: 'Account is not active' });
      }
      
      // Verify password
      const isPasswordValid = verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Update last login timestamp
      await storage.updateUserLastLogin(user.id);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
      
      return res.status(200).json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Login failed' });
    }
  });
  
  // Verify email with token
  app.get('/api/auth/verify/:token', async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      // Find user with this verification token
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid verification token' });
      }
      
      // Mark user as verified
      await storage.verifyUser(user.id);
      
      return res.status(200).json({ message: 'Email verification successful. You can now log in.' });
    } catch (error) {
      console.error('Verification error:', error);
      return res.status(500).json({ message: 'Verification failed' });
    }
  });
  
  // Request password reset
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      // Don't reveal if user exists or not
      if (!user) {
        return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link.' });
      }
      
      // Generate reset token
      const resetToken = generateSecureToken();
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // Token valid for 1 hour
      
      // Save reset token to user
      await storage.setPasswordReset(user.id, resetToken, resetExpires);
      
      // Send password reset email
      try {
        await sendPasswordResetEmail(user.email, user.username, resetToken);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        return res.status(500).json({ message: 'Failed to send password reset email' });
      }
      
      return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link.' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Password reset request error:', error);
      return res.status(500).json({ message: 'Password reset request failed' });
    }
  });
  
  // Reset password with token
  app.post('/api/auth/reset-password/:token', async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = z.object({
        password: z.string().min(8).max(100),
        confirmPassword: z.string()
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
      }).parse(req.body);
      
      // Find user with this reset token
      const user = await storage.getUserByResetToken(token);
      
      if (!user || !user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires)) {
        return res.status(400).json({ message: 'Invalid or expired password reset token' });
      }
      
      // Hash the new password
      const hashedPassword = hashPassword(password);
      
      // Update password and clear reset token
      await storage.resetPassword(user.id, hashedPassword);
      
      return res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Password reset error:', error);
      return res.status(500).json({ message: 'Password reset failed' });
    }
  });
  
  // Get current authenticated user
  app.get('/api/auth/user', authenticateToken, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    return res.status(200).json({ user: req.user });
  });
  
  // Logout (client-side only - just for API completeness)
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    // JWT tokens can't be invalidated without a token store/blacklist
    // The client should discard the token
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
      const isPasswordValid = verifyPassword(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Hash the new password
      const hashedPassword = hashPassword(newPassword);
      
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