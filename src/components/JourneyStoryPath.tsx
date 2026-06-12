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
    <section className="journey-story detail-card-warm" aria-label="Monthly memory path">
      <div className="journey-story-header">
        <div className="journey-story-header-top">
          <div className="journey-story-kicker">This month</div>
          <div className="journey-story-rank">
            <span className="journey-story-rank-label">Memory mode</span>
            <span className="journey-story-rank-value">{progression.summary.rank}</span>
          </div>
        </div>
        <h2 className="journey-story-title">Completed adventures</h2>
        <p className="journey-story-line">
          {state.journeyEntries.length > 0
            ? `${state.journeyEntries.length} completed ${state.journeyEntries.length === 1 ? 'outing' : 'outings'} saved this month.`
            : 'No completed outings yet this month.'}
        </p>
      </div>

      <div className="journey-story-progress">
        <div className="journey-story-progress-meta">
          <span>
            {state.journeyEntries.length} completed
          </span>
          <span>{state.journeyEntries.length > 0 ? 'Tap a scene' : 'Start from Plan'}</span>
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
