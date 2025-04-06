import admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Initialize Firebase Admin with credentials
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || "stackr-19160",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Only initialize if it hasn't been initialized already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`
  });
}

// Middleware to verify Firebase token
export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

// Function to create or update user from Firebase auth
export const handleSocialAuth = async (idToken: string) => {
  try {
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    const { uid, email, name, picture } = decodedToken;
    
    // Check if user exists
    const existingUser = email ? await storage.getUserByEmail(email) : null;
    
    if (existingUser) {
      // Update existing user with Firebase UID if needed
      if (!existingUser.firebaseUid) {
        await storage.updateUser(existingUser.id, { 
          firebaseUid: uid,
          lastLogin: new Date()
        });
      } else {
        // Just update last login time
        await storage.updateUserLastLogin(existingUser.id);
      }
      
      return existingUser;
    } else {
      // Create new user
      const newUser = await storage.createUser({
        username: name || email?.split('@')[0] || `user_${uid.substring(0, 8)}`,
        email: email || '',
        firebaseUid: uid,
        password: '', // We don't need a password for social auth
        isVerified: true, // Social auth users are considered verified
        profileImage: picture || '',
        lastLogin: new Date(),
        dateCreated: new Date()
      });
      
      return newUser;
    }
  } catch (error) {
    console.error('Error handling social auth:', error);
    throw error;
  }
};