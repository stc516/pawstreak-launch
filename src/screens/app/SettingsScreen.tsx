import { useEffect, useState } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import { ROUTES } from '../../lib/routes'
import {
  DEFAULT_PUSH_PREFERENCES,
  disablePushNotifications,
  enablePushNotifications,
  getPushNotificationState,
  updatePushPreferences,
  type PushNotificationState,
  type PushPreferences,
} from '../../lib/pushNotifications'

interface SettingsScreenProps {
  state: AppState
  accountEmail?: string | null
  isDemoMode?: boolean
  onBack: () => void
  onZipChange: (zipCode: string) => void
  onApplyLocation: () => void
  onManageDogs: () => void
  onSignOut?: () => Promise<void>
  onDeleteAccount?: () => Promise<void>
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
  onDeleteAccount,
}: SettingsScreenProps) {
  const [deleteArmed, setDeleteArmed] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [pushState, setPushState] = useState<PushNotificationState | null>(null)
  const [pushPreferences, setPushPreferences] = useState<PushPreferences>(DEFAULT_PUSH_PREFERENCES)
  const [pushBusy, setPushBusy] = useState(false)
  const [pushMessage, setPushMessage] = useState<string | null>(null)
  const profileDogs = getProfileDogs(state)
  const packLabel = getDisplayDogLabel(state)
  const leadDog = profileDogs[0]
  const accountDetail = isDemoMode
    ? 'Demo mode — sign in on pawstreakapp.com/app for a real account.'
    : accountEmail
      ? `Signed in as ${accountEmail}`
      : 'Your account details appear here after sign-in.'

  useEffect(() => {
    if (isDemoMode) return
    let cancelled = false
    void getPushNotificationState().then((next) => {
      if (cancelled) return
      setPushState(next)
      setPushPreferences(next.preferences)
    }).catch((error) => {
      if (!cancelled) setPushMessage(error instanceof Error ? error.message : 'Could not load notification settings.')
    })
    return () => { cancelled = true }
  }, [isDemoMode])

  const enableReminders = async () => {
    setPushBusy(true)
    setPushMessage(null)
    try {
      await enablePushNotifications(pushPreferences)
      const next = await getPushNotificationState()
      setPushState(next)
      setPushPreferences(next.preferences)
      setPushMessage('Morning and evening reminders are on.')
    } catch (error) {
      setPushMessage(error instanceof Error ? error.message : 'Could not enable notifications.')
    } finally {
      setPushBusy(false)
    }
  }

  const saveReminderPreferences = async (next: PushPreferences) => {
    setPushPreferences(next)
    setPushBusy(true)
    setPushMessage(null)
    try {
      if (!next.morningEnabled && !next.eveningEnabled) {
        await disablePushNotifications()
        setPushMessage('Daily reminders are paused.')
      } else {
        await updatePushPreferences(next)
        setPushMessage('Reminder schedule saved.')
      }
    } catch (error) {
      setPushMessage(error instanceof Error ? error.message : 'Could not save reminder settings.')
    } finally {
      setPushBusy(false)
    }
  }

  return (
    <div className="settings-screen settings-screen--stitch">
      <header className="st-appbar settings-screen-header settings-screen-header--stitch">
        <div className="st-appbar-actions">
          <button type="button" className="settings-back settings-back--stitch tap-target" aria-label="Back to profile" onClick={onBack}>
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
        <div className="settings-group settings-group--stitch settings-notifications">
          {isDemoMode ? (
            <SettingsIconRow
              icon="ti-bell"
              title="Daily reminders"
              detail="Sign in to turn on morning and evening push notifications."
              disabled
            />
          ) : pushState?.isIos && !pushState.installed ? (
            <div className="settings-notification-setup">
              <i className="ti ti-device-mobile-share" aria-hidden="true" />
              <div>
                <strong>Add PawStreak to your Home Screen</strong>
                <p>On iPhone, tap Share, choose “Add to Home Screen,” then open the installed PawStreak app to enable reminders.</p>
              </div>
            </div>
          ) : pushState && (!pushState.supported || !pushState.configured) ? (
            <SettingsIconRow
              icon="ti-bell-off"
              title="Daily reminders"
              detail={pushState.supported
                ? 'Push delivery is awaiting its production key.'
                : 'This browser does not support push notifications.'}
              disabled
            />
          ) : pushState?.permission === 'denied' ? (
            <SettingsIconRow
              icon="ti-bell-off"
              title="Notifications blocked"
              detail="Allow PawStreak notifications in your device or browser settings, then return here."
              disabled
            />
          ) : pushState?.subscribed ? (
            <div className="settings-reminder-editor">
              <p className="settings-reminder-intro">Keep the day moving with two useful nudges. Times use your current timezone.</p>
              <label className="settings-reminder-row">
                <span>
                  <strong>Morning momentum</strong>
                  <small>Pick today’s walk before the day fills up.</small>
                </span>
                <input
                  type="time"
                  aria-label="Morning reminder time"
                  value={pushPreferences.morningTime}
                  disabled={!pushPreferences.morningEnabled || pushBusy}
                  onChange={(event) => void saveReminderPreferences({ ...pushPreferences, morningTime: event.target.value })}
                />
                <input
                  type="checkbox"
                  aria-label="Enable morning reminder"
                  checked={pushPreferences.morningEnabled}
                  disabled={pushBusy}
                  onChange={(event) => void saveReminderPreferences({ ...pushPreferences, morningEnabled: event.target.checked })}
                />
              </label>
              <label className="settings-reminder-row">
                <span>
                  <strong>Evening streak check</strong>
                  <small>A quick walk still counts—don’t lose the day.</small>
                </span>
                <input
                  type="time"
                  aria-label="Evening reminder time"
                  value={pushPreferences.eveningTime}
                  disabled={!pushPreferences.eveningEnabled || pushBusy}
                  onChange={(event) => void saveReminderPreferences({ ...pushPreferences, eveningTime: event.target.value })}
                />
                <input
                  type="checkbox"
                  aria-label="Enable evening reminder"
                  checked={pushPreferences.eveningEnabled}
                  disabled={pushBusy}
                  onChange={(event) => void saveReminderPreferences({ ...pushPreferences, eveningEnabled: event.target.checked })}
                />
              </label>
            </div>
          ) : (
            <div className="settings-notification-setup settings-notification-setup--enable">
              <i className="ti ti-bell-ringing" aria-hidden="true" />
              <div>
                <strong>Make today count</strong>
                <p>Get a morning planning nudge at 8:00 and an evening streak check at 7:00.</p>
                <button type="button" className="settings-enable-notifications tap-target" disabled={pushBusy || !pushState} onClick={() => void enableReminders()}>
                  {pushBusy ? 'Turning on…' : 'Turn on daily reminders'}
                </button>
              </div>
            </div>
          )}
          {pushMessage ? <p className="settings-notification-status" role="status">{pushMessage}</p> : null}
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
            detail="How PawStreak handles account, location, and photo data."
            onClick={() => window.location.assign(ROUTES.privacy)}
          />
          <SettingsIconRow
            icon="ti-file-text"
            title="Terms of service"
            detail="The terms for using PawStreak."
            onClick={() => window.location.assign(ROUTES.terms)}
          />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="st-section-label settings-section-label">Support</h2>
        <div className="settings-group settings-group--stitch">
          <SettingsIconRow
            icon="ti-help-circle"
            title="Support"
            detail="Get help with your account or report a problem."
            onClick={() => window.location.assign(ROUTES.support)}
          />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="st-section-label settings-section-label">Feedback</h2>
        <div className="settings-group settings-group--stitch">
          <SettingsIconRow
            icon="ti-message-circle"
            title="Feedback"
            detail="Email feedback to the PawStreak team."
            onClick={() => window.location.assign('mailto:hello@pawstreakapp.com?subject=PawStreak%20Feedback')}
          />
        </div>
      </section>

      {!isDemoMode && onDeleteAccount ? (
        <section className="settings-section settings-danger-zone">
          <h2 className="st-section-label settings-section-label">Account deletion</h2>
          <p className="settings-location-copy">Permanently removes your account, dog profiles, adventures, memories, pack access, and stored photos.</p>
          {!deleteArmed ? (
            <button type="button" className="settings-delete-account tap-target" onClick={() => setDeleteArmed(true)}>Delete account</button>
          ) : (
            <div className="settings-delete-confirm">
              <p>This cannot be undone. Delete your PawStreak account?</p>
              <div className="settings-delete-actions">
                <button type="button" className="settings-delete-account tap-target" disabled={deleting} onClick={() => {
                  setDeleting(true)
                  setDeleteError(null)
                  void onDeleteAccount().catch((error) => {
                    setDeleteError(error instanceof Error ? error.message : 'Could not delete account.')
                    setDeleting(false)
                  })
                }}>{deleting ? 'Deleting…' : 'Yes, permanently delete'}</button>
                <button type="button" className="settings-cancel-delete tap-target" disabled={deleting} onClick={() => setDeleteArmed(false)}>Cancel</button>
              </div>
              {deleteError ? <p className="demo-feedback-status" role="alert">{deleteError}</p> : null}
            </div>
          )}
        </section>
      ) : null}

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
