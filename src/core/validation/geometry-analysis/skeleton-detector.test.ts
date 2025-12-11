import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { analyzeSkeleton, findStandardBones } from './skeleton-detector'

/**
 * Helper function to create a simple bone structure for testing
 */
function createBone(name: string): THREE.Bone {
  const bone = new THREE.Bone()
  bone.name = name
  return bone
}

/**
 * Helper function to create a Map of bones by name (lowercase keys)
 */
function createBoneMap(boneNames: string[]): Map<string, THREE.Bone> {
  const map = new Map<string, THREE.Bone>()
  for (const name of boneNames) {
    const bone = createBone(name)
    map.set(name.toLowerCase(), bone)
  }
  return map
}

describe('findStandardBones - Shoulder Pattern Matching', () => {
  describe('Left Shoulder', () => {
    it('matches PascalCase naming (LeftShoulder)', () => {
      const boneMap = createBoneMap(['LeftShoulder'])
      const result = findStandardBones(boneMap)

      expect(result.leftShoulder).not.toBeNull()
      expect(result.leftShoulder?.name).toBe('LeftShoulder')
    })

    it('matches underscore suffix (Shoulder_L)', () => {
      const boneMap = createBoneMap(['Shoulder_L'])
      const result = findStandardBones(boneMap)

      expect(result.leftShoulder).not.toBeNull()
      expect(result.leftShoulder?.name).toBe('Shoulder_L')
    })

    it('matches dot suffix lowercase (shoulder.l)', () => {
      const boneMap = createBoneMap(['shoulder.l'])
      const result = findStandardBones(boneMap)

      expect(result.leftShoulder).not.toBeNull()
      expect(result.leftShoulder?.name).toBe('shoulder.l')
    })

    it('matches colon suffix (Shoulder:L)', () => {
      const boneMap = createBoneMap(['Shoulder:L'])
      const result = findStandardBones(boneMap)

      expect(result.leftShoulder).not.toBeNull()
      expect(result.leftShoulder?.name).toBe('Shoulder:L')
    })

    it('matches prefix with underscore (left_shoulder)', () => {
      const boneMap = createBoneMap(['left_shoulder'])
      const result = findStandardBones(boneMap)

      expect(result.leftShoulder).not.toBeNull()
      expect(result.leftShoulder?.name).toBe('left_shoulder')
    })

    it('matches prefix with space (left shoulder)', () => {
      const boneMap = createBoneMap(['left shoulder'])
      const result = findStandardBones(boneMap)

      expect(result.leftShoulder).not.toBeNull()
      expect(result.leftShoulder?.name).toBe('left shoulder')
    })

    it('matches prefix with hyphen (left-shoulder)', () => {
      const boneMap = createBoneMap(['left-shoulder'])
      const result = findStandardBones(boneMap)

      expect(result.leftShoulder).not.toBeNull()
      expect(result.leftShoulder?.name).toBe('left-shoulder')
    })

    it('matches Mixamo pattern with colon (mixamorig:LeftShoulder)', () => {
      const boneMap = createBoneMap(['mixamorig:LeftShoulder'])
      const result = findStandardBones(boneMap)

      expect(result.leftShoulder).not.toBeNull()
      expect(result.leftShoulder?.name).toBe('mixamorig:LeftShoulder')
    })

    it('matches Mixamo pattern with dot (mixamorig.LeftShoulder)', () => {
      const boneMap = createBoneMap(['mixamorig.LeftShoulder'])
      const result = findStandardBones(boneMap)

      expect(result.leftShoulder).not.toBeNull()
      expect(result.leftShoulder?.name).toBe('mixamorig.LeftShoulder')
    })

    it('matches Mixamo pattern without separator (mixamorigLeftShoulder)', () => {
      const boneMap = createBoneMap(['mixamorigLeftShoulder'])
      const result = findStandardBones(boneMap)

      expect(result.leftShoulder).not.toBeNull()
      expect(result.leftShoulder?.name).toBe('mixamorigLeftShoulder')
    })

    it('matches clavicle naming (L:Clavicle)', () => {
      const boneMap = createBoneMap(['L:Clavicle'])
      const result = findStandardBones(boneMap)

      expect(result.leftShoulder).not.toBeNull()
      expect(result.leftShoulder?.name).toBe('L:Clavicle')
    })

    it('matches clavicle suffix (Clavicle_L)', () => {
      const boneMap = createBoneMap(['Clavicle_L'])
      const result = findStandardBones(boneMap)

      expect(result.leftShoulder).not.toBeNull()
      expect(result.leftShoulder?.name).toBe('Clavicle_L')
    })
  })

  describe('Right Shoulder', () => {
    it('matches PascalCase naming (RightShoulder)', () => {
      const boneMap = createBoneMap(['RightShoulder'])
      const result = findStandardBones(boneMap)

      expect(result.rightShoulder).not.toBeNull()
      expect(result.rightShoulder?.name).toBe('RightShoulder')
    })

    it('matches underscore suffix (Shoulder_R)', () => {
      const boneMap = createBoneMap(['Shoulder_R'])
      const result = findStandardBones(boneMap)

      expect(result.rightShoulder).not.toBeNull()
      expect(result.rightShoulder?.name).toBe('Shoulder_R')
    })

    it('matches dot suffix lowercase (shoulder.r)', () => {
      const boneMap = createBoneMap(['shoulder.r'])
      const result = findStandardBones(boneMap)

      expect(result.rightShoulder).not.toBeNull()
      expect(result.rightShoulder?.name).toBe('shoulder.r')
    })

    it('matches colon suffix (Shoulder:R)', () => {
      const boneMap = createBoneMap(['Shoulder:R'])
      const result = findStandardBones(boneMap)

      expect(result.rightShoulder).not.toBeNull()
      expect(result.rightShoulder?.name).toBe('Shoulder:R')
    })

    it('matches prefix with underscore (right_shoulder)', () => {
      const boneMap = createBoneMap(['right_shoulder'])
      const result = findStandardBones(boneMap)

      expect(result.rightShoulder).not.toBeNull()
      expect(result.rightShoulder?.name).toBe('right_shoulder')
    })

    it('matches prefix with space (right shoulder)', () => {
      const boneMap = createBoneMap(['right shoulder'])
      const result = findStandardBones(boneMap)

      expect(result.rightShoulder).not.toBeNull()
      expect(result.rightShoulder?.name).toBe('right shoulder')
    })

    it('matches prefix with hyphen (right-shoulder)', () => {
      const boneMap = createBoneMap(['right-shoulder'])
      const result = findStandardBones(boneMap)

      expect(result.rightShoulder).not.toBeNull()
      expect(result.rightShoulder?.name).toBe('right-shoulder')
    })

    it('matches Mixamo pattern with colon (mixamorig:RightShoulder)', () => {
      const boneMap = createBoneMap(['mixamorig:RightShoulder'])
      const result = findStandardBones(boneMap)

      expect(result.rightShoulder).not.toBeNull()
      expect(result.rightShoulder?.name).toBe('mixamorig:RightShoulder')
    })

    it('matches Mixamo pattern with dot (mixamorig.RightShoulder)', () => {
      const boneMap = createBoneMap(['mixamorig.RightShoulder'])
      const result = findStandardBones(boneMap)

      expect(result.rightShoulder).not.toBeNull()
      expect(result.rightShoulder?.name).toBe('mixamorig.RightShoulder')
    })

    it('matches Mixamo pattern without separator (mixamorigRightShoulder)', () => {
      const boneMap = createBoneMap(['mixamorigRightShoulder'])
      const result = findStandardBones(boneMap)

      expect(result.rightShoulder).not.toBeNull()
      expect(result.rightShoulder?.name).toBe('mixamorigRightShoulder')
    })

    it('matches clavicle naming (R:Clavicle)', () => {
      const boneMap = createBoneMap(['R:Clavicle'])
      const result = findStandardBones(boneMap)

      expect(result.rightShoulder).not.toBeNull()
      expect(result.rightShoulder?.name).toBe('R:Clavicle')
    })

    it('matches clavicle suffix (Clavicle_R)', () => {
      const boneMap = createBoneMap(['Clavicle_R'])
      const result = findStandardBones(boneMap)

      expect(result.rightShoulder).not.toBeNull()
      expect(result.rightShoulder?.name).toBe('Clavicle_R')
    })
  })
})

