import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App;

export const initializeFirebaseAdmin = () => {
  if (!firebaseApp) {
    // Option 1: Using service account JSON file
    // const serviceAccount = require('path/to/serviceAccountKey.json');

    // Option 2: Using environment variables (recommended for production)
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error);
      throw error;
    }
  }

  return firebaseApp;
};

// Get Firebase Admin instance
export const getFirebaseAdmin = (): admin.app.App => {
  if (!firebaseApp) {
    return initializeFirebaseAdmin();
  }
  return firebaseApp;
};

// Get Firebase Auth instance
export const getFirebaseAuth = (): admin.auth.Auth => {
  const app = getFirebaseAdmin();
  return admin.auth(app);
};

export { admin };
