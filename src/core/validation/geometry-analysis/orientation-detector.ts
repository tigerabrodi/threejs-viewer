import * as THREE from 'three'
import type { GeometryAnalysisResult } from './types'
import { analyzeSkeleton, findStandardBones } from './skeleton-detector'
import { calculateSkeletonOrientation } from './skeleton-orientation'
import { analyzeBoundingBox } from './bounding-box-analysis'
import { extractBasisVectors } from '../math-utils'

export interface OrientationDetectionResult {
  detectedForward: THREE.Vector3
  detectedUp: THREE.Vector3
  confidence: number
  method: string
  allResults: GeometryAnalysisResult[]
}

/**
 * Detect model orientation using multiple strategies with fallback.
 * Priority order:
 * 1. Skeleton analysis (most reliable for humanoids)
 * 2. Bounding box shape analysis
 * 3. Root transform (fallback)
 */
export function detectModelOrientation(
  object: THREE.Object3D
): OrientationDetectionResult {
  const results: GeometryAnalysisResult[] = []

  // Strategy 1: Skeleton analysis
  try {
    const skeletonAnalysis = analyzeSkeleton(object)
    if (skeletonAnalysis.hasSkeleton) {
      const standardBones = findStandardBones(skeletonAnalysis.bonesByName)
      const orientation = calculateSkeletonOrientation(standardBones)

      if (orientation) {
        const confidenceMap = { high: 0.95, medium: 0.7, low: 0.5 }
        results.push({
          method: 'skeleton',
          confidence: confidenceMap[orientation.confidence],
          detectedForward: orientation.forwardVector,
          detectedUp: orientation.upVector,
          metadata: {
            rigType: skeletonAnalysis.detectedRigType,
            boneCount: skeletonAnalysis.allBones.length,
            analysisMethod: orientation.method,
          },
        })
      }
    }
  } catch (e) {
    console.warn('[OrientationDetector] Skeleton analysis failed:', e)
  }

  // Strategy 2: Bounding box shape analysis
  try {
    const bboxResult = analyzeBoundingBox(object)
    if (bboxResult) {
      results.push(bboxResult)
    }
  } catch (e) {
    console.warn('[OrientationDetector] Bounding box analysis failed:', e)
  }

  // Strategy 3: Transform-based (fallback)
  try {
    const quaternion = object.quaternion.clone()
    const { forward, up } = extractBasisVectors(quaternion)
    results.push({
      method: 'transform',
      confidence: 0.3, // Low confidence since this is just the root transform
      detectedForward: forward,
      detectedUp: up,
      metadata: {
        note: 'Based on root transform only - may not reflect visual orientation',
      },
    })
  } catch (e) {
    console.warn('[OrientationDetector] Transform analysis failed:', e)
  }

  // If no strategies succeeded, return identity
  if (results.length === 0) {
    return {
      detectedForward: new THREE.Vector3(0, 0, -1),
      detectedUp: new THREE.Vector3(0, 1, 0),
      confidence: 0,
      method: 'none',
      allResults: [],
    }
  }

  // Sort by confidence and use highest
  results.sort((a, b) => b.confidence - a.confidence)
  const best = results[0]

  return {
    detectedForward: best.detectedForward,
    detectedUp: best.detectedUp,
    confidence: best.confidence,
    method: best.method,
    allResults: results,
  }
}

/**
 * Determine if the model's orientation matches the expected cf-kernel convention.
 * Returns detailed information about detected vs expected orientation.
 */
export function analyzeOrientationMatch(
  object: THREE.Object3D
): {
  forward: { isCorrect: boolean; deviation: number; detected: THREE.Vector3 }
  up: { isCorrect: boolean; deviation: number; detected: THREE.Vector3 }
  detection: OrientationDetectionResult
} {
  const detection = detectModelOrientation(object)

  const expectedForward = new THREE.Vector3(0, 0, -1)
  const expectedUp = new THREE.Vector3(0, 1, 0)

  const forwardDot = detection.detectedForward.dot(expectedForward)
  const upDot = detection.detectedUp.dot(expectedUp)

  const forwardDeviation = Math.acos(Math.max(-1, Math.min(1, forwardDot))) * (180 / Math.PI)
  const upDeviation = Math.acos(Math.max(-1, Math.min(1, upDot))) * (180 / Math.PI)

  // Allow ~5 degrees tolerance (cos(5°) ≈ 0.996)
  const threshold = 0.996

  return {
    forward: {
      isCorrect: forwardDot >= threshold,
      deviation: forwardDeviation,
      detected: detection.detectedForward,
    },
    up: {
      isCorrect: upDot >= threshold,
      deviation: upDeviation,
      detected: detection.detectedUp,
    },
    detection,
  }
}
