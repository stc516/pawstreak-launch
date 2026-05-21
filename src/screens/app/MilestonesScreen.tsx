import type { AppState } from '../../data/demo'

interface MilestonesScreenProps {
  state: AppState
  onOpenChallenge: (challengeId: string) => void
}

export function MilestonesScreen({ state, onOpenChallenge }: MilestonesScreenProps) {
  return (
    <>
      <div className="aheader">
        <div className="alogo">Milestones</div>
      </div>

      <div className="ms-bond">
        <div className="msb-top">
          <div className="msb-label">{state.bondLevel.label}</div>
          <div className="msb-rank">{state.bondLevel.rank}</div>
        </div>
        <div className="msb-bar">
          <div
            className="msb-fill"
            style={{ width: state.bondLevel.fillWidth }}
          />
        </div>
        <div className="msb-sub">{state.bondLevel.subtitle}</div>
      </div>

      <div className="sec">Active challenges</div>

      {state.challenges.map((challenge) => (
        <button
          key={challenge.id}
          type="button"
          className="challenge challenge--tap"
          onClick={() => onOpenChallenge(challenge.id)}
        >
          <div className="ch-top">
            <div className="ch-name">{challenge.name}</div>
            <div className="ch-prog">{challenge.progress}</div>
          </div>
          <div className="ch-bar">
            <div
              className="ch-fill"
              style={{ width: challenge.fillWidth }}
            />
          </div>
          <div className="ch-sub">{challenge.subtitle}</div>
          <div className="ch-prize">
            <i className="ti ti-gift" aria-hidden="true" />
            {challenge.prize}
          </div>
        </button>
      ))}

      <div className="sec">Achievements</div>

      {state.achievements.map((achievement) => (
        <div key={achievement.id} className={`ach-item ${achievement.status}`}>
          <div className="ach-ico">{achievement.emoji}</div>
          <div>
            <div className="ach-title">{achievement.title}</div>
            <div className="ach-sub">{achievement.subtitle}</div>
          </div>
          <div className={`ach-badge ${achievement.status}`}>
            {achievement.badge}
          </div>
        </div>
      ))}
    </>
  )
}
