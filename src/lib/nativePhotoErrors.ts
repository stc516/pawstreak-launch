/** Keep dismissing the native camera separate from capture/permission failures.
 * Capacitor Camera rejects with a plain error for the user's Cancel action.
 * Do not hide genuine permission, plugin, or filesystem errors.
 */
export function isNativeCameraCancellation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const candidate = error as { code?: unknown; message?: unknown }
  const code = typeof candidate.code === 'string'
    ? candidate.code.trim().toUpperCase()
    : ''
  if (['USER_CANCELLED', 'USER_CANCELED', 'CANCELED', 'CANCELLED'].includes(code)) {
    return true
  }

  const message = typeof candidate.message === 'string'
    ? candidate.message.trim().toLowerCase().replace(/\.$/, '')
    : ''

  return [
    'user cancelled photos app',
    'user canceled photos app',
    'user cancelled camera',
    'user canceled camera',
    'user cancelled',
    'user canceled',
    'cancelled',
    'canceled',
  ].includes(message)
}
