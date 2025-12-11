interface AlignmentDiagramProps {
  checkType: string
  measuredValue: unknown
  expectedValue: unknown
  deviationAngle: number
}

export function AlignmentDiagram({
  checkType,
  measuredValue,
  expectedValue,
  deviationAngle,
}: AlignmentDiagramProps) {
  // Parse vector values
  const parseVector = (value: unknown): { x: number; y: number; z: number } | null => {
    if (typeof value === 'object' && value !== null) {
      const v = value as any
      return {
        x: parseFloat(v.x) || 0,
        y: parseFloat(v.y) || 0,
        z: parseFloat(v.z) || 0,
      }
    }
    return null
  }

  const measured = parseVector(measuredValue)
  const expected = parseVector(expectedValue)

  if (!measured || !expected) {
    return null
  }

  // Determine which axis to show based on check type
  const getAxisView = (): { primary: string; secondary: string; isForward?: boolean; isUp?: boolean } => {
    if (checkType === 'forward-direction') {
      return { primary: 'X', secondary: 'Z', isForward: true }
    }
    if (checkType === 'up-direction') {
      return { primary: 'X', secondary: 'Y', isUp: true }
    }
    // Default view
    return { primary: 'X', secondary: 'Y' }
  }

  const axisView = getAxisView()

  // Calculate arrow directions for 2D visualization
  const get2DCoords = (vec: { x: number; y: number; z: number }) => {
    if (axisView.isForward) {
      // For forward (XZ plane, looking from above)
      return { x: vec.x, y: -vec.z }
    }
    if (axisView.isUp) {
      // For up (XY plane, side view)
      return { x: vec.x, y: vec.y }
    }
    return { x: vec.x, y: vec.y }
  }

  const measuredCoords = get2DCoords(measured)
  const expectedCoords = get2DCoords(expected)

  // Normalize and scale for display (SVG is 120x120, center at 60,60)
  const scale = 40
  const centerX = 60
  const centerY = 60

  const measuredX = centerX + measuredCoords.x * scale
  const measuredY = centerY - measuredCoords.y * scale
  const expectedX = centerX + expectedCoords.x * scale
  const expectedY = centerY - expectedCoords.y * scale

  return (
    <div className="alignment-diagram">
      <div className="diagram-header">
        <span className="diagram-title">Visual Alignment</span>
        <span className="diagram-view">({axisView.primary}-{axisView.secondary} plane)</span>
      </div>
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className="diagram-svg"
      >
        {/* Grid lines */}
        <line x1="60" y1="0" x2="60" y2="120" stroke="#3a3a3a" strokeWidth="1" />
        <line x1="0" y1="60" x2="120" y2="60" stroke="#3a3a3a" strokeWidth="1" />

        {/* Axis labels */}
        <text x="115" y="65" fontSize="10" fill="#666" textAnchor="end">+{axisView.primary}</text>
        <text x="65" y="10" fontSize="10" fill="#666" textAnchor="start">+{axisView.secondary}</text>

        {/* Expected direction (green arrow) */}
        <defs>
          <marker
            id="arrowhead-expected"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#4ade80" />
          </marker>
          <marker
            id="arrowhead-measured"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#f87171" />
          </marker>
        </defs>

        <line
          x1={centerX}
          y1={centerY}
          x2={expectedX}
          y2={expectedY}
          stroke="#4ade80"
          strokeWidth="2"
          markerEnd="url(#arrowhead-expected)"
        />

        {/* Measured direction (red arrow) */}
        <line
          x1={centerX}
          y1={centerY}
          x2={measuredX}
          y2={measuredY}
          stroke="#f87171"
          strokeWidth="2"
          markerEnd="url(#arrowhead-measured)"
        />

        {/* Arc showing angle between vectors */}
        {deviationAngle > 0 && deviationAngle < 180 && (
          <>
            <path
              d={`M ${centerX + 15 * Math.cos(Math.atan2(expectedY - centerY, expectedX - centerX))} ${centerY + 15 * Math.sin(Math.atan2(expectedY - centerY, expectedX - centerX))}
                  A 15 15 0 ${deviationAngle > 90 ? 1 : 0} ${deviationAngle > 0 ? 1 : 0}
                  ${centerX + 15 * Math.cos(Math.atan2(measuredY - centerY, measuredX - centerX))} ${centerY + 15 * Math.sin(Math.atan2(measuredY - centerY, measuredX - centerX))}`}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="2,2"
            />
          </>
        )}

        {/* Center dot */}
        <circle cx={centerX} cy={centerY} r="3" fill="#666" />
      </svg>

      <div className="diagram-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4ade80' }} />
          <span>Expected</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#f87171' }} />
          <span>Measured ({deviationAngle.toFixed(1)}° off)</span>
        </div>
      </div>
    </div>
  )
}
