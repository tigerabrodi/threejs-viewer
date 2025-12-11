import * as THREE from 'three'
import type { ValidationCheckResult } from '../../types/validation'
import { extractBasisVectors, vectorsApproximatelyEqual } from '../math-utils'

const EXPECTED_UP = new THREE.Vector3(0, 1, 0)
const Z_UP = new THREE.Vector3(0, 0, 1)

/**
 * Check if the model's up direction matches cf-kernel convention (+Y).
 */
export function checkUpDirection(object: THREE.Object3D): ValidationCheckResult {
  const quaternion = object.quaternion.clone()
  const { up } = extractBasisVectors(quaternion)

  const isCorrect = vectorsApproximatelyEqual(up, EXPECTED_UP, 0.996)

  if (isCorrect) {
    return {
      checkId: 'up-direction',
      name: 'Up Direction',
      passed: true,
      severity: 'info',
      message: 'Model up is +Y (correct)',
      measuredValue: { x: up.x.toFixed(3), y: up.y.toFixed(3), z: up.z.toFixed(3) },
      expectedValue: { x: 0, y: 1, z: 0 }
    }
  }

  const isZUp = vectorsApproximatelyEqual(up, Z_UP, 0.996)

  if (isZUp) {
    return {
      checkId: 'up-direction',
      name: 'Up Direction',
      passed: false,
      severity: 'error',
      message: 'Model is Z-up (Blender). Rotate -90° around X.',
      measuredValue: { x: up.x.toFixed(3), y: up.y.toFixed(3), z: up.z.toFixed(3) },
      expectedValue: { x: 0, y: 1, z: 0 },
      correctiveTransform: {
        type: 'rotate',
        axis: 'x',
        angleDegrees: -90
      }
    }
  }

  return {
    checkId: 'up-direction',
    name: 'Up Direction',
    passed: false,
    severity: 'error',
    message: `Up is (${up.x.toFixed(2)}, ${up.y.toFixed(2)}, ${up.z.toFixed(2)})`,
    measuredValue: { x: up.x.toFixed(3), y: up.y.toFixed(3), z: up.z.toFixed(3) },
    expectedValue: { x: 0, y: 1, z: 0 }
  }
}
