import { useState } from 'react'
import type { AppState, CommunityPost } from '../../data/demo'
import { dogNamesLabel } from '../../data/demo'
import { CardImage } from '../../components/CardImage'
import { getPlaceById } from '../../data/places'
import { StatusBar } from '../../components/StatusBar'

interface CommunityComposeOverlayProps {
  state: AppState
  onClose: () => void
  onSubmit: (post: CommunityPost) => void
}

export function CommunityComposeOverlay({
  state,
  onClose,
  onSubmit,
}: CommunityComposeOverlayProps) {
  const memoryOptions = state.journeyEntries.slice(0, 6)
  const [selectedEntryId, setSelectedEntryId] = useState(
    memoryOptions[0]?.id ?? '',
  )
  const [caption, setCaption] = useState('')

  const selectedEntry = memoryOptions.find((entry) => entry.id === selectedEntryId)
  const place = selectedEntry?.placeId
    ? getPlaceById(selectedEntry.placeId)
    : undefined
  const previewUrl =
    selectedEntry?.photoUrls?.[0] ?? place?.imageUrl ?? '/sample-images/dogs-outdoors.jpg'

  const handleSubmit = () => {
    if (!caption.trim()) return

    const dogLabel = dogNamesLabel(state.dogs)
    onSubmit({
      id: `user-post-${Date.now()}`,
      placeId: selectedEntry?.placeId,
      photoUrl: previewUrl,
      avatarClass: 'cp-av1',
      initial: state.dogs[0]?.initial ?? 'Y',
      name: dogLabel,
      meta: 'Just now · shared from Journey',
      caption: caption.trim(),
      location: selectedEntry?.place ?? place?.name ?? 'San Diego',
      likes: 0,
      comments: 0,
      likedByUser: false,
      commentList: [],
      isUserPost: true,
    })
  }

  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll scroll--overlay">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back tap-target" onClick={onClose}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Cancel
            </button>
          </div>

          <div className="comm-compose-intro detail-tint detail-tint--warm">
            <div className="comm-compose-title">Post to community</div>
            <div className="comm-compose-sub">
              Share a moment with the pack — local only, no account needed.
            </div>
          </div>

          <div className="sec">Choose a memory</div>
          <div className="comm-compose-memories">
            {memoryOptions.map((entry) => {
              const entryPlace = entry.placeId ? getPlaceById(entry.placeId) : undefined
              const selected = selectedEntryId === entry.id
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={`comm-compose-memory tap-target${selected ? ' on' : ''}`}
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  <CardImage
                    className="comm-compose-memory-img"
                    imageUrl={entry.photoUrls?.[0] ?? entryPlace?.imageUrl}
                    imageAlt={entry.place}
                    imageTone={entryPlace?.imageTone ?? 'warm'}
                  />
                  <div className="comm-compose-memory-label">{entry.place}</div>
                </button>
              )
            })}
          </div>

          <div className="sec">Caption</div>
          <textarea
            className="comm-compose-caption"
            rows={3}
            placeholder="What made this outing worth sharing?"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />

          <div className="sec">Preview</div>
          <div className="comm-compose-preview detail-card-warm">
            <CardImage
              className="comm-compose-preview-img"
              imageUrl={previewUrl}
              imageAlt={selectedEntry?.place ?? 'Adventure preview'}
              imageTone={place?.imageTone ?? 'warm'}
            />
            <div className="comm-compose-preview-caption">
              {caption.trim() || 'Your caption will appear here.'}
            </div>
          </div>

          <button
            type="button"
            className="comm-compose-submit tap-target"
            disabled={!caption.trim()}
            onClick={handleSubmit}
          >
            Share with the pack
          </button>
        </main>
      </div>
    </div>
  )
}
