import { CardImage } from './CardImage'

export interface StaggeredProgressPathItem {
  id: string
  eyebrow: string
  title: string
  meta: string
  detail?: string
  imageUrl?: string
  imageAlt?: string
  state?: 'complete' | 'current' | 'locked'
}

interface StaggeredProgressPathProps {
  title: string
  subtitle?: string
  countLabel?: string
  items: StaggeredProgressPathItem[]
  className?: string
}

export function StaggeredProgressPath({
  title,
  subtitle,
  countLabel,
  items,
  className = '',
}: StaggeredProgressPathProps) {
  return (
    <section className={`staggered-path detail-card-warm ${className}`.trim()}>
      <div className="staggered-path-header">
        <div>
          <div className="staggered-path-kicker">Progression path</div>
          <h2 className="staggered-path-title">{title}</h2>
          {subtitle ? <p className="staggered-path-subtitle">{subtitle}</p> : null}
        </div>
        {countLabel ? <div className="staggered-path-count">{countLabel}</div> : null}
      </div>

      <div className="staggered-path-track">
        <div className="staggered-path-line" aria-hidden="true" />
        {items.map((item, index) => {
          const side = index % 2 === 0 ? 'left' : 'right'
          const state = item.state ?? (index === 0 ? 'current' : 'locked')

          return (
            <article
              key={item.id}
              className={`staggered-path-row staggered-path-row--${side} staggered-path-row--${state}`}
            >
              <div className="staggered-path-node">
                {item.imageUrl ? (
                  <CardImage
                    className="staggered-path-node-image"
                    imageUrl={item.imageUrl}
                    imageAlt={item.imageAlt ?? item.title}
                    imageTone="warm"
                  />
                ) : (
                  <span className="staggered-path-node-number">{index + 1}</span>
                )}
              </div>
              <div className="staggered-path-card">
                <div className="staggered-path-eyebrow">{item.eyebrow}</div>
                <h3 className="staggered-path-item-title">{item.title}</h3>
                <p className="staggered-path-meta">{item.meta}</p>
                {item.detail ? <p className="staggered-path-detail">{item.detail}</p> : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
