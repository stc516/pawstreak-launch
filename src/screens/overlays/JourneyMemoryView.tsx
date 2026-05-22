import { useState } from 'react'
import type { Dog, JourneyEntry, PackAccessMember } from '../../data/demo'
import { getPackDisplayName } from '../../lib/dogLabels'
import { CardImage } from '../../components/CardImage'
import { getJourneyMemoryDetail } from '../../data/journeyMemories'
import { getPlaceById } from '../../data/places'
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
  const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
  const contentDogs = hasUserDogProfile ? dogs : []
  const memory = getJourneyMemoryDetail(entry, contentDogs)
  const dogLabel =
    contentDogs.length > 0 ? getPackDisplayName(contentDogs) : 'your dog'
  const familyMember = packAccessMembers.find((member) => member.name === 'Dog Mom')
  const heroUrl = place?.imageUrl ?? memory.photoUrls[0]
  const galleryPhotos = [
    ...(entry.photoUrls ?? []),
    ...memory.photoUrls,
  ].slice(0, 6)

  const handleShare = () => {
    setShareNote('Memory link copied — ready to share when you want.')
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
              onClick={handleShare}
            >
              <i className="ti ti-share" aria-hidden="true" />
            </button>
          </div>

          {shareNote ? (
            <div className="memory-toast" role="status">
              {shareNote}
            </div>
          ) : null}

          <div className="memory-hero memory-hero--rich">
            <CardImage
              className="memory-hero-img"
              imageUrl={heroUrl}
              imageAlt={place?.imageAlt ?? entry.place}
              imageTone={place?.imageTone ?? 'warm'}
            />
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

          {familyMember ? (
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

          <div className="memory-section">
            <div className="memory-section-title">Memory gallery</div>
            <div className="memory-gallery">
              {galleryPhotos.map((url, index) => (
                <div key={`${url}-${index}`} className="memory-gallery-item">
                  <img src={url} alt="" className="memory-gallery-img" />
                </div>
              ))}
            </div>
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
              onClick={handleShare}
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
