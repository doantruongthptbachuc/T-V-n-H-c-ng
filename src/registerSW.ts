/**
 * PWA Service Worker Auto-Updater for THPT Ba Chúc
 * Guarantees that when a new version is published, all installed apps and open tabs update seamlessly.
 */

let globalRegistration: ServiceWorkerRegistration | null = null;
const updateListeners = new Set<() => void>();

export function registerServiceWorker(onUpdateFound?: () => void): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  if (onUpdateFound) {
    updateListeners.add(onUpdateFound);
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        globalRegistration = registration;

        // 1. Initial gentle check on boot
        registration.update().catch(() => {});

        // 2. Polite update check on visibility change (re-entering tab)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        });

        // 3. Handle incoming updates gently without disruptive auto-reloads
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update is available - notify listeners gently
                console.log('Có phiên bản ứng dụng mới.');
                updateListeners.forEach(listener => {
                  try { listener(); } catch {}
                });
              }
            }
          });
        });
      })
      .catch((err) => {
        console.warn('Lỗi đăng ký Service Worker PWA:', err);
      });
  });
}

/**
 * Manually checks if a new Service Worker / PWA update exists
 */
export async function checkForServiceWorkerUpdate(): Promise<boolean> {
  try {
    if (globalRegistration) {
      await globalRegistration.update();
      return !!globalRegistration.waiting || !!globalRegistration.installing;
    } else if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        globalRegistration = reg;
        await reg.update();
        return !!reg.waiting || !!reg.installing;
      }
    }
  } catch (err) {
    console.warn('Check SW update warning:', err);
  }
  return false;
}

/**
 * Force clear old cache, activate latest service worker, and reload app
 */
export function forceAppUpdateAndReload(): void {
  try {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_AND_UPDATE' });
    }
  } catch {}

  setTimeout(() => {
    window.location.reload();
  }, 300);
}
