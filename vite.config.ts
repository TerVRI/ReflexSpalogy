import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ReflexSpalogy/',
  resolve: {
    dedupe: ['react', 'react-dom', '@react-three/fiber', '@react-three/drei'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
