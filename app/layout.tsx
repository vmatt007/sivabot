import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SivaBot — Algorithmic Trading Platform',
  description: 'Automate your options trading with battle-tested algorithms.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#080c0a] text-[#d4e8dc] antialiased" style={{fontFamily:"'DM Sans', sans-serif", fontWeight:300}}>
        {children}
      </body>
    </html>
  )
}
