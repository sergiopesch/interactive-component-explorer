import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      code: 'LOCAL_CLASSIFIER_ONLY',
      error:
        'Component identification now runs fully in-browser using a local transformer model. Please use the app UI flow.',
    },
    { status: 410 }
  )
}
