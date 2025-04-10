import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:5000',  // Forward requests to '/api' to backend
    },
  },
  plugins: [react(),
    tailwindcss(),
  ],
  define: {
    'process.env': process.env,
  },
})
