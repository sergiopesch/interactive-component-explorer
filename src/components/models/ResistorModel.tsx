'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 220Ω ±5%: red, red, brown, gold
const BAND_COLORS = ['#cc3333', '#cc3333', '#993300', '#d4af37']

// Horizontal lead half-length (extends outward from body end cap)
const LEAD_H_LEN = 0.55
// Downward leg length (the bend that goes into the breadboard)
const LEAD_V_LEN = 0.6
// Lead radius
const LEAD_R = 0.025
// Body half-length along Y
const BODY_HALF = 0.5

export default function ResistorModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle floating / bobbing
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
      // Standard rotation
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    // Tilt slightly so the bent leads read clearly in perspective
    <group ref={groupRef} rotation={[0, 0, Math.PI / 6]}>

      {/* ── Ceramic body ── */}
      <mesh>
        <capsuleGeometry args={[0.28, 1.0, 12, 24]} />
        {/* Warm buff ceramic — slightly glossy like a real glazed resistor body */}
        <meshStandardMaterial
          color="#c8a97a"
          roughness={0.55}
          metalness={0.0}
        />
      </mesh>

      {/* ── End caps (darker rings at each pole of the body) ── */}
      {/* Bottom cap */}
      <mesh position={[0, -(BODY_HALF + 0.01), 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.285, 0.285, 0.08, 24]} />
        <meshStandardMaterial color="#8a7055" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, (BODY_HALF + 0.01), 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.285, 0.285, 0.08, 24]} />
        <meshStandardMaterial color="#8a7055" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* ── Color bands ── */}
      {BAND_COLORS.map((color, i) => {
        // First 3 value bands grouped toward one end; 4th (tolerance) spaced away
        const y = i < 3 ? -0.25 + i * 0.2 : 0.35
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.29, 0.028, 10, 28]} />
            <meshStandardMaterial
              color={color}
              roughness={0.4}
              metalness={0.05}
            />
          </mesh>
        )
      })}

      {/* ── Bent wire leads — L-shaped like a through-hole resistor on a breadboard ── */}

      {/* Bottom lead: horizontal section emerging from body end cap */}
      <mesh
        position={[0, -(BODY_HALF + 0.05 + LEAD_H_LEN / 2), 0]}
        rotation={[0, 0, 0]}
      >
        <cylinderGeometry args={[LEAD_R, LEAD_R, LEAD_H_LEN, 8]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Bottom lead: downward vertical leg */}
      <mesh
        position={[0, -(BODY_HALF + 0.05 + LEAD_H_LEN + LEAD_V_LEN / 2), 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[LEAD_R, LEAD_R, LEAD_V_LEN, 8]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Bottom lead: small bend connector (sphere at the corner) */}
      <mesh position={[0, -(BODY_HALF + 0.05 + LEAD_H_LEN), 0]}>
        <sphereGeometry args={[LEAD_R * 1.1, 8, 8]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Top lead: horizontal section emerging from body end cap */}
      <mesh
        position={[0, (BODY_HALF + 0.05 + LEAD_H_LEN / 2), 0]}
        rotation={[0, 0, 0]}
      >
        <cylinderGeometry args={[LEAD_R, LEAD_R, LEAD_H_LEN, 8]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Top lead: downward vertical leg (bends back down toward the board) */}
      <mesh
        position={[0, (BODY_HALF + 0.05 + LEAD_H_LEN + LEAD_V_LEN / 2), 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[LEAD_R, LEAD_R, LEAD_V_LEN, 8]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Top lead: small bend connector (sphere at the corner) */}
      <mesh position={[0, (BODY_HALF + 0.05 + LEAD_H_LEN), 0]}>
        <sphereGeometry args={[LEAD_R * 1.1, 8, 8]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.85} roughness={0.15} />
      </mesh>

    </group>
  )
}
