# CLAUDE.md — Agent Instructions for Electronics Explorer

## Project Overview

Interactive electronics component explorer built with **Next.js 14**, **Three.js** (via React Three Fiber), and **Tailwind CSS**. Teaches beginners about Arduino Student Kit components through 3D models, specifications, and voice guidance. Strict black-and-white palette. No external API dependencies.

## Quick Reference

```
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # Run ESLint
```

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout (server component, metadata)
│   ├── page.tsx            # Home page — maps electronicsComponents → ComponentCard grid
│   └── globals.css         # Tailwind directives, body theme transitions
├── components/
│   ├── Header.tsx          # App header with dark/light mode toggle
│   ├── ComponentCard.tsx   # Full card: 3D viewer + specs + voice + power toggle
│   ├── ComponentViewer.tsx # React Three Fiber canvas, orbit controls, model router
│   └── models/
│       ├── ResistorModel.tsx   # Passive — no props
│       ├── LEDModel.tsx        # { powered: boolean } → emissive glow animation
│       ├── ButtonModel.tsx     # { powered: boolean } → press-down animation
│       └── SpeakerModel.tsx    # { powered: boolean } → disc vibration animation
├── data/
│   └── components.ts       # ElectronicsComponent interface + component definitions array
└── hooks/
    ├── useTheme.ts          # { isDark, toggle, mounted } — localStorage + system pref
    └── useSpeech.ts         # { speak, stop, isSpeaking } — Web Speech API wrapper
```

## How to Add a New Component

This is the most common modification. Follow these three steps exactly:

### Step 1 — Add data entry in `src/data/components.ts`

Add an object to the `electronicsComponents` array:

```typescript
{
  id: 'capacitor',                          // unique slug, used in ModelSelector switch
  name: 'Capacitor',                        // display name on card
  category: 'passive',                      // 'passive' | 'active' | 'input' | 'output'
  hasActiveState: false,                     // true → shows ON/OFF power toggle button
  description: 'A capacitor stores...',      // beginner-friendly text shown on card
  voiceDescription: 'This is a capacitor...', // text read aloud by Web Speech API
  specs: [
    { label: 'Capacitance', value: '100 μF' },
    { label: 'Voltage Rating', value: '25 V' },
  ],
  circuitExample: 'Connect the capacitor...',  // wiring instructions shown on card
}
```

### Step 2 — Create 3D model in `src/components/models/CapacitorModel.tsx`

```typescript
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// If hasActiveState: true, accept { powered: boolean }
// If hasActiveState: false, no props needed
export default function CapacitorModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3  // standard rotation speed
    }
  })

  return (
    <group ref={groupRef}>
      {/* Build with Three.js primitives: mesh, boxGeometry, cylinderGeometry, etc. */}
    </group>
  )
}
```

### Step 3 — Register in `src/components/ComponentViewer.tsx`

Add import and switch case in the `ModelSelector` function:

```typescript
import CapacitorModel from './models/CapacitorModel'

// Inside ModelSelector switch:
case 'capacitor':
  return <CapacitorModel />
// Or if active: return <CapacitorModel powered={powered} />
```

That's it. The card grid in `page.tsx` automatically renders all entries from the array.

## Key Conventions

- **All components are client-side** (`'use client'`) except `layout.tsx`
- **ComponentViewer is dynamically imported** with `ssr: false` (Three.js cannot run server-side)
- **3D camera**: position `[0, 1, 3.5]`, FOV `40`. Orbit controls: rotate only, no zoom/pan
- **3D lighting**: ambient 0.5 + directional from `[5,5,5]` at 1.0 + fill from `[-3,2,-3]` at 0.3
- **Rotation speed**: `delta * 0.3` (all models use the same speed)
- **Animation easing**: `value += (target - value) * delta * N` where N = 4–8
- **Color palette**: black, white, and grays only in UI. Component models may use realistic colors
- **Theme**: Tailwind `dark:` prefix. Dark mode via `class` on `<html>`. Stored in `localStorage('theme')`
- **No global state library** — local React state + hooks only
- **No external APIs** — speech is browser-native Web Speech API

## Interface Contracts

```typescript
// Data shape — src/data/components.ts
interface ElectronicsComponent {
  id: string
  name: string
  category: 'passive' | 'active' | 'input' | 'output'
  hasActiveState: boolean
  description: string
  voiceDescription: string
  specs: { label: string; value: string }[]
  circuitExample: string
}

// Theme hook — src/hooks/useTheme.ts
useTheme() → { isDark: boolean; toggle: () => void; mounted: boolean }

// Speech hook — src/hooks/useSpeech.ts
useSpeech() → { speak: (text: string) => void; stop: () => void; isSpeaking: boolean }

// 3D model props (active components only)
{ powered: boolean }
```

## Common Tasks

| Task | What to do |
|------|-----------|
| Add a component | Follow 3-step guide above |
| Change specs for a component | Edit `specs` array in `src/data/components.ts` |
| Modify a 3D model | Edit the model file in `src/components/models/` |
| Change voice text | Edit `voiceDescription` in `src/data/components.ts` |
| Adjust speech speed | Change `utterance.rate` in `src/hooks/useSpeech.ts` (default 0.9) |
| Change card layout | Edit `src/components/ComponentCard.tsx` |
| Change grid columns | Edit grid classes in `src/app/page.tsx` (currently `lg:grid-cols-2`) |
| Add a new page/route | Create `src/app/[route]/page.tsx` (Next.js App Router) |
| Add component categories/filtering | Add filter state in `page.tsx`, filter `electronicsComponents` before mapping |

## Constraints

- No Google Fonts (build environment may lack network). Use system `font-sans`
- No color outside black/white palette in UI chrome
- Keep 3D models simple — primitive geometries only, no external .glb/.gltf files
- All speech must use browser Web Speech API — no external TTS services
- Vercel-deployable with zero config (standard Next.js build output)

## Testing

No test framework is configured yet. If adding tests:
- Use `vitest` or `jest` with `@testing-library/react`
- 3D components need `@react-three/test-renderer` or should be tested via integration tests
- Data module (`components.ts`) can be unit tested directly
