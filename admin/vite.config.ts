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
      '^/api': {
        target: 'http://127.0.0.1:5020',
        changeOrigin: true,
        secure: false, // If you're using http and not https
      },
    }
    
  },
})
