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

    env.allowLocalModels = false
    env.allowRemoteModels = true

    const synthesizer = await pipeline('text-to-speech', 'Xenova/mms-tts-eng', {
      dtype: 'q8' as const,
      device: 'wasm',
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

export async function synthesize(
  text: string,
  onSentence?: (index: number, total: number) => void
): Promise<{ samples: Float32Array; sampleRate: number }> {
  if (!ttsInstance) {
    ttsInstance = createTTSPromise()
  }
  const synth = await ttsInstance

  const sentences = splitIntoSentences(text)
  const allSamples: Float32Array[] = []
  let sampleRate = 16000

  for (let i = 0; i < sentences.length; i++) {
    onSentence?.(i + 1, sentences.length)
    const { audio, sampling_rate } = await synth(sentences[i])
    allSamples.push(audio)
    sampleRate = sampling_rate
  }

  const totalLength = allSamples.reduce((sum, a) => sum + a.length, 0)
  const combined = new Float32Array(totalLength)
  let offset = 0
  for (const chunk of allSamples) {
    combined.set(chunk, offset)
    offset += chunk.length
  }

  return { samples: combined, sampleRate }
}
