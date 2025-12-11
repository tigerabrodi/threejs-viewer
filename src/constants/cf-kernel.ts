export const CF_KERNEL_CONFIG = {
  coordinateSystem: 'right-handed',
  upAxis: [0, 1, 0] as const,      // Y+
  forwardAxis: [0, 0, -1] as const, // -Z
  rightAxis: [1, 0, 0] as const,    // X+
  pivotPosition: 'feet',            // bottom-center
} as const

export const TOLERANCES = {
  ANGLE: 0.087,         // ~5 degrees in radians
  POSITION: 0.01,
  SCALE: 0.001,
  DOT_THRESHOLD: 0.996, // cos(5 deg)
} as const
