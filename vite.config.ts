import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // In produzione /api è servito da Nginx davanti al backend Express
    // (server/index.ts). In dev, se il backend gira anche lui (`npm run
    // server`), questo proxy lo rende raggiungibile senza CORS.
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
})
