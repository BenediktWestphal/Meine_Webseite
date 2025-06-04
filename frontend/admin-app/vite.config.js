import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Your backend server address
        changeOrigin: true,
        // secure: false, // Uncomment if your backend is not using HTTPS
        // rewrite: (path) => path.replace(/^\/api/, '') // if your backend doesn't expect /api prefix
      }
    }
  }
})
