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
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.9, 0.22, 0.58]} />
        <meshStandardMaterial color="#141414" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[0.62, 0.01, 0.34]} />
        <meshStandardMaterial color="#2d2d2d" />
      </mesh>
      {[-0.27, -0.09, 0.09, 0.27].map((z, i) => (
        <mesh key={`l${i}`} position={[-0.47, -0.02, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
          <meshStandardMaterial color="#b8bdc5" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {[-0.27, -0.09, 0.09, 0.27].map((z, i) => (
        <mesh key={`r${i}`} position={[0.47, -0.02, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
          <meshStandardMaterial color="#b8bdc5" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </>
  )
}

function ServoModel({ powered }: { powered: boolean }) {
  const hornRef = useRef<THREE.Group>(null)
  const sweep = useRef(0)

  useFrame((_, delta) => {
    if (!hornRef.current) return
    if (powered) {
      sweep.current += delta * 1.3
      hornRef.current.rotation.y = Math.sin(sweep.current) * (Math.PI / 2.2)
      return
    }
    hornRef.current.rotation.y += (0 - hornRef.current.rotation.y) * delta * 4
  })

  return (
    <>
      <mesh>
        <boxGeometry args={[1.15, 0.72, 0.88]} />
        <meshStandardMaterial color="#17407d" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.55, 0.07, 0.88]} />
        <meshStandardMaterial color="#17407d" roughness={0.68} />
      </mesh>
      <mesh position={[-0.33, 0.45, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.13, 24]} />
        <meshStandardMaterial color="#d4d7dd" metalness={0.45} roughness={0.28} />
      </mesh>
      <group ref={hornRef} position={[-0.33, 0.54, 0]}>
        <mesh>
          <boxGeometry args={[0.75, 0.045, 0.11]} />
          <meshStandardMaterial color="#efefef" />
        </mesh>
        <mesh position={[-0.32, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.05, 18]} />
          <meshStandardMaterial color="#efefef" />
        </mesh>
      </group>
      {[
        { x: 0.34, color: '#c56a1f' },
        { x: 0.39, color: '#d03a3a' },
        { x: 0.44, color: '#3b3b3b' },
      ].map((wire, i) => (
        <mesh key={i} position={[wire.x, -0.55, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.35, 8]} />
          <meshStandardMaterial color={wire.color} roughness={0.55} />
        </mesh>
      ))}
    </>
  )
}

function DcMotorModel({ powered }: { powered: boolean }) {
  const shaftRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (shaftRef.current && powered) shaftRef.current.rotation.x += delta * 14
  })

  return (
    <>
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.33, 0.33, 1.18, 30]} />
        <meshStandardMaterial color="#9ba2ac" metalness={0.9} roughness={0.22} />
      </mesh>
      <mesh position={[-0.61, 0.1, 0]}>
        <cylinderGeometry args={[0.28, 0.33, 0.05, 20]} />
        <meshStandardMaterial color="#777d86" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0.61, 0.1, 0]}>
        <cylinderGeometry args={[0.14, 0.2, 0.09, 18]} />
        <meshStandardMaterial color="#747b84" metalness={0.9} roughness={0.24} />
      </mesh>
      <mesh ref={shaftRef} position={[0.77, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.27, 12]} />
        <meshStandardMaterial color="#c9ccd2" metalness={0.95} roughness={0.12} />
      </mesh>
      {[-0.08, 0.08].map((z) => (
        <mesh key={z} position={[-0.56, -0.2, z]}>
          <boxGeometry args={[0.03, 0.08, 0.06]} />
          <meshStandardMaterial color="#d89f47" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </>
  )
}

function RelayModel({ powered }: { powered: boolean }) {
  const ledRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((_, delta) => {
    if (!ledRef.current) return
    const target = powered ? 1.4 : 0
    ledRef.current.emissiveIntensity += (target - ledRef.current.emissiveIntensity) * delta * 5
  })

  return (
    <>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[1.5, 0.85, 0.1]} />
        <meshStandardMaterial color="#175c34" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.26, 0.05]}>
        <boxGeometry args={[0.86, 0.52, 0.5]} />
        <meshStandardMaterial color="#2a5ea9" transparent opacity={0.9} roughness={0.45} />
      </mesh>
      <mesh position={[-0.45, 0.28, 0.08]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
        <meshStandardMaterial ref={ledRef} color="#bbf7d0" emissive="#22c55e" emissiveIntensity={0} />
      </mesh>
      {[-0.4, 0, 0.4].map((x, idx) => (
        <mesh key={idx} position={[x, -0.08, 0.35]}>
          <boxGeometry args={[0.18, 0.14, 0.14]} />
          <meshStandardMaterial color="#2a65bf" roughness={0.45} />
        </mesh>
      ))}
      {[-0.34, -0.14, 0.06, 0.26].map((x, idx) => (
        <mesh key={idx} position={[x, -0.34, -0.25]}>
          <cylinderGeometry args={[0.022, 0.022, 0.28, 8]} />
          <meshStandardMaterial color="#cda24c" metalness={0.85} roughness={0.26} />
        </mesh>
      ))}
    </>
  )
}

function RgbLedModel({ powered }: { powered: boolean }) {
  const domeRef = useRef<THREE.MeshStandardMaterial>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const level = useRef(0)
  const hue = useRef(0)

  useFrame((_, delta) => {
    const target = powered ? 1 : 0
    level.current += (target - level.current) * delta * 4
    if (powered) hue.current += delta * 0.3

    const color = new THREE.Color().setHSL(hue.current % 1, 0.9, 0.52)

    if (domeRef.current) {
      domeRef.current.emissive = color
      domeRef.current.emissiveIntensity = level.current * 1.4
      domeRef.current.opacity = 0.52 + level.current * 0.3
    }

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.color = color
      mat.opacity = level.current * 0.24
      glowRef.current.scale.setScalar(1 + level.current * 0.36)
    }
  })

  return (
    <>
      <mesh position={[0, 0.26, 0]}>
        <capsuleGeometry args={[0.22, 0.35, 12, 20]} />
        <meshStandardMaterial ref={domeRef} color="#f8fafc" emissive="#000" emissiveIntensity={0} transparent opacity={0.55} roughness={0.35} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.42, 18, 18]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} />
      </mesh>
      {[-0.12, -0.04, 0.04, 0.12].map((x, idx) => (
        <mesh key={idx} position={[x, -0.58, 0]}>
          <cylinderGeometry args={[0.014, 0.014, idx === 1 ? 1 : 0.84, 8]} />
          <meshStandardMaterial color="#bcc1c9" metalness={0.9} roughness={0.18} />
        </mesh>
      ))}
    </>
  )
}

