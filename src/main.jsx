import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { seedStorage } from './utils/seedStorage'

// Auto-seed localStorage with dummy data on first load.
// Subsequent loads are skipped via the version-gated "fh_seeded" flag.
seedStorage()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
