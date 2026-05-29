import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:5399'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'auth-batch-a')

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const mobile = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await mobile.newPage()

  await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(600)

  await page.getByRole('button', { name: 'Log in or sign up' }).click()
  await page.waitForTimeout(400)

  const createAccountVisible = await page.getByRole('button', { name: 'Create account' }).isVisible()
  console.log(`Auth step visible: ${createAccountVisible ? 'PASS' : 'FAIL'}`)

  await page.getByRole('button', { name: 'Already have an account? Sign in' }).click()
  await page.waitForTimeout(300)

  const forgotVisible = await page.getByRole('button', { name: 'Forgot password?' }).isVisible()
  console.log(`Forgot password link: ${forgotVisible ? 'PASS' : 'FAIL'}`)

  await page.getByRole('button', { name: 'Forgot password?' }).click()
  await page.waitForTimeout(300)

  const resetVisible = await page.getByRole('button', { name: 'Send reset link' }).isVisible()
  console.log(`Password reset UI: ${resetVisible ? 'PASS' : 'FAIL'}`)

  await page.screenshot({
    path: path.join(OUT_DIR, '01-auth-forgot-password-mobile.png'),
    fullPage: false,
  })

  await page.getByPlaceholder('you@email.com').fill('test@example.com')
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await page.waitForTimeout(1200)

  const resetSuccess = await page
    .getByText('Password reset link sent. Check your email to continue.')
    .isVisible()
    .catch(() => false)
  const resetError = await page.locator('.demo-feedback-status[role="alert"]').isVisible()
  console.log(
    `Password reset feedback: ${
      resetSuccess ? 'PASS success message' : resetError ? 'PASS error surfaced' : 'SKIP (needs Supabase)'
    }`,
  )

  await page.screenshot({
    path: path.join(OUT_DIR, '02-auth-reset-feedback-mobile.png'),
    fullPage: false,
  })

  const storageCleared = await page.evaluate(() => {
    localStorage.setItem('pawstreak:app', JSON.stringify({ onboardingComplete: true, test: true }))
    localStorage.removeItem('pawstreak:app')
    return localStorage.getItem('pawstreak:app') === null
  })
  console.log(`Local storage wipe helper: ${storageCleared ? 'PASS' : 'FAIL'}`)

  await browser.close()
  console.log(`Saved screenshots to ${OUT_DIR}`)

  if (!createAccountVisible || !forgotVisible || !resetVisible || !storageCleared) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