export default function GenericModel({ variant = 'ic', powered = false }: GenericModelProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
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
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.08, 24]} />
            <meshStandardMaterial color="#b9732d" roughness={0.58} />
          </mesh>
          <mesh position={[0, 0.27, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.02, 24]} />
            <meshStandardMaterial color="#f5deb1" transparent opacity={0.65} />
          </mesh>
          {[-0.1, -0.03, 0.03, 0.1].map((x, idx) => (
            <mesh key={idx} position={[x, 0.27, 0]}>
              <boxGeometry args={[0.014, 0.02, 0.38]} />
              <meshStandardMaterial color="#f8cd74" />
            </mesh>
          ))}
          {[-0.09, 0.09].map((x, idx) => (
            <mesh key={idx} position={[x, -0.4, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.88, 8]} />
              <meshStandardMaterial color="#b9bec6" metalness={0.85} roughness={0.2} />
            </mesh>
          ))}
        </>
      )}

      {variant === 'temp-sensor' && (
        <>
          <mesh position={[0, 0.3, -0.03]}>
            <boxGeometry args={[0.42, 0.58, 0.12]} />
            <meshStandardMaterial color="#17181b" roughness={0.68} />
          </mesh>
          <mesh position={[0, 0.3, 0.03]}>
            <cylinderGeometry args={[0.21, 0.21, 0.58, 18, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#17181b" roughness={0.68} />
          </mesh>
          {[-0.11, 0, 0.11].map((x) => (
            <mesh key={x} position={[x, -0.35, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.9, 8]} />
              <meshStandardMaterial color="#bcc1c9" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </>
      )}

      {variant === 'ultrasonic' && (
        <>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.48, 0.82, 0.1]} />
            <meshStandardMaterial color="#2a65bf" roughness={0.58} />
          </mesh>
          {[-0.4, 0.4].map((x, idx) => (
            <group key={idx}>
              <mesh position={[x, 0.15, 0.12]}>
                <cylinderGeometry args={[0.23, 0.23, 0.16, 28]} />
                <meshStandardMaterial color="#9ea4ae" metalness={0.8} roughness={0.28} />
              </mesh>
              <mesh position={[x, 0.15, 0.21]}>
                <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
                <meshStandardMaterial color="#69707a" metalness={0.55} roughness={0.45} />
              </mesh>
            </group>
          ))}
          {[-0.55, -0.35, 0.35, 0.55].map((x, idx) => (
            <mesh key={idx} position={[x, -0.41, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.44, 8]} />
              <meshStandardMaterial color="#cda24c" metalness={0.82} roughness={0.24} />
            </mesh>
          ))}
        </>
      )}

      {variant === 'lcd' && (
        <>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.72, 1.12, 0.12]} />
            <meshStandardMaterial color="#1c6f61" roughness={0.72} />
          </mesh>
          <mesh position={[0, 0.23, 0.07]}>
            <boxGeometry args={[1.44, 0.66, 0.03]} />
            <meshStandardMaterial color="#aeb4bc" metalness={0.4} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.24, 0.09]}>
            <boxGeometry args={[1.34, 0.54, 0.01]} />
            <meshStandardMaterial color="#143127" roughness={0.4} />
          </mesh>
          {Array.from({ length: 16 }).map((_, i) => (
            <mesh key={i} position={[-0.75 + i * 0.1, -0.33, 0]}>
              <cylinderGeometry args={[0.013, 0.013, 0.22, 8]} />
              <meshStandardMaterial color="#cda24c" metalness={0.85} roughness={0.24} />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}
