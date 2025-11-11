/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'ionic-vendor': ['@ionic/react', '@ionic/react-router'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'capacitor-vendor': [
            '@capacitor/core',
            '@capacitor/app',
            '@capacitor/filesystem',
            '@capacitor/haptics',
            '@capacitor/keyboard',
            '@capacitor/preferences',
            '@capacitor/share',
            '@capacitor/status-bar',
            '@capacitor/toast',
            '@capacitor-community/sqlite'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 850
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
