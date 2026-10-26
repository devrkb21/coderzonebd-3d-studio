import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useStore } from './store'
import { FlatSite } from './flat/FlatSite'
import { Hint, Loader, NavPills, Toast, TopBar } from './components/Chrome'
import { Panel } from './components/Panel'
import { QuoteDrawer } from './components/QuoteDrawer'
import { HelpOverlay, IntroOverlay, Shortcuts, SoundSwitch, Tooltip, TourRunner } from './components/Interact'

const Scene = lazy(() => import('./three/Scene'))

export default function App() {
  const lang = useStore((s) => s.lang)
  const mode = useStore((s) => s.mode)
  const ready = useStore((s) => s.ready)
  const focused = useStore((s) => !!s.focusId)
  const intro = useStore((s) => s.intro)
  const setQuoteOpen = useStore((s) => s.setQuoteOpen)
  const [progress, setProgress] = useState(0.05)
  const onProgress = useCallback((p: number) => setProgress(0.15 + p * 0.8), [])
  const is3d = mode === '3d'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.classList.toggle('mode-3d', is3d)
  }, [lang, is3d])

  return (
    <>
      {is3d && (
        <Suspense fallback={null}>
          <Scene onProgress={onProgress} />
        </Suspense>
      )}
      {is3d && <div className={`vignette ${focused ? 'on' : ''}`} aria-hidden />}
      <TopBar />
      <FlatSite lang={lang} visible={!is3d} onQuote={() => setQuoteOpen(true)} />
      {is3d && ready && intro && <IntroOverlay />}
      {is3d && ready && !intro && (
        <>
          <NavPills />
          <Panel />
          <Hint />
          <Shortcuts />
          <TourRunner />
          <Tooltip />
          <HelpOverlay />
        </>
      )}
      {is3d && <SoundSwitch />}
      <QuoteDrawer />
      <Toast />
      {is3d && <Loader progress={ready ? 1 : progress} done={ready} />}
    </>
  )
}
