'use client'

import Header from '@/components/Header'
import ComponentCard from '@/components/ComponentCard'
import { electronicsComponents } from '@/data/components'
import { useTheme } from '@/hooks/useTheme'

export default function HomeClient() {
  const { isDark, toggle, mounted } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <Header isDark={isDark} onToggleTheme={toggle} mounted={mounted} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Intro section */}
        <section className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-3">
            Learn Electronics
          </h2>
          <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">
            Explore common components found in the Arduino Student Kit. Rotate
            the 3D models, toggle power states, and listen to voice descriptions
            to understand how each component works.
          </p>
        </section>

        {/* Component grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {electronicsComponents.map((component) => (
            <ComponentCard key={component.id} component={component} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-black/10 dark:border-white/10 text-center">
          <p className="text-sm text-black/40 dark:text-white/40">
            Electronics Explorer — Built for beginners learning Arduino and basic circuits.
          </p>
        </footer>
      </main>
    </div>
  )
}
