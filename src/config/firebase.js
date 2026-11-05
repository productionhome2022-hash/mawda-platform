// استيراد مكتبات فايربيس الأساسية
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// إعدادات الربط المشفرة (قم باستبدالها بمعرفات مشروعك الحقيقي في فايربيس لاحقاً)
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "mawda-app.firebaseapp.com",
  projectId: "mawda-app",
  storageBucket: "mawda-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// تهيئة المشروع بأمان تظليلي
const app = initializeApp(firebaseConfig);

// تصدير الأدوات لكي تستخدم في باقي ملفات المنصة
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
