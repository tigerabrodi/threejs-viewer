import { useState, type ReactNode, type DragEvent } from 'react'
import { useModelStore } from '../../store'
import { AppHeader } from './AppHeader'

interface AppLayoutProps {
  viewport: ReactNode
  sidebar: ReactNode
}

const ACCEPTED_FORMATS = ['.glb', '.gltf', '.fbx']

export function AppLayout({ viewport, sidebar }: AppLayoutProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const setFile = useModelStore((state) => state.setFile)
  const hasModel = useModelStore((state) => state.file !== null)
  const isLoading = useModelStore((state) => state.isLoading)

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    return ACCEPTED_FORMATS.includes(extension)
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set to false if we're leaving the viewport area itself
    if (e.currentTarget === e.target) {
      setIsDraggingOver(false)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        setFile(file)
      } else {
        alert(`Please upload a valid 3D model (${ACCEPTED_FORMATS.join(', ')})`)
      }
    }
  }

  return (
    <div className="app-layout">
      <AppHeader />
      <div className="main-content">
        <div
          className={`viewport-area ${isDraggingOver ? 'viewport-drag-active' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {viewport}
          {!hasModel && !isDraggingOver && !isLoading && (
            <div className="viewport-empty-state">
              <div className="viewport-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div className="viewport-empty-title">Drop a 3D model to validate</div>
              <div className="viewport-empty-subtitle">Supports GLB, GLTF, FBX</div>
            </div>
          )}
          {isLoading && (
            <div className="viewport-loading-state">
              <div className="loading-spinner"></div>
              <div className="viewport-loading-text">Loading model...</div>
            </div>
          )}
          {isDraggingOver && (
            <div className="viewport-drop-overlay">
              <div className="viewport-drop-message">
                Drop model here
              </div>
            </div>
          )}
        </div>
        <div className="sidebar-area">{sidebar}</div>
      </div>
    </div>
  )
}
