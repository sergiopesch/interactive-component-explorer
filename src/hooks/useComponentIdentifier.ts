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

interface RankedComponentScore {
  componentId: string
  score: number
}

interface ClassifierResult {
  label?: string
  score?: number
}

type ZeroShotImageClassifier = (
  image: string,
  options: { candidate_labels: string[] }
) => Promise<ClassifierResult[]>

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

const UNRECOGNIZED_COMPONENT_MESSAGE =
  'Could not confidently identify the component from that image. Try a closer photo with better lighting and a plain background.'

const SERVICE_UNAVAILABLE_MESSAGE =
  'Identification is temporarily unavailable. Please try again in a moment.'

const IDENTIFY_TIMEOUT_MS = 45000
const MIN_CONFIDENCE = 0.05
const MIN_MARGIN = 0.01

const LABEL_ALIASES: Record<string, string[]> = {
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

let classifierPromise: Promise<ZeroShotImageClassifier> | null = null

function normalizeLabel(value: string) {
  return value.trim().toLowerCase()
}

function getDefaultPhotoLabel(name: string) {
  const simplified = name.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase()
  const startsWithVowel = /^[aeiou]/.test(simplified)
  return `a photo of ${startsWithVowel ? 'an' : 'a'} ${simplified}`
}

function buildCandidateLabels() {
  const labelToComponentId = new Map<string, string>()
  const candidateLabels: string[] = []

  for (const component of electronicsComponents) {
    const labelVariants = [
      component.clipLabel,
      getDefaultPhotoLabel(component.name),
      ...(LABEL_ALIASES[component.id] || []),
    ]

    for (const label of labelVariants) {
      const normalized = normalizeLabel(label)
      if (!labelToComponentId.has(normalized)) {
        labelToComponentId.set(normalized, component.id)
        candidateLabels.push(label)
      }
    }
  }

  return { labelToComponentId, candidateLabels }
}

function rankComponents(
  rawResults: ClassifierResult[],
  labelToComponentId: Map<string, string>
): RankedComponentScore[] {
  const results = [...rawResults]
    .map((result) => ({
      label: typeof result?.label === 'string' ? result.label : '',
      score: typeof result?.score === 'number' ? result.score : Number.NaN,
    }))
    .filter((result) => result.label.length > 0 && Number.isFinite(result.score))
    .sort((a, b) => b.score - a.score)

  const componentScores = new Map<string, { score: number }>()

  for (const result of results) {
    const componentId = labelToComponentId.get(normalizeLabel(result.label))
    if (!componentId) continue
    const existing = componentScores.get(componentId)
    if (!existing || result.score > existing.score) {
      componentScores.set(componentId, { score: result.score })
    }
  }

  return [...componentScores.entries()]
    .map(([componentId, value]) => ({ componentId, ...value }))
    .sort((a, b) => b.score - a.score)
}

function mapRankedResultToIdentifyResult(
  rankedComponents: RankedComponentScore[]
): IdentifyResult | null {
  const topResult = rankedComponents[0]
  const secondResult = rankedComponents[1]

  if (!topResult) return null

  const matchedComponent = electronicsComponents.find(
    (component) => component.id === topResult.componentId
  )

  if (!matchedComponent) return null

  const scoreMargin = secondResult
    ? topResult.score - secondResult.score
    : topResult.score

  if (topResult.score < MIN_CONFIDENCE && scoreMargin < MIN_MARGIN) {
    return null
  }

  return {
    component: matchedComponent,
    confidence: Math.round(topResult.score * 100),
  }
}

function formatTopSuggestions(rankedComponents: RankedComponentScore[]) {
  return rankedComponents
    .slice(0, 2)
    .map((entry) => {
      const component = electronicsComponents.find((c) => c.id === entry.componentId)
      return component ? `${component.name} (${Math.round(entry.score * 100)}%)` : null
    })
    .filter((entry): entry is string => entry !== null)
}

async function getLocalClassifier(): Promise<ZeroShotImageClassifier> {
  if (!classifierPromise) {
    classifierPromise = (async () => {
      const importFromUrl = new Function(
        'modulePath',
        'return import(modulePath)'
      ) as (modulePath: string) => Promise<unknown>

      const transformersModule = (await importFromUrl(
        'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'
      )) as {
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

      transformersModule.env.allowLocalModels = false
      transformersModule.env.useBrowserCache = true

      return transformersModule.pipeline(
        'zero-shot-image-classification',
        'Xenova/clip-vit-base-patch32',
        { quantized: true }
      )
    })()
  }

  return classifierPromise
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

      const timeoutController = new AbortController()
      const timeout = setTimeout(() => timeoutController.abort(), IDENTIFY_TIMEOUT_MS)

      try {
        // Primary path: local in-browser CLIP inference.
        try {
          const classifier = await getLocalClassifier()
          const { labelToComponentId, candidateLabels } = buildCandidateLabels()

          const rawResults = await classifier(imageBase64, {
            candidate_labels: candidateLabels,
          })

          const rankedComponents = rankComponents(rawResults, labelToComponentId)
          const result = mapRankedResultToIdentifyResult(rankedComponents)

          if (result) {
            return result
          }

          const suggestions = formatTopSuggestions(rankedComponents)
          setError(
            suggestions.length > 0
              ? `${UNRECOGNIZED_COMPONENT_MESSAGE} Closest: ${suggestions.join(', ')}.`
              : UNRECOGNIZED_COMPONENT_MESSAGE
          )
          return null
        } catch {
          // Safe fallback path: server API (HF Inference) in case browser model load fails.
        }

        const response = await fetch('/api/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 }),
          signal: timeoutController.signal,
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
            setError(
              `${UNRECOGNIZED_COMPONENT_MESSAGE} Closest: ${suggestions.join(', ')}.`
            )
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
        setError(SERVICE_UNAVAILABLE_MESSAGE)
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
