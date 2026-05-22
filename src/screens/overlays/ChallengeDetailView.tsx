import type { Challenge } from '../../data/demo'
import { getChallengeDetail } from '../../data/challengeDetails'
import { CardImage } from '../../components/CardImage'
import { StatusBar } from '../../components/StatusBar'

interface ChallengeDetailViewProps {
  challenge: Challenge
  dogs?: import('../../data/demo').Dog[]
  onBack: () => void
}

export function ChallengeDetailView({
  challenge,
  dogs = [],
  onBack,
}: ChallengeDetailViewProps) {
  const detail = getChallengeDetail(challenge.id, dogs)
  if (!detail) return null

  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll scroll--overlay">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back" onClick={onBack}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Back
            </button>
          </div>

          <div className="chdetail-header detail-tint detail-tint--warm">
            <div className="chdetail-title">{challenge.name}</div>
            <div className="chdetail-progress-label">{detail.progressPercent}% complete</div>
          </div>

          <div className="chdetail-bar">
            <div
              className="chdetail-fill"
              style={{ width: `${detail.progressPercent}%` }}
            />
          </div>

          <div className="chdetail-motivation detail-quote-block">
            {detail.motivationalLines.map((line) => (
              <p key={line} className="detail-quote-text">
                {line}
              </p>
            ))}
          </div>

          <div className="chdetail-reward detail-card-warm">
            <div className="chdetail-reward-emoji">{detail.rewardEmoji}</div>
            <div>
              <div className="chdetail-reward-title">{detail.rewardTitle}</div>
              <div className="chdetail-reward-sub">{detail.rewardDescription}</div>
            </div>
          </div>

          <div className="sec">Completed</div>
          <div className="chdetail-places detail-card-warm">
            {detail.completedPlaces.map((place) => (
              <div key={place.id} className="chdetail-place chdetail-place--done">
                <i className="ti ti-circle-check" aria-hidden="true" />
                {place.name}
              </div>
            ))}
          </div>

          <div className="sec">Still to go</div>
          <div className="chdetail-places detail-card-warm">
            {detail.remainingPlaces.map((place) => (
              <div key={place.id} className="chdetail-place">
                <i className="ti ti-circle-dashed" aria-hidden="true" />
                {place.name}
              </div>
            ))}
          </div>

          <div className="chdetail-next">
            <div className="sec">Suggested next adventure</div>
            <div className="chdetail-next-card detail-card-warm">
              <CardImage
                className="chdetail-next-img"
                imageUrl={detail.suggestedNext.imageUrl}
                imageAlt={detail.suggestedNext.name}
                imageTone="coastal"
              />
              <div className="chdetail-next-body">
                <div className="chdetail-next-name">{detail.suggestedNext.name}</div>
                <div className="chdetail-next-reason">{detail.suggestedNext.reason}</div>
              </div>
            </div>
          </div>

          <div className="sec">Challenge stats</div>
          <div className="chdetail-stats">
            {detail.stats.map((stat) => (
              <div key={stat.label} className="chdetail-stat">
                <div className="chdetail-stat-value">{stat.value}</div>
                <div className="chdetail-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="sec">Memories from this challenge</div>
          <div className="memory-photos chdetail-memories">
            {detail.memoryThumbnails.map((url) => (
              <div key={url} className="memory-photo">
                <img src={url} alt="" className="memory-photo-img" />
              </div>
            ))}
          </div>

          <div className="sec">Dogs from the pack doing this challenge</div>
          <div className="chdetail-pack">
            {detail.packDogs.map((dog) => (
              <div key={dog.name} className="chdetail-pack-dog">
                <div className="chdetail-pack-avatar">{dog.initial}</div>
                <div>
                  <div className="chdetail-pack-name">{dog.name}</div>
                  <div className="chdetail-pack-progress">{dog.progress}</div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
