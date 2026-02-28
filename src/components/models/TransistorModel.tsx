'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function TransistorModel() {
  const groupRef = useRef<THREE.Group>(null)

  // Create TO-92 half-cylinder shape
  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    // Flat front face (D-shape)
    shape.moveTo(-0.2, -0.35)
    shape.lineTo(-0.2, 0.35)
    shape.lineTo(0.2, 0.35)
    shape.absarc(0, 0, 0.25, Math.PI * 0.3, -Math.PI * 0.3, true)
    shape.lineTo(-0.2, -0.35)

    const extrudeSettings = {
      depth: 0.25,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    }
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* TO-92 body */}
      <mesh
        position={[0, 0.25, -0.12]}
        geometry={bodyGeometry}
      >
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Flat face text marking area */}
      <mesh position={[-0.21, 0.25, 0]}>
        <planeGeometry args={[0.01, 0.4]} />
        <meshStandardMaterial color="#333333" side={THREE.DoubleSide} />
      </mesh>

      {/* Emitter leg (left) */}
      <mesh position={[-0.12, -0.45, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.9, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Base leg (center) */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.9, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Collector leg (right) */}
      <mesh position={[0.12, -0.45, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.9, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
