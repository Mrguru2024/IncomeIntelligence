import { Express, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';
import MemoryStore from 'memorystore';
import jwt from 'jsonwebtoken';

// Types for authenticated users
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email?: string;
      role?: string;
      subscriptionTier?: 'free' | 'pro' | 'lifetime';
      subscriptionActive?: boolean;
      onboardingCompleted?: boolean;
      onboardingStep?: string;
    }
  }
}

// Create memory store for sessions
const MemStore = MemoryStore(session);

// For secure password hashing
const scryptAsync = promisify(scrypt);

// Hash a password using scrypt
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Compare a supplied password with a stored hashed password
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Create JWT token
function createToken(user: Express.User, rememberMe: boolean = false): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    subscriptionTier: user.subscriptionTier,
    subscriptionActive: user.subscriptionActive,
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'stackr-jwt-secret', {
    expiresIn: rememberMe ? '30d' : '24h', // 30 days if remember me is checked, 24 hours otherwise
  });
}

// Verify JWT token
function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'stackr-jwt-secret');
  } catch (err) {
    return null;
  }
}

// JWT authentication middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  const user = verifyToken(token);
  if (!user) {
    return res.sendStatus(403);
  }
  
  req.user = user;
  next();
}

// Setup authentication for the Express app
// Function to generate a random token for password reset
export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

// Function to send password reset email (placeholder for actual implementation)
async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  // In a real implementation, this would use an email service
  console.log(`Sending password reset email to ${email} with token ${token}`);
  
  // For demonstration, we'll simulate successful email sending
  return true;
}

export function setupAuth(app: Express) {
  // Configure session
  const sessionOptions: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'stackr-session-secret',
    resave: false,
    saveUninitialized: false,
    store: new MemStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours by default
    },
  };
  
  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Setup LocalStrategy for username/password login
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Use the new method that accepts either username or email
        const user = await storage.getUserByUsernameOrEmail(username);
        
        if (!user) {
          return done(null, false, { message: 'Incorrect username or email' });
        }
        
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password' });
        }
        
        // Don't include password in user object
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
        
      } catch (err) {
        return done(err);
      }
    }),
  );
  
  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (err) {
      done(err);
    }
  });
  
  // Register route
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Check if email already exists (if email is provided)
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ message: 'Email already exists' });
        }
      }
      
      // Create new user with hashed password
      const newUser = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        role: 'user',
        subscriptionTier: 'free',
        subscriptionActive: false,
        onboardingCompleted: false,
        onboardingStep: 'welcome',
      });
      
      // Don't include password in response
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Log in the new user automatically
      req.login(userWithoutPassword, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login error after registration' });
        }
        
        // For registration, assume "Remember Me" is true for better UX
        const rememberMe = true;
        
        // Set session cookie expiration for new users (30 days)
        if (req.session) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
          console.log('Setting new user session with extended expiration (30 days)');
        }
        
        // Generate JWT token for API access with extended expiration
        const token = createToken(userWithoutPassword, rememberMe);
        
        res.status(201).json({
          ...userWithoutPassword,
          token,
          rememberMe,
        });
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });
  
  // Login route
  app.post('/api/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Authentication failed' });
      }
      
      // Handle "Remember Me" option
      const rememberMe = req.body.rememberMe === true;
      
      // Set session cookie expiration based on "Remember Me" option
      if (req.session) {
        if (rememberMe) {
          // 30 days if "Remember Me" is checked
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
          console.log('Setting session with extended expiration (30 days) for Remember Me');
        } else {
          // 24 hours by default
          req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
          console.log('Setting session with standard expiration (24 hours)');
        }
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Generate JWT token for API access with expiration based on rememberMe
        const token = createToken(user, rememberMe);
        
        res.json({
          ...user,
          token,
          rememberMe, // Return the rememberMe state to the client for reference
        });
      });
    })(req, res, next);
  });
  
  // Get current user route
  app.get('/api/user', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      // Check JWT token if session-based auth fails
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = verifyToken(token);
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      return res.json(user);
    }
    
    res.json(req.user);
  });
  
  // Logout route
  app.post('/api/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout error' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  // Change password route (when logged in)
  app.post('/api/change-password', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current and new password are required' });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const isValid = await comparePasswords(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Update password
      await storage.updateUser(user.id, {
        password: await hashPassword(newPassword),
      });
      
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('Password change error:', err);
      res.status(500).json({ message: 'Server error during password change' });
    }
  });
  
  // Request password reset route (forgot password)
  app.post('/api/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      // For security reasons, always return success even if the email doesn't exist
      // This prevents attackers from determining which emails are registered
      if (!user) {
        return res.json({ 
          message: 'If a user with that email exists, a password reset link has been sent.'
        });
      }
      
      // Generate a password reset token
      const resetToken = generateResetToken();
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Save the reset token and expiration to the user's record
      await storage.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpires,
      });
      
      // Send reset email (this would be implemented in a production environment)
      const resetUrl = `${req.protocol}://${req.get('host')}/#reset-password/${resetToken}`;
      await sendPasswordResetEmail(email, resetUrl);
      
      res.json({
        message: 'If a user with that email exists, a password reset link has been sent.'
      });
    } catch (err) {
      console.error('Password reset request error:', err);
      res.status(500).json({ message: 'Server error during password reset request' });
    }
  });
  
  // Reset password with token route
  app.post('/api/reset-password/:token', async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }
      
      // Find user with the given reset token
      const user = await storage.getUserByResetToken(token);
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired password reset token' });
      }
      
      // Check if token is expired
      if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        return res.status(400).json({ message: 'Password reset token has expired' });
      }
      
      // Update the user's password and clear the reset token
      await storage.updateUser(user.id, {
        password: await hashPassword(newPassword),
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      
      // If the user has a session, log them out to be safe
      if (req.session) {
        req.session.destroy((err) => {
          if (err) console.error('Error destroying session:', err);
        });
      }
      
      res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
      console.error('Password reset error:', err);
      res.status(500).json({ message: 'Server error during password reset' });
    }
  });
}