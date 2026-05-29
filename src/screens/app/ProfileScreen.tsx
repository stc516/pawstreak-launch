import { useState } from 'react'
import type { AppState, Dog } from '../../data/demo'
import { getProfileDogs } from '../../lib/profileDisplay'
import { CardImage } from '../../components/CardImage'
import { getMagicLine, getPlaceById } from '../../data/places'

interface ProfileScreenProps {
  state: AppState
  packInviteEnabled?: boolean
  onOpenPackInvite: () => void
  onSetActiveDog?: (dogId: string) => void
  onUpdateDog?: (
    dogId: string,
    patch: { name?: string; breed?: string; profileEmoji?: string },
  ) => void
  onSignOut?: () => Promise<void>
}

export function ProfileScreen({
  state,
  packInviteEnabled = false,
  onOpenPackInvite,
  onSetActiveDog,
  onUpdateDog,
  onSignOut,
}: ProfileScreenProps) {
  const profileDogs = getProfileDogs(state)
  const [editingDogId, setEditingDogId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftBreed, setDraftBreed] = useState('')

  const beginEdit = (dog: Dog) => {
    setEditingDogId(dog.id)
    setDraftName(dog.name)
    setDraftBreed(dog.breed)
  }

  const saveEdit = (dogId: string) => {
    onUpdateDog?.(dogId, { name: draftName.trim(), breed: draftBreed.trim() })
    setEditingDogId(null)
  }

  return (
    <>
      <div className="prof-top">
        {profileDogs.length === 0 ? (
          <div className="journey-empty detail-card-warm">
            <div className="journey-empty-title">Add your dog</div>
            <div className="journey-empty-body">
              Your pack profile will show up here once you add your dog.
            </div>
          </div>
        ) : (
          <div className="dogs-row">
            {profileDogs.map((dog) => (
              <button
                key={dog.id}
                type="button"
                className={`dog-col tap-target${state.activeDogId === dog.id ? ' dog-col--active' : ''}`}
                onClick={() => onSetActiveDog?.(dog.id)}
              >
                <div className={`dog-circle ${dog.circleClass}`}>
                  {dog.photoUrl ? (
                    <img src={dog.photoUrl} alt="" className="dog-circle-img" />
                  ) : (
                    dog.profileEmoji
                  )}
                </div>
                <div className="dog-dname">{dog.name}</div>
                <div className="dog-breed">{dog.breed}</div>
                {state.activeDogId === dog.id ? (
                  <div className="dog-active-label">Active</div>
                ) : null}
              </button>
            ))}
          </div>
        )}
        {profileDogs.map((dog) =>
          editingDogId === dog.id ? (
            <div key={`edit-${dog.id}`} className="dog-edit-panel detail-card-warm">
              <div className="field">
                <span className="field-label">Name</span>
                <input
                  className="field-input"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                />
              </div>
              <div className="field">
                <span className="field-label">Breed</span>
                <input
                  className="field-input"
                  value={draftBreed}
                  onChange={(event) => setDraftBreed(event.target.value)}
                />
              </div>
              <div className="cs-card-actions">
                <button
                  type="button"
                  className="cs-action tap-target"
                  onClick={() => saveEdit(dog.id)}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="cs-action tap-target"
                  onClick={() => setEditingDogId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              key={`edit-btn-${dog.id}`}
              type="button"
              className="demo-feedback-link"
              onClick={() => beginEdit(dog)}
            >
              Edit {dog.name}
            </button>
          ),
        )}
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
            {packInviteEnabled ? (
              <p className="pack-access-copy">
                Perfect for family, walkers, sitters, or someone stationed far away.
                They can follow the memories, suggest adventures, and stay part of the
                pack.
              </p>
            ) : (
              <p className="pack-access-copy">
                Pack invites are coming soon — a simple way to share memories with
                family, walkers, and sitters.
              </p>
            )}
          </div>
          {packInviteEnabled ? (
            <button
              type="button"
              className="pack-invite-btn tap-target"
              onClick={onOpenPackInvite}
            >
              Invite someone
            </button>
          ) : null}
        </div>

        {packInviteEnabled ? (
          state.packAccessMembers.length === 0 ? (
            <p className="pack-access-copy">
              No pack members yet — save a demo invite to preview how this will work.
            </p>
          ) : (
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
                  <div className="pack-access-last">{member.lastActivity}</div>
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="pack-access-copy">Pack invites are coming soon.</p>
        )}
      </div>

      <div className="sec">Favorite places</div>
      {state.favoritePlaces.length === 0 ? (
        <p className="pack-access-copy">Save a few adventures to see favorites here.</p>
      ) : (
        state.favoritePlaces.map((favorite) => {
          const place = getPlaceById(favorite.placeId)
          return (
            <div key={favorite.id} className="fav-place detail-card-warm">
              <div className="fav-place-top">
                <span className="fav-place-emoji">{favorite.emoji}</span>
                <div>
                  <div className="fav-place-name">{favorite.name}</div>
                  <div className="fav-place-visits">{favorite.visits}</div>
                </div>
              </div>
              {place ? (
                <CardImage
                  imageUrl={place.imageUrl}
                  imageAlt={place.imageAlt ?? place.name}
                  imageTone={place.imageTone ?? 'park'}
                />
              ) : null}
              <p className="fav-place-line">{place ? getMagicLine(place) : ''}</p>
            </div>
          )
        })
      )}

      {onSignOut ? (
        <button type="button" className="demo-feedback-link" onClick={() => void onSignOut()}>
          Sign out
        </button>
      ) : null}
    </>
  )
}
