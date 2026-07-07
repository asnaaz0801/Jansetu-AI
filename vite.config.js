import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    // This increases the warning limit from 500kB to 1600kB
    chunkSizeWarningLimit: 1600
  }
})
