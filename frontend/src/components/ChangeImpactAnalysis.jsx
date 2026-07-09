import React, { useState, useMemo, useRef } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { FiGitBranch, FiAlertTriangle, FiCheckCircle, FiClock, FiNavigation, FiRefreshCw, FiSearch, FiZap, FiChevronDown } from 'react-icons/fi'

const CHANGES = [
  { id: 1, title: 'Upgrade Database Driver', type: 'infrastructure', status: 'approved', riskLevel: 'medium', schedule: '2026-07-08', duration: '2 hours', deployTo: ['Prod', 'Staging'], dependencies: ['API v2.1', 'Cache Layer'], impactedSystems: ['API', 'Cache', 'DB'], estimatedUsers: 5000, downtime: '30 mins', rollbackTime: '15 mins' },
  { id: 2, title: 'Enable New Authentication Module', type: 'feature', status: 'pending-review', riskLevel: 'high', schedule: '2026-07-10', duration: '4 hours', deployTo: ['Staging', 'Prod'], dependencies: ['Identity Service', 'SSL Cert'], impactedSystems: ['Auth', 'Portal', 'API'], estimatedUsers: 12000, downtime: '2 hours', rollbackTime: '30 mins' },
  { id: 3, title: 'Apply Security Patches', type: 'patch', status: 'approved', riskLevel: 'critical', schedule: '2026-07-09', duration: '1 hour', deployTo: ['Prod'], dependencies: ['none'], impactedSystems: ['Firewall', 'VPN', 'Endpoints'], estimatedUsers: 8000, downtime: '0 mins', rollbackTime: '5 mins' },
  { id: 4, title: 'Migrate Cache Layer to Redis 7', type: 'infrastructure', status: 'in-progress', riskLevel: 'high', schedule: '2026-07-07', duration: '6 hours', deployTo: ['Prod'], dependencies: ['Memcached', 'Queue', 'Sessions'], impactedSystems: ['Cache', 'Sessions', 'Queue'], estimatedUsers: 15000, downtime: '1 hour', rollbackTime: '45 mins' },
  { id: 5, title: 'Deploy Incident Dashboard v2', type: 'feature', status: 'completed', riskLevel: 'low', schedule: '2026-06-28', duration: '3 hours', deployTo: ['Prod'], dependencies: ['Analytics', 'Real-time DB'], impactedSystems: ['Dashboard'], estimatedUsers: 3000, downtime: '0 mins', rollbackTime: '10 mins' },
]

const CHANGE_IMPACT_TIMELINE = [
  { date: 'Mon', changes: 2, risk: 1.2 },
  { date: 'Tue', changes: 1, risk: 0.8 },
  { date: 'Wed', changes: 3, risk: 2.1 },
  { date: 'Thu', changes: 2, risk: 1.5 },
  { date: 'Fri', changes: 0, risk: 0 },
  { date: 'Sat', changes: 1, risk: 1.8 },
  { date: 'Sun', changes: 1, risk: 0.9 },
]

const DEPENDENCY_GRAPH = [
  { id: 'api', name: 'API Server', dependencies: ['cache', 'db'], color: '#3b82f6' },
  { id: 'cache', name: 'Cache Layer', dependencies: ['db'], color: '#8b5cf6' },
  { id: 'db', name: 'Database', dependencies: [], color: '#06b6d4' },
  { id: 'auth', name: 'Auth Service', dependencies: ['api'], color: '#10b981' },
  { id: 'portal', name: 'Portal', dependencies: ['api', 'auth'], color: '#f59e0b' },
]

