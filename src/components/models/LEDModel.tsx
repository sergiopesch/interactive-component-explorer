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
  const domeMatRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const baseMatRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const reflectorMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const chipMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const intensityRef = useRef(0)

  useFrame((state, delta) => {
    // Floating / bobbing animation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }

    // Smooth power transition
    const target = powered ? 1 : 0
    intensityRef.current += (target - intensityRef.current) * delta * 4

    // Idle breathing pulse — very faint even when off
    const breathe = Math.sin(state.clock.elapsedTime * 1.6) * 0.5 + 0.5
    const idleEmissive = 0.05 * breathe

    // Active emissive ramps up strongly when powered
    const activeEmissive = intensityRef.current * 4.5
    const totalEmissive = idleEmissive + activeEmissive

    // Dome: translucent plastic, realistic transmission
    if (domeMatRef.current) {
      domeMatRef.current.emissiveIntensity = totalEmissive
      // Opacity stays mostly fixed for realistic plastic — only subtly varies
      domeMatRef.current.opacity = 0.55 + intensityRef.current * 0.25
    }

    // Cylindrical base same tint
    if (baseMatRef.current) {
      baseMatRef.current.emissiveIntensity = totalEmissive * 0.6
      baseMatRef.current.opacity = 0.65 + intensityRef.current * 0.2
    }

    // Reflector cup brightens when powered
    if (reflectorMatRef.current) {
      reflectorMatRef.current.emissiveIntensity = idleEmissive * 0.5 + intensityRef.current * 2.0
    }

    // Die / chip brightens
    if (chipMatRef.current) {
      chipMatRef.current.emissiveIntensity = idleEmissive + intensityRef.current * 3.0
    }

    // Glow sphere — larger and brighter when powered
    if (glowRef.current) {
      const glowScale = 1 + intensityRef.current * 1.2
      glowRef.current.scale.setScalar(glowScale)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = idleEmissive * 0.15 + intensityRef.current * 0.55
    }
  })

  return (
    <group ref={groupRef}>
      {/* LED dome — translucent plastic with physical material for realistic look */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          ref={domeMatRef}
          color="#ff3333"
          emissive="#ff2200"
          emissiveIntensity={0.05}
          transparent
          opacity={0.55}
          roughness={0.05}
          metalness={0}
          transmission={0.4}
          thickness={0.3}
          ior={1.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* LED cylindrical epoxy base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.5, 32]} />
        <meshPhysicalMaterial
          ref={baseMatRef}
          color="#ff3333"
          emissive="#ff2200"
          emissiveIntensity={0.03}
          transparent
          opacity={0.65}
          roughness={0.1}
          metalness={0}
          transmission={0.3}
          thickness={0.4}
          ior={1.5}
        />
      </mesh>

      {/* Internal reflector cup — conical, silver, visible through dome */}
      <mesh position={[0, 0.18, 0]}>
        <coneGeometry args={[0.22, 0.28, 24, 1, true]} />
        <meshStandardMaterial
          ref={reflectorMatRef}
          color="#dddddd"
          emissive="#ff6600"
          emissiveIntensity={0}
          metalness={0.9}
          roughness={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Semiconductor die / chip at base of reflector cup */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.08, 0.03, 0.08]} />
        <meshStandardMaterial
          ref={chipMatRef}
          color="#ffcc00"
          emissive="#ff8800"
          emissiveIntensity={0}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* Wire bond — thin line from die up to frame edge (approximated as a thin cylinder at angle) */}
      <mesh position={[0.1, 0.14, 0]} rotation={[0, 0, -Math.PI / 5]}>
        <cylinderGeometry args={[0.008, 0.008, 0.22, 6]} />
        <meshStandardMaterial
          color="#ffee88"
          metalness={1.0}
          roughness={0.1}
        />
      </mesh>

      {/* Glow sphere — larger halo when powered */}
      <mesh ref={glowRef} position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.75, 16, 16]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0} side={THREE.BackSide} />
      </mesh>

      {/* Flange rim with cathode flat */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.45, 0.42, 0.06, 32]} />
        <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Cathode flat marker on rim */}
      <mesh position={[0.42, -0.22, 0]}>
        <boxGeometry args={[0.1, 0.06, 0.25]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Anode (longer leg — positive, noticeably longer) */}
      <mesh position={[-0.12, -1.1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.7, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Cathode (shorter leg — negative) */}
      <mesh position={[0.12, -0.85, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.85} roughness={0.2} />
      </mesh>
    </group>
  )
}
