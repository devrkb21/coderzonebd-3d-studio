import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site from /<repo>/. For a custom domain such as
// 3d.coderzonebd.com, build with BASE_PATH=/ .
const base = process.env.BASE_PATH ?? '/coderzonebd-3d-studio/'

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('preload-helper')) return 'vendor'
          if (/node_modules\/(react|react-dom|scheduler|zustand|use-sync-external-store)\//.test(id)) return 'vendor'
          if (id.includes('node_modules/three/')) return 'three'
          if (id.includes('@react-three') || id.includes('camera-controls')) return 'r3f'
        },
      },
    },
  },
})
