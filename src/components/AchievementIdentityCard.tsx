import type { Achievement } from '../data/achievements'
import { getIdentityProgressLabel } from '../lib/achievementEngine'
import { CardImage } from './CardImage'

interface AchievementIdentityCardProps {
  achievement: Achievement
  onClick: () => void
  compact?: boolean
}

export function AchievementIdentityCard({
  achievement,
  onClick,
  compact = false,
}: AchievementIdentityCardProps) {
  const statusLabel =
    achievement.status === 'done'
      ? 'Earned'
      : achievement.status === 'active'
        ? 'In progress'
        : 'Locked'

  return (
    <button
      type="button"
      className={`identity-card identity-card--tap identity-card--${achievement.status} tap-target${compact ? ' identity-card--compact' : ''}`}
      onClick={onClick}
    >
      <div className="identity-card-badge-wrap">
        <CardImage
          className="identity-card-badge-img"
          imageUrl={achievement.badgeImageUrl}
          imageAlt=""
          imageTone="warm"
        />
        <span className="identity-card-emoji" aria-hidden="true">
          {achievement.emoji}
        </span>
      </div>
      <div className="identity-card-copy">
        <div className="identity-card-title">{achievement.title}</div>
        <p className="identity-card-personality">{achievement.personalityLine}</p>
        <div
          className={`identity-card-progress${achievement.progress.unlocked ? ' identity-card-progress--done' : ''}`}
        >
          {achievement.progress.unlocked
            ? achievement.subtitle
            : getIdentityProgressLabel(achievement)}
        </div>
      </div>
      <span className={`identity-card-status identity-card-status--${achievement.status}`}>
        {statusLabel}
      </span>
    </button>
  )
}
