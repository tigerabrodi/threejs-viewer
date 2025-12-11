import * as THREE from 'three'
import type { ValidationCheckResult } from '../../types/validation'
import { detectModelOrientation } from '../geometry-analysis'

const EXPECTED_FORWARD = new THREE.Vector3(0, 0, -1)
const OPPOSITE_FORWARD = new THREE.Vector3(0, 0, 1)

/**
 * Check if the model's forward direction matches cf-kernel convention (-Z).
 * Uses geometry-based detection (skeleton, bounding box) for accurate results.
 */
export function checkForwardDirection(object: THREE.Object3D): ValidationCheckResult {
  const detection = detectModelOrientation(object)
  const forward = detection.detectedForward

  // Check alignment with expected forward
  const forwardDot = forward.dot(EXPECTED_FORWARD)
  const isCorrect = forwardDot >= 0.996 // ~5° tolerance

  if (isCorrect) {
    return {
      checkId: 'forward-direction',
      name: 'Forward Direction',
      passed: true,
      severity: 'info',
      message: `Model faces -Z (correct). Detected via ${detection.method}.`,
      measuredValue: {
        x: forward.x.toFixed(3),
        y: forward.y.toFixed(3),
        z: forward.z.toFixed(3),
      },
      expectedValue: { x: 0, y: 0, z: -1 },
      metadata: {
        detectionMethod: detection.method,
        confidence: detection.confidence,
        allResults: detection.allResults.map((r) => ({
          method: r.method,
          confidence: r.confidence,
          forward: {
            x: r.detectedForward.x.toFixed(3),
            y: r.detectedForward.y.toFixed(3),
            z: r.detectedForward.z.toFixed(3),
          },
        })),
      },
    }
  }

  // Check if facing opposite direction (+Z)
  const oppositeDot = forward.dot(OPPOSITE_FORWARD)
  const isFacingOpposite = oppositeDot >= 0.996

  // Calculate deviation angle
  const deviationAngle =
    Math.acos(Math.max(-1, Math.min(1, forwardDot))) * (180 / Math.PI)

  if (isFacingOpposite) {
    return {
      checkId: 'forward-direction',
      name: 'Forward Direction',
      passed: false,
      severity: 'error',
      message: `Model faces +Z (backwards). Rotate 180° around Y axis.`,
      measuredValue: {
        x: forward.x.toFixed(3),
        y: forward.y.toFixed(3),
        z: forward.z.toFixed(3),
      },
      expectedValue: { x: 0, y: 0, z: -1 },
      deviationAngleDegrees: deviationAngle,
      correctiveTransform: {
        type: 'rotate',
        axis: 'y',
        angleDegrees: 180,
      },
      metadata: {
        detectionMethod: detection.method,
        confidence: detection.confidence,
        issue: 'backwards',
        allResults: detection.allResults.map((r) => ({
          method: r.method,
          confidence: r.confidence,
          forward: {
            x: r.detectedForward.x.toFixed(3),
            y: r.detectedForward.y.toFixed(3),
            z: r.detectedForward.z.toFixed(3),
          },
        })),
      },
    }
  }

  // Check for Z-up issue (forward is pointing down -Y)
  const isForwardPointingDown = forward.dot(new THREE.Vector3(0, -1, 0)) >= 0.9
  if (isForwardPointingDown) {
    return {
      checkId: 'forward-direction',
      name: 'Forward Direction',
      passed: false,
      severity: 'error',
      message: `Model faces -Y (Z-up export issue). Rotate -90° around X axis.`,
      measuredValue: {
        x: forward.x.toFixed(3),
        y: forward.y.toFixed(3),
        z: forward.z.toFixed(3),
      },
      expectedValue: { x: 0, y: 0, z: -1 },
      deviationAngleDegrees: deviationAngle,
      correctiveTransform: {
        type: 'rotate',
        axis: 'x',
        angleDegrees: -90,
      },
      metadata: {
        detectionMethod: detection.method,
        confidence: detection.confidence,
        issue: 'z-up-export',
        allResults: detection.allResults.map((r) => ({
          method: r.method,
          confidence: r.confidence,
          forward: {
            x: r.detectedForward.x.toFixed(3),
            y: r.detectedForward.y.toFixed(3),
            z: r.detectedForward.z.toFixed(3),
          },
        })),
      },
    }
  }

  // Generic misalignment
  return {
    checkId: 'forward-direction',
    name: 'Forward Direction',
    passed: false,
    severity: 'error',
    message: `Forward is (${forward.x.toFixed(2)}, ${forward.y.toFixed(2)}, ${forward.z.toFixed(2)}). ${deviationAngle.toFixed(1)}° off.`,
    measuredValue: {
      x: forward.x.toFixed(3),
      y: forward.y.toFixed(3),
      z: forward.z.toFixed(3),
    },
    expectedValue: { x: 0, y: 0, z: -1 },
    deviationAngleDegrees: deviationAngle,
    metadata: {
      detectionMethod: detection.method,
      confidence: detection.confidence,
      allResults: detection.allResults.map((r) => ({
        method: r.method,
        confidence: r.confidence,
        forward: {
          x: r.detectedForward.x.toFixed(3),
          y: r.detectedForward.y.toFixed(3),
          z: r.detectedForward.z.toFixed(3),
        },
      })),
    },
  }
}
