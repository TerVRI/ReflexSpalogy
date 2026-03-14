import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ReflexSpalogy/',
  resolve: {
    // Ensure a single React instance is used across R3F, Drei, and app code.
    dedupe: ['react', 'react-dom', '@react-three/fiber', '@react-three/drei'],
  },
})
