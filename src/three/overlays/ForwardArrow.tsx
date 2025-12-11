import { Line, Text, Cone } from '@react-three/drei'

interface ForwardArrowProps {
  length?: number
  color?: string
}

export function ForwardArrow({ length = 2.5, color = '#00CED1' }: ForwardArrowProps) {
  const coneHeight = length * 0.15
  const coneRadius = length * 0.05
  const shaftEnd = -length + coneHeight
  const fontSize = length * 0.1
  const startMarkerSize = length * 0.03
  const yOffset = 0.01 // Small offset to prevent z-fighting with grid

  return (
    <group>
      {/* Arrow shaft pointing along -Z (forward direction) */}
      <Line
        points={[[0, yOffset, 0], [0, yOffset, shaftEnd]]}
        color={color}
        lineWidth={3}
      />

      {/* Arrow head pointing toward -Z */}
      <Cone
        args={[coneRadius, coneHeight, 8]}
        position={[0, yOffset, -length]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial color={color} />
      </Cone>

      {/* Label with better positioning */}
      <Text
        position={[length * 0.2, yOffset, -length * 0.5]}
        fontSize={fontSize}
        color={color}
        anchorX="left"
        anchorY="middle"
        outlineWidth={fontSize * 0.05}
        outlineColor="#000000"
      >
        FORWARD (-Z)
      </Text>

      {/* Start marker at origin */}
      <mesh position={[0, yOffset, 0]}>
        <sphereGeometry args={[startMarkerSize, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Direction indicator line at arrow tip for extra clarity */}
      <Line
        points={[
          [-coneRadius * 1.5, yOffset, -length],
          [coneRadius * 1.5, yOffset, -length]
        ]}
        color={color}
        lineWidth={2}
      />
    </group>
  )
}
