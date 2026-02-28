# CLAUDE.md — Agent Instructions for Electronics Explorer

## Project Overview

Interactive electronics component explorer built with **Next.js 15**, **Three.js** (via React Three Fiber), **Tailwind CSS**, and **Transformers.js** (in-browser ONNX). Teaches beginners about Arduino Student Kit components through AI-powered photo identification, interactive 3D models, specifications, datasheet details, and AI-generated voice guidance.

**All AI runs in the browser.** No API keys, no server-side routes, no external service calls. CLIP identifies components from photos; MMS-TTS reads descriptions aloud. Model weights are embedded in `public/models/` and served as static files.

## Quick Reference

```
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build (static export to out/)
npm run lint      # Run ESLint (zero warnings enforced)
npx serve out     # Serve the static build locally
```

No environment variables needed. No `.env` file required.

## Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout (only server component), metadata, OG tags
│   ├── page.tsx                # Home page — renders HomeClient
│   ├── manifest.ts             # PWA manifest (standalone display)
│   └── globals.css             # Tailwind directives, animations
├── components/
│   ├── Header.tsx              # App header with dark/light mode toggle
│   ├── HomeClient.tsx          # Main app: camera upload → AI analysis → result + browse grid
│   ├── ImageUpload.tsx         # Drag & drop / camera capture, resizes to ≤1024px JPEG
│   ├── ComponentCard.tsx       # Full card: 3D viewer + specs + voice + power + datasheet
│   ├── ComponentViewer.tsx     # R3F canvas, orbit controls, model router, IntersectionObserver
│   └── models/
│       ├── ResistorModel.tsx       # Color-banded resistor
│       ├── LEDModel.tsx            # { powered } → emissive glow, dome + legs
│       ├── ButtonModel.tsx         # { powered } → press-down animation, 4 pins
│       ├── SpeakerModel.tsx        # { powered } → disc vibration
│       ├── CapacitorModel.tsx      # Electrolytic capacitor
│       ├── PotentiometerModel.tsx  # Rotary pot with knob
│       ├── DiodeModel.tsx          # 1N4007 with stripe marking
│       ├── TransistorModel.tsx     # TO-92 package
│       └── GenericModel.tsx        # Fallback: routes to Servo, DC Motor, Relay,
│                                   #   RGB LED, Photoresistor, TempSensor, Ultrasonic, LCD
├── data/
│   └── components.ts           # 16 ElectronicsComponent definitions + DatasheetInfo
└── hooks/
    ├── useTheme.ts              # { isDark, toggle, mounted } — localStorage + system pref
    ├── useSpeech.ts             # Drop-in TTS wrapper — delegates to useLocalTTS
    ├── useLocalTTS.ts           # In-browser MMS-TTS via Transformers.js (sentence streaming)
    ├── useLocalClassifier.ts    # In-browser CLIP zero-shot via Transformers.js (singleton)
    └── useComponentIdentifier.ts # Photo → component matching with label mapping + confidence

public/
└── models/
    └── Xenova/
        ├── clip-vit-base-patch16/   # CLIP vision + text encoders (146 MB, int8)
        │   ├── onnx/vision_model_quantized.onnx
        │   ├── onnx/text_model_quantized.onnx
        │   ├── config.json, tokenizer.json, preprocessor_config.json, ...
        └── mms-tts-eng/             # MMS text-to-speech (38 MB, int8)
            ├── onnx/model_quantized.onnx
            ├── config.json, tokenizer.json, ...
```

## How to Add a New Component

This is the most common modification. Follow these three steps exactly:

### Step 1 — Add data entry in `src/data/components.ts`

Add an object to the `electronicsComponents` array:

```typescript
{
  id: 'capacitor',                            // unique slug, used in ModelSelector switch
  name: 'Capacitor',                          // display name on card
  category: 'passive',                        // 'passive' | 'active' | 'input' | 'output'
  hasActiveState: false,                       // true → shows ON/OFF power toggle button
  description: 'A capacitor stores...',        // beginner-friendly text shown on card
  voiceDescription: 'This is a capacitor...',  // text read aloud by AI TTS
  specs: [
    { label: 'Capacitance', value: '100 μF' },
    { label: 'Voltage Rating', value: '25 V' },
  ],
  circuitExample: 'Connect the capacitor...',  // wiring instructions shown on card
  clipLabel: 'a photo of a capacitor',         // CLIP label for AI identification
  datasheetInfo: {                             // optional — enables "Datasheet Details" section
    maxRatings: [{ parameter: 'Voltage', value: '25 V' }],
    pinout: 'Longer lead = positive (anode)...',
    characteristics: [
      { parameter: 'Capacitance', min: '90', typical: '100', max: '110', unit: 'μF' },
    ],
    partNumbers: ['PART-001'],
    tips: 'Watch polarity — reversed voltage can cause failure.',
  },
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

If you skip this step, `GenericModel` (IC chip shape) is used automatically.

### Step 3 — Register in `src/components/ComponentViewer.tsx`

Add import and switch case in the `ModelSelector` function:

```typescript
import CapacitorModel from './models/CapacitorModel'

// Inside ModelSelector switch:
case 'capacitor':
  return <CapacitorModel />
// Or if active: return <CapacitorModel powered={powered} />
```

That's it. The grid in `HomeClient.tsx` automatically renders all entries from the data array.

## Key Conventions

- **All components are client-side** (`'use client'`) except `layout.tsx`
- **ComponentViewer is dynamically imported** with `ssr: false` (Three.js cannot run server-side)
- **3D camera**: position `[0, 1, 3.5]`, FOV `40`. Orbit controls: rotate only, no zoom/pan
- **3D lighting**: ambient 0.5 + directional from `[5,5,5]` at 1.0 + fill from `[-3,2,-3]` at 0.3
- **Rotation speed**: `delta * 0.3` (all models use the same speed)
- **Animation easing**: `value += (target - value) * delta * N` where N = 4–8
- **Color palette**: black, white, and grays only in UI chrome. Component models may use realistic colors
- **Theme**: Tailwind `dark:` prefix. Dark mode via `class` on `<html>`. Stored in `localStorage('theme')`
- **No global state library** — local React state + hooks only
- **No external APIs** — all AI runs in-browser via Transformers.js + embedded ONNX models
- **No environment variables** — the app needs zero configuration to run
- **Static export** — `output: 'export'` in `next.config.js` produces pure static files in `out/`. No serverless functions (avoids the Vercel 250 MB limit). `next start` is not available; use `npx serve out` to preview locally
- **WebGL context management** — `ComponentViewer` uses `IntersectionObserver` to lazy-render canvases, staying within browser WebGL context limits

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
  clipLabel: string                  // CLIP candidate label for AI identification
  datasheetInfo?: DatasheetInfo      // optional advanced details
}

