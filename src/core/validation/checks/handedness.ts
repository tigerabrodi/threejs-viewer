import * as THREE from 'three'
import type { ValidationCheckResult } from '../../types/validation'
import { matrix3x3Determinant } from '../math-utils'

/**
 * Check if the model uses right-handed coordinate system.
 */
export function checkHandedness(object: THREE.Object3D): ValidationCheckResult {
  const matrix = new THREE.Matrix4()
  matrix.compose(
    new THREE.Vector3(0, 0, 0),
    object.quaternion.clone(),
    object.scale.clone()
  )

  const det = matrix3x3Determinant(matrix)
  const isRightHanded = det > 0

  if (isRightHanded) {
    return {
      checkId: 'handedness',
      name: 'Handedness',
      passed: true,
      severity: 'info',
      message: 'Right-handed coordinate system (correct)',
      measuredValue: { determinant: det.toFixed(3), handedness: 'right' },
      expectedValue: { determinant: '> 0', handedness: 'right' }
    }
  }

  return {
    checkId: 'handedness',
    name: 'Handedness',
    passed: false,
    severity: 'error',
    message: 'Left-handed system. Scale X by -1.',
    measuredValue: { determinant: det.toFixed(3), handedness: 'left' },
    expectedValue: { determinant: '> 0', handedness: 'right' },
    correctiveTransform: {
      type: 'scale',
      x: -1,
      y: 1,
      z: 1
    }
  }
}
