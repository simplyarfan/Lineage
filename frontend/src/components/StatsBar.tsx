'use client'
import { STATS } from '@/lib/seed'

interface StatsBarProps {
  riskLens: boolean
  onToggleRiskLens: () => void
}

export default function StatsBar({ riskLens, onToggleRiskLens }: StatsBarProps) {
  const aiPct = Math.round((STATS.aiLines / STATS.totalLines) * 100)

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
      {/* Stats */}
      <div className="flex items-center gap-6">
        <Stat
          label="Sessions"
          value={STATS.totalSessions.toString()}
          sub="IBM Bob"
          color="text-indigo-600"
        />
        <Divider />
        <Stat
          label="AI Spend"
          value={`${STATS.cumulativeSpend.toFixed(2)}`}
          sub="Bobcoins"
          color="text-slate-900"
        />
        <Divider />
        <Stat
          label="AI-Authored"
          value={`${aiPct}%`}
          sub={`${STATS.aiLines.toLocaleString()} lines`}
          color="text-red-500"
        />
        <Divider />
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Risk</span>
          <div className="flex items-center gap-2">
            <Badge count={STATS.riskBreakdown.high} label="high" color="bg-red-100 text-red-700" />
            <Badge count={STATS.riskBreakdown.medium} label="medium" color="bg-amber-100 text-amber-700" />
            <Badge count={STATS.riskBreakdown.low} label="low" color="bg-green-100 text-green-700" />
          </div>
        </div>
      </div>

      {/* Risk Lens toggle */}
      <button
        onClick={onToggleRiskLens}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
          riskLens
            ? 'bg-red-600 text-white border-red-600 shadow-sm shadow-red-200'
            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3" fill="currentColor"/>
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Risk Lens
        {riskLens && <span className="ml-1 text-xs opacity-75">ON</span>}
      </button>
    </div>
  )
}

function Stat({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className={`text-lg font-bold leading-none ${color}`}>{value}</span>
        <span className="text-xs text-slate-400">{sub}</span>
      </div>
    </div>
  )
}

function Divider() {
  return <div className="w-px h-8 bg-slate-200" />
}

function Badge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <span className="font-bold">{count}</span>
      <span>{label}</span>
    </span>
  )
}
