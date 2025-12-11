import * as THREE from 'three'

/**
 * Extract basis vectors (right, up, forward) from a quaternion.
 * In cf-kernel convention: X+ = right, Y+ = up, -Z = forward
 */
export function extractBasisVectors(quaternion: THREE.Quaternion): {
  right: THREE.Vector3
  up: THREE.Vector3
  forward: THREE.Vector3
} {
  const matrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion)

  const right = new THREE.Vector3(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[2]
  )

  const up = new THREE.Vector3(
    matrix.elements[4],
    matrix.elements[5],
    matrix.elements[6]
  )

  // Forward is -Z in cf-kernel convention
  const forward = new THREE.Vector3(
    -matrix.elements[8],
    -matrix.elements[9],
    -matrix.elements[10]
  )

  return { right, up, forward }
}

/**
 * Compare two vectors using dot product similarity.
 * Returns true if vectors are approximately equal within threshold.
 */
export function vectorsApproximatelyEqual(
  a: THREE.Vector3,
  b: THREE.Vector3,
  threshold = 0.996
): boolean {
  const aNorm = a.clone().normalize()
  const bNorm = b.clone().normalize()
  const dotProduct = aNorm.dot(bNorm)
  return dotProduct >= threshold
}

/**
 * Calculate the determinant of a 3x3 matrix.
 * Used for handedness check: det > 0 = right-handed, det < 0 = left-handed
 */
export function matrix3x3Determinant(matrix: THREE.Matrix4): number {
  const e = matrix.elements

  const m11 = e[0], m12 = e[4], m13 = e[8]
  const m21 = e[1], m22 = e[5], m23 = e[9]
  const m31 = e[2], m32 = e[6], m33 = e[10]

  const det =
    m11 * (m22 * m33 - m23 * m32) -
    m12 * (m21 * m33 - m23 * m31) +
    m13 * (m21 * m32 - m22 * m31)

  return det
}

/**
 * Calculate the angle between two vectors in radians.
 */
export function angleBetweenVectors(
  a: THREE.Vector3,
  b: THREE.Vector3
): number {
  const aNorm = a.clone().normalize()
  const bNorm = b.clone().normalize()
  const dotProduct = Math.max(-1, Math.min(1, aNorm.dot(bNorm)))
  return Math.acos(dotProduct)
}
