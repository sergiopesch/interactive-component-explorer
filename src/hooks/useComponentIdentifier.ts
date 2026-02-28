'use client'

import { useState, useCallback } from 'react'
import {
  electronicsComponents,
  type ElectronicsComponent,
} from '@/data/components'
import { useLocalClassifier } from './useLocalClassifier'

export interface IdentifyResult {
  component: ElectronicsComponent
  confidence: number
  reasoning?: string
}

// Maps each CLIP candidate label back to a component ID
const CLIP_LABELS: { componentId: string; label: string }[] = []

// Additional label variants for better accuracy
const EXTRA_LABELS: Record<string, string[]> = {
  resistor: ['a photo of an axial resistor'],
  led: ['a photo of a red LED', 'a photo of a through-hole LED'],
  button: ['a photo of a push button', 'a photo of a tactile switch'],
  speaker: ['a photo of a piezo buzzer'],
  capacitor: ['a photo of a radial capacitor', 'a photo of an electrolytic capacitor'],
  potentiometer: ['a photo of a rotary potentiometer'],
  diode: ['a photo of a rectifier diode'],
  transistor: ['a photo of a TO-92 transistor'],
  servo: ['a photo of an SG90 servo motor'],
  'dc-motor': ['a photo of a brushed DC motor'],
  photoresistor: ['a photo of an LDR sensor'],
  'temp-sensor': ['a photo of a TMP36 temperature sensor'],
  ultrasonic: ['a photo of an HC-SR04 ultrasonic sensor'],
  lcd: ['a photo of a 16x2 LCD module', 'a photo of an LCD1602 display'],
  relay: ['a photo of a single-channel relay module'],
  'rgb-led': ['a photo of a 4-pin RGB LED'],
}

// Build label→componentId mapping once
for (const component of electronicsComponents) {
  const seen = new Set<string>()

  const addLabel = (label: string) => {
    const key = label.toLowerCase().trim()
    if (!seen.has(key)) {
      seen.add(key)
      CLIP_LABELS.push({ componentId: component.id, label })
    }
  }

  // Primary label from data
  addLabel(component.clipLabel)

  // Extra variants
  for (const extra of EXTRA_LABELS[component.id] ?? []) {
    addLabel(extra)
  }
}

const ALL_CANDIDATE_LABELS = CLIP_LABELS.map((l) => l.label)

export function useComponentIdentifier() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { classify, isLoading, loadProgress, isClassifying } = useLocalClassifier()

  const identify = useCallback(
    async (imageBase64: string): Promise<IdentifyResult | null> => {
      setIsAnalyzing(true)
      setError(null)

      try {
        const results = await classify(imageBase64, ALL_CANDIDATE_LABELS)

        if (!results || results.length === 0) {
          setError('Could not classify the image. Try a clearer photo with good lighting.')
          return null
        }

        // Aggregate scores per component (best label score wins)
        const componentScores = new Map<string, number>()
        for (const result of results) {
          const entry = CLIP_LABELS.find(
            (l) => l.label.toLowerCase() === result.label.toLowerCase()
          )
          if (!entry) continue
          const existing = componentScores.get(entry.componentId) ?? 0
          if (result.score > existing) {
            componentScores.set(entry.componentId, result.score)
          }
        }

        const ranked = [...componentScores.entries()]
          .map(([componentId, score]) => ({ componentId, score }))
          .sort((a, b) => b.score - a.score)

        if (ranked.length === 0 || ranked[0].score < 0.03) {
          const suggestions = ranked
            .slice(0, 2)
            .map((r) => {
              const c = electronicsComponents.find((c) => c.id === r.componentId)
              return c ? `${c.name} (${Math.round(r.score * 100)}%)` : null
            })
            .filter((s): s is string => s !== null)

          setError(
            suggestions.length > 0
              ? `Could not confidently identify the component. Closest: ${suggestions.join(', ')}. Try a closer photo with better lighting.`
              : 'Could not identify the component. Try a clearer photo with a plain background.'
          )
          return null
        }

        const matched = electronicsComponents.find(
          (c) => c.id === ranked[0].componentId
        )
        if (!matched) {
          setError('Component not found in database.')
          return null
        }

        return {
          component: matched,
          confidence: Math.round(ranked[0].score * 100),
          reasoning: 'Identified locally via in-browser CLIP model',
        }
      } catch (err) {
        console.error('Local classification error:', err)
        setError('Failed to run classification model. Please try again.')
        return null
      } finally {
        setIsAnalyzing(false)
      }
    },
    [classify]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    identify,
    isAnalyzing,
    error,
    clearError,
    // Expose model loading state so UI can show progress
    isModelLoading: isLoading,
    modelLoadProgress: loadProgress,
    isClassifying,
  }
}
