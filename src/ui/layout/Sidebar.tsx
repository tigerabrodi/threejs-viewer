import { ValidationPanel } from '../panels/ValidationPanel'
import { ModelInfoPanel } from '../panels/ModelInfoPanel'
import { OverlayToggles } from '../panels/OverlayToggles'
import { ExportPanel } from '../panels/ExportPanel'

export function Sidebar() {
  return (
    <div className="sidebar">
      <ValidationPanel />
      <ModelInfoPanel />
      <OverlayToggles />
      <ExportPanel />
    </div>
  )
}
