import '@xterm/xterm/css/xterm.css'
import { createShell } from './shell.js'

const container = document.getElementById('terminal-container')
if (!container) {
  throw new Error('Terminal container not found')
}

const { fitAddon } = createShell(container)

window.addEventListener('resize', () => {
  fitAddon.fit()
})
