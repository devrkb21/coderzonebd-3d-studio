import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './fonts/anek-bangla.css'
import './styles.css'

// index.html ships a prerendered 2D page for search engines and slow
// connections; the app replaces it once JavaScript is running.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
