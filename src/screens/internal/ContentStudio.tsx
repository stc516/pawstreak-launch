import { useCallback, useEffect, useMemo, useState } from 'react'
import { FUTURE_CONTENT_CHANNELS, type SocialAccount } from '../../data/socialContentCopy'
import {
  buildSocialStudioCatalog,
  getStudioAnalytics,
  SOCIAL_ASSET_FOLDERS,
  SOCIAL_ASSETS_ROOT,
  SOCIAL_STUDIO_CORE_LINE,
  SOCIAL_STUDIO_GENERATED_AT,
  sortStudioItems,
  type SocialAssetType,
  type SocialPlatform,
  type SocialStudioItem,
  type StudioSortMode,
} from '../../lib/socialStudioCatalog'
import {
  getFavoriteIds,
  getPostedIds,
  toggleFavorite,
  togglePosted,
} from '../../lib/socialStudioPrefs'

type AccountFilter = 'all' | SocialAccount
type PlatformFilter = 'all' | SocialPlatform
type TypeFilter = 'all' | SocialAssetType
type TagFilter = 'all' | 'launch-week'

const CATALOG = buildSocialStudioCatalog()

async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}

function CopyButton({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      className="cs-copy tap-target"
      onClick={async () => {
        await copyText(text)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      }}
    >
      {copied ? 'Copied' : label}
    </button>
  )
}

function resolveAccountFocus(
  item: SocialStudioItem,
  accountFilter: AccountFilter,
): SocialAccount {
  const primaryAccount: SocialAccount =
    item.recommendedAccount === 'Both' ? 'PawStreakApp' : item.recommendedAccount
  return accountFilter === 'all' ? primaryAccount : accountFilter
}

function StudioCard({
  item,
  accountFocus,
  isFavorite,
  isPosted,
  isFocused,
  onToggleFavorite,
  onTogglePosted,
  onFocus,
}: {
  item: SocialStudioItem
  accountFocus: AccountFilter
  isFavorite: boolean
  isPosted: boolean
  isFocused: boolean
  onToggleFavorite: () => void
  onTogglePosted: () => void
  onFocus: () => void
}) {
  const focus = resolveAccountFocus(item, accountFocus)
  const copy = item[focus]
  const isLaunchWeek = item.tags.includes('launch-week')

  return (
    <article
      className={`cs-card${isPosted ? ' cs-card--posted' : ''}${isFavorite ? ' cs-card--favorite' : ''}${isFocused ? ' cs-card--focused' : ''}`}
      tabIndex={0}
      onFocus={onFocus}
      aria-label={`${item.title} asset card`}
    >
      <div className="cs-card-top">
        <div className="cs-preview">
          {item.type === 'video' ? (
            <video
              className="cs-preview-media"
              src={item.mediaUrl}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
            />
          ) : (
            <img className="cs-preview-media" src={item.mediaUrl} alt={item.title} />
          )}
        </div>
        <div className="cs-card-meta">
          <div className="cs-card-title">{item.title}</div>
          <div className="cs-card-id">{item.id}</div>
          <div className="cs-card-screen">{item.screen}</div>
          <div className="cs-asset-path">
            <code>{item.fullAssetPath}</code>
            <CopyButton label="Copy path" text={item.fullAssetPath} />
          </div>
          <div className="cs-badges">
            <span className="cs-badge cs-badge--type">{item.type}</span>
            <span className="cs-badge">{item.recommendedPlatform}</span>
            <span className="cs-badge cs-badge--account">{item.recommendedAccount}</span>
            {isLaunchWeek ? (
              <span className="cs-badge cs-badge--launch">Launch Week</span>
            ) : null}
            {isFavorite ? <span className="cs-badge cs-badge--fav">★ Favorite</span> : null}
            {isPosted ? <span className="cs-badge cs-badge--posted">Posted</span> : null}
          </div>
        </div>
      </div>

      {isFocused ? (
        <div className="cs-shortcuts" aria-hidden="true">
          Shortcuts: C copy caption · F favorite · P mark posted
        </div>
      ) : null}

      <div className="cs-copy-block">
        <div className="cs-copy-label">
          Copy · {focus === 'PawStreakApp' ? 'PawStreakApp' : 'BaileyHuskyCream'}
        </div>
        <div className="cs-copy-field">
          <div className="cs-copy-title">Caption</div>
          <p className="cs-copy-text">{copy.caption}</p>
          <CopyButton label="Copy caption" text={copy.caption} />
        </div>
        <div className="cs-copy-field">
          <div className="cs-copy-title">Reel / TikTok hook</div>
          <p className="cs-copy-text">{copy.hook}</p>
          <CopyButton label="Copy hook" text={copy.hook} />
        </div>
        <div className="cs-copy-field">
          <div className="cs-copy-title">Story text</div>
          <p className="cs-copy-text">{copy.storyText}</p>
          <CopyButton label="Copy story text" text={copy.storyText} />
        </div>
      </div>

      <div className="cs-card-actions">
        <button
          type="button"
          className={`cs-action tap-target${isFavorite ? ' cs-action--on' : ''}`}
          onClick={onToggleFavorite}
        >
          {isFavorite ? '★ Favorited' : '☆ Favorite'}
        </button>
        <button
          type="button"
          className={`cs-action tap-target${isPosted ? ' cs-action--on' : ''}`}
          onClick={onTogglePosted}
        >
          {isPosted ? '✓ Posted' : 'Mark posted'}
        </button>
        <a
          className="cs-action cs-action--link tap-target"
          href={item.mediaUrl}
          download={item.assetPath.split('/').pop()}
        >
          Download
        </a>
      </div>
    </article>
  )
}

