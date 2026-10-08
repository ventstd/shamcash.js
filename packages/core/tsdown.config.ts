import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/browser.ts'],
  format: 'esm',
  platform: 'neutral',
  target: 'es2023',
  dts: true,
  clean: true,
})
