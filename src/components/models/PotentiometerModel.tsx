'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PotentiometerModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main body (disc) */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.25, 24]} />
        <meshStandardMaterial color="#2a5298" metalness={0.2} roughness={0.7} />
      </mesh>

      {/* Shaft housing */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.25, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Knob shaft */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
        <meshStandardMaterial color="#d4d4d4" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Shaft flat (D-shape indicator) */}
      <mesh position={[0.04, 0.65, 0]}>
        <boxGeometry args={[0.03, 0.2, 0.06]} />
        <meshStandardMaterial color="#999999" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Bottom plate */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.04, 24]} />
        <meshStandardMaterial color="#444444" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Pin 1 (left) */}
      <mesh position={[-0.3, -0.45, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Pin 2 (center / wiper) */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Pin 3 (right) */}
      <mesh position={[0.3, -0.45, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
