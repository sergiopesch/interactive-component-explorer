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

      {/* Inner disc (vibrating element) */}
      <mesh ref={discRef} position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 24]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Center dot */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Positive wire */}
      <mesh position={[-0.25, -0.35, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#cc3333" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Negative wire */}
      <mesh position={[0.25, -0.35, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}
