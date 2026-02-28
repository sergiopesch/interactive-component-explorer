import chalk from 'chalk'
import { electronicsComponents } from '../../../data/components.js'

interface ListOptions {
  category?: string
  json?: boolean
}

export async function listCommand(options: ListOptions): Promise<void> {
  let components = electronicsComponents

  if (options.category) {
    const cat = options.category.toLowerCase()
    const valid = ['passive', 'active', 'input', 'output']
    if (!valid.includes(cat)) {
      console.error(
        `Invalid category: "${options.category}". Valid: ${valid.join(', ')}`
      )
      process.exit(1)
    }
    components = components.filter((c) => c.category === cat)
  }

  if (options.json) {
    const data = components.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
    }))
    console.log(JSON.stringify(data, null, 2))
    return
  }

  const total = components.length
  const label = options.category
    ? `Electronics Components — ${options.category} (${total})`
    : `Electronics Components (${total} total)`

  console.log(`\n${chalk.bold(label)}\n`)

  // Group by category
  const categories = ['passive', 'active', 'input', 'output'] as const
  for (const cat of categories) {
    const group = components.filter((c) => c.category === cat)
    if (group.length === 0) continue

    console.log(
      `  ${chalk.underline(cat.charAt(0).toUpperCase() + cat.slice(1))} (${group.length}):`
    )
    for (const c of group) {
      console.log(`    ${chalk.dim(c.id.padEnd(18))} ${c.name}`)
    }
    console.log()
  }
}
