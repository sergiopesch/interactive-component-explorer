import { electronicsComponents } from '@data/components.js'
import type { TermWriter } from '../shell.js'

export function listCommand(args: string[], writer: TermWriter): void {
  let components = electronicsComponents

  // Parse --category / -c flag
  const catIdx = args.findIndex((a) => a === '--category' || a === '-c')
  if (catIdx !== -1 && args[catIdx + 1]) {
    const cat = args[catIdx + 1].toLowerCase()
    const valid = ['passive', 'active', 'input', 'output']
    if (!valid.includes(cat)) {
      writer.error(
        `Invalid category: "${cat}". Valid: ${valid.join(', ')}`
      )
      return
    }
    components = components.filter((c) => c.category === cat)
  }

  if (args.includes('--json')) {
    const data = components.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
    }))
    writer.writeln(JSON.stringify(data, null, 2))
    return
  }

  const total = components.length
  const catFilter = catIdx !== -1 ? args[catIdx + 1] : null
  const label = catFilter
    ? `Electronics Components — ${catFilter} (${total})`
    : `Electronics Components (${total} total)`

  writer.writeln('')
  writer.bold(label)
  writer.writeln('')

  const categories = ['passive', 'active', 'input', 'output'] as const
  for (const cat of categories) {
    const group = components.filter((c) => c.category === cat)
    if (group.length === 0) continue

    writer.underline(
      `  ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${group.length}):`
    )
    for (const c of group) {
      writer.writeln(`    \x1b[2m${c.id.padEnd(18)}\x1b[0m ${c.name}`)
    }
    writer.writeln('')
  }
}
