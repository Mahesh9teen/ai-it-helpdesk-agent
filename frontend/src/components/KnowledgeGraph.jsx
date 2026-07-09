import { useState, useEffect, useRef, useCallback } from 'react'
import {
  FiShare2, FiSearch, FiZoomIn, FiZoomOut, FiRefreshCw,
  FiInfo, FiLink, FiBook, FiX, FiFilter, FiMaximize2
} from 'react-icons/fi'

/* ─── Knowledge Graph Data ─── */
const CATEGORIES = {
  Account:  { color: '#6366f1', bg: '#ede9fe' },
  Network:  { color: '#06b6d4', bg: '#cffafe' },
  Hardware: { color: '#f59e0b', bg: '#fef3c7' },
  Software: { color: '#10b981', bg: '#d1fae5' },
  Security: { color: '#ef4444', bg: '#fee2e2' },
  Email:    { color: '#8b5cf6', bg: '#f3e8ff' },
  General:  { color: '#64748b', bg: '#f1f5f9' },
}

const ARTICLES = [
  { id: 'A1',  title: 'Password Reset Guide',         category: 'Account',  views: 1420, helpful: 98 },
  { id: 'A2',  title: 'Account Lockout Resolution',   category: 'Account',  views: 980,  helpful: 95 },
  { id: 'A3',  title: 'MFA Setup & Troubleshoot',     category: 'Security', views: 845,  helpful: 94 },
  { id: 'A4',  title: 'VPN Connection Guide',         category: 'Network',  views: 720,  helpful: 97 },
  { id: 'A5',  title: 'WiFi Connectivity Fix',        category: 'Network',  views: 650,  helpful: 92 },
  { id: 'A6',  title: 'DNS Troubleshooting',          category: 'Network',  views: 430,  helpful: 88 },
  { id: 'A7',  title: 'Laptop Performance Guide',     category: 'Hardware', views: 580,  helpful: 91 },
  { id: 'A8',  title: 'Printer Setup & Fix',          category: 'Hardware', views: 410,  helpful: 85 },
  { id: 'A9',  title: 'Monitor Configuration',        category: 'Hardware', views: 320,  helpful: 89 },
  { id: 'A10', title: 'Software Installation Policy', category: 'Software', views: 760,  helpful: 93 },
  { id: 'A11', title: 'Microsoft 365 Apps Guide',     category: 'Software', views: 640,  helpful: 90 },
  { id: 'A12', title: 'Outlook Email Setup',          category: 'Email',    views: 870,  helpful: 92 },
  { id: 'A13', title: 'Outlook Troubleshoot',         category: 'Email',    views: 520,  helpful: 87 },
  { id: 'A14', title: 'Teams & Video Calls',          category: 'Email',    views: 480,  helpful: 89 },
  { id: 'A15', title: 'Phishing Recognition Guide',   category: 'Security', views: 390,  helpful: 96 },
  { id: 'A16', title: 'Endpoint Security Policy',     category: 'Security', views: 310,  helpful: 93 },
  { id: 'A17', title: 'Remote Work Setup',            category: 'General',  views: 860,  helpful: 91 },
  { id: 'A18', title: 'New Employee IT Checklist',    category: 'General',  views: 740,  helpful: 95 },
]

const LINKS_DEF = [
  { source: 'A1',  target: 'A2',  strength: 0.9, label: 'related' },
  { source: 'A1',  target: 'A3',  strength: 0.7, label: 'related' },
  { source: 'A2',  target: 'A3',  strength: 0.6, label: 'related' },
  { source: 'A3',  target: 'A15', strength: 0.8, label: 'related' },
  { source: 'A3',  target: 'A16', strength: 0.7, label: 'related' },
  { source: 'A4',  target: 'A5',  strength: 0.8, label: 'related' },
  { source: 'A4',  target: 'A6',  strength: 0.7, label: 'related' },
  { source: 'A4',  target: 'A17', strength: 0.6, label: 'extends' },
  { source: 'A5',  target: 'A6',  strength: 0.5, label: 'related' },
  { source: 'A7',  target: 'A8',  strength: 0.4, label: 'related' },
  { source: 'A7',  target: 'A9',  strength: 0.3, label: 'related' },
  { source: 'A10', target: 'A11', strength: 0.8, label: 'related' },
  { source: 'A11', target: 'A12', strength: 0.6, label: 'extends' },
  { source: 'A12', target: 'A13', strength: 0.9, label: 'related' },
  { source: 'A12', target: 'A14', strength: 0.7, label: 'related' },
  { source: 'A13', target: 'A14', strength: 0.5, label: 'related' },
  { source: 'A15', target: 'A16', strength: 0.8, label: 'extends' },
  { source: 'A17', target: 'A18', strength: 0.7, label: 'related' },
  { source: 'A18', target: 'A1',  strength: 0.5, label: 'references' },
  { source: 'A18', target: 'A4',  strength: 0.6, label: 'references' },
  { source: 'A18', target: 'A10', strength: 0.5, label: 'references' },
  { source: 'A18', target: 'A12', strength: 0.5, label: 'references' },
]

