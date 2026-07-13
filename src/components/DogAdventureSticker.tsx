import type { Dog } from '../data/demo'

interface DogAdventureStickerProps {
  dog?: Dog
  className?: string
  label?: string
}

export function DogAdventureSticker({
  dog,
  className = '',
  label,
}: DogAdventureStickerProps) {
  if (!dog?.photoUrl) return null

  return (
    <span
      className={`dog-adventure-sticker dog-adventure-sticker--photo ${className}`.trim()}
      aria-label={label ?? `${dog.name} is ready for this adventure`}
    >
      <span className="dog-adventure-sticker-burst" aria-hidden="true" />
      <span className="dog-adventure-sticker-portrait">
        <img src={dog.photoUrl} alt="" />
      </span>
      <span className="dog-adventure-sticker-bandana" aria-hidden="true" />
      <span className="dog-adventure-sticker-zap" aria-hidden="true">✦</span>
    </span>
  )
}
