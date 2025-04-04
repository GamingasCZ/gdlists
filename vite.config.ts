import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(mode => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
    ],
    base: '/gdlists',
    build: {
      target: 'esnext'
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      extensions: ['.ts', '.json']
    },
    server: {
      watch: {usePolling: false},
      proxy: {
        '/gdlists/api': {
          target: env.VITE_ENDPOINT,
          changeOrigin: true,
          prependPath: true,
          cookieDomainRewrite: {
            "*": "http://localhost:8000"
          }
        }
      }
    },
  }

})
