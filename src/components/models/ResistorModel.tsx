'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 220Ω ±5%: red, red, brown, gold
const BAND_COLORS = ['#cc3333', '#cc3333', '#993300', '#d4af37']

export default function ResistorModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 6]}>
      {/* Ceramic body — slightly wider in center like a real axial resistor */}
      <mesh>
        <capsuleGeometry args={[0.28, 1.0, 8, 16]} />
        <meshStandardMaterial color="#d2b48c" roughness={0.7} />
      </mesh>

      {/* Color bands — positioned along body axis (Y), wrapping in XZ plane */}
      {BAND_COLORS.map((color, i) => {
        // First 3 bands grouped together, 4th (tolerance) has a gap
        const y = i < 3 ? -0.25 + i * 0.2 : 0.35
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.285, 0.025, 8, 24]} />
            <meshStandardMaterial color={color} />
          </mesh>
        )
      })}

      {/* Axial wire leads */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.0, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.0, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
