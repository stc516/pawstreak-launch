import { useRef, useState } from 'react'
import type { AppState, Dog } from '../../data/demo'
import {
  getDisplayDogLabel,
  getDogAgeLabel,
  getDogBreedLabel,
  getProfileDogs,
} from '../../lib/profileDisplay'
import { getHomeProgressStats } from '../../lib/homeStats'
import { getJourneyEntryDisplayImageUrl } from '../../lib/adventureDisplayImage'
import { CardImage } from '../../components/CardImage'
import { getMagicLine, getPlaceById } from '../../data/places'
import { SettingsScreen } from './SettingsScreen'

interface ProfileScreenProps {
  state: AppState
  isDemoMode?: boolean
  accountEmail?: string | null
  onSetActiveDog?: (dogId: string) => void
  onUpdateDog?: (
    dogId: string,
    patch: { name?: string; breed?: string; age?: string; profileEmoji?: string },
  ) => void
  onRemoveDog?: (dogId: string) => void
  onOpenAchievement?: (achievementId: string) => void
  onOpenPackInvite?: () => void
  onZipChange?: (zipCode: string) => void
  onApplyLocation?: () => void
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
  compact?: boolean
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
  compact = false,
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

  if (compact) {
    return (
      <article className="profile-dog-card profile-dog-card--compact">
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
          <p className="profile-dog-card-breed">
            {[age, breed || 'Mixed breed'].filter(Boolean).join(' · ')}
          </p>
          <div className="profile-dog-card-footer">
            {!isActive && onSetActive ? (
              <button type="button" className="profile-dog-link tap-target" onClick={onSetActive}>
                Set active
              </button>
            ) : null}
            <button
              type="button"
              className="profile-dog-link profile-dog-link--danger tap-target"
              onClick={onRequestRemove}
            >
              Remove
            </button>
          </div>
        </div>
        <button
          type="button"
          className="profile-dog-edit-icon tap-target"
          aria-label={`Edit ${dog.name}`}
          onClick={onBeginEdit}
        >
          <i className="ti ti-pencil" aria-hidden="true" />
        </button>
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

function PackAccessIcon({ role }: { role: string }) {
  const icon =
    role === 'Owner'
      ? 'ti-crown'
      : /walker|helper|sitter/i.test(role)
        ? 'ti-shoe'
        : /trainer/i.test(role)
          ? 'ti-school'
          : 'ti-users'
  return <i className={`ti ${icon}`} aria-hidden="true" />
}

export function ProfileScreen({
  state,
  isDemoMode = false,
  accountEmail,
  onSetActiveDog,
  onUpdateDog,
  onRemoveDog,
  onOpenPackInvite,
  onZipChange,
  onApplyLocation,
  onSignOut,
}: ProfileScreenProps) {
  const profileDogs = getProfileDogs(state)
  const dogListRef = useRef<HTMLDivElement | null>(null)
  const packLabel = getDisplayDogLabel(state)
  const [editingDogId, setEditingDogId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftBreed, setDraftBreed] = useState('')
  const [draftAge, setDraftAge] = useState('')
  const [removeTarget, setRemoveTarget] = useState<Dog | null>(null)
  const [showSettings, setShowSettings] = useState(false)

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
  const progress = getHomeProgressStats(state)
  const recentMemories = state.journeyEntries.slice(0, 3)
  const packAccessMembers =
    state.packAccessMembers.length > 0
      ? state.packAccessMembers
      : [
          {
            id: 'owner',
            name: 'You',
            role: 'Owner',
            accessLevel: 'Full access',
            accessDescription: 'Manage dogs, adventures, memories, and pack settings',
            lastActivity: 'Active now',
            isOwner: true,
          },
        ]
  const editingDog = editingDogId ? profileDogs.find((dog) => dog.id === editingDogId) : null

  if (showSettings && onZipChange && onApplyLocation) {
    return (
      <SettingsScreen
        state={state}
        accountEmail={accountEmail}
        isDemoMode={isDemoMode}
        onBack={() => setShowSettings(false)}
        onZipChange={onZipChange}
        onApplyLocation={onApplyLocation}
        onManageDogs={() => {
          setShowSettings(false)
          requestAnimationFrame(() => {
            dogListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          })
        }}
        onSignOut={onSignOut}
      />
    )
  }

  return (
    <div className="profile-screen profile-screen--stitch">
      <header className="st-appbar profile-screen-header">
        <div className="st-appbar-actions">
          {profileDogs[0] ? (
            <div className="st-avatar-single">
              <div className={`dog-av ${profileDogs[0].avatarClass}`}>
                {profileDogs[0].photoUrl ? (
                  <img src={profileDogs[0].photoUrl} alt="" className="dog-av-img" />
                ) : (
                  profileDogs[0].initial
                )}
              </div>
            </div>
          ) : null}
          <div>
            <div className="st-headline-md alogo">{packLabel}</div>
            {memoryCount > 0 ? (
              <p className="profile-screen-sub st-body-md">
                {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}
              </p>
            ) : null}
          </div>
        </div>
        {onZipChange && onApplyLocation ? (
          <button
            type="button"
            className="st-icon-btn profile-settings-btn tap-target"
            aria-label="Open settings"
            onClick={() => setShowSettings(true)}
          >
            <i className="ti ti-settings" aria-hidden="true" />
          </button>
        ) : null}
      </header>

      <section className="profile-section" ref={dogListRef}>
        {profileDogs.length === 0 ? (
          <div className="journey-empty st-card st-card--elevated">
            <div className="journey-empty-title">Add your dog</div>
            <div className="journey-empty-body">
              Your pack profile will show up here once you add your dog.
            </div>
          </div>
        ) : editingDog ? (
          <DogCard
            key={editingDog.id}
            dog={editingDog}
            isActive={
              state.activeDogId === editingDog.id ||
              (profileDogs.length === 1 && !state.activeDogId)
            }
            isEditing
            draftName={draftName}
            draftBreed={draftBreed}
            draftAge={draftAge}
            onDraftNameChange={setDraftName}
            onDraftBreedChange={setDraftBreed}
            onDraftAgeChange={setDraftAge}
            onBeginEdit={() => beginEdit(editingDog)}
            onCancelEdit={cancelEdit}
            onSaveEdit={() => saveEdit(editingDog.id)}
            onRequestRemove={() => setRemoveTarget(editingDog)}
          />
        ) : (
          <div className="profile-dog-stack">
            {profileDogs.map((dog) => (
              <DogCard
                key={dog.id}
                dog={dog}
                compact
                isActive={
                  state.activeDogId === dog.id || (profileDogs.length === 1 && !state.activeDogId)
                }
                isEditing={false}
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
                  state.activeDogId !== dog.id ? () => onSetActiveDog?.(dog.id) : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="profile-section">
        <div className="st-section-head">
          <h2 className="st-headline-lg">Pack Access</h2>
          <button
            type="button"
            className="st-link-btn tap-target"
            onClick={onOpenPackInvite}
          >
            Invite
          </button>
        </div>
        <div className="pack-access-panel">
          <div>
            <h3>Share {packLabel}&apos;s care without sharing your password</h3>
            <p>Family, walkers, sitters, and trainers can stay in sync with the pack.</p>
          </div>
          <button type="button" className="pack-access-primary tap-target" onClick={onOpenPackInvite}>
            <i className="ti ti-user-plus" aria-hidden="true" />
            Add person
          </button>
        </div>
        <div className="pack-access-list">
          {packAccessMembers.map((member) => (
            <article key={member.id} className="pack-access-member">
              <div className="pack-access-avatar">
                <PackAccessIcon role={member.role} />
              </div>
              <div className="pack-access-copy">
                <div className="pack-access-name-row">
                  <strong>{member.name}</strong>
                  {member.isOwner ? <span>Owner</span> : null}
                </div>
                <p>{member.role} · {member.accessLevel}</p>
                <small>{member.accessDescription}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      {recentMemories.length > 0 ? (
        <section className="profile-section">
          <div className="st-section-head">
            <h2 className="st-headline-lg">Recent Memories</h2>
          </div>
          <div className="profile-memory-bento">
            {recentMemories.map((entry) => {
              const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
              const imageUrl = getJourneyEntryDisplayImageUrl(state.journeyEntries, entry)
              return (
                <button
                  key={entry.id}
                  type="button"
                  className="profile-memory-bento-item tap-target"
                  aria-label={entry.place}
                >
                  <CardImage
                    imageUrl={imageUrl}
                    imageAlt={entry.place}
                    imageTone={place?.imageTone ?? 'warm'}
                  />
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="profile-section">
        <div className="st-section-head">
          <h2 className="st-headline-lg">Your Stats</h2>
        </div>
        <div className="profile-stats-grid">
          <div className="profile-stat-card profile-stat-card--stitch">
            <div className="profile-stat-value">{progress.streak}</div>
            <div className="profile-stat-label">day streak</div>
          </div>
          <div className="profile-stat-card profile-stat-card--stitch">
            <div className="profile-stat-value">{progress.adventuresCompleted}</div>
            <div className="profile-stat-label">adventures</div>
          </div>
          <div className="profile-stat-card profile-stat-card--stitch">
            <div className="profile-stat-value">{progress.memoriesSaved}</div>
            <div className="profile-stat-label">memories</div>
          </div>
          <div className="profile-stat-card profile-stat-card--stitch">
            <div className="profile-stat-value">{progress.places}</div>
            <div className="profile-stat-label">places</div>
          </div>
        </div>
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
