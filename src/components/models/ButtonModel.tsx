'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ButtonModelProps {
  powered: boolean
}

export default function ButtonModel({ powered }: ButtonModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const capRef = useRef<THREE.Mesh>(null)
  const pressOffset = useRef(0)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }

    // Smooth press animation
    const target = powered ? -0.12 : 0
    pressOffset.current += (target - pressOffset.current) * delta * 8

    if (capRef.current) {
      capRef.current.position.y = 0.35 + pressOffset.current
    }
  })

  return (
    <group ref={groupRef}>
      {/* Base housing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.5, 0.9]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Button cap */}
      <mesh ref={capRef} position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Four pins */}
      {[
        [-0.3, -0.55, -0.3],
        [0.3, -0.55, -0.3],
        [-0.3, -0.55, 0.3],
        [0.3, -0.55, 0.3],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
