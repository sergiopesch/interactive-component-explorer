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
  'The local vision model is unavailable right now. Please refresh and try again.'

interface ClassifierResult {
  label?: string
  score?: number
}

type ZeroShotImageClassifier = (
  image: string,
  options: { candidate_labels: string[] }
) => Promise<ClassifierResult[]>

let classifierPromise: Promise<ZeroShotImageClassifier> | null = null

function normalizeLabel(value: string) {
  return value.trim().toLowerCase()
}

function getDefaultPhotoLabel(name: string) {
  const simplified = name.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase()
  const startsWithVowel = /^[aeiou]/.test(simplified)
  return `a photo of ${startsWithVowel ? 'an' : 'a'} ${simplified}`
}

function getAliasLabels(componentId: string): string[] {
  const aliasMap: Record<string, string[]> = {
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

  return aliasMap[componentId] || []
}

async function getClassifier(): Promise<ZeroShotImageClassifier> {
  if (!classifierPromise) {
    classifierPromise = (async () => {
      const importFromUrl = new Function('modulePath', 'return import(modulePath)') as (
        modulePath: string
      ) => Promise<unknown>

      const transformersModule = await importFromUrl(
        'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'
      )

      const { env, pipeline } = transformersModule as {
        env: {
          allowLocalModels: boolean
          useBrowserCache: boolean
        }
        pipeline: (
          task: 'zero-shot-image-classification',
          model: string,
          options: { quantized: boolean }
        ) => Promise<ZeroShotImageClassifier>
      }

      env.allowLocalModels = false
      env.useBrowserCache = true

      return pipeline(
        'zero-shot-image-classification',
        'Xenova/clip-vit-base-patch32',
        { quantized: true }
      )
    })()
  }

  return classifierPromise
}

const IDENTIFY_TIMEOUT_MS = 45000
const MIN_CONFIDENCE = 0.05
const MIN_MARGIN = 0.01

export function useComponentIdentifier() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const identify = useCallback(
    async (imageBase64: string): Promise<IdentifyResult | null> => {
      setIsAnalyzing(true)
      setError(null)

      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), IDENTIFY_TIMEOUT_MS)
      })

      try {
        const analysisPromise = (async () => {
          const classifier = await getClassifier()

          const labelToComponentId = new Map<string, string>()
          const candidateLabels: string[] = []

          for (const component of electronicsComponents) {
            const labelVariants = [
              component.clipLabel,
              getDefaultPhotoLabel(component.name),
              ...getAliasLabels(component.id),
            ]

            for (const label of labelVariants) {
              const normalized = normalizeLabel(label)
              if (!labelToComponentId.has(normalized)) {
                labelToComponentId.set(normalized, component.id)
                candidateLabels.push(label)
              }
            }
          }

          const rawResults = await classifier(imageBase64, {
            candidate_labels: candidateLabels,
          })

          const results = [...rawResults]
            .map((result) => ({
              label: typeof result?.label === 'string' ? result.label : '',
              score: typeof result?.score === 'number' ? result.score : Number.NaN,
            }))
            .filter((result) => result.label.length > 0 && Number.isFinite(result.score))
            .sort((a, b) => b.score - a.score)

          if (results.length === 0) {
            setError(UNRECOGNIZED_COMPONENT_MESSAGE)
            return null
          }

          const componentScores = new Map<string, { score: number }>()

          for (const result of results) {
            const componentId = labelToComponentId.get(normalizeLabel(result.label))
            if (!componentId) continue
            const existing = componentScores.get(componentId)
            if (!existing || result.score > existing.score) {
              componentScores.set(componentId, { score: result.score })
            }
          }

          const rankedComponents = [...componentScores.entries()]
            .map(([componentId, value]) => ({ componentId, ...value }))
            .sort((a, b) => b.score - a.score)

          const topResult = rankedComponents[0]
          const secondResult = rankedComponents[1]
          const matchedComponent = electronicsComponents.find(
            (c) => c.id === topResult?.componentId
          )

          if (!matchedComponent || !topResult) {
            setError(UNRECOGNIZED_COMPONENT_MESSAGE)
            return null
          }

          const scoreMargin = secondResult
            ? topResult.score - secondResult.score
            : topResult.score

          if (topResult.score < MIN_CONFIDENCE && scoreMargin < MIN_MARGIN) {
            const suggestions = rankedComponents
              .slice(0, 2)
              .map((entry) => {
                const component = electronicsComponents.find(
                  (c) => c.id === entry.componentId
                )
                return component ? `${component.name} (${Math.round(entry.score * 100)}%)` : null
              })
              .filter((entry): entry is string => entry !== null)

            setError(
              suggestions.length > 0
                ? `${UNRECOGNIZED_COMPONENT_MESSAGE} Closest: ${suggestions.join(', ')}.`
                : UNRECOGNIZED_COMPONENT_MESSAGE
            )
            return null
          }

          return {
            component: matchedComponent,
            confidence: Math.round(topResult.score * 100),
          }
        })()

        const result = await Promise.race([analysisPromise, timeoutPromise])
        if (!result) {
          setError('Identification timed out. Please try again.')
        }
        return result
      } catch {
        setError(SERVICE_UNAVAILABLE_MESSAGE)
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
