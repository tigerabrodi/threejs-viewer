import { useState } from 'react'
import type { ValidationCheckResult } from '../../core/types'
import { StatusBadge } from '../common/StatusBadge'

interface ValidationItemProps {
  checkResult: ValidationCheckResult
}

export function ValidationItem({ checkResult }: ValidationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const status = checkResult.passed
    ? 'pass'
    : checkResult.severity === 'error'
    ? 'fail'
    : 'warn'

  const formatValue = (value: unknown): string => {
    return JSON.stringify(value)
  }

  return (
    <div className="validation-item">
      <div
        className="validation-item-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <StatusBadge status={status} />
        <span className="validation-item-name">{checkResult.name}</span>
        <span className="validation-item-message">{checkResult.message}</span>
        <span className="validation-item-expand">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="validation-item-details">
          {checkResult.measuredValue !== undefined && (
            <div className="validation-detail-row">
              <span className="detail-label">Measured:</span>
              <code className="detail-value">
                {formatValue(checkResult.measuredValue)}
              </code>
            </div>
          )}
          {checkResult.expectedValue !== undefined && (
            <div className="validation-detail-row">
              <span className="detail-label">Expected:</span>
              <code className="detail-value">
                {formatValue(checkResult.expectedValue)}
              </code>
            </div>
          )}
          {checkResult.correctiveTransform && (
            <div className="validation-correction">
              <span className="correction-label">Fix:</span>
              <code className="correction-value">
                {checkResult.correctiveTransform.type === 'rotate'
                  ? `Rotate ${checkResult.correctiveTransform.angleDegrees}° around ${checkResult.correctiveTransform.axis.toUpperCase()}`
                  : checkResult.correctiveTransform.type === 'scale'
                  ? `Scale (${checkResult.correctiveTransform.x}, ${checkResult.correctiveTransform.y}, ${checkResult.correctiveTransform.z})`
                  : `Translate (${checkResult.correctiveTransform.x.toFixed(2)}, ${checkResult.correctiveTransform.y.toFixed(2)}, ${checkResult.correctiveTransform.z.toFixed(2)})`}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
