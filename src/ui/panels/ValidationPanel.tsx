import { useValidationStore } from '../../store'
import { ValidationItem } from './ValidationItem'

export function ValidationPanel() {
  const results = useValidationStore((state) => state.results)

  const passedCount = results.filter((r) => r.passed).length
  const totalCount = results.length

  return (
    <div className="panel validation-panel">
      <div className="panel-header">
        <h3>VALIDATION RESULTS</h3>
        {totalCount > 0 && (
          <span className="validation-score">
            {passedCount}/{totalCount}
          </span>
        )}
      </div>
      <div className="panel-content">
        {results.length === 0 ? (
          <p className="no-data">Load a model to validate</p>
        ) : (
          results.map((check) => (
            <ValidationItem key={check.checkId} checkResult={check} />
          ))
        )}
      </div>
    </div>
  )
}
