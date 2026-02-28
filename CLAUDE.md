# CLAUDE.md — Agent Instructions for Electronics Explorer

## Project Overview

Interactive electronics component explorer built with Next.js, Three.js (R3F), and Tailwind.

### Inference strategy

Use **local-first with safe API fallback**:
- Identification: browser CLIP via Transformers.js CDN first, `/api/identify` fallback.
- Speech: browser Web Speech first, `/api/speak` fallback.

Do not remove fallback routes unless explicitly requested.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Key conventions

- Keep UI monochrome in chrome; realistic colors allowed in models.
- Keep 3D models primitive-based (no external glTF assets).
- Preserve `delta * 0.3` baseline rotation behavior in models.
- Keep Vercel compatibility and deterministic install/build behavior.
- When changing inference behavior, update README and `.env.local.example` in the same patch.

## Env vars

Optional fallback credentials:
- `HF_TOKEN`
- `HF_VARIABLE`

If missing, browser-local paths should still function when supported.
