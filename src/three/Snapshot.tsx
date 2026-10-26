import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { snap } from '../snapshot'

/**
 * Lets the selfie postcard read the current 3D view. It renders one frame and copies the
 * canvas in the same task, so the drawing buffer never has to be preserved between frames.
 */
export function SnapshotBridge() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    snap.grab = () => {
      gl.render(scene, camera)
      const src = gl.domElement
      const out = document.createElement('canvas')
      out.width = src.width
      out.height = src.height
      out.getContext('2d')!.drawImage(src, 0, 0)
      return out
    }
    return () => { snap.grab = null }
  }, [gl, scene, camera])
  return null
}
