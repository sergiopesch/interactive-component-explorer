import { NextRequest, NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'

const MAX_TEXT_LENGTH = 2000

/**
 * Split text into sentences for progressive TTS streaming.
 * Each sentence is generated and streamed independently so the client
 * can start playback before the full text is synthesized.
 */
function splitIntoSentences(text: string): string[] {
  const raw = text.match(/[^.!?]+[.!?]+\s*/g)
  if (!raw) return [text.trim()].filter(Boolean)

  const sentences: string[] = []
  for (const s of raw) {
    const trimmed = s.trim()
    if (trimmed.length > 0) sentences.push(trimmed)
  }

  // If there's leftover text after the last sentence-ending punctuation
  const joined = raw.join('')
  const remainder = text.slice(joined.length).trim()
  if (remainder.length > 0) sentences.push(remainder)

  return sentences.length > 0 ? sentences : [text.trim()]
}

export async function POST(request: NextRequest) {
  const token = process.env.HF_TOKEN || process.env.HF_VARIABLE
  if (!token) {
    return NextResponse.json(
      { error: 'Hugging Face token not configured.' },
      { status: 503 }
    )
  }

  let text: string
  try {
    const body = await request.json()
    text = typeof body?.text === 'string' ? body.text : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!text) {
    return NextResponse.json({ error: 'No text provided.' }, { status: 400 })
  }

  const truncatedText = text.slice(0, MAX_TEXT_LENGTH)
  const sentences = splitIntoSentences(truncatedText)

  const hf = new HfInference(token)
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (let i = 0; i < sentences.length; i++) {
          try {
            const audioBlob = await hf.textToSpeech({
              model: 'facebook/mms-tts-eng',
              inputs: sentences[i],
            })

            const arrayBuffer = await audioBlob.arrayBuffer()
            const base64 = Buffer.from(arrayBuffer).toString('base64')

            const chunk = JSON.stringify({
              index: i,
              total: sentences.length,
              audio: base64,
            }) + '\n'

            controller.enqueue(encoder.encode(chunk))
          } catch (err) {
            // Log but continue with remaining sentences
            console.warn(`TTS failed for sentence ${i}:`, err)
          }
        }
      } catch (err) {
        console.error('Streaming TTS error:', err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
    },
  })
}
