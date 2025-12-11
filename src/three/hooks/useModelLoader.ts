import { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

interface UseModelLoaderReturn {
  scene: THREE.Group | null
  isLoading: boolean
  error: string | null
}

export function useModelLoader(file: File | null): UseModelLoaderReturn {
  const [scene, setScene] = useState<THREE.Group | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track URL in ref to handle cleanup properly without race conditions
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!file) {
      setScene(null)
      setError(null)
      setIsLoading(false)
      return
    }

    let isCancelled = false

    // Clean up previous URL if it exists
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }

    const loadModel = async () => {
      setIsLoading(true)
      setError(null)
      setScene(null)

      console.log('[useModelLoader] Starting load for:', file.name)

      try {
        const objectUrl = URL.createObjectURL(file)
        urlRef.current = objectUrl

        const extension = file.name.split('.').pop()?.toLowerCase()

        let loadedScene: THREE.Group

        if (extension === 'glb' || extension === 'gltf') {
          console.log('[useModelLoader] Using GLTFLoader...')
          const loader = new GLTFLoader()

          // Set up meshopt decoder for compressed models
          loader.setMeshoptDecoder(MeshoptDecoder)

          // Set up DRACO decoder for Draco-compressed models
          const dracoLoader = new DRACOLoader()
          dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
          loader.setDRACOLoader(dracoLoader)

          const gltf = await loader.loadAsync(objectUrl)
          loadedScene = gltf.scene
        } else if (extension === 'fbx') {
          console.log('[useModelLoader] Using FBXLoader...')
          const loader = new FBXLoader()
          loadedScene = await loader.loadAsync(objectUrl)
        } else {
          throw new Error(`Unsupported format: ${extension}`)
        }

        if (!isCancelled) {
          console.log('[useModelLoader] Model loaded successfully:', loadedScene)
          console.log('[useModelLoader] Scene children:', loadedScene.children.length)

          // Calculate and log bounding box for debugging
          const box = new THREE.Box3().setFromObject(loadedScene)
          const size = box.getSize(new THREE.Vector3())
          const center = box.getCenter(new THREE.Vector3())
          console.log('[useModelLoader] Bounds - size:', size, 'center:', center)

          setScene(loadedScene)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('[useModelLoader] Load error:', err)
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load model')
          setIsLoading(false)
        }
      }
    }

    loadModel()

    return () => {
      isCancelled = true
      // Don't revoke URL here - it might still be loading
      // URL will be cleaned up on next file change or unmount
    }
  }, [file])

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current)
        urlRef.current = null
      }
    }
  }, [])

  return { scene, isLoading, error }
}
