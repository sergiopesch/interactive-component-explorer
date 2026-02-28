import { electronicsComponents } from '@data/components.js'
import type { TermWriter } from '../shell.js'

export function infoCommand(args: string[], writer: TermWriter): void {
  const componentId = args.find((a) => !a.startsWith('-'))

  if (!componentId) {
    writer.error('Usage: info <component-id>')
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

  if (args.includes('--json')) {
    writer.writeln(JSON.stringify(component, null, 2))
    return
  }

  writer.writeln('')
  writer.bold(component.name)
  writer.writeln('='.repeat(component.name.length))
  writer.writeln(`\x1b[2mCategory:\x1b[0m ${component.category}`)
  writer.writeln('')

  writer.writeln('\x1b[2mDescription:\x1b[0m')
  writer.writeln(`  ${component.description}`)
  writer.writeln('')

  writer.writeln('\x1b[2mSpecs:\x1b[0m')
  for (const spec of component.specs) {
    writer.writeln(`  ${spec.label.padEnd(20)} ${spec.value}`)
  }
  writer.writeln('')

  writer.writeln('\x1b[2mCircuit Example:\x1b[0m')
  writer.writeln(`  ${component.circuitExample}`)
  writer.writeln('')

  if (component.datasheetInfo) {
    const ds = component.datasheetInfo

    writer.bold('Datasheet Details')
    writer.writeln('-'.repeat(40))

    writer.writeln('\x1b[2m  Max Ratings:\x1b[0m')
    for (const r of ds.maxRatings) {
      writer.writeln(`    ${r.parameter.padEnd(30)} ${r.value}`)
    }
    writer.writeln('')

    writer.writeln('\x1b[2m  Pinout:\x1b[0m')
    writer.writeln(`    ${ds.pinout}`)
    writer.writeln('')

    writer.writeln('\x1b[2m  Characteristics:\x1b[0m')
    writer.writeln(
      `    ${'Parameter'.padEnd(30)} ${'Min'.padEnd(8)} ${'Typ'.padEnd(8)} ${'Max'.padEnd(8)} Unit`
    )
    writer.writeln(`    ${'─'.repeat(62)}`)
    for (const ch of ds.characteristics) {
      writer.writeln(
        `    ${ch.parameter.padEnd(30)} ${(ch.min ?? '').padEnd(8)} ${(ch.typical ?? '').padEnd(8)} ${(ch.max ?? '').padEnd(8)} ${ch.unit}`
      )
    }
    writer.writeln('')

    writer.writeln('\x1b[2m  Part Numbers:\x1b[0m')
    writer.writeln(`    ${ds.partNumbers.join(', ')}`)
    writer.writeln('')

    writer.writeln('\x1b[2m  Tips:\x1b[0m')
    writer.writeln(`    ${ds.tips}`)
    writer.writeln('')
  }
}
