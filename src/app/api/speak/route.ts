import { NextRequest, NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HF_TOKEN)

export async function POST(request: NextRequest) {
  try {
    if (!process.env.HF_TOKEN) {
      return NextResponse.json(
        { error: 'HF_TOKEN not configured.' },
        { status: 500 }
      )
    }

    const { text } = await request.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'No text provided.' },
        { status: 400 }
      )
    }

    // Limit text length to prevent abuse
    const truncatedText = text.slice(0, 1000)

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
