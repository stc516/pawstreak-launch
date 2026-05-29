import type { AppState } from '../../data/demo'
import { getDisplayBondSubtitle, getDisplayDogLabel } from '../../lib/profileDisplay'
import { LIVE_PRODUCT } from '../../lib/liveProductFeatures'
import { StatusBar } from '../../components/StatusBar'

interface JourneyLevelDetailViewProps {
  state: AppState
  onBack: () => void
}

export function JourneyLevelDetailView({ state, onBack }: JourneyLevelDetailViewProps) {
  const dogLabel = getDisplayDogLabel(state)
  const title =
    dogLabel === 'Your dogs' || dogLabel === 'Your pack'
      ? 'Your Journey Level'
      : `${dogLabel}'s Journey Level`

  return (
    <div className="app-viewport">
      <div className="app-shell">
        {LIVE_PRODUCT.statusBarChrome ? <StatusBar /> : null}
        <main className="scroll scroll--overlay">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back tap-target" onClick={onBack}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Back
            </button>
          </div>

          <div className="jl-detail-hero detail-tint detail-tint--warm">
            <div className="jl-detail-kicker">{state.bondLevel.label}</div>
            <h1 className="jl-detail-title">{title}</h1>
            <p className="jl-detail-copy">
              Every adventure, photo, and place adds to their story.
            </p>
            <div className="jl-detail-rank-row">
              <span className="jl-detail-rank">{state.bondLevel.rank}</span>
              <span className="jl-detail-rank-note">Current rank</span>
            </div>
          </div>

          {LIVE_PRODUCT.bondProgressBar ? (
            <div className="jl-detail-bar">
              <div
                className="jl-detail-fill"
                style={{ width: state.bondLevel.fillWidth }}
              />
            </div>
          ) : null}

          <div className="jl-detail-stats detail-card-warm">
            <div className="jl-detail-stat">
              <div className="jl-detail-stat-value">{state.adventureCount}</div>
              <div className="jl-detail-stat-label">adventures saved</div>
            </div>
            <div className="jl-detail-stat">
              <div className="jl-detail-stat-value">{state.placeCount}</div>
              <div className="jl-detail-stat-label">places discovered</div>
            </div>
            <div className="jl-detail-stat">
              <div className="jl-detail-stat-value">{state.streak}</div>
              <div className="jl-detail-stat-label">day streak</div>
            </div>
            <div className="jl-detail-stat">
              <div className="jl-detail-stat-value">{state.bondLevel.beachDays}</div>
              <div className="jl-detail-stat-label">beach days</div>
            </div>
          </div>

          <div className="jl-detail-meta detail-card-warm">
            <div className="jl-detail-meta-row">
              <span>Favorite category</span>
              <strong>{state.bondLevel.favoriteCategory}</strong>
            </div>
            <div className="jl-detail-meta-row">
              <span>Memories saved</span>
              <strong>{state.adventureCount}</strong>
            </div>
            <div className="jl-detail-meta-row">
              <span>Progress</span>
              <strong>{getDisplayBondSubtitle(state)}</strong>
            </div>
          </div>

          <div className="jl-detail-unlock detail-card-warm">
            <div className="jl-detail-unlock-label">Next unlock</div>
            <div className="jl-detail-unlock-rank">{state.bondLevel.nextRank}</div>
            <p className="jl-detail-unlock-copy">{state.bondLevel.nextUnlock}</p>
          </div>

          {state.bondLevel.recentMoments.length > 0 ? (
            <>
              <div className="sec">Recent milestone moments</div>
              <div className="jl-detail-moments">
                {state.bondLevel.recentMoments.map((moment) => (
                  <div key={moment.title} className="jl-detail-moment detail-card-warm">
                    <div className="jl-detail-moment-emoji" aria-hidden="true">
                      {moment.emoji}
                    </div>
                    <div>
                      <div className="jl-detail-moment-title">{moment.title}</div>
                      <div className="jl-detail-moment-sub">{moment.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          <p className="jl-detail-motivation detail-quote-block">
            Small adventures add up. You&apos;re building a story worth keeping.
          </p>
        </main>
      </div>
    </div>
  )
}
