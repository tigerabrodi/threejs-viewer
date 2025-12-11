import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

interface GroundPlaneProps {
  size: number
}

export function GroundPlane({ size }: GroundPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Create checker pattern texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 64
    canvas.height = 64

    // Draw checker pattern
    const checkSize = 32
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#2a2a2a' : '#1f1f1f'
        ctx.fillRect(x * checkSize, y * checkSize, checkSize, checkSize)
      }
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(size / 2, size / 2)
    return tex
  }, [size])

  // Subtle animation for visual interest
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.opacity = 0.3 + Math.sin(clock.elapsedTime * 0.5) * 0.05
    }
  })

  return (
    <group>
      {/* Ground plane mesh */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, 0]}
        receiveShadow
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ground level indicator */}
      <Html
        position={[-size / 2 + 0.5, 0.05, size / 2 - 0.5]}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.5)',
            textShadow: '0 0 4px rgba(0, 0, 0, 0.8)',
            whiteSpace: 'nowrap',
          }}
        >
          Y=0 (Ground)
        </div>
      </Html>
    </group>
  )
}
