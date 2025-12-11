import { useState } from 'react'
import type { ValidationCheckResult } from '../../core/types'
import { StatusBadge } from '../common/StatusBadge'
import { AlignmentDiagram } from '../common/AlignmentDiagram'

interface ValidationItemProps {
  checkResult: ValidationCheckResult
  onApplyFix?: (checkResult: ValidationCheckResult) => void
}

export function ValidationItem({ checkResult, onApplyFix }: ValidationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const status = checkResult.passed
    ? 'pass'
    : checkResult.severity === 'error'
    ? 'fail'
    : 'warn'

  const formatVector = (value: unknown): string => {
    if (typeof value === 'object' && value !== null && 'x' in value) {
      const v = value as { x: string | number; y: string | number; z: string | number }
      return `(${v.x}, ${v.y}, ${v.z})`
    }
    return JSON.stringify(value)
  }

  // Determine severity level based on deviation angle or corrective transform
  const getSeverityLevel = (): 'critical' | 'high' | 'medium' | 'low' | null => {
    if (checkResult.passed) return null

    // Check deviation angle if available
    if (checkResult.deviationAngleDegrees) {
      const angle = checkResult.deviationAngleDegrees
      if (angle >= 135) return 'critical'
      if (angle >= 90) return 'high'
      if (angle >= 45) return 'medium'
      return 'low'
    }

    // Fall back to corrective transform angle
    if (checkResult.correctiveTransform?.type === 'rotate') {
      const angle = Math.abs(checkResult.correctiveTransform.angleDegrees)
      if (angle >= 135) return 'critical'
      if (angle >= 90) return 'high'
      if (angle >= 45) return 'medium'
      return 'low'
    }

    // For non-rotation issues, use severity
    return checkResult.severity === 'error' ? 'high' : 'medium'
  }

  const severityLevel = getSeverityLevel()

  // Get severity colors and descriptions
  const getSeverityInfo = () => {
    switch (severityLevel) {
      case 'critical':
        return { color: '#f87171', label: 'CRITICAL', description: 'Nearly opposite direction', icon: '⚠' }
      case 'high':
        return { color: '#fb923c', label: 'HIGH', description: 'Perpendicular or worse', icon: '✕' }
      case 'medium':
        return { color: '#fbbf24', label: 'MEDIUM', description: 'Significantly off-axis', icon: '!' }
      case 'low':
        return { color: '#fcd34d', label: 'LOW', description: 'Slightly misaligned', icon: '○' }
      default:
        return null
    }
  }

  const severityInfo = getSeverityInfo()

  // Get the deviation angle from either field
  const deviationAngle = checkResult.deviationAngleDegrees ??
    (checkResult.correctiveTransform?.type === 'rotate'
      ? Math.abs(checkResult.correctiveTransform.angleDegrees)
      : undefined)

  // Get detection method info from metadata
  const metadata = checkResult.metadata as Record<string, unknown> | undefined
  const detectionMethod = metadata?.detectionMethod as string | undefined
  const detectionConfidence = metadata?.confidence as number | undefined

  // Get provider-friendly explanation
  const getProviderExplanation = (): string => {
    const issue = metadata?.issue as string | undefined
    const suggestedFix = metadata?.suggestedFix as string | undefined

    if (suggestedFix) return suggestedFix

    if (checkResult.checkId === 'forward-direction') {
      if (issue === 'backwards') {
        return 'The model is facing the wrong direction. This is common when the character was created facing +Z instead of -Z. Re-export with the character facing -Z (towards the camera in front view).'
      }
      if (issue === 'z-up-export') {
        return 'The model appears to be exported with Z-up orientation. In Blender: Go to File → Export → glTF, then enable "+Y Up" in the Transform section.'
      }
    }

    if (checkResult.checkId === 'up-direction') {
      if (issue === 'z-up') {
        return 'The model uses Z-up convention (common in Blender). When exporting to glTF/GLB: Enable "+Y Up" option to convert to Y-up automatically.'
      }
      if (issue === 'upside-down') {
        return 'The model is upside-down. Check if the model was accidentally flipped during creation or export.'
      }
      if (issue === 'sideways') {
        return 'The model is rotated sideways. This may indicate the model was created on its side or there is a coordinate system mismatch.'
      }
    }

    if (checkResult.checkId === 'pivot-position') {
      return 'The pivot point should be at the model\'s feet (bottom-center) for proper ground alignment. In your 3D software, move the origin to the bottom of the model before exporting.'
    }

    if (checkResult.checkId === 'coordinate-system') {
      return 'The model uses a left-handed coordinate system. This can cause mirroring issues. Check your export settings or apply a negative scale on one axis.'
    }

    return ''
  }

  const providerExplanation = getProviderExplanation()

  return (
    <div className={`validation-item ${severityLevel ? `severity-${severityLevel}` : ''}`}>
      <div
        className="validation-item-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="item-status-section">
          <StatusBadge status={status} />
          {severityInfo && (
            <span
              className="severity-icon"
              style={{ color: severityInfo.color }}
              title={severityInfo.description}
            >
              {severityInfo.icon}
            </span>
          )}
        </div>

        <div className="item-content">
          <div className="item-title">
            <span className="validation-item-name">{checkResult.name}</span>
            {/* Show deviation angle prominently in the header */}
            {deviationAngle !== undefined && !checkResult.passed && (
              <span className="deviation-badge" style={{ backgroundColor: severityInfo?.color }}>
                {deviationAngle.toFixed(1)}° off
              </span>
            )}
          </div>
          <span className="validation-item-message">{checkResult.message}</span>
        </div>

        <span className="validation-item-expand">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="validation-item-details">
          {/* Severity indicator with description */}
          {severityInfo && (
            <div className="severity-indicator" style={{ borderLeftColor: severityInfo.color }}>
              <span className="severity-badge" style={{ backgroundColor: severityInfo.color }}>
                {severityInfo.label}
              </span>
              <span className="severity-description">{severityInfo.description}</span>
            </div>
          )}

          {/* Detection method info */}
          {detectionMethod && (
            <div className="detection-info">
              <span className="detection-label">Detected via:</span>
              <span className="detection-method">{detectionMethod}</span>
              {detectionConfidence !== undefined && (
                <span className="detection-confidence">
                  ({(detectionConfidence * 100).toFixed(0)}% confidence)
                </span>
              )}
            </div>
          )}

          {/* Visual diagram for alignment issues */}
          {deviationAngle !== undefined && !checkResult.passed && (
            <AlignmentDiagram
              checkType={checkResult.checkId}
              measuredValue={checkResult.measuredValue}
              expectedValue={checkResult.expectedValue}
              deviationAngle={deviationAngle}
            />
          )}

          {/* Measured vs Expected values */}
          <div className="values-comparison">
            {checkResult.measuredValue !== undefined && (
              <div className="value-row">
                <span className="value-label measured">Measured:</span>
                <code className="value-code">{formatVector(checkResult.measuredValue)}</code>
              </div>
            )}
            {checkResult.expectedValue !== undefined && (
              <div className="value-row">
                <span className="value-label expected">Expected:</span>
                <code className="value-code">{formatVector(checkResult.expectedValue)}</code>
              </div>
            )}
          </div>

          {/* Provider-friendly explanation */}
          {providerExplanation && (
            <div className="provider-explanation">
              <div className="explanation-header">
                <span className="explanation-icon">💡</span>
                <span className="explanation-label">For 3D Artists:</span>
              </div>
              <p className="explanation-text">{providerExplanation}</p>
            </div>
          )}

          {/* Enhanced correction section with Apply button */}
          {checkResult.correctiveTransform && (
            <div className="validation-correction">
              <div className="correction-header">
                <span className="correction-icon">🔧</span>
                <span className="correction-label">Technical Fix</span>
              </div>
              <div className="correction-details">
                <div className="correction-item">
                  <span className="correction-key">Transform:</span>
                  <span className="correction-val">
                    {checkResult.correctiveTransform.type.toUpperCase()}
                  </span>
                </div>
                {checkResult.correctiveTransform.type === 'rotate' && (
                  <>
                    <div className="correction-item">
                      <span className="correction-key">Axis:</span>
                      <span className="correction-val">
                        {checkResult.correctiveTransform.axis.toUpperCase()}-axis
                      </span>
                    </div>
                    <div className="correction-item">
                      <span className="correction-key">Angle:</span>
                      <span className="correction-val highlight">
                        {checkResult.correctiveTransform.angleDegrees}°
                      </span>
                    </div>
                  </>
                )}
                {(checkResult.correctiveTransform.type === 'scale' || checkResult.correctiveTransform.type === 'translate') && (
                  <div className="correction-item">
                    <span className="correction-key">Values:</span>
                    <span className="correction-val">
                      ({checkResult.correctiveTransform.x.toFixed(2)}, {checkResult.correctiveTransform.y.toFixed(2)}, {checkResult.correctiveTransform.z.toFixed(2)})
                    </span>
                  </div>
                )}
              </div>
              {onApplyFix && (
                <button
                  className="apply-fix-button"
                  onClick={() => onApplyFix(checkResult)}
                  title="Apply this correction to the model"
                >
                  Apply Fix
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
