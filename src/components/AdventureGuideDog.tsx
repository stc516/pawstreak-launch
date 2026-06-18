interface AdventureGuideDogProps {
  className?: string
  withBurst?: boolean
}

export function AdventureGuideDog({
  className = '',
  withBurst = false,
}: AdventureGuideDogProps) {
  return (
    <div className={`guide-dog ${withBurst ? 'guide-dog--burst' : ''} ${className}`.trim()}>
      <img src="/sample-images/dogs-outdoors.jpg" alt="" className="guide-dog-img" />
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
