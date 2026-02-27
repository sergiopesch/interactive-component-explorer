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

const IDENTIFY_TIMEOUT_MS = 15000

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

        const data = await response.json()

        if (response.ok && data.success) {
          const component = electronicsComponents.find(
            (c) => c.id === data.componentId
          )
          if (component) {
            return { component, confidence: data.confidence }
          }
          setError('Component not found in database.')
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
