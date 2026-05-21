import type { AppState } from '../../data/demo'
import { CardImage } from '../../components/CardImage'
import { getMagicLine, getPlaceById } from '../../data/places'

interface ProfileScreenProps {
  state: AppState
}

export function ProfileScreen({ state }: ProfileScreenProps) {
  return (
    <>
      <div className="prof-top">
        <div className="dogs-row">
          {state.dogs.map((dog) => (
            <div key={dog.id} className="dog-col">
              <div className={`dog-circle ${dog.circleClass}`}>
                {dog.profileEmoji}
              </div>
              <div className="dog-dname">{dog.name}</div>
              <div className="dog-breed">{dog.breed}</div>
            </div>
          ))}
        </div>
        <div className="add-dog">
          <i className="ti ti-plus" aria-hidden="true" />
          Add another dog
        </div>
      </div>

      <div className="stats3">
        <div className="sc">
          <div className="sn">{state.streak}</div>
          <div className="sl">streak</div>
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

      <div className="sec">Favorite places</div>

      {state.favoritePlaces.map((favorite) => {
        const place = getPlaceById(favorite.placeId)

        return (
          <div key={favorite.id} className="fav">
            <CardImage
              className="fav-ico"
              imageUrl={place?.imageUrl}
              imageAlt={place?.imageAlt}
              imageTone={place?.imageTone}
            />
            <div className="fav-info">
              <div className="fav-name">{favorite.name}</div>
              <div className="fav-vis">
                {favorite.visits}
                {place ? ` · ${getMagicLine(place)}` : ''}
              </div>
            </div>
            <i className="ti ti-chevron-right fav-arr" aria-hidden="true" />
          </div>
        )
      })}
    </>
  )
}
