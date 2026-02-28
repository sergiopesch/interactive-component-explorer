/**
 * Simple terminal progress reporter for model loading.
 */
export function createProgressReporter(label: string): (pct: number) => void {
  let lastPct = -1
  return (pct: number) => {
    if (pct === lastPct) return
    lastPct = pct
    process.stdout.write(`\r  ${label}... ${pct}%`)
    if (pct >= 100) {
      process.stdout.write('\n')
    }
  }
}
