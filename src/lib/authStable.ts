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

    // Do not immediately eject an active admin because of a transient
    // Firebase Auth state change/network reconnect. A real logout clears
    // the local session first, so this guard will not block it.
    if (isLocalAdminSessionActive()) {
      pendingLogoutTimer = setTimeout(() => {
        if (isLocalAdminSessionActive()) {
          callback(null, true);
        } else {
          callback(null, false);
        }
        pendingLogoutTimer = null;
      }, 3000);
      return;
    }

    callback(null, false);
  });
}
