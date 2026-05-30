/**
 * Run mobile product QA against production and compare with local baseline.
 *
 *   node qa/production-verification.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PRODUCTION_URL = process.env.QA_PRODUCTION_URL || 'https://pawstreakapp.com'
const OUT_DIR = path.join(__dirname, 'evidence', 'production-verification')
const LOCAL_REPORT = path.join(__dirname, 'evidence', 'product-polish-fresh', 'restore-report.json')
const VERCEL_DEPLOY_URL =
  'https://vercel.com/stephen-carrolls-projects/pawstreak-launch/4CfAQF4S7Lqv16B9UzYFudBmYpPD'
const COMMIT = 'b860b7d'

function runAudit(baseUrl, outDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(__dirname, 'mobile-product-restore-audit.mjs')],
      {
        env: {
          ...process.env,
          QA_BASE_URL: baseUrl,
          QA_OUT_DIR: outDir,
          QA_BLOCK_SERVICE_WORKERS: '1',
          QA_NETWORK_TIMEOUT: '45000',
        },
        stdio: 'inherit',
      },
    )
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Audit exited with code ${code}`))
    })
  })
}

function featureSummary(screen) {
  return Object.values(screen.metrics.features ?? {})
    .map((f) => `${f.present ? '✅' : '❌'} ${f.label}`)
    .join('; ')
}

function compareReports(local, production) {
  const diffs = []
  const localDevice = local.devices.find((d) => d.device === 'iPhone 13')
  const prodDevice = production.devices.find((d) => d.device === 'iPhone 13')
  if (!localDevice || !prodDevice) {
    diffs.push({ kind: 'error', message: 'Missing iPhone 13 baseline in one report' })
    return diffs
  }

  for (const localScreen of localDevice.screens) {
    const prodScreen = prodDevice.screens.find((s) => s.id === localScreen.id)
    if (!prodScreen) {
      diffs.push({ screen: localScreen.id, kind: 'missing', message: 'Screen missing on production' })
      continue
    }

    const lm = localScreen.metrics
    const pm = prodScreen.metrics
    const numericKeys = [
      'viewportHeight',
      'scrollHeight',
      'bnavTop',
      'bnavBottom',
      'gapBelowNav',
      'heroHeight',
      'mapHeight',
    ]

    for (const key of numericKeys) {
      const lv = lm[key]
      const pv = pm[key]
      if (lv == null && pv == null) continue
      if (lv !== pv) {
        diffs.push({
          screen: localScreen.id,
          kind: 'metric',
          field: key,
          local: lv,
          production: pv,
        })
      }
    }

    if (lm.journeyPhotoSize && pm.journeyPhotoSize) {
      if (
        lm.journeyPhotoSize.width !== pm.journeyPhotoSize.width ||
        lm.journeyPhotoSize.height !== pm.journeyPhotoSize.height
      ) {
        diffs.push({
          screen: localScreen.id,
          kind: 'metric',
          field: 'journeyPhotoSize',
          local: lm.journeyPhotoSize,
          production: pm.journeyPhotoSize,
        })
      }
    }

    for (const [id, localFeature] of Object.entries(lm.features ?? {})) {
      const prodFeature = pm.features?.[id]
      if (!prodFeature) continue
      if (localFeature.present !== prodFeature.present) {
        diffs.push({
          screen: localScreen.id,
          kind: 'feature',
          field: localFeature.label,
          local: localFeature.present,
          production: prodFeature.present,
        })
      }
    }

    if (localScreen.rating !== prodScreen.rating) {
      diffs.push({
        screen: localScreen.id,
        kind: 'rating',
        local: localScreen.rating,
        production: prodScreen.rating,
      })
    }

    if (!prodScreen.shell.pass) {
      diffs.push({
        screen: localScreen.id,
        kind: 'shell',
        message: prodScreen.shell.message,
      })
    }
  }

  return diffs
}

function buildMarkdown({ production, local, diffs, deployment }) {
  const prodDevice = production.devices.find((d) => d.device === 'iPhone 13')
  const lines = [
    '# Production Verification Report',
    '',
    `**Date:** ${new Date().toISOString().slice(0, 10)}`,
    `**Production URL:** ${PRODUCTION_URL}`,
    `**Commit:** \`${COMMIT}\``,
    `**Vercel deployment:** ${deployment.state === 'success' ? '✅ success' : `❌ ${deployment.state}`}`,
    `[View deployment](${VERCEL_DEPLOY_URL})`,
    '',
    '## Production layout (iPhone 13)',
    '',
    '| Screen | Viewport H | Scroll H | Nav top | Nav bottom | Gap | Rating |',
    '|--------|------------|----------|---------|------------|-----|--------|',
  ]

  for (const screen of prodDevice?.screens ?? []) {
    const m = screen.metrics
    lines.push(
      `| ${screen.label} | ${m.viewportHeight}px | ${m.scrollHeight}px | ${m.bnavTop}px | ${m.bnavBottom}px | ${m.gapBelowNav}px | ${screen.rating} |`,
    )
  }

  lines.push('', '## Screenshots (production)', '')

  for (const screen of prodDevice?.screens ?? []) {
    lines.push(`### ${screen.label}`, '')
    lines.push(`![${screen.label}](${screen.screenshot})`, '')
    lines.push(featureSummary(screen), '')
  }

  lines.push('## Production vs local differences', '')

  if (diffs.length === 0) {
    lines.push('No meaningful differences detected on iPhone 13 metrics, features, or ratings.', '')
  } else {
    lines.push('| Screen | Type | Detail |', '|--------|------|--------|')
    for (const diff of diffs) {
      if (diff.kind === 'metric') {
        lines.push(
          `| ${diff.screen} | metric \`${diff.field}\` | local ${JSON.stringify(diff.local)} → production ${JSON.stringify(diff.production)} |`,
        )
      } else if (diff.kind === 'feature') {
        lines.push(
          `| ${diff.screen} | feature | ${diff.field}: local ${diff.local ? '✅' : '❌'} → production ${diff.production ? '✅' : '❌'} |`,
        )
      } else if (diff.kind === 'rating') {
        lines.push(`| ${diff.screen} | rating | ${diff.local} → ${diff.production} |`)
      } else if (diff.kind === 'shell') {
        lines.push(`| ${diff.screen} | shell | ${diff.message} |`)
      } else {
        lines.push(`| — | ${diff.kind} | ${diff.message} |`)
      }
    }
    lines.push('')
  }

  lines.push('## All devices', '')
  lines.push('Screenshots for iPhone 15 Pro and Pro Max are in the same folder.', '')

  return lines.join('\n')
}

async function getDeploymentStatus() {
  const res = await fetch(
    `https://api.github.com/repos/stc516/pawstreak-launch/commits/${COMMIT}/status`,
    { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'pawstreak-qa' } },
  )
  if (!res.ok) throw new Error(`GitHub status API ${res.status}`)
  return res.json()
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const deployment = await getDeploymentStatus()
  console.log(`Vercel deployment: ${deployment.state}`)

  if (deployment.state !== 'success') {
    throw new Error(`Deployment not ready: ${deployment.state}`)
  }

  console.log(`Running mobile QA against ${PRODUCTION_URL} ...`)
  await runAudit(PRODUCTION_URL, OUT_DIR)

  const production = JSON.parse(
    await readFile(path.join(OUT_DIR, 'restore-report.json'), 'utf8'),
  )
  let local = null
  try {
    local = JSON.parse(await readFile(LOCAL_REPORT, 'utf8'))
  } catch {
    console.warn('Local baseline report not found; skipping comparison.')
  }

  const diffs = local ? compareReports(local, production) : []
  const markdown = buildMarkdown({ production, local, diffs, deployment })
  await writeFile(path.join(OUT_DIR, 'PRODUCTION-VERIFICATION-REPORT.md'), markdown)
  await writeFile(
    path.join(OUT_DIR, 'production-vs-local.json'),
    JSON.stringify({ deployment: deployment.state, diffs }, null, 2),
  )

  console.log(`Report: ${path.join(OUT_DIR, 'PRODUCTION-VERIFICATION-REPORT.md')}`)
  console.log(`Differences: ${diffs.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
