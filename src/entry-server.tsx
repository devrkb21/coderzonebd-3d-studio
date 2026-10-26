// Build-time only: renders the 2D page to HTML so it can be baked into index.html.
import { renderToString } from 'react-dom/server'
import { FlatSite } from './flat/FlatSite'

export function render() {
  return renderToString(<FlatSite lang="bn" visible />)
}
