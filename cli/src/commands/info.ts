import chalk from 'chalk'
import { electronicsComponents } from '../../../data/components.js'

interface InfoOptions {
  json?: boolean
}

export async function infoCommand(
  componentId: string,
  options: InfoOptions
): Promise<void> {
  const component = electronicsComponents.find((c) => c.id === componentId)

  if (!component) {
    console.error(`Unknown component: "${componentId}"`)
    console.error(
      `Available: ${electronicsComponents.map((c) => c.id).join(', ')}`
    )
    process.exit(1)
  }

  if (options.json) {
    console.log(JSON.stringify(component, null, 2))
    return
  }

  console.log()
  console.log(chalk.bold(component.name))
  console.log('='.repeat(component.name.length))
  console.log(`${chalk.dim('Category:')} ${component.category}`)
  console.log()

  console.log(chalk.dim('Description:'))
  console.log(`  ${component.description}`)
  console.log()

  console.log(chalk.dim('Specs:'))
  for (const spec of component.specs) {
    console.log(`  ${spec.label.padEnd(20)} ${spec.value}`)
  }
  console.log()

  console.log(chalk.dim('Circuit Example:'))
  console.log(`  ${component.circuitExample}`)
  console.log()

  if (component.datasheetInfo) {
    const ds = component.datasheetInfo

    console.log(chalk.bold('Datasheet Details'))
    console.log('-'.repeat(40))

    console.log(chalk.dim('  Max Ratings:'))
    for (const r of ds.maxRatings) {
      console.log(`    ${r.parameter.padEnd(30)} ${r.value}`)
    }
    console.log()

    console.log(chalk.dim('  Pinout:'))
    console.log(`    ${ds.pinout}`)
    console.log()

    console.log(chalk.dim('  Characteristics:'))
    console.log(
      `    ${'Parameter'.padEnd(30)} ${'Min'.padEnd(8)} ${'Typ'.padEnd(8)} ${'Max'.padEnd(8)} Unit`
    )
    console.log(`    ${'─'.repeat(62)}`)
    for (const ch of ds.characteristics) {
      console.log(
        `    ${ch.parameter.padEnd(30)} ${(ch.min ?? '').padEnd(8)} ${(ch.typical ?? '').padEnd(8)} ${(ch.max ?? '').padEnd(8)} ${ch.unit}`
      )
    }
    console.log()

    console.log(chalk.dim('  Part Numbers:'))
    console.log(`    ${ds.partNumbers.join(', ')}`)
    console.log()

    console.log(chalk.dim('  Tips:'))
    console.log(`    ${ds.tips}`)
    console.log()
  }
}
