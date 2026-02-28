'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function TransistorModel() {
  const groupRef = useRef<THREE.Group>(null)

  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.22, -0.32)
    shape.lineTo(-0.22, 0.32)
    shape.lineTo(0.22, 0.32)
    shape.absarc(0, 0, 0.26, Math.PI * 0.3, -Math.PI * 0.3, true)
    shape.lineTo(-0.22, -0.32)

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.17,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.015,
      bevelSegments: 2,
    })
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.28, -0.08]} geometry={bodyGeometry}>
        <meshStandardMaterial color="#17181b" roughness={0.72} />
      </mesh>

      <mesh position={[0, 0.3, 0.01]}>
        <planeGeometry args={[0.3, 0.14]} />
        <meshStandardMaterial color="#2b2d31" side={THREE.DoubleSide} />
      </mesh>

      {[-0.1, 0, 0.1].map((x) => (
        <mesh key={x} position={[x, -0.42, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.86, 8]} />
          <meshStandardMaterial color="#b8bec6" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
