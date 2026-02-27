import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Electronics Explorer',
  description:
    'An interactive 3D explorer for learning about common electronics components like resistors, LEDs, buttons, and speakers.',
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
