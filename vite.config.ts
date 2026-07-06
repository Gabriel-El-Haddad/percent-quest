/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project sites are served from /<repo>/, so the build must be
// aware of that base path. Dev/preview default to '/'. Override via BASE_PATH.
const base = process.env.BASE_PATH ?? '/percent-quest/'

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
