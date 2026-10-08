import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'browser',
  target: 'es2023',
  dts: true,
  clean: true,
  // The whole package is client side, so the directive goes on the built entry.
  banner: { js: "'use client';" },
})
