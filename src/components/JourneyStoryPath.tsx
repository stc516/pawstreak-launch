import type { AppState, JourneyEntry } from '../data/demo'
import { SAMPLE_IMAGES } from '../data/sampleImages'
import { getJourneyEntryDisplayImageUrl } from '../lib/adventureDisplayImage'

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

export function JourneyStoryPath({
  state,
  onOpenMemory,
  onStartAdventure,
  onGoToPlan,
}: JourneyStoryPathProps) {
  const entries = [...state.journeyEntries].sort(
    (left, right) => parseEntryTimestamp(right) - parseEntryTimestamp(left),
  )
  const completedCount = entries.length
  const previewNodes = [
    {
      title: 'Example: beach walk',
      line: 'Photos, places, dates, and little moments will land here after a real outing.',
      imageUrl: SAMPLE_IMAGES.beach,
    },
    {
      title: 'Example: 3 photos + note',
      line: 'Once you finish an outing, this becomes a tappable memory scene.',
      imageUrl: SAMPLE_IMAGES.scenic,
    },
    {
      title: 'Example: favorite walk',
      line: 'Plan a few outings now, then PawStreak turns them into memories after you go.',
      imageUrl: SAMPLE_IMAGES.neighborhood,
    },
  ]

  return (
    <section className="journey-story journey-memory-path detail-card-warm" aria-label="Completed memory path">
      <div className="journey-story-header">
        <div className="journey-story-header-top">
          <div className="journey-story-kicker">This month</div>
          <div className="journey-story-rank">
            <span className="journey-story-rank-label">Saved</span>
            <span className="journey-story-rank-value">{completedCount}</span>
          </div>
        </div>
        <h2 className="journey-story-title">Memory path</h2>
        <p className="journey-story-line">
          {completedCount > 0
            ? `${completedCount} completed ${completedCount === 1 ? 'outing' : 'outings'} saved.`
            : 'No completed outings yet this month.'}
        </p>
      </div>

      {entries.length > 0 ? (
        <div className="journey-memory-track">
          <div className="journey-memory-spine" aria-hidden="true" />
          {entries.map((entry, index) => {
            const side = index % 2 === 0 ? 'left' : 'right'
            const imageUrl = getJourneyEntryDisplayImageUrl(state.journeyEntries, entry)

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
          <div className="journey-memory-preview-label">Preview only</div>
          <p>
            Your first adventure will create a memory path here. Outings become scenes,
            photos become cards, and the monthly path builds over time.
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
                      <span className="journey-memory-date">Example</span>
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
    </section>
  )
}
