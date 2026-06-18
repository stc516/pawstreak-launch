import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'

interface SettingsScreenProps {
  state: AppState
  accountEmail?: string | null
  isDemoMode?: boolean
  onBack: () => void
  onZipChange: (zipCode: string) => void
  onApplyLocation: () => void
  onManageDogs: () => void
  onSignOut?: () => Promise<void>
}

function SettingsIconRow({
  icon,
  title,
  detail,
  action,
  disabled,
  onClick,
}: {
  icon: string
  title: string
  detail?: string
  action?: string
  disabled?: boolean
  onClick?: () => void
}) {
  const content = (
    <>
      <div className="settings-row-main">
        <span className="settings-row-icon">
          <i className={`ti ${icon}`} aria-hidden="true" />
        </span>
        <span className="settings-row-copy">
          <span className="settings-row-title">{title}</span>
          {detail ? <span className="settings-row-detail">{detail}</span> : null}
        </span>
      </div>
      {action ? <span className="settings-row-action">{action}</span> : null}
      {!action && onClick && !disabled ? (
        <i className="ti ti-chevron-right settings-row-action" aria-hidden="true" />
      ) : null}
    </>
  )

  if (onClick && !disabled) {
    return (
      <button type="button" className="settings-row settings-row--stitch tap-target" onClick={onClick}>
        {content}
      </button>
    )
  }

  return (
    <div
      className={`settings-row settings-row--stitch settings-row--static${disabled ? ' settings-row--muted' : ''}`}
    >
      {content}
    </div>
  )
}

export function SettingsScreen({
  state,
  accountEmail,
  isDemoMode = false,
  onBack,
  onZipChange,
  onApplyLocation,
  onManageDogs,
  onSignOut,
}: SettingsScreenProps) {
  const profileDogs = getProfileDogs(state)
  const packLabel = getDisplayDogLabel(state)
  const leadDog = profileDogs[0]
  const accountDetail = isDemoMode
    ? 'Demo mode — sign in on pawstreakapp.com/app for a real account.'
    : accountEmail
      ? `Signed in as ${accountEmail}`
      : 'Your account details appear here after sign-in.'

  return (
    <div className="settings-screen settings-screen--stitch">
      <header className="st-appbar settings-screen-header settings-screen-header--stitch">
        <div className="st-appbar-actions">
          <button type="button" className="settings-back settings-back--stitch tap-target" onClick={onBack}>
            <i className="ti ti-arrow-left" aria-hidden="true" />
          </button>
          <div className="st-headline-md settings-screen-title">Settings</div>
        </div>
        {leadDog ? (
          <div className="st-avatar-single">
            <div className={`dog-av ${leadDog.avatarClass}`}>
              {leadDog.photoUrl ? (
                <img src={leadDog.photoUrl} alt="" className="dog-av-img" />
              ) : (
                leadDog.initial
              )}
            </div>
          </div>
        ) : (
          <span className="settings-header-spacer" aria-hidden="true" />
        )}
      </header>

      <section className="settings-summary-card">
        <div className="settings-summary-avatar">
          {leadDog ? (
            <div className={`profile-dog-avatar ${leadDog.circleClass}`}>
              {leadDog.photoUrl ? (
                <img src={leadDog.photoUrl} alt="" className="profile-dog-avatar-img" />
              ) : (
                <span className="profile-dog-avatar-emoji">{leadDog.profileEmoji}</span>
              )}
            </div>
          ) : null}
          <span className="settings-summary-edit" aria-hidden="true">
            <i className="ti ti-pencil" />
          </span>
        </div>
        <div>
          <h2 className="st-headline-md">{packLabel}</h2>
          <p className="st-body-md">{accountDetail}</p>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="st-section-label settings-section-label">Account</h2>
        <div className="settings-group settings-group--stitch">
          <SettingsIconRow icon="ti-user" title="Account" detail={accountDetail} />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="st-section-label settings-section-label">Dogs</h2>
        <div className="settings-group settings-group--stitch">
          <SettingsIconRow
            icon="ti-paw"
            title="Dogs"
            detail="Edit names, breeds, and remove dogs from your pack."
            onClick={onManageDogs}
          />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="st-section-label settings-section-label">Notifications</h2>
        <div className="settings-group settings-group--stitch">
          <SettingsIconRow
            icon="ti-bell"
            title="Notifications"
            detail="Push and email reminders are coming soon."
            action="Soon"
            disabled
          />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="st-section-label settings-section-label">Preferences</h2>
        <div className="settings-group settings-group--stitch settings-location-group settings-location-group--stitch">
          <p className="settings-location-copy">
            Update your ZIP to refresh nearby adventures and map pins.
          </p>
          <div className="settings-location-row">
            <input
              className="field-input settings-zip-input"
              type="text"
              inputMode="numeric"
              placeholder="Zip code"
              value={state.zipCode}
              onChange={(event) => onZipChange(event.target.value)}
            />
            <button type="button" className="settings-zip-btn tap-target" onClick={onApplyLocation}>
              Update
            </button>
          </div>
          <p className="settings-location-meta">{state.mapRegion.subtitle}</p>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="st-section-label settings-section-label">Privacy</h2>
        <div className="settings-group settings-group--stitch">
          <SettingsIconRow
            icon="ti-shield"
            title="Privacy policy"
            detail="Full policy publishing soon."
            action="Soon"
            disabled
          />
          <SettingsIconRow
            icon="ti-file-text"
            title="Terms of service"
            detail="Full terms publishing soon."
            action="Soon"
            disabled
          />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="st-section-label settings-section-label">Support</h2>
        <div className="settings-group settings-group--stitch">
          <SettingsIconRow
            icon="ti-help-circle"
            title="Support"
            detail="Help center and contact options are coming soon."
            action="Soon"
            disabled
          />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="st-section-label settings-section-label">Feedback</h2>
        <div className="settings-group settings-group--stitch">
          <SettingsIconRow
            icon="ti-message-circle"
            title="Feedback"
            detail="Share what would make PawStreak better."
            action="Soon"
            disabled
          />
        </div>
      </section>

      <section className="settings-section settings-section--signout">
        <button
          type="button"
          className="settings-signout settings-signout--stitch tap-target"
          disabled={!onSignOut}
          onClick={() => onSignOut && void onSignOut()}
        >
          <i className="ti ti-logout" aria-hidden="true" />
          Sign out
        </button>
        {!onSignOut ? (
          <p className="settings-signout-note st-body-md">Sign in on pawstreakapp.com/app to enable sign out.</p>
        ) : null}
      </section>
    </div>
  )
}
