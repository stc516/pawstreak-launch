/**
 * Mobile app shell layout guard.
 *
 * Detects iOS-style shell collapse: nav pinned near top, dark stage visible,
 * scroll area ~0px. Caused by breaking the flex height chain on .app-viewport.
 */

export function collectShellLayoutMetrics() {
  const rect = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return {
      top: Math.round(r.top),
      left: Math.round(r.left),
      width: Math.round(r.width),
      height: Math.round(r.height),
      bottom: Math.round(r.bottom),
      right: Math.round(r.right),
    }
  }

  const scrollEl = document.querySelector('.scroll')
  const viewportEl = document.querySelector('.app-viewport')
  const shellEl = document.querySelector('.app-shell')
  const bnavEl = document.querySelector('.bnav')
  const footerEl = document.querySelector('.app-shell-footer')
  const viewportHeight = window.innerHeight

  const bnavRect = rect(bnavEl)
  const shellRect = rect(shellEl)
  const viewportRect = rect(viewportEl)

  const navCenterY = bnavRect ? bnavRect.top + bnavRect.height / 2 : null
  const navInLowerHalf =
    navCenterY === null ? null : navCenterY >= viewportHeight * 0.55

  const shellFillRatio =
    shellRect && viewportHeight > 0 ? shellRect.height / viewportHeight : null

  return {
    routeClass: document.documentElement.className,
    viewport: {
      innerHeight: viewportHeight,
      innerWidth: window.innerWidth,
    },
    heights: {
      appViewportHeight: viewportEl?.clientHeight ?? null,
      appShellHeight: shellEl?.clientHeight ?? null,
      scrollClientHeight: scrollEl?.clientHeight ?? null,
      scrollScrollHeight: scrollEl?.scrollHeight ?? null,
    },
    layout: {
      viewportEl: viewportRect,
      shellEl: shellRect,
      bnav: bnavRect,
      footer: rect(footerEl),
      navCenterY: navCenterY === null ? null : Math.round(navCenterY),
      navInLowerHalf,
      shellFillRatio:
        shellFillRatio === null ? null : +shellFillRatio.toFixed(3),
      gapBelowNav:
        bnavRect && viewportRect
          ? Math.round(viewportRect.bottom - bnavRect.bottom)
          : null,
    },
  }
}

/**
 * @returns {{ ok: true } | { ok: false, code: string, detail: string }}
 */
export function assertShellLayout(metrics, { requireNav = true } = {}) {
  const vh = metrics.viewport.innerHeight
  const { heights, layout } = metrics

  if (requireNav && !layout.bnav) {
    return { ok: false, code: 'NAV_MISSING', detail: 'Expected .bnav on app route' }
  }

  if (!layout.shellEl) {
    return { ok: false, code: 'SHELL_MISSING', detail: 'Expected .app-shell on app route' }
  }

  if (heights.appShellHeight !== null && heights.appShellHeight < vh * 0.75) {
    return {
      ok: false,
      code: 'SHELL_COLLAPSED',
      detail: `app-shell height ${heights.appShellHeight}px is below 75% of viewport (${vh}px)`,
    }
  }

  if (layout.shellFillRatio !== null && layout.shellFillRatio < 0.75) {
    return {
      ok: false,
      code: 'SHELL_COLLAPSED',
      detail: `app-shell fills ${Math.round(layout.shellFillRatio * 100)}% of viewport (need >= 75%)`,
    }
  }

  if (requireNav && layout.navInLowerHalf === false) {
    return {
      ok: false,
      code: 'NAV_FLOATING',
      detail: `nav center at ${layout.navCenterY}px on ${vh}px screen (must sit in lower half)`,
    }
  }

  if (heights.scrollClientHeight !== null && heights.scrollClientHeight < 120) {
    return {
      ok: false,
      code: 'SCROLL_COLLAPSED',
      detail: `.scroll clientHeight ${heights.scrollClientHeight}px (need >= 120px)`,
    }
  }

  if (requireNav && layout.gapBelowNav !== null && layout.gapBelowNav > 24) {
    return {
      ok: false,
      code: 'NAV_NOT_PINNED',
      detail: `nav is ${layout.gapBelowNav}px above app-viewport bottom`,
    }
  }

  return { ok: true }
}
