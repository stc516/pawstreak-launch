export type ShareContentInput = {
  title?: string
  text: string
  url?: string
}

export type ShareContentResult =
  | { ok: true; method: 'share' | 'clipboard'; message: string }
  | { ok: false; message: string }

export async function shareContent(input: ShareContentInput): Promise<ShareContentResult> {
  const url = input.url ?? window.location.href
  const text = input.text.trim()
  const title = input.title ?? 'PawStreak'
  const payload = text && url ? `${text}\n${url}` : text || url

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title,
        text,
        url,
      })
      return { ok: true, method: 'share', message: 'Shared.' }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { ok: false, message: 'Share cancelled.' }
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(payload)
      return { ok: true, method: 'clipboard', message: 'Copied to clipboard.' }
    } catch {
      return { ok: false, message: 'Could not copy to clipboard.' }
    }
  }

  return { ok: false, message: 'Sharing is not available on this device.' }
}

export function buildMemoryShareText(entry: { place: string; date: string; magicLine?: string }) {
  const lead = entry.magicLine?.trim() || `A memory from ${entry.place}.`
  return `${entry.place} · ${entry.date}\n${lead}`
}
