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

export function useComponentIdentifier() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const identify = useCallback(
    async (imageBase64: string): Promise<IdentifyResult | null> => {
      setIsAnalyzing(true)
      setError(null)

      try {
        const response = await fetch('/api/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 }),
        })

        const data = await response.json()

        if (data.success) {
          const component = electronicsComponents.find(
            (c) => c.id === data.componentId
          )
          if (component) {
            return { component, confidence: data.confidence }
          }
          setError('Component not found in database.')
          return null
        } else {
          setError(
            data.error ||
              'Could not identify the component. Please try a clearer photo.'
          )
          return null
        }
      } catch {
        setError('Network error. Check your connection and try again.')
        return null
      } finally {
        setIsAnalyzing(false)
      }
    },
    []
  )

  const clearError = useCallback(() => setError(null), [])

  return { identify, isAnalyzing, error, clearError }
}
