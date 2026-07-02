import { useMemo, useState } from 'react'
import type { AppState } from '../data/demo'
import type { Challenge } from '../data/challenges'
import {
  resolveChallenge,
  resolveChallengeNodes,
} from '../lib/challengeEngine'
import type { ResolvedChallengeNode } from '../lib/challengeEngine'
import { NEIGHBORHOOD_WALK_PLACE_ID } from '../data/places'
import { ChallengePath } from './ChallengePath'
import { ChallengeNodeDetail } from './ChallengeNodeDetail'

interface ChallengeStartOptions {
  durationLabel?: string
  startNow?: boolean
}

interface ChallengePathExperienceProps {
  challenge: Challenge
  state: AppState
  onStartAdventure: (placeId: string, options?: ChallengeStartOptions) => void
  onStartNeighborhoodWalk?: (durationLabel?: string) => void
  onOpenMemory?: (entryId: string) => void
}

export function ChallengePathExperience({
  challenge,
  state,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenMemory,
}: ChallengePathExperienceProps) {
  const [selectedNode, setSelectedNode] = useState<ResolvedChallengeNode | null>(null)

  const resolved = useMemo(
    () => resolveChallenge(challenge, state),
    [challenge, state],
  )

  const nodes = useMemo(
    () => resolveChallengeNodes(challenge, state),
    [challenge, state],
  )

  const handleOpenMemoryFromNode = (entryId: string) => {
    setSelectedNode(null)
    onOpenMemory?.(entryId)
  }

  return (
    <>
      <ChallengePath challenge={resolved} nodes={nodes} onNodeSelect={setSelectedNode} />
      <ChallengeNodeDetail
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onStartAdventure={(placeId, options) => {
          setSelectedNode(null)
          const durationLabel = options?.durationLabel
          if (!placeId || placeId === NEIGHBORHOOD_WALK_PLACE_ID) {
            if (onStartNeighborhoodWalk) {
              onStartNeighborhoodWalk(durationLabel)
              return
            }
            onStartAdventure(NEIGHBORHOOD_WALK_PLACE_ID, options)
            return
          }
          onStartAdventure(placeId, options)
        }}
        onOpenMemory={onOpenMemory ? handleOpenMemoryFromNode : undefined}
      />
    </>
  )
}
