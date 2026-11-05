// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4L3XeavP-WSgnv-PF",
  authDomain: "mawda-app-2026.firebaseapp.com",
  projectId: "mawda-app-2026",
  storageBucket: "mawda-app-2026.appspot.com",
  messagingSenderId: "697303475139",
  appId: "1:697303475139:web:886966",
  measurementId: "G-G9PJ9DFEBJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
