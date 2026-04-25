import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "total-grind",
      project: "javascript-react"
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  }
})