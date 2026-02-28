import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { listCommand } from './commands/list.js'
import { infoCommand } from './commands/info.js'
import { identifyCommand } from './commands/identify.js'
import { speakCommand } from './commands/speak.js'

export interface TermWriter {
  write(text: string): void
  writeln(text: string): void
  bold(text: string): void
  underline(text: string): void
  error(text: string): void
  warn(text: string): void
  clearLine(): void
}

const PROMPT = '\x1b[36melectronics\x1b[0m\x1b[33m>\x1b[0m '

const HELP_TEXT = `
\x1b[1mElectronics Explorer — Browser Terminal\x1b[0m

\x1b[2mCommands:\x1b[0m
  list                          List all components
  list -c <category>            Filter by: passive, active, input, output
  info <component-id>           Show component details and datasheet
  identify                      Identify a component from a photo (opens file picker)
  identify --top <n>            Show top N matches
  speak <component-id>          Generate and play voice description
  help                          Show this help message
  clear                         Clear the terminal

\x1b[2mExamples:\x1b[0m
  list -c passive
  info resistor
  identify --top 3
  speak led

\x1b[2mAll AI runs locally in your browser via WASM. No data leaves your machine.\x1b[0m
`

export function createShell(container: HTMLElement): {
  terminal: Terminal
  fitAddon: FitAddon
} {
  const terminal = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Menlo, Monaco, monospace',
    theme: {
      background: '#1a1b26',
      foreground: '#a9b1d6',
      cursor: '#c0caf5',
      selectionBackground: '#33467c',
      black: '#32344a',
      red: '#f7768e',
      green: '#9ece6a',
      yellow: '#e0af68',
      blue: '#7aa2f7',
      magenta: '#ad8ee6',
      cyan: '#449dab',
      white: '#787c99',
      brightBlack: '#444b6a',
      brightRed: '#ff7a93',
      brightGreen: '#b9f27c',
      brightYellow: '#ff9e64',
      brightBlue: '#7da6ff',
      brightMagenta: '#bb9af7',
      brightCyan: '#0db9d7',
      brightWhite: '#acb0d0',
    },
    allowProposedApi: true,
  })

  const fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)
  terminal.loadAddon(new WebLinksAddon())

  terminal.open(container)
  fitAddon.fit()

  const writer: TermWriter = {
    write(text: string) {
      terminal.write(text)
    },
    writeln(text: string) {
      terminal.writeln(text)
    },
    bold(text: string) {
      terminal.writeln(`\x1b[1m${text}\x1b[0m`)
    },
    underline(text: string) {
      terminal.writeln(`\x1b[4m${text}\x1b[0m`)
    },
    error(text: string) {
      terminal.writeln(`\x1b[31m${text}\x1b[0m`)
    },
    warn(text: string) {
      terminal.writeln(`\x1b[33m${text}\x1b[0m`)
    },
    clearLine() {
      terminal.write('\r\x1b[K')
    },
  }

  // Hidden file input for identify command
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/jpeg,image/png,image/webp,image/bmp,image/tiff'
  fileInput.style.display = 'none'
  document.body.appendChild(fileInput)

  function pickFile(): Promise<File | null> {
    return new Promise((resolve) => {
      fileInput.value = ''
      fileInput.onchange = () => {
        resolve(fileInput.files?.[0] ?? null)
      }
      // If dialog is cancelled
      const onFocus = () => {
        setTimeout(() => {
          if (!fileInput.files?.length) {
            resolve(null)
          }
          window.removeEventListener('focus', onFocus)
        }, 500)
      }
      window.addEventListener('focus', onFocus)
      fileInput.click()
    })
  }

  let currentLine = ''
  let busy = false
  const history: string[] = []
  let historyIdx = -1

  function prompt() {
    terminal.write(PROMPT)
  }

  async function executeCommand(line: string): Promise<void> {
    const trimmed = line.trim()
    if (!trimmed) return

    history.unshift(trimmed)
    if (history.length > 50) history.pop()

    const parts = trimmed.split(/\s+/)
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    switch (cmd) {
      case 'help':
        writer.writeln(HELP_TEXT)
        break

      case 'clear':
        terminal.clear()
        break

      case 'list':
        listCommand(args, writer)
        break

      case 'info':
        infoCommand(args, writer)
        break

      case 'identify':
        await identifyCommand(args, writer, pickFile)
        break

      case 'speak':
        await speakCommand(args, writer)
        break

      default:
        writer.error(
          `Unknown command: "${cmd}". Type "help" for available commands.`
        )
        break
    }
  }

  // Welcome message
  terminal.writeln('')
  terminal.writeln(
    '\x1b[1m⚡ Electronics Component Explorer\x1b[0m'
  )
  terminal.writeln(
    '\x1b[2mAll AI runs locally in your browser via WebAssembly.\x1b[0m'
  )
  terminal.writeln(
    '\x1b[2mType "help" for commands, or try "list" to see all components.\x1b[0m'
  )
  terminal.writeln('')
  prompt()

  terminal.onKey(({ key, domEvent }) => {
    if (busy) return

    const code = domEvent.keyCode

    if (code === 13) {
      // Enter
      terminal.writeln('')
      const line = currentLine
      currentLine = ''
      historyIdx = -1

      if (line.trim()) {
        busy = true
        executeCommand(line)
          .catch((err) => {
            writer.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
          })
          .finally(() => {
            busy = false
            prompt()
          })
      } else {
        prompt()
      }
    } else if (code === 8) {
      // Backspace
      if (currentLine.length > 0) {
        currentLine = currentLine.slice(0, -1)
        terminal.write('\b \b')
      }
    } else if (code === 38) {
      // Arrow Up — history
      if (historyIdx < history.length - 1) {
        historyIdx++
        // Clear current input
        terminal.write('\r\x1b[K')
        terminal.write(PROMPT)
        currentLine = history[historyIdx]
        terminal.write(currentLine)
      }
    } else if (code === 40) {
      // Arrow Down — history
      if (historyIdx > 0) {
        historyIdx--
        terminal.write('\r\x1b[K')
        terminal.write(PROMPT)
        currentLine = history[historyIdx]
        terminal.write(currentLine)
      } else if (historyIdx === 0) {
        historyIdx = -1
        terminal.write('\r\x1b[K')
        terminal.write(PROMPT)
        currentLine = ''
      }
    } else if (code === 9) {
      // Tab — autocomplete
      domEvent.preventDefault()
      const commands = ['list', 'info', 'identify', 'speak', 'help', 'clear']
      const match = commands.filter((c) => c.startsWith(currentLine))
      if (match.length === 1) {
        const rest = match[0].slice(currentLine.length)
        currentLine += rest + ' '
        terminal.write(rest + ' ')
      }
    } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
      // Printable character
      currentLine += key
      terminal.write(key)
    } else if (domEvent.ctrlKey && code === 67) {
      // Ctrl+C
      terminal.writeln('^C')
      currentLine = ''
      prompt()
    } else if (domEvent.ctrlKey && code === 76) {
      // Ctrl+L — clear
      terminal.clear()
      prompt()
    }
  })

  // Handle paste
  terminal.onData((data) => {
    if (busy) return
    // Only handle paste (multi-char data that isn't a control sequence)
    if (data.length > 1 && !data.startsWith('\x1b')) {
      // Filter to printable characters only
      const printable = data.replace(/[^\x20-\x7e]/g, '')
      if (printable) {
        currentLine += printable
        terminal.write(printable)
      }
    }
  })

  return { terminal, fitAddon }
}
