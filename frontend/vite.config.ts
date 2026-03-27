import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@cinescope/shared': path.resolve(__dirname, '../packages/shared/types.ts'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
