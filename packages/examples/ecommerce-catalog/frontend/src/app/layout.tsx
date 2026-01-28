import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'E-commerce Catalog - AI1st Demo',
  description: 'Production-ready e-commerce platform showcasing AI1st orchestration',
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
