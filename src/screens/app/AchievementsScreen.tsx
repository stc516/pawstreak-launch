import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import type { Achievement } from '../../data/achievements'
import { resolveAchievementsByCategory } from '../../lib/achievementEngine'
import { AchievementIdentityCard } from '../../components/AchievementIdentityCard'
import { AdventureGuideDog } from '../../components/AdventureGuideDog'

interface AchievementsScreenProps {
  state: AppState
  onOpenAchievement: (achievementId: string) => void
}

function sortAchievements(items: Achievement[]): Achievement[] {
  const rank = { done: 0, active: 1, locked: 2 } as const
  return [...items].sort((left, right) => rank[left.status] - rank[right.status])
}

export function AchievementsScreen({ state, onOpenAchievement }: AchievementsScreenProps) {
  const grouped = useMemo(() => resolveAchievementsByCategory(state), [state])
  const earned = useMemo(
    () => sortAchievements(grouped.flatMap((group) => group.achievements.filter((item) => item.status === 'done'))),
    [grouped],
  )
  const inProgress = useMemo(
    () => sortAchievements(grouped.flatMap((group) => group.achievements.filter((item) => item.status === 'active'))),
    [grouped],
  )
  const available = useMemo(
    () => sortAchievements(grouped.flatMap((group) => group.achievements.filter((item) => item.status === 'locked'))),
    [grouped],
  )
  const earnedPreview = earned.slice(0, 3)
  const availablePreview = available.slice(0, 4)

  return (
    <>
      <header className="achievements-hero">
        <div>
          <button type="button" className="settings-back settings-back--stitch tap-target" aria-label="Rewards">
            <i className="ti ti-medal" aria-hidden="true" />
          </button>
          <h1>Rewards</h1>
          <p>Badges earned, progress underway, and clear next steps from real adventures.</p>
        </div>
        <AdventureGuideDog className="achievements-guide-dog" withBurst />
      </header>

      <section className="achievements-section">
        <div className="st-section-head">
          <h2 className="st-headline-md">Earned</h2>
          {earned.length > earnedPreview.length ? (
            <span className="achievements-section-count">
              {earned.length} total
            </span>
          ) : null}
        </div>
        {earned.length > 0 ? (
          <div className="achievements-earned-strip">
            {earnedPreview.map((achievement) => (
              <AchievementIdentityCard
                key={achievement.id}
                achievement={achievement}
                variant="bento"
                onClick={() => onOpenAchievement(achievement.id)}
              />
            ))}
          </div>
        ) : (
          <div className="achievements-empty detail-card-warm">
            <div className="achievements-empty-kicker">Preview</div>
            <strong>Your first rewards unlock after real outings.</strong>
            <p>
              Finish your first adventure, save a photo, or keep a weekly walk rhythm.
              Rewards stay locked until the real action is completed.
            </p>
          </div>
        )}
      </section>

      {inProgress.length > 0 ? (
        <section className="achievements-section">
          <div className="st-section-head">
            <h2 className="st-headline-md">In progress</h2>
          </div>
          <div className="achievements-progress-list">
            {inProgress.map((achievement) => (
              <button
                key={achievement.id}
                type="button"
                className="achievements-progress-card detail-card-warm tap-target"
                onClick={() => onOpenAchievement(achievement.id)}
              >
                <div className="achievements-progress-title">
                  <span aria-hidden="true">{achievement.emoji}</span> {achievement.title}
                </div>
                <div className="achievements-progress-meta">
                  {achievement.progress.current} of {achievement.progress.target}
                </div>
                <div className="achievements-progress-bar">
                  <div
                    className="achievements-progress-fill"
                    style={{
                      width: `${Math.round((achievement.progress.current / achievement.progress.target) * 100)}%`,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="achievements-section">
        <div className="st-section-head">
          <h2 className="st-headline-md">Available to Earn</h2>
          {available.length > availablePreview.length ? (
            <span className="achievements-section-count">
              {availablePreview.length} of {available.length}
            </span>
          ) : null}
        </div>
        <div className="achievements-available-grid">
          {availablePreview.map((achievement) => (
            <button
              key={achievement.id}
              type="button"
              className="achievements-badge-card tap-target"
              onClick={() => onOpenAchievement(achievement.id)}
            >
              <span className="achievements-badge-medal" aria-hidden="true">{achievement.emoji}</span>
              <span className="achievements-badge-copy">
                <strong>{achievement.title}</strong>
                <small>{achievement.subtitle}</small>
                <span className="achievements-badge-progress">
                  <span
                    style={{
                      width: `${Math.round((achievement.progress.current / achievement.progress.target) * 100)}%`,
                    }}
                  />
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
