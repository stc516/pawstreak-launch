export function chromiumLaunchOptions(options = {}) {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?.trim()
  return {
    headless: true,
    ...options,
    ...(executablePath ? { executablePath } : {}),
  }
}
