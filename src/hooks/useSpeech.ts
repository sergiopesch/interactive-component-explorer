'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const STREAM_TIMEOUT_MS = 30000
const SINGLE_TIMEOUT_MS = 15000

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlsRef = useRef<string[]>([])
  const stoppedRef = useRef(false)

  const cleanup = useCallback(() => {
    stoppedRef.current = true
    abortRef.current?.abort()
    abortRef.current = null

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    for (const url of objectUrlsRef.current) {
      URL.revokeObjectURL(url)
    }
    objectUrlsRef.current = []

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  useEffect(() => cleanup, [cleanup])

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

  const fallbackToWebSpeech = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  // ── Streaming TTS: reads NDJSON chunks and plays them in order ──────
  const speakStreaming = useCallback(
    async (text: string): Promise<boolean> => {
      const controller = new AbortController()
      abortRef.current = controller
      const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS)

      try {
        const res = await fetch('/api/speak-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        })

        if (!res.ok || !res.body) return false

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let playedAny = false

        const processLine = async (line: string) => {
          if (!line.trim() || stoppedRef.current) return
          try {
            const { audio } = JSON.parse(line)
            if (!audio) return

            const binaryStr = atob(audio)
            const bytes = new Uint8Array(binaryStr.length)
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i)
            }

            const blob = new Blob([bytes.buffer], { type: 'audio/flac' })
            await playBlob(blob)
            playedAny = true
          } catch {
            // Skip malformed chunks
          }
        }

        // Read stream and play chunks sequentially
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (stoppedRef.current) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            await processLine(line)
          }
        }

        // Process remaining buffer
        if (buffer.trim() && !stoppedRef.current) {
          await processLine(buffer)
        }

        return playedAny
      } catch {
        return false
      } finally {
        clearTimeout(timeout)
      }
    },
    [playBlob]
  )

  // ── Non-streaming TTS (single request) ──────────────────────────────
  const speakSingle = useCallback(
    async (text: string): Promise<boolean> => {
      const controller = new AbortController()
      abortRef.current = controller
      const timeout = setTimeout(() => controller.abort(), SINGLE_TIMEOUT_MS)

      try {
        const res = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        })

        if (!res.ok) return false

        const blob = await res.blob()
        await playBlob(blob)
        return true
      } catch {
        return false
      } finally {
        clearTimeout(timeout)
      }
    },
    [playBlob]
  )

  // ── Public API ──────────────────────────────────────────────────────
  const speak = useCallback(
    async (text: string) => {
      cleanup()
      stoppedRef.current = false
      setIsSpeaking(true)

      // Try streaming first → single request → Web Speech API
      const streamOk = await speakStreaming(text)
      if (!streamOk && !stoppedRef.current) {
        const singleOk = await speakSingle(text)
        if (!singleOk && !stoppedRef.current) {
          fallbackToWebSpeech(text)
          return
        }
      }

      if (!stoppedRef.current) {
        setIsSpeaking(false)
      }
    },
    [cleanup, speakStreaming, speakSingle, fallbackToWebSpeech]
  )

  const stop = useCallback(() => {
    cleanup()
    setIsSpeaking(false)
  }, [cleanup])

  return { speak, stop, isSpeaking }
}
