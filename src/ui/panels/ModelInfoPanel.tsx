import { useMemo } from 'react'
import { useModelStore } from '../../store'
import { analyzeModel, formatNumber, type ModelInfo } from '../../core/model-analyzer'
import { formatDisplayScale } from '../../core/model-normalizer'

export function ModelInfoPanel() {
  const scene = useModelStore((state) => state.scene)
  const modelName = useModelStore((state) => state.modelName)
  const file = useModelStore((state) => state.file)
  const normalization = useModelStore((state) => state.normalization)

  const modelInfo = useMemo<ModelInfo | null>(() => {
    if (!scene) return null
    return analyzeModel(scene)
  }, [scene])

  if (!modelInfo) {
    return (
      <div className="panel model-info-panel">
        <div className="panel-header">
          <h3>MODEL INFO</h3>
        </div>
        <div className="panel-content">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p className="empty-title">No Model Loaded</p>
            <p className="empty-subtitle">Drop a GLB/GLTF file to see stats</p>
          </div>
        </div>
      </div>
    )
  }

  const formatDimension = (value: number) => {
    if (value < 0.01) return value.toExponential(2)
    if (value < 1) return value.toFixed(3)
    if (value < 100) return value.toFixed(2)
    return value.toFixed(1)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="panel model-info-panel">
      <div className="panel-header">
        <h3>MODEL INFO</h3>
      </div>
      <div className="panel-content">
        {/* File Info */}
        <div className="info-section">
          <div className="info-section-header">
            <span className="section-icon">📁</span>
            <span>File</span>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value" title={modelName}>{modelName}</span>
            </div>
            {file && (
              <div className="info-item">
                <span className="info-label">Size</span>
                <span className="info-value">{formatFileSize(file.size)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Display Scale (when normalized) */}
        {normalization && normalization.scaleFactor !== 1 && (
          <div className="info-section display-scale-section">
            <div className="info-section-header">
              <span className="section-icon">🔍</span>
              <span>Display Scale</span>
            </div>
            <div className="scale-indicator">
              <span className="scale-value">{formatDisplayScale(normalization.scaleFactor)}</span>
              <span className="scale-note">Scaled for viewing</span>
            </div>
          </div>
        )}

        {/* Geometry Stats */}
        <div className="info-section">
          <div className="info-section-header">
            <span className="section-icon">🔺</span>
            <span>Geometry</span>
          </div>
          <div className="info-grid three-col">
            <div className="info-stat">
              <span className="stat-value">{formatNumber(modelInfo.vertexCount)}</span>
              <span className="stat-label">Vertices</span>
            </div>
            <div className="info-stat">
              <span className="stat-value">{formatNumber(modelInfo.triangleCount)}</span>
              <span className="stat-label">Triangles</span>
            </div>
            <div className="info-stat">
              <span className="stat-value">{modelInfo.meshCount}</span>
              <span className="stat-label">Meshes</span>
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="info-section">
          <div className="info-section-header">
            <span className="section-icon">📐</span>
            <span>Dimensions</span>
          </div>
          <div className="dimension-display">
            <div className="dimension-item">
              <span className="dim-axis x">X</span>
              <span className="dim-value">{formatDimension(modelInfo.dimensions.width)}</span>
            </div>
            <div className="dimension-item">
              <span className="dim-axis y">Y</span>
              <span className="dim-value">{formatDimension(modelInfo.dimensions.height)}</span>
            </div>
            <div className="dimension-item">
              <span className="dim-axis z">Z</span>
              <span className="dim-value">{formatDimension(modelInfo.dimensions.depth)}</span>
            </div>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Center</span>
              <span className="info-value mono">
                ({formatDimension(modelInfo.center.x)}, {formatDimension(modelInfo.center.y)}, {formatDimension(modelInfo.center.z)})
              </span>
            </div>
          </div>
        </div>

        {/* Materials */}
        <div className="info-section">
          <div className="info-section-header">
            <span className="section-icon">🎨</span>
            <span>Materials ({modelInfo.materialCount})</span>
          </div>
          {modelInfo.materials.length > 0 ? (
            <div className="material-list">
              {modelInfo.materials.slice(0, 5).map((mat, idx) => (
                <div key={idx} className="material-item">
                  <span className="material-name">{mat.name}</span>
                  <span className="material-type">{mat.type.replace('Material', '')}</span>
                  {mat.textureTypes.length > 0 && (
                    <span className="material-textures">
                      {mat.textureTypes.join(', ')}
                    </span>
                  )}
                </div>
              ))}
              {modelInfo.materials.length > 5 && (
                <div className="more-items">+{modelInfo.materials.length - 5} more</div>
              )}
            </div>
          ) : (
            <div className="no-data">No materials</div>
          )}
        </div>

        {/* Skeleton */}
        {modelInfo.hasSkeleton && (
          <div className="info-section">
            <div className="info-section-header">
              <span className="section-icon">🦴</span>
              <span>Skeleton</span>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Bones</span>
                <span className="info-value">{modelInfo.boneCount}</span>
              </div>
              {modelInfo.rigType && (
                <div className="info-item">
                  <span className="info-label">Rig Type</span>
                  <span className="info-value">{modelInfo.rigType}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Textures */}
        {modelInfo.textureCount > 0 && (
          <div className="info-section">
            <div className="info-section-header">
              <span className="section-icon">🖼️</span>
              <span>Textures ({modelInfo.textureCount})</span>
            </div>
            <div className="texture-list">
              {modelInfo.textures.slice(0, 4).map((tex, idx) => (
                <div key={idx} className="texture-item">
                  <span className="texture-dims">{tex.width}x{tex.height}</span>
                </div>
              ))}
              {modelInfo.textures.length > 4 && (
                <div className="more-items">+{modelInfo.textures.length - 4} more</div>
              )}
            </div>
          </div>
        )}

        {/* Animations */}
        {modelInfo.hasAnimations && (
          <div className="info-section">
            <div className="info-section-header">
              <span className="section-icon">🎬</span>
              <span>Animations ({modelInfo.animationCount})</span>
            </div>
            <div className="animation-list">
              {modelInfo.animations.slice(0, 3).map((anim, idx) => (
                <div key={idx} className="animation-item">
                  <span className="anim-name">{anim.name}</span>
                  <span className="anim-duration">{anim.duration.toFixed(2)}s</span>
                </div>
              ))}
              {modelInfo.animations.length > 3 && (
                <div className="more-items">+{modelInfo.animations.length - 3} more</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