export default function ChangeImpactAnalysis() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedChange, setSelectedChange] = useState(null)
  const [expandedDep, setExpandedDep] = useState(null)
  const svgRef = useRef(null)

  const filteredChanges = useMemo(() => {
    if (activeTab === 'all') return CHANGES
    return CHANGES.filter(c => c.status === activeTab)
  }, [activeTab])

  const riskSummary = useMemo(() => {
    return {
      critical: CHANGES.filter(c => c.riskLevel === 'critical').length,
      high: CHANGES.filter(c => c.riskLevel === 'high').length,
      medium: CHANGES.filter(c => c.riskLevel === 'medium').length,
      approved: CHANGES.filter(c => c.status === 'approved').length,
    }
  }, [])

  const getRiskColor = (level) => {
    switch(level) {
      case 'critical': return '#dc2626'
      case 'high': return '#ea580c'
      case 'medium': return '#eab308'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getStatusBg = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-500/10 border-green-500/30'
      case 'in-progress': return 'bg-blue-500/10 border-blue-500/30'
      case 'pending-review': return 'bg-amber-500/10 border-amber-500/30'
      case 'completed': return 'bg-gray-500/10 border-gray-500/30'
      default: return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  const renderDependencyGraph = () => {
    const nodeRadius = 35
    const centerX = 400
    const centerY = 200
    const orbitRadius = 120

    return (
      <svg ref={svgRef} width="100%" height="400" viewBox="0 0 800 400" className="bg-gray-900/20 rounded-lg border border-hope-border">
        {/* Connection Lines */}
        {DEPENDENCY_GRAPH.map(node =>
          node.dependencies.map((dep, idx) => {
            const depNode = DEPENDENCY_GRAPH.find(n => n.id === dep)
            const depIndex = DEPENDENCY_GRAPH.indexOf(depNode)
            const nodeIndex = DEPENDENCY_GRAPH.indexOf(node)
            
            const fromAngle = (nodeIndex / DEPENDENCY_GRAPH.length) * Math.PI * 2
            const toAngle = (depIndex / DEPENDENCY_GRAPH.length) * Math.PI * 2
            
            const fromX = centerX + orbitRadius * Math.cos(fromAngle)
            const fromY = centerY + orbitRadius * Math.sin(fromAngle)
            const toX = centerX + orbitRadius * Math.cos(toAngle)
            const toY = centerY + orbitRadius * Math.sin(toAngle)
            
            return (
              <line key={`${node.id}-${dep}`} x1={fromX} y1={fromY} x2={toX} y2={toY} stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
            )
          })
        )}

        {/* Arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
          </marker>
        </defs>

        {/* Center hub */}
        <circle cx={centerX} cy={centerY} r={nodeRadius} fill="#1f2937" stroke="#374151" strokeWidth="2" />
        <text x={centerX} y={centerY} textAnchor="middle" dy="0.3em" fill="#9ca3af" fontSize="12" fontWeight="600">Cluster</text>

        {/* Nodes */}
        {DEPENDENCY_GRAPH.map((node, idx) => {
          const angle = (idx / DEPENDENCY_GRAPH.length) * Math.PI * 2
          const x = centerX + orbitRadius * Math.cos(angle)
          const y = centerY + orbitRadius * Math.sin(angle)

          return (
            <g key={node.id}>
              <circle cx={x} cy={y} r={nodeRadius} fill={node.color} opacity="0.8" />
              <text x={x} y={y} textAnchor="middle" dy="0.3em" fill="white" fontSize="11" fontWeight="600">{node.name}</text>
            </g>
          )
        })}
      </svg>
    )
  }

  return (
    <div className="min-h-screen bg-hope-bg text-hope-text">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-hope-text-primary">Change Impact Analysis</h1>
            <p className="text-sm text-hope-text-secondary mt-1">Risk assessment • Dependency tracking • Rollback planning</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-hope-accent text-white rounded-lg hover:bg-opacity-90 transition">
            <FiZap className="w-4 h-4" />
            New Change
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Pending Changes</p>
                <p className="text-2xl font-bold text-amber-500 mt-2">{CHANGES.filter(c => c.status === 'pending-review').length}</p>
              </div>
              <FiAlertTriangle className="w-10 h-10 text-amber-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Critical Risk</p>
                <p className="text-2xl font-bold text-red-500 mt-2">{riskSummary.critical}</p>
              </div>
              <FiNavigate className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Approved</p>
                <p className="text-2xl font-bold text-green-500 mt-2">{riskSummary.approved}</p>
              </div>
              <FiCheckCircle className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">In Progress</p>
                <p className="text-2xl font-bold text-blue-500 mt-2">{CHANGES.filter(c => c.status === 'in-progress').length}</p>
              </div>
              <FiClock className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-hope-border overflow-x-auto">
          {['all', 'approved', 'pending-review', 'in-progress', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
                activeTab === tab
                  ? 'border-hope-accent text-hope-accent'
                  : 'border-transparent text-hope-text-secondary hover:text-hope-text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')} ({CHANGES.filter(c => tab === 'all' || c.status === tab).length})
            </button>
          ))}
        </div>

        {/* Change Timeline */}
        <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-hope-text-primary mb-4">7-Day Change & Risk Timeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={CHANGE_IMPACT_TIMELINE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="changes" fill="#3b82f6" name="Changes Scheduled" />
              <Bar yAxisId="right" dataKey="risk" fill="#dc2626" name="Risk Score" />
              <ReferenceLine yAxisId="right" y={1.5} stroke="#ea580c" strokeDasharray="5 5" name="Risk Threshold" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dependency Graph */}
        <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-hope-text-primary mb-4">System Dependency Graph</h3>
          <div className="bg-gray-900/30 rounded-lg p-4">
            {renderDependencyGraph()}
          </div>
        </div>

        {/* Changes List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-hope-text-primary">Changes</h3>
          {filteredChanges.map(change => (
            <div
              key={change.id}
              className={`border rounded-lg p-4 cursor-pointer transition ${
                selectedChange?.id === change.id
                  ? 'border-hope-accent bg-hope-accent/5'
                  : getStatusBg(change.status)
              } hover:border-hope-accent/50`}
              onClick={() => setSelectedChange(selectedChange?.id === change.id ? null : change)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-hope-text-primary">{change.title}</h4>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
                      {change.type.toUpperCase()}
                    </span>
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold text-white"
                      style={{ backgroundColor: getRiskColor(change.riskLevel) }}
                    >
                      {change.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-hope-text-secondary mb-2">
                    <span>Schedule: {change.schedule}</span>
                    <span>Duration: {change.duration}</span>
                    <span>Users: {change.estimatedUsers.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  className="px-3 py-1 bg-hope-accent text-white rounded text-sm hover:bg-opacity-90 transition"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {change.status === 'pending-review' ? 'Review' : 'View'}
                </button>
              </div>

              {/* Expanded Details */}
              {selectedChange?.id === change.id && (
                <div className="mt-4 pt-4 border-t border-gray-600 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-hope-text-secondary mb-1">Deploy To</p>
                      <div className="flex gap-2 flex-wrap">
                        {change.deployTo.map(env => (
                          <span key={env} className="px-2 py-1 rounded text-xs bg-gray-700/50">{env}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-hope-text-secondary mb-1">Impacted Systems</p>
                      <div className="flex gap-2 flex-wrap">
                        {change.impactedSystems.map(sys => (
                          <span key={sys} className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300">{sys}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-hope-text-secondary mb-1">Expected Downtime</p>
                      <p className="text-sm text-hope-text-primary">{change.downtime}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-hope-text-secondary mb-1">Rollback Time</p>
                      <p className="text-sm text-hope-text-primary">{change.rollbackTime}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-hope-text-secondary mb-1">Dependencies</p>
                    <div className="flex gap-2 flex-wrap">
                      {change.dependencies.map((dep, idx) => (
                        <span key={idx} className="px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-300">{dep}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
