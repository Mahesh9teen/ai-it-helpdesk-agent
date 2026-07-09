import { useState } from 'react'
import {
  FiWifi, FiServer, FiCloud, FiMonitor, FiShield,
  FiAlertCircle, FiCheckCircle, FiRefreshCw, FiInfo,
  FiAlertTriangle, FiMaximize2, FiMinimize2, FiZap
} from 'react-icons/fi'

/* ─── Node + Link Definitions ─── */
const STATUS_CFG = {
  up:          { color: '#10b981', stroke: '#059669', label: 'Up',          dot: 'animate-pulse' },
  degraded:    { color: '#f59e0b', stroke: '#d97706', label: 'Degraded',    dot: 'animate-pulse' },
  down:        { color: '#ef4444', stroke: '#dc2626', label: 'Down',        dot: '' },
  maintenance: { color: '#3b82f6', stroke: '#2563eb', label: 'Maintenance', dot: '' },
}

const NODES = [
  /* Internet / ISP */
  { id: 'internet',  label: 'Internet / ISP',        x: 400, y: 30,  icon: FiWifi,    type: 'internet',  status: 'up',       info: 'Dual ISP • 1Gbps symmetric' },
  /* Edge */
  { id: 'fw-edge',   label: 'Edge Firewall (Cisco)', x: 400, y: 115, icon: FiShield,  type: 'firewall',  status: 'up',       info: 'Cisco ASA 5525 • ASA 9.18' },
  { id: 'vpn-gw',   label: 'VPN Gateway',            x: 200, y: 115, icon: FiShield,  type: 'security',  status: 'degraded', info: 'AnyConnect 5.0 • High latency detected' },
  /* Core Network */
  { id: 'core-sw',  label: 'Core Switch (HQ)',        x: 400, y: 210, icon: FiZap,    type: 'switch',    status: 'up',       info: 'Cisco Nexus 9000 • 40Gbps uplinks' },
  { id: 'dist-sw1', label: 'Distribution SW1',        x: 220, y: 305, icon: FiZap,    type: 'switch',    status: 'up',       info: 'Cisco Cat9300 • Floor 1+2' },
  { id: 'dist-sw2', label: 'Distribution SW2',        x: 580, y: 305, icon: FiZap,    type: 'switch',    status: 'up',       info: 'Cisco Cat9300 • Floor 3+4' },
  /* Servers */
  { id: 'web-srv',  label: 'Web Server (IIS)',         x: 130, y: 405, icon: FiServer,  type: 'server',  status: 'up',       info: 'prod-web-01 • Azure East US' },
  { id: 'app-srv1', label: 'App Server 01',            x: 270, y: 405, icon: FiServer,  type: 'server',  status: 'up',       info: 'prod-app-01 • 8vCPU, 32GB RAM' },
  { id: 'app-srv2', label: 'App Server 02',            x: 530, y: 405, icon: FiServer,  type: 'server',  status: 'maintenance',info: 'prod-app-02 • Patch window active' },
  { id: 'db-srv',   label: 'SQL Primary (DB01)',       x: 670, y: 405, icon: FiServer,  type: 'database',status: 'up',       info: 'SQL Server 2022 • prod-db-01' },
  /* Cloud */
  { id: 'azure',    label: 'Azure Cloud',              x: 630, y: 115, icon: FiCloud,   type: 'cloud',   status: 'up',       info: 'Azure East US • Primary region' },
  { id: 'm365',     label: 'Microsoft 365',            x: 750, y: 210, icon: FiCloud,   type: 'cloud',   status: 'up',       info: 'Exchange • Teams • SharePoint' },
  /* WiFi APs */
  { id: 'ap1',      label: 'WiFi AP — Floor 1',        x: 50,  y: 490, icon: FiWifi,   type: 'ap',      status: 'up',       info: 'Cisco AP 9130 • 802.11ax' },
  { id: 'ap2',      label: 'WiFi AP — Floor 2',        x: 180, y: 490, icon: FiWifi,   type: 'ap',      status: 'up',       info: 'Cisco AP 9130 • 802.11ax' },
  { id: 'ap3',      label: 'WiFi AP — Floor 3',        x: 420, y: 490, icon: FiWifi,   type: 'ap',      status: 'up',       info: 'Cisco AP 9130 • 802.11ax' },
]

