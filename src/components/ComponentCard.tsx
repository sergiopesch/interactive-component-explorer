'use client'

import { memo, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { ElectronicsComponent } from '@/data/components'
import { useSpeech } from '@/hooks/useSpeech'

const ComponentViewer = dynamic(() => import('./ComponentViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 flex items-center justify-center text-black/30 dark:text-white/30">
      Loading 3D model...
    </div>
  ),
})

interface ComponentCardProps {
  component: ElectronicsComponent
  defer3D?: boolean
}

function ComponentCard({ component, defer3D = false }: ComponentCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const [powered, setPowered] = useState(false)
  const [isViewerEnabled, setIsViewerEnabled] = useState(!defer3D)
  const { speak, stop, isSpeaking } = useSpeech()

  useEffect(() => {
    if (!defer3D) {
      setIsViewerEnabled(true)
    }
  }, [defer3D])

  useEffect(() => {
    if (!defer3D || isViewerEnabled) {
      return
    }

    const card = cardRef.current
    if (!card) {
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsViewerEnabled(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsViewerEnabled(true)
          observer.disconnect()
        }
      },
      { rootMargin: '240px' }
    )

    observer.observe(card)
    return () => observer.disconnect()
  }, [defer3D, isViewerEnabled])

  const handleVoice = () => {
    if (isSpeaking) {
      stop()
    } else {
      speak(component.voiceDescription)
    }
  }

  return (
    <article
      ref={cardRef}
      className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-black transition-colors"
    >
      {/* 3D Viewer */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-black/5 dark:border-white/5 relative">
        {isViewerEnabled ? (
          <ComponentViewer componentId={component.id} powered={powered} />
        ) : (
          <button
            type="button"
            onClick={() => setIsViewerEnabled(true)}
            className="w-full h-64 flex items-center justify-center text-sm font-medium text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label={`Load 3D preview for ${component.name}`}
          >
            Load 3D preview
          </button>
        )}
        {isViewerEnabled && (
          <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-black/30 dark:text-white/30">
            Click and drag to rotate
          </p>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Title and controls */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">
              {component.name}
            </h2>
            <span className="inline-block mt-1 text-xs font-medium uppercase tracking-wider text-black/40 dark:text-white/40 border border-black/10 dark:border-white/10 px-2 py-0.5 rounded">
              {component.category}
            </span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {/* Voice button */}
            <button
              onClick={handleVoice}
              className={`p-2.5 rounded-lg border transition-colors ${
                isSpeaking
                  ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                  : 'border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              aria-label={isSpeaking ? 'Stop voice description' : 'Play voice description'}
              title={isSpeaking ? 'Stop' : 'Listen'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isSpeaking ? (
                  <>
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </>
                ) : (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </>
                )}
              </svg>
            </button>

            {/* Power toggle (only for active components) */}
            {component.hasActiveState && (
              <button
                onClick={() => setPowered(!powered)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  powered
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                    : 'border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                aria-label={powered ? 'Turn off' : 'Turn on'}
              >
                {powered ? 'ON' : 'OFF'}
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          {component.description}
        </p>

        {/* Specs */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2">
            Specifications
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            {component.specs.map((spec) => (
              <div key={spec.label}>
                <dt className="text-xs text-black/40 dark:text-white/40">{spec.label}</dt>
                <dd className="text-sm font-medium text-black dark:text-white">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Circuit Example */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2">
            Circuit Example
          </h3>
          <p className="text-sm leading-relaxed text-black/60 dark:text-white/60 bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3 border border-black/5 dark:border-white/5">
            {component.circuitExample}
          </p>
        </div>
      </div>
    </article>
  )
}

export default memo(ComponentCard)
