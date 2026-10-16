import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

const container = document.getElementById('root')!
createRoot(container).render(<App />)

// Offline support: only in production builds, so `npm run dev` never serves stale files.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const register = () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is optional; ignore registration errors */
    })
  }
  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register)
}