interface DatasheetInfo {
  maxRatings: { parameter: string; value: string }[]
  pinout: string
  characteristics: {
    parameter: string; min?: string; typical?: string; max?: string; unit: string
  }[]
  partNumbers: string[]
  tips: string
}

// Theme hook — src/hooks/useTheme.ts
useTheme() → { isDark: boolean; toggle: () => void; mounted: boolean }

// Speech hook — src/hooks/useSpeech.ts (wrapper around useLocalTTS)
useSpeech() → {
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
  isModelLoading: boolean        // true while TTS model is downloading/initializing
  modelLoadProgress: number      // 0–100 during model load
}

// Classifier hook — src/hooks/useLocalClassifier.ts
useLocalClassifier() → {
  classify: (imageBase64: string, labels: string[]) => Promise<ClassifyResult[]>
  isLoading: boolean             // true while CLIP model is loading
  loadProgress: number           // 0–100 during model load
  isClassifying: boolean         // true during inference
}

// Identifier hook — src/hooks/useComponentIdentifier.ts
useComponentIdentifier() → {
  identify: (imageBase64: string) => Promise<IdentifyResult | null>
  isAnalyzing: boolean
  error: string | null
  clearError: () => void
  isModelLoading: boolean
  modelLoadProgress: number
  isClassifying: boolean
}

// 3D model props (active components only)
{ powered: boolean }
```

## AI Pipeline Details

### Image Classification Flow
1. `ImageUpload` captures/resizes image → base64 JPEG (≤1024px, ≤1.8MB)
2. `useComponentIdentifier.identify(base64)` is called
3. `useLocalClassifier.classify(base64, ALL_CANDIDATE_LABELS)` runs CLIP
4. CLIP encodes image + ~30 text labels into vectors, ranks by cosine similarity
5. Scores aggregated per component (best label wins), ≥3% threshold required
6. Returns `{ component, confidence, reasoning }` or error

### TTS Flow
1. `useSpeech.speak(text)` delegates to `useLocalTTS`
2. Text split into sentences for progressive playback
3. MMS-TTS synthesizes each sentence → Float32Array PCM
4. PCM encoded as WAV blob → played via `<audio>` element
5. Playback starts after first sentence (no waiting for full text)

### Model Loading
- Both models use a **singleton pattern** — loaded once, reused across the app
- Models load from `/models/` (maps to `public/models/`), configured via:
  ```typescript
  env.localModelPath = '/models/'
  env.allowLocalModels = true
  env.allowRemoteModels = false   // zero calls to Hugging Face
  ```
- Quantized with `dtype: 'q8'` (int8) for smaller size + faster inference
- Browser caches model files after first load — subsequent visits are instant

## Common Tasks

| Task | What to do |
|------|-----------|
| Add a component | Follow 3-step guide above |
| Change specs | Edit `specs` array in `src/data/components.ts` |
| Modify a 3D model | Edit the model file in `src/components/models/` |
| Change voice text | Edit `voiceDescription` in `src/data/components.ts` |
| Improve CLIP accuracy | Add label variants to `EXTRA_LABELS` in `useComponentIdentifier.ts` |
| Change card layout | Edit `src/components/ComponentCard.tsx` |
| Change browse grid | Edit grid classes in `HomeClient.tsx` |
| Add a new page/route | Create `src/app/[route]/page.tsx` (Next.js App Router) |
| Change image upload behavior | Edit `src/components/ImageUpload.tsx` |
| Edit datasheet details | Edit `datasheetInfo` in `src/data/components.ts` |
| Update AI models | Replace ONNX files in `public/models/Xenova/` and update hook config |

## Constraints

- No Google Fonts (build environment may lack network). Use system `font-sans`
- No color outside black/white palette in UI chrome
- Keep 3D models simple — primitive geometries only, no external .glb/.gltf files
- No external API calls — all AI runs in-browser via embedded ONNX models
- No environment variables — the app must work with zero configuration
- No server-side routes — `output: 'export'` means no API routes, no middleware, no SSR
- Model files in `public/models/` must stay under 100 MB each (GitHub file size limit)
- Deployable to any static host (Vercel, Netlify, Cloudflare Pages, S3, etc.)

## Testing

No test framework is configured yet. If adding tests:
- Use `vitest` or `jest` with `@testing-library/react`
- 3D components need `@react-three/test-renderer` or should be tested via integration tests
- Data module (`components.ts`) can be unit tested directly
- Hook tests for `useLocalClassifier` and `useLocalTTS` should mock `@huggingface/transformers`
