'use client'

// Deliberate misuse: a named import of the server core in a client component.
// `scripts/check.ts` copies this into `app/` and expects Turbopack to fail the
// build, since the browser stub has no exports.
import { ShamCash } from '@ventstd/shamcash'

export default function CoreNamedLeak() {
  return <p>{typeof ShamCash}</p>
}
