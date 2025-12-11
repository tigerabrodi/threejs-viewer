import * as THREE from 'three'
import type { SkeletonAnalysis, RigType, StandardBones } from './types'

/**
 * Common bone naming patterns for different rig types
 */
const BONE_PATTERNS: Record<keyof StandardBones, RegExp[]> = {
  hips: [
    /^mixamorig[:\._-]?hips$/i,
    /^hips?$/i,
    /^pelvis$/i,
    /^root$/i,
    /^bip[\d]*[:\._-]?pelvis$/i,
    /^cog$/i,
  ],
  spine: [
    /^mixamorig[:\._-]?spine$/i,
    /^spine$/i,
    /^bip[\d]*[:\._-]?spine$/i,
    /^torso$/i,
  ],
  chest: [
    /^mixamorig[:\._-]?spine[12]$/i,
    /^chest$/i,
    /^upper[\s_-]?chest$/i,
    /^ribcage$/i,
  ],
  neck: [
    /^mixamorig[:\._-]?neck$/i,
    /^neck$/i,
    /^bip[\d]*[:\._-]?neck$/i,
  ],
  head: [
    /^mixamorig[:\._-]?head$/i,
    /^head$/i,
    /^bip[\d]*[:\._-]?head$/i,
    /^cranium$/i,
  ],
  leftShoulder: [
    /^mixamorig[:\._-]?leftshoulder$/i,
    /^left[\s_-]?shoulder$/i,
    /^shoulder[:\._-]?l$/i,
    /^l[:\._-]?shoulder$/i,
    /^clavicle[:\._-]?l$/i,
    /^l[:\._-]?clavicle$/i,
  ],
  rightShoulder: [
    /^mixamorig[:\._-]?rightshoulder$/i,
    /^right[\s_-]?shoulder$/i,
    /^shoulder[:\._-]?r$/i,
    /^r[:\._-]?shoulder$/i,
    /^clavicle[:\._-]?r$/i,
    /^r[:\._-]?clavicle$/i,
  ],
  leftUpperArm: [
    /^mixamorig[:\._-]?leftarm$/i,
    /^left[\s_-]?upper[\s_-]?arm$/i,
    /^arm[:\._-]?l$/i,
    /^l[:\._-]?arm$/i,
    /^upperarm[:\._-]?l$/i,
  ],
  rightUpperArm: [
    /^mixamorig[:\._-]?rightarm$/i,
    /^right[\s_-]?upper[\s_-]?arm$/i,
    /^arm[:\._-]?r$/i,
    /^r[:\._-]?arm$/i,
    /^upperarm[:\._-]?r$/i,
  ],
}

/**
 * Analyze an object to find skeleton/bone information
 */
export function analyzeSkeleton(object: THREE.Object3D): SkeletonAnalysis {
  const skinnedMeshes: THREE.SkinnedMesh[] = []
  const allBones: THREE.Bone[] = []
  const bonesByName = new Map<string, THREE.Bone>()

  // Traverse scene to find SkinnedMesh and Bone objects
  object.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh) {
      skinnedMeshes.push(child)
      if (child.skeleton) {
        for (const bone of child.skeleton.bones) {
          if (!allBones.includes(bone)) {
            allBones.push(bone)
            bonesByName.set(bone.name.toLowerCase(), bone)
          }
        }
      }
    }
    if (child instanceof THREE.Bone) {
      if (!allBones.includes(child)) {
        allBones.push(child)
        bonesByName.set(child.name.toLowerCase(), child)
      }
    }
  })

  const rootBone = findRootBone(allBones)
  const detectedRigType = detectRigType(bonesByName)

  return {
    hasSkeleton: skinnedMeshes.length > 0 || allBones.length > 0,
    skinnedMeshes,
    rootBone,
    allBones,
    bonesByName,
    detectedRigType,
  }
}

/**
 * Find the root bone (bone with no parent bone)
 */
function findRootBone(bones: THREE.Bone[]): THREE.Bone | null {
  for (const bone of bones) {
    if (!bone.parent || !(bone.parent instanceof THREE.Bone)) {
      return bone
    }
  }
  return bones[0] || null
}

/**
 * Detect the rig type based on bone naming conventions
 */
function detectRigType(bonesByName: Map<string, THREE.Bone>): RigType {
  const names = Array.from(bonesByName.keys())

  // Check for Mixamo prefix
  if (names.some(n => n.startsWith('mixamorig'))) {
    return 'mixamo'
  }

  // Check for typical Unity naming
  if (names.some(n => /^(left|right)(upper|lower)?(arm|leg|hand|foot)$/i.test(n))) {
    return 'unity-humanoid'
  }

  // Check for Unreal/Biped naming
  if (names.some(n => n.startsWith('bip'))) {
    return 'unreal'
  }

  // Has bones but unrecognized naming
  if (bonesByName.size > 0) {
    return 'custom'
  }

  return 'unknown'
}

/**
 * Find standard bones by name patterns
 */
export function findStandardBones(bonesByName: Map<string, THREE.Bone>): StandardBones {
  const result: StandardBones = {
    hips: null,
    spine: null,
    chest: null,
    neck: null,
    head: null,
    leftShoulder: null,
    rightShoulder: null,
    leftUpperArm: null,
    rightUpperArm: null,
  }

  for (const [boneName, bone] of bonesByName) {
    for (const [standardName, patterns] of Object.entries(BONE_PATTERNS)) {
      if (result[standardName as keyof StandardBones] === null) {
        for (const pattern of patterns) {
          if (pattern.test(boneName)) {
            result[standardName as keyof StandardBones] = bone
            break
          }
        }
      }
    }
  }

  return result
}
