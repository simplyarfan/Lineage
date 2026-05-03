'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Nav from '@/components/Nav'
import StatsBar from '@/components/StatsBar'
import FileViewer from '@/components/FileViewer'
import ProvenancePanel from '@/components/ProvenancePanel'

// D3 must be client-only (no SSR)
const Treemap = dynamic(() => import('@/components/Treemap'), { ssr: false })

export default function DemoPage() {
  const [riskLens, setRiskLens] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [provenanceLine, setProvenanceLine] = useState<number | null>(null)
  const [showProvenance, setShowProvenance] = useState(false)

  function handleFileClick(filePath: string, sessionId: string) {
    setSelectedFile(filePath)
    setSelectedSession(sessionId)
    setShowProvenance(false)
    setProvenanceLine(null)
  }

  function handleLineClick(lineNumber: number, sessionId: string) {
    setSelectedSession(sessionId)
    setProvenanceLine(lineNumber)
    setShowProvenance(true)
  }

  function handleCloseProvenance() {
    setShowProvenance(false)
    setProvenanceLine(null)
  }

  function handleBack() {
    setSelectedFile(null)
    setSelectedSession(null)
    setShowProvenance(false)
    setProvenanceLine(null)
  }

  return (
    <>
      <Nav />
      <div className="pt-14 h-screen flex flex-col bg-slate-50">
        {/* Stats bar */}
        <StatsBar riskLens={riskLens} onToggleRiskLens={() => setRiskLens(r => !r)} />

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Treemap OR back button + file viewer */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200">
            {selectedFile ? (
              <>
                {/* Back nav */}
                <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M8 1L3 6l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back to treemap
                  </button>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">
                    {riskLens
                      ? 'Risk Lens ON — red lines are high-risk AI code'
                      : 'Click a red line to see AI provenance'}
                  </span>
                </div>
                <FileViewer
                  filePath={selectedFile}
                  riskLens={riskLens}
                  onLineClick={handleLineClick}
                />
              </>
            ) : (
              <>
                {/* Treemap header */}
                <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-600">
                    Attribution Treemap — Lineage repo
                    <span className="ml-2 text-slate-400">· files sized by LOC, colored by AI%</span>
                  </div>
                  {riskLens && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Risk Lens active — showing unreviewed AI code in sensitive domains
                    </div>
                  )}
                </div>
                <Treemap riskLens={riskLens} onFileClick={handleFileClick} />
              </>
            )}
          </div>

          {/* Right: Provenance panel OR placeholder */}
          {showProvenance && selectedSession ? (
            <ProvenancePanel
              sessionId={selectedSession}
              filePath={selectedFile}
              lineNumber={provenanceLine}
              onClose={handleCloseProvenance}
            />
          ) : (
            <div className="w-72 bg-white border-l border-slate-200 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-slate-400">
                  <circle cx="9" cy="9" r="8.5" stroke="currentColor"/>
                  <path d="M9 5v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Provenance Panel</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedFile
                  ? 'Click any red (AI-attributed) line to see the full session provenance.'
                  : 'Click a file in the treemap, then click a red line to trace it back to its AI session.'}
              </p>
              {!selectedFile && (
                <div className="mt-6 space-y-2 w-full text-left">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick start</div>
                  {[
                    '1. Click any file in the treemap',
                    '2. Click a red line (AI-attributed)',
                    '3. See prompt, model, cost, risk',
                    '4. Toggle Risk Lens for audit view',
                  ].map(s => (
                    <div key={s} className="text-xs text-slate-500 flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">→</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom info bar */}
        <div className="border-t border-slate-200 bg-white px-6 py-2 flex items-center justify-between text-xs text-slate-400">
          <span>Demo data · Lineage repo · IBM Bob sessions 01–06 · watsonx.ai Granite-3-8b classification</span>
          <span>
            <span className="font-medium text-slate-500">EU AI Act Article 12</span> — traceable audit records for AI-generated code
          </span>
        </div>
      </div>
    </>
  )
}
