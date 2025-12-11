import * as THREE from 'three'

export type RigType = 'mixamo' | 'unity-humanoid' | 'unreal' | 'custom' | 'unknown'

export interface SkeletonAnalysis {
  hasSkeleton: boolean
  skinnedMeshes: THREE.SkinnedMesh[]
  rootBone: THREE.Bone | null
  allBones: THREE.Bone[]
  bonesByName: Map<string, THREE.Bone>
  detectedRigType: RigType
}

export interface StandardBones {
  hips: THREE.Bone | null
  spine: THREE.Bone | null
  chest: THREE.Bone | null
  neck: THREE.Bone | null
  head: THREE.Bone | null
  leftShoulder: THREE.Bone | null
  rightShoulder: THREE.Bone | null
  leftUpperArm: THREE.Bone | null
  rightUpperArm: THREE.Bone | null
}

export interface OrientationResult {
  upVector: THREE.Vector3
  forwardVector: THREE.Vector3
  rightVector: THREE.Vector3
  confidence: 'high' | 'medium' | 'low'
  method: string
}

export interface GeometryAnalysisResult {
  method: 'skeleton' | 'normals' | 'pca' | 'bounding-box' | 'transform' | 'none'
  confidence: number // 0.0 - 1.0
  detectedForward: THREE.Vector3
  detectedUp: THREE.Vector3
  metadata?: Record<string, unknown>
}
