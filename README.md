# Electronics Explorer CLI

A command-line tool that identifies electronic components from photos and generates voice descriptions using local AI models. Built for the Arduino Student Kit — covers 16 common components with specs, datasheet details, circuit examples, and AI-generated speech.

**No API keys. No cloud services. No internet required.** All AI runs locally via embedded ONNX models.

## How It Works

1. **Point it at a photo** — Pass an image file of an electronic component
2. **AI identifies it** — A local CLIP vision model classifies the component
3. **Get details** — See specs, circuit examples, and datasheet information
4. **Generate speech** — MMS-TTS synthesizes a voice description as a WAV file

## Features

- **Local AI identification** — CLIP zero-shot image classification via Transformers.js + ONNX Runtime Node (no server, no API key)
- **Local AI text-to-speech** — MMS-TTS generates natural speech, saved as WAV files
- **Self-hosted models** — Quantized ONNX weights bundled in `models/` — zero external calls
- **16 components** — Resistor, LED, push button, piezo speaker, capacitor, potentiometer, diode, transistor, servo motor, DC motor, photoresistor, temperature sensor, ultrasonic sensor, LCD display, relay, RGB LED
- **Datasheet details** — Max ratings, pin configurations, electrical characteristics, part numbers, pro tips
- **JSON output** — All commands support `--json` for scripting and piping

## Getting Started

### 1. Install dependencies

```bash
cd cli
npm install
```

### 2. Run the CLI

```bash
# During development (runs TypeScript directly)
npx tsx bin/electronics-cli.ts --help

# Or build and run compiled JS
npm run build
node dist/cli/bin/electronics-cli.js --help
```

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

All model weights are bundled locally (183 MB total, int8 quantized):

| Model | Purpose | Size | Backend |
|-------|---------|------|---------|
| CLIP ViT-B/16 | Image classification | 146 MB | onnxruntime-node |
| MMS-TTS-ENG | Text-to-speech | 37 MB | onnxruntime-node |

Models are loaded from `models/Xenova/` on first use and cached in memory for subsequent calls. No internet connection required.

## Project Structure

```
interactive-component-explorer/
├── cli/
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
│       │   ├── classifier.ts           # CLIP pipeline
│       │   ├── tts.ts                  # MMS-TTS pipeline
│       │   ├── identifier.ts           # Component matching logic
│       │   └── wav.ts                  # PCM → WAV file writer
│       └── utils/
│           └── progress.ts             # Terminal progress bar
├── data/
│   └── components.ts                   # 16 component definitions
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

## System Requirements

- **Node.js** >= 18.0.0
- **Platforms**: Linux x64, macOS arm64/x64, Windows x64 (determined by `onnxruntime-node` binary compatibility)

## License

See [LICENSE](./LICENSE) for details.
