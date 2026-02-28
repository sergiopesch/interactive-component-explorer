# Electronics Explorer

An AI-powered learning app that identifies electronic components from photos. Snap a picture of a resistor, LED, capacitor, or any Arduino Student Kit part — and instantly get an interactive 3D model, beginner-friendly specs, wiring instructions, and voice-guided descriptions.

## How It Works

1. **Snap or upload** — Take a photo with your camera or drag and drop an image
2. **AI identifies it** — CLIP (OpenAI's vision model on Hugging Face) classifies the component
3. **Learn about it** — See an interactive 3D model, specifications, circuit examples, and description
4. **Listen** — AI-powered text-to-speech reads the description aloud (Hugging Face MMS-TTS)

You can also **browse all 16 components** directly from the home screen.

## Features

- **AI component identification** — Upload a photo and CLIP zero-shot classification identifies the component
- **AI text-to-speech** — Natural voice descriptions via Hugging Face MMS-TTS, with Web Speech API fallback
- **Interactive 3D models** — Rotate resistors, LEDs, capacitors, transistors, and more
- **Power simulation** — Toggle LEDs, press buttons, spin motors, and activate relays
- **16 components** — Resistor, LED, push button, piezo speaker, capacitor, potentiometer, diode, transistor, servo motor, DC motor, photoresistor, temperature sensor, ultrasonic sensor, LCD display, relay, RGB LED
- **Dark / Light mode** — Persists across sessions
- **Camera-first flow** — Designed for mobile: snap a photo and learn
- **Beginner-friendly** — Plain language, real circuit examples, no jargon

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| 3D | Three.js via React Three Fiber + Drei |
| Styling | Tailwind CSS (black & white palette) |
| Computer Vision | CLIP (`openai/clip-vit-large-patch14`) via Hugging Face Inference API |
| Text-to-Speech | MMS-TTS (`facebook/mms-tts-eng`) via Hugging Face Inference API |
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
│       ├── identify/route.ts   # CLIP zero-shot image classification
│       └── speak/route.ts      # HF text-to-speech proxy
├── components/
│   ├── Header.tsx              # App header with dark/light toggle
│   ├── HomeClient.tsx          # Main app: camera flow + browse grid
│   ├── ImageUpload.tsx         # Drag & drop / camera image upload
│   ├── ComponentCard.tsx       # Card: 3D viewer + specs + voice + power
│   ├── ComponentViewer.tsx     # Three.js canvas with model router
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
│   └── components.ts           # 16 component definitions (single source of truth)
└── hooks/
    ├── useTheme.ts              # Dark/light mode with localStorage
    ├── useSpeech.ts             # HF TTS with Web Speech API fallback
    └── useComponentIdentifier.ts # CLIP identification hook
```

## Components Included

| Component | Category | 3D Model | Interactive |
|-----------|----------|----------|------------|
| Resistor | Passive | Custom | Rotate |
| LED | Output | Custom | Rotate, Power on/off |
| Push Button | Input | Custom | Rotate, Press |
| Piezo Speaker | Output | Custom | Rotate, Power on/off |
| Capacitor | Passive | Custom | Rotate |
| Potentiometer | Input | Custom | Rotate |
| Diode | Passive | Custom | Rotate |
| Transistor | Active | Custom | Rotate |
| Servo Motor | Output | Generic | Rotate, Power on/off |
| DC Motor | Output | Generic | Rotate, Power on/off |
| Photoresistor (LDR) | Input | Generic | Rotate |
| Temperature Sensor | Input | Generic | Rotate |
| Ultrasonic Sensor | Input | Generic | Rotate |
| LCD Display | Output | Generic | Rotate |
| Relay | Active | Generic | Rotate, Power on/off |
| RGB LED | Output | Generic | Rotate, Power on/off |

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
- **Beginner-first** — Plain language, real examples, no unexplained jargon
- **Simple 3D models** — Stylized primitives built from Three.js geometries
- **Graceful fallbacks** — Web Speech API if HF TTS is unavailable

## Deployment

Deploy to Vercel:

```bash
npx vercel
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
