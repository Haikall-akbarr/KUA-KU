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

function isFirebaseConfigValid(config: FirebaseOptions): boolean {
  return !!(config.apiKey && 
          config.authDomain && 
          config.projectId && 
          config.storageBucket && 
          config.messagingSenderId && 
          config.appId);
}

const app = isFirebaseConfigValid(firebaseConfig) 
  ? !getApps().length ? initializeApp(firebaseConfig) : getApp() 
  : null;

const auth = app ? getAuth(app) : null;

export { app, auth };
