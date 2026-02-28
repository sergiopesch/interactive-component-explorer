import path from 'path'
import chalk from 'chalk'
import { electronicsComponents } from '../../../data/components.js'
import { loadTTS, synthesizeToFile } from '../services/tts.js'
import { createProgressReporter } from '../utils/progress.js'

interface SpeakOptions {
  output?: string
  text?: string
}

export async function speakCommand(
  componentId: string,
  options: SpeakOptions
): Promise<void> {
  const component = electronicsComponents.find((c) => c.id === componentId)

  if (!component) {
    console.error(`Unknown component: "${componentId}"`)
    console.error(
      `Available: ${electronicsComponents.map((c) => c.id).join(', ')}`
    )
    process.exit(1)
  }

  const text = options.text ?? component.voiceDescription
  const outputPath = path.resolve(
    options.output ?? `./${component.id}.wav`
  )

  // Load model
  process.stdout.write('Loading TTS model...')
  const startLoad = Date.now()
  await loadTTS(createProgressReporter('Loading TTS model'))
  const loadTime = ((Date.now() - startLoad) / 1000).toFixed(1)
  process.stdout.write(`\rLoading TTS model... done (${loadTime}s)\n`)

  // Synthesize
  console.log(`Synthesizing speech for "${component.name}"...`)
  const startSynth = Date.now()

  const { sampleRate, durationSeconds } = await synthesizeToFile(
    text,
    outputPath,
    (index, total) => {
      process.stdout.write(`\r  Sentence ${index}/${total}...`)
    }
  )

  const synthTime = ((Date.now() - startSynth) / 1000).toFixed(1)
  process.stdout.write(` done\n\n`)

  console.log(
    chalk.green(
      `Saved: ${outputPath} (${synthTime}s, 16-bit PCM, ${sampleRate} Hz, ${durationSeconds.toFixed(1)}s audio)`
    )
  )
  console.log()
}
