import type { Metadata } from 'next'
import './globals.css'

const BASE_URL = 'https://mynetworth.nishan-shetty.com'

export const metadata: Metadata = {
  title: 'MyNetWorth — Personal Financial Statement',
  description:
    'Build your personal balance sheet, income statement, and cash flow statement. Track your net worth, savings rate, and financial health — no signup required.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: 'MyNetWorth — Personal Financial Statement',
    description: 'Build your balance sheet, income statement and cash flow in minutes. Free, private, no signup — data stays in your browser.',
    siteName: 'MyNetWorth',
    url: BASE_URL,
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MyNetWorth app showing net worth dashboard and balance sheet',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyNetWorth — Personal Financial Statement',
    description: 'Build your balance sheet, income statement and cash flow in minutes. Free, private, no signup.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head />
      <body className="min-h-full">{children}</body>
    </html>
  )
}
