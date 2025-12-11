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

  it('detects sideways model (X-up) when Y is very small', () => {
    // X is tallest: model lying sideways with very small Y
    const mesh = createBoxMesh(1.8, 0.3, 0.5)
    const result = analyzeBoundingBox(mesh)

    expect(result).not.toBeNull()
    expect(result!.metadata?.tallestAxis).toBe('X')
    expect(result!.metadata?.issue).toBe('possibly-sideways')

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

  describe('wide props should NOT be flagged as sideways', () => {
    it('wide table (X=2.0, Y=0.8, Z=1.0) should NOT be flagged as sideways', () => {
      // A table is wider than tall but correctly oriented
      // Y/X ratio = 0.8/2.0 = 0.4 (> 0.3 threshold)
      const mesh = createBoxMesh(2.0, 0.8, 1.0)
      const result = analyzeBoundingBox(mesh)

      expect(result).not.toBeNull()
      expect(result!.metadata?.tallestAxis).toBe('X')
      // Should NOT be flagged as sideways - Y is still reasonable
      expect(result!.metadata?.issue).toBe('none')
      expect(result!.metadata?.note).toContain('Wide prop')

      // Should recognize Y-up orientation (not X-up)
      expect(result!.detectedUp.y).toBeCloseTo(1, 3)
      expect(result!.detectedForward.z).toBeCloseTo(-1, 3)

      // Should have lower confidence for wide props
      expect(result!.confidence).toBeLessThanOrEqual(0.3)
    })

    it('fireplace (X=1.9, Y=0.8, Z=0.3) should NOT be flagged as sideways', () => {
      // A fireplace is wide but correctly oriented
      // Y/X ratio = 0.8/1.9 = 0.42 (> 0.3 threshold)
      const mesh = createBoxMesh(1.9, 0.8, 0.3)
      const result = analyzeBoundingBox(mesh)

      expect(result).not.toBeNull()
      expect(result!.metadata?.tallestAxis).toBe('X')
      // Should NOT be flagged as sideways
      expect(result!.metadata?.issue).toBe('none')

      // Should recognize Y-up orientation
      expect(result!.detectedUp.y).toBeCloseTo(1, 3)
    })

    it('wide bookshelf (X=2.5, Y=1.8, Z=0.4) should pass without sideways flag', () => {
      // A bookshelf that's wider than it is tall
      // Y/X ratio = 1.8/2.5 = 0.72 (> 0.3 threshold)
      const mesh = createBoxMesh(2.5, 1.8, 0.4)
      const result = analyzeBoundingBox(mesh)

      expect(result).not.toBeNull()
      expect(result!.metadata?.tallestAxis).toBe('X')
      // Should NOT be flagged as sideways - Y is still the height axis
      expect(result!.metadata?.issue).toBe('none')

      // Should recognize correct Y-up orientation
      expect(result!.detectedUp.y).toBeCloseTo(1, 3)
      expect(result!.detectedForward.z).toBeCloseTo(-1, 3)
    })
  })

  describe('actual sideways models should still be caught', () => {
    it('humanoid lying down (X=1.8, Y=0.3, Z=0.5) SHOULD be flagged as sideways', () => {
      // A humanoid lying on its side - truly sideways orientation
      // Y/X ratio = 0.3/1.8 = 0.167 (< 0.3 threshold)
      const mesh = createBoxMesh(1.8, 0.3, 0.5)
      const result = analyzeBoundingBox(mesh)

      expect(result).not.toBeNull()
      // SHOULD be flagged as sideways - Y is way too small to be vertical
      expect(result!.metadata?.tallestAxis).toBe('X')
      expect(result!.metadata?.issue).toBe('possibly-sideways')

      // Should detect X-up orientation (wrong)
      expect(result!.detectedUp.x).toBeCloseTo(1, 3)
      expect(result!.metadata?.suggestedFix).toContain('sideways')

      // Should have very low confidence
      expect(result!.confidence).toBeLessThanOrEqual(0.25)
    })

    it('sideways character (X=1.9, Y=0.4, Z=0.5) SHOULD be flagged', () => {
      // Another truly sideways model
      // Y/X ratio = 0.4/1.9 = 0.21 (< 0.3 threshold)
      const mesh = createBoxMesh(1.9, 0.4, 0.5)
      const result = analyzeBoundingBox(mesh)

      expect(result).not.toBeNull()
      expect(result!.metadata?.tallestAxis).toBe('X')
      expect(result!.metadata?.issue).toBe('possibly-sideways')
      expect(result!.detectedUp.x).toBeCloseTo(1, 3)
    })

    it('very flat lying model (X=2.0, Y=0.2, Z=0.5) definitely sideways', () => {
      // Extremely flat in Y - definitely lying down
      // Y/X ratio = 0.2/2.0 = 0.1 (< 0.3 threshold)
      const mesh = createBoxMesh(2.0, 0.2, 0.5)
      const result = analyzeBoundingBox(mesh)

      expect(result).not.toBeNull()
      expect(result!.metadata?.tallestAxis).toBe('X')
      expect(result!.metadata?.issue).toBe('possibly-sideways')
      expect(result!.detectedUp.x).toBeCloseTo(1, 3)
    })
  })
})
