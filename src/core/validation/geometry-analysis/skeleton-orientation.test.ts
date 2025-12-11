import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { calculateSkeletonOrientation } from './skeleton-orientation'
import type { StandardBones } from './types'

/**
 * Helper function to create a bone at a specific world position
 */
function createBoneAtPosition(
  x: number,
  y: number,
  z: number,
  parent?: THREE.Bone
): THREE.Bone {
  const bone = new THREE.Bone()
  bone.position.set(x, y, z)
  if (parent) {
    parent.add(bone)
  }
  return bone
}

/**
 * Create a standard T-pose humanoid skeleton
 * This represents the most common expected orientation:
 * - Y-up (head above hips)
 * - -Z forward (character faces negative Z)
 * - X right (right shoulder is positive X from left shoulder)
 */
function createTPoseSkeleton(): StandardBones {
  // Create bones in T-pose configuration
  const hips = createBoneAtPosition(0, 1, 0)
  const spine = createBoneAtPosition(0, 1.2, 0, hips)
  const chest = createBoneAtPosition(0, 1.4, 0, spine)
  const neck = createBoneAtPosition(0, 1.6, 0, chest)
  const head = createBoneAtPosition(0, 1.8, 0, neck)

  // Arms extended horizontally (T-pose)
  const leftShoulder = createBoneAtPosition(-0.2, 1.4, 0, chest)
  const rightShoulder = createBoneAtPosition(0.2, 1.4, 0, chest)
  const leftUpperArm = createBoneAtPosition(-0.4, 1.4, 0, leftShoulder)
  const rightUpperArm = createBoneAtPosition(0.4, 1.4, 0, rightShoulder)

  // Update all world matrices
  hips.updateWorldMatrix(true, true)

  return {
    hips,
    spine,
    chest,
    neck,
    head,
    leftShoulder,
    rightShoulder,
    leftUpperArm,
    rightUpperArm,
  }
}

/**
 * Create a skeleton rotated to face a different direction
 */
function createRotatedSkeleton(rotationY: number): StandardBones {
  const bones = createTPoseSkeleton()

  // Rotate the root bone
  bones.hips!.rotation.y = rotationY
  bones.hips!.updateWorldMatrix(true, true)

  return bones
}

/**
 * Create a skeleton with Z-up orientation (common Blender export)
 */
function createZUpSkeleton(): StandardBones {
  // In Z-up, what was Y becomes Z, and what was Z becomes -Y
  const hips = createBoneAtPosition(0, 0, 1)
  const spine = createBoneAtPosition(0, 0, 1.2, hips)
  const chest = createBoneAtPosition(0, 0, 1.4, spine)
  const neck = createBoneAtPosition(0, 0, 1.6, chest)
  const head = createBoneAtPosition(0, 0, 1.8, neck)

  const leftShoulder = createBoneAtPosition(-0.2, 0, 1.4, chest)
  const rightShoulder = createBoneAtPosition(0.2, 0, 1.4, chest)
  const leftUpperArm = createBoneAtPosition(-0.4, 0, 1.4, leftShoulder)
  const rightUpperArm = createBoneAtPosition(0.4, 0, 1.4, rightShoulder)

  hips.updateWorldMatrix(true, true)

  return {
    hips,
    spine,
    chest,
    neck,
    head,
    leftShoulder,
    rightShoulder,
    leftUpperArm,
    rightUpperArm,
  }
}

