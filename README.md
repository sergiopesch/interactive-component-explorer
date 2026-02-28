# Electronics Explorer

Identify electronic components from photos and generate voice descriptions using local AI models. Available as a **Node.js CLI** and a **browser terminal** (xterm.js). Built for the Arduino Student Kit — covers 16 common components with specs, datasheet details, circuit examples, and AI-generated speech.

**No API keys. No cloud services.** All AI runs locally — via embedded ONNX models on the CLI, or via WebAssembly in the browser.

## How It Works

1. **Point it at a photo** — Pass an image file (CLI) or use the file picker (browser)
2. **AI identifies it** — A local CLIP vision model classifies the component
3. **Get details** — See specs, circuit examples, and datasheet information
4. **Generate speech** — MMS-TTS synthesizes a voice description (WAV file on CLI, audio playback in browser)

## Features

- **Local AI identification** — CLIP zero-shot image classification via Transformers.js (onnxruntime-node on CLI, onnxruntime-web WASM in browser)
- **Local AI text-to-speech** — MMS-TTS generates natural speech
- **Two interfaces** — Node.js CLI for scripting, xterm.js browser terminal for interactive use
- **16 components** — Resistor, LED, push button, piezo speaker, capacitor, potentiometer, diode, transistor, servo motor, DC motor, photoresistor, temperature sensor, ultrasonic sensor, LCD display, relay, RGB LED
- **Datasheet details** — Max ratings, pin configurations, electrical characteristics, part numbers, pro tips
- **JSON output** — CLI commands support `--json` for scripting and piping
- **Vercel-deployable** — Browser terminal ships as a static site with COOP/COEP headers for SharedArrayBuffer

## Getting Started

### CLI

```bash
cd cli
npm install
```

```bash
# During development (runs TypeScript directly)
npx tsx bin/electronics-cli.ts --help

# Or build and run compiled JS
npm run build
node dist/cli/bin/electronics-cli.js --help
```

### Browser Terminal

```bash
cd web
npm install
npm run dev       # Start dev server at http://localhost:5173
```

Open the browser and type commands directly in the xterm.js terminal (`list`, `info resistor`, `identify`, `speak led`, etc.). Models download from HuggingFace CDN on first use and are cached by the browser.

## Commands

### `list` — Browse all components

```bash
npx tsx bin/electronics-cli.ts list
npx tsx bin/electronics-cli.ts list --category passive
npx tsx bin/electronics-cli.ts list --json
```

### `info <component-id>` — Component details

```bash
npx tsx bin/electronics-cli.ts info resistor
npx tsx bin/electronics-cli.ts info capacitor --json
```

### `identify <image>` — Classify a photo

```bash
npx tsx bin/electronics-cli.ts identify ./photo.jpg
npx tsx bin/electronics-cli.ts identify ./photo.png --json
npx tsx bin/electronics-cli.ts identify ./photo.jpg --top 3
npx tsx bin/electronics-cli.ts identify ./photo.jpg --threshold 10
```

**Options:**
- `--json` — Output as JSON
- `--top <n>` — Show top N matches (default: 1)
- `--threshold <pct>` — Minimum confidence percentage (default: 3)

### `speak <component-id>` — Generate voice description

```bash
npx tsx bin/electronics-cli.ts speak resistor
npx tsx bin/electronics-cli.ts speak led --output ./led-description.wav
npx tsx bin/electronics-cli.ts speak capacitor --text "Custom text to speak"
```

**Options:**
- `-o, --output <path>` — Output WAV file path (default: `./<component-id>.wav`)
- `-t, --text <text>` — Speak custom text instead of the component's voice description

## AI Models

Both models are int8 quantized (183 MB total) and run via Transformers.js:

| Model | Purpose | Size | CLI Backend | Web Backend |
|-------|---------|------|-------------|-------------|
| CLIP ViT-B/16 | Image classification | 146 MB | onnxruntime-node | onnxruntime-web (WASM) |
| MMS-TTS-ENG | Text-to-speech | 37 MB | onnxruntime-node | onnxruntime-web (WASM) |

