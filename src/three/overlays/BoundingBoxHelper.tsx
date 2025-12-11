import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

interface BoundingBoxHelperProps {
  target: THREE.Object3D | null
  scaleFactor?: number // Scale factor applied to the model for display
  color?: string
}

export function BoundingBoxHelper({
  target,
  scaleFactor = 1,
  color = '#ffff00',
}: BoundingBoxHelperProps) {
  const boxHelperRef = useRef<THREE.BoxHelper | null>(null)
  const groupRef = useRef<THREE.Group>(null)

  // Calculate bounding box dimensions from ORIGINAL model (not scaled)
  const dimensions = useMemo(() => {
    if (!target) return null

    const box = new THREE.Box3().setFromObject(target)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    return {
      // Original dimensions (for display in labels)
      width: size.x,
      height: size.y,
      depth: size.z,
      // Scaled positions (for rendering the helper in normalized space)
      center: center.clone().multiplyScalar(scaleFactor),
      min: box.min.clone().multiplyScalar(scaleFactor),
      max: box.max.clone().multiplyScalar(scaleFactor),
    }
  }, [target, scaleFactor])

  useEffect(() => {
    if (!target || !groupRef.current) return

    // Create a temporary scaled clone for the box helper
    // so it renders in the correct position in normalized space
    const tempGroup = new THREE.Group()
    tempGroup.add(target.clone())

    // Calculate center offset
    const box = new THREE.Box3().setFromObject(target)
    const center = box.getCenter(new THREE.Vector3())

    // Apply the same transforms as ModelViewer
    tempGroup.children[0].position.sub(center)
    tempGroup.scale.setScalar(scaleFactor)

    const boxHelper = new THREE.BoxHelper(tempGroup, color)
    boxHelperRef.current = boxHelper
    groupRef.current.add(boxHelper)

    return () => {
      if (boxHelperRef.current) {
        if (boxHelperRef.current.geometry) {
          boxHelperRef.current.geometry.dispose()
        }
        const material = boxHelperRef.current.material as THREE.Material
        if (material) {
          material.dispose()
        }
        if (groupRef.current) {
          groupRef.current.remove(boxHelperRef.current)
        }
        boxHelperRef.current = null
      }
      // Dispose temp group
      tempGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose())
          } else {
            child.material?.dispose()
          }
        }
      })
    }
  }, [target, scaleFactor, color])

  useFrame(() => {
    if (boxHelperRef.current) {
      boxHelperRef.current.update()
    }
  })

  if (!target || !dimensions) return null

  // Font size based on scaled dimensions for consistent appearance
  const scaledHeight = dimensions.height * scaleFactor
  const fontSize = Math.max(0.08, Math.min(scaledHeight * 0.08, 0.15))
  const labelOffset = fontSize * 0.5

  // Calculate display positions centered at origin (matching normalized model)
  const displayCenter = new THREE.Vector3(0, 0, 0)
  const halfWidth = (dimensions.width * scaleFactor) / 2
  const halfHeight = (dimensions.height * scaleFactor) / 2
  const halfDepth = (dimensions.depth * scaleFactor) / 2

  return (
    <group ref={groupRef}>
      {/* Main dimension label showing ORIGINAL dimensions */}
      <Text
        position={[displayCenter.x, halfHeight + labelOffset, displayCenter.z]}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={fontSize * 0.05}
        outlineColor="#000000"
      >
        {`${dimensions.width.toFixed(2)} x ${dimensions.height.toFixed(2)} x ${dimensions.depth.toFixed(2)}`}
      </Text>

      {/* Width label (X axis) */}
      <Text
        position={[displayCenter.x, -halfHeight - labelOffset, halfDepth + labelOffset]}
        fontSize={fontSize * 0.8}
        color={color}
        anchorX="center"
        anchorY="top"
        outlineWidth={fontSize * 0.04}
        outlineColor="#000000"
      >
        {`W: ${dimensions.width.toFixed(2)}`}
      </Text>

      {/* Height label (Y axis) */}
      <Text
        position={[halfWidth + labelOffset, displayCenter.y, halfDepth + labelOffset]}
        fontSize={fontSize * 0.8}
        color={color}
        anchorX="left"
        anchorY="middle"
        outlineWidth={fontSize * 0.04}
        outlineColor="#000000"
      >
        {`H: ${dimensions.height.toFixed(2)}`}
      </Text>

      {/* Depth label (Z axis) */}
      <Text
        position={[halfWidth + labelOffset, -halfHeight - labelOffset, displayCenter.z]}
        fontSize={fontSize * 0.8}
        color={color}
        anchorX="left"
        anchorY="top"
        outlineWidth={fontSize * 0.04}
        outlineColor="#000000"
      >
        {`D: ${dimensions.depth.toFixed(2)}`}
      </Text>
    </group>
  )
}
