import type { AppState } from '../../data/demo'
import { dogNamesLabel } from '../../data/demo'

interface HomeScreenProps {
  state: AppState
  onSelectActivity: (activityId: string) => void
  onStartAdventure: (location: string) => void
  onOpenProfile: () => void
}

export function HomeScreen({
  state,
  onSelectActivity,
  onStartAdventure,
  onOpenProfile,
}: HomeScreenProps) {
  return (
    <>
      <div className="aheader">
        <div className="alogo">
          Paw<span>Streak</span>
        </div>
        <button type="button" className="two-dogs" onClick={onOpenProfile}>
          {state.dogs.map((dog) => (
            <div key={dog.id} className={`dog-av ${dog.avatarClass}`}>
              {dog.initial}
            </div>
          ))}
          <span className="dog-names">{dogNamesLabel(state.dogs)}</span>
        </button>
      </div>

      <div className="streak-bar">
        <div>
          <div className="snum">{state.streak}</div>
          <div className="slabel">day streak</div>
        </div>
        <div className="snudge">Walk them today</div>
      </div>

      <div className="sec">What are we doing today?</div>

      <div className="chips">
        {state.activities.map((activity) => (
          <button
            key={activity.id}
            type="button"
            className={`chip${state.selectedActivityId === activity.id ? ' on' : ''}`}
            onClick={() => onSelectActivity(activity.id)}
          >
            <span className="cico">{activity.emoji}</span>
            <span className="clbl">{activity.label}</span>
          </button>
        ))}
      </div>

      <div className="hero-card">
        <div className="hc-top">
          <div>
            <div className="hc-title">{state.heroSpot.title}</div>
            <div className="hc-sub">{state.heroSpot.subtitle}</div>
          </div>
          <div className="hc-badge">{state.heroSpot.badge}</div>
        </div>
        <div className="qbtns">
          {state.durations.map((duration) => (
            <button
              key={duration}
              type="button"
              className="qb"
              onClick={() => onStartAdventure(state.heroSpot.title)}
            >
              {duration}
            </button>
          ))}
        </div>
      </div>

      <div className="sec">Recent adventures</div>

      <div className="mstrip">
        {state.recentAdventures.map((adventure) => (
          <div key={adventure.title} className="mthumb">
            <div className="mtlbl">{adventure.title}</div>
            <div className="mttag">{adventure.tag}</div>
          </div>
        ))}
      </div>

      <div className="stats3">
        <div className="sc">
          <div className="sn">{state.streak}</div>
          <div className="sl">day streak</div>
        </div>
        <div className="sc">
          <div className="sn">{state.adventureCount}</div>
          <div className="sl">adventures</div>
        </div>
        <div className="sc">
          <div className="sn">{state.placeCount}</div>
          <div className="sl">places</div>
        </div>
      </div>
    </>
  )
}
