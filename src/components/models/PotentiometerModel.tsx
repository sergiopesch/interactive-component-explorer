'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PotentiometerModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {/* ── Main body (disc) ── */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.28, 32]} />
        <meshStandardMaterial color="#1e3a6e" metalness={0.15} roughness={0.75} />
      </mesh>

      {/* Value marking area — small lighter rectangle on the front face */}
      <mesh position={[0, 0.145, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.28, 0.1]} />
        <meshStandardMaterial color="#c8d4e8" metalness={0.0} roughness={0.9} />
      </mesh>

      {/* Resistance track ring — thin carbon ring on the body top face */}
      <mesh position={[0, 0.142, 0]}>
        <ringGeometry args={[0.28, 0.38, 48]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.05}
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Bottom plate (PCB-mount base) ── */}
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.04, 32]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.25} roughness={0.65} />
      </mesh>

      {/* ── Mounting tabs / ears — left and right ── */}
      {/* Left ear */}
      <mesh position={[-0.62, -0.05, 0]}>
        <boxGeometry args={[0.22, 0.12, 0.18]} />
        <meshStandardMaterial color="#1e3a6e" metalness={0.15} roughness={0.75} />
      </mesh>
      {/* Left ear hole */}
      <mesh position={[-0.62, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.24, 12]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.1} roughness={0.9} />
      </mesh>

      {/* Right ear */}
      <mesh position={[0.62, -0.05, 0]}>
        <boxGeometry args={[0.22, 0.12, 0.18]} />
        <meshStandardMaterial color="#1e3a6e" metalness={0.15} roughness={0.75} />
      </mesh>
      {/* Right ear hole */}
      <mesh position={[0.62, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.24, 12]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.1} roughness={0.9} />
      </mesh>

      {/* ── Shaft housing (metal collar) ── */}
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.14, 20]} />
        <meshStandardMaterial color="#b8b8b8" metalness={0.75} roughness={0.25} />
      </mesh>

      {/* ── D-shaft ── */}
      <mesh position={[0, 0.47, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.28, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.82} roughness={0.18} />
      </mesh>
      {/* D-flat cut (trimmed face) */}
      <mesh position={[0.058, 0.47, 0]}>
        <boxGeometry args={[0.025, 0.3, 0.14]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ── User-facing knob (wide disc on top of shaft) ── */}
      {/* Knob base disc */}
      <mesh position={[0, 0.66, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.1, 32]} />
        <meshStandardMaterial color="#222222" metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Knob top cap — slightly smaller, rounded look */}
      <mesh position={[0, 0.715, 0]}>
        <cylinderGeometry args={[0.19, 0.22, 0.03, 32]} />
        <meshStandardMaterial color="#2e2e2e" metalness={0.25} roughness={0.55} />
      </mesh>
      {/* Knurled grip ring around knob edge */}
      <mesh position={[0, 0.665, 0]}>
        <torusGeometry args={[0.225, 0.014, 8, 28]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* ── Wiper indicator line on the knob — thin white bar from center to edge ── */}
      {/* Inner segment */}
      <mesh position={[0, 0.722, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.03, 0.09]} />
        <meshStandardMaterial
          color="#f0f0f0"
          metalness={0.0}
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Outer segment (reaches knob rim) */}
      <mesh position={[0, 0.722, 0.155]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.025, 0.06]} />
        <meshStandardMaterial
          color="#e8e8e8"
          metalness={0.0}
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Pins — bent-lead style ── */}
      {/*
          Each pin is composed of:
            - a vertical segment coming down from the body
            - a short horizontal bend outward
          Left pin  (terminal 1)
          Center pin (wiper / terminal 2)
          Right pin  (terminal 3)
      */}

      {/* Pin 1 — left vertical drop */}
      <mesh position={[-0.28, -0.45, 0.1]}>
        <cylinderGeometry args={[0.022, 0.022, 0.5, 8]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Pin 1 — horizontal foot (bent outward along Z) */}
      <mesh position={[-0.28, -0.72, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.22, 8]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Pin 2 — center vertical drop (wiper, slightly longer) */}
      <mesh position={[0, -0.46, 0.1]}>
        <cylinderGeometry args={[0.022, 0.022, 0.52, 8]} />
        <meshStandardMaterial color="#d4d4d4" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Pin 2 — horizontal foot */}
      <mesh position={[0, -0.73, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.22, 8]} />
        <meshStandardMaterial color="#d4d4d4" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Pin 3 — right vertical drop */}
      <mesh position={[0.28, -0.45, 0.1]}>
        <cylinderGeometry args={[0.022, 0.022, 0.5, 8]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Pin 3 — horizontal foot (bent outward along Z) */}
      <mesh position={[0.28, -0.72, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.22, 8]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.85} roughness={0.15} />
      </mesh>
    </group>
  )
}
