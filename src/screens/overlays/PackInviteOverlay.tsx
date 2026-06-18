import { useState } from 'react'
import type { PackInviteRole } from '../../data/demo'
import { PACK_INVITE_ROLES } from '../../data/demo'
import { inviteDescriptionForRole } from '../../data/packAccess'
import { StatusBar } from '../../components/StatusBar'

export interface PackInvitePayload {
  email: string
  role: PackInviteRole
}

interface PackInviteOverlayProps {
  onClose: () => void
  onSubmit: (payload: PackInvitePayload) => void | Promise<void>
}

export function PackInviteOverlay({ onClose, onSubmit }: PackInviteOverlayProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<PackInviteRole>('Member')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail.includes('@') || isSubmitting) return
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({ email: trimmedEmail, role })
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Could not send invite. Please try again.'
      setError(message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll scroll--overlay">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back tap-target" onClick={onClose}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Back
            </button>
          </div>

          <div className="pack-invite-header detail-tint detail-tint--warm">
            <div className="pack-invite-intro">Pack Access</div>
            <h1 className="pack-invite-title">Invite someone to your pack</h1>
            <p className="pack-invite-sub">
              Email-only for the first version. SMS comes later.
            </p>
          </div>

          <div className="pack-invite-form detail-card-warm">
          <label className="pack-invite-field">
            <span className="pack-invite-label">Email</span>
            <input
              className="field-input"
              type="email"
              inputMode="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="pack-invite-field">
            <span className="pack-invite-label">Role</span>
            <select
              className="field-input"
              value={role}
              onChange={(event) => setRole(event.target.value as PackInviteRole)}
            >
              {PACK_INVITE_ROLES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="pack-invite-field">
            <span className="pack-invite-label">What they can do</span>
            <div className="pack-invite-role-note">
              {inviteDescriptionForRole(role)}
            </div>
          </div>
          </div>

          {error ? (
            <p className="demo-feedback-status" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            className="pack-invite-submit tap-target"
            onClick={handleSubmit}
            disabled={!email.trim().includes('@') || isSubmitting}
          >
            {isSubmitting ? 'Sending invite…' : 'Send invite'}
          </button>
          <p className="pack-invite-note">
            Invites expire after 14 days. Owners can send up to 10 invites per day.
          </p>
        </main>
      </div>
    </div>
  )
}
