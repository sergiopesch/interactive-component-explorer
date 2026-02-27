'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function DiodeModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main cylindrical body */}
      <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.2, 0.8, 8, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      {/* Cathode band (silver stripe) */}
      <mesh position={[0.3, 0.15, 0]}>
        <torusGeometry args={[0.21, 0.025, 8, 24]} />
        <meshStandardMaterial color="#d4d4d4" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Second thin stripe */}
      <mesh position={[0.22, 0.15, 0]}>
        <torusGeometry args={[0.21, 0.015, 8, 24]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Anode leg (positive) */}
      <mesh position={[-0.6, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cathode leg (negative) */}
      <mesh position={[0.6, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
