'use client'

// Deliberate misuse: a client component importing the Next.js server helpers.
// `scripts/check.ts` copies this into `app/` and expects `next build` to fail.
import '@ventstd/shamcash-next'

export default function NextLeak() {
  return null
}
