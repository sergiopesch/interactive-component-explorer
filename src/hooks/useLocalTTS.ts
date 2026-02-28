'use client'

import { useState, useCallback, useRef } from 'react'

// Singleton: one TTS pipeline shared across the entire app
let ttsInstance: ReturnType<typeof createTTSPromise> | null = null

function createTTSPromise(
  onProgress?: (pct: number) => void
): Promise<(text: string) => Promise<{ audio: Float32Array; sampling_rate: number }>> {
  return (async () => {
    const { pipeline, env } = await import('@huggingface/transformers')
    // Load models from the app's own static files (public/models/)
    env.localModelPath = '/models/'
    env.allowLocalModels = true
    env.allowRemoteModels = false

    // Configure ONNX Runtime WASM backend (same as classifier hook)
    try {
      if (env.backends?.onnx?.wasm) {
        env.backends.onnx.wasm.wasmPaths = '/'
        env.backends.onnx.wasm.numThreads = 1
        env.backends.onnx.wasm.proxy = false
      }
    } catch {
      // Transformers.js API may vary between versions
    }

    const synthesizer = await pipeline('text-to-speech', 'Xenova/mms-tts-eng', {
      dtype: 'q8',
      progress_callback: (p: { status?: string; progress?: number }) => {
        if (p.status === 'progress' && typeof p.progress === 'number') {
          onProgress?.(Math.round(p.progress))
        }
      },
    })

    return async (text: string) => {
      // The TTS pipeline call signature varies across versions.
      // We call it with a single text argument and cast the result.
      const fn = synthesizer as unknown as (
        t: string
      ) => Promise<{ audio: Float32Array; sampling_rate: number }>
      return fn(text)
    }
  })()
}

/** Convert a Float32Array of PCM samples to a playable WAV Blob. */
function float32ToWavBlob(samples: Float32Array, sampleRate: number): Blob {
  const numChannels = 1
  const bitsPerSample = 16
  const bytesPerSample = bitsPerSample / 8
  const blockAlign = numChannels * bytesPerSample
  const dataLength = samples.length * bytesPerSample
  const headerLength = 44
  const buffer = new ArrayBuffer(headerLength + dataLength)
  const view = new DataView(buffer)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')

  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  // Write PCM samples (clamp float32 → int16)
  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

/** Split text into sentences for progressive TTS playback. */
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

export function useLocalTTS() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const stoppedRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlsRef = useRef<string[]>([])

  const cleanup = useCallback(() => {
    stoppedRef.current = true
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    for (const url of objectUrlsRef.current) {
      URL.revokeObjectURL(url)
    }
    objectUrlsRef.current = []
  }, [])

  const playBlob = useCallback((blob: Blob): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (stoppedRef.current) {
        reject(new Error('stopped'))
        return
      }
      const url = URL.createObjectURL(blob)
      objectUrlsRef.current.push(url)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => resolve()
      audio.onerror = () => reject(new Error('playback error'))
      audio.play().catch(reject)
    })
  }, [])

  const speak = useCallback(
    async (text: string) => {
      cleanup()
      stoppedRef.current = false
      setIsSpeaking(true)

      try {
        // Ensure model is loaded
        setIsLoading(true)
        setLoadProgress(0)
        if (!ttsInstance) {
          ttsInstance = createTTSPromise(setLoadProgress)
        }

        let synthesize: Awaited<typeof ttsInstance>
        try {
          synthesize = await ttsInstance
        } catch {
          ttsInstance = null
          throw new Error('Failed to load TTS model')
        }
        setIsLoading(false)

        // Stream: synthesize and play sentence by sentence
        const sentences = splitIntoSentences(text)

        for (const sentence of sentences) {
          if (stoppedRef.current) break

          const { audio, sampling_rate } = await synthesize(sentence)
          if (stoppedRef.current) break

          const wavBlob = float32ToWavBlob(audio, sampling_rate)
          await playBlob(wavBlob)
        }
      } catch (err) {
        if (!(err instanceof Error && err.message === 'stopped')) {
          console.error('Local TTS error:', err)
        }
      } finally {
        if (!stoppedRef.current) {
          setIsSpeaking(false)
        }
        setIsLoading(false)
      }
    },
    [cleanup, playBlob]
  )

  const stop = useCallback(() => {
    cleanup()
    setIsSpeaking(false)
  }, [cleanup])

  return { speak, stop, isSpeaking, isModelLoading: isLoading, modelLoadProgress: loadProgress }
}
