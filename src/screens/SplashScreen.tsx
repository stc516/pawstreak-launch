import { BrandLogoFull } from '../components/BrandLogoCircle'
import { BRAND_NAME, SPLASH_TAGLINE } from '../lib/brand'

export function SplashScreen() {
  return (
    <div className="app-viewport splash-screen-viewport">
      <div className="splash-screen" role="status" aria-label={`${BRAND_NAME} loading`}>
        <BrandLogoFull className="brand-logo-full--splash" />
        <p className="splash-screen__tagline">{SPLASH_TAGLINE}</p>
      </div>
    </div>
  )
}
