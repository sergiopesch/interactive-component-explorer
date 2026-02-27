import { NextRequest, NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'

const MAX_TEXT_LENGTH = 1000

export async function POST(request: NextRequest) {
  try {
    const token = process.env.HF_TOKEN || process.env.HF_VARIABLE
    if (!token) {
      return NextResponse.json(
        {
          error:
            'Hugging Face token not configured. Set HF_TOKEN (or HF_VARIABLE on Vercel).',
        },
        { status: 503 }
      )
    }

    const hf = new HfInference(token)

    const { text } = await request.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'No text provided.' },
        { status: 400 }
      )
    }

    // Limit text length to prevent abuse
    const truncatedText = text.slice(0, MAX_TEXT_LENGTH)

    const audioBlob = await hf.textToSpeech({
      model: 'facebook/mms-tts-eng',
      inputs: truncatedText,
    })

    // Convert blob to array buffer and return as audio response
    const arrayBuffer = await audioBlob.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/flac',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json(
      { error: 'TTS service temporarily unavailable.' },
      { status: 500 }
    )
  }
}
