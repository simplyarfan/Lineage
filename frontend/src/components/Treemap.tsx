'use client'
import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { buildTreemapData } from '@/lib/seed'

interface TreemapNode {
  name: string
  path?: string
  value?: number
  aiPct?: number
  domain?: string
  risk?: string
  sessionId?: string
  humanTouchedAfterAi?: boolean
}

interface TreemapProps {
  riskLens: boolean
  onFileClick: (filePath: string, sessionId: string) => void
}

// Color: blend green→gray→red based on aiPct
function aiColor(aiPct: number, riskLens: boolean, isHighRisk: boolean): string {
  if (riskLens && isHighRisk) return '#dc2626'     // bright red for risk lens
  if (riskLens && !isHighRisk) return '#e2e8f0'    // muted gray for non-risk files

  if (aiPct < 0.3) return '#86efac'    // green-300
  if (aiPct < 0.5) return '#fde68a'    // amber-200
  if (aiPct < 0.7) return '#fca5a5'    // red-300
  return '#ef4444'                      // red-500
}

export default function Treemap({ riskLens, onFileClick }: TreemapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    const W = svg.clientWidth || 600
    const H = svg.clientHeight || 500

    d3.select(svg).selectAll('*').remove()

    const data = buildTreemapData()

    const root = d3
      .hierarchy<typeof data>(data as any)
      .sum((d: any) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    d3.treemap<typeof data>()
      .size([W, H])
      .paddingOuter(4)
      .paddingInner(2)
      .paddingTop(18)
      .round(true)(root as any)

    const g = d3.select(svg).append('g')

    // Group labels
    const groups = root.children ?? []
    groups.forEach((group: any) => {
      g.append('text')
        .attr('x', group.x0 + 5)
        .attr('y', group.y0 + 12)
        .attr('font-size', 9)
        .attr('font-family', 'Inter, system-ui, sans-serif')
        .attr('font-weight', '600')
        .attr('fill', '#94a3b8')
        .attr('text-transform', 'uppercase')
        .attr('letter-spacing', '0.05em')
        .text(group.data.name)
        .each(function (this: SVGTextElement) {
          const available = group.x1 - group.x0 - 10
          let text = group.data.name as string
          const el = this
          while (el.getComputedTextLength && el.getComputedTextLength() > available && text.length > 3) {
            text = text.slice(0, -1)
            d3.select(el).text(text + '…')
          }
        })
    })

    // File leaves
    const leaves = root.leaves() as any[]

    const cell = g
      .selectAll('g.leaf')
      .data(leaves)
      .join('g')
      .attr('class', 'leaf')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer')

    cell
      .append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('rx', 3)
      .attr('fill', (d: any) => {
        const node = d.data as TreemapNode
        const isHighRisk =
          ['auth', 'payments', 'data'].includes(node.domain ?? '') &&
          !node.humanTouchedAfterAi &&
          (node.aiPct ?? 0) > 0.8
        return aiColor(node.aiPct ?? 0, riskLens, isHighRisk)
      })
      .attr('stroke', 'rgba(255,255,255,0.4)')
      .attr('stroke-width', 1)

    // File name label
    cell
      .append('text')
      .attr('x', 4)
      .attr('y', 13)
      .attr('font-size', 9)
      .attr('font-family', 'JetBrains Mono, Menlo, monospace')
      .attr('fill', (d: any) => {
        const aiPct = (d.data as TreemapNode).aiPct ?? 0
        const isHighRisk = riskLens &&
          ['auth', 'payments', 'data'].includes((d.data as TreemapNode).domain ?? '') &&
          !(d.data as TreemapNode).humanTouchedAfterAi &&
          aiPct > 0.8
        return aiPct > 0.6 || isHighRisk ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.7)'
      })
      .text((d: any) => {
        const w = d.x1 - d.x0
        const name = (d.data as TreemapNode).name ?? ''
        if (w < 40) return ''
        if (w < 70) return name.slice(0, 5) + '…'
        return name
      })

    // AI% label
    cell
      .append('text')
      .attr('x', 4)
      .attr('y', 25)
      .attr('font-size', 9)
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('font-weight', '700')
      .attr('fill', (d: any) => {
        const aiPct = (d.data as TreemapNode).aiPct ?? 0
        return aiPct > 0.6 ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.5)'
      })
      .text((d: any) => {
        const w = d.x1 - d.x0
        const h = d.y1 - d.y0
        if (w < 40 || h < 28) return ''
        const aiPct = (d.data as TreemapNode).aiPct ?? 0
        return `${Math.round(aiPct * 100)}%`
      })

    // Tooltip + click
    cell
      .on('mousemove', (event: MouseEvent, d: any) => {
        const node = d.data as TreemapNode
        if (!tooltipRef.current) return
        const isHighRisk =
          ['auth', 'payments', 'data'].includes(node.domain ?? '') &&
          !node.humanTouchedAfterAi &&
          (node.aiPct ?? 0) > 0.8
        tooltipRef.current.innerHTML = `
          <div class="font-semibold mb-1">${node.path}</div>
          <div>${node.value} lines &nbsp;·&nbsp; ${Math.round((node.aiPct ?? 0) * 100)}% AI</div>
          <div style="color:#94a3b8;margin-top:2px">domain: ${node.domain} &nbsp;·&nbsp; risk: ${node.risk}</div>
          ${isHighRisk ? '<div style="color:#ef4444;margin-top:4px;font-weight:600">⚠ HIGH RISK — never re-reviewed</div>' : ''}
        `
        tooltipRef.current.style.display = 'block'
        tooltipRef.current.style.left = event.clientX + 12 + 'px'
        tooltipRef.current.style.top = event.clientY - 8 + 'px'
      })
      .on('mouseleave', () => {
        if (tooltipRef.current) tooltipRef.current.style.display = 'none'
      })
      .on('click', (_: MouseEvent, d: any) => {
        const node = d.data as TreemapNode
        if (node.path && node.sessionId) {
          onFileClick(node.path, node.sessionId)
        }
      })
  }, [riskLens, onFileClick])

  useEffect(() => {
    // Create tooltip once
    if (!tooltipRef.current) {
      const el = document.createElement('div')
      el.className = 'lineage-tooltip'
      el.style.display = 'none'
      document.body.appendChild(el)
      tooltipRef.current = el
    }

    render()

    const ro = new ResizeObserver(render)
    if (svgRef.current) ro.observe(svgRef.current)

    return () => {
      ro.disconnect()
      tooltipRef.current?.remove()
      tooltipRef.current = null
    }
  }, [render])

  return (
    <div className="relative flex-1 bg-white overflow-hidden">
      {/* Legend */}
      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 px-3 py-2 flex items-center gap-3">
        <span className="text-xs text-slate-500 font-medium">AI%</span>
        <div className="flex items-center gap-1">
          {[
            { color: '#86efac', label: '<30%' },
            { color: '#fde68a', label: '50%' },
            { color: '#fca5a5', label: '70%' },
            { color: '#ef4444', label: '90%+' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
              <span className="text-[10px] text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <svg ref={svgRef} width="100%" height="100%" className="block" />

      {/* Click hint */}
      <div className="absolute bottom-3 left-3 text-[11px] text-slate-400 bg-white/80 backdrop-blur-sm rounded px-2 py-1 border border-slate-100">
        Click any file to view line-level attribution
      </div>
    </div>
  )
}
