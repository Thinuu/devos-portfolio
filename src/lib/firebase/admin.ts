import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export function getFirebaseAdmin() {
  const existing = getApps()[0];
  const app = existing ?? initializeApp({
    credential: process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
      ? cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
      : undefined,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return { app, db: getFirestore(app), storage: getStorage(app) };
}
