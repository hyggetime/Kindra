import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kindra · Toss',
  description: 'Kindra 미니앱(정적) 뼈대',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh bg-[#fdfbf9] text-[#2f2f2f] antialiased">{children}</body>
    </html>
  )
}
