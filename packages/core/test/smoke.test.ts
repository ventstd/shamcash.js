import { describe, expect, it } from 'vitest'
import { ShamCash } from '@ventstd/shamcash'

describe('@ventstd/shamcash entry', () => {
  it('resolves to the real server entry, not the browser stub', () => {
    expect(new ShamCash({ secretKey: 'sk_test_smoke' })).toBeInstanceOf(ShamCash)
  })
})
