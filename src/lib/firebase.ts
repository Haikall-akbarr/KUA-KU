import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCo0XRQ345GIU2xe9PhWUv8HpB3jF15jhM",
  authDomain: "kuaku-uvgqp.firebaseapp.com",
  databaseURL: "https://kuaku-uvgqp-default-rtdb.firebaseio.com",
  projectId: "kuaku-uvgqp",
  storageBucket: "kuaku-uvgqp.appspot.com",
  messagingSenderId: "1049582033703",
  appId: "1:1049582033703:web:b39f1d44035366e826e702"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
