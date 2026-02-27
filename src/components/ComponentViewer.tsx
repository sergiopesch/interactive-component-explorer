'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
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
    default:
      return <GenericModel />
  }
}

export default function ComponentViewer({ componentId, powered }: ComponentViewerProps) {
  return (
    <div className="w-full h-64 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 1, 3.5], fov: 40 }}>
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
    </div>
  )
}
