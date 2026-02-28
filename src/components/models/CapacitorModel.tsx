'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CapacitorModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main cylindrical body — slightly tapered: top radius 0.35, bottom 0.32 */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.35, 0.32, 1.0, 32]} />
        <meshStandardMaterial
          color="#0d1b3e"
          metalness={0.15}
          roughness={0.75}
        />
      </mesh>

      {/*
        Shrink-wrap label sleeve — sits just outside the body cylinder.
        Slightly shorter than the body so the top cap and bottom plug
        both protrude visibly past the label edges.
      */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.356, 0.326, 0.88, 32]} />
        <meshStandardMaterial
          color="#112266"
          metalness={0.05}
          roughness={0.88}
          transparent
          opacity={0.97}
        />
      </mesh>

      {/*
        Negative stripe — light gray vertical band on the sleeve.
        Rendered as a thin outer shell segment using a short, narrow cylinder
        that wraps around one side. We approximate it with a very thin
        cylinder scaled on X so it becomes an arc-shaped band.
      */}
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.362, 0.362, 0.88, 6, 1, true, -0.32, 0.64]} />
        <meshStandardMaterial
          color="#c8cdd8"
          metalness={0.1}
          roughness={0.7}
          side={THREE.FrontSide}
        />
      </mesh>

      {/*
        Polarity minus (−) symbols along the negative stripe.
        Six small flat boxes arranged vertically, each rotated so they
        face outward on the +Z side where the stripe sits.
      */}
      {[-0.33, -0.13, 0.07, 0.27, 0.47, 0.67].map((yOffset, i) => (
        <mesh
          key={i}
          position={[0, yOffset - 0.08, 0.363]}
          rotation={[0, 0, 0]}
        >
          <boxGeometry args={[0.09, 0.018, 0.004]} />
          <meshStandardMaterial color="#44485a" metalness={0.0} roughness={0.9} />
        </mesh>
      ))}

      {/* Brushed aluminum top cap */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.355, 0.355, 0.07, 32]} />
        <meshStandardMaterial
          color="#b8bec8"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/*
        K-shaped pressure vent scoring on top cap.
        A K consists of:
          1. One long vertical bar (the spine)
          2. One diagonal going upper-right from the midpoint
          3. One diagonal going lower-right from the midpoint
        All marks are shallow grooves represented as thin dark boxes
        sitting just above the cap surface.
      */}

      {/* Spine — vertical bar of the K */}
      <mesh position={[-0.08, 0.862, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.03, 0.008, 0.38]} />
        <meshStandardMaterial color="#7a8090" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Upper diagonal arm of K — from center-right going upper-left */}
      <mesh position={[0.06, 0.862, -0.09]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.03, 0.008, 0.28]} />
        <meshStandardMaterial color="#7a8090" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Lower diagonal arm of K — from center-right going lower-left */}
      <mesh position={[0.06, 0.862, 0.09]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.03, 0.008, 0.28]} />
        <meshStandardMaterial color="#7a8090" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Crossbar — short horizontal bar connecting the two diagonals at mid-spine */}
      <mesh position={[0.02, 0.862, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.03, 0.008, 0.12]} />
        <meshStandardMaterial color="#7a8090" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Rubber base plug — dark gray disc seated flush at the bottom of the body */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.06, 32]} />
        <meshStandardMaterial color="#1c1c1c" metalness={0.05} roughness={0.92} />
      </mesh>

      {/* Bottom rim ring — thin metal band where body meets the rubber plug */}
      <mesh position={[0, -0.19, 0]}>
        <cylinderGeometry args={[0.345, 0.345, 0.02, 32]} />
        <meshStandardMaterial color="#555a66" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Positive lead (longer) — offset to the right */}
      <mesh position={[0.12, -0.62, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.78, 8]} />
        <meshStandardMaterial color="#b0b4bc" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Negative lead (shorter) — offset to the left */}
      <mesh position={[-0.12, -0.55, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.62, 8]} />
        <meshStandardMaterial color="#b0b4bc" metalness={0.85} roughness={0.2} />
      </mesh>
    </group>
  )
}
