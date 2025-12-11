import { create } from 'zustand'
import type { ValidationCheckResult } from '../core/types'

interface ValidationStore {
  results: ValidationCheckResult[]
  isValidating: boolean
  runValidation: (results: ValidationCheckResult[]) => void
  clearResults: () => void
}

export const useValidationStore = create<ValidationStore>((set) => ({
  results: [],
  isValidating: false,

  runValidation: (results) => {
    set({ results, isValidating: false })
  },

  clearResults: () => {
    set({ results: [], isValidating: false })
  },
}))
