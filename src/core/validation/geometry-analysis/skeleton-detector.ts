import * as THREE from 'three'
import type { SkeletonAnalysis, RigType, StandardBones } from './types'

/**
 * Common bone naming patterns for different rig types
 */
const BONE_PATTERNS: Record<keyof StandardBones, RegExp[]> = {
  hips: [
    /^mixamorig[:\.]?hips$/i,
    /^hips?$/i,
    /^pelvis$/i,
    /^root$/i,
    /^bip[\d]*[:\.]?pelvis$/i,
    /^cog$/i,
  ],
  spine: [
    /^mixamorig[:\.]?spine$/i,
    /^spine$/i,
    /^bip[\d]*[:\.]?spine$/i,
    /^torso$/i,
  ],
  chest: [
    /^mixamorig[:\.]?spine[12]$/i,
    /^chest$/i,
    /^upper[\s_-]?chest$/i,
    /^ribcage$/i,
  ],
  neck: [
    /^mixamorig[:\.]?neck$/i,
    /^neck$/i,
    /^bip[\d]*[:\.]?neck$/i,
  ],
  head: [
    /^mixamorig[:\.]?head$/i,
    /^head$/i,
    /^bip[\d]*[:\.]?head$/i,
    /^cranium$/i,
  ],
  leftShoulder: [
    /^mixamorig[:\.]?leftshoulder$/i,
    /^left[\s_-]?shoulder$/i,
    /^shoulder[:\.]?l$/i,
    /^l[:\.]?shoulder$/i,
    /^clavicle[:\.]?l$/i,
    /^l[:\.]?clavicle$/i,
  ],
  rightShoulder: [
    /^mixamorig[:\.]?rightshoulder$/i,
    /^right[\s_-]?shoulder$/i,
    /^shoulder[:\.]?r$/i,
    /^r[:\.]?shoulder$/i,
    /^clavicle[:\.]?r$/i,
    /^r[:\.]?clavicle$/i,
  ],
  leftUpperArm: [
    /^mixamorig[:\.]?leftarm$/i,
    /^left[\s_-]?upper[\s_-]?arm$/i,
    /^arm[:\.]?l$/i,
    /^l[:\.]?arm$/i,
    /^upperarm[:\.]?l$/i,
  ],
  rightUpperArm: [
    /^mixamorig[:\.]?rightarm$/i,
    /^right[\s_-]?upper[\s_-]?arm$/i,
    /^arm[:\.]?r$/i,
    /^r[:\.]?arm$/i,
    /^upperarm[:\.]?r$/i,
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
