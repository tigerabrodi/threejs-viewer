import { Line, Ring } from '@react-three/drei'

interface PivotMarkerProps {
  size?: number
  color?: string
}

export function PivotMarker({ size = 0.15, color = '#ff00ff' }: PivotMarkerProps) {
  const crossLength = size * 2
  const ringRadius = size * 1.5

  return (
    <group>
      {/* Center sphere - solid core */}
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>

      {/* Outer glow sphere */}
      <mesh>
        <sphereGeometry args={[size * 1.3, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      {/* Cross lines with depth testing disabled for always-visible */}
      <Line
        points={[[-crossLength, 0, 0], [crossLength, 0, 0]]}
        color={color}
        lineWidth={2}
        transparent
        opacity={0.8}
      />
      <Line
        points={[[0, -crossLength, 0], [0, crossLength, 0]]}
        color={color}
        lineWidth={2}
        transparent
        opacity={0.8}
      />
      <Line
        points={[[0, 0, -crossLength], [0, 0, crossLength]]}
        color={color}
        lineWidth={2}
        transparent
        opacity={0.8}
      />

      {/* Ring indicators on each plane for better visibility */}
      {/* XY plane ring */}
      <Ring args={[ringRadius * 0.9, ringRadius, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.2} side={2} />
      </Ring>

      {/* XZ plane ring */}
      <Ring args={[ringRadius * 0.9, ringRadius, 32]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.2} side={2} />
      </Ring>

      {/* YZ plane ring */}
      <Ring args={[ringRadius * 0.9, ringRadius, 32]} rotation={[0, Math.PI / 2, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.2} side={2} />
      </Ring>
    </group>
  )
}
