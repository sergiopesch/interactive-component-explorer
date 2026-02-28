# Electronics Explorer

An AI-powered learning app that identifies electronic components from photos — entirely in your browser. Snap a picture of a resistor, LED, capacitor, or any Arduino Student Kit part and instantly get an interactive 3D model, beginner-friendly specs, wiring instructions, AI voice descriptions, and detailed datasheet information.

**No API keys. No server-side processing. No external dependencies.** All AI runs locally in the browser via embedded ONNX models.

## How It Works

1. **Snap or upload** — Take a photo with your camera or drag and drop an image
2. **AI identifies it** — An in-browser CLIP vision model analyzes the image and identifies the component
3. **Learn about it** — See an interactive 3D model, specifications, circuit examples, and a plain-language description
4. **Listen** — In-browser AI text-to-speech reads the description aloud sentence by sentence
5. **Go deeper** — Toggle "Datasheet Details" for max ratings, pin configurations, electrical characteristics, part numbers, and pro tips

You can also **browse all 16 components** directly from the home screen with search and category filtering.

## Features

- **In-browser AI identification** — CLIP zero-shot image classification runs entirely in the browser via Transformers.js (no server, no API key)
- **In-browser AI text-to-speech** — MMS-TTS generates natural speech sentence by sentence, streamed to audio as it's synthesized
- **Self-hosted models** — Quantized ONNX weights are bundled in `public/models/` and served from your own CDN. Zero calls to external services at runtime
- **Interactive 3D models** — Rotate resistors, LEDs, capacitors, transistors, and more (WebGL context-managed for stable browsing)
- **Power simulation** — Toggle LEDs, press buttons, spin motors, and activate relays
- **Beginner + Advanced modes** — Beginner-friendly descriptions by default; expandable datasheet details with min/typ/max tables, absolute maximum ratings, pin configurations, common part numbers, and pro tips
- **16 components** — Resistor, LED, push button, piezo speaker, capacitor, potentiometer, diode, transistor, servo motor, DC motor, photoresistor, temperature sensor, ultrasonic sensor, LCD display, relay, RGB LED
- **Dark / Light mode** — Persists across sessions
- **Camera-first flow** — Designed for mobile: snap a photo and learn
- **Offline-capable** — After the first visit (which caches the models), all AI features work without an internet connection

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, static export) |
| 3D | Three.js via React Three Fiber + Drei |
| Styling | Tailwind CSS (black & white palette) |
| AI Runtime | Transformers.js 3 + ONNX Runtime Web (in-browser) |
| Image Classification | CLIP ViT-B/16 (`Xenova/clip-vit-base-patch16`, int8 quantized) |
| Text-to-Speech | MMS-TTS English (`Xenova/mms-tts-eng`, int8 quantized) |
| Language | TypeScript |
| Deploy | Vercel, or any static host (pure static output to `out/`) |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. That's it — no API keys or environment variables needed.

### Other commands

```bash
npm run build    # Production build (outputs to out/)
npm run lint     # Run ESLint
npx serve out    # Serve the static build locally
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, metadata, favicon, OG tags
│   ├── page.tsx                # Home page (renders HomeClient)
│   ├── manifest.ts             # PWA manifest
│   └── globals.css             # Tailwind directives, animations
├── components/
│   ├── Header.tsx              # App header with dark/light toggle
│   ├── HomeClient.tsx          # Main app: camera flow + browse grid
│   ├── ImageUpload.tsx         # Drag & drop / camera image upload
│   ├── ComponentCard.tsx       # Card: 3D viewer + specs + voice + power + datasheet
│   ├── ComponentViewer.tsx     # Three.js canvas with model router + context management
│   └── models/
│       ├── ResistorModel.tsx
│       ├── LEDModel.tsx
│       ├── ButtonModel.tsx
│       ├── SpeakerModel.tsx
│       ├── CapacitorModel.tsx
│       ├── PotentiometerModel.tsx
│       ├── DiodeModel.tsx
│       ├── TransistorModel.tsx
│       └── GenericModel.tsx    # Fallback for components without custom models
├── data/
│   └── components.ts           # 16 component definitions + datasheet info
└── hooks/
    ├── useTheme.ts              # Dark/light mode with localStorage
    ├── useSpeech.ts             # TTS wrapper (delegates to useLocalTTS)
    ├── useLocalTTS.ts           # In-browser MMS-TTS via Transformers.js
    ├── useLocalClassifier.ts    # In-browser CLIP zero-shot via Transformers.js
    └── useComponentIdentifier.ts # Image → component matching with confidence scoring

public/
└── models/
    └── Xenova/
        ├── clip-vit-base-patch16/   # CLIP vision + text encoders (146 MB)
        │   ├── onnx/
        │   │   ├── vision_model_quantized.onnx
        │   │   └── text_model_quantized.onnx
        │   ├── config.json
        │   ├── tokenizer.json
        │   └── ...
        └── mms-tts-eng/             # MMS text-to-speech (38 MB)
            ├── onnx/
            │   └── model_quantized.onnx
            ├── config.json
            ├── tokenizer.json
            └── ...
```

## How the AI Works

### Image Classification (CLIP)

When a user uploads a photo, the app runs **CLIP ViT-B/16** entirely in the browser:

1. The image is resized to 1024px max and compressed to JPEG
2. CLIP encodes the image into a 512-dimensional vector
3. CLIP encodes ~30 candidate text labels (e.g. "a photo of a resistor") into vectors
4. Cosine similarity ranks the best match
5. Scores are aggregated per component; a 3% confidence threshold filters noise

