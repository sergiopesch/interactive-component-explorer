import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MODELS_DIR = path.resolve(__dirname, '../../../models')

export interface ClassifyResult {
  label: string
  score: number
}

// Singleton: one CLIP pipeline shared across the entire process
let classifierInstance: Promise<
  (image: string, labels: string[]) => Promise<ClassifyResult[]>
> | null = null

function createPipelinePromise(
  onProgress?: (pct: number) => void
): Promise<(image: string, labels: string[]) => Promise<ClassifyResult[]>> {
  return (async () => {
    const { pipeline, env } = await import('@huggingface/transformers')

    // Load models from local filesystem
    env.localModelPath = MODELS_DIR + '/'
    env.allowLocalModels = true
    env.allowRemoteModels = false

    const classifier = await pipeline(
      'zero-shot-image-classification',
      'Xenova/clip-vit-base-patch16',
      {
        dtype: 'q8' as const,
        progress_callback: (p: { status?: string; progress?: number }) => {
          if (p.status === 'progress' && typeof p.progress === 'number') {
            onProgress?.(Math.round(p.progress))
          }
        },
      }
    )

    return async (
      image: string,
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
  imagePath: string,
  labels: string[]
): Promise<ClassifyResult[]> {
  if (!classifierInstance) {
    classifierInstance = createPipelinePromise()
  }
  const classifyFn = await classifierInstance
  return classifyFn(imagePath, labels)
}
