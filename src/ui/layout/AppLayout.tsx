import type { ReactNode } from 'react'

interface AppLayoutProps {
  viewport: ReactNode
  sidebar: ReactNode
  statusBar: ReactNode
}

export function AppLayout({ viewport, sidebar, statusBar }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="viewport-area">{viewport}</div>
        <div className="sidebar-area">{sidebar}</div>
      </div>
      <div className="status-bar">{statusBar}</div>
    </div>
  )
}
