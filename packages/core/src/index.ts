/** Options for {@link ShamCash}. The full shape lands with the API contract (feature 3). */
export interface ShamCashConfig {
  /** Your ShamCash secret key. Read it from an environment variable, never hardcode it. */
  secretKey: string
}

/** Server client for the ShamCash API. Construct it only in server code. */
export class ShamCash {
  readonly #secretKey: string

  constructor(config: ShamCashConfig) {
    // Guard layer 3: refuse to run where a browser page is present, even if a
    // bundler skipped the `browser` export condition stub.
    const scope = globalThis as { window?: unknown; document?: unknown }
    if (typeof scope.window !== 'undefined' && typeof scope.document !== 'undefined') {
      throw new Error(
        'new ShamCash() was called in a browser. The secret key must stay on your server: create the client in route handlers or server code only.',
      )
    }
    this.#secretKey = config.secretKey
  }
}
