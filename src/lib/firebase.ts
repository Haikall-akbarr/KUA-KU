import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import 'dotenv/config';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Function to check if all required config values are present
function isFirebaseConfigValid(config: FirebaseOptions): boolean {
  return !!(config.apiKey && 
          config.authDomain && 
          config.projectId && 
          config.storageBucket && 
          config.messagingSenderId && 
          config.appId);
}

// Initialize Firebase
const app = !getApps().length && isFirebaseConfigValid(firebaseConfig)
  ? initializeApp(firebaseConfig)
  : (getApps().length > 0 ? getApp() : null);


// Initialize Auth only if the app was successfully initialized
const auth = app ? getAuth(app) : null;

// Export app and auth. The consuming code should handle the null case for auth.
export { app, auth };
