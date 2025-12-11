import '../../AppHeader.css'

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-content">
        <div className="app-title">
          <h1 className="app-name">3D Model Validator</h1>
          <p className="app-description">
            Upload and validate GLB, GLTF, or FBX models
          </p>
        </div>
        <div className="app-shortcuts">
          <span className="shortcut-item">
            <kbd>ESC</kbd> Clear
          </span>
        </div>
      </div>
    </header>
  )
}
