'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ButtonModelProps {
  powered: boolean
}

export default function ButtonModel({ powered }: ButtonModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const capRef = useRef<THREE.Group>(null)
  const pressOffset = useRef(0)

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Standard rotation
      groupRef.current.rotation.y += delta * 0.3
      // Gentle floating/bobbing animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }

    // Smooth press animation with easing
    const target = powered ? -0.12 : 0
    pressOffset.current += (target - pressOffset.current) * delta * 8

    if (capRef.current) {
      capRef.current.position.y = 0.38 + pressOffset.current
    }
  })

  // Pin positions for 4-corner layout
  const pinPositions: [number, number, number][] = [
    [-0.3, -0.55, -0.3],
    [ 0.3, -0.55, -0.3],
    [-0.3, -0.55,  0.3],
    [ 0.3, -0.55,  0.3],
  ]

  // Chamfer/bevel edge strip dimensions and positions along housing corners
  // Four vertical strips, one on each corner edge of the housing
  const chamferCorners: [number, number, number][] = [
    [-0.45,  0, -0.45],
    [ 0.45,  0, -0.45],
    [-0.45,  0,  0.45],
    [ 0.45,  0,  0.45],
  ]
  const chamferRotations: [number, number, number][] = [
    [0,  Math.PI * 0.25, 0],
    [0, -Math.PI * 0.25, 0],
    [0, -Math.PI * 0.25, 0],
    [0,  Math.PI * 0.25, 0],
  ]

  // PCB trace line segments: [x, z, width, depth] laid flat on the base plate
  const traceSegments: { x: number; z: number; w: number; d: number }[] = [
    // Horizontal trace across left pins
    { x: -0.3, z:  0,    w: 0.04, d: 0.62 },
    // Horizontal trace across right pins
    { x:  0.3, z:  0,    w: 0.04, d: 0.62 },
    // Short cross-connect traces
    { x:  0,   z: -0.3,  w: 0.62, d: 0.04 },
    { x:  0,   z:  0.3,  w: 0.62, d: 0.04 },
    // Center via dot approximated as a small square
    { x:  0,   z:  0,    w: 0.08, d: 0.08 },
  ]

  return (
    <group ref={groupRef}>

      {/* --- PCB base plate --- */}
      <mesh position={[0, -0.78, 0]}>
        <boxGeometry args={[1.1, 0.06, 1.1]} />
        <meshStandardMaterial color="#1a3a1a" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* PCB trace pattern on top surface of base plate */}
      {traceSegments.map((seg, i) => (
        <mesh key={`trace-${i}`} position={[seg.x, -0.74, seg.z]}>
          <boxGeometry args={[seg.w, 0.005, seg.d]} />
          <meshStandardMaterial color="#c8a000" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* --- Main housing body --- */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.5, 0.9]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Inner cavity/well — recessed area on top of the housing visible around the cap stem */}
      {/* Rendered as four thin inner walls forming a square well */}
      {/* North wall */}
      <mesh position={[0, 0.28, -0.28]}>
        <boxGeometry args={[0.56, 0.08, 0.04]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* South wall */}
      <mesh position={[0, 0.28, 0.28]}>
        <boxGeometry args={[0.56, 0.08, 0.04]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* West wall */}
      <mesh position={[-0.28, 0.28, 0]}>
        <boxGeometry args={[0.04, 0.08, 0.56]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* East wall */}
      <mesh position={[0.28, 0.28, 0]}>
        <boxGeometry args={[0.04, 0.08, 0.56]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* Well floor */}
      <mesh position={[0, 0.255, 0]}>
        <boxGeometry args={[0.56, 0.01, 0.56]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1.0} />
      </mesh>

      {/* --- Chamfer/bevel corner strips on housing --- */}
      {chamferCorners.map((pos, i) => (
        <mesh key={`chamfer-${i}`} position={pos} rotation={chamferRotations[i]}>
          <boxGeometry args={[0.06, 0.5, 0.03]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.05} />
        </mesh>
      ))}

      {/* --- Button cap group (animates as a unit) --- */}
      <group ref={capRef} position={[0, 0.38, 0]}>
        {/* Cap cylinder body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.22, 24]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.1} />
        </mesh>

        {/* Cap top face — slightly lighter disc */}
        <mesh position={[0, 0.115, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.005, 24]} />
          <meshStandardMaterial color="#505050" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Cross-shaped slot on cap surface — horizontal bar */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.36, 0.012, 0.07]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>

        {/* Cross-shaped slot on cap surface — vertical bar */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.07, 0.012, 0.36]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      </group>

      {/* --- Pins with crimped/bent sections --- */}
      {pinPositions.map((pos, i) => {
        // Each pin: upper straight shaft, bent horizontal section, lower straight shaft
        const [px, , pz] = pos
        // Bend direction points inward toward center
        const bendX = px < 0 ? 0.06 : -0.06
        const bendZ = pz < 0 ? 0.06 : -0.06

        return (
          <group key={`pin-${i}`}>
            {/* Upper shaft — from housing bottom down partway */}
            <mesh position={[px, -0.42, pz]}>
              <boxGeometry args={[0.055, 0.28, 0.055]} />
              <meshStandardMaterial color="#aaaaaa" metalness={0.85} roughness={0.15} />
            </mesh>

            {/* Crimped bend — small horizontal offset section */}
            <mesh position={[px + bendX * 0.5, -0.58, pz + bendZ * 0.5]}
                  rotation={[Math.atan2(bendZ, 1) * 0.2, 0, Math.atan2(bendX, 1) * 0.2]}>
              <boxGeometry args={[0.055, 0.055, 0.14]} />
              <meshStandardMaterial color="#999999" metalness={0.85} roughness={0.2} />
            </mesh>

            {/* Lower shaft — drops down to PCB */}
            <mesh position={[px + bendX, -0.7, pz + bendZ]}>
              <boxGeometry args={[0.055, 0.2, 0.055]} />
              <meshStandardMaterial color="#aaaaaa" metalness={0.85} roughness={0.15} />
            </mesh>

            {/* Pin tip — slightly darker end cap */}
            <mesh position={[px + bendX, -0.81, pz + bendZ]}>
              <boxGeometry args={[0.055, 0.03, 0.055]} />
              <meshStandardMaterial color="#777777" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        )
      })}

    </group>
  )
}
