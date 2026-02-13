import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/(?!@vite|@react-refresh|@fs|@id|src|node_modules|assets|favicon\\.ico)(.+)': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
