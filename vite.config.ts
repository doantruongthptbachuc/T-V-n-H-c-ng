import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: process.env.VERCEL ? '/' : '/T-V-n-H-c-ng/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // Bảo vệ và ẩn hoàn toàn mã nguồn (Vô hiệu hóa Source Maps)
    build: {
      sourcemap: false,
      minify: 'esbuild' as const,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          compact: true,
        },
      },
    },
    esbuild: {
      drop: ['debugger' as const],
      legalComments: 'none' as const,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
