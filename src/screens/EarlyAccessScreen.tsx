import { useState, type FormEvent } from 'react'
import { navigateTo } from '../lib/demoRoute'
import { insertEarlyAccessSignup } from '../lib/db/earlyAccess'
import { trackUserEvent } from '../lib/db/userEvents'
import { isSupabaseConfigured } from '../lib/supabase'

export function EarlyAccessScreen() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [dogName, setDogName] = useState('')
  const [zipOrCity, setZipOrCity] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.includes('@')) return

    setLoading(true)
    setError(null)

    if (isSupabaseConfigured()) {
      const result = await insertEarlyAccessSignup({
        email,
        name,
        dogName,
        zipOrCity,
        instagramHandle,
        source: 'landing',
      })

      if (!result.ok) {
        setError('Could not save signup. Please try again.')
        setLoading(false)
        return
      }

      await trackUserEvent('early_access_joined', { email, source: 'landing' })
    }

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="content-studio early-access-page">
      <header className="cs-header detail-tint detail-tint--warm">
        <div className="cs-kicker">PawStreak</div>
        <h1 className="cs-title">Early access</h1>
        <p className="cs-subtitle">
          Plan adventures, save memories, and build your dog&apos;s story — starting in San
          Diego.
        </p>
      </header>

      <div className="cs-filters early-access-form-wrap">
        {submitted ? (
          <div className="cs-empty early-access-success">
            <p>You&apos;re on the list. We&apos;ll reach out when your spot opens.</p>
            <button type="button" className="cs-copy tap-target" onClick={() => navigateTo('/')}>
              Open PawStreak
            </button>
          </div>
        ) : (
          <form className="early-access-form" onSubmit={handleSubmit}>
            <label className="fb-search">
              <span className="cs-filter-label">Email</span>
              <input
                className="fb-search-input"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
              />
            </label>
            <label className="fb-search">
              <span className="cs-filter-label">Your name</span>
              <input
                className="fb-search-input"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="First name"
              />
            </label>
            <label className="fb-search">
              <span className="cs-filter-label">Dog name</span>
              <input
                className="fb-search-input"
                type="text"
                value={dogName}
                onChange={(event) => setDogName(event.target.value)}
                placeholder="Bailey, Luna, etc."
              />
            </label>
            <label className="fb-search">
              <span className="cs-filter-label">ZIP or city</span>
              <input
                className="fb-search-input"
                type="text"
                value={zipOrCity}
                onChange={(event) => setZipOrCity(event.target.value)}
                placeholder="92123 or San Diego"
              />
            </label>
            <label className="fb-search">
              <span className="cs-filter-label">Instagram (optional)</span>
              <input
                className="fb-search-input"
                type="text"
                value={instagramHandle}
                onChange={(event) => setInstagramHandle(event.target.value)}
                placeholder="@yourhandle"
              />
            </label>
            {error ? <p className="fb-hint">{error}</p> : null}
            <button type="submit" className="demo-feedback-btn" disabled={loading}>
              {loading ? 'Saving…' : 'Join early access'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
