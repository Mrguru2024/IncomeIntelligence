import admin from 'firebase-admin';

let isInitialized = false;

export function initializeFirebaseAdmin() {
  try {
    // Check if Firebase credentials are available
    console.log("Initializing Firebase Admin...");
    
    const requiredEnvVars = {
      'FIREBASE_PROJECT_ID': process.env.FIREBASE_PROJECT_ID,
      'FIREBASE_CLIENT_EMAIL': process.env.FIREBASE_CLIENT_EMAIL,
      'FIREBASE_PRIVATE_KEY': process.env.FIREBASE_PRIVATE_KEY
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
    }

    // Only initialize once
    if (isInitialized || admin.apps.length > 0) {
      console.log('Firebase Admin is already initialized');
      return true;
    }

  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });
    
    console.log('Firebase Admin SDK initialized successfully');
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    console.error('Error details:', JSON.stringify(error));
    return false;
  }
}

export function getFirebaseAdmin() {
  if (!isInitialized && admin.apps.length === 0) {
    initializeFirebaseAdmin();
  }
  return admin;
}