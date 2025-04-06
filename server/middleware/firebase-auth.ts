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
  try {
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
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