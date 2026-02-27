import { NextRequest, NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'
import { electronicsComponents } from '@/data/components'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

export const runtime = 'nodejs'

// Aliases for fuzzy-matching VLM text responses to component IDs
const COMPONENT_ALIASES: Record<string, string[]> = {
  resistor: ['resistor', 'resistance', 'resistors', 'carbon film', 'color band', 'colour band'],
  led: ['led', 'light emitting diode', 'light-emitting diode', 'led light'],
  button: ['button', 'push button', 'tactile switch', 'pushbutton', 'tact switch', 'momentary switch'],
  speaker: ['speaker', 'piezo', 'buzzer', 'piezo speaker', 'piezo buzzer', 'piezoelectric'],
  capacitor: ['capacitor', 'electrolytic capacitor', 'ceramic capacitor', 'cap'],
  potentiometer: ['potentiometer', 'pot', 'variable resistor', 'trimpot', 'trimmer'],
  diode: ['diode', 'rectifier', 'rectifier diode', '1n4007', '1n4148'],
  transistor: ['transistor', 'bjt', 'mosfet', 'npn', 'pnp', '2n2222', 'to-92'],
  servo: ['servo', 'servo motor', 'servomotor', 'sg90', 'sg-90'],
  'dc-motor': ['dc motor', 'dc-motor', 'electric motor', 'brushed motor', 'small motor'],
  photoresistor: ['photoresistor', 'ldr', 'light dependent resistor', 'photocell', 'light sensor', 'cds'],
  'temp-sensor': ['temperature sensor', 'temp sensor', 'thermistor', 'tmp36', 'lm35', 'ntc'],
  ultrasonic: ['ultrasonic', 'ultrasonic sensor', 'hc-sr04', 'hcsr04', 'distance sensor', 'sonar sensor'],
  lcd: ['lcd', 'lcd display', 'liquid crystal', 'lcd1602', '16x2', 'lcd module', 'hd44780'],
  relay: ['relay', 'relay module', 'electromagnetic relay'],
  'rgb-led': ['rgb led', 'rgb', 'rgb light', 'multicolor led', 'multi-color led', 'tri-color led'],
}

function matchComponentFromText(text: string): { componentId: string; confidence: number } | null {
  const normalized = text.toLowerCase().trim()
  let bestMatch: { componentId: string; confidence: number } | null = null

  for (const [componentId, aliases] of Object.entries(COMPONENT_ALIASES)) {
    for (const alias of aliases) {
      if (normalized.includes(alias)) {
        const confidence = Math.min(90, 65 + alias.length * 2)
        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { componentId, confidence }
        }
      }
    }
  }

  return bestMatch
}

// ── CLIP fallback (existing approach) ──────────────────────────────────────

