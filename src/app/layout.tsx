import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  description: 'Compare extreme heat and illustrative carbon cost pressure across nine Nimbus Cement plants.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en-IN"><body>{children}</body></html>
}