const LINKS = [
  { from: 'internet', to: 'fw-edge',  bandwidth: '1Gbps',  util: 42 },
  { from: 'internet', to: 'vpn-gw',  bandwidth: '1Gbps',  util: 78 },
  { from: 'fw-edge',  to: 'core-sw', bandwidth: '10Gbps', util: 28 },
  { from: 'fw-edge',  to: 'azure',   bandwidth: '1Gbps',  util: 35 },
  { from: 'azure',    to: 'm365',    bandwidth: '10Gbps', util: 15 },
  { from: 'core-sw',  to: 'dist-sw1',bandwidth: '10Gbps', util: 22 },
  { from: 'core-sw',  to: 'dist-sw2',bandwidth: '10Gbps', util: 31 },
  { from: 'dist-sw1', to: 'web-srv', bandwidth: '1Gbps',  util: 18 },
  { from: 'dist-sw1', to: 'app-srv1',bandwidth: '1Gbps',  util: 55 },
  { from: 'dist-sw2', to: 'app-srv2',bandwidth: '1Gbps',  util: 5  },
  { from: 'dist-sw2', to: 'db-srv',  bandwidth: '10Gbps', util: 44 },
  { from: 'dist-sw1', to: 'ap1',     bandwidth: '1Gbps',  util: 30 },
  { from: 'dist-sw1', to: 'ap2',     bandwidth: '1Gbps',  util: 22 },
  { from: 'dist-sw2', to: 'ap3',     bandwidth: '1Gbps',  util: 41 },
]

const linkColor = (util) => util >= 80 ? '#ef4444' : util >= 60 ? '#f59e0b' : '#10b981'
const linkWidth = (util) => util >= 80 ? 3.5 : util >= 50 ? 2.5 : 1.5

function getNodeById(id) { return NODES.find(n => n.id === id) }

