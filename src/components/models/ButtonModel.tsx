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
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3

    const target = powered ? -0.08 : 0
    pressOffset.current += (target - pressOffset.current) * delta * 9
    if (capRef.current) capRef.current.position.y = 0.25 + pressOffset.current
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[0.72, 0.42, 0.72]} />
        <meshStandardMaterial color="#1f2125" roughness={0.65} />
      </mesh>

      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[0.56, 0.12, 0.56]} />
        <meshStandardMaterial color="#3b3f46" roughness={0.55} />
      </mesh>

      <mesh ref={capRef} position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.16, 20]} />
        <meshStandardMaterial color="#5b606a" roughness={0.45} />
      </mesh>

      {[
        [-0.24, -0.47, -0.24],
        [0.24, -0.47, -0.24],
        [-0.24, -0.47, 0.24],
        [0.24, -0.47, 0.24],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 10]} />
          <meshStandardMaterial color="#bcc1c8" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