The model weights are loaded once from `/models/` (your CDN), cached by the browser, and reused across all subsequent identifications.

### Text-to-Speech (MMS-TTS)

When a user clicks the voice button, the app runs **MMS-TTS-ENG** in the browser:

1. Text is split into sentences for progressive playback
2. Each sentence is synthesized to a Float32Array of PCM audio
3. PCM is encoded as a WAV blob and played via the Audio API
4. Playback starts after the first sentence — no waiting for the full text

### Embedded Models

All model weights are bundled in `public/models/` (185 MB total, int8 quantized):

| Model | Purpose | Size | Files |
|-------|---------|------|-------|
| CLIP ViT-B/16 | Image classification | 146 MB | `vision_model_quantized.onnx` + `text_model_quantized.onnx` |
| MMS-TTS-ENG | Text-to-speech | 38 MB | `model_quantized.onnx` |

Models are served as static files from your hosting provider's CDN (e.g. Vercel Edge Network). The browser caches them after the first load — subsequent visits load models instantly from disk cache.

## Components Included

| Component | Category | 3D Model | Interactive | Datasheet |
|-----------|----------|----------|------------|-----------|
| Resistor | Passive | Custom | Rotate | Yes |
| LED | Output | Custom | Rotate, Power on/off | Yes |
| Push Button | Input | Custom | Rotate, Press | Yes |
| Piezo Speaker | Output | Custom | Rotate, Power on/off | Yes |
| Capacitor | Passive | Custom | Rotate | Yes |
| Potentiometer | Input | Custom | Rotate | Yes |
| Diode | Passive | Custom | Rotate | Yes |
| Transistor | Active | Custom | Rotate | Yes |
| Servo Motor | Output | Generic | Rotate, Power on/off | Yes |
| DC Motor | Output | Generic | Rotate, Power on/off | Yes |
| Photoresistor (LDR) | Input | Generic | Rotate | Yes |
| Temperature Sensor | Input | Generic | Rotate | Yes |
| Ultrasonic Sensor | Input | Generic | Rotate | Yes |
| LCD Display | Output | Generic | Rotate | Yes |
| Relay | Active | Generic | Rotate, Power on/off | Yes |
| RGB LED | Output | Generic | Rotate, Power on/off | Yes |

Each component card includes:
- **Beginner view**: Plain-language description, key specs, circuit example, voice description, 3D model
- **Advanced view** (expandable): Absolute maximum ratings, pin configuration, min/typ/max electrical characteristics, common part numbers, pro tips

## Adding New Components

The codebase is modular — adding a new component takes three steps:

### 1. Define the component data

Add an entry to the array in `src/data/components.ts`:

```typescript
{
  id: 'my-component',
  name: 'My Component',
  category: 'passive',
  hasActiveState: false,
  description: 'A beginner-friendly description...',
  voiceDescription: 'Text read aloud by AI voice...',
  specs: [
    { label: 'Type', value: 'Example' },
  ],
  circuitExample: 'How to wire it up...',
  clipLabel: 'a photo of my component',
  datasheetInfo: {               // optional — enables "Datasheet Details" accordion
    maxRatings: [{ parameter: 'Max Voltage', value: '5 V' }],
    pinout: 'Pin 1 = VCC, Pin 2 = GND...',
    characteristics: [
      { parameter: 'Operating Voltage', min: '3.3', typical: '5', max: '5.5', unit: 'V' },
    ],
    partNumbers: ['PART-001', 'PART-002'],
    tips: 'Expert advice for experienced users...',
  },
}
```

### 2. Create a 3D model (optional)

Create `src/components/models/MyComponentModel.tsx`. If you skip this step, the `GenericModel` (IC chip shape) is used automatically.

### 3. Register in the viewer (if custom model)

In `src/components/ComponentViewer.tsx`, add an import and switch case:

```typescript
case 'my-component':
  return <MyComponentModel />
```

## Design Principles

- **Zero external dependencies** — All AI runs in-browser; no API keys, no server-side processing, no third-party calls
- **Black and white only** — Clean monochrome UI, realistic colors only in 3D models
- **Camera-first** — Primary flow is snap-and-learn, browsing is secondary
- **Beginner-first, expert-ready** — Plain language by default; expandable datasheet details for experienced users
- **Fast after first load** — Models are cached by the browser; repeat visits start instantly
- **Simple 3D models** — Stylized primitives built from Three.js geometries
- **Stable WebGL** — Context-managed canvas lifecycle prevents crashes when browsing many components
- **Fully static** — `output: 'export'` produces pure static files; deployable anywhere with no server

## Deployment

The app builds as a **fully static site** (`output: 'export'` in `next.config.js`). No serverless functions, no Node.js server — just HTML, JS, CSS, and model files in `out/`.

### Vercel

```bash
npx vercel --prod
```

Or connect the GitHub repository to [vercel.com](https://vercel.com) for automatic deployments. No environment variables needed. The `public/models/` directory (185 MB) is served as static assets from Vercel's Edge Network.

### Any static host

The `out/` directory can be deployed to any static hosting provider (Netlify, Cloudflare Pages, GitHub Pages, S3 + CloudFront, etc.). Just point your host at the `out/` folder after `npm run build`.

## Browser Support

Requires a modern browser with:
- WebGL (for Three.js 3D rendering)
- WebAssembly (for ONNX Runtime — runs the AI models)
- Camera access (optional, for taking photos on mobile)

No internet connection required after the first visit (models are cached locally).

## License

See [LICENSE](./LICENSE) for details.
