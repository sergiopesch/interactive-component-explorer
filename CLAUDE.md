# CLAUDE.md — Agent Instructions for Electronics Explorer

## Project Overview

Electronics component explorer with two interfaces: a **Node.js CLI** and a **browser terminal** (xterm.js). Both use **Transformers.js** to identify Arduino Student Kit components from photos using CLIP, show specifications and datasheet details, and generate voice descriptions via MMS-TTS.

**All AI runs locally.** No API keys, no cloud services. The CLI uses **onnxruntime-node** with model weights embedded in `models/`. The browser terminal uses **onnxruntime-web** (WASM) with models loaded from HuggingFace CDN and cached by the browser.

## Quick Reference

### CLI

```
cd cli
npm install           # Install dependencies
npx tsx bin/electronics-cli.ts list               # List all components
npx tsx bin/electronics-cli.ts info resistor       # Show component details
npx tsx bin/electronics-cli.ts identify photo.jpg  # Identify from photo
npx tsx bin/electronics-cli.ts speak resistor      # Generate WAV voice file
npm run build         # Compile TypeScript to dist/
npm run lint          # Type-check with tsc --noEmit
```

### Browser Terminal

```
cd web
npm install           # Install dependencies
npm run dev           # Start Vite dev server at http://localhost:5173
npm run build         # Build static site to web/dist/
npm run lint          # Type-check with tsc --noEmit
```

No environment variables needed. No `.env` file required.

## Architecture

```
cli/                                    # Node.js CLI application
├── package.json                        # Dependencies (transformers, onnxruntime-node, commander, chalk)
├── tsconfig.json                       # TypeScript config targeting Node.js ES2022
├── bin/
│   └── electronics-cli.ts              # Entry point — Commander program with 4 subcommands
└── src/
    ├── commands/
    │   ├── identify.ts                 # `identify <image>` — CLIP classification → component match
    │   ├── speak.ts                    # `speak <id>` — MMS-TTS synthesis → WAV file
    │   ├── list.ts                     # `list` — browse all components by category
    │   └── info.ts                     # `info <id>` — full specs + datasheet details
    ├── services/
    │   ├── classifier.ts               # CLIP pipeline (singleton, loads from models/)
    │   ├── tts.ts                      # MMS-TTS pipeline (singleton, sentence-by-sentence)
    │   ├── identifier.ts               # Label mapping, score aggregation, threshold logic
    │   └── wav.ts                      # Float32 PCM → 16-bit WAV Buffer → file
    └── utils/
        └── progress.ts                 # Terminal progress bar for model loading

web/                                    # Browser terminal (xterm.js + Vite)
├── package.json                        # Dependencies (xterm, transformers, onnxruntime-web, vite)
├── tsconfig.json                       # TypeScript config targeting browser ES2022
├── vite.config.ts                      # Vite build config with @data alias
├── vercel.json                         # Vercel static deploy config with COOP/COEP headers
├── index.html                          # Entry HTML with terminal container
└── src/
    ├── main.ts                         # App bootstrap, resize handling
    ├── shell.ts                        # xterm.js shell — command dispatch, history, tab completion
    ├── commands/
    │   ├── identify.ts                 # File picker → CLIP classification → terminal output
    │   ├── speak.ts                    # TTS synthesis → Web Audio playback + WAV download
    │   ├── list.ts                     # List components by category
    │   └── info.ts                     # Show component details + datasheet
    └── services/
        ├── classifier.ts               # CLIP pipeline (singleton, WASM, HuggingFace CDN)
        ├── tts.ts                      # MMS-TTS pipeline (singleton, WASM, HuggingFace CDN)
        ├── identifier.ts               # Label mapping, score aggregation (shared logic)
        └── wav.ts                      # Float32 PCM → WAV Blob (browser DataView)

data/
└── components.ts                       # 16 ElectronicsComponent definitions + DatasheetInfo (shared)

models/
└── Xenova/
    ├── clip-vit-base-patch16/          # CLIP vision + text encoders (146 MB, int8)
    │   ├── onnx/vision_model_quantized.onnx
    │   ├── onnx/text_model_quantized.onnx
    │   ├── config.json, tokenizer.json, preprocessor_config.json, ...
    └── mms-tts-eng/                    # MMS text-to-speech (37 MB, int8)
        ├── onnx/model_quantized.onnx
        ├── config.json, tokenizer.json, ...
```

## How to Add a New Component

### Step 1 — Add data entry in `data/components.ts`

Add an object to the `electronicsComponents` array:

