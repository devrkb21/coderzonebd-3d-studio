// Client rooms (`?client=`): the project panel beside the 3D board (a bottom sheet on phones),
// the same details in a card on the 2D page, the "link not active" note and a button to come back.
import { useCallback, useEffect } from 'react'
import { PROCESS, tr, UI, waLink, type Lang } from '../content'
import { CLIENT_TEXT as T, CLIENT_TOKEN, dayLine, fmtDate, num, PHASE_INDEX, useClient, type ClientProject } from '../clientRoom'
import { useStore } from '../store'
import { useDemo } from '../ai/demo'
import { WaIcon } from './details'
import { CloseIcon } from './icons'
import { inertUnless } from './inert'
import { Modal } from './Modal'

function Ring({ percent, lang }: { percent: number; lang: Lang }) {
  const r = 52
  const len = 2 * Math.PI * r
  return (
    <svg className="pr-ring" viewBox="0 0 128 128" role="img" aria-label={`${num(percent, lang)}% ${tr(T.progress, lang)}`}>
      <circle cx="64" cy="64" r={r} fill="none" stroke="var(--line)" strokeWidth="12" />
      <circle cx="64" cy="64" r={r} fill="none" stroke="var(--brand)" strokeWidth="12" strokeLinecap="round"
        strokeDasharray={`${(len * percent) / 100} ${len}`} transform="rotate(-90 64 64)" />
      <text x="64" y="70" textAnchor="middle" fontSize="28" fontWeight="700" fill="currentColor">{num(percent, lang)}%</text>
    </svg>
  )
}

const askText = (p: ClientProject, lang: Lang) => (lang === 'bn'
  ? `আসসালামু আলাইকুম, কোডার জোন বিডি। আমি ${p.name}, "${p.project.bn}" প্রজেক্ট নিয়ে কথা বলতে চাই।`
  : `Hi Coder Zone BD, this is ${p.name}. I'd like to talk about our project "${p.project.en}".`)

/** The project's details, shared by the 3D panel and the 2D card. */
export function ProjectDetails({ p, lang }: { p: ClientProject; lang: Lang }) {
  const phase = PHASE_INDEX(p.phase)
  return (
    <>
      {p.demo && <p className="note">{tr(T.demoNote, lang)}</p>}
      <div className="pr-top">
        <Ring percent={p.percent} lang={lang} />
        <dl className="pr-facts">
          <div><dt>{tr(T.timeline, lang)}</dt><dd>{dayLine(p, lang)}</dd></div>
          {p.dueDate && <div><dt>{tr(T.due, lang)}</dt><dd>{fmtDate(p.dueDate, lang)}</dd></div>}
          {p.manager && <div><dt>{tr(T.manager, lang)}</dt><dd>{p.manager}</dd></div>}
        </dl>
      </div>
      <h3>{tr(T.phase, lang)}</h3>
      <ol className="pr-phases">
        {PROCESS.map((s, i) => (
          <li key={s.id} className={i < phase ? 'done' : i === phase ? 'now' : ''} aria-current={i === phase ? 'step' : undefined}>
            <span aria-hidden>{i < phase ? '✓' : num(i + 1, lang)}</span>{tr(s.title, lang)}
          </li>
        ))}
      </ol>
      <h3>{tr(T.milestones, lang)}</h3>
      {p.milestones.length ? (
        <ul className="pr-ms">
          {p.milestones.map((m, i) => (
            <li key={i} className={m.done ? 'done' : ''}>
              <span className="pr-tick" aria-label={m.done ? '✓' : ''} />
              <span>{tr(m.title, lang)}</span>
              {m.date && <small>{fmtDate(m.date, lang, false)}</small>}
            </li>
          ))}
        </ul>
      ) : <p className="sub">{tr(T.none, lang)}</p>}
      <h3>{tr(T.updates, lang)}</h3>
      {p.updates.length ? (
        <ul className="pr-updates">
          {p.updates.map((u, i) => <li key={i}><small>{fmtDate(u.date, lang)}</small><p>{tr(u.text, lang)}</p></li>)}
        </ul>
      ) : <p className="sub">{tr(T.none, lang)}</p>}
      {!!p.commits?.length && (
        <>
          <h3>{tr(T.commits, lang)}</h3>
          <ul className="pr-commits">
            {p.commits.map((c, i) => <li key={i}><code>{c.message}</code>{c.date && <small>{fmtDate(c.date, lang)}</small>}</li>)}
          </ul>
        </>
      )}
      <div className="actions">
        <a className="btn wa" href={waLink(askText(p, lang))} target="_blank" rel="noopener noreferrer"><WaIcon /> {tr(T.ask, lang)}</a>
      </div>
    </>
  )
}

