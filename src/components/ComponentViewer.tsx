'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, Component, useRef, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import ResistorModel from './models/ResistorModel'
import LEDModel from './models/LEDModel'
import ButtonModel from './models/ButtonModel'
import SpeakerModel from './models/SpeakerModel'
import CapacitorModel from './models/CapacitorModel'
import PotentiometerModel from './models/PotentiometerModel'
import DiodeModel from './models/DiodeModel'
import TransistorModel from './models/TransistorModel'
import GenericModel from './models/GenericModel'

interface ComponentViewerProps {
  componentId: string
  powered: boolean
}

// Error boundary to catch Three.js / WebGL context errors gracefully
interface ErrorBoundaryState {
  hasError: boolean
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-64 flex items-center justify-center text-black/40 dark:text-white/40">
          <div className="text-center px-4">
            <p className="text-sm">3D preview unavailable</p>
            <p className="text-xs mt-1 text-black/25 dark:text-white/25">
              Try scrolling — only nearby models load to save resources
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function ModelSelector({ componentId, powered }: ComponentViewerProps) {
  switch (componentId) {
    case 'resistor':
      return <ResistorModel />
    case 'led':
      return <LEDModel powered={powered} />
    case 'button':
      return <ButtonModel powered={powered} />
    case 'speaker':
      return <SpeakerModel powered={powered} />
    case 'capacitor':
      return <CapacitorModel />
    case 'potentiometer':
      return <PotentiometerModel />
    case 'diode':
      return <DiodeModel />
    case 'transistor':
      return <TransistorModel />
    case 'servo':
      return <GenericModel variant="servo" powered={powered} />
    case 'dc-motor':
      return <GenericModel variant="dc-motor" powered={powered} />
    case 'photoresistor':
      return <GenericModel variant="photoresistor" />
    case 'temp-sensor':
      return <GenericModel variant="temp-sensor" />
    case 'ultrasonic':
      return <GenericModel variant="ultrasonic" />
    case 'lcd':
      return <GenericModel variant="lcd" />
    case 'relay':
      return <GenericModel variant="relay" powered={powered} />
    case 'rgb-led':
      return <GenericModel variant="rgb-led" powered={powered} />
    default:
      return <GenericModel />
  }
}

export default function ComponentViewer({ componentId, powered }: ComponentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Lazy-render the Canvas only when visible in the viewport.
  // Browsers limit WebGL contexts to ~8-16; rendering 17+ canvases
  // simultaneously when browsing all components would crash.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { rootMargin: '200px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full h-64 cursor-grab active:cursor-grabbing">
      {isVisible ? (
        <CanvasErrorBoundary>
          <Canvas
            camera={{ position: [0, 1, 3.5], fov: 40 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, powerPreference: 'low-power' }}
            performance={{ min: 0.5 }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <directionalLight position={[-3, 2, -3]} intensity={0.3} />
            <Suspense fallback={null}>
              <ModelSelector componentId={componentId} powered={powered} />
            </Suspense>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.5}
            />
          </Canvas>
        </CanvasErrorBoundary>
      ) : (
        <div className="w-full h-64 flex items-center justify-center text-black/20 dark:text-white/20">
          <p className="text-sm">Scroll to load 3D model</p>
        </div>
      )}
    </div>
  )
}
