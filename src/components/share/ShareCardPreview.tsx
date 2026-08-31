import { useRef, useState } from 'react'
import { toBlob } from 'html-to-image'
import type { ShareCardData, ShareCardFormat, ShareCardSpot } from '../../types/shareCards'
import { shareContent } from '../../lib/shareContent'

interface ShareCardPreviewProps {
  data: ShareCardData
  onClose: () => void
}

function ShareMetricGrid({ data }: { data: ShareCardData }) {
  if (!data.metrics || data.metrics.length === 0) return null
  return (
    <div className="share-card-metrics">
      {data.metrics.slice(0, 4).map((metric) => (
        <div key={`${metric.label}-${metric.value}`} className="share-card-metric">
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </div>
      ))}
    </div>
  )
}

function ShareProgress({ data }: { data: ShareCardData }) {
  if (!data.progressLabel && data.progressPercent === undefined) return null
  return (
    <div className="share-card-progress">
      <div className="share-card-progress-row">
        <span>Progress</span>
        <strong>{data.progressLabel ?? `${data.progressPercent}%`}</strong>
      </div>
      <div className="share-card-progress-track">
        <span style={{ width: `${Math.min(100, data.progressPercent ?? 0)}%` }} />
      </div>
    </div>
  )
}

function ShareSlots({ data }: { data: ShareCardData }) {
  if (!data.slots || data.slots.length === 0) return null
  return (
    <div className="share-card-slots">
      {data.slots.slice(0, 6).map((slot, index) => (
        <div
          key={`${slot.label}-${index}`}
          className={`share-card-slot share-card-slot--${slot.status ?? 'open'}`}
        >
          <span>{index + 1}</span>
          <strong>{slot.label}</strong>
        </div>
      ))}
    </div>
  )
}

