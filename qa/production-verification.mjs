/**
 * Run current mobile product QA against production.
 *
 *   node qa/production-verification.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PRODUCTION_URL = process.env.QA_PRODUCTION_URL || 'https://pawstreakapp.com'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'production-verification')

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: path.join(__dirname, '..'),
      env: process.env,
      stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    })
    let stdout = ''
    let stderr = ''
    if (options.capture) {
      child.stdout.on('data', (chunk) => {
        stdout += chunk
      })
      child.stderr.on('data', (chunk) => {
        stderr += chunk
      })
    }
    child.on('close', (code) => {
      if (code === 0) resolve(stdout.trim())
      else reject(new Error(`${command} ${args.join(' ')} exited ${code}\n${stderr}`))
    })
  })
}

function runAudit() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(__dirname, 'mobile-product-audit.mjs')],
      {
        env: {
          ...process.env,
          QA_BASE_URL: PRODUCTION_URL,
          QA_OUT_DIR: OUT_DIR,
          QA_BLOCK_SERVICE_WORKERS: '1',
          QA_NETWORK_TIMEOUT: '45000',
        },
        stdio: 'inherit',
      },
    )
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Production audit exited with code ${code}`))
    })
  })
}

function summarize(report) {
  const totals = { green: 0, yellow: 0, red: 0 }
  const rows = []

  for (const device of report.devices) {
    for (const result of device.results) {
      const rating = result.audit.rating
      totals[rating] += 1
      rows.push({
        device: device.device,
        screen: result.screen,
        rating,
        issues: result.audit.issues.map((issue) => issue.code),
        screenshot: result.screenshot,
      })
    }
  }

  return { totals, rows }
}

function buildMarkdown({ report, commit, summary }) {
  const lines = [
    '# Production Verification Report',
    '',
    `**Date:** ${new Date().toISOString()}`,
    `**Production URL:** ${PRODUCTION_URL}`,
    `**Commit:** \`${commit}\``,
    '',
    '## Result',
    '',
    `Green: ${summary.totals.green} · Yellow: ${summary.totals.yellow} · Red: ${summary.totals.red}`,
    '',
    '| Device | Screen | Rating | Issues | Screenshot |',
    '|--------|--------|--------|--------|------------|',
  ]

  for (const row of summary.rows) {
    lines.push(
      `| ${row.device} | ${row.screen} | ${row.rating.toUpperCase()} | ${row.issues.join(', ') || 'None'} | ${row.screenshot} |`,
    )
  }

  lines.push(
    '',
    '## Notes',
    '',
    '- This script uses `qa/mobile-product-audit.mjs`, the current mobile QA harness.',
    '- Yellow findings are review items; Red findings should block launch until understood or fixed.',
  )

  return lines.join('\n')
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const commit = await run('git', ['rev-parse', '--short', 'HEAD'], { capture: true })

  console.log(`Running production mobile QA against ${PRODUCTION_URL} at ${commit} ...`)
  await runAudit()

  const report = JSON.parse(await readFile(path.join(OUT_DIR, 'audit-report.json'), 'utf8'))
  const summary = summarize(report)
  const markdown = buildMarkdown({ report, commit, summary })

  await writeFile(path.join(OUT_DIR, 'PRODUCTION-VERIFICATION-REPORT.md'), markdown)
  await writeFile(
    path.join(OUT_DIR, 'production-summary.json'),
    JSON.stringify({ productionUrl: PRODUCTION_URL, commit, ...summary }, null, 2),
  )

  console.log(`Report: ${path.join(OUT_DIR, 'PRODUCTION-VERIFICATION-REPORT.md')}`)
  console.log(`Green: ${summary.totals.green}; Yellow: ${summary.totals.yellow}; Red: ${summary.totals.red}`)

  if (summary.totals.red > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
