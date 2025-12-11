import * as THREE from 'three'
import type { ValidationCheckResult } from '../../types/validation'

const TOLERANCE = 0.05

/**
 * Check if the model's pivot is at bottom-center (feet position).
 */
export function checkPivotPosition(object: THREE.Object3D): ValidationCheckResult {
  const bbox = new THREE.Box3().setFromObject(object)
  const center = bbox.getCenter(new THREE.Vector3())
  const min = bbox.min

  const isYAtBottom = Math.abs(min.y) < TOLERANCE
  const isXCentered = Math.abs(center.x) < TOLERANCE
  const isZCentered = Math.abs(center.z) < TOLERANCE

  const allCorrect = isYAtBottom && isXCentered && isZCentered

  if (allCorrect) {
    return {
      checkId: 'pivot-position',
      name: 'Pivot Position',
      passed: true,
      severity: 'info',
      message: 'Pivot at bottom-center (correct)',
      measuredValue: {
        minY: min.y.toFixed(3),
        centerX: center.x.toFixed(3),
        centerZ: center.z.toFixed(3)
      },
      expectedValue: { minY: 0, centerX: 0, centerZ: 0 }
    }
  }

  const issues: string[] = []
  if (!isYAtBottom) issues.push(`Y min=${min.y.toFixed(2)}`)
  if (!isXCentered) issues.push(`X center=${center.x.toFixed(2)}`)
  if (!isZCentered) issues.push(`Z center=${center.z.toFixed(2)}`)

  return {
    checkId: 'pivot-position',
    name: 'Pivot Position',
    passed: false,
    severity: 'warning',
    message: `Pivot offset: ${issues.join(', ')}`,
    measuredValue: {
      minY: min.y.toFixed(3),
      centerX: center.x.toFixed(3),
      centerZ: center.z.toFixed(3)
    },
    expectedValue: { minY: 0, centerX: 0, centerZ: 0 },
    correctiveTransform: {
      type: 'translate',
      x: -center.x,
      y: -min.y,
      z: -center.z
    }
  }
}
