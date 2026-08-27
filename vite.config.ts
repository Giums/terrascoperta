import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // MapLibre carica il worker con `new Worker(url, { type: "module" })`:
  // serve che anche il bundle del worker sia ESM (vedi MapContainer.tsx).
  worker: { format: "es" },
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
