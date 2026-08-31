/**
 * Bộ Nhớ IndexedDB Đa Tầng Bền Vững - THPT Ba Chúc
 * Cung cấp dung lượng bộ nhớ lớn (>500MB), chống tràn bộ nhớ localStorage
 * Tự động đồng bộ và bảo vệ danh sách đoàn viên & vinh danh học sinh
 */

const DB_NAME = 'THPTBaChuc_SystemDB';
const DB_VERSION = 1;
const STORE_NAME = 'system_cache';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB không được hỗ trợ trong môi trường này'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Không thể ghi khóa "${key}":`, err);
  }
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve((request.result as T) ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Không thể đọc khóa "${key}":`, err);
    return null;
  }
}

export async function idbRemove(key: string): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Không thể xóa khóa "${key}":`, err);
  }
}

export async function idbGetStats(): Promise<{
  isSupported: boolean;
  itemCount: number;
  estimatedSizeKb: number;
  keys: string[];
}> {
  try {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return { isSupported: false, itemCount: 0, estimatedSizeKb: 0, keys: [] };
    }

    const db = await getDb();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getAllKeysRequest = store.getAllKeys();

      getAllKeysRequest.onsuccess = () => {
        const keys = (getAllKeysRequest.result as string[]) || [];
        // Calculate estimated size from localStorage + indexedDB
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
          keys,
        });
      };

      getAllKeysRequest.onerror = () => {
        resolve({ isSupported: true, itemCount: 0, estimatedSizeKb: 0, keys: [] });
      };
    });
  } catch {
    return { isSupported: false, itemCount: 0, estimatedSizeKb: 0, keys: [] };
  }
}