describe('findStandardBones - Upper Arm Pattern Matching', () => {
  describe('Left Upper Arm', () => {
    it('matches PascalCase naming (LeftUpperArm)', () => {
      const boneMap = createBoneMap(['LeftUpperArm'])
      const result = findStandardBones(boneMap)

      expect(result.leftUpperArm).not.toBeNull()
      expect(result.leftUpperArm?.name).toBe('LeftUpperArm')
    })

    it('matches underscore suffix (Arm_L)', () => {
      const boneMap = createBoneMap(['Arm_L'])
      const result = findStandardBones(boneMap)

      expect(result.leftUpperArm).not.toBeNull()
      expect(result.leftUpperArm?.name).toBe('Arm_L')
    })

    it('matches dot suffix lowercase (arm.l)', () => {
      const boneMap = createBoneMap(['arm.l'])
      const result = findStandardBones(boneMap)

      expect(result.leftUpperArm).not.toBeNull()
      expect(result.leftUpperArm?.name).toBe('arm.l')
    })

    it('matches colon suffix (Arm:L)', () => {
      const boneMap = createBoneMap(['Arm:L'])
      const result = findStandardBones(boneMap)

      expect(result.leftUpperArm).not.toBeNull()
      expect(result.leftUpperArm?.name).toBe('Arm:L')
    })

    it('matches prefix with underscore (left_upper_arm)', () => {
      const boneMap = createBoneMap(['left_upper_arm'])
      const result = findStandardBones(boneMap)

      expect(result.leftUpperArm).not.toBeNull()
      expect(result.leftUpperArm?.name).toBe('left_upper_arm')
    })

    it('matches prefix with space (left upper arm)', () => {
      const boneMap = createBoneMap(['left upper arm'])
      const result = findStandardBones(boneMap)

      expect(result.leftUpperArm).not.toBeNull()
      expect(result.leftUpperArm?.name).toBe('left upper arm')
    })

    it('matches prefix with hyphen (left-upper-arm)', () => {
      const boneMap = createBoneMap(['left-upper-arm'])
      const result = findStandardBones(boneMap)

      expect(result.leftUpperArm).not.toBeNull()
      expect(result.leftUpperArm?.name).toBe('left-upper-arm')
    })

    it('matches Mixamo pattern with colon (mixamorig:LeftArm)', () => {
      const boneMap = createBoneMap(['mixamorig:LeftArm'])
      const result = findStandardBones(boneMap)

      expect(result.leftUpperArm).not.toBeNull()
      expect(result.leftUpperArm?.name).toBe('mixamorig:LeftArm')
    })

    it('matches Mixamo pattern with dot (mixamorig.LeftArm)', () => {
      const boneMap = createBoneMap(['mixamorig.LeftArm'])
      const result = findStandardBones(boneMap)

      expect(result.leftUpperArm).not.toBeNull()
      expect(result.leftUpperArm?.name).toBe('mixamorig.LeftArm')
    })

    it('matches Mixamo pattern without separator (mixamorigLeftArm)', () => {
      const boneMap = createBoneMap(['mixamorigLeftArm'])
      const result = findStandardBones(boneMap)

      expect(result.leftUpperArm).not.toBeNull()
      expect(result.leftUpperArm?.name).toBe('mixamorigLeftArm')
    })

    it('matches upper arm suffix (UpperArm:L)', () => {
      const boneMap = createBoneMap(['UpperArm:L'])
      const result = findStandardBones(boneMap)

      expect(result.leftUpperArm).not.toBeNull()
      expect(result.leftUpperArm?.name).toBe('UpperArm:L')
    })

    it('matches prefix naming (L:Arm)', () => {
      const boneMap = createBoneMap(['L:Arm'])
      const result = findStandardBones(boneMap)

      expect(result.leftUpperArm).not.toBeNull()
      expect(result.leftUpperArm?.name).toBe('L:Arm')
    })
  })

  describe('Right Upper Arm', () => {
    it('matches PascalCase naming (RightUpperArm)', () => {
      const boneMap = createBoneMap(['RightUpperArm'])
      const result = findStandardBones(boneMap)

      expect(result.rightUpperArm).not.toBeNull()
      expect(result.rightUpperArm?.name).toBe('RightUpperArm')
    })

    it('matches underscore suffix (Arm_R)', () => {
      const boneMap = createBoneMap(['Arm_R'])
      const result = findStandardBones(boneMap)

      expect(result.rightUpperArm).not.toBeNull()
      expect(result.rightUpperArm?.name).toBe('Arm_R')
    })

    it('matches dot suffix lowercase (arm.r)', () => {
      const boneMap = createBoneMap(['arm.r'])
      const result = findStandardBones(boneMap)

      expect(result.rightUpperArm).not.toBeNull()
      expect(result.rightUpperArm?.name).toBe('arm.r')
    })

    it('matches colon suffix (Arm:R)', () => {
      const boneMap = createBoneMap(['Arm:R'])
      const result = findStandardBones(boneMap)

      expect(result.rightUpperArm).not.toBeNull()
      expect(result.rightUpperArm?.name).toBe('Arm:R')
    })

    it('matches prefix with underscore (right_upper_arm)', () => {
      const boneMap = createBoneMap(['right_upper_arm'])
      const result = findStandardBones(boneMap)

      expect(result.rightUpperArm).not.toBeNull()
      expect(result.rightUpperArm?.name).toBe('right_upper_arm')
    })

    it('matches prefix with space (right upper arm)', () => {
      const boneMap = createBoneMap(['right upper arm'])
      const result = findStandardBones(boneMap)

      expect(result.rightUpperArm).not.toBeNull()
      expect(result.rightUpperArm?.name).toBe('right upper arm')
    })

    it('matches prefix with hyphen (right-upper-arm)', () => {
      const boneMap = createBoneMap(['right-upper-arm'])
      const result = findStandardBones(boneMap)

      expect(result.rightUpperArm).not.toBeNull()
      expect(result.rightUpperArm?.name).toBe('right-upper-arm')
    })

    it('matches Mixamo pattern with colon (mixamorig:RightArm)', () => {
      const boneMap = createBoneMap(['mixamorig:RightArm'])
      const result = findStandardBones(boneMap)

      expect(result.rightUpperArm).not.toBeNull()
      expect(result.rightUpperArm?.name).toBe('mixamorig:RightArm')
    })

    it('matches Mixamo pattern with dot (mixamorig.RightArm)', () => {
      const boneMap = createBoneMap(['mixamorig.RightArm'])
      const result = findStandardBones(boneMap)

      expect(result.rightUpperArm).not.toBeNull()
      expect(result.rightUpperArm?.name).toBe('mixamorig.RightArm')
    })

    it('matches Mixamo pattern without separator (mixamorigRightArm)', () => {
      const boneMap = createBoneMap(['mixamorigRightArm'])
      const result = findStandardBones(boneMap)

      expect(result.rightUpperArm).not.toBeNull()
      expect(result.rightUpperArm?.name).toBe('mixamorigRightArm')
    })

    it('matches upper arm suffix (UpperArm:R)', () => {
      const boneMap = createBoneMap(['UpperArm:R'])
      const result = findStandardBones(boneMap)

      expect(result.rightUpperArm).not.toBeNull()
      expect(result.rightUpperArm?.name).toBe('UpperArm:R')
    })

    it('matches prefix naming (R:Arm)', () => {
      const boneMap = createBoneMap(['R:Arm'])
      const result = findStandardBones(boneMap)

      expect(result.rightUpperArm).not.toBeNull()
      expect(result.rightUpperArm?.name).toBe('R:Arm')
    })
  })
})

