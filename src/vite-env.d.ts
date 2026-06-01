/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Canonical site origin for OAuth/email redirects in production (e.g. https://pawstreakapp.com) */
  readonly VITE_SITE_URL?: string
  readonly VITE_MAPBOX_TOKEN?: string
  readonly VITE_MAPBOX_STYLE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
