'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CapacitorModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main cylindrical body */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 1.0, 24]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Silver top cap */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.05, 24]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Top scoring marks (K-shaped vent) */}
      <mesh position={[0, 0.88, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.03]} />
        <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Negative stripe */}
      <mesh position={[0.351, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.9, 0.15]} />
        <meshStandardMaterial color="#d4d4d4" side={THREE.DoubleSide} />
      </mesh>

      {/* Minus signs on stripe */}
      <mesh position={[0.355, 0.5, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.01, 0.02, 0.08]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      <mesh position={[0.355, 0.3, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.01, 0.02, 0.08]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Bottom rim */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.37, 0.37, 0.04, 24]} />
        <meshStandardMaterial color="#333333" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Positive leg (longer) */}
      <mesh position={[0.12, -0.7, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.9, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Negative leg (shorter) */}
      <mesh position={[-0.12, -0.6, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
