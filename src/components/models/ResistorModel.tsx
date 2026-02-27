'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BAND_COLORS = ['#cc3333', '#cc3333', '#993300', '#d4af37']

export default function ResistorModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.35, 1.4, 8, 16]} />
        <meshStandardMaterial color="#d2b48c" />
      </mesh>

      {/* Color bands */}
      {BAND_COLORS.map((color, i) => (
        <mesh key={i} position={[-0.5 + i * 0.33, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.35, 0.02, 8, 24]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}

      {/* Wire legs */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
