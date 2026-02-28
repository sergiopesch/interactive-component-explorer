'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SpeakerModelProps {
  powered: boolean
}

export default function SpeakerModel({ powered }: SpeakerModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const discRef = useRef<THREE.Mesh>(null)
  const vibratePhase = useRef(0)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3

    if (powered) {
      vibratePhase.current += delta * 30
      if (discRef.current) discRef.current.position.y = 0.19 + Math.sin(vibratePhase.current) * 0.015
    } else if (discRef.current) {
      discRef.current.position.y += (0.19 - discRef.current.position.y) * delta * 8
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <cylinderGeometry args={[0.62, 0.68, 0.32, 28]} />
        <meshStandardMaterial color="#101114" roughness={0.7} />
      </mesh>

      <mesh position={[0, 0.17, 0]} ref={discRef}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 28]} />
        <meshStandardMaterial color="#c9973f" metalness={0.7} roughness={0.35} />
      </mesh>

      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 18]} />
        <meshStandardMaterial color="#d8dbe2" roughness={0.4} />
      </mesh>

      <mesh position={[0.33, 0.12, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
        <meshStandardMaterial color="#0a0b0d" />
      </mesh>

      <mesh position={[-0.18, -0.28, 0.1]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshStandardMaterial color="#ce4040" roughness={0.5} />
      </mesh>
      <mesh position={[0.18, -0.28, 0.1]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshStandardMaterial color="#2c2f36" roughness={0.5} />
      </mesh>
    </group>
  )
}
