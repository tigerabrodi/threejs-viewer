import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'

interface CompassOverlayProps {
  size: number
}

export function CompassOverlay({ size }: CompassOverlayProps) {
  // Create compass rose lines
  const compassLines = useMemo(() => {
    const lines: { points: [number, number, number][]; color: string; lineWidth: number }[] = []

    // Cardinal directions on ground plane (Y=0)
    const radius = size * 0.5

    // North (-Z / Forward) - Blue
    lines.push({
      points: [[0, 0.01, 0], [0, 0.01, -radius]],
      color: '#4a9eff',
      lineWidth: 2,
    })

    // South (+Z / Back) - Dim blue
    lines.push({
      points: [[0, 0.01, 0], [0, 0.01, radius * 0.5]],
      color: '#2a5e9f',
      lineWidth: 1,
    })

    // East (+X / Right) - Red
    lines.push({
      points: [[0, 0.01, 0], [radius * 0.5, 0.01, 0]],
      color: '#f87171',
      lineWidth: 1,
    })

    // West (-X / Left) - Dim red
    lines.push({
      points: [[0, 0.01, 0], [-radius * 0.5, 0.01, 0]],
      color: '#9f3a3a',
      lineWidth: 1,
    })

    return lines
  }, [size])

  // Arrow head for forward direction
  const arrowHead = useMemo(() => {
    const shape = new THREE.Shape()
    const arrowSize = size * 0.08

    shape.moveTo(0, arrowSize)
    shape.lineTo(-arrowSize * 0.5, 0)
    shape.lineTo(arrowSize * 0.5, 0)
    shape.closePath()

    return shape
  }, [size])

  return (
    <group>
      {/* Compass lines */}
      {compassLines.map((line, index) => (
        <Line
          key={index}
          points={line.points}
          color={line.color}
          lineWidth={line.lineWidth}
        />
      ))}

      {/* Forward arrow head */}
      <mesh
        position={[0, 0.02, -size * 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <shapeGeometry args={[arrowHead]} />
        <meshBasicMaterial color="#4a9eff" side={THREE.DoubleSide} />
      </mesh>

      {/* Center marker */}
      <mesh position={[0, 0.01, 0]}>
        <ringGeometry args={[size * 0.02, size * 0.03, 32]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}
