import * as THREE from 'three'
import type { ValidationCheckResult, CorrectionTransform, ModelValidationReport } from '../types/validation'
import { checkForwardDirection } from './checks/forward-direction'
import { checkUpDirection } from './checks/up-direction'
import { checkHandedness } from './checks/handedness'
import { checkPivotPosition } from './checks/pivot-position'
import { checkScale } from './checks/scale'

/**
 * Main validation orchestrator for 3D models.
 */
export class ModelValidator {
  /**
   * Validate a 3D model against cf-kernel conventions.
   */
  validate(object: THREE.Object3D, modelName: string): ModelValidationReport {
    const timestamp = new Date()

    // Run all validation checks
    const checks: ValidationCheckResult[] = [
      checkScale(object),
      checkHandedness(object),
      checkUpDirection(object),
      checkForwardDirection(object),
      checkPivotPosition(object)
    ]

    let errorCount = 0
    let warningCount = 0

    for (const check of checks) {
      if (!check.passed) {
        if (check.severity === 'error') {
          errorCount++
        } else if (check.severity === 'warning') {
          warningCount++
        }
      }
    }

    const overallPassed = errorCount === 0

    // Collect and order corrections: Scale → Rotate → Translate
    const suggestedCorrections = this.orderCorrections(checks)

    return {
      modelName,
      timestamp,
      checks,
      overallPassed,
      errorCount,
      warningCount,
      suggestedCorrections
    }
  }

  private orderCorrections(checks: ValidationCheckResult[]): CorrectionTransform[] {
    const corrections: CorrectionTransform[] = []

    for (const check of checks) {
      if (check.correctiveTransform && !check.passed) {
        corrections.push(check.correctiveTransform)
      }
    }

    const typePriority = { scale: 1, rotate: 2, translate: 3 }

    corrections.sort((a, b) => {
      const priorityA = typePriority[a.type]
      const priorityB = typePriority[b.type]
      return priorityA - priorityB
    })

    return corrections
  }
}
