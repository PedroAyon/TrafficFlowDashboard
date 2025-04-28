import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Traffic Dashboard',
  description: 'Traffic Detection System Dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