/* ── Fixed positions in a circle layout ── */
const W = 750, H = 520, CX = 375, CY = 260, R1 = 180, R2 = 100

const NODE_POSITIONS = ARTICLES.map((a, i) => {
  const angle = (i / ARTICLES.length) * 2 * Math.PI - Math.PI / 2
  const isHighViews = a.views > 700
  const r = isHighViews ? R1 * 0.55 : R1 + 20
  return { ...a, x: CX + r * Math.cos(angle) * (isHighViews ? 1.1 : 1), y: CY + r * Math.sin(angle) * 0.85 }
})

const linkStrengthColor = (s) => s >= 0.8 ? '#6366f1' : s >= 0.6 ? '#06b6d4' : '#94a3b8'
const linkStrengthWidth  = (s) => s >= 0.8 ? 2.5 : s >= 0.6 ? 1.8 : 1

export default function KnowledgeGraph() {
  const [selected,    setSelected]    = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [catFilter,   setCatFilter]   = useState('all')
  const [query,       setQuery]       = useState('')
  const [zoom,        setZoom]        = useState(1)

  const selectedArticle = selected ? ARTICLES.find(a => a.id === selected) : null
  const connectedIds     = selected
    ? new Set([selected, ...LINKS_DEF.filter(l => l.source === selected || l.target === selected)
        .flatMap(l => [l.source, l.target])])
    : null

  const filteredNodes = NODE_POSITIONS.filter(n =>
    (catFilter === 'all' || n.category === catFilter) &&
    (!query || n.title.toLowerCase().includes(query.toLowerCase()))
  )
  const filteredIds = new Set(filteredNodes.map(n => n.id))

  const articleLinks = selectedArticle
    ? LINKS_DEF.filter(l => l.source === selected || l.target === selected).map(l => {
        const peerId = l.source === selected ? l.target : l.source
        const peer = ARTICLES.find(a => a.id === peerId)
        return { ...l, peer }
      })
    : []

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-700 to-fuchsia-600 shadow-lg">
            <FiShare2 className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Knowledge Graph</h1>
            <p className="text-sm text-gray-500">Visual AI-powered knowledge article relationships — click nodes to explore</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setZoom(z => Math.min(z+0.2, 2))} className="rounded-xl border border-gray-200 p-2 hover:bg-gray-50"><FiZoomIn /></button>
          <button onClick={() => setZoom(z => Math.max(z-0.2, 0.5))} className="rounded-xl border border-gray-200 p-2 hover:bg-gray-50"><FiZoomOut /></button>
          <button onClick={() => { setSelected(null); setZoom(1) }} className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-1.5"><FiRefreshCw /> Reset</button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setCatFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${catFilter==='all'?'bg-gray-800 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          All ({ARTICLES.length})
        </button>
        {Object.entries(CATEGORIES).map(([cat, cfg]) => (
          <button key={cat} onClick={() => setCatFilter(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${catFilter===cat?'text-white':'text-gray-700 hover:opacity-90'}`}
            style={catFilter === cat ? { background: cfg.color } : { background: cfg.bg, color: cfg.color }}>
            {cat} ({ARTICLES.filter(a => a.category === cat).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
        <input placeholder="Search articles…" value={query} onChange={e => { setQuery(e.target.value); setSelected(null) }}
          className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-violet-400" />
      </div>

      <div className={selectedArticle ? 'grid gap-4 lg:grid-cols-[1fr_300px]' : ''}>
        {/* Graph Canvas */}
        <div className="rounded-2xl border border-gray-200 bg-slate-950 overflow-hidden shadow-xl">
          {/* Legend */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-800 text-xs flex-wrap">
            {Object.entries(CATEGORIES).map(([cat, cfg]) => (
              <span key={cat} className="flex items-center gap-1 text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full" style={{background: cfg.color}} />{cat}
              </span>
            ))}
            <span className="ml-auto text-slate-500">Node size = view count</span>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full cursor-default" style={{ minHeight: 380 }}
            transform={`scale(${zoom})`}>
            {/* Background dots */}
            <defs>
              <pattern id="gdots" width="25" height="25" patternUnits="userSpaceOnUse">
                <circle cx="12.5" cy="12.5" r="0.8" fill="#1e293b" />
              </pattern>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#gdots)" />

            {/* Links */}
            {LINKS_DEF.filter(l => filteredIds.has(l.source) && filteredIds.has(l.target)).map((link, i) => {
              const src = NODE_POSITIONS.find(n => n.id === link.source)
              const tgt = NODE_POSITIONS.find(n => n.id === link.target)
              if (!src || !tgt) return null
              const isHighlighted = connectedIds && (connectedIds.has(link.source) && connectedIds.has(link.target))
              const isGray = selected && !isHighlighted
              return (
                <line key={i}
                  x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                  stroke={isGray ? '#1e293b' : linkStrengthColor(link.strength)}
                  strokeWidth={isGray ? 0.5 : linkStrengthWidth(link.strength)}
                  strokeOpacity={isGray ? 0.2 : 0.7}
                  markerEnd={isHighlighted ? 'url(#arrow)' : undefined}
                />
              )
            })}

            {/* Nodes */}
            {filteredNodes.map(node => {
              const cat = CATEGORIES[node.category]
              const r = Math.max(10, Math.min(22, node.views / 80))
              const isSelected    = selected === node.id
              const isConnected   = connectedIds && connectedIds.has(node.id)
              const isDimmed      = selected && !isConnected
              const isHovered     = hoveredNode === node.id
              return (
                <g key={node.id} transform={`translate(${node.x},${node.y})`}
                  onClick={() => setSelected(node.id === selected ? null : node.id)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer">
                  {isSelected && <circle r={r + 8} fill="none" stroke="#a78bfa" strokeWidth={2.5} opacity={0.8} />}
                  {isConnected && !isSelected && <circle r={r + 5} fill="none" stroke={cat.color} strokeWidth={1.5} opacity={0.5} />}
                  <circle r={r} fill={isDimmed ? '#0f172a' : cat.color} opacity={isDimmed ? 0.15 : isSelected ? 1 : 0.85} stroke={cat.color} strokeWidth={1.5} />
                  {!isDimmed && (
                    <text y={r + 12} textAnchor="middle" fill={isDimmed ? '#334155' : '#e2e8f0'}
                      fontSize={8} fontWeight={isSelected ? '700' : '400'} className="select-none">
                      {node.title.length > 18 ? node.title.slice(0,17)+'…' : node.title}
                    </text>
                  )}
                  {/* Hover tooltip */}
                  {isHovered && (
                    <g>
                      <rect x={-60} y={-(r + 38)} width={120} height={26} rx={6} fill="#1e293b" opacity={0.95} />
                      <text x={0} y={-(r + 20)} textAnchor="middle" fill="#f8fafc" fontSize={8.5} fontWeight="600">{node.title}</text>
                      <text x={0} y={-(r + 10)} textAnchor="middle" fill="#94a3b8" fontSize={7.5}>{node.views} views · {node.helpful}% helpful</text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Article Detail Panel */}
        {selectedArticle && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 h-fit">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{background: CATEGORIES[selectedArticle.category].color}}>
                    {selectedArticle.category}
                  </span>
                  <span className="font-mono text-xs text-gray-400">{selectedArticle.id}</span>
                </div>
                <h3 className="font-bold text-gray-800">{selectedArticle.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 shrink-0"><FiX /></button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="rounded-lg bg-gray-50 p-2 text-center"><p className="text-gray-400">Views</p><p className="font-extrabold text-indigo-700 mt-0.5">{selectedArticle.views.toLocaleString()}</p></div>
              <div className="rounded-lg bg-gray-50 p-2 text-center"><p className="text-gray-400">Helpful</p><p className="font-extrabold text-green-700 mt-0.5">{selectedArticle.helpful}%</p></div>
            </div>

            {articleLinks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <FiLink /> {articleLinks.length} Connected Articles
                </p>
                <div className="space-y-2">
                  {articleLinks.map((l, i) => {
                    if (!l.peer) return null
                    const peerCat = CATEGORIES[l.peer.category]
                    return (
                      <button key={i} onClick={() => setSelected(l.peer.id)}
                        className="w-full flex items-center gap-2.5 rounded-xl border border-gray-100 px-2.5 py-2 hover:border-violet-300 hover:bg-violet-50 transition-colors text-left">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{background: peerCat.color}} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{l.peer.title}</p>
                          <p className="text-xs text-gray-400">{l.label} · strength {Math.round(l.strength*100)}%</p>
                        </div>
                        <FiChevronRight className="text-gray-400 shrink-0 text-xs" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-4 rounded-xl bg-violet-50 border border-violet-200 p-3 text-xs text-violet-700">
              💡 This article appears in {articleLinks.length} knowledge connections. Click connected nodes to explore.
            </div>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="mt-4 flex gap-4 text-xs text-gray-500 bg-gray-50 rounded-xl p-3 flex-wrap">
        <span><strong className="text-gray-700">{ARTICLES.length}</strong> articles</span>
        <span><strong className="text-gray-700">{LINKS_DEF.length}</strong> knowledge connections</span>
        <span><strong className="text-gray-700">{Object.keys(CATEGORIES).length}</strong> categories</span>
        <span>Most connected: <strong className="text-indigo-700">New Employee IT Checklist</strong> (5 links)</span>
      </div>
    </div>
  )
}
