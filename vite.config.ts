/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the root of the custom domain (lotus-corniculatus.ca), so the
// base is '/'. Override via BASE_PATH if publishing under a subpath instead.
const base = process.env.BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Pure logic lives in src/game — no DOM needed there, but jsdom is harmless.
    css: false,
  },
})