const CLIP_LABEL_ALIASES: Record<string, string[]> = {
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

function getDefaultPhotoLabel(name: string) {
  const simplified = name.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase()
  const startsWithVowel = /^[aeiou]/.test(simplified)
  return `a photo of ${startsWithVowel ? 'an' : 'a'} ${simplified}`
}

function normalizeLabel(value: string) {
  return value.trim().toLowerCase()
}

async function identifyWithCLIP(hf: HfInference, imageBuffer: Buffer) {
  const labelToComponentId = new Map<string, string>()
  const candidateLabels: string[] = []

  for (const component of electronicsComponents) {
    const labelVariants = [
      component.clipLabel,
      getDefaultPhotoLabel(component.name),
      ...(CLIP_LABEL_ALIASES[component.id] || []),
    ]

    for (const label of labelVariants) {
      const normalized = normalizeLabel(label)
      if (!labelToComponentId.has(normalized)) {
        labelToComponentId.set(normalized, component.id)
        candidateLabels.push(label)
      }
    }
  }

  const rawResults = await hf.zeroShotImageClassification({
    model: 'openai/clip-vit-large-patch14',
    inputs: new Blob([new Uint8Array(imageBuffer)]),
    parameters: { candidate_labels: candidateLabels },
  })

  if (!Array.isArray(rawResults) || rawResults.length === 0) return null

  const componentScores = new Map<string, number>()
  for (const result of rawResults) {
    if (typeof result?.label !== 'string' || typeof result?.score !== 'number') continue
    const componentId = labelToComponentId.get(normalizeLabel(result.label))
    if (!componentId) continue
    const existing = componentScores.get(componentId) ?? 0
    if (result.score > existing) {
      componentScores.set(componentId, result.score)
    }
  }

  const ranked = [...componentScores.entries()]
    .map(([componentId, score]) => ({ componentId, score }))
    .sort((a, b) => b.score - a.score)

  if (ranked.length === 0 || ranked[0].score < 0.03) return null

  const matchedComponent = electronicsComponents.find((c) => c.id === ranked[0].componentId)
  if (!matchedComponent) return null

  return {
    componentId: matchedComponent.id,
    confidence: Math.round(ranked[0].score * 100),
    label: matchedComponent.name,
    reasoning: 'Identified via visual similarity matching',
  }
}

// ── Main handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const token = process.env.HF_TOKEN || process.env.HF_VARIABLE
    if (!token) {
      return NextResponse.json(
        { success: false, code: 'MISSING_HF_TOKEN', error: 'Hugging Face token is not configured.' },
        { status: 503 }
      )
    }

    const hf = new HfInference(token)

    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 })
    }

    const image =
      typeof payload === 'object' && payload !== null && 'image' in payload
        ? (payload as { image?: unknown }).image
        : null

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ success: false, error: 'No image provided.' }, { status: 400 })
    }

    const base64Data = image.includes(',') ? image.split(',')[1] : image
    const sanitizedBase64 = base64Data.replace(/\s/g, '')
    const imageBuffer = Buffer.from(sanitizedBase64, 'base64')

    if (imageBuffer.byteLength === 0) {
      return NextResponse.json({ success: false, error: 'Invalid image data.' }, { status: 400 })
    }

    if (imageBuffer.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Image is too large. Please upload a smaller image.' },
        { status: 413 }
      )
    }

    const componentList = electronicsComponents
      .map((c) => `${c.id}: ${c.name}`)
      .join(', ')

    const dataUrl = `data:image/jpeg;base64,${sanitizedBase64}`

    // ── Strategy 1: Vision Language Model (most accurate) ──────────────
    try {
      const vlmResponse = await hf.chatCompletion({
        model: 'meta-llama/Llama-3.2-11B-Vision-Instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: dataUrl } },
              {
                type: 'text',
                text: `You are an expert electronics engineer helping a beginner identify components.

Look at this image and identify the electronic component. Choose EXACTLY ONE id from this list:
${componentList}

Respond ONLY with valid JSON, no extra text:
{"component": "the-component-id", "confidence": 85, "reasoning": "one sentence why"}`,
              },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0.1,
      })

      const content = vlmResponse.choices?.[0]?.message?.content?.trim()
      if (content) {
        // Try JSON parse
        const jsonMatch = content.match(/\{[\s\S]*?\}/)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            const componentId = String(parsed.component ?? '').toLowerCase().trim()
            const matched = electronicsComponents.find((c) => c.id === componentId)
            if (matched) {
              return NextResponse.json({
                success: true,
                componentId: matched.id,
                confidence: Math.min(99, Math.max(10, Number(parsed.confidence) || 80)),
                label: matched.name,
                reasoning: parsed.reasoning || '',
              })
            }
          } catch {
            // JSON parse failed, try text match below
          }
        }

        // Fallback: fuzzy match on the raw text
        const textMatch = matchComponentFromText(content)
        if (textMatch) {
          const matched = electronicsComponents.find((c) => c.id === textMatch.componentId)
          if (matched) {
            return NextResponse.json({
              success: true,
              componentId: matched.id,
              confidence: textMatch.confidence,
              label: matched.name,
              reasoning: content.slice(0, 200),
            })
          }
        }
      }
    } catch (vlmErr) {
      console.warn('VLM identification failed, trying fallbacks:', vlmErr)
    }

    // ── Strategy 2: Visual Question Answering ──────────────────────────
    try {
      const vqaResult = await hf.visualQuestionAnswering({
        model: 'Salesforce/blip-vqa-large',
        inputs: {
          image: new Blob([new Uint8Array(imageBuffer)]),
          question: 'What type of electronic component is shown in this image?',
        },
      })

      if (vqaResult?.answer) {
        const textMatch = matchComponentFromText(vqaResult.answer)
        if (textMatch) {
          const matched = electronicsComponents.find((c) => c.id === textMatch.componentId)
          if (matched) {
            return NextResponse.json({
              success: true,
              componentId: matched.id,
              confidence: Math.min(textMatch.confidence, 75),
              label: matched.name,
              reasoning: `VQA identified: ${vqaResult.answer}`,
            })
          }
        }
      }
    } catch (vqaErr) {
      console.warn('VQA identification failed, trying CLIP:', vqaErr)
    }

    // ── Strategy 3: CLIP zero-shot classification (original fallback) ──
    try {
      const clipResult = await identifyWithCLIP(hf, imageBuffer)
      if (clipResult) {
        return NextResponse.json({ success: true, ...clipResult })
      }
    } catch (clipErr) {
      console.warn('CLIP identification failed:', clipErr)
    }

    // ── All strategies failed ──────────────────────────────────────────
    return NextResponse.json({
      success: false,
      code: 'COMPONENT_NOT_RECOGNIZED',
      error: 'Could not identify the component. Try a clearer photo with good lighting and a plain background.',
    })
  } catch (error) {
    console.error('Identification error:', error)
    return NextResponse.json(
      { success: false, code: 'IDENTIFICATION_SERVICE_ERROR', error: 'AI service temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    )
  }
}
