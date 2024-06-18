// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBAWSE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBAWSE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBAWSE_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBAWSE_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBAWSE_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBAWSE_APPID,
  measurementId: process.env.NEXT_PUBLIC_FIREBAWSE_MESSAGINGSENDERID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const database = getDatabase(app);