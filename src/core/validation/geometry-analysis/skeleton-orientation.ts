import * as THREE from 'three'
import type { StandardBones, OrientationResult } from './types'

/**
 * Calculate orientation from skeleton bone positions.
 *
 * Strategy:
 * 1. UP: Vector from hips to head (spine direction)
 * 2. RIGHT: Vector from left shoulder to right shoulder
 * 3. FORWARD: Cross product of up × right
 *    (In a right-handed system with up=+Y and right=+X, this naturally produces -Z forward)
 */
export function calculateSkeletonOrientation(
  bones: StandardBones
): OrientationResult | null {
  // Strategy 1: Full skeleton (hips, head, shoulders)
  if (bones.hips && bones.head &&
      (bones.leftShoulder || bones.leftUpperArm) &&
      (bones.rightShoulder || bones.rightUpperArm)) {
    return calculateFromFullSkeleton(bones)
  }

  // Strategy 2: Spine only (hips to head)
  if (bones.hips && bones.head) {
    return calculateFromSpineOnly(bones)
  }

  // Strategy 3: Any spine chain
  if (bones.hips && (bones.spine || bones.chest || bones.neck)) {
    return calculateFromPartialSpine(bones)
  }

  return null
}

function calculateFromFullSkeleton(bones: StandardBones): OrientationResult {
  const hipsPos = new THREE.Vector3()
  const headPos = new THREE.Vector3()
  const leftShoulderPos = new THREE.Vector3()
  const rightShoulderPos = new THREE.Vector3()

  // Update world matrices first
  bones.hips!.updateWorldMatrix(true, false)
  bones.head!.updateWorldMatrix(true, false)

  // Get world positions
  bones.hips!.getWorldPosition(hipsPos)
  bones.head!.getWorldPosition(headPos)

  const leftBone = bones.leftShoulder || bones.leftUpperArm
  const rightBone = bones.rightShoulder || bones.rightUpperArm

  leftBone!.updateWorldMatrix(true, false)
  rightBone!.updateWorldMatrix(true, false)

  leftBone!.getWorldPosition(leftShoulderPos)
  rightBone!.getWorldPosition(rightShoulderPos)

  // Calculate UP: hips to head
  const upVector = new THREE.Vector3()
    .subVectors(headPos, hipsPos)
    .normalize()

  // Calculate RIGHT: left shoulder to right shoulder
  const rightVector = new THREE.Vector3()
    .subVectors(rightShoulderPos, leftShoulderPos)
    .normalize()

  // Calculate FORWARD: up × right
  // In a right-handed coordinate system with up=+Y and right=+X,
  // the cross product up × right naturally produces -Z (forward direction)
  const forwardVector = new THREE.Vector3()
    .crossVectors(upVector, rightVector)
    .normalize()

  // Ensure orthonormal basis by recalculating right
  rightVector.crossVectors(forwardVector, upVector).normalize()

  return {
    upVector,
    forwardVector,
    rightVector,
    confidence: 'high',
    method: 'Full skeleton (hips, head, shoulders)',
  }
}

function calculateFromSpineOnly(bones: StandardBones): OrientationResult {
  const hipsPos = new THREE.Vector3()
  const headPos = new THREE.Vector3()

  bones.hips!.updateWorldMatrix(true, false)
  bones.head!.updateWorldMatrix(true, false)

  bones.hips!.getWorldPosition(hipsPos)
  bones.head!.getWorldPosition(headPos)

  // Calculate UP: hips to head
  const upVector = new THREE.Vector3()
    .subVectors(headPos, hipsPos)
    .normalize()

  // For forward, use the hips bone's local -Z as forward hint
  const hipsQuaternion = new THREE.Quaternion()
  bones.hips!.getWorldQuaternion(hipsQuaternion)

  const hipsForward = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(hipsQuaternion)

  // Project hipsForward onto plane perpendicular to up
  const forwardVector = new THREE.Vector3()
    .copy(hipsForward)
    .sub(upVector.clone().multiplyScalar(hipsForward.dot(upVector)))
    .normalize()

  // Calculate RIGHT: up × forward
  // This completes the orthonormal basis in the right-handed system
  const rightVector = new THREE.Vector3()
    .crossVectors(upVector, forwardVector)
    .normalize()

  return {
    upVector,
    forwardVector,
    rightVector,
    confidence: 'medium',
    method: 'Spine only (hips to head, forward from hips orientation)',
  }
}

function calculateFromPartialSpine(bones: StandardBones): OrientationResult {
  const hipsPos = new THREE.Vector3()
  bones.hips!.updateWorldMatrix(true, false)
  bones.hips!.getWorldPosition(hipsPos)

  // Find the highest bone we have
  const topBone = bones.neck || bones.chest || bones.spine
  const topPos = new THREE.Vector3()
  topBone!.updateWorldMatrix(true, false)
  topBone!.getWorldPosition(topPos)

  const upVector = new THREE.Vector3()
    .subVectors(topPos, hipsPos)
    .normalize()

  // Use hips bone forward as hint
  const hipsQuaternion = new THREE.Quaternion()
  bones.hips!.getWorldQuaternion(hipsQuaternion)

  const hipsForward = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(hipsQuaternion)

  const forwardVector = new THREE.Vector3()
    .copy(hipsForward)
    .sub(upVector.clone().multiplyScalar(hipsForward.dot(upVector)))
    .normalize()

  // Calculate RIGHT: up × forward
  // This completes the orthonormal basis in the right-handed system
  const rightVector = new THREE.Vector3()
    .crossVectors(upVector, forwardVector)
    .normalize()

  return {
    upVector,
    forwardVector,
    rightVector,
    confidence: 'low',
    method: 'Partial spine (limited bone data)',
  }
}
