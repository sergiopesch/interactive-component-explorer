'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function TransistorModel() {
  const groupRef = useRef<THREE.Group>(null)

  // TO-92 body: proper D-shape — flat front, rounded back
  // The shape is defined in the XY plane and extruded along Z (depth).
  // Flat side faces -Z after extrusion; we rotate the mesh so the flat face
  // points toward the viewer (+Z world) and the rounded dome faces away.
  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape()

    // Flat front edge: vertical line at x = -0.25 (the chord of the D)
    shape.moveTo(-0.25, -0.38)
    shape.lineTo(-0.25,  0.38)

    // Top-left corner bevel
    shape.quadraticCurveTo(-0.25, 0.42, -0.21, 0.42)

    // Top flat cap
    shape.lineTo(0.21, 0.42)

    // Top-right corner bevel
    shape.quadraticCurveTo(0.25, 0.42, 0.25, 0.38)

    // Rounded back: semicircle from top-right to bottom-right
    // absarc(cx, cy, radius, startAngle, endAngle, clockwise)
    shape.absarc(0, 0, 0.32, Math.PI * 0.4, -Math.PI * 0.4, false)

    // Bottom-right corner bevel
    shape.quadraticCurveTo(0.25, -0.42, 0.21, -0.42)

    // Bottom flat cap
    shape.lineTo(-0.21, -0.42)

    // Bottom-left corner bevel back to start
    shape.quadraticCurveTo(-0.25, -0.42, -0.25, -0.38)

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.30,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.02,
      bevelSegments: 4,
    }
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    // Center the geometry on its own bounding box so the group pivot is clean
    geo.computeBoundingBox()
    const center = new THREE.Vector3()
    geo.boundingBox!.getCenter(center)
    geo.translate(-center.x, -center.y, -center.z)
    return geo
  }, [])

  // Dimple/notch geometry — small flattened sphere sitting on top of the body
  const dimpleGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.06, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5)
  }, [])

  // Part-number marking rectangle on the flat face
  // Rendered as a thin box slightly proud of the flat face surface
  const markingGeometry = useMemo(() => {
    return new THREE.BoxGeometry(0.28, 0.36, 0.004)
  }, [])

  // L-shaped lead: vertical segment + short horizontal bend
  // Returns a BufferGeometry tube following a CatmullRomCurve3 path
  const makeLeadGeometry = useMemo(() => {
    return (xOffset: number, zOffset: number) => {
      const points = [
        // Top of lead — exits the body bottom
        new THREE.Vector3(xOffset, -0.42, zOffset),
        // Straight-down section
        new THREE.Vector3(xOffset, -0.85, zOffset),
        // Bend knee
        new THREE.Vector3(xOffset, -0.95, zOffset),
        // Outward horizontal foot
        new THREE.Vector3(xOffset * 1.6, -0.98, zOffset),
      ]
      const curve = new THREE.CatmullRomCurve3(points)
      return new THREE.TubeGeometry(curve, 12, 0.022, 7, false)
    }
  }, [])

  // Pre-build the three lead geometries (Emitter, Base, Collector)
  // Base (center) pin is shifted slightly forward (+Z) per real TO-92 layout
  const emitterGeo   = useMemo(() => makeLeadGeometry(-0.13,  0.00), [makeLeadGeometry])
  const baseGeo      = useMemo(() => makeLeadGeometry( 0.00,  0.06), [makeLeadGeometry])
  const collectorGeo = useMemo(() => makeLeadGeometry( 0.13,  0.00), [makeLeadGeometry])

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Standard rotation
      groupRef.current.rotation.y += delta * 0.3
      // Gentle floating / bobbing
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }
  })

  // Molded black plastic — slightly glossy (roughness 0.6, low metalness)
  const bodyMaterial = (
    <meshStandardMaterial
      color="#141414"
      roughness={0.6}
      metalness={0.05}
    />
  )

  const metalMaterial = (
    <meshStandardMaterial
      color="#c8c8c8"
      metalness={0.85}
      roughness={0.18}
    />
  )

  return (
    <group ref={groupRef}>
      {/*
        TO-92 body
        The ExtrudeGeometry extrudes along +Z. We position and rotate so:
          - flat face (at z = -depth/2 after centering) faces forward (+Z world)
          - rounded dome faces backward (-Z world)
        Rotate 180° around Y so the flat face points toward the camera.
      */}
      <mesh
        position={[0, 0.18, 0]}
        rotation={[0, Math.PI, 0]}
      >
        <primitive object={bodyGeometry} attach="geometry" />
        {bodyMaterial}
      </mesh>

      {/*
        Part-number marking area on the flat face.
        The flat face of the extruded shape (after the 180° Y rotation) sits at
        roughly z = +0.15 relative to the mesh center. We place the marking
        just proud of that surface.
      */}
      <mesh position={[0, 0.18, 0.155]}>
        <primitive object={markingGeometry} attach="geometry" />
        <meshStandardMaterial
          color="#2e2e2e"
          roughness={0.55}
          metalness={0.0}
        />
      </mesh>

      {/*
        Mold-mark dimple on top of the body.
        The body top is at approximately y = 0.18 + 0.42 = 0.60.
        The dome is oriented upward (default SphereGeometry top-half).
      */}
      <mesh position={[0, 0.60, 0.00]}>
        <primitive object={dimpleGeometry} attach="geometry" />
        {bodyMaterial}
      </mesh>

      {/* Emitter lead — left */}
      <mesh>
        <primitive object={emitterGeo} attach="geometry" />
        {metalMaterial}
      </mesh>

      {/* Base lead — center, slightly forward */}
      <mesh>
        <primitive object={baseGeo} attach="geometry" />
        {metalMaterial}
      </mesh>

      {/* Collector lead — right */}
      <mesh>
        <primitive object={collectorGeo} attach="geometry" />
        {metalMaterial}
      </mesh>
    </group>
  )
}
