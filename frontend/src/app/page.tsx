import Link from 'next/link'
import Nav from '@/components/Nav'

export default function Home() {
  return (
    <>
      <Nav />
      <main className="pt-14">

        {/* Hero */}
        <section className="bg-white px-6 pt-20 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-start max-w-3xl">
              <div className="mb-5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-widest">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                    <circle cx="5" cy="5" r="4"/>
                  </svg>
                  AI Code Attribution
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">IBM Bob Dev Day Hackathon 2026</span>
              </div>

              <h1 className="text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
                Git blame for{' '}
                <span className="text-indigo-600">AI-generated</span> code.
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl">
                Lineage ingests IBM Bob session exports and your git history to produce a complete
                attribution graph — every line tagged as human-authored, AI-authored, or unknown,
                with full provenance back to the prompt and session that generated it.
              </p>

              <div className="flex items-center gap-3">
                <Link
                  href="/demo"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  View Demo
                </Link>
                <a
                  href="https://github.com/simplyarfan/Lineage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Built with */}
        <section className="bg-slate-50 border-y border-slate-200 py-5 px-6">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-slate-500 flex-wrap">
            <span className="font-medium text-slate-600">Built with</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700">IBM Bob</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700">watsonx.ai</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700">ibm/granite-3-8b-instruct</span>
            <span className="text-slate-300 mx-1">·</span>
            <span className="text-xs text-slate-400">IBM Bob Dev Day Hackathon — May 2–3, 2026</span>
          </div>
        </section>

        {/* How it works — flow diagram */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">How Lineage works</p>
              <h2 className="text-3xl font-bold text-slate-900">From session export to audit trail.</h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                One pipeline. Bob writes the code, Lineage tracks it, Granite classifies it.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-0">
              {/* Step 1: IBM Bob */}
              <FlowStep
                icon={
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="7" fill="#0f62fe"/>
                    <text x="14" y="20" textAnchor="middle" fill="white" fontSize="14" fontWeight="800" fontFamily="Inter, system-ui">B</text>
                  </svg>
                }
                label="IBM Bob"
                desc="Session exports"
                highlight
              />
              <FlowArrow />
              {/* Step 2: lineage scan + attribute */}
              <FlowStep
                icon={
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="7" fill="#0f172a"/>
                    <circle cx="14" cy="7" r="3" fill="white"/>
                    <line x1="14" y1="10" x2="14" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="14" y1="14" x2="8" y2="18" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="14" y1="14" x2="20" y2="18" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="8" cy="21" r="2.5" fill="white"/>
                    <circle cx="20" cy="21" r="2.5" fill="white"/>
                  </svg>
                }
                label="Lineage"
                desc="scan + attribute"
                highlight
              />
              <FlowArrow />
              {/* Step 3: watsonx.ai Granite */}
              <FlowStep
                icon={
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="7" fill="#1d4ed8"/>
                    <rect x="5" y="9" width="18" height="10" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
                    <rect x="8" y="12" width="4" height="4" rx="1" fill="white"/>
                    <rect x="16" y="12" width="4" height="4" rx="1" fill="white" opacity="0.5"/>
                    <line x1="14" y1="7" x2="14" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                }
                label="IBM Granite"
                desc="domain + risk classification"
              />
              <FlowArrow />
              {/* Step 4: Dashboard */}
              <FlowStep
                icon={
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="7" fill="#4f46e5"/>
                    <rect x="5" y="5" width="8" height="8" rx="1.5" fill="white" opacity="0.9"/>
                    <rect x="15" y="5" width="8" height="5" rx="1.5" fill="white" opacity="0.6"/>
                    <rect x="15" y="12" width="8" height="11" rx="1.5" fill="white" opacity="0.8"/>
                    <rect x="5" y="15" width="8" height="8" rx="1.5" fill="white" opacity="0.5"/>
                  </svg>
                }
                label="Dashboard"
                desc="treemap + provenance"
              />
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="py-20 px-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">The Problem</p>
              <h2 className="text-3xl font-bold text-slate-900">The hidden cost of untracked AI code</h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                AI coding tools accelerate development — but leave no paper trail. When stakeholders
                ask who wrote what, most teams have nothing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProblemCard
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 6v4M10 14h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                }
                title="No attribution"
                desc="git blame shows who committed, not whether an AI generated it. The human who pressed Commit isn't the author."
              />
              <ProblemCard
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 5v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                title="No session history"
                desc="Which model? Which prompt? What context? Cursor, Copilot, Claude — all black boxes with no exportable records."
              />
              <ProblemCard
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L2 7v6c0 3.3 3.4 6.4 8 7.4 4.6-1 8-4.1 8-7.4V7L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                title="Accountability gap"
                desc="Globally, standards for AI-generated code are being set — from enterprise policies to emerging regulation. Most teams aren't ready."
              />
            </div>
          </div>
        </section>

        {/* Why Bob */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Why IBM Bob</p>
              <h2 className="text-3xl font-bold text-slate-900 mb-5">
                Bob is the only tool that ships with structured session exports.
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Cursor, GitHub Copilot, and Claude Code are black boxes — there&apos;s no API to retrieve
                what they generated, when, or why. IBM Bob ships exportable session reports built into
                the product: task ID, model, cost, tokens, timestamp, prompt, files modified.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Lineage exists <strong className="text-slate-900">because Bob exists</strong>. Bob is
                the reference standard for how AI coding tools should be built — auditable, traceable,
                defensible. We take those exports and make them queryable.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-slate-900">Three views. One audit trail.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="2" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="11" y="2" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="11" y="9" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="2" y="13" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                }
                title="Attribution Treemap"
                desc="Every file in your repo, sized by lines of code, colored by AI authorship. Green is human. Red is AI. Gray is unknown."
              />
              <FeatureCard
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M13.5 13.5l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                }
                title="Provenance Panel"
                desc="Click any AI-attributed line to see the exact prompt, model, cost, and classification that generated it."
              />
              <FeatureCard
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="10" cy="10" r="1" fill="currentColor"/>
                  </svg>
                }
                title="Risk Lens"
                desc="One toggle highlights high-risk AI code in sensitive domains that has never been re-reviewed by a human."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Know what your AI wrote.
            </h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto">
              AI-generated code is the new norm. The teams that track it will be the ones who can
              defend it. Lineage makes attribution automatic — one install, one scan, complete provenance.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              View Demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-6 px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-400 flex-wrap gap-3">
            <span>Lineage — IBM Bob Dev Day Hackathon 2026 · Syed Arfan</span>
            <div className="flex items-center gap-4">
              <span>Built with IBM Bob + watsonx.ai Granite</span>
              <a href="https://github.com/simplyarfan/Lineage" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">GitHub</a>
              <a href="https://www.linkedin.com/in/syedarfan" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">LinkedIn</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}

function FlowStep({ icon, label, desc, highlight }: {
  icon: React.ReactNode
  label: string
  desc: string
  highlight?: boolean
}) {
  return (
    <div className={`flex flex-col items-center gap-3 w-44 ${highlight ? '' : 'opacity-90'}`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border ${
        highlight ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'
      }`}>
        {icon}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center w-10 flex-shrink-0 -mt-6">
      <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
        <path d="M2 8h22M20 4l6 4-6 4" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function ProblemCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="border border-slate-200 rounded-xl p-6 bg-white">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="border border-slate-200 rounded-xl p-6 bg-white">
      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  )
}
