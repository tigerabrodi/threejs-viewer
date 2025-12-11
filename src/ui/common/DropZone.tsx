import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { useModelStore } from '../../store'
import '../../DropZone.css'

const ACCEPTED_FORMATS = ['.glb', '.gltf', '.fbx']

export function DropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const setFile = useModelStore((state) => state.setFile)
  const modelName = useModelStore((state) => state.modelName)
  const isLoading = useModelStore((state) => state.isLoading)
  const error = useModelStore((state) => state.error)
  const reset = useModelStore((state) => state.reset)

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    return ACCEPTED_FORMATS.includes(extension)
  }

  const handleFile = (file: File) => {
    setFileError(null)
    if (validateFile(file)) {
      setFile(file)
    } else {
      setFileError(`Invalid format. Please upload ${ACCEPTED_FORMATS.join(', ')}`)
    }
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click()
    }
  }

  const handleClearModel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFileError(null)
    reset()
  }

  const displayError = fileError || error

  return (
    <div className="drop-zone-container">
      <div
        className={`drop-zone ${isDragging ? 'drop-zone-active' : ''} ${isLoading ? 'drop-zone-loading' : ''} ${displayError ? 'drop-zone-error' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FORMATS.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={isLoading}
        />
        {isLoading ? (
          <span className="drop-zone-status">
            <span className="loading-spinner"></span>
            <span className="status-text">Loading model...</span>
          </span>
        ) : modelName ? (
          <span className="drop-zone-loaded">
            <span className="file-name">{modelName}</span>
            <span className="change-hint">Click to change</span>
            <button
              className="clear-button"
              onClick={handleClearModel}
              aria-label="Clear model"
            >
              ×
            </button>
          </span>
        ) : (
          <span className="drop-zone-empty">
            <span className="drop-icon">📦</span>
            <span className="drop-text">
              Drop GLB/GLTF/FBX here or click to browse
            </span>
            <span className="drop-hint">Supports 3D model files</span>
          </span>
        )}
      </div>
      {displayError && (
        <div className="drop-zone-error-message">
          <span className="error-icon">⚠</span>
          <span className="error-text">{displayError}</span>
        </div>
      )}
    </div>
  )
}
