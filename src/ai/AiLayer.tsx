// Everything AI on top of the page: the chat, the live site builder and the visitor count.
import { Chat } from '../components/Chat'
import { AI_ENABLED } from './client'
import { DemoLauncher, DemoPanel } from './DemoPanel'
import { PresenceChip } from './presence'

/** `room` is true once the 3D studio is up and the intro is over. */
export function AiLayer({ room }: { room: boolean }) {
  if (!AI_ENABLED) return null
  return (
    <>
      <Chat />
      {room && (
        <>
          <DemoPanel />
          <DemoLauncher />
          <PresenceChip />
        </>
      )}
    </>
  )
}