describe('findStandardBones - Multiple Bones', () => {
  it('correctly identifies both left and right shoulders simultaneously', () => {
    const boneMap = createBoneMap(['LeftShoulder', 'RightShoulder'])
    const result = findStandardBones(boneMap)

    expect(result.leftShoulder).not.toBeNull()
    expect(result.leftShoulder?.name).toBe('LeftShoulder')
    expect(result.rightShoulder).not.toBeNull()
    expect(result.rightShoulder?.name).toBe('RightShoulder')
  })

  it('correctly identifies both left and right upper arms simultaneously', () => {
    const boneMap = createBoneMap(['left_upper_arm', 'right_upper_arm'])
    const result = findStandardBones(boneMap)

    expect(result.leftUpperArm).not.toBeNull()
    expect(result.leftUpperArm?.name).toBe('left_upper_arm')
    expect(result.rightUpperArm).not.toBeNull()
    expect(result.rightUpperArm?.name).toBe('right_upper_arm')
  })

  it('handles mixed naming conventions', () => {
    const boneMap = createBoneMap([
      'Shoulder_L',
      'RightShoulder',
      'arm.l',
      'mixamorig:RightArm',
    ])
    const result = findStandardBones(boneMap)

    expect(result.leftShoulder).not.toBeNull()
    expect(result.leftShoulder?.name).toBe('Shoulder_L')
    expect(result.rightShoulder).not.toBeNull()
    expect(result.rightShoulder?.name).toBe('RightShoulder')
    expect(result.leftUpperArm).not.toBeNull()
    expect(result.leftUpperArm?.name).toBe('arm.l')
    expect(result.rightUpperArm).not.toBeNull()
    expect(result.rightUpperArm?.name).toBe('mixamorig:RightArm')
  })

  it('returns null for bones that are not found', () => {
    const boneMap = createBoneMap(['LeftShoulder'])
    const result = findStandardBones(boneMap)

    expect(result.leftShoulder).not.toBeNull()
    expect(result.rightShoulder).toBeNull()
    expect(result.leftUpperArm).toBeNull()
    expect(result.rightUpperArm).toBeNull()
    expect(result.hips).toBeNull()
  })
})

