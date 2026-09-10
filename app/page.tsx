'use client';

import React from 'react';
import '../src/index.css';

/*
 * Compatibility guard:
 * phiên bản cũ tạo một bản sao lưu toàn bộ hệ thống vào localStorage.
 * Dữ liệu thật đã được đồng bộ qua Firestore/IndexedDB, vì vậy không lưu
 * bản backup lớn vào localStorage nữa. Guard này cũng tự dọn khóa cũ
 * trên các thiết bị đã từng chạy phiên bản GitHub Pages.
 */
if (typeof window !== 'undefined') {
  try {
    const legacyKey = 'tvhd_system_backup_auto';
    window.localStorage.removeItem(legacyKey);
    const StorageProto = Storage.prototype as Storage & {
      __tvhdBackupGuard?: boolean;
    };
    if (!StorageProto.__tvhdBackupGuard) {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key: string, value: string) {
        if (key === legacyKey) return;
        return originalSetItem.call(this, key, value);
      };
      StorageProto.__tvhdBackupGuard = true;
    }
  } catch {}
}

import App from '../src/App';

export default function Home() {
  return <App />;
}
