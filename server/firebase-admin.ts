import admin from 'firebase-admin';

let isInitialized = false;

export function initializeFirebaseAdmin() {
  // Check if Firebase credentials are available
  console.log("Initializing Firebase Admin...");
  console.log("Firebase Project ID:", process.env.FIREBASE_PROJECT_ID ? "Available" : "Missing");
  console.log("Firebase Client Email:", process.env.FIREBASE_CLIENT_EMAIL ? "Available" : "Missing");
  console.log("Firebase Private Key:", process.env.FIREBASE_PRIVATE_KEY ? "Available (first chars: " + 
    (process.env.FIREBASE_PRIVATE_KEY?.substring(0, 20) || "N/A") + "...)" : "Missing");

  if (!process.env.FIREBASE_PROJECT_ID || 
      !process.env.FIREBASE_CLIENT_EMAIL || 
      !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn('Firebase credentials are missing. Social authentication will be disabled.');
    return false;
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