export default function NetworkTopology() {
  const [selected,  setSelected]  = useState(null)
  const [showUtil,  setShowUtil]   = useState(true)
  const [filter,    setFilter]     = useState('all')
  const [fullscreen,setFullscreen] = useState(false)

  const selectedNode = selected ? NODES.find(n => n.id === selected) : null
  const nodeLinks = selected ? LINKS.filter(l => l.from === selected || l.to === selected) : []

  const upCount   = NODES.filter(n => n.status === 'up').length
  const downCount = NODES.filter(n => n.status === 'down').length
  const warnCount = NODES.filter(n => n.status === 'degraded' || n.status === 'maintenance').length

  const visibleNodes = filter === 'all' ? NODES : NODES.filter(n => n.status === filter)
  const visibleIds   = new Set(visibleNodes.map(n => n.id))
  const visibleLinks = LINKS.filter(l => visibleIds.has(l.from) && visibleIds.has(l.to))

  const SVG_W = 820, SVG_H = 550

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-slate-700 shadow-lg">
            <FiWifi className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Network Topology</h1>
            <p className="text-sm text-gray-500">Live interactive network diagram — click nodes to inspect</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUtil(s => !s)}
            className={`px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${showUtil ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 hover:bg-gray-50'}`}>
            {showUtil ? '👁 Utilization On' : '👁 Utilization Off'}
          </button>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          ['all', `All (${NODES.length})`],
          ['up', `Up (${upCount})`],
          ['degraded', `Degraded (${warnCount})`],
          ['down', `Down (${downCount})`],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${filter===id ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 hover:border-gray-400'}`}>
            {id !== 'all' && <span className={`h-2.5 w-2.5 rounded-full ${id==='up'?'bg-green-500':id==='degraded'?'bg-yellow-500':'bg-red-500'}`} />}
            {label}
          </button>
        ))}
      </div>

      <div className={`grid gap-5 ${selectedNode ? 'lg:grid-cols-[1fr_280px]' : ''}`}>
        {/* SVG Canvas */}
        <div className="rounded-2xl border border-gray-200 bg-gray-950 overflow-hidden shadow-2xl">
          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-800 text-xs flex-wrap">
            {Object.entries(STATUS_CFG).map(([k,v]) => (
              <span key={k} className="flex items-center gap-1.5 text-gray-400">
                <span className="h-2.5 w-2.5 rounded-full" style={{background:v.color}} />{v.label}
              </span>
            ))}
            {showUtil && <span className="ml-auto text-gray-500">Link colours: green &lt;60% · yellow 60–79% · red ≥80% utilisation</span>}
          </div>

          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ minHeight: 420 }}>
            {/* Grid dots */}
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="0.8" fill="#334155" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Links */}
            {visibleLinks.map((link, i) => {
              const from = getNodeById(link.from)
              const to   = getNodeById(link.to)
              if (!from || !to) return null
              const mx = (from.x + to.x) / 2
              const my = (from.y + to.y) / 2
              const lc = linkColor(link.util)
              const lw = linkWidth(link.util)
              return (
                <g key={i}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={lc} strokeWidth={lw} strokeOpacity={0.7} strokeLinecap="round" />
                  {showUtil && (
                    <g>
                      <rect x={mx-16} y={my-8} width={32} height={16} rx={4} fill="#1e293b" opacity={0.9} />
                      <text x={mx} y={my+5} textAnchor="middle" fill={lc} fontSize={9} fontWeight="600">{link.util}%</text>
                    </g>
                  )}
                </g>
              )
            })}

            {/* Nodes */}
            {visibleNodes.map(node => {
              const sCfg = STATUS_CFG[node.status]
              const isSelected = selected === node.id
              const Icon = node.icon
              return (
                <g key={node.id} transform={`translate(${node.x},${node.y})`}
                  onClick={() => setSelected(node.id === selected ? null : node.id)}
                  className="cursor-pointer">
                  {/* Selection ring */}
                  {isSelected && <circle r={26} fill="none" stroke="#a78bfa" strokeWidth={2.5} opacity={0.8} />}
                  {/* Status glow */}
                  <circle r={22} fill={sCfg.color} opacity={0.12} />
                  {/* Node body */}
                  <circle r={18} fill={isSelected ? '#1e293b' : '#0f172a'} stroke={sCfg.stroke} strokeWidth={isSelected ? 2.5 : 1.5} />
                  {/* Status dot */}
                  <circle cx={13} cy={-13} r={5} fill={sCfg.color} stroke="#0f172a" strokeWidth={1.5} />
                  {/* Label */}
                  <text y={32} textAnchor="middle" fill="#cbd5e1" fontSize={8} fontWeight="500" className="select-none">
                    {node.label.length > 16 ? node.label.slice(0,15)+'…' : node.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Node Detail Panel */}
        {selectedNode && (() => {
          const sCfg = STATUS_CFG[selectedNode.status]
          const Icon = selectedNode.icon
          return (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 h-fit">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                    <Icon className="text-gray-700 text-lg" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm leading-tight">{selectedNode.label}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 ${sCfg.label === 'Up' ? 'text-green-700' : sCfg.label === 'Down' ? 'text-red-700' : 'text-yellow-700'}`}>
                      <span className={`h-2 w-2 rounded-full`} style={{background:sCfg.color}} />{sCfg.label}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 mb-4 text-xs text-blue-800">
                <FiInfo className="inline mr-1" />{selectedNode.info}
              </div>

              {nodeLinks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Connected Links</p>
                  <div className="space-y-2">
                    {nodeLinks.map((l, i) => {
                      const peer = l.from === selectedNode.id ? l.to : l.from
                      const peerNode = getNodeById(peer)
                      return (
                        <div key={i} className="flex items-center justify-between text-xs rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-2">
                          <div>
                            <p className="font-medium">{peerNode?.label || peer}</p>
                            <p className="text-gray-400">{l.bandwidth}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold" style={{color: linkColor(l.util)}}>{l.util}%</p>
                            <p className="text-gray-400">utilization</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedNode.status !== 'up' && (
                <div className={`mt-3 rounded-lg p-3 text-xs font-medium flex items-center gap-2 ${selectedNode.status === 'down' ? 'bg-red-50 text-red-800' : selectedNode.status === 'degraded' ? 'bg-yellow-50 text-yellow-800' : 'bg-blue-50 text-blue-800'}`}>
                  {selectedNode.status === 'degraded' ? <FiAlertCircle /> : selectedNode.status === 'down' ? <FiAlertTriangle /> : <FiRefreshCw />}
                  {selectedNode.status === 'degraded' ? 'Performance degraded — monitoring' :
                   selectedNode.status === 'down' ? 'Node offline — incident created' :
                   'Maintenance window active'}
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
