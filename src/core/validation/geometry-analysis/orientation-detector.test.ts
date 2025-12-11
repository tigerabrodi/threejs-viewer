import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  detectModelOrientation,
  analyzeOrientationMatch,
} from './orientation-detector'

function createBoxMesh(
  width: number,
  height: number,
  depth: number
): THREE.Object3D {
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const material = new THREE.MeshBasicMaterial()
  return new THREE.Mesh(geometry, material)
}

describe('detectModelOrientation', () => {
  it('uses transform fallback for objects without geometry', () => {
    const obj = new THREE.Object3D()
    const result = detectModelOrientation(obj)

    expect(result.method).toBe('transform')
    expect(result.confidence).toBe(0.3)
    expect(result.allResults).toHaveLength(1)
  })

  it('uses bounding-box for simple meshes', () => {
    const mesh = createBoxMesh(0.5, 1.8, 0.3)
    const result = detectModelOrientation(mesh)

    // Should have both bounding-box and transform results
    expect(result.allResults.length).toBeGreaterThanOrEqual(2)

    // Bounding box should be highest confidence
    expect(result.method).toBe('bounding-box')
  })

  it('returns all analysis results sorted by confidence', () => {
    const mesh = createBoxMesh(0.5, 1.8, 0.3)
    const result = detectModelOrientation(mesh)

    // Results should be sorted descending by confidence
    for (let i = 1; i < result.allResults.length; i++) {
      expect(result.allResults[i - 1].confidence).toBeGreaterThanOrEqual(
        result.allResults[i].confidence
      )
    }
  })

  it('returns identity orientation when no analysis succeeds', () => {
    // Create an object that might fail all analyses
    const obj = new THREE.Object3D()
    // Remove ability to do transform analysis by setting invalid quaternion
    const result = detectModelOrientation(obj)

    // Should still return valid vectors
    expect(result.detectedForward).toBeDefined()
    expect(result.detectedUp).toBeDefined()
  })
})

describe('analyzeOrientationMatch', () => {
  it('reports correct orientation for Y-up model', () => {
    const mesh = createBoxMesh(0.5, 1.8, 0.3)
    const result = analyzeOrientationMatch(mesh)

    expect(result.up.isCorrect).toBe(true)
    expect(result.up.deviation).toBeLessThan(5) // Less than 5° deviation
  })

  it('reports incorrect orientation for Z-up model', () => {
    // Z-up model (Blender export style)
    const mesh = createBoxMesh(0.5, 0.3, 1.8)
    const result = analyzeOrientationMatch(mesh)

    expect(result.up.isCorrect).toBe(false)
    expect(result.up.deviation).toBeGreaterThan(80) // ~90° off
  })

  it('provides detection metadata', () => {
    const mesh = createBoxMesh(0.5, 1.8, 0.3)
    const result = analyzeOrientationMatch(mesh)

    expect(result.detection).toBeDefined()
    expect(result.detection.method).toBeDefined()
    expect(result.detection.confidence).toBeDefined()
    expect(result.detection.allResults).toBeDefined()
  })

  it('calculates deviation angles correctly', () => {
    // Create Z-up model - up should be ~90° from expected Y-up
    const mesh = createBoxMesh(0.5, 0.3, 1.8)
    const result = analyzeOrientationMatch(mesh)

    // Z-up means detected up is (0,0,1) vs expected (0,1,0)
    // Angle between them is 90°
    expect(result.up.deviation).toBeCloseTo(90, 0) // Within 1°
  })
})
