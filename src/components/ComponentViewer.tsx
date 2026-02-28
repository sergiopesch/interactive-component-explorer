'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface ComponentViewerProps {
  componentId: string
  powered: boolean
}

function createModel(componentId: string, powered: boolean) {
  const group = new THREE.Group()

  const metal = new THREE.MeshStandardMaterial({ color: '#c7c7c7', metalness: 0.8, roughness: 0.3 })
  const dark = new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.7 })
  const glass = new THREE.MeshStandardMaterial({
    color: powered ? '#ff4040' : '#7a1e1e',
    emissive: powered ? '#ff2a2a' : '#000000',
    emissiveIntensity: powered ? 1.2 : 0,
    transparent: true,
    opacity: 0.9,
  })

  if (componentId === 'resistor') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 24), new THREE.MeshStandardMaterial({ color: '#d7c0a3' }))
    body.rotation.z = Math.PI / 2
    group.add(body)

    ;[-0.4, 0.4].forEach((x) => {
      const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 12), metal)
      lead.position.x = x
      lead.rotation.z = Math.PI / 2
      group.add(lead)
    })
  } else if (componentId === 'led' || componentId === 'rgb-led') {
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.5, 32), glass)
    lens.position.y = 0.35
    group.add(lens)

    ;[-0.06, 0.06].forEach((x) => {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), metal)
      pin.position.set(x, -0.35, 0)
      group.add(pin)
    })
  } else if (componentId === 'button') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 1.1), dark)
    group.add(base)

    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.6), new THREE.MeshStandardMaterial({ color: powered ? '#111111' : '#444444' }))
    cap.position.y = powered ? 0.12 : 0.2
    group.add(cap)
  } else {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.5), dark)
    group.add(body)

    const pinCount = componentId === 'transistor' ? 3 : 2
    const spacing = pinCount === 3 ? 0.28 : 0.4
    for (let i = 0; i < pinCount; i++) {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 12), metal)
      pin.position.set((i - (pinCount - 1) / 2) * spacing, -0.65, 0)
      group.add(pin)
    }
  }

  return group
}

export default function ComponentViewer({ componentId, powered }: ComponentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      rootMargin: '500px',
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || !containerRef.current) return

    const container = containerRef.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('rgb(245,245,245)')

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.set(0, 1, 3.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight('#ffffff', 0.5)
    const key = new THREE.DirectionalLight('#ffffff', 1)
    key.position.set(5, 5, 5)
    const fill = new THREE.DirectionalLight('#ffffff', 0.3)
    fill.position.set(-3, 2, -3)
    scene.add(ambient, key, fill)

    const model = createModel(componentId, powered)
    scene.add(model)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableZoom = false
    controls.minPolarAngle = Math.PI / 4
    controls.maxPolarAngle = Math.PI / 1.5

    let frameId = 0
    const animate = () => {
      frameId = window.requestAnimationFrame(animate)
      model.rotation.y += 0.005
      if (componentId === 'speaker' && powered) {
        const s = 1 + Math.sin(performance.now() * 0.02) * 0.02
        model.scale.setScalar(s)
      }
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      if (!container.clientWidth || !container.clientHeight) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener('resize', onResize)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      scene.clear()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [componentId, powered, isVisible, retryKey])

  return (
    <div className="w-full h-64 cursor-grab active:cursor-grabbing relative">
      <div ref={containerRef} className="w-full h-full" />
      {!isVisible && (
        <div className="absolute inset-0 flex items-center justify-center text-black/20 dark:text-white/20">
          <p className="text-sm">Loading 3D model...</p>
        </div>
      )}
      <button
        onClick={handleRetry}
        className="absolute top-2 right-2 text-xs text-black/40 dark:text-white/40 underline underline-offset-2 hover:text-black/70 dark:hover:text-white/70"
      >
        Reload 3D
      </button>
    </div>
  )
}
