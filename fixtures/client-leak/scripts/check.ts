// Proves the server only guards from spec 0001 fail loudly:
// 1. A client component importing `@ventstd/shamcash` builds, but its client
//    bundle holds the throwing browser stub and none of the real entry.
// 2. A named import of `@ventstd/shamcash` in a client component fails
//    `next build` on Turbopack, because the stub has no exports.
// 3. A client component importing `@ventstd/shamcash-next` fails `next build`.
import { spawnSync } from 'node:child_process'
import { copyFile, glob, mkdir, readFile, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const STUB_TEXT = '@ventstd/shamcash is server only.'
const CORE_ENTRY_TEXT = 'was called in a browser'

function nextBuild(): { status: number | null; output: string } {
  const result = spawnSync('pnpm', ['exec', 'next', 'build'], { cwd: root, encoding: 'utf8' })
  return { status: result.status, output: `${result.stdout}${result.stderr}` }
}

function fail(message: string, output?: string): never {
  if (output) console.error(output)
  console.error(`✗ ${message}`)
  process.exit(1)
}

// Check 1: core imported from a client component.
const coreBuild = nextBuild()
if (coreBuild.status !== 0) fail('next build failed for the core leak page', coreBuild.output)

let stubChunks = 0
for await (const file of glob('.next/static/**/*.js', { cwd: root })) {
  const source = await readFile(`${root}/${file}`, 'utf8')
  if (source.includes(CORE_ENTRY_TEXT)) fail(`client chunk ${file} contains the real core entry`)
  if (source.includes(STUB_TEXT)) stubChunks++
}
if (stubChunks === 0) fail('no client chunk contains the browser stub error')
console.log(
  `✓ core in a client component: ${stubChunks} client chunk(s) hold the stub, none hold the real entry`,
)

// Copies a misuse template into `app/` as a page, expects `next build` to
// fail with `reason` in its output, then removes the page again.
async function expectBuildFails(template: string, reason: string, label: string): Promise<void> {
  const pageDir = `${root}/app/${template}`
  await mkdir(pageDir, { recursive: true })
  await copyFile(`${root}/templates/${template}.tsx`, `${pageDir}/page.tsx`)
  try {
    const build = nextBuild()
    if (build.status === 0) fail(`next build passed with ${label}`)
    if (!build.output.includes(reason))
      fail(`next build failed, but not with "${reason}"`, build.output)
    console.log(`✓ ${label}: next build fails`)
  } finally {
    await rm(pageDir, { recursive: true, force: true })
  }
}

// Check 2: named core import from a client component.
await expectBuildFails(
  'core-named-leak',
  'dist/browser.js',
  'a named core import in a client component',
)

// Check 3: next helpers imported from a client component.
await expectBuildFails('next-leak', 'server-only', '@ventstd/shamcash-next in a client component')
