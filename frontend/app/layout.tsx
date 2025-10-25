import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hey Verne! - AI Storytelling for Kids',
  description: 'Voice-driven interactive storytelling that turns learning into an adventure',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

