import { useEffect } from 'react'
import { Scene } from './three/components/Scene'
import { CameraController } from './three/components/CameraController'
import { ModelViewer } from './three/components/ModelViewer'
import { Overlays } from './three/overlays'
import { AppLayout } from './ui/layout/AppLayout'
import { Sidebar } from './ui/layout/Sidebar'
import { useModelStore } from './store'
import './App.css'

function App() {
  const reset = useModelStore((state) => state.reset)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key - Clear model
      if (e.key === 'Escape') {
        reset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [reset])

  return (
    <AppLayout
      viewport={
        <Scene>
          <CameraController />
          <Overlays />
          <ModelViewer />
        </Scene>
      }
      sidebar={<Sidebar />}
    />
  )
}

export default App
