'use client'

import { useState, useCallback } from 'react'
import {
  electronicsComponents,
  type ElectronicsComponent,
} from '@/data/components'

interface IdentifyResult {
  component: ElectronicsComponent
  confidence: number
}

const UNRECOGNIZED_COMPONENT_MESSAGE =
  'Could not confidently identify the component from that image. Try a closer photo with better lighting and a plain background.'

const SERVICE_UNAVAILABLE_MESSAGE =
  'The AI identification service is temporarily unavailable. Please try again in a moment.'

const IDENTIFY_TIMEOUT_MS = 15000

interface IdentifyApiResponse {
  success?: boolean
  code?: string
  error?: string
  componentId?: string
  confidence?: number
  topScores?: Array<{
    componentId?: string
    score?: number
  }>
}

async function parseResponseBody(
  response: Response
): Promise<IdentifyApiResponse | null> {
  try {
    return (await response.json()) as IdentifyApiResponse
  } catch {
    return null
  }
}

export function useComponentIdentifier() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const identify = useCallback(
    async (imageBase64: string): Promise<IdentifyResult | null> => {
      setIsAnalyzing(true)
      setError(null)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), IDENTIFY_TIMEOUT_MS)

      try {
        const response = await fetch('/api/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 }),
          signal: controller.signal,
        })

        const data = await parseResponseBody(response)

        if (!data) {
          setError('Invalid response from identification service.')
          return null
        }

        if (response.ok && data.success) {
          const component = electronicsComponents.find(
            (c) => c.id === data.componentId
          )
          if (component) {
            return {
              component,
              confidence:
                typeof data.confidence === 'number' ? data.confidence : 0,
            }
          }
          setError(UNRECOGNIZED_COMPONENT_MESSAGE)
          return null
        }

        if (data.code === 'COMPONENT_NOT_RECOGNIZED') {
          const suggestions = (data.topScores || [])
            .map((entry) => {
              const score = typeof entry.score === 'number' ? entry.score : null
              const component = electronicsComponents.find(
                (c) => c.id === entry.componentId
              )
              return score && component ? `${component.name} (${score}%)` : null
            })
            .filter((entry): entry is string => entry !== null)
            .slice(0, 2)

          if (suggestions.length > 0) {
            setError(`${UNRECOGNIZED_COMPONENT_MESSAGE} Closest: ${suggestions.join(', ')}.`)
          } else {
            setError(UNRECOGNIZED_COMPONENT_MESSAGE)
          }
          return null
        }

        if (response.status === 413) {
          setError(
            'The image is too large to analyze. Please upload a smaller image.'
          )
          return null
        }

        // Friendly message for missing API key (local dev or Vercel misconfiguration)
        if (data.code === 'MISSING_HF_TOKEN') {
          setError(SERVICE_UNAVAILABLE_MESSAGE)
          return null
        }

        if (data.code === 'IDENTIFICATION_SERVICE_ERROR') {
          setError(SERVICE_UNAVAILABLE_MESSAGE)
          return null
        }

        setError(
          data.error ||
            'Could not identify the component. Please try a clearer photo.'
        )
        return null
      } catch (caught) {
        if (caught instanceof Error && caught.name === 'AbortError') {
          setError('Identification timed out. Please try again.')
          return null
        }
        setError('Network error. Check your connection and try again.')
        return null
      } finally {
        clearTimeout(timeout)
        setIsAnalyzing(false)
      }
    },
    []
  )

  const clearError = useCallback(() => setError(null), [])

  return { identify, isAnalyzing, error, clearError }
}
