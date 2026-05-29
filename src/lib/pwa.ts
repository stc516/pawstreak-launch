/** True when PawStreak is running as an installed home-screen app. */
export function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    // iOS Safari legacy
    ('standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  )
}

export function canUseServiceWorker(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator
}
