'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Arial, sans-serif' }}>Đang tải trang Tư vấn học đường…</main>,
});

export default function Page() {
  return <App />;
}
