export interface AdventureCompletionRewardRow {
  id: string
  label: string
  detail?: string
  icon: string
  tone?: 'default' | 'progress' | 'unlock'
}

export interface AdventureCompletionSummary {
  memoryId: string
  dogLabel: string
  placeName: string
  category?: string
  durationLabel?: string
  photoCount: number
  rows: AdventureCompletionRewardRow[]
}

interface AdventureCompletionRewardProps {
  summary: AdventureCompletionSummary
  onViewMemory: () => void
  onFindNextAdventure: () => void
  onClose: () => void
}

function formatPhotoCount(count: number): string {
  if (count === 0) return 'No photos needed'
  if (count === 1) return '1 photo saved'
  return `${count} photos saved`
}

export function AdventureCompletionReward({
  summary,
  onViewMemory,
  onFindNextAdventure,
  onClose,
}: AdventureCompletionRewardProps) {
  return (
    <div className="completion-reward" role="dialog" aria-modal="true" aria-labelledby="completion-reward-title">
      <button
        type="button"
        className="completion-reward-backdrop tap-target"
        aria-label="Close adventure reward"
        onClick={onClose}
      />
      <section className="completion-reward-sheet detail-card-warm">
        <div className="completion-reward-handle" aria-hidden="true" />
        <div className="completion-reward-hero">
          <div className="completion-reward-badge" aria-hidden="true">
            <i className="ti ti-map-check" />
          </div>
          <div>
            <div className="completion-reward-kicker">Adventure complete</div>
            <h1 id="completion-reward-title" className="completion-reward-title">
              Adventure saved.
            </h1>
            <p className="completion-reward-copy">
              You gave {summary.dogLabel} a good day at {summary.placeName}.
            </p>
          </div>
        </div>

        <div className="completion-reward-meta">
          {summary.category ? <span>{summary.category}</span> : null}
          {summary.durationLabel ? <span>{summary.durationLabel}</span> : null}
          <span>{formatPhotoCount(summary.photoCount)}</span>
        </div>

        <div className="completion-reward-list">
          {summary.rows.map((row) => (
            <div
              key={row.id}
              className={`completion-reward-row completion-reward-row--${row.tone ?? 'default'}`}
            >
              <span className="completion-reward-row-icon" aria-hidden="true">
                <i className={`ti ${row.icon}`} />
              </span>
              <span className="completion-reward-row-copy">
                <strong>{row.label}</strong>
                {row.detail ? <small>{row.detail}</small> : null}
              </span>
            </div>
          ))}
        </div>

        <div className="completion-reward-actions">
          <button type="button" className="completion-reward-primary tap-target" onClick={onViewMemory}>
            View Memory
          </button>
          <button type="button" className="completion-reward-secondary tap-target" onClick={onFindNextAdventure}>
            Find Next Adventure
          </button>
        </div>
      </section>
    </div>
  )
}
