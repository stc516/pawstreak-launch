import type { PlaceImageTone } from '../types/place'

interface CardImageProps {
  imageUrl?: string
  imageAlt?: string
  imageTone?: PlaceImageTone
  className?: string
}

export function CardImage({
  imageUrl,
  imageAlt,
  imageTone = 'warm',
  className = '',
}: CardImageProps) {
  const toneClass = `card-img--${imageTone}`

  return (
    <div
      className={`card-img ${toneClass} ${className}`.trim()}
      role={imageAlt ? 'img' : undefined}
      aria-label={imageAlt}
      style={
        imageUrl
          ? {
              backgroundImage: `linear-gradient(to top, rgba(6, 27, 14, 0.52) 0%, rgba(27, 48, 34, 0.12) 48%, transparent 100%), url("${imageUrl}")`,
            }
          : undefined
      }
    />
  )
}
