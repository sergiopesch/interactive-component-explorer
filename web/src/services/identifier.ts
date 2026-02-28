import { electronicsComponents } from '@data/components.js'
import type { ElectronicsComponent } from '@data/components.js'
import { classify, loadClassifier } from './classifier.js'

export interface IdentifyResult {
  component: ElectronicsComponent
  confidence: number
  reasoning: string
}

const CLIP_LABELS: { componentId: string; label: string }[] = []

const EXTRA_LABELS: Record<string, string[]> = {
  resistor: ['a photo of an axial resistor'],
  led: ['a photo of a red LED', 'a photo of a through-hole LED'],
  button: ['a photo of a push button', 'a photo of a tactile switch'],
  speaker: ['a photo of a piezo buzzer'],
  capacitor: [
    'a photo of a radial capacitor',
    'a photo of an electrolytic capacitor',
  ],
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

for (const component of electronicsComponents) {
  const seen = new Set<string>()

  const addLabel = (label: string) => {
    const key = label.toLowerCase().trim()
    if (!seen.has(key)) {
      seen.add(key)
      CLIP_LABELS.push({ componentId: component.id, label })
    }
  }

  addLabel(component.clipLabel)

  for (const extra of EXTRA_LABELS[component.id] ?? []) {
    addLabel(extra)
  }
}

const ALL_CANDIDATE_LABELS = CLIP_LABELS.map((l) => l.label)

export { loadClassifier }

export async function identifyComponent(
  image: string | Blob,
  threshold = 0.03
): Promise<IdentifyResult | null> {
  const results = await classify(image, ALL_CANDIDATE_LABELS)

  if (!results || results.length === 0) {
    return null
  }

  const componentScores = new Map<string, number>()
  for (const result of results) {
    const entry = CLIP_LABELS.find(
      (l) => l.label.toLowerCase() === result.label.toLowerCase()
    )
    if (!entry) continue
    const existing = componentScores.get(entry.componentId) ?? 0
    if (result.score > existing) {
      componentScores.set(entry.componentId, result.score)
    }
  }

  const ranked = [...componentScores.entries()]
    .map(([componentId, score]) => ({ componentId, score }))
    .sort((a, b) => b.score - a.score)

  if (ranked.length === 0 || ranked[0].score < threshold) {
    return null
  }

  const matched = electronicsComponents.find(
    (c) => c.id === ranked[0].componentId
  )
  if (!matched) {
    return null
  }

  return {
    component: matched,
    confidence: Math.round(ranked[0].score * 100),
    reasoning: 'Identified via local CLIP model (WASM)',
  }
}

export async function identifyTopN(
  image: string | Blob,
  n: number,
  threshold = 0.03
): Promise<IdentifyResult[]> {
  const results = await classify(image, ALL_CANDIDATE_LABELS)

  if (!results || results.length === 0) {
    return []
  }

  const componentScores = new Map<string, number>()
  for (const result of results) {
    const entry = CLIP_LABELS.find(
      (l) => l.label.toLowerCase() === result.label.toLowerCase()
    )
    if (!entry) continue
    const existing = componentScores.get(entry.componentId) ?? 0
    if (result.score > existing) {
      componentScores.set(entry.componentId, result.score)
    }
  }

  const ranked = [...componentScores.entries()]
    .map(([componentId, score]) => ({ componentId, score }))
    .sort((a, b) => b.score - a.score)
    .filter((r) => r.score >= threshold)
    .slice(0, n)

  return ranked
    .map((r) => {
      const component = electronicsComponents.find(
        (c) => c.id === r.componentId
      )
      if (!component) return null
      return {
        component,
        confidence: Math.round(r.score * 100),
        reasoning: 'Identified via local CLIP model (WASM)',
      }
    })
    .filter((r): r is IdentifyResult => r !== null)
}
