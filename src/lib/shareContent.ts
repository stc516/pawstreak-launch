export type ShareContentInput = {
  title?: string
  text: string
  url?: string
  files?: File[]
}

export type ShareContentResult =
  | { ok: true; method: 'share' | 'clipboard'; message: string }
  | { ok: false; message: string }

function canNativeShare(payload: ShareData): boolean {
  if (typeof navigator.canShare !== 'function') return true
  try {
    return navigator.canShare(payload)
  } catch {
    return false
  }
}

async function tryNativeShare(payload: ShareData): Promise<boolean> {
  if (typeof navigator.share !== 'function') return false
  if (!canNativeShare(payload)) return false
  await navigator.share(payload)
  return true
}

export async function shareContent(input: ShareContentInput): Promise<ShareContentResult> {
  const url = input.url ?? window.location.href
  const text = input.text.trim()
  const title = input.title ?? 'PawStreak'
  const payload = text && url ? `${text}\n${url}` : text || url

  if (typeof navigator.share === 'function') {
    try {
      const files = input.files?.filter((file) => file.size > 0) ?? []

      if (files.length > 0) {
        // Instagram and some mobile share targets are much more reliable when
        // the image is shared as the primary payload. Including a URL can cause
        // those targets to open with text only and silently drop the image.
        const fileTextPayload: ShareData = { title, text, files }
        if (await tryNativeShare(fileTextPayload)) {
          return { ok: true, method: 'share', message: 'Opened your share sheet with the image attached.' }
        }

        const fileOnlyPayload: ShareData = { files }
        if (await tryNativeShare(fileOnlyPayload)) {
          return { ok: true, method: 'share', message: 'Opened your share sheet with the image attached.' }
        }
      }

      const sharePayload: ShareData = {
        title,
        text,
        url,
      }
      await navigator.share(sharePayload)
      return {
        ok: true,
        method: 'share',
        message: files.length > 0
          ? 'Opened your share sheet without the image. Use Save image if Instagram does not attach it.'
          : 'Shared.',
      }
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
