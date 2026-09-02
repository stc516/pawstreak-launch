import { App as CapacitorApp } from '@capacitor/app'
import { isNativeAppRuntime } from './nativeRuntime'

type RestoredPhotoListener = (dataUrl: string) => void

const listeners = new Set<RestoredPhotoListener>()
const pendingDataUrls: string[] = []
let registered = false

function getRestoredCameraDataUrl(event: {
  pluginId?: string
  methodName?: string
  success?: boolean
  data?: { dataUrl?: string }
}): string | null {
  if (event.pluginId !== 'Camera') return null
  if (event.methodName !== 'getPhoto') return null
  if (!event.success) return null

  const dataUrl = event.data?.dataUrl
  return dataUrl?.startsWith('data:image/') ? dataUrl : null
}

export function registerNativePhotoRestoreHandler(): void {
  if (registered || !isNativeAppRuntime()) return
  registered = true

  void CapacitorApp.addListener('appRestoredResult', (event) => {
    const dataUrl = getRestoredCameraDataUrl(event)
    if (!dataUrl) return

    if (listeners.size === 0) {
      pendingDataUrls.push(dataUrl)
      return
    }

    listeners.forEach((listener) => listener(dataUrl))
  })
}

export function subscribeToNativeRestoredPhotos(listener: RestoredPhotoListener): () => void {
  listeners.add(listener)

  while (pendingDataUrls.length > 0) {
    const dataUrl = pendingDataUrls.shift()
    if (dataUrl) listener(dataUrl)
  }

  return () => {
    listeners.delete(listener)
  }
}
