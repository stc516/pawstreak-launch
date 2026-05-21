const MAX_EDGE = 640
const JPEG_QUALITY = 0.82

export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read image'))
        return
      }
      resizeDataUrl(reader.result)
        .then(resolve)
        .catch(() => resolve(reader.result as string))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image'))
    reader.readAsDataURL(file)
  })
}

function resizeDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height))
      const width = Math.round(image.width * scale)
      const height = Math.round(image.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) {
        resolve(dataUrl)
        return
      }
      context.drawImage(image, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    image.onerror = () => reject(new Error('Could not load image'))
    image.src = dataUrl
  })
}

export function fillPhotoSlots(current: string[], nextPhoto: string): string[] {
  const slots = [...current]
  const emptyIndex = slots.findIndex((photo) => !photo)
  if (emptyIndex >= 0) {
    slots[emptyIndex] = nextPhoto
    return slots
  }
  return [nextPhoto, slots[1] ?? '', slots[2] ?? ''].slice(0, 3)
}

export function normalizePhotoSlots(photos: string[] | undefined): string[] {
  return [photos?.[0] ?? '', photos?.[1] ?? '', photos?.[2] ?? '']
}
