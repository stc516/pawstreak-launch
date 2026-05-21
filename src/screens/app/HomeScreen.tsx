import type { AppState } from '../../data/demo'
import { dogNamesLabel } from '../../data/demo'
import { CardImage } from '../../components/CardImage'
import {
  formatHeroSubtitle,
  getHeroBadge,
  getHeroPlace,
  getMagicLine,
  getPlaceById,
} from '../../data/places'

interface HomeScreenProps {
  state: AppState
  onSelectActivity: (activityId: string) => void
  onStartAdventure: (placeId: string, durationLabel: string) => void
  onOpenProfile: () => void
}

export function HomeScreen({
  state,
  onSelectActivity,
  onStartAdventure,
  onOpenProfile,
}: HomeScreenProps) {
  const heroPlace = getHeroPlace(state.selectedActivityId)
  const heroBadge = getHeroBadge(heroPlace)

  return (
    <>
      <div className="aheader">
        <div className="alogo">
          Paw<span>Streak</span>
        </div>
        <button type="button" className="two-dogs tap-target" onClick={onOpenProfile}>
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
            className={`chip tap-target${state.selectedActivityId === activity.id ? ' on' : ''}`}
            onClick={() => onSelectActivity(activity.id)}
          >
            <span className="cico">{activity.emoji}</span>
            <span className="clbl">{activity.label}</span>
          </button>
        ))}
      </div>

      <div key={heroPlace.id} className="hero-card hero-card--interactive">
        <CardImage
          className="hero-card-img"
          imageUrl={heroPlace.imageUrl}
          imageAlt={heroPlace.imageAlt}
          imageTone={heroPlace.imageTone}
        />
        <div className="hc-top">
          <div>
            <div className="hc-title">{heroPlace.name}</div>
            <div className="hc-sub">{formatHeroSubtitle(heroPlace)}</div>
          </div>
          {heroBadge ? <div className="hc-badge">{heroBadge}</div> : null}
        </div>
        <div className="qbtns">
          {state.durations.map((duration) => (
            <button
              key={duration}
              type="button"
              className="qb tap-target"
              onClick={() => onStartAdventure(heroPlace.id, duration)}
            >
              {duration}
            </button>
          ))}
        </div>
      </div>

      <div className="sec">Recent adventures</div>

      <div className="mstrip">
        {state.recentAdventures.map((adventure) => {
          const place = getPlaceById(adventure.placeId)

          return (
            <div key={adventure.title} className="mthumb">
              {place ? (
                <CardImage
                  className="mthumb-img"
                  imageUrl={place.imageUrl}
                  imageAlt={place.imageAlt}
                  imageTone={place.imageTone}
                />
              ) : null}
              <div className="mthumb-text">
                <div className="mtlbl">{adventure.title}</div>
                <div className="mttag">
                  {place ? getMagicLine(place) : adventure.tag}
                </div>
              </div>
            </div>
          )
        })}
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
