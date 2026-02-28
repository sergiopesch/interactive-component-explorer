import { electronicsComponents } from '@data/components.js'
import { loadTTS, synthesize } from '../services/tts.js'
import { float32ToWavBlob } from '../services/wav.js'
import type { TermWriter } from '../shell.js'

export async function speakCommand(
  args: string[],
  writer: TermWriter
): Promise<void> {
  const componentId = args.find((a) => !a.startsWith('-'))

  if (!componentId) {
    writer.error('Usage: speak <component-id>')
    writer.writeln(
      `Available: ${electronicsComponents.map((c) => c.id).join(', ')}`
    )
    return
  }

  const component = electronicsComponents.find((c) => c.id === componentId)

  if (!component) {
    writer.error(`Unknown component: "${componentId}"`)
    writer.writeln(
      `Available: ${electronicsComponents.map((c) => c.id).join(', ')}`
    )
    return
  }

  // Check for custom text via -t / --text flag
  const textIdx = args.findIndex((a) => a === '-t' || a === '--text')
  const text = textIdx !== -1 && args[textIdx + 1]
    ? args[textIdx + 1]
    : component.voiceDescription

  writer.write('Loading TTS model...')
  const startLoad = Date.now()
  await loadTTS((pct) => {
    writer.clearLine()
    writer.write(`Loading TTS model... ${pct}%`)
  })
  const loadTime = ((Date.now() - startLoad) / 1000).toFixed(1)
  writer.clearLine()
  writer.writeln(`Loading TTS model... done (${loadTime}s)`)

  writer.writeln(`Synthesizing speech for "${component.name}"...`)
  const startSynth = Date.now()

  const { samples, sampleRate } = await synthesize(text, (index, total) => {
    writer.clearLine()
    writer.write(`  Sentence ${index}/${total}...`)
  })

  const synthTime = ((Date.now() - startSynth) / 1000).toFixed(1)
  writer.clearLine()
  writer.writeln('  done')
  writer.writeln('')

  const durationSeconds = samples.length / sampleRate

  // Create WAV blob and play it in the browser
  const wavBlob = float32ToWavBlob(samples, sampleRate)
  const audioUrl = URL.createObjectURL(wavBlob)
  const audio = new Audio(audioUrl)

  writer.writeln(
    `\x1b[32mPlaying audio (${synthTime}s synthesis, ${sampleRate} Hz, ${durationSeconds.toFixed(1)}s audio)\x1b[0m`
  )

  audio.play().catch(() => {
    writer.warn('Browser blocked audio playback. Click the page and try again.')
  })

  // Also offer download
  const downloadLink = document.createElement('a')
  downloadLink.href = audioUrl
  downloadLink.download = `${component.id}.wav`
  writer.writeln(
    `\x1b[2mWAV file download started: ${component.id}.wav\x1b[0m`
  )
  downloadLink.click()

  // Clean up after audio finishes
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(audioUrl)
  })

  writer.writeln('')
}
