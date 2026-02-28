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
  powered?: boolean
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

function ServoModel({ powered }: { powered: boolean }) {
  const hornRef = useRef<THREE.Mesh>(null)
  const hornAngle = useRef(0)

  useFrame((_, delta) => {
    if (hornRef.current) {
      if (powered) {
        // Sweep back and forth
        hornAngle.current += delta * 1.5
        hornRef.current.rotation.y = Math.sin(hornAngle.current) * (Math.PI / 2)
      } else {
        hornRef.current.rotation.y += (0 - hornRef.current.rotation.y) * delta * 4
      }
    }
  })

  return (
    <>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.7, 0.9]} />
        <meshStandardMaterial color="#1f3a67" roughness={0.7} />
      </mesh>
      {/* Mounting tabs */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.6, 0.06, 0.9]} />
        <meshStandardMaterial color="#1f3a67" roughness={0.7} />
      </mesh>
      {/* Mounting tab holes */}
      {[-0.68, 0.68].map((x, i) => (
        <mesh key={i} position={[x, 0.06, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
          <meshStandardMaterial color="#0e1f3d" roughness={0.8} />
        </mesh>
      ))}
      {/* Output shaft housing */}
      <mesh position={[-0.35, 0.45, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.15, 24]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.3} roughness={0.3} />
      </mesh>
      {/* Horn arm */}
      <mesh ref={hornRef} position={[-0.35, 0.56, 0]}>
        <boxGeometry args={[0.7, 0.05, 0.12]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* Label sticker area */}
      <mesh position={[0.15, 0, 0.451]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshStandardMaterial color="#e5e7eb" side={THREE.DoubleSide} />
      </mesh>
      {/* Wire harness */}
      {[
        { x: 0.35, color: '#b45309' },  // orange / signal
        { x: 0.4, color: '#dc2626' },   // red / VCC
        { x: 0.45, color: '#3f3f46' },  // brown / GND
      ].map((w, i) => (
        <mesh key={i} position={[w.x, -0.55, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
          <meshStandardMaterial color={w.color} roughness={0.6} />
        </mesh>
      ))}
    </>
  )
}

function DcMotorModel({ powered }: { powered: boolean }) {
  const shaftRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (shaftRef.current && powered) {
      shaftRef.current.rotation.x += delta * 15
    }
  })

  return (
    <>
      {/* Cylindrical metal casing */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 1.2, 28]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Back cap */}
      <mesh position={[-0.62, 0.1, 0]}>
        <cylinderGeometry args={[0.28, 0.35, 0.05, 24]} />
        <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Front bearing cap */}
      <mesh position={[0.62, 0.1, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.08, 16]} />
        <meshStandardMaterial color="#71717a" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Output shaft */}
      <mesh ref={shaftRef} position={[0.78, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 12]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Power terminals */}
      {[-0.13, 0.13].map((z, idx) => (
        <mesh key={idx} position={[-0.65, 0.22, z]}>
          <boxGeometry args={[0.08, 0.3, 0.04]} />
          <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </>
  )
}

function RelayModel({ powered }: { powered: boolean }) {
  const indicatorRef = useRef<THREE.MeshStandardMaterial>(null)
  const intensityRef = useRef(0)

  useFrame((_, delta) => {
    const target = powered ? 1 : 0
    intensityRef.current += (target - intensityRef.current) * delta * 6
    if (indicatorRef.current) {
      indicatorRef.current.emissiveIntensity = intensityRef.current * 1.5
    }
  })

  return (
    <>
      {/* Main relay housing */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.2, 0.75, 0.8]} />
        <meshStandardMaterial color="#2563eb" roughness={0.65} />
      </mesh>
      {/* Top cover / label area */}
      <mesh position={[0, 0.58, 0]}>
        <boxGeometry args={[1.1, 0.02, 0.7]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
      </mesh>
      {/* Status LED indicator */}
      <mesh position={[0.4, 0.45, 0.41]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial
          ref={indicatorRef}
          color="#ef4444"
          emissive="#ff0000"
          emissiveIntensity={0}
        />
      </mesh>
      {/* PCB base */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[1.3, 0.1, 0.85]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </mesh>
      {/* Screw terminals */}
      {[-0.4, 0, 0.4].map((x, idx) => (
        <mesh key={`t${idx}`} position={[x, -0.08, 0.38]}>
          <boxGeometry args={[0.18, 0.14, 0.15]} />
          <meshStandardMaterial color="#2563eb" roughness={0.5} />
        </mesh>
      ))}
      {/* Header pins */}
      {[-0.35, -0.15, 0.05, 0.25].map((x, idx) => (
        <mesh key={idx} position={[x, -0.35, -0.25]}>
          <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </>
  )
}

function RgbLedModel({ powered }: { powered: boolean }) {
  const domeRef = useRef<THREE.MeshStandardMaterial>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const intensityRef = useRef(0)
  const hueRef = useRef(0)

  useFrame((_, delta) => {
    const target = powered ? 1 : 0
    intensityRef.current += (target - intensityRef.current) * delta * 4

    if (powered) {
      hueRef.current += delta * 0.3
    }

    const color = new THREE.Color()
    color.setHSL(hueRef.current % 1, 0.9, 0.5)

    if (domeRef.current) {
      domeRef.current.emissiveIntensity = intensityRef.current * 1.5
      domeRef.current.emissive = color
      domeRef.current.opacity = 0.5 + intensityRef.current * 0.3
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + intensityRef.current * 0.4)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.color = color
      mat.opacity = intensityRef.current * 0.25
    }
  })

  return (
    <>
      {/* Diffused dome */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          ref={domeRef}
          color="#f3f4f6"
          emissive="#000000"
          emissiveIntensity={0}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Cylindrical base */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.35, 16]} />
        <meshStandardMaterial color="#f3f4f6" transparent opacity={0.6} />
      </mesh>
      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} />
      </mesh>
      {/* Flat bottom rim */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.34, 0.32, 0.05, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* 4 legs (R, common cathode/anode, G, B) - common is longest */}
      {[
        { x: -0.12, len: 0.8 },   // Red
        { x: -0.04, len: 1.0 },   // Common (longest)
        { x: 0.04, len: 0.8 },    // Green
        { x: 0.12, len: 0.8 },    // Blue
      ].map((leg, idx) => (
        <mesh key={idx} position={[leg.x, -0.08 - leg.len / 2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, leg.len, 8]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
    </>
  )
}

export default function GenericModel({ variant = 'ic', powered = false }: GenericModelProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {variant === 'ic' && <IcStyleModel />}
      {variant === 'servo' && <ServoModel powered={powered} />}
      {variant === 'dc-motor' && <DcMotorModel powered={powered} />}
      {variant === 'relay' && <RelayModel powered={powered} />}
      {variant === 'rgb-led' && <RgbLedModel powered={powered} />}

      {variant === 'photoresistor' && (
        <>
          {/* Ceramic disc */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.08, 24]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
          {/* Clear epoxy top */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.02, 24]} />
            <meshStandardMaterial color="#fef3c7" transparent opacity={0.6} />
          </mesh>
          {/* Serpentine CdS trace pattern */}
          {[-0.12, -0.04, 0.04, 0.12].map((x, idx) => (
            <mesh key={idx} position={[x, 0.3, 0]}>
              <boxGeometry args={[0.02, 0.04, 0.45]} />
              <meshStandardMaterial color="#fde68a" />
            </mesh>
          ))}
          {/* Two wire legs */}
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
          {/* TO-92 style body */}
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.45, 0.6, 0.12]} />
            <meshStandardMaterial color="#111827" roughness={0.65} />
          </mesh>
          {/* Rounded front face */}
          <mesh position={[0, 0.3, 0.06]}>
            <cylinderGeometry args={[0.22, 0.22, 0.6, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#111827" roughness={0.65} />
          </mesh>
          {/* Label marking */}
          <mesh position={[-0.001, 0.35, 0.07]}>
            <planeGeometry args={[0.3, 0.15]} />
            <meshStandardMaterial color="#333333" side={THREE.DoubleSide} />
          </mesh>
          {/* 3 legs (Vcc, Vout, GND) */}
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
          {/* Blue PCB board */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.5, 0.8, 0.1]} />
            <meshStandardMaterial color="#2563eb" roughness={0.6} />
          </mesh>
          {/* Two ultrasonic transducers */}
          {[-0.4, 0.4].map((x, idx) => (
            <group key={idx}>
              {/* Transducer cylinder */}
              <mesh position={[x, 0.15, 0.12]}>
                <cylinderGeometry args={[0.24, 0.24, 0.15, 24]} />
                <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Mesh grille */}
              <mesh position={[x, 0.15, 0.21]}>
                <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} />
                <meshStandardMaterial color="#6b7280" metalness={0.5} roughness={0.5} />
              </mesh>
            </group>
          ))}
          {/* Crystal oscillator */}
          <mesh position={[0, 0.15, 0.08]}>
            <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* 4 header pins (VCC, Trig, Echo, GND) */}
          {[-0.55, -0.35, 0.35, 0.55].map((x, idx) => (
            <mesh key={idx} position={[x, -0.42, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.45, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </>
      )}

      {variant === 'lcd' && (
        <>
          {/* Green PCB */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.7, 1.1, 0.12]} />
            <meshStandardMaterial color="#0f766e" roughness={0.75} />
          </mesh>
          {/* LCD glass area (dark green/black) */}
          <mesh position={[0, 0.2, 0.08]}>
            <boxGeometry args={[1.35, 0.55, 0.02]} />
            <meshStandardMaterial color="#022c22" />
          </mesh>
          {/* Silver bezel around LCD */}
          <mesh position={[0, 0.2, 0.07]}>
            <boxGeometry args={[1.42, 0.62, 0.01]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* 16-pin header */}
          {Array.from({ length: 16 }).map((_, i) => (
            <mesh key={i} position={[-0.75 + i * 0.1, -0.34, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
          {/* Contrast potentiometer (small blue trim pot) */}
          <mesh position={[-0.65, 0.45, 0.07]}>
            <boxGeometry args={[0.15, 0.15, 0.1]} />
            <meshStandardMaterial color="#2563eb" roughness={0.5} />
          </mesh>
        </>
      )}
    </group>
  )
}
