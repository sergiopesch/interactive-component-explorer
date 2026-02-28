#!/usr/bin/env node

import { Command } from 'commander'
import { listCommand } from '../src/commands/list.js'
import { infoCommand } from '../src/commands/info.js'
import { identifyCommand } from '../src/commands/identify.js'
import { speakCommand } from '../src/commands/speak.js'

const program = new Command()

program
  .name('electronics-cli')
  .description(
    'Identify electronic components from photos and generate voice descriptions using local AI models'
  )
  .version('1.0.0')

program
  .command('list')
  .description('List all available electronic components')
  .option('-c, --category <category>', 'Filter by category: passive, active, input, output')
  .option('--json', 'Output as JSON')
  .action(listCommand)

program
  .command('info')
  .description('Show detailed information for a component')
  .argument('<component-id>', 'Component ID (e.g., resistor, led, capacitor)')
  .option('--json', 'Output as JSON')
  .action(infoCommand)

program
  .command('identify')
  .description('Identify an electronic component from a photo')
  .argument('<image>', 'Path to an image file (JPEG, PNG, WebP, BMP, TIFF)')
  .option('--json', 'Output as JSON')
  .option('--top <n>', 'Show top N matches', '1')
  .option('--threshold <pct>', 'Minimum confidence percentage', '3')
  .action(identifyCommand)

program
  .command('speak')
  .description("Generate a WAV audio file of a component's voice description")
  .argument('<component-id>', 'Component ID (e.g., resistor, led, capacitor)')
  .option('-o, --output <path>', 'Output WAV file path (default: ./<component-id>.wav)')
  .option('-t, --text <text>', 'Custom text to speak instead of component description')
  .action(speakCommand)

program.parse()
