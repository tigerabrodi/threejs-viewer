import { Line, Text, Cone } from '@react-three/drei'

interface AxesHelperProps {
  size?: number
}

export function AxesHelper({ size = 3 }: AxesHelperProps) {
  const arrowSize = size * 0.08
  const labelOffset = size * 0.15
  const fontSize = size * 0.12
  const originSize = size * 0.02

  return (
    <group>
      {/* X Axis - Red (Right) */}
      <Line
        points={[[0, 0, 0], [size, 0, 0]]}
        color="#ff0000"
        lineWidth={2}
      />
      <Cone
        args={[arrowSize, arrowSize * 2, 8]}
        position={[size, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <meshBasicMaterial color="#ff0000" />
      </Cone>
      <Text
        position={[size + labelOffset, 0, 0]}
        fontSize={fontSize}
        color="#ff0000"
        anchorX="center"
        anchorY="middle"
        outlineWidth={fontSize * 0.05}
        outlineColor="#000000"
      >
        +X
      </Text>

      {/* Y Axis - Green (Up) */}
      <Line
        points={[[0, 0, 0], [0, size, 0]]}
        color="#00ff00"
        lineWidth={2}
      />
      <Cone
        args={[arrowSize, arrowSize * 2, 8]}
        position={[0, size, 0]}
        rotation={[0, 0, 0]}
      >
        <meshBasicMaterial color="#00ff00" />
      </Cone>
      <Text
        position={[0, size + labelOffset, 0]}
        fontSize={fontSize}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={fontSize * 0.05}
        outlineColor="#000000"
      >
        +Y
      </Text>

      {/* Z Axis - Blue (Forward from origin perspective) */}
      <Line
        points={[[0, 0, 0], [0, 0, size]]}
        color="#0000ff"
        lineWidth={2}
      />
      <Cone
        args={[arrowSize, arrowSize * 2, 8]}
        position={[0, 0, size]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial color="#0000ff" />
      </Cone>
      <Text
        position={[0, 0, size + labelOffset]}
        fontSize={fontSize}
        color="#0000ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={fontSize * 0.05}
        outlineColor="#000000"
      >
        +Z
      </Text>

      {/* Origin marker */}
      <mesh>
        <sphereGeometry args={[originSize, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Negative axis indicators (shorter lines) */}
      <Line
        points={[[0, 0, 0], [-size * 0.3, 0, 0]]}
        color="#800000"
        lineWidth={1}
        dashed
        dashScale={50}
        dashSize={0.1}
        gapSize={0.05}
      />
      <Line
        points={[[0, 0, 0], [0, -size * 0.3, 0]]}
        color="#008000"
        lineWidth={1}
        dashed
        dashScale={50}
        dashSize={0.1}
        gapSize={0.05}
      />
      <Line
        points={[[0, 0, 0], [0, 0, -size * 0.3]]}
        color="#000080"
        lineWidth={1}
        dashed
        dashScale={50}
        dashSize={0.1}
        gapSize={0.05}
      />
    </group>
  )
}
