import type { ReactNode } from 'react'
import type { PlaceImageTone } from '../types/place'

interface CardImageProps {
  imageUrl?: string
  imageAlt?: string
  imageTone?: PlaceImageTone
  className?: string
  placeholderLabel?: string
  children?: ReactNode
}

export function CardImage({
  imageUrl,
  imageAlt,
  imageTone = 'warm',
  className = '',
  placeholderLabel = 'Photo coming soon',
  children,
}: CardImageProps) {
  const toneClass = `card-img--${imageTone}`
  const isEmpty = !imageUrl

  return (
    <div
      className={`card-img ${toneClass}${isEmpty ? ' card-img--empty' : ''} ${className}`.trim()}
      role={imageAlt ? 'img' : undefined}
      aria-label={imageAlt ?? (isEmpty ? placeholderLabel : undefined)}
      style={
        imageUrl
          ? {
              backgroundImage: `linear-gradient(to top, rgba(6, 27, 14, 0.52) 0%, rgba(27, 48, 34, 0.12) 48%, transparent 100%), url("${imageUrl}")`,
            }
          : undefined
      }
    >
      {isEmpty ? <span className="card-img-placeholder">{placeholderLabel}</span> : null}
      {children}
    </div>
  )
}
