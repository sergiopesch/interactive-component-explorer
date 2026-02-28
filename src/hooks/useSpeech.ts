'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const TTS_TIMEOUT_MS = 15000

function selectBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null
  }

  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  return (
    voices.find(
      (voice) =>
        voice.lang.toLowerCase().startsWith('en') &&
        /neural|enhanced|premium/i.test(voice.name)
    ) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith('en')) ||
    voices[0]
  )
}

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

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const handleVoicesChanged = () => {
        void selectBestVoice()
      }
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)
      void selectBestVoice()
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
        cleanupAudio()
      }
    }

    return cleanupAudio
  }, [cleanupAudio])

  const speakWithWebSpeech = useCallback((text: string): boolean => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return false
    }

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = selectBestVoice()

    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    }

    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.volume = 1
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
    return true
  }, [])

  const speakWithApiFallback = useCallback(async (text: string) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS)

    try {
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
        setIsSpeaking(false)
        cleanupAudio()
      }

      setIsSpeaking(true)
      await audio.play()
    } finally {
      clearTimeout(timeout)
    }
  }, [cleanupAudio])

  const speak = useCallback(
    async (text: string) => {
      cleanupAudio()
      setIsSpeaking(false)

      const didSpeakLocally = speakWithWebSpeech(text)
      if (didSpeakLocally) return

      try {
        await speakWithApiFallback(text)
      } catch {
        setIsSpeaking(false)
      }
    },
    [cleanupAudio, speakWithApiFallback, speakWithWebSpeech]
  )

  const stop = useCallback(() => {
    cleanupAudio()
    setIsSpeaking(false)
  }, [cleanupAudio])

  return { speak, stop, isSpeaking }
}