**CLI:** Models load from `models/Xenova/` on the filesystem. No internet required.
**Web:** Models download from HuggingFace CDN on first use and are cached by the browser.

## Project Structure

```
interactive-component-explorer/
├── cli/                                # Node.js CLI application
│   ├── package.json                    # CLI dependencies
│   ├── tsconfig.json                   # TypeScript config (Node.js)
│   ├── bin/
│   │   └── electronics-cli.ts          # Entry point (commander)
│   └── src/
│       ├── commands/
│       │   ├── identify.ts             # identify command
│       │   ├── speak.ts                # speak command
│       │   ├── list.ts                 # list command
│       │   └── info.ts                 # info command
│       ├── services/
│       │   ├── classifier.ts           # CLIP pipeline (onnxruntime-node)
│       │   ├── tts.ts                  # MMS-TTS pipeline (onnxruntime-node)
│       │   ├── identifier.ts           # Component matching logic
│       │   └── wav.ts                  # PCM → WAV file (Node Buffer)
│       └── utils/
│           └── progress.ts             # Terminal progress bar
├── web/                                # Browser terminal (xterm.js)
│   ├── package.json                    # Web dependencies (Vite, xterm, onnxruntime-web)
│   ├── tsconfig.json                   # TypeScript config (browser)
│   ├── vite.config.ts                  # Vite build config
│   ├── vercel.json                     # Vercel static deploy with COOP/COEP headers
│   ├── index.html                      # Entry HTML
│   └── src/
│       ├── main.ts                     # App bootstrap
│       ├── shell.ts                    # xterm.js shell (history, tab completion, ANSI)
│       ├── commands/
│       │   ├── identify.ts             # File picker → CLIP classification
│       │   ├── speak.ts                # TTS → Web Audio playback + WAV download
│       │   ├── list.ts                 # List components
│       │   └── info.ts                 # Show component details
│       └── services/
│           ├── classifier.ts           # CLIP pipeline (onnxruntime-web WASM)
│           ├── tts.ts                  # MMS-TTS pipeline (onnxruntime-web WASM)
│           ├── identifier.ts           # Component matching logic
│           └── wav.ts                  # PCM → WAV Blob (browser-native)
├── data/
│   └── components.ts                   # 16 component definitions (shared)
├── models/
│   └── Xenova/
│       ├── clip-vit-base-patch16/      # CLIP (146 MB)
│       └── mms-tts-eng/               # MMS-TTS (37 MB)
├── package.json                        # Root (type: module)
├── CLAUDE.md
├── README.md
└── .gitignore
```

## Components Included

| Component | Category | ID |
|-----------|----------|----|
| Resistor | Passive | `resistor` |
| Capacitor | Passive | `capacitor` |
| Diode | Passive | `diode` |
| Transistor | Active | `transistor` |
| Relay | Active | `relay` |
| Push Button | Input | `button` |
| Potentiometer | Input | `potentiometer` |
| Photoresistor (LDR) | Input | `photoresistor` |
| Temperature Sensor | Input | `temp-sensor` |
| Ultrasonic Sensor | Input | `ultrasonic` |
| LED | Output | `led` |
| Piezo Speaker | Output | `speaker` |
| Servo Motor | Output | `servo` |
| DC Motor | Output | `dc-motor` |
| LCD Display | Output | `lcd` |
| RGB LED | Output | `rgb-led` |

## Deploying the Browser Terminal

The `web/` directory deploys as a static site. A `vercel.json` is included for one-click Vercel deployment:

```bash
cd web
npm run build     # Outputs to web/dist/
```

The Vercel config sets `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers, which are required for `SharedArrayBuffer` (used by the multithreaded WASM runtime). If deploying elsewhere, ensure these headers are set:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## System Requirements

**CLI:**
- Node.js >= 18.0.0
- Platforms: Linux x64, macOS arm64/x64, Windows x64 (determined by `onnxruntime-node` binary compatibility)

**Browser terminal:**
- Any modern browser with WebAssembly support (Chrome, Firefox, Safari, Edge)
- SharedArrayBuffer support (requires HTTPS or localhost + COOP/COEP headers)

## License

See [LICENSE](./LICENSE) for details.
