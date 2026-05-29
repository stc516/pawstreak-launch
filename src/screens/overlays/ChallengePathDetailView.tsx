import type { JourneyEntry } from '../../data/demo'
import type { ChallengePathDefinition } from '../../data/challengePaths'
import { ChallengePathExperience } from '../../components/ChallengePathExperience'

interface ChallengePathDetailViewProps {
  path: ChallengePathDefinition
  journeyEntries: JourneyEntry[]
  isDemoMode?: boolean
  onBack: () => void
  onStartAdventure: (placeId: string) => void
  onStartNeighborhoodWalk?: () => void
  onOpenMemory?: (entryId: string) => void
}

export function ChallengePathDetailView({
  path,
  journeyEntries,
  isDemoMode = false,
  onBack,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenMemory,
}: ChallengePathDetailViewProps) {
  return (
    <>
      <div className="overlay-topbar">
        <button type="button" className="overlay-back tap-target" onClick={onBack}>
          <i className="ti ti-arrow-left" aria-hidden="true" />
          Back
        </button>
      </div>

      <div className="challenge-path-detail-intro detail-tint detail-tint--warm">
        <div className="challenge-path-detail-kicker">Challenge path</div>
        <h1 className="challenge-path-detail-title">{path.title}</h1>
        <p className="challenge-path-detail-copy">{path.description}</p>
      </div>

      <ChallengePathExperience
        path={path}
        journeyEntries={journeyEntries}
        isDemoMode={isDemoMode}
        onStartAdventure={onStartAdventure}
        onStartNeighborhoodWalk={onStartNeighborhoodWalk}
        onOpenMemory={onOpenMemory}
      />
    </>
  )
}
