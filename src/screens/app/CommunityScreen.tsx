import { useEffect, useState } from 'react'
import type { AppState, CommunityComment } from '../../data/demo'
import { CardImage } from '../../components/CardImage'
import { getMagicLine, getPlaceById } from '../../data/places'

interface CommunityScreenProps {
  state: AppState
  onToggleLike: (postId: string) => void
  onAddComment: (postId: string, text: string) => void
  onOpenCompose: () => void
  onDismissToast: () => void
}

export function CommunityScreen({
  state,
  onToggleLike,
  onAddComment,
  onOpenCompose,
  onDismissToast,
}: CommunityScreenProps) {
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [shareNote, setShareNote] = useState<string | null>(null)

  useEffect(() => {
    if (!state.memorySaveToast) return
    const timer = window.setTimeout(onDismissToast, 3200)
    return () => window.clearTimeout(timer)
  }, [state.memorySaveToast, onDismissToast])

  const activePost = state.communityPosts.find((post) => post.id === commentsPostId)

  const handleShare = () => {
    setShareNote('Post link copied — ready to share when you want.')
    window.setTimeout(() => setShareNote(null), 2800)
  }

  const handleSubmitComment = () => {
    if (!commentsPostId || !commentDraft.trim()) return
    onAddComment(commentsPostId, commentDraft.trim())
    setCommentDraft('')
  }

  return (
    <>
      <div className="aheader">
        <div className="alogo">Community</div>
      </div>

      <p className="comm-participate">
        Share a moment, leave a kind word, or cheer someone on — the pack is out there.
      </p>

      <div className="comm-live detail-tint detail-tint--accent">
        <div className="comm-live-top">
          <div className="live-dot" />
          <div className="live-label">{state.communityLive.label}</div>
        </div>
        <div className="live-count">{state.communityLive.count}</div>
        <div className="live-sub live-sub--spaced">{state.communityLive.subtitle}</div>
        <div className="live-bar">
          {state.communityLive.chips.map((chip) => (
            <div key={chip.label} className="live-chip">
              {chip.label}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="comm-post-btn tap-target"
        onClick={onOpenCompose}
      >
        <i className="ti ti-plus" aria-hidden="true" />
        Post to community
      </button>

      {shareNote || state.memorySaveToast ? (
        <div className="memory-toast" role="status">
          {shareNote ?? state.memorySaveToast}
        </div>
      ) : null}

      <div className="sec">From the pack</div>

      {state.communityPosts.map((post) => {
        const place = post.placeId ? getPlaceById(post.placeId) : undefined
        const imageUrl = post.photoUrl ?? place?.imageUrl

        return (
          <div key={post.id} className="comm-post detail-card-warm">
            <CardImage
              className="cp-img"
              imageUrl={imageUrl}
              imageAlt={place?.imageAlt ?? post.location}
              imageTone={place?.imageTone}
            />
            <div className="cp-body">
              <div className="cp-user">
                <div className={`cp-av ${post.avatarClass}`}>{post.initial}</div>
                <div>
                  <div className="cp-name">{post.name}</div>
                  <div className="cp-meta">
                    {post.meta}
                    {place ? ` · ${getMagicLine(place)}` : ''}
                  </div>
                </div>
              </div>
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
                <button type="button" className="cpa tap-target" onClick={handleShare}>
                  <i className="ti ti-share" aria-hidden="true" />
                  Share
                </button>
              </div>
            </div>
          </div>
        )
      })}

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
