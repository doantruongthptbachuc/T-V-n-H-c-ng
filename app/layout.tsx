import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'TƯ VẤN HỌC ĐƯỜNG THPT',
  description: 'Lắng nghe – Thấu hiểu – Đồng hành – Phát triển',
  icons: { icon: '/favicon.png', apple: '/apple-touch-icon.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
