'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LEDModelProps {
  powered: boolean
}

export default function LEDModel({ powered }: LEDModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const domeMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const baseMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const intensityRef = useRef(0)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }

    // Smooth power transition
    const target = powered ? 1 : 0
    intensityRef.current += (target - intensityRef.current) * delta * 4

    const emissive = intensityRef.current * 2
    const opacity = 0.6 + intensityRef.current * 0.4

    if (domeMatRef.current) {
      domeMatRef.current.emissiveIntensity = emissive
      domeMatRef.current.opacity = opacity
    }
    if (baseMatRef.current) {
      baseMatRef.current.emissiveIntensity = emissive
      baseMatRef.current.opacity = opacity
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + intensityRef.current * 0.5)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = intensityRef.current * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* LED dome (top half-sphere) */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          ref={domeMatRef}
          color="#ff3333"
          emissive="#ff0000"
          emissiveIntensity={0}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* LED cylindrical base (epoxy body) */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.5, 16]} />
        <meshStandardMaterial
          ref={baseMatRef}
          color="#ff3333"
          emissive="#ff0000"
          emissiveIntensity={0}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={0} />
      </mesh>

      {/* Flange rim with cathode flat */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.45, 0.42, 0.06, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Cathode flat marker on rim */}
      <mesh position={[0.42, -0.22, 0]}>
        <boxGeometry args={[0.1, 0.06, 0.25]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Anode (longer leg — positive) */}
      <mesh position={[-0.12, -0.95, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cathode (shorter leg — negative) */}
      <mesh position={[0.12, -0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