```typescript
{
  id: 'capacitor',
  name: 'Capacitor',
  category: 'passive',
  hasActiveState: false,
  description: 'A capacitor stores...',
  voiceDescription: 'This is a capacitor...',
  specs: [
    { label: 'Capacitance', value: '100 μF' },
    { label: 'Voltage Rating', value: '25 V' },
  ],
  circuitExample: 'Connect the capacitor...',
  clipLabel: 'a photo of a capacitor',
  datasheetInfo: {
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

### Step 2 — Add extra CLIP labels (optional)

In both `cli/src/services/identifier.ts` and `web/src/services/identifier.ts`, add extra label variants to `EXTRA_LABELS` for better classification accuracy:

```typescript
const EXTRA_LABELS: Record<string, string[]> = {
  // ...existing entries...
  'my-component': ['a photo of an alternate name', 'a photo of another variant'],
}
```

That's it. The `list`, `info`, `identify`, and `speak` commands in both the CLI and browser terminal automatically pick up new entries from the shared data array.

## Key Conventions

- **Node.js ES modules** — `"type": "module"` in root, cli, and web `package.json`
- **TypeScript strict mode** — `strict: true` in all `tsconfig.json` files
- **Singleton pattern** — CLIP and TTS pipelines are loaded once and reused (both CLI and web)
- **Shared data layer** — `data/components.ts` is imported by both CLI and web via path aliases
- **CLI model path resolution** — Uses `path.resolve(__dirname, '../../../models')` relative to service files
- **Web model loading** — Uses HuggingFace CDN (`env.allowRemoteModels = true`), cached by the browser
- **No environment variables** — Zero configuration needed for either interface
- **CLI WAV output** — TTS generates 16-bit PCM WAV files via Node.js `Buffer`
- **Web WAV output** — TTS creates WAV `Blob` via `DataView`, plays via Web Audio, offers download
- **Commander.js** — CLI framework for argument parsing and subcommands
- **Chalk** — Terminal colors for CLI formatted output (no colors in `--json` mode)
- **xterm.js** — Browser terminal with ANSI escape codes, command history, and tab completion
- **Vite** — Web build tool with `@data` alias for shared component data

## Interface Contracts

```typescript
// Data shape — data/components.ts (shared by CLI and web)
interface ElectronicsComponent {
  id: string
  name: string
  category: 'passive' | 'active' | 'input' | 'output'
  hasActiveState: boolean
  description: string
  voiceDescription: string
  specs: { label: string; value: string }[]
  circuitExample: string
  clipLabel: string
  datasheetInfo?: DatasheetInfo
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

// CLI Classifier — cli/src/services/classifier.ts
loadClassifier(onProgress?) → Promise<void>
classify(imagePath, labels) → Promise<ClassifyResult[]>

// Web Classifier — web/src/services/classifier.ts
loadClassifier(onProgress?) → Promise<void>
classify(image: string | Blob, labels) → Promise<ClassifyResult[]>

// CLI TTS — cli/src/services/tts.ts
loadTTS(onProgress?) → Promise<void>
synthesizeToFile(text, outputPath, onSentence?) → Promise<{ sampleRate, durationSeconds }>

// Web TTS — web/src/services/tts.ts
loadTTS(onProgress?) → Promise<void>
synthesize(text, onSentence?) → Promise<{ samples: Float32Array, sampleRate }>

// Identifier — cli/src/services/identifier.ts & web/src/services/identifier.ts
identifyComponent(image, threshold?) → Promise<IdentifyResult | null>
identifyTopN(image, n, threshold?) → Promise<IdentifyResult[]>

// CLI WAV writer — cli/src/services/wav.ts
float32ToWavBuffer(samples, sampleRate) → Buffer
saveWav(filePath, samples, sampleRate) → void

// Web WAV writer — web/src/services/wav.ts
float32ToWavBlob(samples, sampleRate) → Blob

// Web Shell — web/src/shell.ts
interface TermWriter {
  write(text: string): void
  writeln(text: string): void
  bold(text: string): void
  underline(text: string): void
  error(text: string): void
  warn(text: string): void
  clearLine(): void
}
```

## AI Pipeline Details

### Image Classification Flow

**CLI:**
1. `identify <image>` receives a file path
2. `identifyComponent(imagePath)` is called
3. `classify(imagePath, ALL_CANDIDATE_LABELS)` runs CLIP via onnxruntime-node
4. CLIP encodes image + ~30 text labels into vectors, ranks by cosine similarity
5. Scores aggregated per component (best label wins), >=3% threshold required
6. Returns `{ component, confidence, reasoning }` or null

**Web:**
1. `identify` opens a file picker dialog
2. Selected file is converted to a Blob URL via `URL.createObjectURL()`
3. Same CLIP classification pipeline runs via onnxruntime-web (WASM)
4. Same score aggregation and threshold logic
5. Results rendered to xterm.js terminal with ANSI colors

### TTS Flow

**CLI:**
1. `speak <id>` resolves the component's `voiceDescription`
2. Text is split into sentences for progressive synthesis
3. MMS-TTS synthesizes each sentence → Float32Array PCM
4. All sentence audio is concatenated into a single buffer
5. PCM is encoded as WAV and written to disk via `fs.writeFileSync()`

**Web:**
1. `speak <id>` resolves the component's `voiceDescription`
2. Same sentence splitting and progressive synthesis
3. MMS-TTS runs via onnxruntime-web (WASM)
4. PCM is encoded as a WAV Blob via `DataView`
5. Audio plays via `new Audio(URL.createObjectURL(blob))` and WAV file is offered for download

### Model Loading

**CLI:**
- Models load from `models/Xenova/` (resolved relative to service files), configured via:
  ```typescript
  env.localModelPath = path.resolve(__dirname, '../../../models') + '/'
  env.allowLocalModels = true
  env.allowRemoteModels = false
  ```
- Uses `onnxruntime-node` (native C++)

**Web:**
- Models download from HuggingFace CDN on first use, configured via:
  ```typescript
  env.allowLocalModels = false
  env.allowRemoteModels = true
  ```
- Uses `onnxruntime-web` (WASM) with `device: 'wasm'`
- Models are cached by the browser after first download

**Both:**
- Singleton pattern — loaded once, reused for the session lifetime
- Quantized with `dtype: 'q8'` (int8) for smaller size + faster inference

## Common Tasks

| Task | What to do |
|------|-----------|
| Add a component | Follow 2-step guide above (update `EXTRA_LABELS` in both `cli/` and `web/`) |
| Change specs | Edit `specs` array in `data/components.ts` (shared by both interfaces) |
| Change voice text | Edit `voiceDescription` in `data/components.ts` |
| Improve CLIP accuracy | Add label variants to `EXTRA_LABELS` in both `cli/src/services/identifier.ts` and `web/src/services/identifier.ts` |
| Change CLI output format | Edit the command file in `cli/src/commands/` |
| Change web terminal output | Edit the command file in `web/src/commands/` |
| Edit datasheet details | Edit `datasheetInfo` in `data/components.ts` |
| Update AI models (CLI) | Replace ONNX files in `models/Xenova/` and update service config |
| Update AI models (web) | Models load from HuggingFace CDN — update model name in `web/src/services/` |
| Add a CLI command | Create file in `cli/src/commands/`, register in `cli/bin/electronics-cli.ts` |
| Add a web command | Create file in `web/src/commands/`, add case in `web/src/shell.ts` `executeCommand()` |
| Change terminal theme | Edit the `theme` object in `web/src/shell.ts` |
| Deploy to Vercel | Run `cd web && npm run build`, deploy `web/` directory |

## Constraints

- No external API calls from the CLI — all AI runs locally via embedded ONNX models
- Web models load from HuggingFace CDN (first use only, then browser-cached)
- No environment variables — both interfaces must work with zero configuration
- Model files in `models/` must stay under 100 MB each (GitHub file size limit)
- Node.js >= 18.0.0 required for CLI
- CLI platform support determined by `onnxruntime-node` binaries (Linux x64, macOS arm64/x64, Windows x64)
- Browser terminal requires SharedArrayBuffer (HTTPS or localhost + COOP/COEP headers)
- Web deployment must include `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers

## Testing

No test framework is configured yet. If adding tests:
- Use `vitest` with `tsx` for TypeScript support
- Data module (`data/components.ts`) can be unit tested directly
- Service tests for `classifier.ts` and `tts.ts` should mock `@huggingface/transformers`
- WAV writer (`wav.ts`) can be tested with known PCM inputs (both Node Buffer and browser Blob versions)
- CLI command tests can capture stdout and verify formatted output
- Web command tests can mock `TermWriter` and verify output calls
- Web shell tests can simulate keyboard input and verify command dispatch

## Dependencies

### CLI (`cli/package.json`)

| Package | Purpose |
|---------|---------|
| `@huggingface/transformers` | Runs CLIP and MMS-TTS pipelines |
| `onnxruntime-node` | Native ONNX Runtime backend for Node.js |
| `commander` | CLI argument parsing and subcommands |
| `chalk` | Terminal colors for formatted output |
| `tsx` | Run TypeScript directly during development |
| `typescript` | Type checking and compilation |

### Browser Terminal (`web/package.json`)

| Package | Purpose |
|---------|---------|
| `@huggingface/transformers` | Runs CLIP and MMS-TTS pipelines (WASM) |
| `onnxruntime-web` | WebAssembly ONNX Runtime backend for browsers |
| `@xterm/xterm` | Terminal emulator for the browser |
| `@xterm/addon-fit` | Auto-resize terminal to container |
| `@xterm/addon-web-links` | Clickable URLs in terminal output |
| `vite` | Build tool and dev server |
| `typescript` | Type checking |
