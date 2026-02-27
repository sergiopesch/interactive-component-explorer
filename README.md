# Electronics Explorer

An interactive 3D web app for learning about common electronics components. Built for beginners exploring the Arduino Student Kit.

Rotate 3D models, toggle power states, and listen to voice descriptions — all in the browser with zero setup.

## Features

- **Interactive 3D models** — click and drag to rotate resistors, LEDs, buttons, and speakers
- **Power simulation** — toggle LEDs on (glow effect), press buttons, vibrate speakers
- **Voice guidance** — browser text-to-speech reads beginner-friendly explanations
- **Dark / Light mode** — toggle in the header, persists across sessions
- **Beginner-friendly** — each card shows what it does, its specs, and how to wire it
- **No external APIs** — everything runs client-side in the browser

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| 3D | Three.js via React Three Fiber + Drei |
| Styling | Tailwind CSS (black & white palette) |
| Voice | Web Speech API (browser-native) |
| Language | TypeScript |
| Deploy | Vercel (zero-config) |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Serve production build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout and metadata
│   ├── page.tsx            # Home page with component grid
│   └── globals.css         # Tailwind setup and theme transitions
├── components/
│   ├── Header.tsx          # App header with dark/light toggle
│   ├── ComponentCard.tsx   # Card with 3D viewer, specs, voice, power toggle
│   ├── ComponentViewer.tsx # Three.js canvas with orbit controls
│   └── models/             # One file per 3D component model
│       ├── ResistorModel.tsx
│       ├── LEDModel.tsx
│       ├── ButtonModel.tsx
│       └── SpeakerModel.tsx
├── data/
│   └── components.ts       # Component definitions (single source of truth)
└── hooks/
    ├── useTheme.ts          # Dark/light mode with localStorage
    └── useSpeech.ts         # Web Speech API wrapper
```

## Components Included

| Component | Type | Interactive | What It Teaches |
|-----------|------|------------|----------------|
| Resistor | Passive | Rotate | Current limiting, color bands, Ohm's law |
| LED | Output | Rotate, Power on/off | Polarity, forward voltage, using with resistors |
| Push Button | Input | Rotate, Press | Momentary switches, pull-up resistors, digital input |
| Piezo Speaker | Output | Rotate, Power on/off | Sound from vibration, frequency, the tone() function |

## Adding New Components

The codebase is modular — adding a new component takes three steps:

### 1. Define the component data

Add an entry to the array in `src/data/components.ts`:

```typescript
{
  id: 'potentiometer',
  name: 'Potentiometer',
  category: 'input',
  hasActiveState: true,
  description: 'A potentiometer is a variable resistor...',
  voiceDescription: 'This is a potentiometer...',
  specs: [
    { label: 'Resistance Range', value: '0 – 10 kΩ' },
  ],
  circuitExample: 'Connect the outer pins to 5V and GND...',
}
```

### 2. Create a 3D model

Create `src/components/models/PotentiometerModel.tsx`:

```typescript
'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PotentiometerModel({ powered }: { powered: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
  })

  return (
    <group ref={groupRef}>
      {/* Build with Three.js primitives */}
    </group>
  )
}
```

### 3. Register in the viewer

In `src/components/ComponentViewer.tsx`, add an import and a switch case:

```typescript
import PotentiometerModel from './models/PotentiometerModel'

// In ModelSelector:
case 'potentiometer':
  return <PotentiometerModel powered={powered} />
```

The component automatically appears in the grid.

## Design Principles

- **Black and white only** — no colorful gradients or trendy aesthetics
- **Large text, spacious layout** — readable and approachable
- **Simple 3D models** — stylized primitives, not photorealistic
- **Minimal UI** — every element earns its place
- **Beginner-first** — plain language, real circuit examples, no jargon without explanation

## Deployment

This is a standard Next.js app. Deploy to Vercel:

```bash
npx vercel
```

Or connect the GitHub repository to [vercel.com](https://vercel.com) for automatic deployments.

## Browser Support

Requires a modern browser with:
- WebGL (for Three.js 3D rendering)
- Web Speech API (for voice descriptions — works in Chrome, Edge, Safari)

## License

See [LICENSE](./LICENSE) for details.
