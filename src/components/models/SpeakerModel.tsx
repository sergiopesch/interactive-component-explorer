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
  const ceramicRef = useRef<THREE.Mesh>(null)
  const vibratePhase = useRef(0)

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Standard rotation
      groupRef.current.rotation.y += delta * 0.3
      // Gentle floating/bobbing animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }

    // Vibration animation when powered
    if (powered) {
      vibratePhase.current += delta * 30
      const displacement = Math.sin(vibratePhase.current) * 0.02
      if (discRef.current) {
        discRef.current.position.y = 0.22 + displacement
      }
      if (ceramicRef.current) {
        ceramicRef.current.position.y = 0.265 + displacement
      }
    } else {
      if (discRef.current) {
        discRef.current.position.y += (0.22 - discRef.current.position.y) * delta * 8
      }
      if (ceramicRef.current) {
        ceramicRef.current.position.y += (0.265 - ceramicRef.current.position.y) * delta * 8
      }
    }
  })

  // Sound hole positions arranged in a 5-hole pattern on the top surface
  // One center hole plus four arranged around a small radius
  const soundHoles: [number, number][] = [
    [0, 0],
    [0.28, 0],
    [-0.28, 0],
    [0, 0.28],
    [0, -0.28],
    [0.2, 0.2],
  ]

  // PCB pad positions at the bottom (4 small pads in a ring)
  const padAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]

  return (
    <group ref={groupRef}>
      {/* Outer casing — main body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.3, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.7} />
      </mesh>

      {/* Rim / lip around top edge */}
      <mesh position={[0, 0.155, 0]}>
        <cylinderGeometry args={[0.72, 0.7, 0.02, 32]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Bottom plate (sealed) */}
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.71, 0.71, 0.02, 32]} />
        <meshStandardMaterial color="#111111" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Adhesive tape detail on the back — thin rectangular strip */}
      <mesh position={[0, -0.165, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.01, 0.2]} />
        <meshStandardMaterial color="#c8b86a" metalness={0.0} roughness={0.9} transparent opacity={0.85} />
      </mesh>

      {/* Metallic ring of the piezo disc (outer brass ring) */}
      <mesh ref={discRef} position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 32]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Inner metallic ring — silver annular section between brass and ceramic */}
      <mesh position={[0, 0.255, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.015, 32, 1, false]} />
        <meshStandardMaterial color="#b0b8c8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Ceramic center disc — white piezo ceramic */}
      <mesh ref={ceramicRef} position={[0, 0.265, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 24]} />
        <meshStandardMaterial color="#e8eaed" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Small highlight dot at ceramic center */}
      <mesh position={[0, 0.282, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.005, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Sound holes on the top surface — 6 small cylinders */}
      {soundHoles.map(([hx, hz], i) => (
        <mesh key={i} position={[hx, 0.165, hz]}>
          <cylinderGeometry args={[0.04, 0.04, 0.025, 12]} />
          <meshStandardMaterial color="#050505" roughness={1.0} metalness={0.0} />
        </mesh>
      ))}

      {/* Mounting ring at the bottom — thin ring to suggest PCB footprint */}
      <mesh position={[0, -0.18, 0]}>
        <torusGeometry args={[0.62, 0.03, 8, 32]} />
        <meshStandardMaterial color="#2a5a2a" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* PCB pads — 4 small copper-colored cylinders at the bottom */}
      {padAngles.map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.62, -0.19, Math.sin(angle) * 0.62]}
        >
          <cylinderGeometry args={[0.055, 0.055, 0.01, 10]} />
          <meshStandardMaterial color="#b87333" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Positive wire (red) */}
      <mesh position={[-0.25, -0.37, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.42, 8]} />
        <meshStandardMaterial color="#cc3333" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Negative wire (black) */}
      <mesh position={[0.25, -0.37, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.42, 8]} />
        <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}
