import type { AppState } from '../../data/demo'

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

function SettingsRow({
  title,
  detail,
  action,
  disabled,
  onClick,
}: {
  title: string
  detail?: string
  action?: string
  disabled?: boolean
  onClick?: () => void
}) {
  const content = (
    <>
      <span className="settings-row-copy">
        <span className="settings-row-title">{title}</span>
        {detail ? <span className="settings-row-detail">{detail}</span> : null}
      </span>
      {action ? <span className="settings-row-action">{action}</span> : null}
    </>
  )

  if (onClick && !disabled) {
    return (
      <button type="button" className="settings-row tap-target" onClick={onClick}>
        {content}
      </button>
    )
  }

  return (
    <div className={`settings-row settings-row--static${disabled ? ' settings-row--muted' : ''}`}>
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
  const accountDetail = isDemoMode
    ? 'Demo mode — sign in on pawstreakapp.com/app for a real account.'
    : accountEmail
      ? `Signed in as ${accountEmail}`
      : 'Your account details appear here after sign-in.'

  return (
    <div className="settings-screen">
      <div className="aheader settings-screen-header">
        <button type="button" className="settings-back tap-target" onClick={onBack}>
          <i className="ti ti-chevron-left" aria-hidden="true" />
          Profile
        </button>
        <div className="alogo settings-screen-title">Settings</div>
        <span className="settings-header-spacer" aria-hidden="true" />
      </div>

      <section className="settings-section">
        <h2 className="settings-section-label">Account</h2>
        <div className="settings-group detail-card-warm">
          <SettingsRow title="Account" detail={accountDetail} />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section-label">Notifications</h2>
        <div className="settings-group detail-card-warm">
          <SettingsRow
            title="Adventure reminders"
            detail="Push and email reminders are coming soon."
            action="Soon"
            disabled
          />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section-label">Location / ZIP</h2>
        <div className="settings-group detail-card-warm settings-location-group">
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
        <h2 className="settings-section-label">Dog profiles</h2>
        <div className="settings-group detail-card-warm">
          <SettingsRow
            title="Manage dogs"
            detail="Edit names, breeds, and remove dogs from your pack."
            action="Open"
            onClick={onManageDogs}
          />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section-label">Privacy / Terms</h2>
        <div className="settings-group detail-card-warm">
          <SettingsRow
            title="Privacy policy"
            detail="Full policy publishing soon."
            action="Soon"
            disabled
          />
          <SettingsRow
            title="Terms of service"
            detail="Full terms publishing soon."
            action="Soon"
            disabled
          />
        </div>
      </section>

      {onSignOut ? (
        <button type="button" className="settings-signout tap-target" onClick={() => void onSignOut()}>
          Sign out
        </button>
      ) : null}
    </div>
  )
}
