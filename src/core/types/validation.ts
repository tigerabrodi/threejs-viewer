export interface ValidationCheckResult {
  checkId: string
  name: string
  passed: boolean
  severity: 'error' | 'warning' | 'info'
  message: string
  measuredValue?: unknown
  expectedValue?: unknown
  correctiveTransform?: CorrectionTransform
  deviationAngleDegrees?: number // How far off the measured value is from expected
  metadata?: Record<string, unknown> // Additional metadata like detection method, confidence, issues, etc.
}

export type CorrectionTransform =
  | { type: 'rotate'; axis: 'x' | 'y' | 'z'; angleDegrees: number }
  | { type: 'scale'; x: number; y: number; z: number }
  | { type: 'translate'; x: number; y: number; z: number }

export interface ModelMetrics {
  boundingBox: { min: Vec3; max: Vec3 }
  forwardVector: Vec3
  upVector: Vec3
  rightVector: Vec3
  scale: Vec3
  rotationDeterminant: number
  pivotOffset: Vec3
}

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface ModelValidationReport {
  modelName: string
  timestamp: Date
  checks: ValidationCheckResult[]
  overallPassed: boolean
  errorCount: number
  warningCount: number
  suggestedCorrections: CorrectionTransform[]
}
