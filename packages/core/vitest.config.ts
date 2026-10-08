import { cloudflareTest } from '@cloudflare/vitest-pool-workers'
import { defineConfig } from 'vitest/config'

// The same smoke test runs on Node and on workerd (the Cloudflare Workers
// runtime), proving the `exports` map picks the real entry on both.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          include: ['test/**/*.test.ts'],
        },
      },
      {
        plugins: [
          cloudflareTest({
            miniflare: { compatibilityDate: '2026-08-22' },
          }),
        ],
        test: {
          name: 'workerd',
          include: ['test/*.test.ts'],
        },
      },
    ],
  },
})
