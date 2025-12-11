import { useRef } from 'react'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null)

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[3, 3, 3]}
        fov={50}
        near={0.1}
        far={1000}
      />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={0.5}
        maxDistance={50}
      />
    </>
  )
}
