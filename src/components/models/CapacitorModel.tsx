'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CapacitorModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.95, 28]} />
        <meshStandardMaterial color="#161c3b" metalness={0.35} roughness={0.55} />
      </mesh>

      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.29, 0.29, 0.04, 28]} />
        <meshStandardMaterial color="#b9bec7" metalness={0.8} roughness={0.25} />
      </mesh>

      <mesh position={[0.281, 0.25, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.86, 0.11]} />
        <meshStandardMaterial color="#d8d9de" side={THREE.DoubleSide} />
      </mesh>

      {[-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, -0.62 + i * 0.08, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.78 + i * 0.12, 8]} />
          <meshStandardMaterial color="#b6bbc4" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
