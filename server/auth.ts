import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { storage } from './storage';
import { InsertUser, insertUserSchema } from '@shared/schema';
import { generateToken, hashPassword, verifyPassword, generateSecureToken } from './utils/security';
import { authenticateToken, requireAuth } from './middleware/authMiddleware';
import { sendVerificationEmail, sendPasswordResetEmail } from './email-service';
import { twoFactorService } from './services/two-factor-service';
import { handleSocialAuth } from './middleware/firebase-auth';

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
      
      // Check if account is active - currently disabled 
      // Log login attempt info
      console.log(`Login attempt - User: ${user.username}`);
      
      // Schema has account_status but database doesn't have that column yet
      // So we'll skip this check for now and assume all accounts are active
      // if (user.accountStatus && user.accountStatus !== 'active') {
      //   return res.status(403).json({ message: 'Account is not active' });
      // }
      
      // Verify password
      const isPasswordValid = verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Update last login timestamp
      await storage.updateUserLastLogin(user.id);
      
      // Check if 2FA is enabled
      if (user.twoFactorEnabled && user.twoFactorVerified) {
        // Return only enough information for 2FA verification
        return res.status(200).json({
          message: 'Two-factor authentication required',
          requires2FA: true,
          userId: user.id
        });
      }
      
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

  // Social login (Firebase Authentication)
  app.post('/api/auth/social-login', async (req: Request, res: Response) => {
    try {
      const { idToken } = z.object({
        idToken: z.string().min(1),
        provider: z.string().optional(),
        uid: z.string().optional(),
        email: z.string().email().optional(),
        displayName: z.string().optional(),
        photoURL: z.string().optional()
      }).parse(req.body);
      
      // Verify and handle the token with Firebase
      let user;
      try {
        user = await handleSocialAuth(idToken);
      } catch (err) {
        const error = err as Error;
        console.warn('Social login failed:', error.message || 'Unknown error');
        if (process.env.NODE_ENV === 'development') {
          // In development mode, we can continue with a mock user
          user = {
            id: 1,
            username: 'devuser',
            email: 'dev@example.com',
            role: 'user',
            provider: 'firebase',
            providerId: 'mock-uid',
            firebaseUid: 'mock-uid',
          };
          console.log('Using mock user for development:', user);
        } else {
          return res.status(503).json({ 
            message: 'Social authentication is currently unavailable',
            details: error.message || 'Unknown error'
          });
        }
      }
      
      if (!user) {
        return res.status(400).json({ message: 'Failed to authenticate with social provider' });
      }
      
      // Generate JWT token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email || '',
        role: user.role
      });
      
      // Create user response without password
      const userResponse = { ...user } as Record<string, any>;
      
      // Delete password if it exists (for non-mock users)
      if ('password' in userResponse) {
        delete userResponse.password;
      }
      
      return res.status(200).json({
        message: 'Social login successful',
        user: userResponse,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Social login error:', error);
      return res.status(500).json({ message: 'Social login failed' });
    }
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
  
  // 2FA - Generate setup data
  app.get('/api/auth/2fa/setup', authenticateToken, requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Generate secret and QR code
      const setupData = await twoFactorService.generateSecret(req.user.username);
      
      // Store secret temporarily - not enabling 2FA yet
      await storage.updateUser(req.user.id, {
        twoFactorSecret: setupData.secret,
        twoFactorVerified: false
      });
      
      return res.status(200).json({
        qrCodeUrl: setupData.qrCodeUrl,
        secret: setupData.secret,
        otpAuthUrl: setupData.otpAuthUrl
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      return res.status(500).json({ message: 'Failed to setup 2FA' });
    }
  });
  
  // 2FA - Verify and enable
  app.post('/api/auth/2fa/enable', authenticateToken, requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { token } = z.object({
        token: z.string().length(6).regex(/^\d+$/)
      }).parse(req.body);
      
      // Verify token against the stored secret
      const isValid = await twoFactorService.verifyToken(req.user.id, token);
      
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
      
      // Get the user to access the secret
      const user = await storage.getUser(req.user.id);
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ message: 'No 2FA setup found' });
      }
      
      // Enable 2FA
      const success = await twoFactorService.enable2FA(req.user.id, user.twoFactorSecret);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to enable 2FA' });
      }
      
      // Generate backup codes
      const backupCodes = await twoFactorService.generateBackupCodes(req.user.id);
      
      return res.status(200).json({
        message: '2FA enabled successfully',
        backupCodes
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('2FA enable error:', error);
      return res.status(500).json({ message: 'Failed to enable 2FA' });
    }
  });
  
  // 2FA - Verify token for login
  app.post('/api/auth/2fa/verify', async (req: Request, res: Response) => {
    try {
      const { userId, token } = z.object({
        userId: z.number(),
        token: z.string().length(6).regex(/^\d+$/)
      }).parse(req.body);
      
      // Verify token against the stored secret
      const isValid = await twoFactorService.verifyToken(userId, token);
      
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid verification code' });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const jwtToken = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
      
      return res.status(200).json({
        message: '2FA verification successful',
        user: userWithoutPassword,
        token: jwtToken
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('2FA verification error:', error);
      return res.status(500).json({ message: 'Failed to verify 2FA token' });
    }
  });
  
  // 2FA - Use backup code
  app.post('/api/auth/2fa/backup', async (req: Request, res: Response) => {
    try {
      const { userId, backupCode } = z.object({
        userId: z.number(),
        backupCode: z.string().regex(/^[A-Z0-9]{8}$/)
      }).parse(req.body);
      
      // Verify backup code
      const isValid = await twoFactorService.verifyBackupCode(userId, backupCode);
      
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid backup code' });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const jwtToken = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
      
      return res.status(200).json({
        message: 'Backup code verification successful',
        user: userWithoutPassword,
        token: jwtToken
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Backup code verification error:', error);
      return res.status(500).json({ message: 'Failed to verify backup code' });
    }
  });
  
  // 2FA - Disable
  app.post('/api/auth/2fa/disable', authenticateToken, requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { password } = z.object({
        password: z.string().min(1)
      }).parse(req.body);
      
      // Get the full user with password
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify password
      const isPasswordValid = verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }
      
      // Disable 2FA
      const success = await twoFactorService.disable2FA(req.user.id);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to disable 2FA' });
      }
      
      return res.status(200).json({
        message: '2FA disabled successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('2FA disable error:', error);
      return res.status(500).json({ message: 'Failed to disable 2FA' });
    }
  });
  
  // 2FA - Get backup codes
  app.get('/api/auth/2fa/backup-codes', authenticateToken, requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!user.twoFactorEnabled || !user.twoFactorBackupCodes) {
        return res.status(400).json({ message: '2FA is not enabled or backup codes not generated' });
      }
      
      return res.status(200).json({
        backupCodes: user.twoFactorBackupCodes
      });
    } catch (error) {
      console.error('Get backup codes error:', error);
      return res.status(500).json({ message: 'Failed to get backup codes' });
    }
  });
}