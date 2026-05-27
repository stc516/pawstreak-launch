import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './styles/landing.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

if (window.location.pathname === '/' || window.location.pathname === '') {
  document.documentElement.classList.add('landing-route')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
