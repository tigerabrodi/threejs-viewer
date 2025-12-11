import { useUIStore, useModelStore } from '../../store'
import { AxesHelper } from './AxesHelper'
import { ForwardArrow } from './ForwardArrow'
import { GridHelper } from './GridHelper'
import { BoundingBoxHelper } from './BoundingBoxHelper'
import { PivotMarker } from './PivotMarker'
import { DirectionLabels } from './DirectionLabels'
import { GroundPlane } from './GroundPlane'
import { CompassOverlay } from './CompassOverlay'
import { NORMALIZATION_CONFIG } from '../../core/model-normalizer'

// Base size for overlays - matches normalized model size
const BASE_SIZE = NORMALIZATION_CONFIG.TARGET_SIZE

export function Overlays() {
  const showGrid = useUIStore((state) => state.showGrid)
  const showAxes = useUIStore((state) => state.showAxes)
  const showForwardArrow = useUIStore((state) => state.showForwardArrow)
  const showBoundingBox = useUIStore((state) => state.showBoundingBox)
  const showPivot = useUIStore((state) => state.showPivot)
  const showDirectionLabels = useUIStore((state) => state.showDirectionLabels)
  const showGroundPlane = useUIStore((state) => state.showGroundPlane)
  const showCompass = useUIStore((state) => state.showCompass)
  const scene = useModelStore((state) => state.scene)
  const normalization = useModelStore((state) => state.normalization)

  // With normalized models, overlays use consistent fixed sizes
  // based on the target normalization size (2 units)
  return (
    <>
      {showGroundPlane && <GroundPlane size={BASE_SIZE * 4} />}
      {showGrid && <GridHelper size={BASE_SIZE * 4} />}
      {showAxes && <AxesHelper size={BASE_SIZE * 1.5} />}
      {showForwardArrow && <ForwardArrow length={BASE_SIZE * 1.2} />}
      {showBoundingBox && scene && normalization && (
        <BoundingBoxHelper target={scene} scaleFactor={normalization.scaleFactor} />
      )}
      {showPivot && <PivotMarker size={BASE_SIZE * 0.05} />}
      {showDirectionLabels && <DirectionLabels distance={BASE_SIZE * 1.8} />}
      {showCompass && <CompassOverlay size={BASE_SIZE * 2} />}
    </>
  )
}

export { AxesHelper } from './AxesHelper'
export { ForwardArrow } from './ForwardArrow'
export { GridHelper } from './GridHelper'
export { BoundingBoxHelper } from './BoundingBoxHelper'
export { PivotMarker } from './PivotMarker'
export { DirectionLabels } from './DirectionLabels'
export { GroundPlane } from './GroundPlane'
export { CompassOverlay } from './CompassOverlay'
