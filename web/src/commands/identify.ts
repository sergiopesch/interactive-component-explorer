import {
  identifyComponent,
  identifyTopN,
  loadClassifier,
} from '../services/identifier.js'
import type { TermWriter } from '../shell.js'

export async function identifyCommand(
  args: string[],
  writer: TermWriter,
  pickFile: () => Promise<File | null>
): Promise<void> {
  const topArg = args.findIndex((a) => a === '--top')
  const topN = topArg !== -1 && args[topArg + 1] ? parseInt(args[topArg + 1], 10) : 1
  const thrArg = args.findIndex((a) => a === '--threshold')
  const threshold = thrArg !== -1 && args[thrArg + 1]
    ? parseInt(args[thrArg + 1], 10) / 100
    : 0.03

  writer.writeln('Select an image file to identify...')

  const file = await pickFile()
  if (!file) {
    writer.error('No file selected.')
    return
  }

  writer.writeln(`File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)

  writer.write('Loading CLIP model...')
  const startLoad = Date.now()
  await loadClassifier((pct) => {
    writer.clearLine()
    writer.write(`Loading CLIP model... ${pct}%`)
  })
  const loadTime = ((Date.now() - startLoad) / 1000).toFixed(1)
  writer.clearLine()
  writer.writeln(`Loading CLIP model... done (${loadTime}s)`)

  // Convert file to blob URL for the classifier
  const imageUrl = URL.createObjectURL(file)

  writer.write('Classifying image...')
  const startClassify = Date.now()

  try {
    if (topN > 1) {
      const results = await identifyTopN(imageUrl, topN, threshold)
      const classifyTime = ((Date.now() - startClassify) / 1000).toFixed(1)

      writer.clearLine()
      writer.writeln(`Classifying image... done (${classifyTime}s)`)
      writer.writeln('')

      if (results.length === 0) {
        writer.warn(
          'Could not identify any components. Try a clearer photo with good lighting.'
        )
        return
      }

      writer.bold(`Top ${results.length} matches:`)
      writer.writeln('')
      for (let i = 0; i < results.length; i++) {
        const r = results[i]
        const marker = i === 0 ? '\x1b[32m->\x1b[0m' : '  '
        writer.writeln(
          `${marker} ${r.component.name.padEnd(22)} ${r.confidence}% confidence`
        )
      }
      writer.writeln('')
    } else {
      const result = await identifyComponent(imageUrl, threshold)
      const classifyTime = ((Date.now() - startClassify) / 1000).toFixed(1)

      writer.clearLine()
      writer.writeln(`Classifying image... done (${classifyTime}s)`)
      writer.writeln('')

      if (!result) {
        writer.warn(
          'Could not confidently identify the component. Try a closer photo with better lighting.'
        )
        return
      }

      const c = result.component
      writer.writeln(
        `\x1b[32mIdentified: \x1b[1m${c.name}\x1b[0m\x1b[32m (${result.confidence}% confidence)\x1b[0m`
      )
      writer.writeln('')
      writer.writeln(`  \x1b[2mCategory:\x1b[0m    ${c.category}`)
      writer.writeln(`  \x1b[2mDescription:\x1b[0m ${c.description}`)
      writer.writeln(`  \x1b[2mCircuit:\x1b[0m     ${c.circuitExample}`)
      writer.writeln('')

      writer.writeln('  \x1b[2mSpecs:\x1b[0m')
      for (const spec of c.specs) {
        writer.writeln(`    ${spec.label.padEnd(20)} ${spec.value}`)
      }
      writer.writeln('')
      writer.writeln(
        `\x1b[2m  Run \`info ${c.id}\` for full datasheet details.\x1b[0m`
      )
      writer.writeln(
        `\x1b[2m  Run \`speak ${c.id}\` to generate voice description.\x1b[0m`
      )
      writer.writeln('')
    }
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}
