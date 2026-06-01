import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import type { Achievement } from '../../data/achievements'
import { resolveAchievementsByCategory } from '../../lib/achievementEngine'
import { AchievementIdentityCard } from '../../components/AchievementIdentityCard'

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
  const locked = useMemo(
    () => sortAchievements(grouped.flatMap((group) => group.achievements.filter((item) => item.status === 'locked'))),
    [grouped],
  )

  return (
    <>
      <div className="aheader achievements-header">
        <div className="alogo">Achievements</div>
        <p className="achievements-lead">
          Earned tags from real adventures — progress and locked badges stay honest.
        </p>
      </div>

      <section className="achievements-section">
        <div className="st-section-head">
          <h2 className="st-headline-md">Earned</h2>
        </div>
        {earned.length > 0 ? (
          <div className="st-enamel-grid">
            {earned.map((achievement) => (
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
            Your first achievements unlock after real outings — start with a Quick Walk or adventure.
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
          <h2 className="st-headline-md">Locked</h2>
        </div>
        <div className="achievements-locked-list">
          {locked.slice(0, 8).map((achievement) => (
            <button
              key={achievement.id}
              type="button"
              className="achievements-locked-row tap-target"
              onClick={() => onOpenAchievement(achievement.id)}
            >
              <span className="achievements-locked-emoji" aria-hidden="true">
                {achievement.emoji}
              </span>
              <span className="achievements-locked-copy">
                <span className="achievements-locked-title">{achievement.title}</span>
                <span className="achievements-locked-sub">{achievement.subtitle}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
