import {
  initializeApp,
  getApps,
  getApp,
} from 'firebase/app';

import {
  getFirestore,
} from 'firebase/firestore';

import {
  getStorage,
} from 'firebase/storage';

import {
  getAuth,
} from 'firebase/auth';

import firebaseConfig from '../../firebase-applet-config.json';

// ==========================================
// FIREBASE APP
// ==========================================

export const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

// ==========================================
// FIRESTORE
// ==========================================

export const db =
  firebaseConfig.firestoreDatabaseId
    ? getFirestore(
        app,
        firebaseConfig.firestoreDatabaseId
      )
    : getFirestore(app);

// ==========================================
// FIREBASE STORAGE
// ==========================================

export const storage = getStorage(app);

// ==========================================
// FIREBASE AUTHENTICATION
// ==========================================

export const auth = getAuth(app);

export default app;
