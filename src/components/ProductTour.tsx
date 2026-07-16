import { PRODUCT_TOUR_STEPS } from '../lib/productTour'

interface ProductTourProps {
  step: number
  dogLabel: string
  onNext: () => void
  onSkip: () => void
}

export function ProductTour({ step, dogLabel, onNext, onSkip }: ProductTourProps) {
  const item = PRODUCT_TOUR_STEPS[step] ?? PRODUCT_TOUR_STEPS[0]
  const isLast = step === PRODUCT_TOUR_STEPS.length - 1

  return (
    <div className="product-tour" role="dialog" aria-modal="true" aria-labelledby="product-tour-title" data-testid="product-tour">
      <div className="product-tour-card">
        <div className="product-tour-topline">
          <span>{step + 1} / {PRODUCT_TOUR_STEPS.length}</span>
          <button type="button" onClick={onSkip} className="product-tour-skip tap-target">Skip</button>
        </div>
        <div className="product-tour-progress" aria-hidden="true">
          {PRODUCT_TOUR_STEPS.map((tourStep, index) => (
            <span key={tourStep.title} className={index <= step ? 'on' : ''} />
          ))}
        </div>
        <div className="product-tour-icon" aria-hidden="true">
          <i className={`ti ${item.icon}`} />
        </div>
        <p className="product-tour-eyebrow">{item.eyebrow}</p>
        <h2 id="product-tour-title">{item.title}</h2>
        <p className="product-tour-copy">{item.copy.replace('your pack', `${dogLabel}'s pack`)}</p>
        <button type="button" className="product-tour-next tap-target" onClick={onNext}>
          {isLast ? `Let's adventure` : 'Show me'}
          <i className={`ti ${isLast ? 'ti-confetti' : 'ti-arrow-right'}`} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
