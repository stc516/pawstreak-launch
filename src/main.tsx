import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './styles.css'
import './styles/stitch-heritage.css'
import './styles/stitch-parity.css'
import './styles/landing.css'
import './styles/home-adventure-energy.css'
import App from './App.tsx'
import { registerNativeDeepLinks } from './lib/nativeDeepLinks.ts'
import { registerNativePhotoRestoreHandler } from './lib/nativePhotoRestore.ts'
import { AuthProvider } from './context/AuthContext.tsx'

registerNativeDeepLinks()
registerNativePhotoRestoreHandler()

if (window.location.pathname === '/' || window.location.pathname === '' || window.location.pathname === '/start') {
  document.documentElement.classList.add('landing-route')
}

if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegistered(registration) {
      if (import.meta.env.DEV) {
        console.info('[PWA] Service worker registered', registration?.scope)
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration failed', error)
    },
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
