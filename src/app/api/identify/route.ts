import { NextRequest, NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'
import { electronicsComponents } from '@/data/components'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const token = process.env.HF_TOKEN
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'HF_TOKEN not configured. Add it to .env.local.' },
        { status: 503 }
      )
    }

    const hf = new HfInference(token)

    const { image } = await request.json()
    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { success: false, error: 'No image provided.' },
        { status: 400 }
      )
    }

    // Extract base64 data (remove data URL prefix if present)
    const base64Data = image.includes(',') ? image.split(',')[1] : image
    const imageBuffer = Buffer.from(base64Data, 'base64')

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

    // Build candidate labels from all components
    const candidateLabels = electronicsComponents.map((c) => c.clipLabel)

    // Call CLIP zero-shot image classification
    const results = await hf.zeroShotImageClassification({
      model: 'openai/clip-vit-large-patch14',
      inputs: {
        image: new Blob([imageBuffer]),
      },
      parameters: {
        candidate_labels: candidateLabels,
      },
    })

    if (!results || results.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Could not analyze the image. Please try again.',
      })
    }

    // Find the top result and map back to a component
    const topResult = results[0]
    const matchedComponent = electronicsComponents.find(
      (c) => c.clipLabel === topResult.label
    )

    if (!matchedComponent || topResult.score < 0.1) {
      return NextResponse.json({
        success: false,
        error:
          'Could not identify the component. Try a clearer photo with good lighting.',
        topScores: results.slice(0, 3).map((r) => ({
          label: r.label,
          score: Math.round(r.score * 100),
        })),
      })
    }

    return NextResponse.json({
      success: true,
      componentId: matchedComponent.id,
      confidence: Math.round(topResult.score * 100),
      label: topResult.label,
    })
  } catch (error) {
    console.error('Identification error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'AI service temporarily unavailable. Please try again in a moment.',
      },
      { status: 500 }
    )
  }
}
