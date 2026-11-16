import { spawn } from 'node:child_process'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const releaseEvidenceRoot = process.env.QA_EVIDENCE_ROOT || 'artifacts/qa/release-gate'

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
  await run(['audit', '--omit=dev', '--audit-level=high'])
  await run(['run', 'lint'])
  await run(['run', 'qa:native'])
  const deterministicEnv = { ...process.env, VITE_MAPBOX_TOKEN: '' }
  await run(['run', 'build'], { env: deterministicEnv })

  const preview = spawn(npm, ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], { stdio: 'inherit', env: deterministicEnv })
  try {
    await waitForServer('http://127.0.0.1:4173')
    const env = { ...process.env, QA_BASE_URL: 'http://127.0.0.1:4173' }
    await run(['run', 'qa:shell-guard'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/mobile-shell-guard` },
    })
    await run(['run', 'qa:release-smoke'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/release-smoke` },
    })
    await run(['run', 'qa:beta-critical'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/beta-critical` },
    })
    await run(['run', 'qa:core-loop-p0'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/core-loop-p0` },
    })
    await run(['run', 'qa:finish-review'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/active-adventure-finish-review` },
    })
    await run(['run', 'qa:plan-first-action'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/plan-mobile-first-action` },
    })
    await run(['run', 'qa:plan-filters'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/plan-proximity-category` },
    })
    await run(['run', 'qa:challenges-first-action'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/challenges-mobile-first-action` },
    })
    await run(['run', 'qa:home-memory-clarity'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/home-memory-placeholder-clarity` },
    })
    await run(['run', 'qa:achievements-disclosure'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/achievements-mobile-disclosure` },
    })
    await run(['run', 'qa:active-adventure-hero'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/active-adventure-mobile-hero` },
    })
    await run(['run', 'qa:active-adventure-banner'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/active-adventure-mobile-banner` },
    })
    await run(['run', 'qa:home-core-actions'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/home-core-actions-touch-safety` },
    })
    await run(['run', 'qa:mobile-navigation'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/mobile-navigation-touch-safety` },
    })
    await run(['run', 'qa:share-touch'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/share-flow-touch-safety` },
    })
    await run(['run', 'qa:visual-integrity'], {
      env: { ...env, QA_OUT_DIR: `${releaseEvidenceRoot}/visual-integrity` },
    })
  } finally {
    preview.kill('SIGTERM')
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
