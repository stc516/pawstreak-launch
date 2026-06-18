import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'pack-access-mvp')

const iPhone = devices['iPhone 13']
const results = []

async function record(flow, pass, message) {
  results.push({ flow, pass, message })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${flow}: ${message}`)
  if (!pass) throw new Error(`${flow}: ${message}`)
}

async function screenshot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  return file
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext(iPhone)
  const page = await context.newPage()

  try {
    await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
    await page.getByLabel('Open profile and settings').click()
    await page.waitForTimeout(400)
    await screenshot(page, '01-profile-pack-access')

    await record(
      'pack-access-profile-copy',
      await page.getByText('Email invites are live for Pack Access MVP. SMS comes later.').isVisible(),
      'Profile explains email-only MVP honestly',
    )

    await page.getByRole('button', { name: /^Invite$/ }).click()
    await page.waitForTimeout(400)
    await screenshot(page, '02-pack-invite-email-only')

    await record(
      'invite-email-only',
      await page.getByLabel('Email').isVisible(),
      'Invite form has email field',
    )
    await record(
      'invite-no-phone-copy',
      !(await page.getByText(/phone/i).count()),
      'Invite form does not ask for phone/SMS',
    )

    const roleOptions = await page.locator('.pack-invite-field select.field-input option').allTextContents()
    await record(
      'invite-roles',
      roleOptions.join('|') === 'Member|Viewer',
      `Invite roles are ${roleOptions.join(', ')}`,
    )

    await page.getByLabel('Email').fill('walker@example.com')
    await page.locator('.pack-invite-field select.field-input').selectOption('Viewer')
    await record(
      'viewer-role-copy',
      await page.getByText('Can view dogs, adventures, memories, and challenges').isVisible(),
      'Viewer role description is read-only',
    )

    await page.getByRole('button', { name: 'Send invite' }).click()
    await page.waitForTimeout(400)
    await screenshot(page, '03-demo-invite-saved')
    await record(
      'demo-invite-toast',
      await page.getByText('Demo invite saved for walker@example.com.').isVisible(),
      'Demo fallback keeps invite UX working locally',
    )

    await page.goto(`${BASE_URL}/app?signin=1`, { waitUntil: 'networkidle' })
    await page.getByPlaceholder('you@email.com').fill('invitee@example.com')
    await screenshot(page, '04-auth-magic-link')
    await record(
      'magic-link-entry',
      await page.getByRole('button', { name: 'Email me a magic link instead' }).isVisible(),
      'Auth screen offers magic link',
    )

    await writeFile(
      path.join(OUT_DIR, 'report.json'),
      JSON.stringify({ baseUrl: BASE_URL, results }, null, 2),
    )
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
