import { Line } from '@react-three/drei'

interface PivotMarkerProps {
  size?: number
  color?: string
}

export function PivotMarker({ size = 0.15, color = '#ff00ff' }: PivotMarkerProps) {
  return (
    <group>
      {/* Center sphere */}
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* Cross lines */}
      <Line
        points={[[-size * 2, 0, 0], [size * 2, 0, 0]]}
        color={color}
        lineWidth={2}
      />
      <Line
        points={[[0, -size * 2, 0], [0, size * 2, 0]]}
        color={color}
        lineWidth={2}
      />
      <Line
        points={[[0, 0, -size * 2], [0, 0, size * 2]]}
        color={color}
        lineWidth={2}
      />
    </group>
  )
}
