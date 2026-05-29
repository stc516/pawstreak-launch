import { useMemo, useState } from 'react'
import type { JourneyEntry } from '../data/demo'
import type { ChallengePathDefinition } from '../data/challengePaths'
import { NEIGHBORHOOD_WALK_PLACE_ID } from '../data/places'
import { resolveChallengePathNodes } from '../lib/challengePathProgress'
import type { ResolvedChallengeNode } from '../lib/challengePathProgress'
import { ChallengePath } from './ChallengePath'
import { ChallengeNodeDetail } from './ChallengeNodeDetail'

interface ChallengePathExperienceProps {
  path: ChallengePathDefinition
  journeyEntries: JourneyEntry[]
  isDemoMode?: boolean
  onStartAdventure: (placeId: string) => void
  onStartNeighborhoodWalk?: () => void
  onOpenMemory?: (entryId: string) => void
}

export function ChallengePathExperience({
  path,
  journeyEntries,
  isDemoMode = false,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenMemory,
}: ChallengePathExperienceProps) {
  const [selectedNode, setSelectedNode] = useState<ResolvedChallengeNode | null>(null)

  const nodes = useMemo(
    () => resolveChallengePathNodes(path, journeyEntries, isDemoMode),
    [path, journeyEntries, isDemoMode],
  )

  const handleStartFromNode = (placeId: string) => {
    setSelectedNode(null)
    if (placeId === NEIGHBORHOOD_WALK_PLACE_ID && onStartNeighborhoodWalk) {
      onStartNeighborhoodWalk()
      return
    }
    onStartAdventure(placeId)
  }

  const handleOpenMemoryFromNode = (entryId: string) => {
    setSelectedNode(null)
    onOpenMemory?.(entryId)
  }

  return (
    <>
      <ChallengePath path={path} nodes={nodes} onNodeSelect={setSelectedNode} />
      <ChallengeNodeDetail
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onStartAdventure={handleStartFromNode}
        onOpenMemory={onOpenMemory ? handleOpenMemoryFromNode : undefined}
      />
    </>
  )
}
