'use client'
import { getSampleLines } from '@/lib/seed'

interface FileViewerProps {
  filePath: string
  riskLens: boolean
  onLineClick: (lineNumber: number, sessionId: string) => void
}

export default function FileViewer({ filePath, riskLens, onLineClick }: FileViewerProps) {
  const lines = getSampleLines(filePath)

  if (lines.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        No attribution data for this file.
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-white">
      {/* File header */}
      <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-slate-400">
            <path d="M2 1h6l3 3v7H2V1z" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M8 1v3h3" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          <span className="text-xs font-mono text-slate-600">{filePath}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <LegendItem color="bg-green-400" label="Human" />
          <LegendItem color="bg-red-400" label="AI" />
          <LegendItem color="bg-slate-300" label="Unknown" />
        </div>
      </div>

      {/* Lines */}
      <div className="font-mono text-xs">
        {lines.map(({ line, content, type, sessionId, confidence }) => {
          const isAi = type === 'ai'
          const isHighRisk = isAi && riskLens
          const gutterColor =
            type === 'ai' ? 'bg-red-400' : type === 'human' ? 'bg-green-400' : 'bg-slate-200'

          return (
            <div
              key={line}
              className={`flex group border-b border-slate-50 transition-colors ${
                isHighRisk
                  ? 'bg-red-50 risk-highlight cursor-pointer'
                  : isAi
                  ? 'hover:bg-red-50 cursor-pointer'
                  : 'hover:bg-slate-50'
              }`}
              onClick={() => isAi && sessionId && onLineClick(line, sessionId)}
              title={isAi ? `Click to see provenance (confidence: ${((confidence ?? 0) * 100).toFixed(0)}%)` : undefined}
            >
              {/* Attribution gutter */}
              <div className={`w-1 flex-none ${gutterColor} ${isHighRisk ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />

              {/* Line number */}
              <div className="w-10 flex-none text-right pr-3 py-1.5 text-slate-300 select-none">
                {line}
              </div>

              {/* Content */}
              <div className={`flex-1 py-1.5 px-3 pr-4 overflow-hidden ${isHighRisk ? 'text-red-900' : 'text-slate-700'}`}>
                <span className="whitespace-pre">{content || ' '}</span>
              </div>

              {/* AI indicator */}
              {isAi && confidence !== undefined && (
                <div className="flex-none px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-red-400 font-medium">
                    {(confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          )
        })}

        {/* Truncation notice */}
        <div className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100 bg-slate-50">
          Showing {lines.length} representative lines · Click any red line to see AI provenance
        </div>
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-sm ${color}`} />
      <span className="text-slate-500">{label}</span>
    </div>
  )
}
