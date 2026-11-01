import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { isNativeAppRuntime } from './nativeRuntime'

export type ShareContentInput = {
  title?: string
  text: string
  url?: string
  files?: File[]
}

export type ShareContentResult =
  | { ok: true; method: 'share' | 'clipboard'; message: string }
  | { ok: false; message: string }

const PUBLIC_APP_URL = 'https://pawstreakapp.com/app'

function fileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('Could not read share image.'))
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : ''
      const comma = value.indexOf(',')
      if (comma < 0) {
        reject(new Error('Could not encode share image.'))
        return
      }
      resolve(value.slice(comma + 1))
    }
    reader.readAsDataURL(file)
  })
}

async function cacheNativeShareFiles(files: File[]): Promise<string[]> {
  return Promise.all(
    files.map(async (file, index) => {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-80) || `share-${index}.png`
      const result = await Filesystem.writeFile({
        path: `pawstreak-share/${Date.now()}-${index}-${safeName}`,
        data: await fileAsBase64(file),
        directory: Directory.Cache,
        recursive: true,
      })
      return result.uri
    }),
  )
}

function shareWasCancelled(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return /abort|cancel/i.test(`${error.name} ${error.message}`)
}

export async function shareContent(input: ShareContentInput): Promise<ShareContentResult> {
  const nativeRuntime = isNativeAppRuntime()
  const url = input.url ?? (nativeRuntime ? PUBLIC_APP_URL : window.location.href)
  const text = input.text.trim()
  const title = input.title ?? 'PawStreak'
  const payload = text && url ? `${text}\n${url}` : text || url

  if (nativeRuntime) {
    try {
      const capability = await Share.canShare()
      if (capability.value) {
        let files: string[] | undefined
        if (input.files?.length) {
          try {
            files = await cacheNativeShareFiles(input.files)
          } catch {
            // Keep the share action useful even if temporary image creation fails.
          }
        }

        await Share.share({
          title,
          text,
          url,
          files,
          dialogTitle: 'Share from PawStreak',
        })
        return {
          ok: true,
          method: 'share',
          message: files?.length ? 'Opened your share sheet with card image.' : 'Opened your share sheet.',
        }
      }
    } catch (error) {
      if (shareWasCancelled(error)) return { ok: false, message: 'Share cancelled.' }
    }
  }

  if (typeof navigator.share === 'function') {
    try {
      const textSharePayload: ShareData = {
        title,
        text,
        url,
      }

      if (input.files?.length && typeof navigator.canShare === 'function') {
        const fileSharePayloads: ShareData[] = [
          { title, text: payload, files: input.files },
          { title, files: input.files },
          { files: input.files },
        ]

        for (const filePayload of fileSharePayloads) {
          if (!navigator.canShare(filePayload)) continue
          await navigator.share(filePayload)
          return { ok: true, method: 'share', message: 'Opened your share sheet with card image.' }
        }
      }

      await navigator.share(textSharePayload)
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
