import { useState } from 'react'
import { readImageFileAsDataUrl } from '../lib/imageUtils'

export interface DogAvatarChoice { photoDataUrl?: string; emoji?: string }
const AVATARS = [ ['🐶', 'Dog face'], ['🐕', 'Golden dog'], ['🐩', 'Poodle'], ['🦮', 'Adventure dog'], ['🐾', 'Paw prints'] ]

export function DogAvatarPicker({ name, onSave }: { name: string; onSave: (choice: DogAvatarChoice) => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const save = async (choice: DogAvatarChoice) => {
    setBusy(true); setMessage('')
    try { await onSave(choice); setMessage(`${name}’s avatar saved.`) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save the avatar. Try again.') }
    finally { setBusy(false) }
  }
  return <fieldset disabled={busy} className="dog-avatar-picker">
    <legend>{name}’s avatar</legend>
    <label className="st-btn st-btn--ghost tap-target">Upload your dog’s photo
      <input type="file" accept="image/*" aria-label={`Upload ${name}'s avatar`} onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = ''; if (!file) return
        setBusy(true); setMessage('')
        try { if (file.size > 20 * 1024 * 1024) throw new Error('Choose a photo smaller than 20 MB.'); await save({ photoDataUrl: await readImageFileAsDataUrl(file) }) }
        catch (error) { setMessage(error instanceof Error ? error.message : 'Could not read this photo.') }
        finally { setBusy(false) }
      }} />
    </label>
    <p>Or choose an avatar. Choosing one replaces the displayed photo.</p>
    <div className="dog-avatar-options">{AVATARS.map(([emoji, label]) => <button type="button" className="tap-target" key={label} aria-label={`Use ${label} avatar for ${name}`} onClick={() => void save({ emoji })}>{emoji}</button>)}</div>
    <p role="status">{busy ? 'Saving avatar…' : message}</p>
  </fieldset>
}
