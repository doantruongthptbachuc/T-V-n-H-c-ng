import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerSW';
import { initSecurityFirewall } from './utils/securityFirewall';

// Kích hoạt Bức Tường Lửa bảo vệ mã nguồn & chống hacker
initSecurityFirewall();

// Kích hoạt cơ chế tự động cập nhật ngay khi Publish phiên bản mới cho mọi thiết bị đã cài PWA
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
