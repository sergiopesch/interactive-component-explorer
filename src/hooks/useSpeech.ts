'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const TTS_TIMEOUT_MS = 15000

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  useEffect(() => cleanupAudio, [cleanupAudio])

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

  const speak = useCallback(
    async (text: string) => {
      cleanupAudio()
      setIsSpeaking(true)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS)

      try {
        // Try HF TTS API first
        const res = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error('TTS API failed')

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        objectUrlRef.current = url

        const audio = new Audio(url)
        audioRef.current = audio

        audio.onended = () => {
          setIsSpeaking(false)
          cleanupAudio()
        }
        audio.onerror = () => {
          // If audio playback fails, try Web Speech API
          cleanupAudio()
          fallbackToWebSpeech(text)
        }

        await audio.play()
      } catch {
        // Fallback to Web Speech API
        fallbackToWebSpeech(text)
      } finally {
        clearTimeout(timeout)
      }
    },
    [cleanupAudio, fallbackToWebSpeech]
  )

  const stop = useCallback(() => {
    cleanupAudio()
    setIsSpeaking(false)
  }, [cleanupAudio])

  return { speak, stop, isSpeaking }
}
