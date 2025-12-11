import * as THREE from 'three'
import type { GeometryAnalysisResult } from './types'

/**
 * Analyze bounding box shape to detect orientation issues.
 * For humanoids:
 * - Y should be tallest (standing up)
 * - If Z is tallest, model is likely Z-up (Blender export issue)
 * - If X is tallest, model might be lying sideways
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

  // X is tallest - model might be lying sideways
  if (tallestAxis === 'x') {
    return {
      method: 'bounding-box',
      confidence: Math.min(0.5, 0.3 + Math.abs(dims.x / dims.y - 1) * 0.15),
      detectedForward: new THREE.Vector3(0, 0, -1),
      detectedUp: new THREE.Vector3(1, 0, 0), // X is up (wrong)
      metadata: {
        dimensions: dims,
        tallestAxis: 'X',
        issue: 'sideways',
        suggestedFix: 'Model appears to be lying sideways',
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
