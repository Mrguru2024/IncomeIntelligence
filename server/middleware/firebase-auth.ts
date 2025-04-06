import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { getFirebaseAdmin, initializeFirebaseAdmin } from '../firebase-admin';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// We'll set this flag when needed, it will be updated by initializeFirebaseAdmin()
let hasFirebaseCredentials = false;

// Function to set up Firebase Admin SDK
export function setupFirebaseAdmin() {
  hasFirebaseCredentials = initializeFirebaseAdmin();
  return hasFirebaseCredentials;
}

// Middleware to verify Firebase token
export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  // If Firebase is not initialized, we'll handle this gracefully in development
  if (!hasFirebaseCredentials) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Firebase auth verification skipped - credentials not available (development mode)');
      // In development, we'll allow the request to proceed
      next();
      return;
    } else {
      // In production, we should reject the request
      console.warn('Firebase auth verification skipped - credentials not available');
      return res.status(503).json({ 
        message: 'Social authentication is disabled - Firebase credentials not configured' 
      });
    }
  }
  
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }
  
  try {
    // Get admin from our new centralized firebase-admin module
    const firebaseAdmin = getFirebaseAdmin();
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    
    // Create proper user object that matches Express.User interface
    req.user = {
      id: 0, // This will be set properly when we fetch the actual user
      username: decodedToken.name || '',
      email: decodedToken.email || '',
      role: 'user',
      ...decodedToken
    };
    
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

// Function to create or update user from Firebase auth
export const handleSocialAuth = async (idToken: string) => {
  // Check if Firebase is initialized
  if (!hasFirebaseCredentials) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Firebase social auth handling skipped - credentials not available (development mode)');
      // In development, we can create a mock user for testing
      const mockUser = {
        id: 1,
        username: 'devuser',
        email: 'dev@example.com',
        role: 'user',
        provider: 'firebase',
        providerId: 'mock-uid',
        firebaseUid: 'mock-uid',
      };
      return mockUser;
    } else {
      throw new Error('Social authentication is disabled - Firebase credentials not configured');
    }
  }
  
  try {
    // Get admin from our new centralized firebase-admin module
    const firebaseAdmin = getFirebaseAdmin();
    // Verify the ID token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    
    const { uid, email, name, picture } = decodedToken;
    
    // Check if user exists by email
    let existingUser = null;
    if (email) {
      // Manually query for user by email since we don't have getUserByEmail method
      const users = await storage.getUsers();
      existingUser = users.find((user) => user.email === email);
    }
    
    if (existingUser) {
      // Update existing user with Firebase UID if needed
      if (!existingUser.firebaseUid) {
        await storage.updateUser(existingUser.id, {
          provider: 'firebase',
          providerId: uid,
          firebaseUid: uid,
          profileImage: picture || existingUser.profileImage
        });
      }
      
      // Update the last login time
      await storage.updateUserLastLogin(existingUser.id);
      
      return existingUser;
    } else {
      // Create new user
      const username = name || (email ? email.split('@')[0] : `user_${uid.substring(0, 8)}`);
      
      const newUser = await storage.createUser({
        username: username,
        email: email || '',
        password: '', // Empty password for social auth
        provider: 'firebase',
        providerId: uid,
        firebaseUid: uid,
        profileImage: picture || null,
        verified: true, // Social auth users are considered verified
        accountStatus: 'active'
      });
      
      return newUser;
    }
  } catch (error) {
    console.error('Error handling social auth:', error);
    throw error;
  }
};