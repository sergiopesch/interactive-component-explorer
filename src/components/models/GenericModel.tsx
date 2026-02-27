'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GenericModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* IC chip body */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.8, 0.25, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Orientation dot */}
      <mesh position={[-0.28, 0.285, -0.15]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Top label area */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.6, 0.01, 0.3]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Left pins */}
      {[-0.25, -0.08, 0.08, 0.25].map((z, i) => (
        <mesh key={`l${i}`} position={[-0.42, -0.15, z]}>
          <boxGeometry args={[0.15, 0.02, 0.05]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Right pins */}
      {[-0.25, -0.08, 0.08, 0.25].map((z, i) => (
        <mesh key={`r${i}`} position={[0.42, -0.15, z]}>
          <boxGeometry args={[0.15, 0.02, 0.05]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
