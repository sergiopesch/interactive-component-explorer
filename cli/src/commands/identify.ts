import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import {
  identifyComponent,
  identifyTopN,
  loadClassifier,
} from '../services/identifier.js'
import { createProgressReporter } from '../utils/progress.js'

interface IdentifyOptions {
  json?: boolean
  top?: string
  threshold?: string
}

export async function identifyCommand(
  imagePath: string,
  options: IdentifyOptions
): Promise<void> {
  // Resolve and validate the image path
  const resolved = path.resolve(imagePath)
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`)
    process.exit(1)
  }

  const ext = path.extname(resolved).toLowerCase()
  const supported = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.tif']
  if (!supported.includes(ext)) {
    console.error(
      `Unsupported image format: ${ext}. Supported: ${supported.join(', ')}`
    )
    process.exit(1)
  }

  const topN = options.top ? parseInt(options.top, 10) : 1
  const threshold = options.threshold
    ? parseInt(options.threshold, 10) / 100
    : 0.03

  // Load model
  if (!options.json) {
    process.stdout.write('Loading CLIP model...')
  }
  const startLoad = Date.now()
  await loadClassifier(
    options.json ? undefined : createProgressReporter('Loading CLIP model')
  )
  const loadTime = ((Date.now() - startLoad) / 1000).toFixed(1)
  if (!options.json) {
    process.stdout.write(`\rLoading CLIP model... done (${loadTime}s)\n`)
  }

  // Classify
  if (!options.json) {
    process.stdout.write('Classifying image...')
  }
  const startClassify = Date.now()

  if (topN > 1) {
    const results = await identifyTopN(resolved, topN, threshold)
    const classifyTime = ((Date.now() - startClassify) / 1000).toFixed(1)

    if (options.json) {
      console.log(
        JSON.stringify(
          results.map((r) => ({
            id: r.component.id,
            name: r.component.name,
            confidence: r.confidence,
            category: r.component.category,
          })),
          null,
          2
        )
      )
      return
    }

    process.stdout.write(
      `\rClassifying image... done (${classifyTime}s)\n\n`
    )

    if (results.length === 0) {
      console.log(
        chalk.yellow(
          'Could not identify any components. Try a clearer photo with good lighting.'
        )
      )
      return
    }

    console.log(chalk.bold(`Top ${results.length} matches:\n`))
    for (let i = 0; i < results.length; i++) {
      const r = results[i]
      const marker = i === 0 ? chalk.green('->') : '  '
      console.log(
        `${marker} ${r.component.name.padEnd(22)} ${r.confidence}% confidence`
      )
    }
    console.log()
    return
  }

  // Single result
  const result = await identifyComponent(resolved, threshold)
  const classifyTime = ((Date.now() - startClassify) / 1000).toFixed(1)

  if (options.json) {
    if (result) {
      console.log(
        JSON.stringify(
          {
            id: result.component.id,
            name: result.component.name,
            confidence: result.confidence,
            category: result.component.category,
            description: result.component.description,
            specs: result.component.specs,
          },
          null,
          2
        )
      )
    } else {
      console.log(JSON.stringify({ error: 'No component identified' }))
    }
    return
  }

  process.stdout.write(`\rClassifying image... done (${classifyTime}s)\n\n`)

  if (!result) {
    console.log(
      chalk.yellow(
        'Could not confidently identify the component. Try a closer photo with better lighting.'
      )
    )
    return
  }

  const c = result.component
  console.log(
    chalk.green(`Identified: ${chalk.bold(c.name)} (${result.confidence}% confidence)\n`)
  )
  console.log(`  ${chalk.dim('Category:')}    ${c.category}`)
  console.log(`  ${chalk.dim('Description:')} ${c.description}`)
  console.log(`  ${chalk.dim('Circuit:')}     ${c.circuitExample}`)
  console.log()

  console.log(`  ${chalk.dim('Specs:')}`)
  for (const spec of c.specs) {
    console.log(`    ${spec.label.padEnd(20)} ${spec.value}`)
  }
  console.log()
  console.log(
    chalk.dim(
      `  Run \`electronics-cli info ${c.id}\` for full datasheet details.`
    )
  )
  console.log(
    chalk.dim(
      `  Run \`electronics-cli speak ${c.id}\` to generate voice description.`
    )
  )
  console.log()
}
