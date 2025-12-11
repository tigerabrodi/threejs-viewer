import * as THREE from 'three'

export interface ModelInfo {
  // Geometry stats
  vertexCount: number
  triangleCount: number
  meshCount: number

  // Bounding box
  dimensions: {
    width: number
    height: number
    depth: number
  }
  boundingBox: {
    min: { x: number; y: number; z: number }
    max: { x: number; y: number; z: number }
  }
  center: { x: number; y: number; z: number }

  // Materials
  materialCount: number
  materials: MaterialInfo[]

  // Skeleton
  hasSkeleton: boolean
  boneCount: number
  rigType: string | null

  // Textures
  textureCount: number
  textures: TextureInfo[]

  // Animations
  hasAnimations: boolean
  animationCount: number
  animations: AnimationInfo[]
}

export interface MaterialInfo {
  name: string
  type: string
  hasTextures: boolean
  textureTypes: string[]
}

export interface TextureInfo {
  name: string
  width: number
  height: number
  format: string
}

export interface AnimationInfo {
  name: string
  duration: number
  trackCount: number
}

export function analyzeModel(scene: THREE.Group): ModelInfo {
  let vertexCount = 0
  let triangleCount = 0
  let meshCount = 0
  let boneCount = 0
  let hasSkeleton = false
  let rigType: string | null = null

  const materialsSet = new Set<THREE.Material>()
  const texturesMap = new Map<string, THREE.Texture>()
  const boneNames: string[] = []

  // Traverse the scene
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshCount++

      const geometry = child.geometry
      if (geometry.attributes.position) {
        vertexCount += geometry.attributes.position.count
      }
      if (geometry.index) {
        triangleCount += geometry.index.count / 3
      } else if (geometry.attributes.position) {
        triangleCount += geometry.attributes.position.count / 3
      }

      // Collect materials
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material]
      materials.forEach((mat) => materialsSet.add(mat))
    }

    if (child instanceof THREE.SkinnedMesh) {
      hasSkeleton = true
      if (child.skeleton) {
        child.skeleton.bones.forEach((bone) => {
          if (!boneNames.includes(bone.name)) {
            boneNames.push(bone.name)
            boneCount++
          }
        })
      }
    }

    if (child instanceof THREE.Bone) {
      if (!boneNames.includes(child.name)) {
        boneNames.push(child.name)
        boneCount++
      }
      hasSkeleton = true
    }
  })

  // Detect rig type from bone names
  rigType = detectRigType(boneNames)

  // Process materials and collect textures
  const materials: MaterialInfo[] = []
  materialsSet.forEach((mat) => {
    const textureTypes: string[] = []

    if (mat instanceof THREE.MeshStandardMaterial) {
      collectTexture(mat.map, 'map', texturesMap)
      collectTexture(mat.normalMap, 'normalMap', texturesMap)
      collectTexture(mat.roughnessMap, 'roughnessMap', texturesMap)
      collectTexture(mat.metalnessMap, 'metalnessMap', texturesMap)
      collectTexture(mat.aoMap, 'aoMap', texturesMap)
      collectTexture(mat.emissiveMap, 'emissiveMap', texturesMap)

      if (mat.map) textureTypes.push('diffuse')
      if (mat.normalMap) textureTypes.push('normal')
      if (mat.roughnessMap) textureTypes.push('roughness')
      if (mat.metalnessMap) textureTypes.push('metalness')
      if (mat.aoMap) textureTypes.push('ao')
      if (mat.emissiveMap) textureTypes.push('emissive')
    }

    materials.push({
      name: mat.name || 'Unnamed',
      type: mat.type,
      hasTextures: textureTypes.length > 0,
      textureTypes,
    })
  })

  // Process textures
  const textures: TextureInfo[] = []
  texturesMap.forEach((tex, name) => {
    const image = tex.image as HTMLImageElement | HTMLCanvasElement | undefined
    textures.push({
      name: name || tex.name || 'Unnamed',
      width: image?.width || 0,
      height: image?.height || 0,
      format: tex.format ? getTextureFormatName(tex.format) : 'Unknown',
    })
  })

  // Calculate bounding box
  const box = new THREE.Box3().setFromObject(scene)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  // Get animations
  const animations: AnimationInfo[] = []
  if (scene.animations && scene.animations.length > 0) {
    scene.animations.forEach((clip) => {
      animations.push({
        name: clip.name || 'Unnamed',
        duration: clip.duration,
        trackCount: clip.tracks.length,
      })
    })
  }

  return {
    vertexCount,
    triangleCount: Math.floor(triangleCount),
    meshCount,
    dimensions: {
      width: size.x,
      height: size.y,
      depth: size.z,
    },
    boundingBox: {
      min: { x: box.min.x, y: box.min.y, z: box.min.z },
      max: { x: box.max.x, y: box.max.y, z: box.max.z },
    },
    center: { x: center.x, y: center.y, z: center.z },
    materialCount: materials.length,
    materials,
    hasSkeleton,
    boneCount,
    rigType,
    textureCount: textures.length,
    textures,
    hasAnimations: animations.length > 0,
    animationCount: animations.length,
    animations,
  }
}

function collectTexture(
  tex: THREE.Texture | null,
  _type: string,
  map: Map<string, THREE.Texture>
) {
  if (tex && !map.has(tex.uuid)) {
    map.set(tex.uuid, tex)
  }
}

function detectRigType(boneNames: string[]): string | null {
  const lowerNames = boneNames.map((n) => n.toLowerCase())

  if (lowerNames.some((n) => n.startsWith('mixamorig'))) {
    return 'Mixamo'
  }
  if (lowerNames.some((n) => n.startsWith('bip'))) {
    return 'Biped/3ds Max'
  }
  if (
    lowerNames.some(
      (n) =>
        n.includes('leftupperarm') ||
        n.includes('rightupperarm') ||
        n.includes('leftupperleg')
    )
  ) {
    return 'Unity Humanoid'
  }
  if (boneNames.length > 0) {
    return 'Custom'
  }
  return null
}

function getTextureFormatName(format: number): string {
  const formats: Record<number, string> = {
    [THREE.RGBAFormat]: 'RGBA',
    [THREE.RGBFormat]: 'RGB',
    [THREE.RedFormat]: 'Red',
    [THREE.AlphaFormat]: 'Alpha',
  }
  return formats[format] || 'Unknown'
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}
