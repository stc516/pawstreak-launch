import { MemoryVideo } from '../../components/MemoryVideo'
import { WalkRoutePreview } from '../../components/WalkRoutePreview'
import { readImageFileAsDataUrl } from '../../lib/imageUtils'
import type { MemoryDetailInput } from '../../lib/memoryDetails'
import { useEffect, useRef, useState } from 'react'
import type { Dog, JourneyEntry, PackAccessMember } from '../../data/demo'
import { getPackDisplayName } from '../../lib/dogLabels'
import { getJourneyMemoryDetail } from '../../data/journeyMemories'
import { buildMemoryShareText, shareContent } from '../../lib/shareContent'
import { StatusBar } from '../../components/StatusBar'
import { authenticPhotoUrls } from '../../lib/authenticImages'

interface JourneyMemoryViewProps {
  isDemoMode?: boolean
  entry: JourneyEntry
  dogs: Dog[]
  hasUserDogProfile?: boolean
  packAccessMembers?: PackAccessMember[]
  onSaveDetail: (input: MemoryDetailInput) => Promise<void>
  onBack: () => void
  onGoAgain: (placeId: string) => void
  onCreateStory?: () => void
}

export function JourneyMemoryView({
  entry,
  isDemoMode = false,
  dogs,
  hasUserDogProfile = false,
  onSaveDetail,
  onBack,
  onGoAgain,
  onCreateStory,
}: JourneyMemoryViewProps) {
  const [note, setNote] = useState(entry.userNotes ?? '')
  const [pendingPhoto, setPendingPhoto] = useState<string>()
  const [savingDetail, setSavingDetail] = useState(false)
  const [detailMessage, setDetailMessage] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)
  const detailSaveRef = useRef(false)
  const scrollRef = useRef<HTMLElement | null>(null)
  const [shareNote, setShareNote] = useState<string | null>(null)
  const [shareIsError, setShareIsError] = useState(false)
  const contentDogs = hasUserDogProfile ? dogs : dogs.filter(dog => entry.dogTags?.some(tag => tag.includes(dog.name)))
  const memory = getJourneyMemoryDetail(entry, contentDogs)
  const dogLabel =
    contentDogs.length > 0 ? getPackDisplayName(contentDogs) : 'your dog'
  const savedPhotos = authenticPhotoUrls(entry.photoUrls)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [entry.id])

  const handleSaveDetail = async () => {
    if (detailSaveRef.current) return
    detailSaveRef.current = true
    setSavingDetail(true)
    setDetailMessage('')
    try {
      await onSaveDetail({ note, photoDataUrl: pendingPhoto })
      setPendingPhoto(undefined)
      setDetailMessage('Detail saved.')
    } catch (error) {
      setDetailMessage(error instanceof Error ? error.message : 'Could not save. Try again.')
    } finally {
      detailSaveRef.current = false
      setSavingDetail(false)
    }
  }

  const handleShare = async () => {
    setShareNote(null)
    setShareIsError(false)

    const result = await shareContent({
      title: `${entry.place} · PawStreak memory`,
      text: buildMemoryShareText({
        place: entry.place,
        date: entry.date,
        magicLine: entry.magicLine ?? memory.favoriteMoment,
      }),
    })

    if (result.ok) {
      setShareNote(result.message)
      setShareIsError(false)
    } else {
      setShareNote(result.message)
      setShareIsError(true)
    }

    window.setTimeout(() => setShareNote(null), 2800)
  }

  return (
    <div className="app-viewport field-notes">
      <div className="app-shell">
        <StatusBar />
        <main ref={scrollRef} className="scroll scroll--overlay field-notes-scroll">
          <div className="overlay-topbar"><button type="button" className="overlay-back tap-target" onClick={onBack}>← Journey</button>
            <button type="button" className="overlay-action tap-target" aria-label="Share memory" onClick={onCreateStory ?? (() => void handleShare())}>Share</button>
          </div>
          <p className="field-kicker"><span className="field-saved-mark" aria-hidden="true">✓</span> Saved to Journey</p>
          <h1>{entry.place}</h1>
          <p className="field-date">{entry.date}</p>
          <div className="field-pack">{contentDogs.map(dog => <span key={dog.id}>{dog.photoUrl ? <img src={dog.photoUrl} alt="" /> : <span aria-hidden="true">{dog.profileEmoji}</span>}{dog.name}</span>)}</div>
          <div className={`kinetic-recap-hero${savedPhotos.length ? ' kinetic-recap-hero--photo' : ''}`}>
            {savedPhotos[0] ? <img src={savedPhotos[0]} alt={`A moment from ${entry.place}`} /> : <i className="ti ti-route" aria-hidden="true" />}
            <div><span className="field-kicker">A day worth keeping</span><p className="field-recap-line">A little time outside, together.</p></div>
          </div>
          <div className="field-stats" aria-label="Walk summary">
            {entry.durationLabel && entry.durationLabel !== 'Open end' ? <div><span>Time out</span><strong>{entry.durationLabel}</strong></div> : null}
            <div><span>Adventure</span><strong>{memory.adventureType}</strong></div>
          </div>
          <button type="button" className="field-primary tap-target" onClick={onBack}>View in Journey <i className="ti ti-arrow-right" aria-hidden="true" /></button>
          {entry.userNotes ? <section className="field-note"><h2>A detail to keep</h2><p>{entry.userNotes}</p></section> : null}
          {entry.recapLabels?.length ? <section className="field-note" aria-label={`Details from ${dogLabel}'s walk`}><h2>Little details</h2><div className="field-tags">{entry.recapLabels.map(label => <span key={label}>{label}</span>)}</div></section> : null}
          {savedPhotos.length > 0 ? <section className="field-photos">
            <div className="field-gallery-heading"><h2>Photos</h2><span>{savedPhotos.length} {savedPhotos.length === 1 ? 'photo' : 'photos'}</span></div>
            <div className="field-gallery">{savedPhotos.map((url,index) => <img key={`${url}-${index}`} src={url} alt={`Walk photo ${index + 1}`} />)}</div>
          </section> : null}
          <details className="field-add-detail"><summary className="tap-target">Add a detail · optional</summary>
            <label htmlFor="memory-note">A note to remember</label>
            <textarea id="memory-note" value={note} maxLength={2000} disabled={savingDetail} onChange={event => setNote(event.target.value)} placeholder="A favorite turn, a new friend…" />
            <input ref={photoInputRef} className="cam-input" type="file" accept="image/*" disabled={savingDetail} onChange={async event => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              try { setPendingPhoto(await readImageFileAsDataUrl(file)); setDetailMessage('') }
              catch { setDetailMessage('That photo could not be added. Choose another image.') }
            }} />
            {savedPhotos.length < 3 ? <button type="button" className="field-secondary tap-target" disabled={savingDetail} onClick={() => photoInputRef.current?.click()}>{pendingPhoto ? 'Choose another photo' : 'Add photo'}</button> : null}
            {pendingPhoto ? <img className="field-pending-photo" src={pendingPhoto} alt="Photo ready to save" /> : null}
            <button type="button" className="field-primary tap-target" disabled={savingDetail} onClick={() => void handleSaveDetail()}>{savingDetail ? 'Saving detail…' : 'Save detail'}</button>
            {detailMessage ? <p role="status">{detailMessage}</p> : null}
          </details>
          {shareNote ? <p role={shareIsError ? 'alert' : 'status'}>{shareNote}</p> : null}
          <div className="field-recap-actions">
            <button type="button" className="field-secondary tap-target" onClick={onCreateStory ?? (() => void handleShare())}>Share this memory</button>
            {entry.placeId ? <button type="button" className="field-secondary tap-target" onClick={() => onGoAgain(entry.placeId!)}>Go again</button> : null}
          </div>
          {entry.routePoints?.length ? <WalkRoutePreview points={entry.routePoints} /> : null}
          {isDemoMode || import.meta.env.VITE_MEMORY_VIDEO_ENABLED === 'true' ? <MemoryVideo key={entry.id} memoryId={entry.id} demo={isDemoMode} /> : null}
        </main>
      </div>
    </div>
  )
}
