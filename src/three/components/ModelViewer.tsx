import { useEffect, useRef } from 'react'
import { useModelStore } from '../../store'
import { useModelLoader } from '../hooks/useModelLoader'
import { useValidationStore } from '../../store'
import { ModelValidator } from '../../core/validation'

export function ModelViewer() {
  const file = useModelStore((state) => state.file)
  const modelName = useModelStore((state) => state.modelName)
  const setScene = useModelStore((state) => state.setScene)
  const setLoading = useModelStore((state) => state.setLoading)
  const setError = useModelStore((state) => state.setError)
  const runValidation = useValidationStore((state) => state.runValidation)

  const { scene, isLoading, error } = useModelLoader(file)
  const validatorRef = useRef(new ModelValidator())

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])

  useEffect(() => {
    if (error) {
      setError(error)
    }
  }, [error, setError])

  useEffect(() => {
    if (scene) {
      setScene(scene)

      // Run validation
      const report = validatorRef.current.validate(scene, modelName)
      runValidation(report.checks)
    }
  }, [scene, modelName, setScene, runValidation])

  if (!scene) {
    return null
  }

  return <primitive object={scene} />
}
