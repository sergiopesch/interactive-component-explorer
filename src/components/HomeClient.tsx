'use client'

import { useState, useCallback } from 'react'
import Header from '@/components/Header'
import ComponentCard from '@/components/ComponentCard'
import ImageUpload from '@/components/ImageUpload'
import { electronicsComponents, type ElectronicsComponent } from '@/data/components'
import { useTheme } from '@/hooks/useTheme'
import { useComponentIdentifier } from '@/hooks/useComponentIdentifier'

type AppView = 'home' | 'analyzing' | 'result'

export default function HomeClient() {
  const { isDark, toggle, mounted } = useTheme()
  const { identify, isAnalyzing, error, clearError } = useComponentIdentifier()

  const [view, setView] = useState<AppView>('home')
  const [identifiedComponent, setIdentifiedComponent] =
    useState<ElectronicsComponent | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [showBrowse, setShowBrowse] = useState(false)

  const handleImageSelected = useCallback(
    async (base64: string) => {
      setView('analyzing')
      clearError()

      const result = await identify(base64)

      if (result) {
        setIdentifiedComponent(result.component)
        setConfidence(result.confidence)
        setView('result')
      } else {
        // Show error on home view, allow retry
        setView('home')
      }
    },
    [identify, clearError]
  )

  const handleTryAnother = useCallback(() => {
    setView('home')
    setIdentifiedComponent(null)
    setConfidence(0)
    clearError()
  }, [clearError])

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <Header isDark={isDark} onToggleTheme={toggle} mounted={mounted} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Home / Upload View */}
        {(view === 'home' || view === 'analyzing') && (
          <section className="max-w-2xl mx-auto text-center mb-12">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-3">
                What component do you have?
              </h2>
              <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">
                Snap a photo or upload an image of your electronic component and
                we&apos;ll tell you exactly what it is, how it works, and how to
                use it!
              </p>
            </div>

            <ImageUpload
              onImageSelected={handleImageSelected}
              isAnalyzing={isAnalyzing}
            />

            {/* Error display */}
            {error && (
              <div className="mt-6 p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-left">
                <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
                  {error}
                </p>
                <button
                  onClick={handleTryAnother}
                  className="mt-3 px-4 py-2 rounded-lg border border-black/20 dark:border-white/20 text-sm font-medium text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Browse all link */}
            <div className="mt-10">
              <button
                onClick={() => setShowBrowse(!showBrowse)}
                className="text-sm font-medium text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors underline underline-offset-4"
              >
                {showBrowse
                  ? 'Hide component library'
                  : `Or browse all ${electronicsComponents.length} components`}
              </button>
            </div>
          </section>
        )}

        {/* Result View */}
        {view === 'result' && identifiedComponent && (
          <section className="max-w-2xl mx-auto mb-12">
            {/* Match header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 mb-3">
                <span className="text-xs font-medium text-black/60 dark:text-white/60">
                  {confidence}% match
                </span>
              </div>
              <h2 className="text-2xl font-bold text-black dark:text-white">
                It&apos;s a {identifiedComponent.name}!
              </h2>
            </div>

            {/* Component card */}
            <ComponentCard component={identifiedComponent} />

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleTryAnother}
                className="px-6 py-2.5 rounded-lg border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Identify Another Component
              </button>
              <button
                onClick={() => {
                  setShowBrowse(true)
                  setView('home')
                }}
                className="px-5 py-2.5 rounded-lg border border-black/20 dark:border-white/20 text-black dark:text-white text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Browse All Components
              </button>
            </div>
          </section>
        )}

        {/* Browse All Components Grid */}
        {showBrowse && (
          <section className="mt-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-black dark:text-white">
                All Components
              </h3>
              <button
                onClick={() => setShowBrowse(false)}
                className="text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {electronicsComponents.map((component) => (
                <ComponentCard key={component.id} component={component} />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-black/10 dark:border-white/10 text-center">
          <p className="text-sm text-black/40 dark:text-white/40">
            Electronics Explorer — AI-powered learning for Arduino and basic
            circuits.
          </p>
        </footer>
      </main>
    </div>
  )
}
