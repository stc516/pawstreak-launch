import type { AppState, JourneyEntry } from '../data/demo'
import { SAMPLE_IMAGES } from '../data/sampleImages'
import { getJourneyEntryDisplayImageUrl } from '../lib/adventureDisplayImage'
import { NEIGHBORHOOD_WALK_PLACE_ID } from '../data/places'

interface JourneyStoryPathProps {
  state: AppState
  onOpenMemory?: (entryId: string) => void
  onStartAdventure: () => void
  onGoToPlan?: () => void
}

function parseEntryTimestamp(entry: JourneyEntry): number {
  if (entry.occurredAt) {
    const parsed = Date.parse(entry.occurredAt)
    if (!Number.isNaN(parsed)) return parsed
  }

  const normalized = entry.date.trim().toLowerCase()
  if (normalized === 'today') return Date.now()
  if (normalized === 'yesterday') return Date.now() - 86_400_000

  const parsed = Date.parse(entry.date)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

function formatMemoryDate(entry: JourneyEntry): string {
  if (!entry.occurredAt) return entry.date
  const parsed = Date.parse(entry.occurredAt)
  if (Number.isNaN(parsed)) return entry.date

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(parsed)
}

function isEverydayWalk(entry: JourneyEntry): boolean {
  if (entry.placeId === NEIGHBORHOOD_WALK_PLACE_ID) return true
  const label = `${entry.place} ${entry.tags.join(' ')}`.toLowerCase()
  return label.includes('neighborhood walk') || label.includes('around the neighborhood')
}

export function JourneyStoryPath({
  state,
  onOpenMemory,
  onStartAdventure,
  onGoToPlan,
}: JourneyStoryPathProps) {
  const entries = [...state.journeyEntries].sort(
    (left, right) => parseEntryTimestamp(right) - parseEntryTimestamp(left),
  )
  const adventureEntries = entries.filter((entry) => !isEverydayWalk(entry))
  const everydayWalks = entries.filter(isEverydayWalk)
  const completedCount = adventureEntries.length
  const previewNodes = [
    {
      title: 'Beach walk',
      line: 'Photos, places, dates, and little moments will land here after you go.',
      imageUrl: SAMPLE_IMAGES.beach,
    },
    {
      title: 'Photo + note saved',
      line: 'Once you finish an outing, this becomes a saved day you can reopen.',
      imageUrl: SAMPLE_IMAGES.scenic,
    },
    {
      title: 'Favorite walk',
      line: 'Plan a few outings now, then PawStreak saves the best parts after you go.',
      imageUrl: SAMPLE_IMAGES.neighborhood,
    },
  ]

  return (
    <section className="journey-story journey-memory-path detail-card-warm" aria-label="Completed adventure path">
      <div className="journey-story-header">
        <div className="journey-story-header-top">
          <div className="journey-story-kicker">This month</div>
          <div className="journey-story-rank">
            <span className="journey-story-rank-label">Saved</span>
            <span className="journey-story-rank-value">{completedCount}</span>
          </div>
        </div>
        <h2 className="journey-story-title">The good days</h2>
        <p className="journey-story-line">
          {completedCount > 0
            ? `${completedCount} ${completedCount === 1 ? 'adventure' : 'adventures'} worth remembering.`
            : 'The first ridiculous little mission starts here.'}
        </p>
      </div>

      {adventureEntries.length > 0 ? (
        <div className="journey-memory-track">
          <div className="journey-memory-spine" aria-hidden="true" />
          {adventureEntries.map((entry, index) => {
            const side = index % 2 === 0 ? 'left' : 'right'
            const imageUrl = getJourneyEntryDisplayImageUrl(state.journeyEntries, entry)
            const photoCount = entry.photoUrls?.filter(Boolean).length ?? 0

            return (
              <article
                key={entry.id}
                className={`journey-memory-node journey-memory-node--${side}`}
              >
                <button
                  type="button"
                  className="journey-memory-card tap-target"
                  onClick={() => onOpenMemory?.(entry.id)}
                  disabled={!onOpenMemory}
                >
                  <span className="journey-memory-dot" aria-hidden="true">
                    {index + 1}
                  </span>
                  {photoCount > 0 ? (
                    <span className="journey-memory-photo-count" aria-label={`${photoCount} saved photos`}>
                      <i className="ti ti-camera" aria-hidden="true" />
                      {photoCount}
                    </span>
                  ) : null}
                  <img src={imageUrl} alt="" className="journey-memory-photo" />
                  <span className="journey-memory-copy">
                    <span className="journey-memory-date">{formatMemoryDate(entry)}</span>
                    <span className="journey-memory-title">{entry.place}</span>
                    <span className="journey-memory-line">
                      {entry.magicLine ?? entry.emotionalLine ?? 'Memory saved.'}
                    </span>
                  </span>
                </button>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="journey-memory-preview" data-testid="journey-memory-preview">
          <div className="journey-memory-preview-label">
            {everydayWalks.length > 0 ? 'Destination adventures start here' : 'Your map starts here'}
          </div>
          <p>
            {everydayWalks.length > 0
              ? 'Quick Walks are saved below. Pick a dog-friendly spot when you want a bigger memory on the adventure path.'
              : 'Your first adventure will create a path here. Places, photos, and notes build into a record of the days you shared.'}
          </p>
          <div className="journey-memory-track journey-memory-track--preview">
            <div className="journey-memory-spine" aria-hidden="true" />
            {previewNodes.map((node, index) => {
              const side = index % 2 === 0 ? 'left' : 'right'
              return (
                <article
                  key={node.title}
                  className={`journey-memory-node journey-memory-node--${side} journey-memory-node--preview`}
                >
                  <div className="journey-memory-card journey-memory-card--preview">
                    <span className="journey-memory-dot" aria-hidden="true">
                      {index + 1}
                    </span>
                    <img src={node.imageUrl} alt="" className="journey-memory-photo" />
                    <span className="journey-memory-copy">
                      <span className="journey-memory-date">Preview</span>
                      <span className="journey-memory-title">{node.title}</span>
                      <span className="journey-memory-line">{node.line}</span>
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
          <button
            type="button"
            className="st-btn st-btn--forest tap-target"
            onClick={() => {
              if (onGoToPlan) {
                onGoToPlan()
                return
              }
              onStartAdventure()
            }}
          >
            Go to Plan
          </button>
        </div>
      )}

      {everydayWalks.length > 0 ? (
        <section className="journey-everyday-walks" aria-label="Everyday walks">
          <div className="journey-everyday-head">
            <div>
              <div className="journey-story-kicker">Everyday walks</div>
              <h3>Quick Walks</h3>
            </div>
            <span>{everydayWalks.length}</span>
          </div>
          <p className="journey-everyday-copy">
            Usual-route walks keep the habit alive. They count for streaks and challenges without
            crowding the adventure map.
          </p>
          <div className="journey-everyday-list">
            {everydayWalks.slice(0, 4).map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="journey-everyday-row tap-target"
                onClick={() => onOpenMemory?.(entry.id)}
                disabled={!onOpenMemory}
              >
                <span className="journey-everyday-icon" aria-hidden="true">
                  <i className="ti ti-walk" />
                </span>
                <span className="journey-everyday-row-copy">
                  <strong>{formatMemoryDate(entry)}</strong>
                  <span>
                    {entry.durationLabel ?? 'Walk saved'}
                    {entry.photoUrls?.some(Boolean) ? ' · photo saved' : ''}
                  </span>
                </span>
                <i className="ti ti-chevron-right" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  )
}
