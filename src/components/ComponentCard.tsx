'use client'

import { memo, useRef, useState } from 'react'
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
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { speak, stop, isSpeaking } = useSpeech()

  const handleVoice = () => {
    if (isSpeaking) {
      stop()
    } else {
      speak(component.voiceDescription)
    }
  }

  const datasheet = component.datasheetInfo

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
            className="w-full h-64 flex flex-col items-center justify-center gap-2 text-sm font-medium text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label={`Load 3D preview for ${component.name}`}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
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

        {/* Advanced / Datasheet Mode */}
        {datasheet && (
          <div className="border-t border-black/10 dark:border-white/10 pt-4 -mx-6 px-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors group"
            >
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                {showAdvanced ? 'Hide Datasheet Details' : 'Datasheet Details'}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-5 animate-in">
                {/* Absolute Maximum Ratings */}
                {datasheet.maxRatings.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2">
                      Absolute Maximum Ratings
                    </h4>
                    <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-black/5 dark:border-white/5">
                            <th className="text-left px-3 py-2 text-xs font-medium text-black/50 dark:text-white/50">Parameter</th>
                            <th className="text-right px-3 py-2 text-xs font-medium text-black/50 dark:text-white/50">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {datasheet.maxRatings.map((rating, i) => (
                            <tr key={rating.parameter} className={i > 0 ? 'border-t border-black/5 dark:border-white/5' : ''}>
                              <td className="px-3 py-2 text-black/70 dark:text-white/70">{rating.parameter}</td>
                              <td className="px-3 py-2 text-right font-mono text-black dark:text-white">{rating.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pin Configuration */}
                {datasheet.pinout && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2">
                      Pin Configuration
                    </h4>
                    <p className="text-sm leading-relaxed text-black/70 dark:text-white/70 bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3 border border-black/5 dark:border-white/5 font-mono">
                      {datasheet.pinout}
                    </p>
                  </div>
                )}

                {/* Key Electrical Characteristics */}
                {datasheet.characteristics.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2">
                      Key Electrical Characteristics
                    </h4>
                    <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-black/5 dark:border-white/5">
                            <th className="text-left px-3 py-2 text-xs font-medium text-black/50 dark:text-white/50">Parameter</th>
                            <th className="text-center px-2 py-2 text-xs font-medium text-black/50 dark:text-white/50">Min</th>
                            <th className="text-center px-2 py-2 text-xs font-medium text-black/50 dark:text-white/50">Typ</th>
                            <th className="text-center px-2 py-2 text-xs font-medium text-black/50 dark:text-white/50">Max</th>
                            <th className="text-center px-2 py-2 text-xs font-medium text-black/50 dark:text-white/50">Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {datasheet.characteristics.map((char, i) => (
                            <tr key={char.parameter} className={i > 0 ? 'border-t border-black/5 dark:border-white/5' : ''}>
                              <td className="px-3 py-2 text-black/70 dark:text-white/70">{char.parameter}</td>
                              <td className="px-2 py-2 text-center font-mono text-black/60 dark:text-white/60">{char.min || '-'}</td>
                              <td className="px-2 py-2 text-center font-mono text-black dark:text-white">{char.typical || '-'}</td>
                              <td className="px-2 py-2 text-center font-mono text-black/60 dark:text-white/60">{char.max || '-'}</td>
                              <td className="px-2 py-2 text-center font-mono text-xs text-black/50 dark:text-white/50">{char.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Common Part Numbers */}
                {datasheet.partNumbers.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2">
                      Common Part Numbers
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {datasheet.partNumbers.map((pn) => (
                        <span
                          key={pn}
                          className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-black/5 dark:border-white/5 text-xs font-mono text-black/80 dark:text-white/80"
                        >
                          {pn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pro Tips */}
                {datasheet.tips && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2">
                      Pro Tips
                    </h4>
                    <p className="text-sm leading-relaxed text-black/70 dark:text-white/70 bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3 border border-black/5 dark:border-white/5">
                      {datasheet.tips}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default memo(ComponentCard)
