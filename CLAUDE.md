# CLAUDE.md — Agent Instructions for Electronics Explorer

## Project Overview

Interactive electronics component explorer built with **Next.js 14/15**, **Three.js** (React Three Fiber), and **Tailwind CSS**.

- Component identification runs **in-browser** via a local transformers pipeline loaded from CDN (`@xenova/transformers`, CLIP model).
- Speech output runs **in-browser** via the **Web Speech API**.
- No server-side Hugging Face inference dependency.

## Quick Reference

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Architecture

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── api/identify/route.ts   # Deprecated endpoint (410)
│   └── api/speak/route.ts      # Deprecated endpoint (410)
├── components/
│   ├── Header.tsx
│   ├── HomeClient.tsx
│   ├── ImageUpload.tsx
│   ├── ComponentCard.tsx
│   ├── ComponentViewer.tsx
│   └── models/
├── data/components.ts
└── hooks/
    ├── useTheme.ts
    ├── useSpeech.ts             # Web Speech API
    └── useComponentIdentifier.ts # In-browser CLIP inference
```

## Key Conventions

- Keep UI monochrome (black/white/gray).
- Keep Three.js models primitive-only (no external GLTF assets).
- Keep 3D model rotation speed `delta * 0.3` for consistency.
- Prefer browser-native/local inference flows over server API calls.
- Vercel deploy must remain zero-config.

## Constraints

- No Google Fonts.
- No external backend inference services for CV or TTS.
- Browser may need first-run model download for CV.

## Testing

No dedicated test framework is configured.
Use:
- `npm run lint`
- `npm run build`
