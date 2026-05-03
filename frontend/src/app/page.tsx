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
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
                  EU AI ACT COMPLIANCE
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">August 2, 2026 deadline</span>
              </div>

              <h1 className="text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
                Git blame for{' '}
                <span className="text-indigo-600">AI-generated</span> code.
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl">
                Lineage ingests IBM Bob session exports and your git history to produce a complete
                attribution graph — every line tagged as human-authored, AI-authored, or unknown.
                One command away from EU AI Act Article 12 compliance.
              </p>

              <div className="flex items-center gap-3">
                <Link
                  href="/demo"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Live Demo
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

        {/* Tool logos */}
        <section className="bg-slate-50 border-y border-slate-200 py-5 px-6">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-slate-500 flex-wrap">
            <span className="font-medium text-slate-600">Built with</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
              IBM Bob
            </span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
              watsonx.ai
            </span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
              ibm/granite-3-8b-instruct
            </span>
            <span className="text-slate-300 mx-1">·</span>
            <span className="text-xs text-slate-400">
              IBM Bob Dev Day Hackathon — May 2-3, 2026
            </span>
          </div>
        </section>

        {/* Problem */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                The Problem
              </p>
              <h2 className="text-3xl font-bold text-slate-900">
                The hidden cost of untracked AI code
              </h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                AI coding tools accelerate development — but leave no paper trail. When regulators
                ask who wrote what, most teams have nothing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProblemCard
                icon="📂"
                title="No attribution"
                desc="git blame shows who committed, not whether an AI generated it. The human who pressed Commit isn't the author."
              />
              <ProblemCard
                icon="⏳"
                title="No session history"
                desc="Which model? Which prompt? How confident was it? What context did it have? Cursor, Copilot, Claude — all black boxes."
              />
              <ProblemCard
                icon="⚖️"
                title="Regulation arriving"
                desc="EU AI Act Article 12 requires traceable AI system logs for high-risk applications. August 2, 2026. Most teams will miss it."
              />
            </div>
          </div>
        </section>

        {/* Why Bob */}
        <section className="py-20 px-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">
                Why IBM Bob
              </p>
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

        {/* How it works */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">How it works</p>
              <h2 className="text-3xl font-bold text-slate-900">Four commands. Complete audit trail.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: '01', cmd: 'lineage scan', desc: 'Ingest Bob session .md exports and .meta.json sidecars into SQLite.' },
                { step: '02', cmd: 'lineage attribute', desc: 'Walk git history, match sessions to commits via heuristic scoring.' },
                { step: '03', cmd: 'lineage classify', desc: 'Call watsonx.ai Granite to score each session by domain and risk tier.' },
                { step: '04', cmd: 'lineage view', desc: 'Launch the treemap UI with file-level attribution and Risk Lens.' },
              ].map(({ step, cmd, desc }) => (
                <div key={step} className="border border-slate-200 rounded-xl p-5 bg-white">
                  <div className="text-xs font-bold text-slate-400 tracking-widest mb-3">{step}</div>
                  <div className="font-mono text-sm font-semibold text-indigo-600 mb-2 bg-indigo-50 rounded px-2 py-1 inline-block">{cmd}</div>
                  <p className="text-sm text-slate-600 mt-2">{desc}</p>
                </div>
              ))}
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
                emoji="🗺️"
                title="Attribution Treemap"
                desc="Every file in your repo, sized by lines of code, colored by % AI-authored. Green is human. Red is AI. Gray is unknown."
              />
              <FeatureCard
                emoji="🔍"
                title="Provenance Panel"
                desc="Click any AI-attributed line to see the exact prompt, model, cost, and classification that generated it."
              />
              <FeatureCard
                emoji="🚨"
                title="Risk Lens"
                desc="One toggle highlights high-risk AI code (auth, payments, data domains) that has never been re-reviewed by a human."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ready for August 2026.
            </h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto">
              The EU AI Act deadline is 3 months away. Most teams have no attribution records.
              Lineage closes the gap — one install, one scan, one report.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              See the Live Demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-6 px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-400 flex-wrap gap-3">
            <span>Lineage — IBM Bob Dev Day Hackathon 2026 · Syed Arfan Hussain</span>
            <div className="flex items-center gap-4">
              <span>Built with IBM Bob + watsonx.ai Granite</span>
              <a href="https://github.com/simplyarfan/Lineage" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}

function ProblemCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="border border-slate-200 rounded-xl p-6 bg-white">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  )
}

function FeatureCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="border border-slate-200 rounded-xl p-6 bg-white">
      <div className="text-2xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  )
}
