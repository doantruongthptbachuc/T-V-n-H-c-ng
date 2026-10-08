import { authPersistenceReady } from './firebase';
import {
  loginAdmin as rawLoginAdmin,
  logoutAdmin,
  subscribeToAuth as rawSubscribeToAuth,
  isLocalAdminSessionActive,
} from './authService';

export { logoutAdmin };

export async function loginAdmin(
  emailOrUsername: string,
  password: string
) {
  // Wait for browser-local Firebase persistence before signing in.
  // This prevents a transient signed-out event in some browsers/webviews.
  try {
    await authPersistenceReady;
  } catch {}

  return rawLoginAdmin(emailOrUsername, password);
}

export function subscribeToAuth(
  callback: (user: any, isAdmin: boolean) => void
): () => void {
  // Keep the admin UI stable during short-lived Firebase reconnects.
  // This timer is only used when the local admin session is still present.
  let pendingLogoutTimer: ReturnType<typeof setTimeout> | null = null;

  return rawSubscribeToAuth((user, isAdmin) => {
    if (pendingLogoutTimer) {
      clearTimeout(pendingLogoutTimer);
      pendingLogoutTimer = null;
    }

    if (user || isAdmin) {
      callback(user, isAdmin);
      return;
    }

    // Do not eject an active admin because of a transient Firebase Auth
    // state change, browser sleep/wake, network reconnect, or a brief
    // Firestore/Auth initialization race. A real logout clears the local
    // session first, so this guard will not block an intentional logout.
    if (isLocalAdminSessionActive()) {
      pendingLogoutTimer = setTimeout(() => {
        if (isLocalAdminSessionActive()) {
          callback(null, true);
        } else {
          callback(null, false);
        }
        pendingLogoutTimer = null;
      }, 15000);
      return;
    }

    callback(null, false);
  });
}
