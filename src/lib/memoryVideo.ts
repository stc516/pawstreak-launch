import { getSupabaseClient } from './supabase'
const MAX_BYTES = 25 * 1024 * 1024
export async function validateMemoryVideo(file: File): Promise<number> {
  if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type)) throw new Error('Choose an MP4, MOV or WebM video.')
  if (file.size > MAX_BYTES || !file.size) throw new Error('Choose a video smaller than 25 MB.')
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<number>((resolve, reject) => {
      const video = document.createElement('video')
      const timeout = window.setTimeout(() => { video.src = ''; reject(new Error('Could not read this video. Try an MP4 exported in compatible format.')) }, 15000)
      const finish = (error?: Error) => { clearTimeout(timeout); video.onloadedmetadata = null; video.onerror = null; video.removeAttribute('src'); video.load(); if (error) reject(error) }
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        const duration = video.duration
        if (!Number.isFinite(duration) || duration <= 0 || duration > 30) { finish(new Error('Choose a clip up to 30 seconds long.')); return }
        finish(); resolve(duration)
      }
      video.onerror = () => finish(new Error('This video format cannot play on this device. Try a compatible MP4.'))
      video.src = url
    })
  } finally { URL.revokeObjectURL(url) }
}

async function demoStore<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('pawstreak-demo-media', 1)
    open.onupgradeneeded = () => open.result.createObjectStore('videos')
    open.onerror = () => reject(new Error('Could not open local video storage.'))
    open.onsuccess = () => {
      const db = open.result; const tx = db.transaction('videos', mode); const request = operation(tx.objectStore('videos'))
      tx.oncomplete = () => { resolve(request.result); db.close() }
      tx.onerror = () => { reject(new Error('Could not save video on this device.')); db.close() }
    }
  })
}
export async function loadMemoryVideo(memoryId: string, demo: boolean): Promise<string | null> {
  if (demo) { const blob = await demoStore<Blob | undefined>('readonly', store => store.get(memoryId)); return blob ? URL.createObjectURL(blob) : null }
  const client = getSupabaseClient(); if (!client) throw new Error('Connect to load your video.')
  const { data, error } = await client.from('memories').select('video_path').eq('id', memoryId).single()
  if (error) throw new Error('Video could not load. Try reopening this memory.')
  if (!data.video_path) return null
  const result = await client.storage.from('memory-videos').createSignedUrl(data.video_path, 3600)
  if (result.error) throw new Error('Video could not load. Try reopening this memory.')
  return result.data.signedUrl
}
export async function saveMemoryVideo(memoryId: string, file: File, demo: boolean) {
  await validateMemoryVideo(file)
  if (demo) { await demoStore('readwrite', store => store.put(file, memoryId)); return }
  const client = getSupabaseClient(); if (!client) throw new Error('Connect to save your video.')
  const { data: session, error: authError } = await client.auth.getUser()
  if (authError || !session.user) throw new Error('Sign in to save your video.')
  const path = `${session.user.id}/${memoryId}/clip`
  const { error } = await client.storage.from('memory-videos').upload(path, file, { contentType: file.type, upsert: true })
  if (error) throw new Error('Could not upload the video. Reopen this memory to check for an existing clip, or try again.')
  const { error: saveError, data } = await client.from('memories').update({ video_path: path }).eq('id', memoryId).eq('user_id', session.user.id).select('id').single()
  if (saveError || !data) throw new Error('Could not confirm the video save. Your walk is safe. Reopen the memory before retrying.')
}
export async function removeMemoryVideo(memoryId: string, demo: boolean) {
  if (demo) { await demoStore('readwrite', store => store.delete(memoryId)); return }
  const client = getSupabaseClient(); if (!client) throw new Error('Connect to remove the video.')
  const { data: session } = await client.auth.getUser()
  if (!session.user) throw new Error('Sign in to remove your video.')
  const { data, error } = await client.from('memories').update({ video_path: null }).eq('id', memoryId).eq('user_id', session.user.id).select('id').single()
  if (error || !data) throw new Error('Could not remove this video.')
  const result = await client.storage.from('memory-videos').remove([`${session.user.id}/${memoryId}/clip`])
  if (result.error) throw new Error('The video is detached, but its file could not be removed. Try Remove video again.')
}
