import { ValidationPanel } from '../panels/ValidationPanel'
import { OverlayToggles } from '../panels/OverlayToggles'
import { ExportPanel } from '../panels/ExportPanel'

export function Sidebar() {
  return (
    <div className="sidebar">
      <ValidationPanel />
      <OverlayToggles />
      <ExportPanel />
    </div>
  )
}
