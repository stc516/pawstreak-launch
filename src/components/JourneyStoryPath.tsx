import type { AppState } from '../data/demo'
import { resolveDogProgression } from '../lib/dogProgressionEngine'
import { JourneyStoryNodeCard } from './JourneyStoryNodeCard'

interface JourneyStoryPathProps {
  state: AppState
  onOpenMemory?: (entryId: string) => void
  onStartAdventure: () => void
  onGoToPlan?: () => void
}

export function JourneyStoryPath({
  state,
  onOpenMemory,
  onStartAdventure,
  onGoToPlan,
}: JourneyStoryPathProps) {
  const progression = resolveDogProgression(state)

  return (
    <section className="journey-story detail-card-warm" aria-label="Dog life story path">
      <div className="journey-story-header">
        <div>
          <div className="journey-story-kicker">Life story</div>
          <h2 className="journey-story-title">{progression.title}</h2>
          <p className="journey-story-line">{progression.summary.storyLine}</p>
        </div>
        <div className="journey-story-rank">
          <div className="journey-story-rank-label">Rank</div>
          <div className="journey-story-rank-value">{progression.summary.rank}</div>
        </div>
      </div>

      <div className="journey-story-progress">
        <div className="journey-story-progress-meta">
          <span>
            {progression.summary.chaptersCompleted}/{progression.summary.chaptersTotal} chapters
          </span>
          <span>{progression.summary.nextUnlock}</span>
        </div>
        <div className="journey-story-progress-bar">
          <div
            className="journey-story-progress-fill"
            style={{ width: progression.summary.fillWidth }}
          />
        </div>
      </div>

      <div className="journey-story-track">
        <div className="journey-story-spine" aria-hidden="true" />
        {progression.nodes.map((node) => (
          <JourneyStoryNodeCard
            key={node.id}
            node={node}
            journeyEntries={state.journeyEntries}
            onOpenMemory={onOpenMemory}
            onStartAdventure={onStartAdventure}
            onGoToPlan={onGoToPlan}
          />
        ))}
      </div>
    </section>
  )
}
