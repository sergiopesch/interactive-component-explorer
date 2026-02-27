# Electronics Explorer

An AI-powered learning app that identifies electronic components from photos. Snap a picture of a resistor, LED, capacitor, or any Arduino Student Kit part — and instantly get an interactive 3D model, beginner-friendly specs, wiring instructions, voice-guided descriptions, and detailed datasheet information for advanced users.

## How It Works

1. **Snap or upload** — Take a photo with your camera or drag and drop an image
2. **AI identifies it** — A Vision Language Model analyzes the image and identifies the component (with VQA and CLIP fallbacks for reliability)
3. **Learn about it** — See an interactive 3D model, specifications, circuit examples, and a plain-language description
4. **Listen** — Streaming AI text-to-speech reads the description aloud sentence by sentence
5. **Go deeper** — Toggle "Datasheet Details" for max ratings, pin configurations, electrical characteristics, part numbers, and pro tips

You can also **browse all 16 components** directly from the home screen with search and category filtering.

## Features

- **AI component identification** — 3-strategy fallback chain: Vision Language Model (Llama 3.2 Vision) → Visual QA (BLIP) → CLIP zero-shot classification
- **Streaming AI text-to-speech** — Sentence-by-sentence audio streaming via Hugging Face MMS-TTS, with single-request and Web Speech API fallbacks
- **Interactive 3D models** — Rotate resistors, LEDs, capacitors, transistors, and more (WebGL context-managed for stable browsing)
- **Power simulation** — Toggle LEDs, press buttons, spin motors, and activate relays
- **Beginner + Advanced modes** — Beginner-friendly descriptions by default; expandable datasheet details with min/typ/max tables, absolute maximum ratings, pin configurations, common part numbers, and pro tips
- **16 components** — Resistor, LED, push button, piezo speaker, capacitor, potentiometer, diode, transistor, servo motor, DC motor, photoresistor, temperature sensor, ultrasonic sensor, LCD display, relay, RGB LED
- **Dark / Light mode** — Persists across sessions
- **Camera-first flow** — Designed for mobile: snap a photo and learn
- **Stable browse mode** — WebGL contexts are created on demand and kept alive to prevent crashes when browsing all components

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| 3D | Three.js via React Three Fiber + Drei |
| Styling | Tailwind CSS (black & white palette) |
| Image Analysis (primary) | Llama 3.2 11B Vision (`meta-llama/Llama-3.2-11B-Vision-Instruct`) via Hugging Face Inference API |
| Image Analysis (fallback 1) | BLIP VQA (`Salesforce/blip-vqa-large`) via Hugging Face Inference API |
| Image Analysis (fallback 2) | CLIP (`openai/clip-vit-large-patch14`) via Hugging Face Inference API |
| Text-to-Speech | MMS-TTS (`facebook/mms-tts-eng`) via Hugging Face Inference API (streaming + single-request) |
| TTS Fallback | Web Speech API (browser-native) |
| Language | TypeScript |
| Deploy | Vercel (zero-config) |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Then add your Hugging Face API token:

```
HF_TOKEN=hf_your_token_here
# Optional alias used in some deployments (e.g. Vercel)
HF_VARIABLE=hf_your_token_here
```

Get a free token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other commands

```bash
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, metadata, favicon, OG tags
│   ├── page.tsx                # Home page (renders HomeClient)
│   ├── manifest.ts             # PWA manifest
│   ├── globals.css             # Tailwind directives, animations
│   └── api/
│       ├── identify/route.ts   # Multi-strategy image identification (VLM → VQA → CLIP)
│       ├── speak/route.ts      # Single-request HF text-to-speech
│       └── speak-stream/route.ts # Streaming sentence-by-sentence TTS (NDJSON)
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
    ├── useSpeech.ts             # Streaming TTS → single TTS → Web Speech fallback
    └── useComponentIdentifier.ts # Multi-strategy identification hook
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/identify` | POST | Identifies an electronic component from a base64-encoded image. Uses a 3-strategy chain: VLM chat completion → BLIP Visual QA → CLIP zero-shot. Returns `{ componentId, confidence, label, reasoning }`. |
| `/api/speak` | POST | Generates speech audio from text using Hugging Face MMS-TTS. Returns a single audio blob (FLAC). |
| `/api/speak-stream` | POST | Streaming TTS. Splits text into sentences, generates audio per sentence, and streams results as NDJSON. Each line: `{ index, total, audio: "base64..." }`. Client starts playback after the first sentence arrives. |

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

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HF_TOKEN` | Yes* | Primary Hugging Face API token for AI features (component identification + TTS). Free at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `HF_VARIABLE` | Yes* | Alternate token name supported for Vercel deployments. |

*At least one of `HF_TOKEN` or `HF_VARIABLE` must be set.

## Design Principles

- **Black and white only** — Clean monochrome UI, realistic colors only in 3D models
- **Camera-first** — Primary flow is snap-and-learn, browsing is secondary
- **Beginner-first, expert-ready** — Plain language by default; expandable datasheet details for experienced users
- **Multi-strategy AI** — Fallback chains for both identification and TTS ensure the app works even when individual models are unavailable
- **Simple 3D models** — Stylized primitives built from Three.js geometries
- **Stable WebGL** — Context-managed canvas lifecycle prevents crashes when browsing many components
- **Graceful fallbacks** — Streaming TTS → single-request TTS → Web Speech API

## Git & Branch Strategy

- Use a **single long-lived branch**: `main` (the repository default branch).
- Do not create parallel deploy branches (`master`, `work`, etc.).
- Deploy from the default branch only (via Vercel Git integration or `vercel --prod` from `main`).

## Deployment

Deploy to Vercel:

```bash
npx vercel --prod
```

Add either `HF_TOKEN` or `HF_VARIABLE` to your Vercel project's Environment Variables in the dashboard.

Or connect the GitHub repository to [vercel.com](https://vercel.com) for automatic deployments.

## Browser Support

Requires a modern browser with:
- WebGL (for Three.js 3D rendering)
- Internet connection (for AI-powered identification and text-to-speech)
- Camera access (optional, for taking photos on mobile)

## License

See [LICENSE](./LICENSE) for details.
