import { useState } from 'react'
import type { Dog, JourneyEntry, PackAccessMember } from '../../data/demo'
import { getPackDisplayName } from '../../lib/dogLabels'
import { CardImage } from '../../components/CardImage'
import { LIVE_PRODUCT } from '../../lib/liveProductFeatures'
import { getJourneyMemoryDetail } from '../../data/journeyMemories'
import { getPlaceById } from '../../data/places'
import { buildMemoryShareText, shareContent } from '../../lib/shareContent'
import { StatusBar } from '../../components/StatusBar'

interface JourneyMemoryViewProps {
  entry: JourneyEntry
  dogs: Dog[]
  hasUserDogProfile?: boolean
  packAccessMembers?: PackAccessMember[]
  onBack: () => void
  onGoAgain: (placeId: string) => void
}

export function JourneyMemoryView({
  entry,
  dogs,
  hasUserDogProfile = false,
  packAccessMembers = [],
  onBack,
  onGoAgain,
}: JourneyMemoryViewProps) {
  const [shareNote, setShareNote] = useState<string | null>(null)
  const [shareIsError, setShareIsError] = useState(false)
  const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
  const contentDogs = hasUserDogProfile ? dogs : []
  const memory = getJourneyMemoryDetail(entry, contentDogs)
  const dogLabel =
    contentDogs.length > 0 ? getPackDisplayName(contentDogs) : 'your dog'
  const familyMember = packAccessMembers.find((member) => member.name === 'Dog Mom')
  const savedPhotos = entry.photoUrls ?? []
  const heroPhoto = savedPhotos[0]

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
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll scroll--overlay">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back tap-target" onClick={onBack}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Back
            </button>
            <button
              type="button"
              className="overlay-action tap-target"
              aria-label="Share memory"
              onClick={() => void handleShare()}
            >
              <i className="ti ti-share" aria-hidden="true" />
            </button>
          </div>

          {shareNote ? (
            <div
              className={`memory-toast${shareIsError ? ' memory-toast--error' : ''}`}
              role={shareIsError ? 'alert' : 'status'}
            >
              {shareNote}
            </div>
          ) : null}

          <div className="memory-hero memory-hero--rich">
            {heroPhoto ? (
              <CardImage
                className="memory-hero-img"
                imageUrl={heroPhoto}
                imageAlt={entry.place}
                imageTone={place?.imageTone ?? 'warm'}
              />
            ) : (
              <div className="memory-hero-empty">
                <i className="ti ti-camera-off" aria-hidden="true" />
                <p>No photos saved for this memory yet.</p>
              </div>
            )}
            <div className="memory-hero-badge">Memory saved</div>
            <div className="memory-hero-text">
              <div className="memory-place">{entry.place}</div>
              <div className="memory-date">{entry.date}</div>
              <div className="memory-subtitle">{memory.memorySubtitle}</div>
            </div>
          </div>

          <div className="memory-context detail-card-warm">
            <div className="memory-context-item">
              <span className="memory-context-label">Visits</span>
              <span>{memory.visitCount} times here</span>
            </div>
            <div className="memory-context-item">
              <span className="memory-context-label">Type</span>
              <span>{memory.adventureType}</span>
            </div>
            <div className="memory-context-item">
              <span className="memory-context-label">Mood</span>
              <span>{memory.memoryMood}</span>
            </div>
          </div>

          <div className="memory-dog-tags">
            {memory.dogTags.map((tag) => (
              <span key={tag} className="memory-dog-tag">
                {tag}
              </span>
            ))}
          </div>

          {LIVE_PRODUCT.packAccess && familyMember ? (
            <div className="memory-pack-reaction detail-card-warm">
              {familyMember.name} loved this memory.
            </div>
          ) : null}

          <div className="memory-section detail-quote-block">
            <div className="memory-section-title">Emotional recap</div>
            <div className="memory-recap">
              {memory.emotionalRecaps.map((line) => (
                <p key={line} className="detail-quote-text">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="memory-section detail-card-warm">
            <div className="memory-section-title">Favorite moment</div>
            <p className="memory-favorite">{memory.favoriteMoment}</p>
          </div>

          <div className="memory-section detail-card-warm">
            <div className="memory-section-title">
              What {dogLabel} loved
            </div>
            <ul className="memory-loved">
              {memory.whatDogsLoved.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="memory-chips">
            {memory.adventureChips.map((chip) => (
              <span key={chip} className="rc on memory-chip">
                {chip}
              </span>
            ))}
          </div>

          <div className="memory-section detail-card-warm">
            <div className="memory-section-title">Memory gallery</div>
            {savedPhotos.length > 0 ? (
              <div className="memory-gallery">
                {savedPhotos.map((url, index) => (
                  <div key={`${url}-${index}`} className="memory-gallery-item">
                    <img src={url} alt="" className="memory-gallery-img" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="memory-gallery-empty">
                Photos you capture during adventures will show up here.
              </div>
            )}
          </div>

          <div className="memory-actions">
            {entry.placeId ? (
              <button
                type="button"
                className="memory-btn memory-btn--primary tap-target"
                onClick={() => onGoAgain(entry.placeId!)}
              >
                <i className="ti ti-refresh" aria-hidden="true" />
                Go again
              </button>
            ) : null}
            <button
              type="button"
              className="memory-btn memory-btn--ghost tap-target"
              onClick={() => void handleShare()}
            >
              <i className="ti ti-share" aria-hidden="true" />
              Share this memory
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
