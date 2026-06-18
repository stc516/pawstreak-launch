import { useState } from 'react'
import type { PackInviteAccessLevel, PackInviteRole } from '../../data/demo'
import {
  PACK_INVITE_ACCESS_LEVELS,
  PACK_INVITE_ROLES,
} from '../../data/demo'
import { StatusBar } from '../../components/StatusBar'

export interface PackInvitePayload {
  name: string
  contact: string
  role: PackInviteRole
  accessLevels: PackInviteAccessLevel[]
}

interface PackInviteOverlayProps {
  onClose: () => void
  onSubmit: (payload: PackInvitePayload) => void
}

export function PackInviteOverlay({ onClose, onSubmit }: PackInviteOverlayProps) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [role, setRole] = useState<PackInviteRole>('Family')
  const [accessLevels, setAccessLevels] = useState<PackInviteAccessLevel[]>([
    'View memories',
    'Suggest adventures',
  ])

  const toggleAccess = (level: PackInviteAccessLevel) => {
    setAccessLevels((current) =>
      current.includes(level)
        ? current.filter((item) => item !== level)
        : [...current, level],
    )
  }

  const handleSubmit = () => {
    const trimmed = name.trim()
    const contactLabel = contact.trim()
    if (!trimmed || !contactLabel || accessLevels.length === 0) return
    onSubmit({ name: trimmed, contact: contactLabel, role, accessLevels })
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
              So they never miss the little moments — even from far away.
            </p>
          </div>

          <div className="pack-invite-form detail-card-warm">
          <label className="pack-invite-field">
            <span className="pack-invite-label">Name</span>
            <input
              className="field-input"
              type="text"
              placeholder="e.g. Dog Mom"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="pack-invite-field">
            <span className="pack-invite-label">Email or phone</span>
            <input
              className="field-input"
              type="text"
              inputMode="email"
              placeholder="name@example.com"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
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
            <span className="pack-invite-label">Access level</span>
            <div className="pack-invite-access">
              {PACK_INVITE_ACCESS_LEVELS.map((level) => {
                const selected = accessLevels.includes(level)
                return (
                  <button
                    key={level}
                    type="button"
                    className={`pack-access-chip tap-target${selected ? ' on' : ''}`}
                    aria-pressed={selected}
                    onClick={() => toggleAccess(level)}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
          </div>
          </div>

          <button
            type="button"
            className="pack-invite-submit tap-target"
            onClick={handleSubmit}
            disabled={!name.trim() || !contact.trim() || accessLevels.length === 0}
          >
            Save pending invite
          </button>
          <p className="pack-invite-note">
            Pending invites save now; email/SMS delivery is the next backend step.
          </p>
        </main>
      </div>
    </div>
  )
}
