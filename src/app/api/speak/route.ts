import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      code: 'LOCAL_TTS_ONLY',
      error:
        'Speech playback now runs in-browser via the Web Speech API. This endpoint is deprecated.',
    },
    { status: 410 }
  )
}
