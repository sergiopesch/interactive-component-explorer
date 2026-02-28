export interface ClassifyResult {
  label: string
  score: number
}

let classifierInstance: Promise<
  (image: string | Blob, labels: string[]) => Promise<ClassifyResult[]>
> | null = null

function createPipelinePromise(
  onProgress?: (pct: number) => void
): Promise<(image: string | Blob, labels: string[]) => Promise<ClassifyResult[]>> {
  return (async () => {
    const { pipeline, env } = await import('@huggingface/transformers')

    // In the browser, load models from HuggingFace CDN
    env.allowLocalModels = false
    env.allowRemoteModels = true

    const classifier = await pipeline(
      'zero-shot-image-classification',
      'Xenova/clip-vit-base-patch16',
      {
        dtype: 'q8' as const,
        device: 'wasm',
        progress_callback: (p: { status?: string; progress?: number }) => {
          if (p.status === 'progress' && typeof p.progress === 'number') {
            onProgress?.(Math.round(p.progress))
          }
        },
      }
    )

    return async (
      image: string | Blob,
      labels: string[]
    ): Promise<ClassifyResult[]> => {
      const raw = await classifier(image, labels)
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

export async function loadClassifier(
  onProgress?: (pct: number) => void
): Promise<void> {
  if (!classifierInstance) {
    classifierInstance = createPipelinePromise(onProgress)
  }
  await classifierInstance
}

export async function classify(
  image: string | Blob,
  labels: string[]
): Promise<ClassifyResult[]> {
  if (!classifierInstance) {
    classifierInstance = createPipelinePromise()
  }
  const classifyFn = await classifierInstance
  return classifyFn(image, labels)
}
