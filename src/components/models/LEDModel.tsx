'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LEDModelProps {
  powered: boolean
}

export default function LEDModel({ powered }: LEDModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const intensityRef = useRef(0)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3

    const target = powered ? 1 : 0
    intensityRef.current += (target - intensityRef.current) * delta * 4

    if (bodyMatRef.current) {
      bodyMatRef.current.emissiveIntensity = intensityRef.current * 1.7
      bodyMatRef.current.opacity = 0.5 + intensityRef.current * 0.4
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + intensityRef.current * 0.45)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = intensityRef.current * 0.25
    }
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.25, 0]}>
        <capsuleGeometry args={[0.28, 0.55, 12, 24]} />
        <meshStandardMaterial
          ref={bodyMatRef}
          color="#e32f2f"
          emissive="#ff2b2b"
          emissiveIntensity={0}
          transparent
          opacity={0.58}
          roughness={0.35}
        />
      </mesh>

      <mesh position={[0, -0.13, 0]}>
        <cylinderGeometry args={[0.31, 0.28, 0.06, 24]} />
        <meshStandardMaterial color="#d8d9dc" metalness={0.7} roughness={0.25} />
      </mesh>

      <mesh ref={glowRef} position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.48, 18, 18]} />
        <meshBasicMaterial color="#ff4040" transparent opacity={0} />
      </mesh>

      <mesh position={[-0.08, -0.88, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 1.35, 8]} />
        <meshStandardMaterial color="#b4b9c0" metalness={0.9} roughness={0.18} />
      </mesh>
      <mesh position={[0.09, -0.79, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 1.15, 8]} />
        <meshStandardMaterial color="#b4b9c0" metalness={0.9} roughness={0.18} />
      </mesh>
    </group>
  )
}