function StudioAnalyticsBar({
  analytics,
}: {
  analytics: ReturnType<typeof getStudioAnalytics>
}) {
  return (
    <div className="cs-analytics">
      <div className="cs-stat">
        <span className="cs-stat-value">{analytics.total}</span>
        <span className="cs-stat-label">Total assets</span>
      </div>
      <div className="cs-stat">
        <span className="cs-stat-value">{analytics.posted}</span>
        <span className="cs-stat-label">Posted</span>
      </div>
      <div className="cs-stat">
        <span className="cs-stat-value">{analytics.favorites}</span>
        <span className="cs-stat-label">Favorites</span>
      </div>
      <div className="cs-stat">
        <span className="cs-stat-value">{analytics.screenshots}</span>
        <span className="cs-stat-label">Screenshots</span>
      </div>
      <div className="cs-stat">
        <span className="cs-stat-value">{analytics.stories}</span>
        <span className="cs-stat-label">Stories</span>
      </div>
      <div className="cs-stat">
        <span className="cs-stat-value">{analytics.reels}</span>
        <span className="cs-stat-label">Reels</span>
      </div>
    </div>
  )
}

export function ContentStudio() {
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [tagFilter, setTagFilter] = useState<TagFilter>('all')
  const [sortMode, setSortMode] = useState<StudioSortMode>('default')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState(getFavoriteIds)
  const [postedIds, setPostedIds] = useState(getPostedIds)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [pathCopied, setPathCopied] = useState(false)

  const analytics = useMemo(
    () => getStudioAnalytics(CATALOG, favoriteIds, postedIds),
    [favoriteIds, postedIds],
  )

  const filtered = useMemo(() => {
    const items = CATALOG.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      if (platformFilter !== 'all' && !item.platforms.includes(platformFilter)) return false
      if (accountFilter !== 'all') {
        if (item.recommendedAccount !== 'Both' && item.recommendedAccount !== accountFilter) {
          return false
        }
      }
      if (tagFilter === 'launch-week' && !item.tags.includes('launch-week')) return false
      if (favoritesOnly && !favoriteIds.has(item.id)) return false
      return true
    })
    return sortStudioItems(items, sortMode)
  }, [
    accountFilter,
    platformFilter,
    typeFilter,
    tagFilter,
    favoritesOnly,
    favoriteIds,
    sortMode,
  ])

  const focusedItem = useMemo(
    () => filtered.find((item) => item.id === focusedId) ?? null,
    [filtered, focusedId],
  )

  const handleKeyboard = useCallback(
    (event: KeyboardEvent) => {
      if (!focusedItem) return
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return
      }

      const account = resolveAccountFocus(focusedItem, accountFilter)
      const caption = focusedItem[account].caption

      if (event.key === 'p' || event.key === 'P') {
        event.preventDefault()
        setPostedIds(togglePosted(focusedItem.id))
      }
      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault()
        setFavoriteIds(toggleFavorite(focusedItem.id))
      }
      if (event.key === 'c' || event.key === 'C') {
        event.preventDefault()
        void copyText(caption)
      }
    },
    [focusedItem, accountFilter],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [handleKeyboard])

  useEffect(() => {
    if (focusedId && !filtered.some((item) => item.id === focusedId)) {
      queueMicrotask(() => setFocusedId(null))
    }
  }, [filtered, focusedId])

  return (
    <div className="content-studio">
      <header className="cs-header detail-tint detail-tint--warm">
        <div className="cs-kicker">PawStreak internal</div>
        <h1 className="cs-title">Content Studio</h1>
        <p className="cs-subtitle">{SOCIAL_STUDIO_CORE_LINE}</p>
        {SOCIAL_STUDIO_GENERATED_AT ? (
          <p className="cs-meta">
            Last capture · {new Date(SOCIAL_STUDIO_GENERATED_AT).toLocaleString()}
          </p>
        ) : null}
        <div className="cs-asset-root">
          <div className="cs-asset-root-row">
            <span className="cs-asset-root-label">Open asset folder</span>
            <code className="cs-asset-root-path">{SOCIAL_ASSETS_ROOT}/</code>
            <button
              type="button"
              className="cs-copy tap-target"
              onClick={async () => {
                await copyText(SOCIAL_ASSETS_ROOT)
                setPathCopied(true)
                window.setTimeout(() => setPathCopied(false), 1600)
              }}
            >
              {pathCopied ? 'Copied' : 'Copy root path'}
            </button>
          </div>
          <p className="cs-asset-root-hint">
            From repo root: <code>open {SOCIAL_ASSETS_ROOT}</code> (macOS Finder) ·{' '}
            <code>{SOCIAL_ASSET_FOLDERS.screenshots}/</code> ·{' '}
            <code>{SOCIAL_ASSET_FOLDERS.stories}/</code> ·{' '}
            <code>{SOCIAL_ASSET_FOLDERS.videos}/</code>
          </p>
        </div>
      </header>

      <StudioAnalyticsBar analytics={analytics} />

      <div className="cs-filters">
        <div className="cs-filter-row">
          <span className="cs-filter-label">Sort</span>
          <div className="cs-filter-chips">
            {(
              [
                ['default', 'Default order'],
                ['recent', 'Recently added'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`cs-chip tap-target${sortMode === value ? ' on' : ''}`}
                onClick={() => setSortMode(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="cs-filter-row">
          <span className="cs-filter-label">Campaign</span>
          <div className="cs-filter-chips">
            <button
              type="button"
              className={`cs-chip tap-target${tagFilter === 'all' ? ' on' : ''}`}
              onClick={() => setTagFilter('all')}
            >
              All campaigns
            </button>
            <button
              type="button"
              className={`cs-chip tap-target${tagFilter === 'launch-week' ? ' on' : ''}`}
              onClick={() => setTagFilter('launch-week')}
            >
              Launch Week
            </button>
          </div>
        </div>
        <div className="cs-filter-row">
          <span className="cs-filter-label">Account</span>
          <div className="cs-filter-chips">
            {(['all', 'PawStreakApp', 'BaileyHuskyCream'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`cs-chip tap-target${accountFilter === value ? ' on' : ''}`}
                onClick={() => setAccountFilter(value)}
              >
                {value === 'all' ? 'All' : value}
              </button>
            ))}
          </div>
        </div>
        <div className="cs-filter-row">
          <span className="cs-filter-label">Platform</span>
          <div className="cs-filter-chips">
            {(['all', 'Instagram', 'TikTok', 'Story', 'Reel'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`cs-chip tap-target${platformFilter === value ? ' on' : ''}`}
                onClick={() => setPlatformFilter(value)}
              >
                {value === 'all' ? 'All' : value}
              </button>
            ))}
          </div>
        </div>
        <div className="cs-filter-row">
          <span className="cs-filter-label">Type</span>
          <div className="cs-filter-chips">
            {(['all', 'screenshot', 'story', 'video'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`cs-chip tap-target${typeFilter === value ? ' on' : ''}`}
                onClick={() => setTypeFilter(value)}
              >
                {value === 'all' ? 'All' : value}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className={`cs-chip cs-chip--toggle tap-target${favoritesOnly ? ' on' : ''}`}
          onClick={() => setFavoritesOnly((current) => !current)}
        >
          {favoritesOnly ? '★ Favorites only' : '☆ Show favorites only'}
        </button>
      </div>

      <div className="cs-grid">
        {filtered.length === 0 ? (
          <div className="cs-empty">No assets match these filters.</div>
        ) : (
          filtered.map((item) => (
            <StudioCard
              key={item.id}
              item={item}
              accountFocus={accountFilter}
              isFavorite={favoriteIds.has(item.id)}
              isPosted={postedIds.has(item.id)}
              isFocused={focusedId === item.id}
              onFocus={() => setFocusedId(item.id)}
              onToggleFavorite={() => setFavoriteIds(toggleFavorite(item.id))}
              onTogglePosted={() => setPostedIds(togglePosted(item.id))}
            />
          ))
        )}
      </div>

      <section className="cs-future" aria-label="Future content channels">
        <div className="cs-future-head">
          <h2 className="cs-future-title">Future channels</h2>
          <p className="cs-future-sub">
            Placeholder buckets — add assets to the catalog when ready.
          </p>
        </div>
        <div className="cs-future-grid">
          {FUTURE_CONTENT_CHANNELS.map((channel) => (
            <div key={channel.tag} className="cs-future-card">
              <div className="cs-future-card-top">
                <span className="cs-future-label">{channel.label}</span>
                <span className="cs-future-count">0 assets</span>
              </div>
              <p className="cs-future-copy">{channel.description}</p>
              <span className="cs-future-tag">tag: {channel.tag}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="cs-footer">
        <p className="cs-footer-note">
          Internal only · not linked in app nav · prefs saved in localStorage · focus a card for
          keyboard shortcuts
        </p>
        <p className="cs-footer-links">
          Docs: <code>social-assets/content-index.md</code> ·{' '}
          <code>social-assets/weekly-posting-plan.md</code>
        </p>
      </footer>
    </div>
  )
}
