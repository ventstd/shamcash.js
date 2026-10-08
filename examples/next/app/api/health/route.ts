// The bill route handlers land with slice 1; this import proves the server packages resolve.
import '@ventstd/shamcash-next'
import { ShamCash } from '@ventstd/shamcash'

export function GET(): Response {
  return Response.json({ ok: true, client: typeof ShamCash })
}
