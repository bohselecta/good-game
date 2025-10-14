import type { Metadata } from 'next'
import './globals.css'
import '../../styles/tokens.css'
import '../../styles/global.css'

export const metadata: Metadata = {
  title: 'GoodGame?',
  description: 'Discover if recorded games are worth watching without spoiling the outcome',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
