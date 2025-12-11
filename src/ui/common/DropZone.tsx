import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { useModelStore } from '../../store'

const ACCEPTED_FORMATS = ['.glb', '.gltf', '.fbx']

export function DropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const setFile = useModelStore((state) => state.setFile)
  const modelName = useModelStore((state) => state.modelName)

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    return ACCEPTED_FORMATS.includes(extension)
  }

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setFile(file)
    } else {
      alert(`Please upload a valid 3D model (${ACCEPTED_FORMATS.join(', ')})`)
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
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`drop-zone ${isDragging ? 'drop-zone-active' : ''}`}
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
      />
      {modelName ? (
        <span className="drop-zone-loaded">
          <span className="file-name">{modelName}</span>
          <span className="change-hint">Click to change</span>
        </span>
      ) : (
        <span className="drop-zone-empty">
          Drop GLB/GLTF/FBX here or click to browse
        </span>
      )}
    </div>
  )
}
