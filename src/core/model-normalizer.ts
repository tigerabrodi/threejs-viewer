import * as THREE from 'three'

export const NORMALIZATION_CONFIG = {
  TARGET_SIZE: 2, // Target max dimension in units (good for humanoids ~2m)
  MIN_CAMERA_DISTANCE: 0.5,
  MAX_CAMERA_DISTANCE: 20,
  DEFAULT_CAMERA_DISTANCE: 5,
}

export interface NormalizationResult {
  scaleFactor: number
  centerOffset: THREE.Vector3
  originalDimensions: {
    width: number
    height: number
    depth: number
    maxDimension: number
  }
  originalBoundingBox: {
    min: THREE.Vector3
    max: THREE.Vector3
  }
  originalCenter: THREE.Vector3
}

/**
 * Calculate normalization parameters for a model.
 * Returns scale factor and center offset to normalize the model to a target size.
 *
 * The original model is NOT modified - these values are meant to be applied
 * via a wrapper group for display purposes only.
 */
export function calculateNormalization(
  object: THREE.Object3D,
  targetMaxDimension: number = NORMALIZATION_CONFIG.TARGET_SIZE
): NormalizationResult {
  const box = new THREE.Box3().setFromObject(object)

  // Handle empty or invalid bounding box
  if (box.isEmpty()) {
    return {
      scaleFactor: 1,
      centerOffset: new THREE.Vector3(),
      originalDimensions: {
        width: 0,
        height: 0,
        depth: 0,
        maxDimension: 0,
      },
      originalBoundingBox: {
        min: new THREE.Vector3(),
        max: new THREE.Vector3(),
      },
      originalCenter: new THREE.Vector3(),
    }
  }

  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDimension = Math.max(size.x, size.y, size.z)

  // Calculate scale factor to fit within target size
  // Only scale down if larger than target, don't scale up tiny models
  const scaleFactor = maxDimension > targetMaxDimension
    ? targetMaxDimension / maxDimension
    : 1

  // Center offset moves model to origin (in original scale, before scaling)
  const centerOffset = center.clone().negate()

  return {
    scaleFactor,
    centerOffset,
    originalDimensions: {
      width: size.x,
      height: size.y,
      depth: size.z,
      maxDimension,
    },
    originalBoundingBox: {
      min: box.min.clone(),
      max: box.max.clone(),
    },
    originalCenter: center,
  }
}

/**
 * Format the display scale as a human-readable ratio.
 * e.g., scaleFactor of 0.01 returns "1:100"
 */
export function formatDisplayScale(scaleFactor: number): string {
  if (scaleFactor >= 0.99 && scaleFactor <= 1.01) {
    return '1:1 (Actual Size)'
  }

  if (scaleFactor < 1) {
    const ratio = Math.round(1 / scaleFactor)
    return `1:${ratio}`
  }

  const ratio = Math.round(scaleFactor)
  return `${ratio}:1`
}

/**
 * Determine if a model needs normalization based on its size.
 */
export function needsNormalization(
  maxDimension: number,
  targetSize: number = NORMALIZATION_CONFIG.TARGET_SIZE
): boolean {
  return maxDimension > targetSize * 1.5 // 50% tolerance
}
