import { afterEach, describe, expect, it } from 'vitest'
import { ShamCash } from '@ventstd/shamcash'

const scope = globalThis as { window?: unknown; document?: unknown }

describe('server only guards', () => {
  afterEach(() => {
    delete scope.window
    delete scope.document
  })

  it('throws at module load when the browser stub is imported', async () => {
    await expect(import('../../dist/browser.js')).rejects.toThrow(
      '@ventstd/shamcash is server only.',
    )
  })

  it('refuses to construct the client where a browser page is present', () => {
    scope.window = {}
    scope.document = {}
    expect(() => new ShamCash({ secretKey: 'sk_test_guard' })).toThrow('was called in a browser')
  })
})
