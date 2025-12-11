import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useModelStore } from '../../store'
import { useModelLoader } from '../hooks/useModelLoader'
import { useValidationStore } from '../../store'
import { ModelValidator } from '../../core/validation'
import {
  calculateNormalization,
  NORMALIZATION_CONFIG,
  type NormalizationResult,
} from '../../core/model-normalizer'

export function ModelViewer() {
  const file = useModelStore((state) => state.file)
  const modelName = useModelStore((state) => state.modelName)
  const setScene = useModelStore((state) => state.setScene)
  const setLoading = useModelStore((state) => state.setLoading)
  const setError = useModelStore((state) => state.setError)
  const setNormalization = useModelStore((state) => state.setNormalization)
  const runValidation = useValidationStore((state) => state.runValidation)

  const { camera, controls, invalidate } = useThree()
  const { scene, isLoading, error } = useModelLoader(file)
  const validatorRef = useRef(new ModelValidator())

  // Calculate normalization parameters
  const normalization = useMemo<NormalizationResult | null>(() => {
    if (!scene) return null
    return calculateNormalization(scene, NORMALIZATION_CONFIG.TARGET_SIZE)
  }, [scene])

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])

  useEffect(() => {
    if (error) {
      setError(error)
    }
  }, [error, setError])

  useEffect(() => {
    if (scene && normalization) {
      console.log('[ModelViewer] Scene received, setting up...')
      console.log('[ModelViewer] Original dimensions:', normalization.originalDimensions)
      console.log('[ModelViewer] Scale factor:', normalization.scaleFactor)

      setScene(scene)
      setNormalization(normalization)

      // Camera targets origin (where normalized model is centered)
      const targetPoint = new THREE.Vector3(0, 0, 0)

      // Calculate camera distance based on NORMALIZED size (target size)
      // This gives consistent camera distance for all models
      const normalizedMaxDim = normalization.originalDimensions.maxDimension * normalization.scaleFactor
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180)
      const distance = (normalizedMaxDim / 2) / Math.tan(fov / 2) * 1.5

      // Clamp distance to reasonable bounds
      const clampedDistance = Math.max(
        NORMALIZATION_CONFIG.MIN_CAMERA_DISTANCE,
        Math.min(NORMALIZATION_CONFIG.MAX_CAMERA_DISTANCE, distance)
      )

      camera.position.set(
        clampedDistance * 0.7,
        clampedDistance * 0.5,
        clampedDistance * 0.7
      )
      camera.lookAt(targetPoint)
      camera.updateProjectionMatrix()

      // Update orbit controls target
      if (controls && 'target' in controls) {
        (controls as any).target.copy(targetPoint)
        ;(controls as any).update()
      }

      // Force R3F to render
      invalidate()

      // Run validation on ORIGINAL scene (not scaled)
      const report = validatorRef.current.validate(scene, modelName)
      runValidation(report.checks)

      console.log('[ModelViewer] Setup complete, camera distance:', clampedDistance)
    }
  }, [scene, normalization, modelName, setScene, setNormalization, runValidation, camera, controls, invalidate])

  if (!scene || !normalization) {
    return null
  }

  // Apply normalization: first center, then scale
  // The scale is applied at the outer group level for display only
  // Original scene data remains unchanged for validation
  return (
    <group scale={normalization.scaleFactor}>
      <group position={normalization.centerOffset}>
        <primitive object={scene} />
      </group>
    </group>
  )
}
