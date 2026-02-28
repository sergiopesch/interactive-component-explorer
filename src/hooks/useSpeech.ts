'use client'

import { useLocalTTS } from './useLocalTTS'

/**
 * Drop-in replacement for the original useSpeech hook.
 * Uses an in-browser mms-tts-eng model via Transformers.js —
 * no API calls, no HF_TOKEN required.
 */
export function useSpeech() {
  const { speak, stop, isSpeaking, isModelLoading, modelLoadProgress } =
    useLocalTTS()

  return { speak, stop, isSpeaking, isModelLoading, modelLoadProgress }
}
