'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GenericModelProps {
  variant?:
    | 'ic'
    | 'servo'
    | 'dc-motor'
    | 'photoresistor'
    | 'temp-sensor'
    | 'ultrasonic'
    | 'lcd'
    | 'relay'
    | 'rgb-led'
}

function IcStyleModel() {
  return (
    <>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.8, 0.25, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh position={[-0.28, 0.285, -0.15]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.6, 0.01, 0.3]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {[-0.25, -0.08, 0.08, 0.25].map((z, i) => (
        <mesh key={`l${i}`} position={[-0.42, -0.15, z]}>
          <boxGeometry args={[0.15, 0.02, 0.05]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {[-0.25, -0.08, 0.08, 0.25].map((z, i) => (
        <mesh key={`r${i}`} position={[0.42, -0.15, z]}>
          <boxGeometry args={[0.15, 0.02, 0.05]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </>
  )
}

export default function GenericModel({ variant = 'ic' }: GenericModelProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {variant === 'ic' && <IcStyleModel />}

      {variant === 'servo' && (
        <>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.7, 0.9]} />
            <meshStandardMaterial color="#1f3a67" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.12, 24]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.2} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.85, 0.05, 0.16]} />
            <meshStandardMaterial color="#f5f5f5" />
          </mesh>
        </>
      )}

      {variant === 'dc-motor' && (
        <>
          <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 1.2, 28]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0.72, 0.1, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color="#71717a" metalness={0.9} roughness={0.2} />
          </mesh>
          {[-0.13, 0.13].map((z, idx) => (
            <mesh key={idx} position={[-0.65, 0.22, z]}>
              <boxGeometry args={[0.08, 0.3, 0.04]} />
              <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.4} />
            </mesh>
          ))}
        </>
      )}

      {variant === 'photoresistor' && (
        <>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.08, 24]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
          {[ -0.12, -0.04, 0.04, 0.12 ].map((x, idx) => (
            <mesh key={idx} position={[x, 0.3, 0]}>
              <boxGeometry args={[0.02, 0.04, 0.45]} />
              <meshStandardMaterial color="#fde68a" />
            </mesh>
          ))}
          {[-0.1, 0.1].map((x, idx) => (
            <mesh key={idx} position={[x, -0.4, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.9, 8]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </>
      )}

      {variant === 'temp-sensor' && (
        <>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.45, 0.6, 0.12]} />
            <meshStandardMaterial color="#111827" roughness={0.65} />
          </mesh>
          {[-0.12, 0, 0.12].map((x, idx) => (
            <mesh key={idx} position={[x, -0.35, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.9, 8]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </>
      )}

      {variant === 'ultrasonic' && (
        <>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.5, 0.8, 0.1]} />
            <meshStandardMaterial color="#2563eb" roughness={0.6} />
          </mesh>
          {[-0.4, 0.4].map((x, idx) => (
            <mesh key={idx} position={[x, 0.15, 0.12]}>
              <cylinderGeometry args={[0.24, 0.24, 0.12, 24]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
          {[-0.55, -0.35, 0.35, 0.55].map((x, idx) => (
            <mesh key={idx} position={[x, -0.42, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.45, 8]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </>
      )}

      {variant === 'lcd' && (
        <>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.7, 1.1, 0.12]} />
            <meshStandardMaterial color="#0f766e" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.2, 0.08]}>
            <boxGeometry args={[1.35, 0.55, 0.02]} />
            <meshStandardMaterial color="#022c22" />
          </mesh>
          {Array.from({ length: 16 }).map((_, i) => (
            <mesh key={i} position={[-0.75 + i * 0.1, -0.34, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </>
      )}

      {variant === 'relay' && (
        <>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.2, 0.75, 0.8]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[1, 0.18, 0.65]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          {[-0.35, -0.15, 0.05, 0.25].map((x, idx) => (
            <mesh key={idx} position={[x, -0.35, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
              <meshStandardMaterial color="#a16207" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </>
      )}

      {variant === 'rgb-led' && (
        <>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.26, 20, 20]} />
            <meshStandardMaterial color="#f3f4f6" transparent opacity={0.7} />
          </mesh>
          {[-0.12, -0.04, 0.04, 0.12].map((x, idx) => (
            <mesh key={idx} position={[x, -0.38, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.95, 8]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.85} roughness={0.2} />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}
