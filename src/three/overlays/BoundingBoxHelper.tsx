import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface BoundingBoxHelperProps {
  target: THREE.Object3D | null
  color?: string
}

export function BoundingBoxHelper({ target, color = '#ffff00' }: BoundingBoxHelperProps) {
  const boxHelperRef = useRef<THREE.BoxHelper | null>(null)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!target || !groupRef.current) return

    const boxHelper = new THREE.BoxHelper(target, color)
    boxHelperRef.current = boxHelper
    groupRef.current.add(boxHelper)

    return () => {
      if (boxHelperRef.current && groupRef.current) {
        groupRef.current.remove(boxHelperRef.current)
        boxHelperRef.current.dispose()
      }
    }
  }, [target, color])

  useFrame(() => {
    if (boxHelperRef.current && target) {
      boxHelperRef.current.update()
    }
  })

  if (!target) return null

  return <group ref={groupRef} />
}
