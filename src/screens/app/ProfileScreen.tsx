import type { AppState } from '../../data/demo'
import { CardImage } from '../../components/CardImage'
import { getMagicLine, getPlaceById } from '../../data/places'

interface ProfileScreenProps {
  state: AppState
  onOpenPackInvite: () => void
}

export function ProfileScreen({ state, onOpenPackInvite }: ProfileScreenProps) {
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

      <div className="pack-access-section">
        <div className="pack-access-header">
          <div>
            <div className="sec pack-access-title">Pack Access</div>
            <p className="pack-access-sub">
              Let the people who love your dog stay close, even when they&apos;re far
              away.
            </p>
            <p className="pack-access-copy">
              Perfect for family, walkers, sitters, or someone stationed far away.
              They can follow the memories, suggest adventures, and stay part of the
              pack.
            </p>
          </div>
          <button
            type="button"
            className="pack-invite-btn tap-target"
            onClick={onOpenPackInvite}
          >
            Invite someone
          </button>
        </div>

        <div className="pack-access-list">
          {state.packAccessMembers.map((member) => (
            <div key={member.id} className="pack-access-card detail-card-warm">
              <div className="pack-access-card-top">
                <div>
                  <div className="pack-access-name">{member.name}</div>
                  <div className="pack-access-role">{member.role}</div>
                </div>
                <div className="pack-access-level">{member.accessLevel}</div>
              </div>
              <div className="pack-access-desc">{member.accessDescription}</div>
              <div className="pack-access-activity">{member.lastActivity}</div>
            </div>
          ))}
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
