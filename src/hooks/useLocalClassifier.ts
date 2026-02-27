'use client'

import { useState, useCallback } from 'react'

export interface ClassifyResult {
  label: string
  score: number
}

// Singleton: one CLIP pipeline shared across the entire app
let classifierInstance: ReturnType<typeof createPipelinePromise> | null = null

function createPipelinePromise(
  onProgress?: (pct: number) => void
): Promise<(image: string, labels: string[]) => Promise<ClassifyResult[]>> {
  return (async () => {
    const { pipeline, env } = await import('@huggingface/transformers')
    // Models are fetched from Hugging Face Hub and cached in the browser
    env.allowLocalModels = false

    const classifier = await pipeline(
      'zero-shot-image-classification',
      'Xenova/clip-vit-base-patch16',
      {
        progress_callback: (p: { status?: string; progress?: number }) => {
          if (p.status === 'progress' && typeof p.progress === 'number') {
            onProgress?.(Math.round(p.progress))
          }
        },
      }
    )

    return async (image: string, labels: string[]): Promise<ClassifyResult[]> => {
      const raw = await classifier(image, labels)
      // Result may be a flat array or nested array — normalize to flat
      const flat: { label: string; score: number }[] = Array.isArray(raw)
        ? (raw as unknown[]).flat().filter(
            (r): r is { label: string; score: number } =>
              typeof r === 'object' &&
              r !== null &&
              'label' in r &&
              'score' in r
          )
        : []
      return flat.map((r) => ({ label: r.label, score: r.score }))
    }
  })()
}

export function useLocalClassifier() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isClassifying, setIsClassifying] = useState(false)

  const classify = useCallback(
    async (imageData: string, candidateLabels: string[]): Promise<ClassifyResult[]> => {
      setIsLoading(true)
      setLoadProgress(0)

      try {
        if (!classifierInstance) {
          classifierInstance = createPipelinePromise(setLoadProgress)
        }

        const classifyFn = await classifierInstance
        setIsLoading(false)
        setIsClassifying(true)

        return await classifyFn(imageData, candidateLabels)
      } catch (err) {
        // Reset singleton so user can retry
        classifierInstance = null
        throw err
      } finally {
        setIsLoading(false)
        setIsClassifying(false)
      }
    },
    []
  )

  return { classify, isLoading, loadProgress, isClassifying }
}
