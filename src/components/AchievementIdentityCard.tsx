import type { Achievement } from '../data/achievements'
import { getIdentityProgressLabel } from '../lib/achievementEngine'
import { CardImage } from './CardImage'

interface AchievementIdentityCardProps {
  achievement: Achievement
  onClick: () => void
  compact?: boolean
  variant?: 'default' | 'bento'
}

export function AchievementIdentityCard({
  achievement,
  onClick,
  compact = false,
  variant = 'default',
}: AchievementIdentityCardProps) {
  const statusLabel =
    achievement.status === 'done'
      ? 'Earned'
      : achievement.status === 'active'
        ? 'In progress'
        : 'Locked'

  if (variant === 'bento') {
    const locked = achievement.status === 'locked'
    return (
      <button
        type="button"
        className={`st-enamel-tile identity-card identity-card--tap identity-card--${achievement.status} tap-target${locked ? ' st-enamel-tile--locked' : ''}`}
        onClick={onClick}
      >
        <div className="st-enamel-badge">
          <span className="st-enamel-badge-pin" aria-hidden="true" />
          <CardImage
            className="st-enamel-badge-img"
            imageUrl={achievement.badgeImageUrl}
            imageAlt=""
            imageTone="warm"
          />
        </div>
        <span className="st-enamel-tile-title">{locked ? 'Locked' : achievement.title}</span>
      </button>
    )
  }

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
