import type { Dog } from '../data/demo'

interface AdventureGuideDogProps {
  className?: string
  withBurst?: boolean
  dog?: Dog
}

export function AdventureGuideDog({
  className = '',
  withBurst = false,
  dog,
}: AdventureGuideDogProps) {
  return (
    <div className={`guide-dog ${withBurst ? 'guide-dog--burst' : ''} ${className}`.trim()}>
      {dog?.photoUrl ? (
        <img src={dog.photoUrl} alt={`${dog.name}`} className="guide-dog-img" />
      ) : (
        <span className="guide-dog-fallback" aria-label={dog ? dog.name : 'Dog'}>
          {dog?.profileEmoji ?? '🐕'}
        </span>
      )}
      {withBurst ? (
        <>
          <span className="guide-dog-ray guide-dog-ray--one" aria-hidden="true" />
          <span className="guide-dog-ray guide-dog-ray--two" aria-hidden="true" />
          <span className="guide-dog-ray guide-dog-ray--three" aria-hidden="true" />
        </>
      ) : null}
    </div>
  )
}
