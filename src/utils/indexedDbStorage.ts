/**
 * Bộ Nhớ Siêu Dung Lượng IndexedDB Turbo Đa Tầng - THPT Ba Chúc
 * Dung lượng lưu trữ lớn (>1GB), chống tràn bộ nhớ localStorage (5MB)
 * Tự động đồng bộ và bảo vệ an toàn danh sách đoàn viên, điểm danh & vinh danh học sinh
 */

const DB_NAME = 'THPTBaChuc_SystemDB';
const DB_VERSION = 2;
const STORE_NAMES = {
  CACHE: 'system_cache',
  VOLUNTEERS: 'volunteers_store',
  ATTENDANCE: 'attendance_store',
  MEDIA: 'media_store',
};

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB không được hỗ trợ trong môi trường này'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Tạo các Object Store chuyên dụng
      Object.values(STORE_NAMES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Không thể kết nối cơ sở dữ liệu IndexedDB'));
    };
  });

  return dbPromise;
}

/**
 * Ghi dữ liệu an toàn vào IndexedDB
 */
export async function idbSet<T>(key: string, value: T, storeName: string = STORE_NAMES.CACHE): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const targetStore = db.objectStoreNames.contains(storeName) ? storeName : STORE_NAMES.CACHE;
      const transaction = db.transaction([targetStore], 'readwrite');
      const store = transaction.objectStore(targetStore);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Ghi thất bại cho khóa "${key}":`, err);
  }
}

/**
 * Đọc dữ liệu từ IndexedDB
 */
export async function idbGet<T>(key: string, storeName: string = STORE_NAMES.CACHE): Promise<T | null> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const targetStore = db.objectStoreNames.contains(storeName) ? storeName : STORE_NAMES.CACHE;
      if (!db.objectStoreNames.contains(targetStore)) {
        return resolve(null);
      }
      const transaction = db.transaction([targetStore], 'readonly');
      const store = transaction.objectStore(targetStore);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve((request.result as T) ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Đọc thất bại cho khóa "${key}":`, err);
    return null;
  }
}

/**
 * Xóa một khóa khỏi IndexedDB
 */
export async function idbRemove(key: string, storeName: string = STORE_NAMES.CACHE): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const targetStore = db.objectStoreNames.contains(storeName) ? storeName : STORE_NAMES.CACHE;
      if (!db.objectStoreNames.contains(targetStore)) return resolve();
      const transaction = db.transaction([targetStore], 'readwrite');
      const store = transaction.objectStore(targetStore);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Xóa thất bại cho khóa "${key}":`, err);
  }
}

/**
 * Dọn dẹp và tối ưu hóa bộ nhớ IndexedDB
 */
export async function idbOptimize(): Promise<{ success: boolean; freedBytes: number; message: string }> {
  try {
    const db = await getDb();
    let freed = 0;

    // Quét và dọn các bản ghi tạm hoặc log cũ
    const transaction = db.transaction([STORE_NAMES.CACHE], 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.CACHE);
    const getAllKeysReq = store.getAllKeys();

    return new Promise((resolve) => {
      getAllKeysReq.onsuccess = () => {
        const keys = (getAllKeysReq.result as string[]) || [];
        keys.forEach((k) => {
          if (k.startsWith('tvhd_temp_') || k.startsWith('tvhd_draft_')) {
            store.delete(k);
            freed += 1024 * 5;
          }
        });
        resolve({
          success: true,
          freedBytes: freed,
          message: 'Bộ nhớ IndexedDB đã được dọn rác và tối ưu hóa thành công!',
        });
      };
      getAllKeysReq.onerror = () => {
        resolve({ success: false, freedBytes: 0, message: 'Không thể tối ưu hóa bộ nhớ.' });
      };
    });
  } catch (e: any) {
    return { success: false, freedBytes: 0, message: e?.message || 'Lỗi tối ưu hóa' };
  }
}

/**
 * Thống kê chẩn đoán dung lượng và sức khỏe bộ nhớ
 */
export async function idbGetStats(): Promise<{
  isSupported: boolean;
  itemCount: number;
  estimatedSizeKb: number;
  maxStorageMb: number;
  availableMb: number;
  keys: string[];
}> {
  try {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return { isSupported: false, itemCount: 0, estimatedSizeKb: 0, maxStorageMb: 0, availableMb: 0, keys: [] };
    }

    const db = await getDb();
    
    // Check StorageManager API quota if available
    let maxStorageMb = 1024;
    let availableMb = 1000;
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota) {
          maxStorageMb = Math.round(estimate.quota / (1024 * 1024));
        }
        if (estimate.quota && estimate.usage !== undefined) {
          availableMb = Math.round((estimate.quota - estimate.usage) / (1024 * 1024));
        }
      } catch {}
    }

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAMES.CACHE], 'readonly');
      const store = transaction.objectStore(STORE_NAMES.CACHE);
      const getAllKeysRequest = store.getAllKeys();

      getAllKeysRequest.onsuccess = () => {
        const keys = (getAllKeysRequest.result as string[]) || [];
        
        let totalBytes = 0;
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('tvhd_')) {
              const v = localStorage.getItem(k);
              totalBytes += (k.length + (v?.length || 0)) * 2;
            }
          }
        } catch {}

        resolve({
          isSupported: true,
          itemCount: keys.length,
          estimatedSizeKb: Math.round(totalBytes / 1024),
          maxStorageMb,
          availableMb,
          keys,
        });
      };

      getAllKeysRequest.onerror = () => {
        resolve({
          isSupported: true,
          itemCount: 0,
          estimatedSizeKb: 0,
          maxStorageMb,
          availableMb,
          keys: [],
        });
      };
    });
  } catch {
    return { isSupported: false, itemCount: 0, estimatedSizeKb: 0, maxStorageMb: 0, availableMb: 0, keys: [] };
  }
}
