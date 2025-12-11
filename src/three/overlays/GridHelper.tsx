import { Grid } from '@react-three/drei'

interface GridHelperProps {
  size?: number
}

export function GridHelper({ size = 20 }: GridHelperProps) {
  // Calculate grid parameters based on size
  const cellSize = Math.max(0.1, size / 20)
  const sectionSize = cellSize * 5
  const fadeDistance = size * 2

  return (
    <Grid
      args={[size, size]}
      cellSize={cellSize}
      cellThickness={0.5}
      cellColor="#4a4a4a"
      sectionSize={sectionSize}
      sectionThickness={1.2}
      sectionColor="#6a6a6a"
      fadeDistance={fadeDistance}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={false}
    />
  )
}
