import { useEffect, useMemo, useState } from 'react'
import {
  exportDemoFeedbackJson,
  feedbackMatchesQuery,
  isSupabaseConfigured,
  loadFeedbackForDashboard,
  type DemoFeedbackListItem,
} from '../../lib/demoFeedback'
import {
  getHighSignalIds,
  toggleHighSignal,
} from '../../lib/feedbackDashboardPrefs'

async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}

function FeedbackCard({
  item,
  isHighSignal,
  onToggleHighSignal,
}: {
  item: DemoFeedbackListItem
  isHighSignal: boolean
  onToggleHighSignal: () => void
}) {
  const fields = [
    { label: 'What is it for?', value: item.whatIsItFor },
    { label: 'Would use with dog', value: item.wouldUseWithDog },
    { label: 'What confused', value: item.whatConfused },
    { label: 'What liked most', value: item.whatLikedMost },
    { label: 'Premium value', value: item.premiumValue },
  ]

  return (
    <article
      className={`cs-card fb-card${isHighSignal ? ' cs-card--favorite fb-card--high-signal' : ''}`}
    >
      <div className="fb-card-head">
        <div>
          <div className="cs-card-title">{formatDate(item.submittedAt)}</div>
          <div className="cs-card-id">{item.id}</div>
        </div>
        <div className="cs-badges">
          <span className="cs-badge cs-badge--type">{item.origin}</span>
          {item.source ? <span className="cs-badge">{item.source}</span> : null}
          {isHighSignal ? <span className="cs-badge cs-badge--launch">High signal</span> : null}
        </div>
      </div>

      {item.pagePath ? (
        <div className="fb-meta-line">
          <span className="fb-meta-label">Path</span>
          <code>{item.pagePath}</code>
        </div>
      ) : null}

      <div className="fb-fields">
        {fields.map((field) =>
          field.value.trim() ? (
            <div key={field.label} className="cs-copy-field">
              <div className="cs-copy-title">{field.label}</div>
              <p className="cs-copy-text">{field.value}</p>
            </div>
          ) : null,
        )}
      </div>

      <div className="cs-card-actions">
        <button
          type="button"
          className={`cs-action tap-target${isHighSignal ? ' cs-action--on' : ''}`}
          onClick={onToggleHighSignal}
        >
          {isHighSignal ? '★ High signal' : '☆ Tag high signal'}
        </button>
        <button
          type="button"
          className="cs-action tap-target"
          onClick={() => copyText(JSON.stringify(item, null, 2))}
        >
          Copy entry
        </button>
      </div>
    </article>
  )
}

export function FeedbackDashboard() {
  const [items, setItems] = useState<DemoFeedbackListItem[]>([])
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [highSignalOnly, setHighSignalOnly] = useState(false)
  const [highSignalIds, setHighSignalIds] = useState(getHighSignalIds)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const supabaseReady = isSupabaseConfigured()

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const result = await loadFeedbackForDashboard()
        if (cancelled) return
        setItems(result.items)
        setDataSource(result.source)
        if (supabaseReady && result.source === 'supabase' && result.items.length === 0) {
          setLoadError('Supabase connected — no submissions yet.')
        }
      } catch {
        if (!cancelled) {
          setItems([])
          setDataSource('local')
          setLoadError('Could not load Supabase feedback. Check env and RLS policies.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [supabaseReady])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (highSignalOnly && !highSignalIds.has(item.id)) return false
      return query.trim().length === 0 || feedbackMatchesQuery(item, query)
    })
  }, [items, query, highSignalOnly, highSignalIds])

  const handleCopyAll = async () => {
    await copyText(exportDemoFeedbackJson(filtered))
    setActionMessage('Filtered feedback copied to clipboard.')
    window.setTimeout(() => setActionMessage(null), 1800)
  }

  const handleExportAll = () => {
    const json = exportDemoFeedbackJson(filtered)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `pawstreak-feedback-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setActionMessage('Feedback JSON downloaded.')
    window.setTimeout(() => setActionMessage(null), 1800)
  }

  return (
    <div className="content-studio">
      <header className="cs-header detail-tint detail-tint--warm">
        <div className="cs-kicker">PawStreak internal</div>
        <h1 className="cs-title">Feedback Dashboard</h1>
        <p className="cs-subtitle">
          Centralized demo tester feedback
          {supabaseReady ? ' via Supabase' : ' from this browser only'}.
        </p>
        <p className="cs-meta">
          {loading ? 'Loading…' : `${items.length} total · showing ${filtered.length}`}
          {' · '}
          Source: {dataSource}
          {highSignalIds.size > 0 ? ` · ${highSignalIds.size} high-signal tags` : ''}
        </p>
      </header>

      <div className="cs-analytics">
        <div className="cs-stat">
          <span className="cs-stat-value">{items.length}</span>
          <span className="cs-stat-label">Total</span>
        </div>
        <div className="cs-stat">
          <span className="cs-stat-value">{filtered.length}</span>
          <span className="cs-stat-label">Filtered</span>
        </div>
        <div className="cs-stat">
          <span className="cs-stat-value">{highSignalIds.size}</span>
          <span className="cs-stat-label">High signal</span>
        </div>
        <div className="cs-stat">
          <span className="cs-stat-value">{supabaseReady ? 'On' : 'Off'}</span>
          <span className="cs-stat-label">Supabase</span>
        </div>
      </div>

      <div className="cs-filters">
        <label className="fb-search">
          <span className="cs-filter-label">Search</span>
          <input
            className="fb-search-input"
            type="search"
            placeholder="Keyword across answers, path, user agent…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="cs-filter-row">
          <span className="cs-filter-label">View</span>
          <div className="cs-filter-chips">
            <button
              type="button"
              className={`cs-chip tap-target${!highSignalOnly ? ' on' : ''}`}
              onClick={() => setHighSignalOnly(false)}
            >
              All
            </button>
            <button
              type="button"
              className={`cs-chip tap-target${highSignalOnly ? ' on' : ''}`}
              onClick={() => setHighSignalOnly(true)}
            >
              High signal only
            </button>
          </div>
        </div>
        <div className="fb-toolbar">
          <button type="button" className="cs-copy tap-target" onClick={handleCopyAll}>
            Copy JSON
          </button>
          <button type="button" className="cs-copy tap-target" onClick={handleExportAll}>
            Export JSON
          </button>
        </div>
        {!supabaseReady ? (
          <p className="fb-hint">
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to load
            centralized feedback. See <code>supabase/README.md</code>.
          </p>
        ) : null}
        {loadError ? <p className="fb-hint">{loadError}</p> : null}
        {actionMessage ? (
          <p className="demo-feedback-status" role="status">
            {actionMessage}
          </p>
        ) : null}
      </div>

      <div className="cs-grid">
        {loading ? (
          <div className="cs-empty">Loading feedback…</div>
        ) : filtered.length === 0 ? (
          <div className="cs-empty">No feedback matches these filters.</div>
        ) : (
          filtered.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              isHighSignal={highSignalIds.has(item.id)}
              onToggleHighSignal={() => setHighSignalIds(toggleHighSignal(item.id))}
            />
          ))
        )}
      </div>

      <footer className="cs-footer">
        <p className="cs-footer-note">
          Internal only · high-signal tags saved in localStorage · demo submissions use key{' '}
          <code>pawstreak:demo-feedback</code>
        </p>
      </footer>
    </div>
  )
}
