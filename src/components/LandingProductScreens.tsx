import { SAMPLE_IMAGES } from '../data/sampleImages'
import { BRAND_NAME } from '../lib/brand'

const SCREENS = [
  {
    id: 'today',
    label: 'Today',
    title: "Today's Adventure",
    copy: 'See what’s next — beach mornings, trail runs, patio hangs.',
    image: SAMPLE_IMAGES.beach,
    accent: 'today',
  },
  {
    id: 'journey',
    label: 'Journey',
    title: 'Their living timeline',
    copy: 'Every walk, road trip, and favorite moment in one story.',
    image: SAMPLE_IMAGES.coastal,
    accent: 'journey',
  },
  {
    id: 'map',
    label: 'Map',
    title: 'Your dog life map',
    copy: 'Places you’ve loved, trails you’ve conquered, spots to revisit.',
    image: SAMPLE_IMAGES.trail,
    accent: 'map',
  },
  {
    id: 'memories',
    label: 'Memories',
    title: 'Saved where they belong',
    copy: 'Photos, notes, and the little moments that made you smile.',
    image: SAMPLE_IMAGES.dogsOutdoors,
    accent: 'memories',
  },
] as const

export function LandingProductScreens() {
  return (
    <div className="landing-screens-grid">
      {SCREENS.map((screen) => (
        <article key={screen.id} className={`landing-screen-card landing-screen-card--${screen.accent}`}>
          <div className="landing-screen-card-top">
            <span className="landing-screen-label">{screen.label}</span>
            <span className="landing-screen-brand">{BRAND_NAME}</span>
          </div>
          <div
            className="landing-screen-image"
            style={{ backgroundImage: `url(${screen.image})` }}
            role="img"
            aria-label={screen.title}
          />
          <div className="landing-screen-body">
            <h3>{screen.title}</h3>
            <p>{screen.copy}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
