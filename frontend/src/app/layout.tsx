import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lineage — Git blame for AI-generated code',
  description:
    'Track, attribute, and audit AI-assisted development for EU AI Act compliance. Built with IBM Bob and watsonx.ai.',
  openGraph: {
    title: 'Lineage — Git blame for AI-generated code',
    description:
      'Every line of AI-generated code, traced back to its session. EU AI Act compliant audit trails, built on IBM Bob.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
