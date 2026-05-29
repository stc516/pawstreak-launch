import { useEffect, useState } from 'react'
import type { AppState, CommunityComment } from '../../data/demo'
import { CardImage } from '../../components/CardImage'
import { getMagicLine, getPlaceById } from '../../data/places'
import { CTA_START_FREE } from '../../lib/brand'
import { navigateTo } from '../../lib/demoRoute'
import { ROUTES } from '../../lib/routes'
import { shareContent } from '../../lib/shareContent'

interface CommunityScreenProps {
  state: AppState
  onToggleLike: (postId: string) => void
  onAddComment: (postId: string, text: string) => void
  onQuickShare: (caption: string) => void
  onOpenCompose: () => void
  onDismissToast: () => void
}

function CommunityComingSoon() {
  return (
    <>
      <div className="aheader">
        <div className="alogo">Community</div>
      </div>

      <div className="community-soon detail-card-warm">
        <p className="community-soon-kicker">Coming soon</p>
        <h2 className="community-soon-title">Pack sharing is on the way.</h2>
        <p className="community-soon-copy">
          Community sharing is coming soon — a warm place to cheer on other dog parents,
          swap adventure ideas, and celebrate the good days together.
        </p>
        <div className="community-soon-actions">
          <button
            type="button"
            className="community-soon-btn tap-target"
            onClick={() => navigateTo(ROUTES.app)}
          >
            {CTA_START_FREE}
          </button>
          <a className="community-soon-link" href="mailto:hello@pawstreakapp.com">
            Share feedback
          </a>
        </div>
      </div>
    </>
  )
}

