import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { analyzeBoundingBox } from './bounding-box-analysis'

function createBoxMesh(
  width: number,
  height: number,
  depth: number
): THREE.Object3D {
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const material = new THREE.MeshBasicMaterial()
  return new THREE.Mesh(geometry, material)
}

describe('analyzeBoundingBox', () => {
  it('returns null for empty object', () => {
    const obj = new THREE.Object3D()
    expect(analyzeBoundingBox(obj)).toBeNull()
  })

  it('detects Y-up for tall vertical model (correct orientation)', () => {
    // Humanoid proportions: tall Y, moderate X/Z
    const mesh = createBoxMesh(0.5, 1.8, 0.3)
    const result = analyzeBoundingBox(mesh)

    expect(result).not.toBeNull()
    expect(result!.method).toBe('bounding-box')
    expect(result!.metadata?.tallestAxis).toBe('Y')
    expect(result!.metadata?.issue).toBe('none')

    // Should detect correct orientation
    expect(result!.detectedUp.y).toBeCloseTo(1, 3)
    expect(result!.detectedForward.z).toBeCloseTo(-1, 3)
  })

  it('detects Z-up for Blender-style export', () => {
    // Z is tallest: typical Blender Z-up export
    const mesh = createBoxMesh(0.5, 0.3, 1.8)
    const result = analyzeBoundingBox(mesh)

    expect(result).not.toBeNull()
    expect(result!.metadata?.tallestAxis).toBe('Z')
    expect(result!.metadata?.issue).toBe('z-up')
    expect(result!.metadata?.suggestedFix).toContain('X axis')

    // Detected up should be Z
    expect(result!.detectedUp.z).toBeCloseTo(1, 3)
    // Forward should be -Y in Z-up
    expect(result!.detectedForward.y).toBeCloseTo(-1, 3)
  })

  it('detects sideways model (X-up)', () => {
    // X is tallest: model lying sideways
    const mesh = createBoxMesh(1.8, 0.3, 0.5)
    const result = analyzeBoundingBox(mesh)

    expect(result).not.toBeNull()
    expect(result!.metadata?.tallestAxis).toBe('X')
    expect(result!.metadata?.issue).toBe('sideways')

    // Detected up should be X
    expect(result!.detectedUp.x).toBeCloseTo(1, 3)
  })

  it('has lower confidence for nearly cubic models', () => {
    // Nearly cubic: hard to determine orientation
    const tallModel = createBoxMesh(0.5, 1.8, 0.3)
    const cubicModel = createBoxMesh(1, 1.1, 0.9)

    const tallResult = analyzeBoundingBox(tallModel)
    const cubicResult = analyzeBoundingBox(cubicModel)

    expect(tallResult).not.toBeNull()
    expect(cubicResult).not.toBeNull()

    // Tall model should have higher confidence
    expect(tallResult!.confidence).toBeGreaterThan(cubicResult!.confidence)
  })

  it('works with nested objects', () => {
    const parent = new THREE.Object3D()
    const child = createBoxMesh(0.5, 1.8, 0.3)
    parent.add(child)

    const result = analyzeBoundingBox(parent)

    expect(result).not.toBeNull()
    expect(result!.metadata?.tallestAxis).toBe('Y')
  })
})