/** Side panel (bottom sheet on phones) while the camera is at the board. */
export function ProjectPanel() {
  const lang = useStore((s) => s.lang)
  const open = useStore((s) => s.projectOpen)
  const p = useClient((c) => c.project)
  const close = useCallback(() => useStore.getState().setProjectOpen(false), [])

  useEffect(() => {
    if (!open) return
    // capture phase: Esc closes the panel before the room's own Esc (overview) sees it
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || useStore.getState().chat || useStore.getState().booking || useStore.getState().quoteOpen) return
      e.preventDefault()
      close()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, close])

  // The board and the live site builder share the camera: opening one closes the other.
  useEffect(() => { if (open) useDemo.getState().setOpen(false) }, [open])
  useEffect(() => useDemo.subscribe((d, prev) => { if (d.open && !prev.open) useStore.getState().setProjectOpen(false) }), [])

  if (!p) return null
  return (
    <aside className={`panel project-panel ${open ? 'open' : ''}`} aria-hidden={!open} aria-label={tr(p.project, lang)} {...inertUnless(open)}>
      <div className="grabber" aria-hidden />
      <div className="panel-head">
        <span className="eyebrow">{tr(T.yourProject, lang)}{p.demo && <b className="pr-demo">{tr(T.demo, lang)}</b>}</span>
        <div className="panel-nav">
          <button className="icon-btn sm" onClick={close} aria-label={tr(UI.close, lang)}><CloseIcon /></button>
        </div>
      </div>
      <div className="panel-body">
        <h2>{tr(p.project, lang)}</h2>
        <p className="sub">{p.name}</p>
        <ProjectDetails p={p} lang={lang} />
      </div>
    </aside>
  )
}

/** A pill to fly back to the board once the panel is closed. */
export function ProjectFab() {
  const lang = useStore((s) => s.lang)
  const hidden = useStore((s) => s.projectOpen || !!s.focusId || s.quoteOpen || !!s.chat)
  const ok = useClient((c) => c.status === 'ok')
  if (!ok) return null
  return (
    <button className={`project-fab ${hidden ? 'hide' : ''}`} onClick={() => useStore.getState().setProjectOpen(true)}>
      <span aria-hidden>◔</span> {tr(T.yourProject, lang)}
    </button>
  )
}

/** On the 2D page: the same details in a card (opened once, and from a button at the top). */
export function ProjectCard2D() {
  const lang = useStore((s) => s.lang)
  const open = useStore((s) => s.projectOpen)
  const p = useClient((c) => c.project)
  const close = useCallback(() => useStore.getState().setProjectOpen(false), [])
  if (!p) return null
  if (!open) {
    return <button className="project-fab flat-fab" onClick={() => useStore.getState().setProjectOpen(true)}><span aria-hidden>◔</span> {tr(T.yourProject, lang)}</button>
  }
  return (
    <Modal title={tr(p.project, lang)} onClose={close} className="project-card">
      <p className="sub">{p.name}{p.demo && <b className="pr-demo">{tr(T.demo, lang)}</b>}</p>
      <ProjectDetails p={p} lang={lang} />
    </Modal>
  )
}

/** "This link isn't active" (or couldn't load), once, with a way to ask for a new link. */
export function ClientNote() {
  const lang = useStore((s) => s.lang)
  const status = useClient((c) => c.status)
  const done = useClient((c) => c.noteDone)
  const close = useCallback(() => useClient.getState().dismissNote(), [])
  if (done || (status !== 'invalid' && status !== 'error')) return null
  const invalid = status === 'invalid'
  return (
    <Modal title={tr(invalid ? T.invalidTitle : T.errorTitle, lang)} onClose={close}>
      <p className="welcome-sub">{tr(invalid ? T.invalid : T.error, lang)}</p>
      <div className="actions">
        <button className="btn primary" onClick={close}>{tr(T.lookAround, lang)}</button>
        <a className="btn wa" href={waLink(tr(T.askLink, lang))} target="_blank" rel="noopener noreferrer"><WaIcon /> WhatsApp</a>
      </div>
    </Modal>
  )
}

/**
 * Loads the project, and once the room is up (after the intro) flies to the board once.
 * `room` is true when the 3D studio is ready and the intro is over; `flat` on the 2D page.
 */
export function ClientRoom({ room, flat }: { room: boolean; flat: boolean }) {
  const status = useClient((c) => c.status)
  useEffect(() => { if (CLIENT_TOKEN) useClient.getState().load() }, [])
  useEffect(() => {
    if (status !== 'ok' || !(room || flat)) return
    let shown = false
    try { shown = sessionStorage.getItem('cz3d-client-shown') === '1'; sessionStorage.setItem('cz3d-client-shown', '1') } catch { /* storage unavailable */ }
    if (!shown) useStore.getState().setProjectOpen(true)
  }, [status, room, flat])
  if (!CLIENT_TOKEN) return null
  return (
    <>
      {room && <><ProjectPanel /><ProjectFab /></>}
      {flat && <ProjectCard2D />}
      {(room || flat) && <ClientNote />}
    </>
  )
}
