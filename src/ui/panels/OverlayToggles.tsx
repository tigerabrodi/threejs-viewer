import { useUIStore } from '../../store'

export function OverlayToggles() {
  const {
    showAxes,
    showGrid,
    showForwardArrow,
    showBoundingBox,
    showPivot,
    toggleOverlay,
  } = useUIStore()

  return (
    <div className="panel overlay-toggles-panel">
      <div className="panel-header">
        <h3>DISPLAY</h3>
      </div>
      <div className="panel-content">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showAxes}
            onChange={() => toggleOverlay('showAxes')}
          />
          <span>World Axes</span>
        </label>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={() => toggleOverlay('showGrid')}
          />
          <span>Grid</span>
        </label>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showForwardArrow}
            onChange={() => toggleOverlay('showForwardArrow')}
          />
          <span>Forward Arrow (-Z)</span>
        </label>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showBoundingBox}
            onChange={() => toggleOverlay('showBoundingBox')}
          />
          <span>Bounding Box</span>
        </label>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showPivot}
            onChange={() => toggleOverlay('showPivot')}
          />
          <span>Pivot Marker</span>
        </label>
      </div>
    </div>
  )
}
