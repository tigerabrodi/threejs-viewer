import { useUIStore } from '../../store'

export function OverlayToggles() {
  const {
    showAxes,
    showGrid,
    showForwardArrow,
    showBoundingBox,
    showPivot,
    showDirectionLabels,
    showGroundPlane,
    showCompass,
    toggleOverlay,
  } = useUIStore()

  return (
    <div className="panel overlay-toggles-panel">
      <div className="panel-header">
        <h3>DISPLAY</h3>
      </div>
      <div className="panel-content">
        <div className="toggle-group">
          <div className="toggle-group-label">Orientation Guides</div>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showAxes}
              onChange={() => toggleOverlay('showAxes')}
            />
            <span>World Axes (XYZ)</span>
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
              checked={showDirectionLabels}
              onChange={() => toggleOverlay('showDirectionLabels')}
            />
            <span>Direction Labels</span>
          </label>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showCompass}
              onChange={() => toggleOverlay('showCompass')}
            />
            <span>Compass</span>
          </label>
        </div>

        <div className="toggle-group">
          <div className="toggle-group-label">Ground & Space</div>
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
              checked={showGroundPlane}
              onChange={() => toggleOverlay('showGroundPlane')}
            />
            <span>Ground Plane</span>
          </label>
        </div>

        <div className="toggle-group">
          <div className="toggle-group-label">Model</div>
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
    </div>
  )
}
