import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  extractBasisVectors,
  vectorsApproximatelyEqual,
  matrix3x3Determinant,
  angleBetweenVectors,
} from './math-utils'

describe('extractBasisVectors', () => {
  it('returns identity basis for identity quaternion', () => {
    const quaternion = new THREE.Quaternion()
    const { right, up, forward } = extractBasisVectors(quaternion)

    expect(right.x).toBeCloseTo(1, 5)
    expect(right.y).toBeCloseTo(0, 5)
    expect(right.z).toBeCloseTo(0, 5)

    expect(up.x).toBeCloseTo(0, 5)
    expect(up.y).toBeCloseTo(1, 5)
    expect(up.z).toBeCloseTo(0, 5)

    // Forward is -Z in cf-kernel convention
    expect(forward.x).toBeCloseTo(0, 5)
    expect(forward.y).toBeCloseTo(0, 5)
    expect(forward.z).toBeCloseTo(-1, 5)
  })

  it('returns correct basis for 90° rotation around Y', () => {
    // Rotate 90° around Y: forward goes from -Z to -X
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      Math.PI / 2
    )
    const { right, up, forward } = extractBasisVectors(quaternion)

    // Right goes from X to -Z
    expect(right.x).toBeCloseTo(0, 5)
    expect(right.z).toBeCloseTo(-1, 5)

    // Up stays Y
    expect(up.y).toBeCloseTo(1, 5)

    // Forward goes from -Z to -X
    expect(forward.x).toBeCloseTo(-1, 5)
    expect(forward.z).toBeCloseTo(0, 5)
  })

  it('returns correct basis for -90° rotation around X (Z-up to Y-up)', () => {
    // Rotate -90° around X: simulates fixing Blender Z-up export
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -Math.PI / 2
    )
    const { right, up, forward } = extractBasisVectors(quaternion)

    // Right stays X
    expect(right.x).toBeCloseTo(1, 5)

    // -90° around X rotates: Y -> -Z, Z -> Y
    // So up (initially Y) goes to -Z
    expect(up.z).toBeCloseTo(-1, 5)

    // Forward (initially -Z) goes to -Y
    expect(forward.y).toBeCloseTo(-1, 5)
  })
})

describe('vectorsApproximatelyEqual', () => {
  it('returns true for identical vectors', () => {
    const a = new THREE.Vector3(0, 1, 0)
    const b = new THREE.Vector3(0, 1, 0)
    expect(vectorsApproximatelyEqual(a, b)).toBe(true)
  })

  it('returns true for vectors within threshold', () => {
    const a = new THREE.Vector3(0, 1, 0)
    // Slightly off but within ~5° (cos(5°) ≈ 0.996)
    const b = new THREE.Vector3(0.05, 0.999, 0).normalize()
    expect(vectorsApproximatelyEqual(a, b, 0.996)).toBe(true)
  })

  it('returns false for vectors outside threshold', () => {
    const a = new THREE.Vector3(0, 1, 0)
    // More than 5° off
    const b = new THREE.Vector3(0.2, 1, 0).normalize()
    expect(vectorsApproximatelyEqual(a, b, 0.996)).toBe(false)
  })

  it('returns false for opposite vectors', () => {
    const a = new THREE.Vector3(0, 1, 0)
    const b = new THREE.Vector3(0, -1, 0)
    expect(vectorsApproximatelyEqual(a, b)).toBe(false)
  })

  it('normalizes vectors before comparison', () => {
    const a = new THREE.Vector3(0, 5, 0) // Non-unit length
    const b = new THREE.Vector3(0, 1, 0)
    expect(vectorsApproximatelyEqual(a, b)).toBe(true)
  })
})

describe('matrix3x3Determinant', () => {
  it('returns 1 for identity matrix', () => {
    const matrix = new THREE.Matrix4() // Identity
    expect(matrix3x3Determinant(matrix)).toBeCloseTo(1, 5)
  })

  it('returns 1 for pure rotation (right-handed)', () => {
    const matrix = new THREE.Matrix4().makeRotationY(Math.PI / 4)
    expect(matrix3x3Determinant(matrix)).toBeCloseTo(1, 5)
  })

  it('returns -1 for left-handed (mirrored) matrix', () => {
    const matrix = new THREE.Matrix4()
    matrix.scale(new THREE.Vector3(-1, 1, 1)) // Mirror X
    expect(matrix3x3Determinant(matrix)).toBeCloseTo(-1, 5)
  })

  it('returns scale factor cubed for uniform scale', () => {
    const scale = 2
    const matrix = new THREE.Matrix4()
    matrix.scale(new THREE.Vector3(scale, scale, scale))
    expect(matrix3x3Determinant(matrix)).toBeCloseTo(scale ** 3, 5)
  })
})

describe('angleBetweenVectors', () => {
  it('returns 0 for identical vectors', () => {
    const a = new THREE.Vector3(1, 0, 0)
    const b = new THREE.Vector3(1, 0, 0)
    expect(angleBetweenVectors(a, b)).toBeCloseTo(0, 5)
  })

  it('returns π/2 for perpendicular vectors', () => {
    const a = new THREE.Vector3(1, 0, 0)
    const b = new THREE.Vector3(0, 1, 0)
    expect(angleBetweenVectors(a, b)).toBeCloseTo(Math.PI / 2, 5)
  })

  it('returns π for opposite vectors', () => {
    const a = new THREE.Vector3(1, 0, 0)
    const b = new THREE.Vector3(-1, 0, 0)
    expect(angleBetweenVectors(a, b)).toBeCloseTo(Math.PI, 5)
  })

  it('handles non-unit vectors', () => {
    const a = new THREE.Vector3(3, 0, 0)
    const b = new THREE.Vector3(0, 5, 0)
    expect(angleBetweenVectors(a, b)).toBeCloseTo(Math.PI / 2, 5)
  })
})