function ShareSpots({ spots }: { spots?: ShareCardSpot[] }) {
  if (!spots || spots.length === 0) return null
  return (
    <div className="share-card-spots">
      {spots.slice(0, 3).map((spot) => (
        <div key={spot.name} className="share-card-spot">
          <div
            className="share-card-spot-art"
            style={spot.imageUrl ? { backgroundImage: `url("${spot.imageUrl}")` } : undefined}
          />
          <div>
            <strong>{spot.name}</strong>
            <span>{spot.meta}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ShareHeroVisual({ data }: { data: ShareCardData }) {
  return (
    <div className={`share-card-visual share-card-visual--${data.kind}`}>
      {data.imageUrl ? (
        <div
          className="share-card-photo"
          style={{ backgroundImage: `url("${data.imageUrl}")` }}
        />
      ) : (
        <div className="share-card-photo share-card-photo--empty">
          <img src="/pawstreak-logo.png" alt="" />
        </div>
      )}
      {data.badgeEmoji ? (
        <div className="share-card-badge" aria-hidden="true">
          {data.badgeEmoji}
        </div>
      ) : null}
      {data.category ? <span className="share-card-category">{data.category}</span> : null}
    </div>
  )
}

function AdventureCompleteTemplate({ data }: { data: ShareCardData }) {
  return (
    <>
      <ShareHeroVisual data={data} />
      <ShareMetricGrid data={data} />
      <ShareProgress data={data} />
    </>
  )
}

function MonthlyRecapTemplate({ data }: { data: ShareCardData }) {
  return (
    <>
      <ShareHeroVisual data={data} />
      <ShareMetricGrid data={data} />
      <ShareSlots data={data} />
    </>
  )
}

function ChallengeProgressTemplate({ data }: { data: ShareCardData }) {
  return (
    <>
      <ShareHeroVisual data={data} />
      <ShareProgress data={data} />
      <ShareSlots data={data} />
    </>
  )
}

function AchievementUnlockedTemplate({ data }: { data: ShareCardData }) {
  return (
    <>
      <ShareHeroVisual data={data} />
      <div className="share-card-unlocked">
        <span>{data.dateLabel}</span>
        <strong>{data.dogNames}</strong>
      </div>
      <ShareProgress data={data} />
    </>
  )
}

function PlanNextTemplate({ data }: { data: ShareCardData }) {
  return (
    <>
      <ShareHeroVisual data={data} />
      <ShareSpots spots={data.spots} />
      <ShareMetricGrid data={data} />
    </>
  )
}

function renderTemplate(data: ShareCardData) {
  if (data.kind === 'monthly-recap') return <MonthlyRecapTemplate data={data} />
  if (data.kind === 'challenge-progress') return <ChallengeProgressTemplate data={data} />
  if (data.kind === 'achievement-unlocked') return <AchievementUnlockedTemplate data={data} />
  if (data.kind === 'plan-next' || data.kind === 'founder-demo') {
    return <PlanNextTemplate data={data} />
  }
  return <AdventureCompleteTemplate data={data} />
}

function buildShareText(data: ShareCardData): string {
  return `${data.eyebrow}\n${data.title}\n${data.subtitle}\n\n${data.cta}`
}

function getShareFileName(data: ShareCardData, format: ShareCardFormat): string {
  const safeTitle = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 42)
  return `pawstreak-${safeTitle || data.kind}-${format}.png`
}

export function ShareCardPreview({ data, onClose }: ShareCardPreviewProps) {
  const [format, setFormat] = useState<ShareCardFormat>('story')
  const [status, setStatus] = useState<string | null>(null)
  const cardRef = useRef<HTMLElement | null>(null)

  const renderCardBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null
    return toBlob(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#FAF7F2',
    })
  }

  const createShareCardFile = async (): Promise<File | null> => {
    const blob = await renderCardBlob()
    if (!blob) return null
    return new File([blob], getShareFileName(data, format), { type: 'image/png' })
  }

  const downloadCardFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const handleShare = async () => {
    setStatus('Preparing card...')
    const file = await createShareCardFile()
    const result = await shareContent({
      title: `${data.title} · PawStreak`,
      text: buildShareText(data),
      files: file ? [file] : undefined,
    })
    setStatus(result.message)
    window.setTimeout(() => setStatus(null), 2600)
  }

  const handleSave = async () => {
    setStatus('Preparing image...')
    const file = await createShareCardFile()
    if (!file) {
      setStatus('Could not create image.')
      window.setTimeout(() => setStatus(null), 2600)
      return
    }

    if (typeof navigator.share === 'function') {
      const filesOnlyPayload: ShareData = { files: [file] }
      let canShareImage = typeof navigator.canShare !== 'function'
      if (!canShareImage) {
        try {
          canShareImage = navigator.canShare(filesOnlyPayload)
        } catch {
          canShareImage = false
        }
      }
      if (canShareImage) {
        try {
          await navigator.share(filesOnlyPayload)
          setStatus('Choose “Save Image” to add it to Photos.')
          window.setTimeout(() => setStatus(null), 2600)
          return
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            setStatus('Save cancelled.')
            window.setTimeout(() => setStatus(null), 2600)
            return
          }
        }
      }
    }

    downloadCardFile(file)
    setStatus('Downloaded image. If needed, open it and save to Photos.')
    window.setTimeout(() => setStatus(null), 2600)
  }

  return (
    <div className="share-preview-overlay">
      <button
        type="button"
        className="share-preview-backdrop"
        aria-label="Close share preview"
        onClick={onClose}
      />
      <div className="share-preview-shell" role="dialog" aria-modal="true">
        <div className="share-preview-topbar">
          <button type="button" className="share-preview-close tap-target" aria-label="Close share preview" onClick={onClose}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
          <div className="share-preview-title">Share the adventure</div>
          <button type="button" className="share-preview-share tap-target" onClick={() => void handleShare()}>
            <i className="ti ti-brand-instagram" aria-hidden="true" />
            Instagram
          </button>
        </div>

        <div className="share-format-toggle" aria-label="Share card format">
          <button
            type="button"
            className={format === 'story' ? 'on' : ''}
            onClick={() => setFormat('story')}
          >
            Story 9:16
          </button>
          <button
            type="button"
            className={format === 'feed' ? 'on' : ''}
            onClick={() => setFormat('feed')}
          >
            Feed 4:5
          </button>
        </div>

        <div className="share-card-stage">
          <article
            ref={cardRef}
            className={`share-card share-card--${format} share-card--${data.kind}`}
          >
            <div className="share-card-brand">PawStreak</div>
            <div className="share-card-head">
              <div className="share-card-eyebrow">{data.eyebrow}</div>
              <h1>{data.title}</h1>
              <p>{data.subtitle}</p>
            </div>
            {renderTemplate(data)}
            <div className="share-card-footer">
              <strong>{data.cta}</strong>
              <span>{data.brandLine ?? 'PawStreak'}</span>
            </div>
          </article>
        </div>

        <p className="share-preview-note">
          We create the image, then open your phone’s share sheet. Pick Instagram to post, or Save Image to add it to Photos.
        </p>
        <button type="button" className="share-preview-save tap-target" onClick={() => void handleSave()}>
          <i className="ti ti-photo-plus" aria-hidden="true" />
          Save to Photos
        </button>
        {status ? (
          <div className="share-preview-status" role="status">
            {status}
          </div>
        ) : null}
      </div>
    </div>
  )
}
