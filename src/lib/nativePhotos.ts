import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { isNativeAppRuntime } from './nativeRuntime'

export interface NativePhotoCaptureResult {
  dataUrl: string
  savedToGallery: boolean
}

export async function captureNativeAdventurePhoto(): Promise<NativePhotoCaptureResult | null> {
  if (!isNativeAppRuntime()) return null

  const photo = await Camera.getPhoto({
    quality: 82,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera,
    saveToGallery: true,
    correctOrientation: true,
  })

  if (!photo.dataUrl) {
    throw new Error('Could not read captured photo.')
  }

  return {
    dataUrl: photo.dataUrl,
    savedToGallery: true,
  }
}
