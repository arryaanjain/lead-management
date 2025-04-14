import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '^/login': {
        target: 'http://127.0.0.1:5020',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`, // /login -> /api/login
      },
      '^/leads': {
        target: 'http://127.0.0.1:5020',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`, // /users -> /api/leads
      },
      '^/refresh': {
        target: 'http://127.0.0.1:5020',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`, // /refresh -> /api/refresh
      },
    },
  },
})
