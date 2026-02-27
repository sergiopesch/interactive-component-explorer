'use client'

import { useState, useRef, useCallback } from 'react'

interface ImageUploadProps {
  onImageSelected: (base64: string) => void
  isAnalyzing: boolean
}

const MAX_IMAGE_DIMENSION = 1024
const MAX_UPLOAD_BYTES = 1_800_000
const JPEG_QUALITIES = [0.92, 0.86, 0.8, 0.74]

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = dataUrl
  })
}

function estimateBytesFromDataUrl(dataUrl: string) {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
  return Math.floor((base64.length * 3) / 4)
}

async function optimizeImageForUpload(file: File): Promise<string> {
  const sourceDataUrl = await fileToDataUrl(file)
  const image = await loadImage(sourceDataUrl)

  const maxSide = Math.max(image.width, image.height)
  const resizeScale = maxSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / maxSide : 1
  const baseWidth = Math.max(1, Math.round(image.width * resizeScale))
  const baseHeight = Math.max(1, Math.round(image.height * resizeScale))

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  let bestCandidate = sourceDataUrl
  let scale = 1

  for (let pass = 0; pass < 3; pass += 1) {
    canvas.width = Math.max(1, Math.round(baseWidth * scale))
    canvas.height = Math.max(1, Math.round(baseHeight * scale))
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    for (const quality of JPEG_QUALITIES) {
      const candidate = canvas.toDataURL('image/jpeg', quality)
      bestCandidate = candidate
      if (estimateBytesFromDataUrl(candidate) <= MAX_UPLOAD_BYTES) {
        return candidate
      }
    }

    scale *= 0.8
  }

  return bestCandidate
}

export default function ImageUpload({
  onImageSelected,
  isAnalyzing,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    async (file: File) => {
      setError(null)

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, or WebP).')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Image is too large. Please use an image under 10MB.')
        return
      }

      try {
        const resized = await optimizeImageForUpload(file)
        setPreview(resized)
      } catch {
        setError(
          'Could not process this image format. Try JPG or PNG from your photo library.'
        )
      }
    },
    []
  )

  const handleSubmit = useCallback(() => {
    if (preview) {
      onImageSelected(preview)
    }
  }, [preview, onImageSelected])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const clearPreview = useCallback(() => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }, [])

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {!preview ? (
        <>
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                : 'border-black/20 dark:border-white/20'
            }`}
          >
            {/* Camera icon */}
            <div className="mb-4 flex justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-black/40 dark:text-white/40"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>

            <p className="text-sm text-black/50 dark:text-white/50 mb-4">
              Drag and drop an image here
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* Camera capture (mobile) */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="px-5 py-2.5 rounded-lg border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Take a Photo
              </button>

              {/* File upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-lg border border-black/20 dark:border-white/20 text-black dark:text-white text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Upload Image
              </button>
            </div>
          </div>

          {/* Hidden inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      ) : (
        <>
          {/* Image preview */}
          <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Component to identify"
              className="w-full h-64 object-contain bg-neutral-50 dark:bg-neutral-900"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-white dark:bg-black rounded-lg px-4 py-2 text-sm font-medium">
                  Analyzing...
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleSubmit}
              disabled={isAnalyzing}
              className="px-6 py-2.5 rounded-lg border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'Identify Component'}
            </button>
            <button
              onClick={clearPreview}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-lg border border-black/20 dark:border-white/20 text-black dark:text-white text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-center text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
