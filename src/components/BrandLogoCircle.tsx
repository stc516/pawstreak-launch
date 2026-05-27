import { BRAND_LOGO } from '../lib/brand'

type BrandLogoCircleProps = {
  className?: string
  size?: number
}

type BrandLogoFullProps = {
  className?: string
}

/** Circular crop for nav, hero, phone header, and footer marks. */
export function BrandLogoCircle({ className = '', size }: BrandLogoCircleProps) {
  return (
    <span
      className={`brand-logo-circle ${className}`.trim()}
      style={size ? { width: size, height: size } : undefined}
    >
      <img src={BRAND_LOGO} alt="" draggable={false} />
    </span>
  )
}

/** Full badge for larger brand moments (founder card, etc.). */
export function BrandLogoFull({ className = '' }: BrandLogoFullProps) {
  return (
    <span className={`brand-logo-full ${className}`.trim()}>
      <img src={BRAND_LOGO} alt="" draggable={false} />
    </span>
  )
}
