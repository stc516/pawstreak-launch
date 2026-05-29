import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel } from '../../lib/profileDisplay'
import { CardImage } from '../../components/CardImage'
import { getJourneyEntryDisplayImageUrl } from '../../lib/adventureDisplayImage'
import { resolveJoinedChallenges } from '../../lib/challengeEngine'

interface CommunityScreenProps {
  state: AppState
  onOpenChallenge?: (challengeId: string) => void
  onOpenMemory?: (entryId: string) => void
}

export function CommunityScreen({
  state,
  onOpenChallenge,
  onOpenMemory,
}: CommunityScreenProps) {
  const dogLabel = getDisplayDogLabel(state)
  const joinedChallenges = useMemo(() => resolveJoinedChallenges(state), [state])
  const recentAdventures = state.journeyEntries.slice(0, 4)
  const packPosts = state.communityPosts.slice(0, 3)

  return (
    <>
      <div className="aheader">
        <div className="alogo">Community</div>
      </div>

      <p className="comm-activity-lead">
        Recent adventures, challenge momentum, and pack wins — starting with {dogLabel}.
      </p>

      <section className="comm-activity-section">
        <h2 className="home-strip-label">Your recent adventures</h2>
        {recentAdventures.length === 0 ? (
          <div className="comm-activity-empty detail-card-warm">
            Finish an adventure and it will show up here for your pack.
          </div>
        ) : (
          <div className="comm-activity-list">
            {recentAdventures.map((entry) => {
              const imageUrl = getJourneyEntryDisplayImageUrl(state.journeyEntries, entry)
              return (
                <button
                  key={entry.id}
                  type="button"
                  className="comm-activity-card tap-target"
                  onClick={() => onOpenMemory?.(entry.id)}
                >
                  <CardImage
                    className="comm-activity-photo"
                    imageUrl={imageUrl}
                    imageAlt={entry.place}
                    imageTone="warm"
                  />
                  <div className="comm-activity-body">
                    <div className="comm-activity-place">{entry.place}</div>
                    <div className="comm-activity-meta">{entry.date}</div>
                    {entry.magicLine ? (
                      <div className="comm-activity-line">{entry.magicLine}</div>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      <section className="comm-activity-section">
        <h2 className="home-strip-label">Challenge activity</h2>
        {joinedChallenges.length === 0 ? (
          <div className="comm-activity-empty detail-card-warm">
            Join a challenge from Milestones to track progress here.
          </div>
        ) : (
          <div className="comm-activity-list">
            {joinedChallenges.map((challenge) => (
              <button
                key={challenge.id}
                type="button"
                className="comm-activity-card comm-activity-card--challenge tap-target"
                onClick={() => onOpenChallenge?.(challenge.id)}
              >
                <div className="comm-activity-body">
                  <div className="comm-activity-place">{challenge.title}</div>
                  <div className="comm-activity-meta">
                    {challenge.progress.metricValue}/{challenge.progress.metricTarget} ·{' '}
                    {challenge.progress.completedNodes}/{challenge.progress.totalNodes} stops
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="comm-activity-section">
        <h2 className="home-strip-label">Local pack activity</h2>
        {packPosts.length === 0 ? (
          <div className="comm-activity-empty detail-card-warm">
            When friends join PawStreak, their wins will appear here.
          </div>
        ) : (
          <div className="comm-activity-list">
            {packPosts.map((post) => (
              <article key={post.id} className="comm-activity-card comm-activity-card--post detail-card-warm">
                <div className="comm-activity-post-head">
                  <div className={`cp-av ${post.avatarClass}`}>{post.initial}</div>
                  <div>
                    <div className="comm-activity-place">{post.name}</div>
                    <div className="comm-activity-meta">{post.meta}</div>
                  </div>
                </div>
                <div className="comm-activity-line">{post.caption}</div>
                <div className="comm-activity-meta">{post.location}</div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
