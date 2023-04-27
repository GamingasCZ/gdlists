import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import copy from 'rollup-plugin-copy';

// https://vitejs.dev/config/
export default defineConfig(mode => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
      copy({
        targets: [
          { src: 'api/', dest: 'dist/' },
        ],
        verbose: true,
      }),
    ],
    base: '/gdlists',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_ENDPOINT,
          changeOrigin: true,
          prependPath: true
        }
      }
    },
  }

})
