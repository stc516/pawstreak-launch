import type { Achievement } from '../../data/achievements'
import { getAchievementDetail } from '../../data/achievementDetails'
import { CardImage } from '../../components/CardImage'
import { StatusBar } from '../../components/StatusBar'

interface AchievementDetailViewProps {
  achievement: Achievement
  dogs?: import('../../data/demo').Dog[]
  onBack: () => void
}

export function AchievementDetailView({
  achievement,
  dogs = [],
  onBack,
}: AchievementDetailViewProps) {
  const detail = getAchievementDetail(achievement, dogs)

  const statusClass =
    achievement.status === 'done'
      ? 'achdetail-status--done'
      : achievement.status === 'active'
        ? 'achdetail-status--active'
        : 'achdetail-status--locked'

  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll scroll--overlay">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back tap-target" onClick={onBack}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Back
            </button>
          </div>

          <div className="achdetail-hero detail-tint detail-tint--warm">
            <CardImage
              className="achdetail-hero-badge"
              imageUrl={achievement.badgeImageUrl}
              imageAlt=""
              imageTone="warm"
            />
            <div className="achdetail-hero-emoji">{achievement.emoji}</div>
            <div className="achdetail-title">{achievement.title}</div>
            <div className={`achdetail-status ${statusClass}`}>
              {detail.statusLabel}
            </div>
          </div>

          <div className="detail-quote-block">
            <p className="detail-quote-text">{detail.emotionalExplanation}</p>
          </div>

          {detail.dateEarned ? (
            <div className="detail-card-warm achdetail-meta">
              <div className="detail-section-label">Unlock date</div>
              <div className="achdetail-meta-value">{detail.dateEarned}</div>
            </div>
          ) : null}

          {detail.progressLabel ? (
            <div className="detail-card-warm achdetail-progress-block">
              <div className="detail-section-label">Progress</div>
              <div className="achdetail-meta-value">{detail.progressLabel}</div>
              {detail.progressPercent !== undefined ? (
                <div className="achdetail-bar">
                  <div
                    className="achdetail-fill"
                    style={{ width: `${detail.progressPercent}%` }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {detail.unlockSteps && detail.unlockSteps.length > 0 ? (
            <>
              <div className="sec">How to unlock</div>
              <ul className="achdetail-unlock-list detail-card-warm">
                {detail.unlockSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </>
          ) : null}

          <div className="achdetail-reward detail-card-warm">
            <div className="achdetail-reward-emoji">{detail.rewardEmoji}</div>
            <div>
              <div className="achdetail-reward-title">{detail.rewardTitle}</div>
              <div className="achdetail-reward-sub">{detail.rewardDescription}</div>
            </div>
          </div>

          {detail.relatedMemories.length > 0 ? (
            <>
              <div className="sec">Related memories</div>
              {detail.relatedMemories.map((memory) => (
                <div key={memory.placeName} className="achdetail-memory detail-card-warm">
                  <CardImage
                    className="achdetail-memory-img"
                    imageUrl={memory.imageUrl}
                    imageAlt={memory.placeName}
                    imageTone="warm"
                  />
                  <div className="achdetail-memory-body">
                    <div className="achdetail-memory-place">{memory.placeName}</div>
                    {memory.date ? (
                      <div className="achdetail-memory-date">{memory.date}</div>
                    ) : null}
                    <div className="achdetail-memory-caption">{memory.caption}</div>
                  </div>
                </div>
              ))}
            </>
          ) : null}

          <div className="sec">Suggested next action</div>
          <div className="achdetail-next detail-card-warm">
            {detail.suggestedAction.imageUrl ? (
              <CardImage
                className="achdetail-next-img"
                imageUrl={detail.suggestedAction.imageUrl}
                imageAlt={detail.suggestedAction.placeName ?? detail.suggestedAction.label}
                imageTone="coastal"
              />
            ) : null}
            <div className="achdetail-next-body">
              <div className="achdetail-next-label">{detail.suggestedAction.label}</div>
              {detail.suggestedAction.placeName ? (
                <div className="achdetail-next-place">{detail.suggestedAction.placeName}</div>
              ) : null}
              <div className="achdetail-next-desc">{detail.suggestedAction.description}</div>
              <div className="achdetail-next-cta">Easy win · tap Plan to go</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
