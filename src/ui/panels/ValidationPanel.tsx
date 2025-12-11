import { useValidationStore } from '../../store'
import { ValidationItem } from './ValidationItem'

export function ValidationPanel() {
  const results = useValidationStore((state) => state.results)

  const passedCount = results.filter((r) => r.passed).length
  const totalCount = results.length
  const errorCount = results.filter((r) => !r.passed && r.severity === 'error').length
  const warningCount = results.filter((r) => !r.passed && r.severity === 'warning').length

  // Calculate health percentage (0-100)
  const healthPercentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 100

  // Determine overall status
  const getOverallStatus = () => {
    if (healthPercentage === 100) return 'perfect'
    if (healthPercentage >= 80) return 'good'
    if (healthPercentage >= 50) return 'warning'
    return 'critical'
  }

  const overallStatus = getOverallStatus()

  const statusConfig = {
    perfect: { label: 'Perfect Alignment', color: 'var(--accent-green)', icon: '✓' },
    good: { label: 'Minor Issues', color: 'var(--accent-blue)', icon: '○' },
    warning: { label: 'Needs Attention', color: 'var(--accent-amber)', icon: '!' },
    critical: { label: 'Critical Issues', color: 'var(--accent-red)', icon: '✕' }
  }

  return (
    <div className="panel validation-panel">
      <div className="panel-header">
        <h3>MODEL ALIGNMENT</h3>
      </div>

      {totalCount > 0 && (
        <div className="validation-overview">
          <div className="health-score-container">
            <div className="health-score" style={{
              background: `conic-gradient(${statusConfig[overallStatus].color} ${healthPercentage * 3.6}deg, var(--bg-secondary) ${healthPercentage * 3.6}deg)`
            }}>
              <div className="health-score-inner">
                <div className="health-percentage">{healthPercentage}%</div>
                <div className="health-label">Aligned</div>
              </div>
            </div>
            <div className="health-status">
              <span className="status-icon" style={{ color: statusConfig[overallStatus].color }}>
                {statusConfig[overallStatus].icon}
              </span>
              <span className="status-text" style={{ color: statusConfig[overallStatus].color }}>
                {statusConfig[overallStatus].label}
              </span>
            </div>
          </div>

          {(errorCount > 0 || warningCount > 0) && (
            <div className="issue-summary">
              {errorCount > 0 && (
                <div className="issue-count error-count">
                  <span className="issue-icon">✕</span>
                  <span>{errorCount} Error{errorCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              {warningCount > 0 && (
                <div className="issue-count warning-count">
                  <span className="issue-icon">!</span>
                  <span>{warningCount} Warning{warningCount !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="panel-content">
        {results.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p className="empty-title">No Model Loaded</p>
            <p className="empty-subtitle">Drop a GLB/GLTF file to validate alignment</p>
          </div>
        ) : (
          <>
            {errorCount > 0 && (
              <div className="section-header error-section">
                <span className="section-icon">✕</span>
                <span>Critical Issues ({errorCount})</span>
              </div>
            )}
            {results
              .filter((r) => !r.passed && r.severity === 'error')
              .map((check) => (
                <ValidationItem key={check.checkId} checkResult={check} />
              ))}

            {warningCount > 0 && (
              <div className="section-header warning-section">
                <span className="section-icon">!</span>
                <span>Warnings ({warningCount})</span>
              </div>
            )}
            {results
              .filter((r) => !r.passed && r.severity === 'warning')
              .map((check) => (
                <ValidationItem key={check.checkId} checkResult={check} />
              ))}

            {passedCount > 0 && (
              <div className="section-header success-section">
                <span className="section-icon">✓</span>
                <span>Passed ({passedCount})</span>
              </div>
            )}
            {results
              .filter((r) => r.passed)
              .map((check) => (
                <ValidationItem key={check.checkId} checkResult={check} />
              ))}
          </>
        )}
      </div>
    </div>
  )
}
