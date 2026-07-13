import { spawn } from 'node:child_process'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function run(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(npm, args, { stdio: 'inherit', ...options })
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`npm ${args.join(' ')} failed with ${code}`)))
    child.on('error', reject)
  })
}

async function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Preview did not start within ${timeoutMs}ms`)
}

async function main() {
  await run(['run', 'lint'])
  const deterministicEnv = { ...process.env, VITE_MAPBOX_TOKEN: '' }
  await run(['run', 'build'], { env: deterministicEnv })

  const preview = spawn(npm, ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], { stdio: 'inherit', env: deterministicEnv })
  try {
    await waitForServer('http://127.0.0.1:4173')
    const env = { ...process.env, QA_BASE_URL: 'http://127.0.0.1:4173' }
    await run(['run', 'qa:shell-guard'], { env })
    await run(['run', 'qa:release-smoke'], { env })
  } finally {
    preview.kill('SIGTERM')
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
