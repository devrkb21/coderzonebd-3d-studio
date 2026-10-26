// Coin hunt HUD ("Coins 2/5") and the reward card once all five are found.
import { useCallback } from 'react'
import { COIN_CLAIM, COIN_REWARD, tr, waLink } from '../content'
import { COIN_COUNT, useStore } from '../store'
import { WaIcon } from './details'
import { Modal } from './Modal'

const bnDigits = (n: number) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d])

/** Small counter under the logo; tapping it explains the hunt, or reopens the reward. */
export function CoinHud() {
  const lang = useStore((s) => s.lang)
  const found = useStore((s) => Math.min(COIN_COUNT, s.coins.length))
  const bn = lang === 'bn'
  const done = found >= COIN_COUNT
  const onClick = () => {
    const s = useStore.getState()
    if (done) return s.setRewardOpen(true)
    s.showToast(bn
      ? `স্টুডিওর ভেতরে ${bnDigits(COIN_COUNT)}টা সোনালি CZ কয়েন লুকানো আছে। আসবাবের আশেপাশে খুঁজুন!`
      : `${COIN_COUNT} gold CZ coins are hidden around the studio. Look around the furniture!`)
  }
  return (
    <button className={`coin-hud ${done ? 'done' : ''}`} onClick={onClick} aria-label={bn ? `কয়েন ${found} / ${COIN_COUNT}` : `Coins found: ${found} of ${COIN_COUNT}`}>
      <span className="coin-dot" aria-hidden>CZ</span>
      {bn ? `কয়েন ${bnDigits(found)}/${bnDigits(COIN_COUNT)}` : `Coins ${found}/${COIN_COUNT}`}
    </button>
  )
}

export function CoinReward() {
  const lang = useStore((s) => s.lang)
  const open = useStore((s) => s.rewardOpen)
  const close = useCallback(() => useStore.getState().setRewardOpen(false), [])
  if (!open) return null
  const bn = lang === 'bn'
  return (
    <Modal title={bn ? 'অভিনন্দন! ৫টা কয়েনই পেয়েছেন' : 'You found all 5 coins!'} onClose={close} className="coin-reward">
      <div className="coin-burst" aria-hidden>{Array.from({ length: COIN_COUNT }, (_, i) => <span key={i} className="coin-dot" style={{ animationDelay: `${i * 0.08}s` }}>CZ</span>)}</div>
      <p className="coin-prize-label">{bn ? 'আপনার পুরস্কার' : 'Your reward'}</p>
      <p className="coin-prize">{tr(COIN_REWARD, lang)}</p>
      <p className="coin-note">{bn ? 'WhatsApp-এ আমাদের জানান, আমরা আপনার জন্য রেখে দেব।' : 'Tell us on WhatsApp and we will keep it for you.'}</p>
      <div className="actions">
        <a className="btn wa" href={waLink(tr(COIN_CLAIM, lang))} target="_blank" rel="noopener noreferrer"><WaIcon /> {bn ? 'WhatsApp-এ দাবি করুন' : 'Claim on WhatsApp'}</a>
        <button className="btn" onClick={close}>{bn ? 'পরে' : 'Later'}</button>
      </div>
    </Modal>
  )
}
