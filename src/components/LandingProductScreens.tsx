import { BRAND_NAME } from '../lib/brand'

const SCREENS = [
  {
    id: 'today',
    label: 'Today',
    title: "Today's Adventure",
    copy: 'See what’s next — beach mornings, trail runs, patio hangs.',
    icon: 'ti-compass',
    accent: 'today',
  },
  {
    id: 'journey',
    label: 'Journey',
    title: 'Their living timeline',
    copy: 'Every walk, road trip, and favorite moment in one story.',
    icon: 'ti-notebook',
    accent: 'journey',
  },
  {
    id: 'map',
    label: 'Explore',
    title: 'Find your next place',
    copy: 'Discover curated dog-friendly spots and choose your next adventure.',
    icon: 'ti-map-2',
    accent: 'map',
  },
  {
    id: 'memories',
    label: 'Memories',
    title: 'Saved where they belong',
    copy: 'Photos, notes, and the little moments that made you smile.',
    icon: 'ti-camera',
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
          <div className="product-preview-symbol" aria-hidden="true"><i className={`ti ${screen.icon}`} /></div>
          <div className="landing-screen-body">
            <h3>{screen.title}</h3>
            <p>{screen.copy}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
