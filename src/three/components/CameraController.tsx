import { useRef } from 'react'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { NORMALIZATION_CONFIG } from '../../core/model-normalizer'

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null)

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[3, 3, 3]}
        fov={50}
        near={0.01}
        far={100}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={NORMALIZATION_CONFIG.MIN_CAMERA_DISTANCE}
        maxDistance={NORMALIZATION_CONFIG.MAX_CAMERA_DISTANCE}
      />
    </>
  )
}
