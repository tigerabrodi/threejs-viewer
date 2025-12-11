import { useModelStore, useValidationStore } from '../../store'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

export function ExportPanel() {
  const scene = useModelStore((state) => state.scene)
  const modelName = useModelStore((state) => state.modelName)
  const results = useValidationStore((state) => state.results)

  const correctionsNeeded = results.filter((r) => !r.passed && r.correctiveTransform).length

  const handleExport = async () => {
    if (!scene) return

    try {
      const exporter = new GLTFExporter()
      const glb = await exporter.parseAsync(scene, { binary: true })
      const blob = new Blob([glb as ArrayBuffer], { type: 'model/gltf-binary' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${modelName || 'model'}_exported.glb`
      link.click()

      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <div className="panel export-panel">
      <div className="panel-header">
        <h3>EXPORT</h3>
      </div>
      <div className="panel-content">
        {correctionsNeeded > 0 && (
          <p className="export-info">
            {correctionsNeeded} correction{correctionsNeeded > 1 ? 's' : ''} available
          </p>
        )}
        <button
          className="export-button"
          onClick={handleExport}
          disabled={!scene}
        >
          Export Model (.glb)
        </button>
        {!scene && <p className="no-data">No model loaded</p>}
      </div>
    </div>
  )
}
