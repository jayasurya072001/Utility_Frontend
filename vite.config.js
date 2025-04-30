import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5023, // ✅ Change this line
    host: '0.0.0.0', // ✅ Optional, allows external access via IP
  },
})
