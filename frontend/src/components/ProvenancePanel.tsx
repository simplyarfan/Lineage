'use client'
import { SESSIONS } from '@/lib/seed'

interface ProvenancePanelProps {
  sessionId: string | null
  filePath: string | null
  lineNumber: number | null
  onClose: () => void
}

const DOMAIN_COLORS: Record<string, string> = {
  auth: 'bg-red-100 text-red-700',
  payments: 'bg-red-100 text-red-700',
  data: 'bg-blue-100 text-blue-700',
  ui: 'bg-purple-100 text-purple-700',
  infra: 'bg-slate-100 text-slate-700',
  other: 'bg-stone-100 text-stone-700',
}

const RISK_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
}

export default function ProvenancePanel({ sessionId, filePath, lineNumber, onClose }: ProvenancePanelProps) {
  const session = SESSIONS.find(s => s.id === sessionId)

  if (!sessionId || !session) return null

  const formattedDate = new Date(session.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  return (
    <div className="provenance-panel w-80 border-l border-slate-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            AI Provenance
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close panel"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* File + line reference */}
      {filePath && lineNumber && (
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
          <p className="text-xs font-mono text-slate-500">
            {filePath}
            <span className="text-indigo-500 ml-1">:{lineNumber}</span>
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Session ID */}
        <div>
          <Label>Session ID</Label>
          <p className="text-xs font-mono text-slate-600 bg-slate-50 rounded px-2 py-1.5 border border-slate-100 break-all">
            {session.id}
          </p>
        </div>

        {/* Prompt */}
        <div>
          <Label>Prompt Summary</Label>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded px-3 py-2.5 border border-slate-100">
            {session.promptSummary}
          </p>
        </div>

        {/* Classification */}
        <div>
          <Label>Classification</Label>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DOMAIN_COLORS[session.domain] || ''}`}>
              {session.domain}
            </span>
            <span className={`px-2 py-0.5 rounded border text-xs font-medium ${RISK_COLORS[session.risk] || ''}`}>
              {session.risk} risk
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">{session.rationale}</p>
        </div>

        {/* Metadata grid */}
        <div>
          <Label>Session Metadata</Label>
          <div className="grid grid-cols-2 gap-2">
            <MetaCell label="Model" value={session.model.replace('ibm/', '')} />
            <MetaCell label="Tool" value={session.tool} />
            <MetaCell label="API Cost" value={`${session.apiCost} coins`} />
            <MetaCell label="Timestamp" value={formattedDate} full />
            <MetaCell label="Input Tokens" value={session.tokensInput.toLocaleString()} />
            <MetaCell label="Output Tokens" value={session.tokensOutput.toLocaleString()} />
          </div>
        </div>

        {/* Files modified */}
        <div>
          <Label>Files Modified</Label>
          <div className="space-y-1">
            {session.filesModified.map(f => (
              <p key={f} className="text-xs font-mono text-slate-500 bg-slate-50 rounded px-2 py-1 border border-slate-100 truncate" title={f}>
                {f}
              </p>
            ))}
          </div>
        </div>

        {/* Human oversight */}
        <div>
          <Label>Human Oversight</Label>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-600">Implicit review — no explicit approval recorded</span>
          </div>
        </div>
      </div>

      {/* EU AI Act badge */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5.5" stroke="currentColor"/>
            <path d="M6 3.5v3L8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span>EU AI Act Article 12 — traceable record</span>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{children}</p>
  )
}

function MetaCell({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`bg-slate-50 rounded px-2.5 py-2 border border-slate-100 ${full ? 'col-span-2' : ''}`}>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-xs font-medium text-slate-700 break-words">{value}</p>
    </div>
  )
}
