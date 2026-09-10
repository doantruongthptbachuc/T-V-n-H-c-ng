'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
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

// App là một ứng dụng client lớn, có Firebase, localStorage, IndexedDB và
// các API chỉ tồn tại trong trình duyệt. Không SSR component này để tránh
// hydration/runtime crash làm trang trắng trên Vercel.
const ClientApp = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
        <p className="text-sm font-semibold">Đang tải Cổng Tư vấn học đường…</p>
      </div>
    </main>
  ),
});

export default function Home() {
  useEffect(() => {
    // Các cơ chế chỉ dành cho browser phải khởi chạy sau khi component mount.
    void import('../src/utils/securityFirewall')
      .then(({ initSecurityFirewall }) => initSecurityFirewall())
      .catch(() => {});

    void import('../src/registerSW')
      .then(({ registerServiceWorker }) => registerServiceWorker())
      .catch(() => {});
  }, []);

  return <ClientApp />;
}