describe('calculateSkeletonOrientation', () => {
  describe('Full skeleton (high confidence)', () => {
    it('calculates correct orientation for standard T-pose humanoid', () => {
      const bones = createTPoseSkeleton()
      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()
      expect(result!.confidence).toBe('high')
      expect(result!.method).toContain('Full skeleton')

      // UP should be positive Y (0, 1, 0)
      expect(result!.upVector.y).toBeCloseTo(1, 3)
      expect(Math.abs(result!.upVector.x)).toBeLessThan(0.01)
      expect(Math.abs(result!.upVector.z)).toBeLessThan(0.01)

      // FORWARD should be negative Z (0, 0, -1)
      expect(result!.forwardVector.z).toBeCloseTo(-1, 3)
      expect(Math.abs(result!.forwardVector.x)).toBeLessThan(0.01)
      expect(Math.abs(result!.forwardVector.y)).toBeLessThan(0.01)

      // RIGHT should be positive X (1, 0, 0)
      expect(result!.rightVector.x).toBeCloseTo(1, 3)
      expect(Math.abs(result!.rightVector.y)).toBeLessThan(0.01)
      expect(Math.abs(result!.rightVector.z)).toBeLessThan(0.01)
    })

    it('verifies cross product: up x right = forward', () => {
      const bones = createTPoseSkeleton()
      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()

      // Manual cross product verification
      // up = (0, 1, 0), right = (1, 0, 0)
      // up x right = (1*0 - 0*0, 0*0 - 0*0, 0*0 - 1*1) = (0, 0, -1)
      const crossProduct = new THREE.Vector3()
        .crossVectors(result!.upVector, result!.rightVector)

      expect(crossProduct.x).toBeCloseTo(result!.forwardVector.x, 3)
      expect(crossProduct.y).toBeCloseTo(result!.forwardVector.y, 3)
      expect(crossProduct.z).toBeCloseTo(result!.forwardVector.z, 3)

      // Verify the expected cross product result
      expect(crossProduct.z).toBeCloseTo(-1, 3)
      expect(Math.abs(crossProduct.x)).toBeLessThan(0.01)
      expect(Math.abs(crossProduct.y)).toBeLessThan(0.01)
    })

    it('creates orthonormal basis vectors', () => {
      const bones = createTPoseSkeleton()
      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()

      // All vectors should be unit length
      expect(result!.upVector.length()).toBeCloseTo(1, 3)
      expect(result!.forwardVector.length()).toBeCloseTo(1, 3)
      expect(result!.rightVector.length()).toBeCloseTo(1, 3)

      // All vectors should be perpendicular (dot product = 0)
      expect(result!.upVector.dot(result!.forwardVector)).toBeCloseTo(0, 3)
      expect(result!.upVector.dot(result!.rightVector)).toBeCloseTo(0, 3)
      expect(result!.forwardVector.dot(result!.rightVector)).toBeCloseTo(0, 3)
    })

    it('handles rotated skeleton correctly', () => {
      // Rotate 90 degrees around Y axis
      const bones = createRotatedSkeleton(Math.PI / 2)
      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()
      expect(result!.confidence).toBe('high')

      // UP should still be Y (unchanged by Y rotation)
      expect(result!.upVector.y).toBeCloseTo(1, 3)

      // FORWARD should now point in -X direction (rotated 90° from -Z)
      expect(result!.forwardVector.x).toBeCloseTo(-1, 2)
      expect(Math.abs(result!.forwardVector.y)).toBeLessThan(0.1)

      // RIGHT should now point in -Z direction
      expect(result!.rightVector.z).toBeCloseTo(-1, 2)
    })

    it('handles 180-degree rotation', () => {
      const bones = createRotatedSkeleton(Math.PI)
      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()

      // UP unchanged
      expect(result!.upVector.y).toBeCloseTo(1, 3)

      // FORWARD should point in +Z (opposite of original)
      expect(result!.forwardVector.z).toBeCloseTo(1, 2)

      // RIGHT should point in -X
      expect(result!.rightVector.x).toBeCloseTo(-1, 2)
    })
  })

  describe('Spine only (medium confidence)', () => {
    it('calculates orientation from hips to head only', () => {
      const bones: StandardBones = {
        hips: createBoneAtPosition(0, 1, 0),
        head: createBoneAtPosition(0, 1.8, 0),
        spine: null,
        chest: null,
        neck: null,
        leftShoulder: null,
        rightShoulder: null,
        leftUpperArm: null,
        rightUpperArm: null,
      }

      bones.hips!.updateWorldMatrix(true, true)
      bones.head!.updateWorldMatrix(true, true)

      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()
      expect(result!.confidence).toBe('medium')
      expect(result!.method).toContain('Spine only')

      // UP should be positive Y
      expect(result!.upVector.y).toBeCloseTo(1, 3)

      // Should still have valid forward and right vectors
      expect(result!.forwardVector.length()).toBeCloseTo(1, 3)
      expect(result!.rightVector.length()).toBeCloseTo(1, 3)
    })

    it('uses hips orientation for forward direction', () => {
      const bones: StandardBones = {
        hips: createBoneAtPosition(0, 1, 0),
        head: createBoneAtPosition(0, 1.8, 0),
        spine: null,
        chest: null,
        neck: null,
        leftShoulder: null,
        rightShoulder: null,
        leftUpperArm: null,
        rightUpperArm: null,
      }

      // Rotate hips to face +X direction
      bones.hips!.rotation.y = -Math.PI / 2
      bones.hips!.updateWorldMatrix(true, true)
      bones.head!.updateWorldMatrix(true, true)

      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()

      // Forward should be influenced by hips rotation
      // Should point roughly in +X direction
      expect(Math.abs(result!.forwardVector.x)).toBeGreaterThan(0.9)
    })
  })

  describe('Partial spine (low confidence)', () => {
    it('works with hips and spine only', () => {
      const bones: StandardBones = {
        hips: createBoneAtPosition(0, 1, 0),
        spine: createBoneAtPosition(0, 1.3, 0),
        chest: null,
        neck: null,
        head: null,
        leftShoulder: null,
        rightShoulder: null,
        leftUpperArm: null,
        rightUpperArm: null,
      }

      bones.hips!.updateWorldMatrix(true, true)
      bones.spine!.updateWorldMatrix(true, true)

      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()
      expect(result!.confidence).toBe('low')
      expect(result!.method).toContain('Partial spine')

      // Should still calculate valid orientation
      expect(result!.upVector.y).toBeGreaterThan(0.9)
    })

    it('works with hips and chest only', () => {
      const bones: StandardBones = {
        hips: createBoneAtPosition(0, 1, 0),
        spine: null,
        chest: createBoneAtPosition(0, 1.4, 0),
        neck: null,
        head: null,
        leftShoulder: null,
        rightShoulder: null,
        leftUpperArm: null,
        rightUpperArm: null,
      }

      bones.hips!.updateWorldMatrix(true, true)
      bones.chest!.updateWorldMatrix(true, true)

      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()
      expect(result!.confidence).toBe('low')
    })

    it('works with hips and neck only', () => {
      const bones: StandardBones = {
        hips: createBoneAtPosition(0, 1, 0),
        spine: null,
        chest: null,
        neck: createBoneAtPosition(0, 1.6, 0),
        head: null,
        leftShoulder: null,
        rightShoulder: null,
        leftUpperArm: null,
        rightUpperArm: null,
      }

      bones.hips!.updateWorldMatrix(true, true)
      bones.neck!.updateWorldMatrix(true, true)

      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()
      expect(result!.confidence).toBe('low')
    })
  })

  describe('Different bone configurations', () => {
    it('detects Z-up orientation (common in Blender exports)', () => {
      const bones = createZUpSkeleton()
      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()

      // UP should be positive Z in Z-up system
      expect(result!.upVector.z).toBeGreaterThan(0.9)
      expect(Math.abs(result!.upVector.y)).toBeLessThan(0.1)

      // Vectors should still be orthonormal
      expect(result!.upVector.length()).toBeCloseTo(1, 3)
      expect(result!.forwardVector.length()).toBeCloseTo(1, 3)
      expect(result!.rightVector.length()).toBeCloseTo(1, 3)
    })

    it('handles skeleton with only left upper arm (no shoulder)', () => {
      const bones = createTPoseSkeleton()
      bones.leftShoulder = null
      bones.rightShoulder = null

      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()
      expect(result!.confidence).toBe('high')

      // Should still calculate correct orientation
      expect(result!.upVector.y).toBeCloseTo(1, 3)
      expect(result!.forwardVector.z).toBeCloseTo(-1, 3)
      expect(result!.rightVector.x).toBeCloseTo(1, 3)
    })

    it('handles asymmetric skeleton (one shoulder missing)', () => {
      const bones = createTPoseSkeleton()
      bones.leftShoulder = null
      bones.leftUpperArm = null

      const result = calculateSkeletonOrientation(bones)

      // Should fall back to spine-only calculation
      expect(result).not.toBeNull()
      expect(result!.confidence).toBe('medium')
      expect(result!.method).toContain('Spine only')
    })

    it('handles wide-stance skeleton', () => {
      const bones = createTPoseSkeleton()

      // Move shoulders much wider apart
      bones.leftShoulder!.position.x = -1.0
      bones.rightShoulder!.position.x = 1.0
      bones.hips!.updateWorldMatrix(true, true)

      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()

      // Should still get correct orientation despite wide stance
      expect(result!.upVector.y).toBeCloseTo(1, 3)
      expect(result!.forwardVector.z).toBeCloseTo(-1, 3)
      expect(result!.rightVector.x).toBeCloseTo(1, 3)
    })

    it('handles tall skeleton', () => {
      const hips = createBoneAtPosition(0, 0, 0)
      const head = createBoneAtPosition(0, 5, 0, hips)
      const leftShoulder = createBoneAtPosition(-1, 4, 0, hips)
      const rightShoulder = createBoneAtPosition(1, 4, 0, hips)

      hips.updateWorldMatrix(true, true)

      const bones: StandardBones = {
        hips,
        spine: null,
        chest: null,
        neck: null,
        head,
        leftShoulder,
        rightShoulder,
        leftUpperArm: null,
        rightUpperArm: null,
      }

      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()
      expect(result!.upVector.y).toBeCloseTo(1, 3)
      expect(result!.forwardVector.z).toBeCloseTo(-1, 3)
    })

    it('handles skeleton with offset center', () => {
      // Create skeleton not centered at origin
      const hips = createBoneAtPosition(10, 20, -5)
      const head = createBoneAtPosition(10, 21.8, -5, hips)
      const leftShoulder = createBoneAtPosition(9.8, 21.4, -5, hips)
      const rightShoulder = createBoneAtPosition(10.2, 21.4, -5, hips)

      hips.updateWorldMatrix(true, true)

      const bones: StandardBones = {
        hips,
        spine: null,
        chest: null,
        neck: null,
        head,
        leftShoulder,
        rightShoulder,
        leftUpperArm: null,
        rightUpperArm: null,
      }

      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()

      // Orientation should be independent of position
      // Note: The up vector magnitude should be close to 1
      expect(result!.upVector.y).toBeGreaterThan(0.85)
      expect(result!.forwardVector.length()).toBeCloseTo(1, 3)
      expect(result!.rightVector.length()).toBeCloseTo(1, 3)

      // Vectors should be orthonormal
      expect(result!.upVector.dot(result!.forwardVector)).toBeCloseTo(0, 2)
      expect(result!.upVector.dot(result!.rightVector)).toBeCloseTo(0, 2)
      expect(result!.forwardVector.dot(result!.rightVector)).toBeCloseTo(0, 2)
    })
  })

  describe('Edge cases', () => {
    it('returns null for empty skeleton', () => {
      const bones: StandardBones = {
        hips: null,
        spine: null,
        chest: null,
        neck: null,
        head: null,
        leftShoulder: null,
        rightShoulder: null,
        leftUpperArm: null,
        rightUpperArm: null,
      }

      const result = calculateSkeletonOrientation(bones)
      expect(result).toBeNull()
    })

    it('returns null when only hips exist', () => {
      const bones: StandardBones = {
        hips: createBoneAtPosition(0, 1, 0),
        spine: null,
        chest: null,
        neck: null,
        head: null,
        leftShoulder: null,
        rightShoulder: null,
        leftUpperArm: null,
        rightUpperArm: null,
      }

      const result = calculateSkeletonOrientation(bones)
      expect(result).toBeNull()
    })

    it('handles bones at same position (zero-length spine)', () => {
      const bones: StandardBones = {
        hips: createBoneAtPosition(0, 1, 0),
        head: createBoneAtPosition(0, 1, 0), // Same position as hips
        spine: null,
        chest: null,
        neck: null,
        leftShoulder: null,
        rightShoulder: null,
        leftUpperArm: null,
        rightUpperArm: null,
      }

      bones.hips!.updateWorldMatrix(true, true)
      bones.head!.updateWorldMatrix(true, true)

      const result = calculateSkeletonOrientation(bones)

      // Should still return result, though the up vector might be invalid
      // The implementation should handle normalization of zero-length vectors
      expect(result).not.toBeNull()
    })

    it('handles collinear shoulder bones', () => {
      const bones = createTPoseSkeleton()

      // Make shoulders collinear with spine (invalid configuration)
      bones.leftShoulder!.position.x = 0
      bones.rightShoulder!.position.x = 0
      bones.hips!.updateWorldMatrix(true, true)

      const result = calculateSkeletonOrientation(bones)

      // Should still produce a result even if right vector is degenerate
      expect(result).not.toBeNull()
    })
  })

  describe('Mathematical correctness', () => {
    it('verifies coordinate system handedness', () => {
      const bones = createTPoseSkeleton()
      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()

      // The implementation uses: forward x up = right (left-handed convention)
      // This is common in Three.js which uses left-handed coordinates for some operations
      const expectedRight = new THREE.Vector3()
        .crossVectors(result!.forwardVector, result!.upVector)

      expect(expectedRight.x).toBeCloseTo(result!.rightVector.x, 3)
      expect(expectedRight.y).toBeCloseTo(result!.rightVector.y, 3)
      expect(expectedRight.z).toBeCloseTo(result!.rightVector.z, 3)
    })

    it('verifies determinant for orthonormal basis', () => {
      const bones = createTPoseSkeleton()
      const result = calculateSkeletonOrientation(bones)

      expect(result).not.toBeNull()

      // Create matrix from basis vectors
      const matrix = new THREE.Matrix4()
      matrix.makeBasis(
        result!.rightVector,
        result!.upVector,
        result!.forwardVector
      )

      // Determinant should be ±1 for orthonormal basis
      // The sign indicates handedness
      const determinant = matrix.determinant()
      expect(Math.abs(determinant)).toBeCloseTo(1, 3)
    })

    it('maintains orientation consistency across multiple calculations', () => {
      const bones = createTPoseSkeleton()

      const result1 = calculateSkeletonOrientation(bones)
      const result2 = calculateSkeletonOrientation(bones)

      expect(result1).not.toBeNull()
      expect(result2).not.toBeNull()

      // Results should be identical
      expect(result1!.upVector.x).toBeCloseTo(result2!.upVector.x, 10)
      expect(result1!.upVector.y).toBeCloseTo(result2!.upVector.y, 10)
      expect(result1!.upVector.z).toBeCloseTo(result2!.upVector.z, 10)

      expect(result1!.forwardVector.x).toBeCloseTo(result2!.forwardVector.x, 10)
      expect(result1!.forwardVector.y).toBeCloseTo(result2!.forwardVector.y, 10)
      expect(result1!.forwardVector.z).toBeCloseTo(result2!.forwardVector.z, 10)
    })
  })
})