export function CommunityScreen({
  state,
  onToggleLike,
  onAddComment,
  onQuickShare,
  onOpenCompose,
  onDismissToast,
}: CommunityScreenProps) {
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [shareNote, setShareNote] = useState<string | null>(null)
  const [shareIsError, setShareIsError] = useState(false)
  const [quickShareDraft, setQuickShareDraft] = useState('')

  useEffect(() => {
    if (!state.memorySaveToast) return
    const timer = window.setTimeout(onDismissToast, 3200)
    return () => window.clearTimeout(timer)
  }, [state.memorySaveToast, onDismissToast])

  if (state.mode === 'app') {
    return <CommunityComingSoon />
  }

  const activePost = state.communityPosts.find((post) => post.id === commentsPostId)
  const live = state.communityLive

  const handleShare = async (post: AppState['communityPosts'][number]) => {
    setShareNote(null)
    setShareIsError(false)

    const result = await shareContent({
      title: `${post.name} on PawStreak`,
      text: post.caption,
    })

    if (result.ok) {
      setShareNote(result.message)
      setShareIsError(false)
    } else {
      setShareNote(result.message)
      setShareIsError(true)
    }

    window.setTimeout(() => setShareNote(null), 2800)
  }

  const handleSubmitComment = () => {
    if (!commentsPostId || !commentDraft.trim()) return
    onAddComment(commentsPostId, commentDraft.trim())
    setCommentDraft('')
  }

  const handleQuickShare = () => {
    if (!quickShareDraft.trim()) return
    onQuickShare(quickShareDraft.trim())
    setQuickShareDraft('')
  }

  return (
    <>
      <div className="aheader">
        <div className="alogo">Community</div>
      </div>

      <p className="comm-participate">
        Cheer on the pack, share a win, or steal an idea for your next outing.
      </p>

      <div className="comm-top-grid">
        <div className="comm-top-now detail-tint detail-tint--accent">
          <div className="comm-top-now-head">
            <span className="live-dot" aria-hidden="true" />
            <span className="comm-top-now-label">{live.label}</span>
          </div>
          <div className="comm-top-now-count">{live.count}</div>
          <div className="comm-top-now-sublabel">{live.countLabel}</div>
          <div className="comm-top-now-tagline">{live.tagline}</div>
        </div>

        <div className="comm-top-right">
          <div className="comm-top-spot detail-tint detail-tint--warm">
            <div className="comm-top-spot-label">Top spot</div>
            <div className="comm-top-spot-value">{live.topSpot}</div>
            <div className="comm-top-spot-note">{live.topSpotNote}</div>
          </div>

          <button
            type="button"
            className="comm-top-post tap-target detail-card-warm"
            onClick={onOpenCompose}
          >
            <div className="comm-top-post-title">Post to community</div>
            <div className="comm-top-post-note">Share a memory from today</div>
          </button>
        </div>
      </div>

      {live.chips.length > 0 ? (
        <div className="comm-live-chips">
          {live.chips.map((chip) => (
            <div key={chip.label} className="live-chip live-chip--light">
              {chip.label}
            </div>
          ))}
        </div>
      ) : null}

      <div className="comm-quick-share-card detail-card-warm">
        <div className="comm-quick-share-row">
          <input
            className="comm-quick-share-input"
            type="text"
            placeholder="What did your dog do today?"
            value={quickShareDraft}
            onChange={(event) => setQuickShareDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleQuickShare()
            }}
          />
          <button
            type="button"
            className="comm-quick-share-btn tap-target"
            disabled={!quickShareDraft.trim()}
            onClick={handleQuickShare}
          >
            Post
          </button>
        </div>
        <div className="comm-quick-share-note">
          Quick posts are saved locally in this demo.
        </div>
      </div>

      {shareNote || state.memorySaveToast ? (
        <div
          className={`memory-toast${shareIsError ? ' memory-toast--error' : ''}`}
          role={shareIsError ? 'alert' : 'status'}
        >
          {shareNote ?? state.memorySaveToast}
        </div>
      ) : null}

      <div className="sec sec--warm">Stories from the pack</div>

      {state.communityPosts.length === 0 ? (
        <div className="journey-empty detail-card-warm">
          <div className="journey-empty-title">Community is getting started</div>
          <div className="journey-empty-body">
            Share your first adventure when you are ready — your pack will see it here.
          </div>
        </div>
      ) : null}

      <div className="comm-feed">
        {state.communityPosts.map((post) => {
          const place = post.placeId ? getPlaceById(post.placeId) : undefined
          const imageUrl = post.photoUrl ?? place?.imageUrl

          return (
            <article key={post.id} className="comm-post">
              <div className="cp-header">
                <div className={`cp-av ${post.avatarClass}`}>{post.initial}</div>
                <div className="cp-header-text">
                  <div className="cp-name">{post.name}</div>
                  <div className="cp-meta">
                    {post.meta}
                    {place ? ` · ${getMagicLine(place)}` : ''}
                  </div>
                </div>
              </div>
              {imageUrl ? (
                <CardImage
                  className="cp-img"
                  imageUrl={imageUrl}
                  imageAlt={place?.imageAlt ?? post.location}
                  imageTone={place?.imageTone}
                />
              ) : null}
              <div className="cp-body">
                <div className="cp-caption">{post.caption}</div>
                <div className="cp-loc">
                  <i className="ti ti-map-pin" aria-hidden="true" />
                  {post.location}
                </div>
                <div className="cp-actions">
                  <button
                    type="button"
                    className={`cpa tap-target${post.likedByUser ? ' cpa--liked' : ''}`}
                    onClick={() => onToggleLike(post.id)}
                  >
                    <i
                      className={`ti ${post.likedByUser ? 'ti-heart-filled' : 'ti-heart'}`}
                      aria-hidden="true"
                    />
                    {post.likes}
                  </button>
                  <button
                    type="button"
                    className="cpa tap-target"
                    onClick={() => {
                      setCommentsPostId(post.id)
                      setCommentDraft('')
                    }}
                  >
                    <i className="ti ti-message-circle" aria-hidden="true" />
                    {post.comments}
                  </button>
                  <button
                    type="button"
                    className="cpa tap-target"
                    onClick={() => void handleShare(post)}
                  >
                    <i className="ti ti-share" aria-hidden="true" />
                    Share
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {activePost ? (
        <div className="comm-comments-drawer">
          <div
            className="comm-comments-backdrop"
            onClick={() => setCommentsPostId(null)}
            aria-hidden="true"
          />
          <div className="comm-comments-panel detail-card-warm">
            <div className="comm-comments-header">
              <div className="comm-comments-title">Comments</div>
              <button
                type="button"
                className="comm-comments-close tap-target"
                onClick={() => setCommentsPostId(null)}
              >
                Done
              </button>
            </div>
            <div className="comm-comments-list">
              {(activePost.commentList ?? []).length === 0 ? (
                <div className="comm-comments-empty">
                  Be the first to say something kind.
                </div>
              ) : (
                (activePost.commentList ?? []).map((comment: CommunityComment) => (
                  <div key={comment.id} className="comm-comment">
                    <div className="comm-comment-av">{comment.initial}</div>
                    <div>
                      <div className="comm-comment-author">{comment.author}</div>
                      <div className="comm-comment-text">{comment.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="comm-comments-compose">
              <input
                className="comm-comments-input"
                type="text"
                placeholder="Add a comment..."
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
              />
              <button
                type="button"
                className="comm-comments-send tap-target"
                disabled={!commentDraft.trim()}
                onClick={handleSubmitComment}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
