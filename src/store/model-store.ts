import { create } from 'zustand'
import type * as THREE from 'three'

interface ModelStore {
  file: File | null
  modelName: string
  scene: THREE.Group | null
  isLoading: boolean
  error: string | null
  setFile: (file: File | null) => void
  setScene: (scene: THREE.Group | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useModelStore = create<ModelStore>((set) => ({
  file: null,
  modelName: '',
  scene: null,
  isLoading: false,
  error: null,

  setFile: (file) => {
    set({
      file,
      modelName: file?.name.replace(/\.[^/.]+$/, '') || '',
      error: null,
    })
  },

  setScene: (scene) => {
    set({ scene })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  setError: (error) => {
    set({ error, isLoading: false })
  },

  reset: () => {
    set({
      file: null,
      modelName: '',
      scene: null,
      isLoading: false,
      error: null,
    })
  },
}))
