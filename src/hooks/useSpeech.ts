'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null
  }

  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) {
    return null
  }

  const englishVoice =
    voices.find((voice) => voice.lang.toLowerCase().startsWith('en') && /neural|enhanced/i.test(voice.name)) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith('en')) ||
    voices[0]

  return englishVoice || null
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    utteranceRef.current = null
    setIsSpeaking(false)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return
    }

    const hydrateVoices = () => {
      void getBestVoice()
    }

    hydrateVoices()
    window.speechSynthesis.addEventListener('voiceschanged', hydrateVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', hydrateVoices)
      stop()
    }
  }, [stop])

  const speak = useCallback(
    async (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setIsSpeaking(false)
        return
      }

      stop()

      const utterance = new SpeechSynthesisUtterance(text)
      const voice = getBestVoice()

      if (voice) {
        utterance.voice = voice
        utterance.lang = voice.lang
      } else {
        utterance.lang = 'en-US'
      }

      utterance.rate = 0.95
      utterance.pitch = 1
      utterance.volume = 1
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        utteranceRef.current = null
        setIsSpeaking(false)
      }
      utterance.onerror = () => {
        utteranceRef.current = null
        setIsSpeaking(false)
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [stop]
  )

  return { speak, stop, isSpeaking }
}
