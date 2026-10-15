import type { ReactNode } from 'react'
import type { PlaceImageTone } from '../types/place'
import { authenticImageUrl } from '../lib/authenticImages'

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
  placeholderLabel = 'No photo added',
  children,
}: CardImageProps) {
  const toneClass = `card-img--${imageTone}`
  const photo = authenticImageUrl(imageUrl)
  const isEmpty = !photo

  return (
    <div
      className={`card-img ${toneClass}${isEmpty ? ' card-img--empty' : ''} ${className}`.trim()}
      role={imageAlt ? 'img' : undefined}
      aria-label={imageAlt ?? (isEmpty ? placeholderLabel : undefined)}
      style={
        photo
          ? {
              backgroundImage: `linear-gradient(to top, rgba(6, 27, 14, 0.52) 0%, rgba(27, 48, 34, 0.12) 48%, transparent 100%), url("${photo}")`,
            }
          : undefined
      }
    >
      {isEmpty ? <span className="card-img-placeholder">{placeholderLabel}</span> : null}
      {children}
    </div>
  )
}
