import fs from 'fs'

/**
 * Convert Float32Array PCM samples to a WAV file buffer.
 * Ported from the web app's useLocalTTS.ts float32ToWavBlob.
 */
export function float32ToWavBuffer(
  samples: Float32Array,
  sampleRate: number
): Buffer {
  const numChannels = 1
  const bitsPerSample = 16
  const bytesPerSample = bitsPerSample / 8
  const blockAlign = numChannels * bytesPerSample
  const dataLength = samples.length * bytesPerSample
  const headerLength = 44
  const buffer = Buffer.alloc(headerLength + dataLength)

  // RIFF header
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataLength, 4)
  buffer.write('WAVE', 8)

  // fmt chunk
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // chunk size
  buffer.writeUInt16LE(1, 20) // PCM format
  buffer.writeUInt16LE(numChannels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * blockAlign, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(bitsPerSample, 34)

  // data chunk
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataLength, 40)

  // Write PCM samples (clamp float32 -> int16)
  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]))
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff
    buffer.writeInt16LE(Math.round(int16), offset)
    offset += 2
  }

  return buffer
}

export function saveWav(
  filePath: string,
  samples: Float32Array,
  sampleRate: number
): void {
  const buffer = float32ToWavBuffer(samples, sampleRate)
  fs.writeFileSync(filePath, buffer)
}
