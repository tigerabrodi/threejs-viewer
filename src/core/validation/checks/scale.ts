import * as THREE from 'three'
import type { ValidationCheckResult } from '../../types/validation'

const SCALE_TOLERANCE = 0.01

/**
 * Check if the model has uniform and normalized scale.
 */
export function checkScale(object: THREE.Object3D): ValidationCheckResult {
  const scale = object.scale.clone()

  const maxScale = Math.max(scale.x, scale.y, scale.z)
  const minScale = Math.min(scale.x, scale.y, scale.z)
  const isUniform = (maxScale - minScale) < SCALE_TOLERANCE

  const isNormalized =
    Math.abs(scale.x - 1) < SCALE_TOLERANCE &&
    Math.abs(scale.y - 1) < SCALE_TOLERANCE &&
    Math.abs(scale.z - 1) < SCALE_TOLERANCE

  if (isUniform && isNormalized) {
    return {
      checkId: 'scale',
      name: 'Scale',
      passed: true,
      severity: 'info',
      message: 'Uniform scale (1, 1, 1)',
      measuredValue: { x: scale.x.toFixed(3), y: scale.y.toFixed(3), z: scale.z.toFixed(3) },
      expectedValue: { x: 1, y: 1, z: 1 }
    }
  }

  const issues: string[] = []
  if (!isUniform) issues.push('non-uniform')
  if (!isNormalized) issues.push('not normalized')

  return {
    checkId: 'scale',
    name: 'Scale',
    passed: false,
    severity: 'warning',
    message: `Scale (${scale.x.toFixed(2)}, ${scale.y.toFixed(2)}, ${scale.z.toFixed(2)}) - ${issues.join(', ')}`,
    measuredValue: { x: scale.x.toFixed(3), y: scale.y.toFixed(3), z: scale.z.toFixed(3) },
    expectedValue: { x: 1, y: 1, z: 1 },
    correctiveTransform: {
      type: 'scale',
      x: 1 / scale.x,
      y: 1 / scale.y,
      z: 1 / scale.z
    }
  }
}
