import { create } from 'zustand'

interface UIStore {
  showAxes: boolean
  showGrid: boolean
  showForwardArrow: boolean
  showBoundingBox: boolean
  showLocalAxes: boolean
  showPivot: boolean
  showDirectionLabels: boolean
  showGroundPlane: boolean
  showCompass: boolean
  toggleOverlay: (key: keyof Omit<UIStore, 'toggleOverlay'>) => void
}

export const useUIStore = create<UIStore>((set) => ({
  showAxes: true,
  showGrid: true,
  showForwardArrow: true,
  showBoundingBox: true,
  showLocalAxes: false,
  showPivot: true,
  showDirectionLabels: true,
  showGroundPlane: false,
  showCompass: true,

  toggleOverlay: (key) => {
    set((state) => ({ [key]: !state[key] }))
  },
}))