describe('findStandardBones - Case Insensitivity', () => {
  it('is case insensitive for bone name matching', () => {
    const boneMap = createBoneMap([
      'LEFTSHOULDER',
      'rightshoulder',
      'LeFtUpPeRaRm',
      'RIGHTUPPERARM',
    ])
    const result = findStandardBones(boneMap)

    expect(result.leftShoulder).not.toBeNull()
    expect(result.rightShoulder).not.toBeNull()
    expect(result.leftUpperArm).not.toBeNull()
    expect(result.rightUpperArm).not.toBeNull()
  })
})

describe('analyzeSkeleton', () => {
  it('returns no skeleton for empty object', () => {
    const obj = new THREE.Object3D()
    const result = analyzeSkeleton(obj)

    expect(result.hasSkeleton).toBe(false)
    expect(result.allBones).toHaveLength(0)
    expect(result.skinnedMeshes).toHaveLength(0)
    expect(result.rootBone).toBeNull()
    expect(result.detectedRigType).toBe('unknown')
  })

  it('detects skeleton from SkinnedMesh', () => {
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.MeshBasicMaterial()
    const mesh = new THREE.SkinnedMesh(geometry, material)

    const bone1 = createBone('Root')
    const bone2 = createBone('LeftShoulder')
    bone1.add(bone2)

    const skeleton = new THREE.Skeleton([bone1, bone2])
    mesh.bind(skeleton)

    const result = analyzeSkeleton(mesh)

    expect(result.hasSkeleton).toBe(true)
    expect(result.allBones.length).toBeGreaterThan(0)
    expect(result.skinnedMeshes).toHaveLength(1)
    expect(result.rootBone).not.toBeNull()
  })

  it('detects Mixamo rig type', () => {
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.MeshBasicMaterial()
    const mesh = new THREE.SkinnedMesh(geometry, material)

    const bone1 = createBone('mixamorig:Hips')
    const bone2 = createBone('mixamorig:Spine')
    bone1.add(bone2)

    const skeleton = new THREE.Skeleton([bone1, bone2])
    mesh.bind(skeleton)

    const result = analyzeSkeleton(mesh)

    expect(result.detectedRigType).toBe('mixamo')
  })

  it('detects Unity humanoid rig type', () => {
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.MeshBasicMaterial()
    const mesh = new THREE.SkinnedMesh(geometry, material)

    const bone1 = createBone('Hips')
    const bone2 = createBone('LeftUpperArm')
    const bone3 = createBone('RightUpperArm')
    bone1.add(bone2)
    bone1.add(bone3)

    const skeleton = new THREE.Skeleton([bone1, bone2, bone3])
    mesh.bind(skeleton)

    const result = analyzeSkeleton(mesh)

    expect(result.detectedRigType).toBe('unity-humanoid')
  })

  it('stores bones with lowercase keys in bonesByName map', () => {
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.MeshBasicMaterial()
    const mesh = new THREE.SkinnedMesh(geometry, material)

    const bone1 = createBone('LeftShoulder')
    const bone2 = createBone('RightShoulder')
    bone1.add(bone2)

    const skeleton = new THREE.Skeleton([bone1, bone2])
    mesh.bind(skeleton)

    const result = analyzeSkeleton(mesh)

    expect(result.bonesByName.has('leftshoulder')).toBe(true)
    expect(result.bonesByName.has('rightshoulder')).toBe(true)
    expect(result.bonesByName.has('LeftShoulder')).toBe(false)
  })
})
