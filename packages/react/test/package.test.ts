// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('@ventstd/shamcash-react build', () => {
  it("marks the built entry 'use client'", async () => {
    const entry = await readFile(new URL('../dist/index.js', import.meta.url), 'utf8')
    expect(entry.trimStart().startsWith("'use client';")).toBe(true)
  })

  it('has no value import from @ventstd/shamcash', async () => {
    const entry = await readFile(new URL('../dist/index.js', import.meta.url), 'utf8')
    expect(entry).not.toContain('@ventstd/shamcash')
  })
})
