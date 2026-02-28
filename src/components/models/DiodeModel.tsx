'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function DiodeModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.14, 0.62, 10, 20]} />
        <meshStandardMaterial color="#121212" roughness={0.65} />
      </mesh>

      <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.145, 0.02, 10, 20]} />
        <meshStandardMaterial color="#d0d3d9" metalness={0.75} roughness={0.3} />
      </mesh>

      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.55, 8]} />
          <meshStandardMaterial color="#b8bec6" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
