# CLAUDE.md — Agent Instructions for Electronics Explorer CLI

## Project Overview

Command-line electronics component explorer built with **Node.js**, **Transformers.js**, and **ONNX Runtime Node**. Identifies Arduino Student Kit components from photos using CLIP, shows specifications and datasheet details, and generates voice descriptions via MMS-TTS saved as WAV files.

**All AI runs locally.** No API keys, no cloud services, no internet required. CLIP identifies components from photos; MMS-TTS synthesizes voice descriptions. Model weights are embedded in `models/` and loaded from the filesystem.

## Quick Reference

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

No environment variables needed. No `.env` file required.

## Architecture

```
cli/
├── package.json                    # CLI dependencies (transformers, onnxruntime-node, commander, chalk)
├── tsconfig.json                   # TypeScript config targeting Node.js ES2022
├── bin/
│   └── electronics-cli.ts          # Entry point — Commander program with 4 subcommands
└── src/
    ├── commands/
    │   ├── identify.ts             # `identify <image>` — CLIP classification → component match
    │   ├── speak.ts                # `speak <id>` — MMS-TTS synthesis → WAV file
    │   ├── list.ts                 # `list` — browse all components by category
    │   └── info.ts                 # `info <id>` — full specs + datasheet details
    ├── services/
    │   ├── classifier.ts           # CLIP pipeline (singleton, loads from models/)
    │   ├── tts.ts                  # MMS-TTS pipeline (singleton, sentence-by-sentence)
    │   ├── identifier.ts           # Label mapping, score aggregation, threshold logic
    │   └── wav.ts                  # Float32 PCM → 16-bit WAV Buffer → file
    └── utils/
        └── progress.ts             # Terminal progress bar for model loading

data/
└── components.ts                   # 16 ElectronicsComponent definitions + DatasheetInfo

models/
└── Xenova/
    ├── clip-vit-base-patch16/      # CLIP vision + text encoders (146 MB, int8)
    │   ├── onnx/vision_model_quantized.onnx
    │   ├── onnx/text_model_quantized.onnx
    │   ├── config.json, tokenizer.json, preprocessor_config.json, ...
    └── mms-tts-eng/                # MMS text-to-speech (37 MB, int8)
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

In `cli/src/services/identifier.ts`, add extra label variants to `EXTRA_LABELS` for better classification accuracy:

```typescript
const EXTRA_LABELS: Record<string, string[]> = {
  // ...existing entries...
  'my-component': ['a photo of an alternate name', 'a photo of another variant'],
}
```

That's it. The `list`, `info`, `identify`, and `speak` commands automatically pick up new entries from the data array.

## Key Conventions

- **Node.js ES modules** — `"type": "module"` in both root and cli `package.json`
- **TypeScript strict mode** — `strict: true` in `tsconfig.json`
- **Singleton pattern** — CLIP and TTS pipelines are loaded once and reused
- **Model path resolution** — Uses `path.resolve(__dirname, '../../../models')` relative to service files
- **No external API calls** — All AI runs locally via embedded ONNX models
- **No environment variables** — Zero configuration needed
- **WAV output** — TTS generates 16-bit PCM WAV files (not system audio playback)
- **Commander.js** — CLI framework for argument parsing and subcommands
- **Chalk** — Terminal colors for formatted output (no colors in `--json` mode)

## Interface Contracts

```typescript
// Data shape — data/components.ts
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

// Classifier service — cli/src/services/classifier.ts
loadClassifier(onProgress?) → Promise<void>
classify(imagePath, labels) → Promise<ClassifyResult[]>

// TTS service — cli/src/services/tts.ts
loadTTS(onProgress?) → Promise<void>
synthesizeToFile(text, outputPath, onSentence?) → Promise<{ sampleRate, durationSeconds }>

// Identifier service — cli/src/services/identifier.ts
identifyComponent(imagePath, threshold?) → Promise<IdentifyResult | null>
identifyTopN(imagePath, n, threshold?) → Promise<IdentifyResult[]>

// WAV writer — cli/src/services/wav.ts
float32ToWavBuffer(samples, sampleRate) → Buffer
saveWav(filePath, samples, sampleRate) → void
```

## AI Pipeline Details

### Image Classification Flow
1. `identify <image>` receives a file path
2. `identifyComponent(imagePath)` is called
3. `classify(imagePath, ALL_CANDIDATE_LABELS)` runs CLIP via onnxruntime-node
4. CLIP encodes image + ~30 text labels into vectors, ranks by cosine similarity
5. Scores aggregated per component (best label wins), >=3% threshold required
6. Returns `{ component, confidence, reasoning }` or null

### TTS Flow
1. `speak <id>` resolves the component's `voiceDescription`
2. Text is split into sentences for progressive synthesis
3. MMS-TTS synthesizes each sentence → Float32Array PCM
4. All sentence audio is concatenated into a single buffer
5. PCM is encoded as WAV and written to disk via `fs.writeFileSync()`

### Model Loading
- Both models use a **singleton pattern** — loaded once, reused for the process lifetime
- Models load from `models/Xenova/` (resolved relative to service files), configured via:
  ```typescript
  env.localModelPath = path.resolve(__dirname, '../../../models') + '/'
  env.allowLocalModels = true
  env.allowRemoteModels = false
  ```
- Quantized with `dtype: 'q8'` (int8) for smaller size + faster inference
- Uses `onnxruntime-node` (native C++) instead of `onnxruntime-web` (WASM)

## Common Tasks

| Task | What to do |
|------|-----------|
| Add a component | Follow 2-step guide above |
| Change specs | Edit `specs` array in `data/components.ts` |
| Change voice text | Edit `voiceDescription` in `data/components.ts` |
| Improve CLIP accuracy | Add label variants to `EXTRA_LABELS` in `cli/src/services/identifier.ts` |
| Change CLI output format | Edit the command file in `cli/src/commands/` |
| Edit datasheet details | Edit `datasheetInfo` in `data/components.ts` |
| Update AI models | Replace ONNX files in `models/Xenova/` and update service config |
| Add a new command | Create file in `cli/src/commands/`, register in `cli/bin/electronics-cli.ts` |

## Constraints

- No external API calls — all AI runs locally via embedded ONNX models
- No environment variables — the app must work with zero configuration
- Model files in `models/` must stay under 100 MB each (GitHub file size limit)
- Node.js >= 18.0.0 required
- Platform support determined by `onnxruntime-node` binaries (Linux x64, macOS arm64/x64, Windows x64)

## Testing

No test framework is configured yet. If adding tests:
- Use `vitest` with `tsx` for TypeScript support
- Data module (`data/components.ts`) can be unit tested directly
- Service tests for `classifier.ts` and `tts.ts` should mock `@huggingface/transformers`
- WAV writer (`wav.ts`) can be tested with known PCM inputs
- Command tests can capture stdout and verify formatted output

## Dependencies

| Package | Purpose |
|---------|---------|
| `@huggingface/transformers` | Runs CLIP and MMS-TTS pipelines |
| `onnxruntime-node` | Native ONNX Runtime backend for Node.js |
| `commander` | CLI argument parsing and subcommands |
| `chalk` | Terminal colors for formatted output |
| `tsx` | Run TypeScript directly during development |
| `typescript` | Type checking and compilation |
