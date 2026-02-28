import path from 'path'
import { fileURLToPath } from 'url'
import { saveWav } from './wav.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MODELS_DIR = path.resolve(__dirname, '../../../models')

// Singleton: one TTS pipeline shared across the entire process
let ttsInstance: Promise<
  (text: string) => Promise<{ audio: Float32Array; sampling_rate: number }>
> | null = null

function createTTSPromise(
  onProgress?: (pct: number) => void
): Promise<
  (text: string) => Promise<{ audio: Float32Array; sampling_rate: number }>
> {
  return (async () => {
    const { pipeline, env } = await import('@huggingface/transformers')

    // Load models from local filesystem
    env.localModelPath = MODELS_DIR + '/'
    env.allowLocalModels = true
    env.allowRemoteModels = false

    const synthesizer = await pipeline('text-to-speech', 'Xenova/mms-tts-eng', {
      dtype: 'q8' as const,
      progress_callback: (p: { status?: string; progress?: number }) => {
        if (p.status === 'progress' && typeof p.progress === 'number') {
          onProgress?.(Math.round(p.progress))
        }
      },
    })

    return async (text: string) => {
      const fn = synthesizer as unknown as (
        t: string
      ) => Promise<{ audio: Float32Array; sampling_rate: number }>
      return fn(text)
    }
  })()
}

export async function loadTTS(
  onProgress?: (pct: number) => void
): Promise<void> {
  if (!ttsInstance) {
    ttsInstance = createTTSPromise(onProgress)
  }
  await ttsInstance
}

/** Split text into sentences for progressive synthesis. */
function splitIntoSentences(text: string): string[] {
  const raw = text.match(/[^.!?]+[.!?]+\s*/g)
  if (!raw) return [text.trim()].filter(Boolean)

  const sentences: string[] = []
  for (const s of raw) {
    const trimmed = s.trim()
    if (trimmed.length > 0) sentences.push(trimmed)
  }

  const joined = raw.join('')
  const remainder = text.slice(joined.length).trim()
  if (remainder.length > 0) sentences.push(remainder)

  return sentences.length > 0 ? sentences : [text.trim()]
}

/**
 * Synthesize text to speech and save as a WAV file.
 * Processes text sentence-by-sentence and concatenates the audio.
 */
export async function synthesizeToFile(
  text: string,
  outputPath: string,
  onSentence?: (index: number, total: number) => void
): Promise<{ sampleRate: number; durationSeconds: number }> {
  if (!ttsInstance) {
    ttsInstance = createTTSPromise()
  }
  const synthesize = await ttsInstance

  const sentences = splitIntoSentences(text)
  const allSamples: Float32Array[] = []
  let sampleRate = 16000

  for (let i = 0; i < sentences.length; i++) {
    onSentence?.(i + 1, sentences.length)
    const { audio, sampling_rate } = await synthesize(sentences[i])
    allSamples.push(audio)
    sampleRate = sampling_rate
  }

  // Concatenate all sentence audio
  const totalLength = allSamples.reduce((sum, a) => sum + a.length, 0)
  const combined = new Float32Array(totalLength)
  let offset = 0
  for (const chunk of allSamples) {
    combined.set(chunk, offset)
    offset += chunk.length
  }

  saveWav(outputPath, combined, sampleRate)

  return {
    sampleRate,
    durationSeconds: totalLength / sampleRate,
  }
}
