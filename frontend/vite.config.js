import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ["trinity-reformed-sagging.ngrok-free.dev"],
    proxy: {
      // Forwards /api/* and /generate-plan to FastAPI on port 8000.
      // changeOrigin rewrites the Host header so cookies set by FastAPI
      // are accepted by the browser during local development.
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
      },
      '/generate-plan': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
})

