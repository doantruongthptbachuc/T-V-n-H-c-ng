import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tư vấn học đường – THPT Ba Chúc',
  description: 'Cổng Tư vấn học đường Trường THPT Ba Chúc',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
