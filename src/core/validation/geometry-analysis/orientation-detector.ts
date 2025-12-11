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
 * Calculate agreement score between two orientation results.
 * Returns a value from 0 (complete disagreement) to 1 (perfect agreement).
 *
 * We DO care about direction, not just parallel alignment:
 * - Forward +Z vs -Z should be disagreement (facing opposite directions)
 * - Up +Y vs -Y should be disagreement (upside down)
 */
function calculateOrientationAgreement(
  result1: GeometryAnalysisResult,
  result2: GeometryAnalysisResult
): number {
  // Calculate dot products for forward and up vectors
  // dot = 1: same direction (perfect agreement)
  // dot = 0: perpendicular (partial disagreement)
  // dot = -1: opposite direction (complete disagreement)
  const forwardDot = result1.detectedForward.dot(result2.detectedForward)
  const upDot = result1.detectedUp.dot(result2.detectedUp)

  // Map from [-1, 1] to [0, 1] where:
  // - 1.0 = same direction (agreement)
  // - 0.5 = perpendicular
  // - 0.0 = opposite direction (disagreement)
  const forwardAgreement = (forwardDot + 1) / 2
  const upAgreement = (upDot + 1) / 2

  return (forwardAgreement + upAgreement) / 2
}

/**
 * Apply cross-validation to adjust skeleton confidence based on bounding box agreement.
 * This prevents trusting wrong skeleton data over obvious geometric evidence.
 */
function applyCrossValidation(
  skeletonResult: GeometryAnalysisResult,
  bboxResult: GeometryAnalysisResult | null
): number {
  let confidence = skeletonResult.confidence

  // If we have no bounding box data, cap skeleton confidence at 0.85
  // since we can't verify it against geometric evidence
  if (!bboxResult) {
    return Math.min(confidence, 0.85)
  }

  // Calculate how much the two methods agree
  const agreement = calculateOrientationAgreement(skeletonResult, bboxResult)

  // Strong agreement (>=0.9): Methods align well
  if (agreement >= 0.9) {
    // Boost confidence slightly, but cap at 0.95
    return Math.min(confidence * 1.05, 0.95)
  }

  // Moderate agreement (0.7-0.9): Methods roughly align
  if (agreement >= 0.7) {
    // Keep original confidence but cap at 0.85
    return Math.min(confidence, 0.85)
  }

  // Weak agreement (0.5-0.7): Methods disagree somewhat
  if (agreement >= 0.5) {
    // Reduce confidence moderately
    return confidence * 0.7
  }

  // Strong disagreement (<0.5): Methods strongly conflict
  // This is a red flag - the skeleton data might be wrong
  // Check if bounding box has strong evidence
  if (bboxResult.confidence > 0.6) {
    // Bounding box has strong evidence and disagrees - skeleton is likely wrong
    // Reduce skeleton confidence significantly
    return confidence * 0.4
  }

  // Both methods disagree and both have weak confidence
  // Reduce skeleton confidence moderately
  return confidence * 0.6
}

/**
 * Detect model orientation using multiple strategies with fallback.
 * Priority order:
 * 1. Skeleton analysis (most reliable for humanoids, with cross-validation)
 * 2. Bounding box shape analysis
 * 3. Root transform (fallback)
 */
export function detectModelOrientation(
  object: THREE.Object3D
): OrientationDetectionResult {
  const results: GeometryAnalysisResult[] = []
  let skeletonResult: GeometryAnalysisResult | null = null
  let bboxResult: GeometryAnalysisResult | null = null

  // Strategy 1: Skeleton analysis
  try {
    const skeletonAnalysis = analyzeSkeleton(object)
    if (skeletonAnalysis.hasSkeleton) {
      const standardBones = findStandardBones(skeletonAnalysis.bonesByName)
      const orientation = calculateSkeletonOrientation(standardBones)

      if (orientation) {
        // Initial confidence mapping - more conservative than before
        const confidenceMap = { high: 0.85, medium: 0.7, low: 0.5 }
        skeletonResult = {
          method: 'skeleton',
          confidence: confidenceMap[orientation.confidence],
          detectedForward: orientation.forwardVector,
          detectedUp: orientation.upVector,
          metadata: {
            rigType: skeletonAnalysis.detectedRigType,
            boneCount: skeletonAnalysis.allBones.length,
            analysisMethod: orientation.method,
            initialConfidence: confidenceMap[orientation.confidence],
          },
        }
      }
    }
  } catch (e) {
    console.warn('[OrientationDetector] Skeleton analysis failed:', e)
  }

  // Strategy 2: Bounding box shape analysis
  try {
    bboxResult = analyzeBoundingBox(object)
  } catch (e) {
    console.warn('[OrientationDetector] Bounding box analysis failed:', e)
  }

  // Apply cross-validation if we have skeleton results
  if (skeletonResult) {
    const originalConfidence = skeletonResult.confidence
    skeletonResult.confidence = applyCrossValidation(skeletonResult, bboxResult)

    // Add metadata about confidence adjustment
    if (skeletonResult.metadata) {
      skeletonResult.metadata.confidenceAdjusted = originalConfidence !== skeletonResult.confidence
      skeletonResult.metadata.originalConfidence = originalConfidence
      skeletonResult.metadata.finalConfidence = skeletonResult.confidence

      if (bboxResult) {
        const agreement = calculateOrientationAgreement(skeletonResult, bboxResult)
        skeletonResult.metadata.bboxAgreement = agreement
      }
    }

    results.push(skeletonResult)
  }

  // Add bounding box result to the list
  if (bboxResult) {
    results.push(bboxResult)
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
