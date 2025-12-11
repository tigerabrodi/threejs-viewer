import { useMemo } from 'react'
import { Html } from '@react-three/drei'

interface DirectionLabelsProps {
  distance: number
}

interface LabelConfig {
  position: [number, number, number]
  label: string
  axis: string
  color: string
  description: string
}

export function DirectionLabels({ distance }: DirectionLabelsProps) {
  const labels: LabelConfig[] = useMemo(() => [
    // Forward (-Z)
    {
      position: [0, 0, -distance],
      label: '-Z',
      axis: 'Forward',
      color: '#4a9eff',
      description: 'FRONT',
    },
    // Back (+Z)
    {
      position: [0, 0, distance],
      label: '+Z',
      axis: 'Back',
      color: '#4a9eff',
      description: 'BACK',
    },
    // Right (+X)
    {
      position: [distance, 0, 0],
      label: '+X',
      axis: 'Right',
      color: '#f87171',
      description: 'RIGHT',
    },
    // Left (-X)
    {
      position: [-distance, 0, 0],
      label: '-X',
      axis: 'Left',
      color: '#f87171',
      description: 'LEFT',
    },
    // Up (+Y) - slightly above ground
    {
      position: [0, distance * 0.8, 0],
      label: '+Y',
      axis: 'Up',
      color: '#4ade80',
      description: 'UP',
    },
  ], [distance])

  return (
    <>
      {labels.map((config) => (
        <Html
          key={config.label}
          position={config.position}
          center
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: config.color,
                textShadow: '0 0 4px rgba(0,0,0,0.8)',
                letterSpacing: '1px',
              }}
            >
              {config.description}
            </div>
            <div
              style={{
                fontSize: '9px',
                color: 'rgba(255,255,255,0.6)',
                textShadow: '0 0 4px rgba(0,0,0,0.8)',
              }}
            >
              {config.label}
            </div>
          </div>
        </Html>
      ))}
    </>
  )
}
