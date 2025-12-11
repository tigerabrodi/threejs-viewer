import { Grid } from '@react-three/drei'

interface GridHelperProps {
  size?: number
}

export function GridHelper({ size = 20 }: GridHelperProps) {
  return (
    <Grid
      args={[size, size]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#4a4a4a"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#6a6a6a"
      fadeDistance={30}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={false}
    />
  )
}
