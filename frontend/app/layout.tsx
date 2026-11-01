import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Chronos-Hima: Cryosphere Disaster Engine',
  description: 'Real-time Himalayan Flash Flood & Climate Adaptation Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
