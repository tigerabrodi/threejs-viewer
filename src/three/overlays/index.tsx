import { useUIStore, useModelStore } from '../../store'
import { AxesHelper } from './AxesHelper'
import { ForwardArrow } from './ForwardArrow'
import { GridHelper } from './GridHelper'
import { BoundingBoxHelper } from './BoundingBoxHelper'
import { PivotMarker } from './PivotMarker'

export function Overlays() {
  const showGrid = useUIStore((state) => state.showGrid)
  const showAxes = useUIStore((state) => state.showAxes)
  const showForwardArrow = useUIStore((state) => state.showForwardArrow)
  const showBoundingBox = useUIStore((state) => state.showBoundingBox)
  const showPivot = useUIStore((state) => state.showPivot)
  const scene = useModelStore((state) => state.scene)

  return (
    <>
      {showGrid && <GridHelper />}
      {showAxes && <AxesHelper />}
      {showForwardArrow && <ForwardArrow />}
      {showBoundingBox && scene && <BoundingBoxHelper target={scene} />}
      {showPivot && <PivotMarker />}
    </>
  )
}

export { AxesHelper } from './AxesHelper'
export { ForwardArrow } from './ForwardArrow'
export { GridHelper } from './GridHelper'
export { BoundingBoxHelper } from './BoundingBoxHelper'
export { PivotMarker } from './PivotMarker'
