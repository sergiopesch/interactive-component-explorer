import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export const metadata: Metadata = {
  title: 'Electronics Explorer — Identify Components with AI',
  description:
    'Snap a photo of an electronic component and instantly learn what it is. AI-powered identification, interactive 3D models, specs, and voice descriptions for Arduino Student Kit parts.',
  keywords: [
    'electronics',
    'arduino',
    'components',
    'learning',
    'education',
    '3D',
    'AI',
    'computer vision',
    'CLIP',
    'text-to-speech',
  ],
  authors: [{ name: 'Electronics Explorer' }],
  openGraph: {
    title: 'Electronics Explorer',
    description:
      'Point your camera at an electronic component to learn about it. AI-powered identification with 3D models and voice guidance.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Electronics Explorer',
  },
  twitter: {
    card: 'summary',
    title: 'Electronics Explorer',
    description:
      'Point your camera at an electronic component to learn about it. AI-powered identification with 3D models and voice guidance.',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">{children}</body>
    </html>
  )
}
