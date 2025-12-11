import { Line, Text, Cone } from '@react-three/drei'

interface ForwardArrowProps {
  length?: number
  color?: string
}

export function ForwardArrow({ length = 2.5, color = '#00CED1' }: ForwardArrowProps) {
  const shaftEnd = -length + 0.4

  return (
    <group>
      {/* Arrow shaft pointing along -Z */}
      <Line
        points={[[0, 0.01, 0], [0, 0.01, shaftEnd]]}
        color={color}
        lineWidth={3}
      />

      {/* Arrow head */}
      <Cone
        args={[0.12, 0.4, 8]}
        position={[0, 0.01, -length]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial color={color} />
      </Cone>

      {/* Label */}
      <Text
        position={[0.4, 0.01, -length]}
        fontSize={0.25}
        color={color}
        anchorX="left"
        anchorY="middle"
      >
        -Z (Forward)
      </Text>

      {/* Start marker */}
      <mesh position={[0, 0.01, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}
