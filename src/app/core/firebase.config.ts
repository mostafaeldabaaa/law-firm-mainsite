// src/app/core/firebase.config.ts
//
// تهيئة Firebase على مستوى الفرونت إند (Client SDK).
// ده منفصل تمامًا عن الـ Admin SDK بتاع الباك إند (Node.js) — هنا بنستخدم
// بس Firestore عشان نستقبل تحديثات الرسائل لحظيًا (real-time) في صفحة
// الاستشارة، من غير ما نحتاج polling أو refresh يدوي.
//
// ملحوظة أمان: القيم دي (apiKey, projectId...) مش سرية — مصممة أصلاً
// إنها تتحط في كود يشتغل جوه متصفح المستخدم. الحماية الفعلية بتتم عن
// طريق Firestore Security Rules (هنضيفها لاحقًا) مش عن طريق إخفاء الـ config.

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDtNPCqwsdG00AqXYQU9CLdiDmPZLm-fAU',
  authDomain: 'law-firm-system-22818.firebaseapp.com',
  projectId: 'law-firm-system-22818',
  storageBucket: 'law-firm-system-22818.firebasestorage.app',
  messagingSenderId: '235414434440',
  appId: '1:235414434440:web:ff84374d1fe8421568653d',
  measurementId: 'G-WWJP89X3SD',
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const firestoreDb: Firestore = getFirestore(firebaseApp);