import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('@ventstd/shamcash-next build', () => {
  it("keeps the 'server-only' import in the built entry", async () => {
    const entry = await readFile(new URL('../dist/index.js', import.meta.url), 'utf8')
    expect(entry).toMatch(/import\s*["']server-only["']/)
  })
})
