import * as THREE from 'three'
import type { ValidationCheckResult } from '../../types/validation'
import { detectModelOrientation } from '../geometry-analysis'

const EXPECTED_UP = new THREE.Vector3(0, 1, 0)
const Z_UP = new THREE.Vector3(0, 0, 1)
const NEGATIVE_Y_UP = new THREE.Vector3(0, -1, 0)

/**
 * Check if the model's up direction matches cf-kernel convention (+Y).
 * Uses geometry-based detection (skeleton, bounding box) for accurate results.
 *
 * The check is stricter for humanoid models with skeletons, and more lenient
 * for props without skeletons (which may have ambiguous orientations).
 */
export function checkUpDirection(object: THREE.Object3D): ValidationCheckResult {
  const detection = detectModelOrientation(object)
  const up = detection.detectedUp

  // Determine if we should be strict based on detection method and confidence
  const hasSkeleton = detection.method === 'skeleton'
  const lowConfidence = detection.confidence < 0.5
  const isBoundingBox = detection.method === 'bounding-box'

  // Check alignment with expected up
  const upDot = up.dot(EXPECTED_UP)
  const isCorrect = upDot >= 0.996 // ~5° tolerance

  if (isCorrect) {
    return {
      checkId: 'up-direction',
      name: 'Up Direction',
      passed: true,
      severity: 'info',
      message: `Model up is +Y (correct). Detected via ${detection.method}.`,
      measuredValue: {
        x: up.x.toFixed(3),
        y: up.y.toFixed(3),
        z: up.z.toFixed(3),
      },
      expectedValue: { x: 0, y: 1, z: 0 },
      metadata: {
        detectionMethod: detection.method,
        confidence: detection.confidence,
        allResults: detection.allResults.map((r) => ({
          method: r.method,
          confidence: r.confidence,
          up: {
            x: r.detectedUp.x.toFixed(3),
            y: r.detectedUp.y.toFixed(3),
            z: r.detectedUp.z.toFixed(3),
          },
        })),
      },
    }
  }

  // Calculate deviation angle
  const deviationAngle =
    Math.acos(Math.max(-1, Math.min(1, upDot))) * (180 / Math.PI)

  // Check for Z-up (Blender default export)
  const zUpDot = up.dot(Z_UP)
  const isZUp = zUpDot >= 0.996

  if (isZUp) {
    // Determine severity based on detection confidence and method
    let severity: 'error' | 'warning' | 'info' = 'error'
    let messagePrefix = ''

    if (isBoundingBox && lowConfidence) {
      // Low confidence bounding box detection - could be a wide prop
      severity = 'warning'
      messagePrefix = '[Low confidence] '
    } else if (!hasSkeleton) {
      // No skeleton detected - might be a prop, be less strict
      severity = 'warning'
      messagePrefix = '[No skeleton] '
    }

    return {
      checkId: 'up-direction',
      name: 'Up Direction',
      passed: false,
      severity,
      message: `${messagePrefix}Model is Z-up (Blender export). Rotate -90° around X axis.`,
      measuredValue: {
        x: up.x.toFixed(3),
        y: up.y.toFixed(3),
        z: up.z.toFixed(3),
      },
      expectedValue: { x: 0, y: 1, z: 0 },
      deviationAngleDegrees: deviationAngle,
      correctiveTransform: {
        type: 'rotate',
        axis: 'x',
        angleDegrees: -90,
      },
      metadata: {
        detectionMethod: detection.method,
        confidence: detection.confidence,
        lowConfidence: isBoundingBox && lowConfidence,
        issue: 'z-up',
        suggestedFix: 'In Blender: Enable "+Y Up" in GLTF export settings, or apply rotation before export.',
        note:
          severity === 'warning'
            ? 'Detection has low confidence or no skeleton found. This might be a prop with ambiguous orientation.'
            : undefined,
        allResults: detection.allResults.map((r) => ({
          method: r.method,
          confidence: r.confidence,
          up: {
            x: r.detectedUp.x.toFixed(3),
            y: r.detectedUp.y.toFixed(3),
            z: r.detectedUp.z.toFixed(3),
          },
        })),
      },
    }
  }

  // Check for upside-down model
  const negYDot = up.dot(NEGATIVE_Y_UP)
  const isUpsideDown = negYDot >= 0.996

  if (isUpsideDown) {
    // Determine severity based on detection confidence and method
    let severity: 'error' | 'warning' | 'info' = 'error'
    let messagePrefix = ''

    if (isBoundingBox && lowConfidence) {
      // Low confidence bounding box detection - could be a wide prop
      severity = 'warning'
      messagePrefix = '[Low confidence] '
    } else if (!hasSkeleton) {
      // No skeleton detected - might be a prop, be less strict
      severity = 'warning'
      messagePrefix = '[No skeleton] '
    }

    return {
      checkId: 'up-direction',
      name: 'Up Direction',
      passed: false,
      severity,
      message: `${messagePrefix}Model is upside-down (-Y up). Rotate 180° around Z axis.`,
      measuredValue: {
        x: up.x.toFixed(3),
        y: up.y.toFixed(3),
        z: up.z.toFixed(3),
      },
      expectedValue: { x: 0, y: 1, z: 0 },
      deviationAngleDegrees: 180,
      correctiveTransform: {
        type: 'rotate',
        axis: 'z',
        angleDegrees: 180,
      },
      metadata: {
        detectionMethod: detection.method,
        confidence: detection.confidence,
        lowConfidence: isBoundingBox && lowConfidence,
        issue: 'upside-down',
        note:
          severity === 'warning'
            ? 'Detection has low confidence or no skeleton found. This might be a prop with ambiguous orientation.'
            : undefined,
        allResults: detection.allResults.map((r) => ({
          method: r.method,
          confidence: r.confidence,
          up: {
            x: r.detectedUp.x.toFixed(3),
            y: r.detectedUp.y.toFixed(3),
            z: r.detectedUp.z.toFixed(3),
          },
        })),
      },
    }
  }

  // Check for X-up (model lying on side)
  const xUpDot = Math.abs(up.dot(new THREE.Vector3(1, 0, 0)))
  const isXUp = xUpDot >= 0.996

  if (isXUp) {
    const rotationDir = up.x > 0 ? -90 : 90

    // Determine severity based on detection confidence and method
    let severity: 'error' | 'warning' | 'info' = 'error'
    let messagePrefix = ''

    if (isBoundingBox && lowConfidence) {
      // Low confidence bounding box detection - could be a wide prop
      severity = 'warning'
      messagePrefix = '[Low confidence] '
    } else if (!hasSkeleton) {
      // No skeleton detected - might be a prop, be less strict
      severity = 'warning'
      messagePrefix = '[No skeleton] '
    }

    return {
      checkId: 'up-direction',
      name: 'Up Direction',
      passed: false,
      severity,
      message: `${messagePrefix}Model is sideways (X-up). Rotate ${rotationDir}° around Z axis.`,
      measuredValue: {
        x: up.x.toFixed(3),
        y: up.y.toFixed(3),
        z: up.z.toFixed(3),
      },
      expectedValue: { x: 0, y: 1, z: 0 },
      deviationAngleDegrees: deviationAngle,
      correctiveTransform: {
        type: 'rotate',
        axis: 'z',
        angleDegrees: rotationDir,
      },
      metadata: {
        detectionMethod: detection.method,
        confidence: detection.confidence,
        lowConfidence: isBoundingBox && lowConfidence,
        issue: 'sideways',
        note:
          severity === 'warning'
            ? 'Detection has low confidence or no skeleton found. This might be a prop with ambiguous orientation.'
            : undefined,
        allResults: detection.allResults.map((r) => ({
          method: r.method,
          confidence: r.confidence,
          up: {
            x: r.detectedUp.x.toFixed(3),
            y: r.detectedUp.y.toFixed(3),
            z: r.detectedUp.z.toFixed(3),
          },
        })),
      },
    }
  }

  // Generic misalignment
  // Determine severity based on detection confidence and method
  let severity: 'error' | 'warning' | 'info' = 'error'
  let messagePrefix = ''

  if (isBoundingBox && lowConfidence) {
    // Low confidence bounding box detection - could be a wide prop
    severity = 'warning'
    messagePrefix = '[Low confidence] '
  } else if (!hasSkeleton) {
    // No skeleton detected - might be a prop, be less strict
    severity = 'warning'
    messagePrefix = '[No skeleton] '
  }

  return {
    checkId: 'up-direction',
    name: 'Up Direction',
    passed: false,
    severity,
    message: `${messagePrefix}Up is (${up.x.toFixed(2)}, ${up.y.toFixed(2)}, ${up.z.toFixed(2)}). ${deviationAngle.toFixed(1)}° off.`,
    measuredValue: {
      x: up.x.toFixed(3),
      y: up.y.toFixed(3),
      z: up.z.toFixed(3),
    },
    expectedValue: { x: 0, y: 1, z: 0 },
    deviationAngleDegrees: deviationAngle,
    metadata: {
      detectionMethod: detection.method,
      confidence: detection.confidence,
      lowConfidence: isBoundingBox && lowConfidence,
      note:
        severity === 'warning'
          ? 'Detection has low confidence or no skeleton found. This might be a prop with ambiguous orientation.'
          : undefined,
      allResults: detection.allResults.map((r) => ({
        method: r.method,
        confidence: r.confidence,
        up: {
          x: r.detectedUp.x.toFixed(3),
          y: r.detectedUp.y.toFixed(3),
          z: r.detectedUp.z.toFixed(3),
        },
      })),
    },
  }
}
