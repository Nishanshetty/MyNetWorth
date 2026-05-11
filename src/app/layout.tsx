import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyNetWorth — Personal Financial Statement',
  description:
    'Build your personal balance sheet, income statement, and cash flow statement. Track your net worth, savings rate, and financial health — no signup required.',
  metadataBase: new URL('https://mynetworth.nishan-shetty.com'),
  openGraph: {
    title: 'MyNetWorth',
    description: 'Your personal financial statement — free, private, no signup.',
    siteName: 'MyNetWorth',
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
