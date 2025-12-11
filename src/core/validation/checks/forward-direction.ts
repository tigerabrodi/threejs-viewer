import * as THREE from 'three'
import type { ValidationCheckResult } from '../../types/validation'
import { extractBasisVectors, vectorsApproximatelyEqual } from '../math-utils'

const EXPECTED_FORWARD = new THREE.Vector3(0, 0, -1)
const OPPOSITE_FORWARD = new THREE.Vector3(0, 0, 1)

/**
 * Check if the model's forward direction matches cf-kernel convention (-Z).
 */
export function checkForwardDirection(object: THREE.Object3D): ValidationCheckResult {
  const quaternion = object.quaternion.clone()
  const { forward } = extractBasisVectors(quaternion)

  const isCorrect = vectorsApproximatelyEqual(forward, EXPECTED_FORWARD, 0.996)

  if (isCorrect) {
    return {
      checkId: 'forward-direction',
      name: 'Forward Direction',
      passed: true,
      severity: 'info',
      message: 'Model is facing -Z (correct)',
      measuredValue: { x: forward.x.toFixed(3), y: forward.y.toFixed(3), z: forward.z.toFixed(3) },
      expectedValue: { x: 0, y: 0, z: -1 }
    }
  }

  const isFacingOpposite = vectorsApproximatelyEqual(forward, OPPOSITE_FORWARD, 0.996)

  if (isFacingOpposite) {
    return {
      checkId: 'forward-direction',
      name: 'Forward Direction',
      passed: false,
      severity: 'error',
      message: 'Model faces +Z. Rotate 180° around Y.',
      measuredValue: { x: forward.x.toFixed(3), y: forward.y.toFixed(3), z: forward.z.toFixed(3) },
      expectedValue: { x: 0, y: 0, z: -1 },
      correctiveTransform: {
        type: 'rotate',
        axis: 'y',
        angleDegrees: 180
      }
    }
  }

  return {
    checkId: 'forward-direction',
    name: 'Forward Direction',
    passed: false,
    severity: 'error',
    message: `Forward is (${forward.x.toFixed(2)}, ${forward.y.toFixed(2)}, ${forward.z.toFixed(2)})`,
    measuredValue: { x: forward.x.toFixed(3), y: forward.y.toFixed(3), z: forward.z.toFixed(3) },
    expectedValue: { x: 0, y: 0, z: -1 }
  }
}
