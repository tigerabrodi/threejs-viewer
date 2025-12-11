import { Canvas } from '@react-three/fiber'
import type { ReactNode } from 'react'

interface SceneProps {
  children?: ReactNode
}

export function Scene({ children }: SceneProps) {
  return (
    <Canvas
      camera={{
        position: [3, 3, 3],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <color attach="background" args={['#1a1a1a']} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      {children}
    </Canvas>
  )
}
