import { NextRequest, NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'
import { electronicsComponents } from '@/data/components'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const MIN_CONFIDENCE = 0.05
const MIN_MARGIN = 0.01

export const runtime = 'nodejs'

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

interface ClassificationResult {
  label: string
  score: number
}

function normalizeLabel(value: string) {
  return value.trim().toLowerCase()
}

function getDefaultPhotoLabel(name: string) {
  const simplified = name.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase()
  const startsWithVowel = /^[aeiou]/.test(simplified)
  return `a photo of ${startsWithVowel ? 'an' : 'a'} ${simplified}`
}

export async function POST(request: NextRequest) {
  try {
    const token = process.env.HF_TOKEN || process.env.HF_VARIABLE
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          code: 'MISSING_HF_TOKEN',
          error:
            'Hugging Face token is not configured. Add HF_TOKEN (or HF_VARIABLE for Vercel) to your environment variables.',
        },
        { status: 503 }
      )
    }

    const hf = new HfInference(token)

    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      )
    }

    const image =
      typeof payload === 'object' && payload !== null && 'image' in payload
        ? (payload as { image?: unknown }).image
        : null

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { success: false, error: 'No image provided.' },
        { status: 400 }
      )
    }

    // Extract base64 data (remove data URL prefix if present)
    const base64Data = image.includes(',') ? image.split(',')[1] : image
    const sanitizedBase64 = base64Data.replace(/\s/g, '')
    const imageBuffer = Buffer.from(sanitizedBase64, 'base64')

    if (imageBuffer.byteLength === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid image data.' },
        { status: 400 }
      )
    }

    if (imageBuffer.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Image is too large for production inference. Please upload a smaller image.',
        },
        { status: 413 }
      )
    }

    // Build candidate labels and retain mapping for score aggregation.
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

    // Call CLIP zero-shot image classification
    const rawResults = await hf.zeroShotImageClassification({
      model: 'openai/clip-vit-large-patch14',
      inputs: new Blob([imageBuffer]),
      parameters: {
        candidate_labels: candidateLabels,
      },
    })

    if (!Array.isArray(rawResults) || rawResults.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Could not analyze the image. Please try again.',
      })
    }

    const results = [...rawResults]
      .map(
        (result): ClassificationResult => ({
          label: typeof result?.label === 'string' ? result.label : '',
          score: typeof result?.score === 'number' ? result.score : Number.NaN,
        })
      )
      .filter((result) => result.label.length > 0 && Number.isFinite(result.score))
      .sort((a, b) => b.score - a.score)

    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Could not analyze the image. Please try again.',
      })
    }

    // Aggregate scores by component to support multiple labels per component.
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
      return NextResponse.json({
        success: false,
        code: 'COMPONENT_NOT_RECOGNIZED',
        error:
          'Could not identify the component. Try a clearer photo with good lighting.',
        topScores: rankedComponents.slice(0, 3).map((r) => ({
          componentId: r.componentId,
          score: Math.round(r.score * 100),
        })),
      })
    }

    const scoreMargin = secondResult
      ? topResult.score - secondResult.score
      : topResult.score

    if (topResult.score < MIN_CONFIDENCE && scoreMargin < MIN_MARGIN) {
      return NextResponse.json({
        success: false,
        code: 'COMPONENT_NOT_RECOGNIZED',
        error:
          'Could not identify the component. Try a clearer photo with good lighting.',
        topScores: rankedComponents.slice(0, 3).map((r) => ({
          componentId: r.componentId,
          score: Math.round(r.score * 100),
        })),
      })
    }

    return NextResponse.json({
      success: true,
      componentId: matchedComponent.id,
      confidence: Math.round(topResult.score * 100),
      label: matchedComponent.name,
      topScores: rankedComponents.slice(0, 3).map((r) => ({
        componentId: r.componentId,
        score: Math.round(r.score * 100),
      })),
    })
  } catch (error) {
    console.error('Identification error:', error)
    return NextResponse.json(
      {
        success: false,
        code: 'IDENTIFICATION_SERVICE_ERROR',
        error: 'AI service temporarily unavailable. Please try again in a moment.',
      },
      { status: 500 }
    )
  }
}
