import * as THREE from 'three'
import type { ValidationCheckResult } from '../../types/validation'
import { detectModelOrientation } from '../geometry-analysis'

const EXPECTED_UP = new THREE.Vector3(0, 1, 0)
const Z_UP = new THREE.Vector3(0, 0, 1)
const NEGATIVE_Y_UP = new THREE.Vector3(0, -1, 0)

/**
 * Check if the model's up direction matches cf-kernel convention (+Y).
 * Uses geometry-based detection (skeleton, bounding box) for accurate results.
 */
export function checkUpDirection(object: THREE.Object3D): ValidationCheckResult {
  const detection = detectModelOrientation(object)
  const up = detection.detectedUp

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
    return {
      checkId: 'up-direction',
      name: 'Up Direction',
      passed: false,
      severity: 'error',
      message: `Model is Z-up (Blender export). Rotate -90° around X axis.`,
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
        issue: 'z-up',
        suggestedFix: 'In Blender: Enable "+Y Up" in GLTF export settings, or apply rotation before export.',
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
    return {
      checkId: 'up-direction',
      name: 'Up Direction',
      passed: false,
      severity: 'error',
      message: `Model is upside-down (-Y up). Rotate 180° around Z axis.`,
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
        issue: 'upside-down',
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
    return {
      checkId: 'up-direction',
      name: 'Up Direction',
      passed: false,
      severity: 'error',
      message: `Model is sideways (X-up). Rotate ${rotationDir}° around Z axis.`,
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
        issue: 'sideways',
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
  return {
    checkId: 'up-direction',
    name: 'Up Direction',
    passed: false,
    severity: 'error',
    message: `Up is (${up.x.toFixed(2)}, ${up.y.toFixed(2)}, ${up.z.toFixed(2)}). ${deviationAngle.toFixed(1)}° off.`,
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
