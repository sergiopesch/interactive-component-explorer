# Electronics Explorer

An AI-powered learning app that identifies electronic components from photos and teaches how they work with interactive 3D cards.

## Runtime architecture (safe migration)

The app now uses a **local-first** strategy:

1. **Primary path (local in browser):**
   - Component identification runs in-browser using a CLIP pipeline loaded at runtime via Transformers.js CDN.
   - Voice playback uses browser-native Web Speech API.
2. **Safe fallback path (server API):**
   - If local browser inference is unavailable, the app falls back to `/api/identify` (Hugging Face Inference API).
   - If Web Speech is unavailable, the app falls back to `/api/speak` (Hugging Face TTS).

This keeps Vercel deployments stable while moving core UX toward local execution.

## Features

- Local-first component identification from image uploads
- Local-first speech playback
- API fallback for older/limited browser environments
- Interactive Three.js component models with power-state animations
- 16 component cards with specs, examples, and voice descriptions

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| 3D | Three.js + React Three Fiber + Drei |
| Styling | Tailwind CSS |
| Local CV | Transformers.js CDN + CLIP (`Xenova/clip-vit-base-patch32`) |
| Fallback CV | Hugging Face Inference API (`openai/clip-vit-large-patch14`) |
| Local TTS | Web Speech API |
| Fallback TTS | Hugging Face Inference API (`facebook/mms-tts-eng`) |

## Environment variables

These are now **optional fallback credentials**:

```bash
HF_TOKEN=hf_your_token_here
# Optional alias used on Vercel
HF_VARIABLE=hf_your_token_here
```

- If unset, local browser paths still work.
- Fallback API routes require one of the variables above.

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Deploying on Vercel

- Recommended: keep `HF_TOKEN` (or `HF_VARIABLE`) configured so fallback routes remain available.
- Local-first browser inference still works without token when browser capabilities/network permit.

## License

See [LICENSE](./LICENSE).
