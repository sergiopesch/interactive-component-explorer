'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function DiodeModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }
  })

  // Molded epoxy body material — very dark, slightly glossy like a real DO-41 diode
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: '#111111',
    roughness: 0.35,
    metalness: 0.05,
  })

  // Cathode band — bright silver, raised, metallic
  const cathodeMaterial = new THREE.MeshStandardMaterial({
    color: '#e8e8e8',
    roughness: 0.15,
    metalness: 0.85,
  })

  // Wire lead material — dull silver tinned copper
  const wireMaterial = new THREE.MeshStandardMaterial({
    color: '#b0b0b0',
    roughness: 0.3,
    metalness: 0.9,
  })

  // Marking area — lighter matte rectangle painted on body
  const markingMaterial = new THREE.MeshStandardMaterial({
    color: '#2a2a2a',
    roughness: 0.6,
    metalness: 0.0,
  })

  // Mold line / parting mark — very subtle dark seam
  const moldMarkMaterial = new THREE.MeshStandardMaterial({
    color: '#0a0a0a',
    roughness: 0.8,
    metalness: 0.0,
  })

  return (
    <group ref={groupRef}>

      {/*
        DO-41 body — three cylinders composited to create a slightly bulged center.
        Real DO-41 bodies are not perfectly cylindrical; they taper slightly toward
        the ends and are widest in the middle.
      */}

      {/* Left tapered end cap */}
      <mesh position={[-0.36, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={bodyMaterial}>
        <cylinderGeometry args={[0.155, 0.185, 0.22, 24]} />
      </mesh>

      {/* Center widened body */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={bodyMaterial}>
        <cylinderGeometry args={[0.19, 0.19, 0.56, 24]} />
      </mesh>

      {/* Right tapered end cap — cathode side */}
      <mesh position={[0.36, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={bodyMaterial}>
        <cylinderGeometry args={[0.185, 0.155, 0.22, 24]} />
      </mesh>

      {/*
        Cathode band — sits at the right end of the body, raised proud of the surface.
        Two rings: a wider backing ring and a thinner bright highlight ring to
        simulate the embossed stripe on a real 1N4007.
      */}

      {/* Cathode band — main wide ring */}
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={cathodeMaterial}>
        <cylinderGeometry args={[0.205, 0.205, 0.1, 24]} />
      </mesh>

      {/* Cathode band — inner fill to close the gap with the body */}
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={cathodeMaterial}>
        <cylinderGeometry args={[0.205, 0.205, 0.095, 24]} />
      </mesh>

      {/* Cathode band edge highlight — thin bright ring on the anode-facing side */}
      <mesh position={[0.255, 0, 0]} material={cathodeMaterial}>
        <torusGeometry args={[0.197, 0.012, 10, 24]} />
      </mesh>

      {/*
        Body text / marking area — a slightly lighter flattened box sitting just
        proud of the body surface to represent the printed "1N4007" legend.
      */}
      <mesh position={[-0.05, 0.19, 0]} rotation={[0, 0, 0]} material={markingMaterial}>
        <boxGeometry args={[0.42, 0.012, 0.14]} />
      </mesh>

      {/*
        Mold parting line — a razor-thin ridge running along the equator of the
        body (top and bottom) where the two halves of the injection mold met.
        Rendered as a very thin torus rotated to run lengthwise.
      */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={moldMarkMaterial}>
        <torusGeometry args={[0.191, 0.006, 4, 48]} />
      </mesh>

      {/*
        Bent wire leads — L-shaped through-hole mounting style.
        Each lead has:
          1. A short horizontal section coming out of the body end
          2. A vertical section going down (simulating bent PCB lead)

        Anode side (left, negative X)
      */}

      {/* Anode — horizontal segment exiting body */}
      <mesh position={[-0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={wireMaterial}>
        <cylinderGeometry args={[0.022, 0.022, 0.3, 10]} />
      </mesh>

      {/* Anode — vertical bent segment going downward */}
      <mesh position={[-0.77, -0.22, 0]} rotation={[0, 0, 0]} material={wireMaterial}>
        <cylinderGeometry args={[0.022, 0.022, 0.44, 10]} />
      </mesh>

      {/* Anode — small rounded corner joining horizontal and vertical */}
      <mesh position={[-0.77, 0, 0]} material={wireMaterial}>
        <torusGeometry args={[0.022, 0.022, 8, 12, Math.PI / 2]} />
      </mesh>

      {/*
        Cathode side (right, positive X) — mirror of anode lead
      */}

      {/* Cathode — horizontal segment exiting body */}
      <mesh position={[0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={wireMaterial}>
        <cylinderGeometry args={[0.022, 0.022, 0.3, 10]} />
      </mesh>

      {/* Cathode — vertical bent segment going downward */}
      <mesh position={[0.77, -0.22, 0]} rotation={[0, 0, 0]} material={wireMaterial}>
        <cylinderGeometry args={[0.022, 0.022, 0.44, 10]} />
      </mesh>

      {/* Cathode — small rounded corner joining horizontal and vertical */}
      <mesh position={[0.77, 0, 0]} material={wireMaterial}>
        <torusGeometry args={[0.022, 0.022, 8, 12, Math.PI / 2]} />
      </mesh>

    </group>
  )
}
