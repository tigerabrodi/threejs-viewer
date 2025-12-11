import * as THREE from 'three'
import type { GeometryAnalysisResult } from './types'

/**
 * Analyze bounding box shape to detect orientation issues.
 * For humanoids:
 * - Y should be tallest (standing up)
 * - If Z is tallest, model is likely Z-up (Blender export issue)
 * - If X is tallest, check Y/X ratio to distinguish between:
 *   - Wide props (tables, fireplaces, books) where X > Y but Y is still substantial
 *   - Sideways models where Y is extremely small (lying flat)
 */
export function analyzeBoundingBox(object: THREE.Object3D): GeometryAnalysisResult | null {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())

  if (size.length() === 0) {
    return null
  }

  const dims = { x: size.x, y: size.y, z: size.z }

  // Find tallest axis
  const tallestAxis = getTallestAxis(dims)

  // Analyze proportions
  const maxHorizontal = Math.max(dims.x, dims.z)
  const heightRatio = dims.y / (maxHorizontal + 0.001)

  // Y is tallest - likely correct orientation
  if (tallestAxis === 'y') {
    return {
      method: 'bounding-box',
      confidence: Math.min(0.6, 0.3 + (heightRatio - 1) * 0.15),
      detectedForward: new THREE.Vector3(0, 0, -1),
      detectedUp: new THREE.Vector3(0, 1, 0),
      metadata: {
        dimensions: dims,
        tallestAxis: 'Y',
        heightRatio,
        issue: 'none',
      },
    }
  }

  // Z is tallest - likely Z-up (Blender export)
  if (tallestAxis === 'z') {
    return {
      method: 'bounding-box',
      confidence: Math.min(0.7, 0.4 + Math.abs(dims.z / dims.y - 1) * 0.2),
      detectedForward: new THREE.Vector3(0, -1, 0), // -Y is forward in Z-up
      detectedUp: new THREE.Vector3(0, 0, 1), // Z is up
      metadata: {
        dimensions: dims,
        tallestAxis: 'Z',
        heightRatio: dims.z / maxHorizontal,
        issue: 'z-up',
        suggestedFix: 'Rotate -90° around X axis',
      },
    }
  }

  // X is tallest - could be a wide prop (table, fireplace, book) or lying sideways
  if (tallestAxis === 'x') {
    // Check if Y (height) is still reasonably tall relative to X (width)
    // If Y is reasonable, the model is likely a wide prop with correct Y-up orientation
    const yToXRatio = dims.y / dims.x

    // If Y is more than 30% of X, likely a wide prop (not lying flat)
    if (yToXRatio > 0.3) {
      // This is probably a wide prop like a table or fireplace - Y-up is correct
      return {
        method: 'bounding-box',
        confidence: 0.3, // Lower confidence since we're less certain for wide objects
        detectedForward: new THREE.Vector3(0, 0, -1),
        detectedUp: new THREE.Vector3(0, 1, 0),
        metadata: {
          dimensions: dims,
          tallestAxis: 'X',
          yToXRatio,
          issue: 'none',
          note: 'Wide prop - X is longest but Y-up appears correct',
        },
      }
    }

    // Y is very small compared to X - model is likely lying flat/sideways
    return {
      method: 'bounding-box',
      confidence: 0.25, // Very low confidence - this heuristic is unreliable
      detectedForward: new THREE.Vector3(0, 0, -1),
      detectedUp: new THREE.Vector3(1, 0, 0), // X is up (likely wrong)
      metadata: {
        dimensions: dims,
        tallestAxis: 'X',
        yToXRatio,
        issue: 'possibly-sideways',
        suggestedFix: 'Model might be lying sideways (Y is very small compared to X)',
      },
    }
  }

  return null
}

function getTallestAxis(dims: { x: number; y: number; z: number }): 'x' | 'y' | 'z' {
  if (dims.y >= dims.x && dims.y >= dims.z) return 'y'
  if (dims.z >= dims.x && dims.z >= dims.y) return 'z'
  return 'x'
}
