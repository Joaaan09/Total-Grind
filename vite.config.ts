import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    build: {
      sourcemap: true, // Required for Sentry to map errors to source code
    },
    plugins: [
      react(),
      sentryVitePlugin({
        org: "total-grind",
        project: "javascript-react",
        authToken: env.SENTRY_AUTH_TOKEN,
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
  };
});