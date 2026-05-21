import type { AppState } from '../../data/demo'

interface CommunityScreenProps {
  state: AppState
}

export function CommunityScreen({ state }: CommunityScreenProps) {
  return (
    <>
      <div className="aheader">
        <div className="alogo">Community</div>
      </div>

      <div className="comm-live">
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

      <div className="sec">From the pack</div>

      {state.communityPosts.map((post) => (
        <div key={post.id} className="comm-post">
          <div className="cp-img">
            <i className="ti ti-photo" aria-hidden="true" />
          </div>
          <div className="cp-body">
            <div className="cp-user">
              <div className={`cp-av ${post.avatarClass}`}>{post.initial}</div>
              <div>
                <div className="cp-name">{post.name}</div>
                <div className="cp-meta">{post.meta}</div>
              </div>
            </div>
            <div className="cp-caption">{post.caption}</div>
            <div className="cp-loc">
              <i className="ti ti-map-pin" aria-hidden="true" />
              {post.location}
            </div>
            <div className="cp-actions">
              <div className="cpa">
                <i className="ti ti-heart" aria-hidden="true" />
                {post.likes}
              </div>
              <div className="cpa">
                <i className="ti ti-message-circle" aria-hidden="true" />
                {post.comments}
              </div>
              <div className="cpa">
                <i className="ti ti-share" aria-hidden="true" />
                Share
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
