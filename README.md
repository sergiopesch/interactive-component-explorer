# Electronics Explorer

An AI-powered learning app that identifies electronic components from photos. Snap a picture of a resistor, LED, capacitor, or other Arduino Student Kit part — and get an interactive 3D model, beginner-friendly specs, wiring instructions, and voice-guided descriptions.

## How It Works

1. **Snap or upload** — Take a photo with your camera or drag and drop an image.
2. **On-device CV runs in the app** — A browser-loaded CLIP transformer (`Xenova/clip-vit-base-patch32`) performs zero-shot image classification in-app.
3. **Learn about it** — See the component card with 3D model, specifications, and circuit examples.
4. **Listen** — Browser-native Web Speech API reads descriptions aloud locally.

You can also **browse all 16 components** from the home screen.

## Features

- **Local component identification** — Runs directly in the browser with a transformer pipeline (no server inference API calls).
- **Local text-to-speech** — Uses browser speech synthesis voices (no cloud TTS service).
- **Interactive 3D models** — Rotate resistors, LEDs, capacitors, transistors, and more.
- **Power simulation** — Toggle LEDs, press buttons, spin motors, and activate relays.
- **16 components** — Resistor, LED, push button, piezo speaker, capacitor, potentiometer, diode, transistor, servo motor, DC motor, photoresistor, temperature sensor, ultrasonic sensor, LCD display, relay, RGB LED.
- **Dark / Light mode** — Persists across sessions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| 3D | Three.js via React Three Fiber + Drei |
| Styling | Tailwind CSS |
| Computer Vision | Transformers.js from CDN (`@xenova/transformers`) with CLIP (`Xenova/clip-vit-base-patch32`) |
| Text-to-Speech | Web Speech API |
| Language | TypeScript |
| Deploy | Vercel |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build
npm run start
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── manifest.ts
│   ├── globals.css
│   └── api/
│       ├── identify/route.ts   # Deprecated endpoint (local CV is in-browser)
│       └── speak/route.ts      # Deprecated endpoint (local TTS is in-browser)
├── components/
│   ├── Header.tsx
│   ├── HomeClient.tsx
│   ├── ImageUpload.tsx
│   ├── ComponentCard.tsx
│   ├── ComponentViewer.tsx
│   └── models/
├── data/
│   └── components.ts
└── hooks/
    ├── useTheme.ts
    ├── useSpeech.ts              # Local Web Speech API TTS
    └── useComponentIdentifier.ts # Local transformer CV pipeline
```

## Deployment Notes (Vercel)

- No Hugging Face token is required.
- The browser downloads model files at runtime from CDN/Hugging Face model hosting.
- Ensure your deployment allows outbound access to model/CDN assets from client browsers.

## Browser Support

Requires a modern browser with:
- WebGL (for Three.js rendering)
- Speech synthesis support (for voice playback)
- Network access to download transformer/model assets on first use

## License

See [LICENSE](./LICENSE).
