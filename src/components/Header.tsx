'use client'

interface HeaderProps {
  isDark: boolean
  onToggleTheme: () => void
  mounted: boolean
}

export default function Header({ isDark, onToggleTheme, mounted }: HeaderProps) {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Electronics Explorer
          </h1>
          <p className="text-sm text-black/50 dark:text-white/50 mt-0.5">
            Snap a photo and learn about electronic components
          </p>
        </div>
        {mounted && (
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg text-sm font-medium text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="text-lg">{isDark ? '☀' : '☾'}</span>
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>
        )}
      </div>
    </header>
  )
}
