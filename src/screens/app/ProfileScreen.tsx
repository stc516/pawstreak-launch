import { useState } from 'react'
import type { AppState, Dog } from '../../data/demo'
import {
  getDisplayDogLabel,
  getDogAgeLabel,
  getDogBreedLabel,
  getProfileDogs,
} from '../../lib/profileDisplay'
import { CardImage } from '../../components/CardImage'
import { getMagicLine, getPlaceById } from '../../data/places'

interface ProfileScreenProps {
  state: AppState
  onSetActiveDog?: (dogId: string) => void
  onUpdateDog?: (
    dogId: string,
    patch: { name?: string; breed?: string; age?: string; profileEmoji?: string },
  ) => void
  onRemoveDog?: (dogId: string) => void
  onSignOut?: () => Promise<void>
}

interface DogCardProps {
  dog: Dog
  isActive: boolean
  isEditing: boolean
  draftName: string
  draftBreed: string
  draftAge: string
  onDraftNameChange: (value: string) => void
  onDraftBreedChange: (value: string) => void
  onDraftAgeChange: (value: string) => void
  onBeginEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onRequestRemove: () => void
  onSetActive?: () => void
}

function DogCard({
  dog,
  isActive,
  isEditing,
  draftName,
  draftBreed,
  draftAge,
  onDraftNameChange,
  onDraftBreedChange,
  onDraftAgeChange,
  onBeginEdit,
  onCancelEdit,
  onSaveEdit,
  onRequestRemove,
  onSetActive,
}: DogCardProps) {
  const breed = getDogBreedLabel(dog)
  const age = getDogAgeLabel(dog)

  if (isEditing) {
    return (
      <article className="profile-dog-card profile-dog-card--editing detail-card-warm">
        <div className="profile-dog-card-top">
          <div className={`profile-dog-avatar ${dog.circleClass}`}>
            {dog.photoUrl ? (
              <img src={dog.photoUrl} alt="" className="profile-dog-avatar-img" />
            ) : (
              <span className="profile-dog-avatar-emoji">{dog.profileEmoji}</span>
            )}
          </div>
          <div className="profile-dog-card-heading">
            <div className="profile-dog-card-kicker">Editing {dog.name}</div>
          </div>
        </div>

        <div className="profile-dog-edit-fields">
          <label className="profile-dog-field">
            <span className="profile-dog-field-label">Name</span>
            <input
              className="field-input"
              value={draftName}
              onChange={(event) => onDraftNameChange(event.target.value)}
            />
          </label>
          <label className="profile-dog-field">
            <span className="profile-dog-field-label">Breed</span>
            <input
              className="field-input"
              value={draftBreed}
              onChange={(event) => onDraftBreedChange(event.target.value)}
            />
          </label>
          <label className="profile-dog-field">
            <span className="profile-dog-field-label">Age</span>
            <input
              className="field-input"
              value={draftAge}
              placeholder="e.g. 4 years"
              onChange={(event) => onDraftAgeChange(event.target.value)}
            />
          </label>
        </div>

        <div className="profile-dog-card-actions">
          <button type="button" className="profile-dog-btn profile-dog-btn--primary tap-target" onClick={onSaveEdit}>
            Save
          </button>
          <button type="button" className="profile-dog-btn tap-target" onClick={onCancelEdit}>
            Cancel
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="profile-dog-card detail-card-warm">
      <div className="profile-dog-card-top">
        <div className={`profile-dog-avatar ${dog.circleClass}`}>
          {dog.photoUrl ? (
            <img src={dog.photoUrl} alt="" className="profile-dog-avatar-img" />
          ) : (
            <span className="profile-dog-avatar-emoji">{dog.profileEmoji}</span>
          )}
        </div>

        <div className="profile-dog-card-body">
          <div className="profile-dog-card-title-row">
            <h3 className="profile-dog-card-name">{dog.name}</h3>
            {isActive ? <span className="profile-dog-active-badge">Active</span> : null}
          </div>
          <p className="profile-dog-card-breed">{breed || 'Mixed breed'}</p>
          {age ? <p className="profile-dog-card-age">{age}</p> : null}
        </div>

        <button
          type="button"
          className="profile-dog-edit-icon tap-target"
          aria-label={`Edit ${dog.name}`}
          onClick={onBeginEdit}
        >
          <i className="ti ti-pencil" aria-hidden="true" />
        </button>
      </div>

      <div className="profile-dog-card-footer">
        {!isActive && onSetActive ? (
          <button type="button" className="profile-dog-link tap-target" onClick={onSetActive}>
            Set as active dog
          </button>
        ) : (
          <span className="profile-dog-link profile-dog-link--muted">Primary adventure dog</span>
        )}
        <button
          type="button"
          className="profile-dog-link profile-dog-link--danger tap-target"
          onClick={onRequestRemove}
        >
          Remove
        </button>
      </div>
    </article>
  )
}

export function ProfileScreen({
  state,
  onSetActiveDog,
  onUpdateDog,
  onRemoveDog,
  onSignOut,
}: ProfileScreenProps) {
  const profileDogs = getProfileDogs(state)
  const packLabel = getDisplayDogLabel(state)
  const [editingDogId, setEditingDogId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftBreed, setDraftBreed] = useState('')
  const [draftAge, setDraftAge] = useState('')
  const [removeTarget, setRemoveTarget] = useState<Dog | null>(null)

  const beginEdit = (dog: Dog) => {
    setEditingDogId(dog.id)
    setDraftName(dog.name)
    setDraftBreed(getDogBreedLabel(dog))
    setDraftAge(getDogAgeLabel(dog))
  }

  const cancelEdit = () => {
    setEditingDogId(null)
  }

  const saveEdit = (dogId: string) => {
    onUpdateDog?.(dogId, {
      name: draftName.trim(),
      breed: draftBreed.trim(),
      age: draftAge.trim() || undefined,
    })
    setEditingDogId(null)
  }

  const confirmRemove = () => {
    if (!removeTarget) return
    onRemoveDog?.(removeTarget.id)
    if (editingDogId === removeTarget.id) {
      setEditingDogId(null)
    }
    setRemoveTarget(null)
  }

  const isLastDog = profileDogs.length === 1
  const memoryCount = state.journeyEntries.length

  return (
    <div className="profile-screen">
      <div className="aheader profile-screen-header">
        <div>
          <div className="alogo">Profile</div>
          <p className="profile-screen-sub">{packLabel}</p>
        </div>
      </div>

      {memoryCount > 0 ? (
        <p className="profile-summary-line">
          {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'} saved together
        </p>
      ) : null}

      <section className="profile-section">
        {profileDogs.length === 0 ? (
          <div className="journey-empty detail-card-warm">
            <div className="journey-empty-title">Add your dog</div>
            <div className="journey-empty-body">
              Your pack profile will show up here once you add your dog.
            </div>
          </div>
        ) : (
          <div className="profile-dog-list">
            {profileDogs.map((dog) => (
              <DogCard
                key={dog.id}
                dog={dog}
                isActive={state.activeDogId === dog.id || (profileDogs.length === 1 && !state.activeDogId)}
                isEditing={editingDogId === dog.id}
                draftName={draftName}
                draftBreed={draftBreed}
                draftAge={draftAge}
                onDraftNameChange={setDraftName}
                onDraftBreedChange={setDraftBreed}
                onDraftAgeChange={setDraftAge}
                onBeginEdit={() => beginEdit(dog)}
                onCancelEdit={cancelEdit}
                onSaveEdit={() => saveEdit(dog.id)}
                onRequestRemove={() => setRemoveTarget(dog)}
                onSetActive={
                  state.activeDogId !== dog.id
                    ? () => onSetActiveDog?.(dog.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="profile-section profile-settings-section">
        <h2 className="profile-section-label">Favorite places</h2>

        {state.favoritePlaces.length === 0 ? (
          <p className="profile-settings-empty">Save a few adventures to see favorites here.</p>
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
          <button
            type="button"
            className="profile-signout tap-target"
            onClick={() => void onSignOut()}
          >
            Sign out
          </button>
        ) : null}
      </section>

      {removeTarget ? (
        <div className="profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-remove-title">
          <button
            type="button"
            className="profile-dialog-backdrop"
            aria-label="Close"
            onClick={() => setRemoveTarget(null)}
          />
          <div className="profile-dialog-sheet detail-card-warm">
            <h3 id="profile-remove-title" className="profile-dialog-title">
              Remove {removeTarget.name}?
            </h3>
            <p className="profile-dialog-copy">
              {isLastDog
                ? `${removeTarget.name} is your only dog. Removing them will clear your pack profile until you add another dog.`
                : `${removeTarget.name} will be removed from your pack. Their saved memories stay in your journey.`}
            </p>
            <div className="profile-dialog-actions">
              <button
                type="button"
                className="profile-dog-btn profile-dog-btn--danger tap-target"
                onClick={confirmRemove}
              >
                {isLastDog ? 'Remove anyway' : 'Remove'}
              </button>
              <button
                type="button"
                className="profile-dog-btn tap-target"
                onClick={() => setRemoveTarget(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
