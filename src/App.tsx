import { Scene } from './three/components/Scene'
import { CameraController } from './three/components/CameraController'
import { ModelViewer } from './three/components/ModelViewer'
import { Overlays } from './three/overlays'
import { AppLayout } from './ui/layout/AppLayout'
import { Sidebar } from './ui/layout/Sidebar'
import { DropZone } from './ui/common/DropZone'
import './App.css'

function App() {
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
      statusBar={<DropZone />}
    />
  )
}

export default App
