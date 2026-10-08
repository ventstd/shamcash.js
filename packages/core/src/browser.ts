// Guard layer 2: bundlers that resolve the `browser` export condition land here
// instead of the real entry, so the secret key code never reaches a browser bundle.
throw new Error(
  '@ventstd/shamcash is server only. Import it in route handlers or server code, never in client components.',
)

export {}
