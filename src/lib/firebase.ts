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
  setPersistence,
  browserLocalPersistence,
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

// Luôn dùng local persistence cho tài khoản quản trị.
// Điều này giúp phiên Firebase không bị mất khi F5, chuyển tab,
// đóng/mở trình duyệt hoặc Vercel tạo một deployment mới.
export const authPersistenceReady = setPersistence(
  auth,
  browserLocalPersistence
).catch((error) => {
  console.warn('[Firebase Auth] Không thể bật browserLocalPersistence:', error);
  return undefined;
});

export default app;
