import { useEffect, useRef, useState } from 'react'
import { loadMemoryVideo, saveMemoryVideo, removeMemoryVideo } from '../lib/memoryVideo'
export function MemoryVideo({ memoryId, demo }: { memoryId: string; demo: boolean }) {
  const [url, setUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [loaded, setLoaded] = useState(false)
  const currentUrl = useRef<string | null>(null)
  const replaceUrl = (next: string | null) => { if (currentUrl.current?.startsWith('blob:')) URL.revokeObjectURL(currentUrl.current); currentUrl.current = next; setUrl(next) }
  useEffect(() => {
    let active = true
    void loadMemoryVideo(memoryId, demo).then(next => { if (active) { replaceUrl(next); setLoaded(true) } else if (next?.startsWith('blob:')) URL.revokeObjectURL(next) }).catch(error => { if (active) setMessage(error.message) })
    return () => { active = false; if (currentUrl.current?.startsWith('blob:')) URL.revokeObjectURL(currentUrl.current) }
  }, [memoryId, demo])
  return <section className="memory-video field-card">
    <h2>A moment in motion</h2>
    <p>Optional: one clip, up to 30 seconds and 25 MB. {demo ? 'Saved on this device in demo mode.' : 'Saved privately with your memory.'}</p>
    {url ? <video src={url} controls playsInline preload="metadata" style={{ width: '100%', maxHeight: 360 }} onError={() => setMessage('Playback failed or the link expired. Reopen the memory to reload it.')} /> : null}
    {!url && loaded ? <label className="field-secondary tap-target">Choose a video<input type="file" accept="video/mp4,video/quicktime,video/webm" disabled={busy} onChange={async event => {
      const file = event.target.files?.[0]; event.target.value = ''; if (!file || busy) return
      setBusy(true); setMessage('Uploading video…')
      try { await saveMemoryVideo(memoryId, file, demo); replaceUrl(await loadMemoryVideo(memoryId, demo)); setMessage('Video saved.') }
      catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save video.') }
      finally { setBusy(false) }
    }} /></label> : null}
    {url ? <button className="field-text-action tap-target" disabled={busy} type="button" onClick={async () => {
      setBusy(true)
      try { await removeMemoryVideo(memoryId, demo); replaceUrl(null); setMessage('Video removed.') }
      catch (error) { setMessage(error instanceof Error ? error.message : 'Could not remove video.') }
      finally { setBusy(false) }
    }}>Remove video</button> : null}
    <p role="status">{message}</p>
  </section>
}
