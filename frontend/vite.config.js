import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SECURITY_HEADERS = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.unsplash.com http://127.0.0.1:8000 http://localhost:8000 https://*.googleusercontent.com https://*.githubusercontent.com",
    "connect-src 'self' http://127.0.0.1:8000 http://localhost:8000 https://fonts.googleapis.com https://*.unsplash.com https://accounts.google.com",
    "frame-src https://accounts.google.com https://login.microsoftonline.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
  ].join('; '),
};

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-vendor';
          }
        },
      },
    },
  },
  preview: { headers: SECURITY_HEADERS },
})
