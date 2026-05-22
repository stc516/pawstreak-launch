import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import {
  getHeroCuratedLabel,
  getHeroEyebrow,
  getHeroFitLine,
  getHomeHeadline,
  getHomeIntroSub,
  getHomeKicker,
  getMemoryWarmLabel,
  getPackEnergyNote,
} from '../../lib/homeCopy'
import { CardImage } from '../../components/CardImage'
import {
  formatHeroSubtitle,
  getHeroBadge,
  getHeroPlace,
  getMagicLine,
  getPlaceById,
} from '../../data/places'
import { getRecommendationPrefs } from '../../lib/onboardingProfile'

interface HomeScreenProps {
  state: AppState
  onSelectActivity: (activityId: string) => void
  onStartAdventure: (placeId: string, durationLabel: string) => void
  onOpenProfile: () => void
  onOpenJourney: () => void
}

export function HomeScreen({
  state,
  onSelectActivity,
  onStartAdventure,
  onOpenProfile,
  onOpenJourney,
}: HomeScreenProps) {
  const heroPlace = getHeroPlace(state.selectedActivityId, getRecommendationPrefs(state))
  const heroBadge = getHeroBadge(heroPlace)
  const profileDogs = getProfileDogs(state)
  const dogLabel = getDisplayDogLabel(state)
  const dogCount = profileDogs.length

  return (
    <>
      <div className="aheader">
        <div className="alogo">
          Paw<span>Streak</span>
        </div>
        <button type="button" className="two-dogs tap-target" onClick={onOpenProfile}>
          {profileDogs.map((dog) => (
            <div key={dog.id} className={`dog-av ${dog.avatarClass}`}>
              {dog.initial}
            </div>
          ))}
          <span className="dog-names">{dogLabel}</span>
        </button>
      </div>

      <div className="home-intro detail-tint detail-tint--warm">
        <div className="home-intro-kicker">{getHomeKicker(dogLabel, dogCount)}</div>
        <h1 className="home-intro-title">{getHomeHeadline(dogLabel, dogCount)}</h1>
        <p className="home-intro-sub">{getHomeIntroSub(state.locationLabel)}</p>
      </div>

      <div className="streak-bar">
        <div>
          <div className="snum">{state.streak}</div>
          <div className="slabel">day streak</div>
        </div>
        <div className="snudge">Small adventures count — keep it going</div>
      </div>

      <div className="home-pack detail-card-warm">
        <div className="home-pack-top">
          <div className="live-dot" />
          <div className="home-pack-label">{state.communityLive.label}</div>
        </div>
        <div className="home-pack-count">
          {state.communityLive.count} {state.communityLive.countLabel}
        </div>
        <div className="home-pack-sub">
          Top spot: {state.communityLive.topSpot} · {state.communityLive.tagline}
        </div>
        <div className="home-pack-note">
          {getPackEnergyNote(state.locationLabel)}
        </div>
      </div>

      {!state.locationSupported ? (
        <div className="home-area-fallback detail-card-warm">
          We&apos;re still building your area. You can request it, but here are sample
          adventures for now.
        </div>
      ) : null}

      <div className="home-vibe-panel">
      <div className="sec home-vibe-label">Pick today&apos;s vibe</div>

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
            <div className="hc-curate">{getHeroCuratedLabel(heroPlace, profileDogs)}</div>
            <div className="hc-eyebrow">{getHeroEyebrow(dogLabel, dogCount)}</div>
            <div className="hc-title">{heroPlace.name}</div>
            <div className="hc-sub">{formatHeroSubtitle(heroPlace, profileDogs)}</div>
            <div className="hc-magic">{getMagicLine(heroPlace)}</div>
          </div>
          {heroBadge ? <div className="hc-badge">{heroBadge}</div> : null}
        </div>
        <div className="hc-why">{getHeroFitLine(heroPlace, profileDogs)}</div>
        <div className="hc-start-label">Pick a duration · start adventure</div>
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
      </div>

      <div className="home-memory-value detail-card-warm">
        <h2 className="home-memory-value-title">
          Every good day becomes part of their story
        </h2>
        <p className="home-memory-value-copy">
          Save the little moments now — the beach days, slow walks, muddy paws, and
          places they loved most.
        </p>

        <div className="mstrip home-memory-value-strip">
          {state.recentAdventures.map((adventure, index) => {
            const place = getPlaceById(adventure.placeId)

            return (
              <div key={adventure.title} className="mthumb mthumb--warm">
                {place ? (
                  <CardImage
                    className="mthumb-img"
                    imageUrl={place.imageUrl}
                    imageAlt={place.imageAlt}
                    imageTone={place.imageTone}
                  />
                ) : null}
                <div className="mthumb-text">
                  <div className="mtwarm">{getMemoryWarmLabel(index)}</div>
                  <div className="mtlbl">{adventure.title}</div>
                  <div className="mttag">{place ? getMagicLine(place) : adventure.tag}</div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          className="home-memory-value-cta tap-target"
          onClick={onOpenJourney}
        >
          Open Journey
        </button>
      </div>
    </>
  )
}
