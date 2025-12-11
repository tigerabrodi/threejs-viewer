import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

interface UseModelLoaderReturn {
  scene: THREE.Group | null
  isLoading: boolean
  error: string | null
}

export function useModelLoader(file: File | null): UseModelLoaderReturn {
  const [scene, setScene] = useState<THREE.Group | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setScene(null)
      setError(null)
      return
    }

    let objectUrl: string | null = null
    let isCancelled = false

    const loadModel = async () => {
      setIsLoading(true)
      setError(null)
      setScene(null)

      try {
        objectUrl = URL.createObjectURL(file)
        const extension = file.name.split('.').pop()?.toLowerCase()

        let loadedScene: THREE.Group

        if (extension === 'glb' || extension === 'gltf') {
          const loader = new GLTFLoader()
          const gltf = await loader.loadAsync(objectUrl)
          loadedScene = gltf.scene
        } else if (extension === 'fbx') {
          const loader = new FBXLoader()
          loadedScene = await loader.loadAsync(objectUrl)
        } else {
          throw new Error(`Unsupported format: ${extension}`)
        }

        if (!isCancelled) {
          setScene(loadedScene)
          setIsLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load model')
          setIsLoading(false)
        }
      }
    }

    loadModel()

    return () => {
      isCancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [file])

  return { scene, isLoading, error }
}
