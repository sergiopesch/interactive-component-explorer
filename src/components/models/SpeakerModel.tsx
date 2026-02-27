'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SpeakerModelProps {
  powered: boolean
}

export default function SpeakerModel({ powered }: SpeakerModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const discRef = useRef<THREE.Mesh>(null)
  const vibratePhase = useRef(0)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }

    // Vibration animation when powered
    if (powered) {
      vibratePhase.current += delta * 30
      if (discRef.current) {
        discRef.current.position.y = 0.22 + Math.sin(vibratePhase.current) * 0.02
      }
    } else {
      if (discRef.current) {
        discRef.current.position.y += (0.22 - discRef.current.position.y) * delta * 8
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Outer casing */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.3, 24]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Bottom plate (sealed) */}
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.71, 0.71, 0.02, 24]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Inner disc (vibrating piezo element - brass-colored) */}
      <mesh ref={discRef} position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 24]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Center ceramic disc */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 16]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </mesh>

      {/* Sound hole (dark recess on top) */}
      <mesh position={[0.35, 0.16, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Positive wire (red) */}
      <mesh position={[-0.25, -0.35, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#cc3333" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Negative wire (black) */}
      <mesh position={[0.25, -0.35, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}
