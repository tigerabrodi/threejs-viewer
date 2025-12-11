import { Line, Text } from '@react-three/drei'

interface AxesHelperProps {
  size?: number
}

export function AxesHelper({ size = 3 }: AxesHelperProps) {
  return (
    <group>
      {/* X Axis - Red */}
      <Line
        points={[[0, 0, 0], [size, 0, 0]]}
        color="red"
        lineWidth={2}
      />
      <Text
        position={[size + 0.3, 0, 0]}
        fontSize={0.3}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        X
      </Text>

      {/* Y Axis - Green */}
      <Line
        points={[[0, 0, 0], [0, size, 0]]}
        color="green"
        lineWidth={2}
      />
      <Text
        position={[0, size + 0.3, 0]}
        fontSize={0.3}
        color="green"
        anchorX="center"
        anchorY="middle"
      >
        Y
      </Text>

      {/* Z Axis - Blue */}
      <Line
        points={[[0, 0, 0], [0, 0, size]]}
        color="blue"
        lineWidth={2}
      />
      <Text
        position={[0, 0, size + 0.3]}
        fontSize={0.3}
        color="blue"
        anchorX="center"
        anchorY="middle"
      >
        Z
      </Text>

      {/* Origin */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  )
}
