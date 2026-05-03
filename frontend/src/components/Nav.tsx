'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const path = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
            {/* Git attribution tree icon */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="2" r="1.8" fill="white"/>
              <line x1="7" y1="3.8" x2="7" y2="6.5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="7" y1="6.5" x2="3" y2="9.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="7" y1="6.5" x2="11" y2="9.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="3" cy="11.5" r="1.8" fill="white"/>
              <circle cx="11" cy="11.5" r="1.8" fill="white"/>
            </svg>
          </div>
          <span className="font-semibold text-slate-900 text-sm tracking-tight">Lineage</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              path === '/'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>
          <Link
            href="/demo"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              path === '/demo' || path === '/demo/'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Demo
          </Link>
          <a
            href="https://github.com/simplyarfan/Lineage"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors border border-slate-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}
