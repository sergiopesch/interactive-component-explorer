'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BAND_COLORS = ['#8b1f1f', '#8b1f1f', '#5b3418', '#c8a23a']

export default function ResistorModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 6]}>
      <mesh>
        <capsuleGeometry args={[0.2, 0.95, 10, 24]} />
        <meshStandardMaterial color="#c49a6c" roughness={0.75} />
      </mesh>

      {BAND_COLORS.map((color, i) => (
        <mesh key={color} position={[0, -0.3 + i * 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.205, 0.02, 10, 28]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}

      {[-1.1, 1.1].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.1, 10]} />
          <meshStandardMaterial color="#b9bec5" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
