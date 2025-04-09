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
      subscriptionStatus?: 'free' | 'basic' | 'pro';
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
function createToken(user: Express.User): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'stackr-jwt-secret', {
    expiresIn: '7d',
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
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };
  
  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Setup LocalStrategy for username/password login
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
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
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Create new user with hashed password
      const newUser = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        role: 'user',
        subscriptionStatus: 'free',
      });
      
      // Don't include password in response
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Log in the new user automatically
      req.login(userWithoutPassword, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login error after registration' });
        }
        
        // Generate JWT token for API access
        const token = createToken(userWithoutPassword);
        
        res.status(201).json({
          ...userWithoutPassword,
          token,
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
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Generate JWT token for API access
        const token = createToken(user);
        
        res.json({
          ...user,
          token,
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
  
  // Change password route
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
}