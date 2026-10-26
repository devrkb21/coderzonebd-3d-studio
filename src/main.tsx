import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { LinkMaker } from './components/LinkMaker'
import './fonts/anek-bangla.css'
import './styles.css'

// index.html ships a prerendered 2D page for search engines and slow
// connections; the app replaces it once JavaScript is running. `?make-link` is the team's
// internal outreach link maker instead.
const Root = new URLSearchParams(location.search).has('make-link') ? LinkMaker : App
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
