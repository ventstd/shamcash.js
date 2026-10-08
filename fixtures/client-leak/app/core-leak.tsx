'use client'

// Deliberate misuse: a client component importing the server core. The client
// bundle must get the throwing browser stub, never the real entry. A namespace
// import, because Turbopack already fails the build on a named one
// (see `templates/core-named-leak.tsx`).
import * as core from '@ventstd/shamcash'

export function CoreLeak() {
  return <p>{Object.keys(core).length}</p>
}
