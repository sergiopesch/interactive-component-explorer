'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PotentiometerModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.22, 28]} />
        <meshStandardMaterial color="#1f4f9b" roughness={0.65} />
      </mesh>

      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.22, 20]} />
        <meshStandardMaterial color="#c3c8d0" metalness={0.75} roughness={0.22} />
      </mesh>

      <mesh position={[0, 0.53, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.28, 14]} />
        <meshStandardMaterial color="#d4d7dc" metalness={0.85} roughness={0.18} />
      </mesh>

      <mesh position={[0.04, 0.56, 0]}>
        <boxGeometry args={[0.025, 0.17, 0.12]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.3} />
      </mesh>

      {[-0.26, 0, 0.26].map((x) => (
        <mesh key={x} position={[x, -0.38, 0.03]}>
          <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
          <meshStandardMaterial color="#b7bcc3" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
