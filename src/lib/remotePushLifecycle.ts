export interface DeviceConsent { userId: string; token: string }
export interface RefreshDriver {
  read: () => Promise<DeviceConsent | null>
  userId: () => Promise<string | null>
  permission: () => Promise<boolean>
  register: () => Promise<string>
  rotate: (oldToken: string, newToken: string) => Promise<boolean>
  persist: (record: DeviceConsent) => Promise<void>
  clear: () => Promise<void>
}
// No consent / account mismatch / denied OS permission never triggers registration.
export async function refreshConsentedDevice(driver: RefreshDriver) {
  const record = await driver.read()
  if (!record || record.userId !== await driver.userId() || !await driver.permission()) return
  const token = await driver.register()
  if (record.userId !== await driver.userId()) return
  if (!await driver.rotate(record.token, token)) { await driver.clear(); return }
  await driver.persist({ ...record, token })
}
// Serialize refresh, settings edits and logout so a late refresh cannot undo opt-out.
export function createSerialQueue() {
  let tail: Promise<unknown> = Promise.resolve()
  return <T>(operation: () => Promise<T>): Promise<T> => {
    const next = tail.then(operation, operation)
    tail = next.catch(() => {})
    return next
  }
}
