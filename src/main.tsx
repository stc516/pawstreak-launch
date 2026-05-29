import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './styles.css'
import './styles/landing.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

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
