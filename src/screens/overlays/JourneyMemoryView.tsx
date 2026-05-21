import type { JourneyEntry } from '../../data/demo'
import { CardImage } from '../../components/CardImage'
import { getJourneyMemoryDetail } from '../../data/journeyMemories'
import { getPlaceById } from '../../data/places'
import { StatusBar } from '../../components/StatusBar'

interface JourneyMemoryViewProps {
  entry: JourneyEntry
  onBack: () => void
}

export function JourneyMemoryView({ entry, onBack }: JourneyMemoryViewProps) {
  const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
  const memory = getJourneyMemoryDetail(entry.id)
  const heroUrl = place?.imageUrl ?? memory.photoUrls[0]

  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll scroll--overlay">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back" onClick={onBack}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Back
            </button>
            <button type="button" className="overlay-action" aria-label="Share memory">
              <i className="ti ti-share" aria-hidden="true" />
            </button>
          </div>

          <div className="memory-hero">
            <CardImage
              className="memory-hero-img"
              imageUrl={heroUrl}
              imageAlt={place?.imageAlt ?? entry.place}
              imageTone={place?.imageTone ?? 'warm'}
            />
            <div className="memory-hero-text">
              <div className="memory-place">{entry.place}</div>
              <div className="memory-date">{entry.date}</div>
              <div className="memory-subtitle">{memory.memorySubtitle}</div>
            </div>
          </div>

          <div className="memory-tags">
            {entry.tags.map((tag) => (
              <span key={tag} className="mt">
                {tag}
              </span>
            ))}
          </div>

          <div className="memory-chips">
            {memory.adventureChips.map((chip) => (
              <span key={chip} className="rc on memory-chip">
                {chip}
              </span>
            ))}
          </div>

          <div className="memory-stats">
            <div className="memory-stat">
              You&apos;ve been here {memory.visitCount} times
            </div>
            <div className="memory-stat memory-stat--warm">{memory.dogLoveLine}</div>
          </div>

          <div className="memory-recap">
            {memory.emotionalRecaps.map((line) => (
              <p key={line} className="memory-recap-line">
                {line}
              </p>
            ))}
          </div>

          <div className="sec">Photos from this day</div>
          <div className="memory-photos">
            {[
              ...memory.photoUrls,
              ...(entry.photoUrls ?? []),
            ]
              .slice(0, 6)
              .map((url, index) => (
                <div key={`${url}-${index}`} className="memory-photo">
                  <img src={url} alt="" className="memory-photo-img" />
                </div>
              ))}
          </div>

          <div className="memory-actions">
            <button type="button" className="memory-btn memory-btn--ghost">
              <i className="ti ti-share" aria-hidden="true" />
              Share
            </button>
            <button type="button" className="memory-btn memory-btn--primary">
              <i className="ti ti-users" aria-hidden="true" />
              Post to community
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
