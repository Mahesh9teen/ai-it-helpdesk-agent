import { useState, useEffect } from 'react'
import {
  FiCheckCircle, FiAlertCircle, FiXCircle, FiRefreshCw, FiClock,
  FiWifi, FiMail, FiShield, FiMonitor, FiCloud, FiServer, FiPhone,
  FiActivity, FiAlertTriangle, FiInfo, FiChevronDown, FiChevronUp
} from 'react-icons/fi'

/* ─────────── Status Levels ─────────── */
const STATUS = {
  operational:   { label: 'Operational',    color: 'text-green-700',  bg: 'bg-green-100',  dot: 'bg-green-500',  icon: FiCheckCircle },
  degraded:      { label: 'Degraded',       color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500', icon: FiAlertCircle },
  partial:       { label: 'Partial Outage', color: 'text-orange-700', bg: 'bg-orange-100', dot: 'bg-orange-500', icon: FiAlertTriangle },
  major:         { label: 'Major Outage',   color: 'text-red-700',    bg: 'bg-red-100',    dot: 'bg-red-500',    icon: FiXCircle },
  maintenance:   { label: 'Maintenance',    color: 'text-blue-700',   bg: 'bg-blue-100',   dot: 'bg-blue-400',   icon: FiRefreshCw },
}

/* ─────────── Mock Data ─────────── */
const SYSTEMS = [
  {
    id: 'email', name: 'Email (Microsoft 365)', icon: FiMail, group: 'Communication',
    status: 'operational', uptime: '99.97%',
    history: ['op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','deg','op'],
    detail: 'Exchange Online and Outlook services are fully operational.',
  },
  {
    id: 'teams', name: 'Microsoft Teams', icon: FiPhone, group: 'Communication',
    status: 'operational', uptime: '99.91%',
    history: ['op','op','op','op','op','op','op','op','op','op','op','op','op','deg','deg','op','op','op','op','op','op','op','op','op'],
    detail: 'Teams messaging, calling, and meetings are working normally.',
  },
  {
    id: 'vpn', name: 'VPN / Remote Access', icon: FiShield, group: 'Network',
    status: 'degraded', uptime: '98.50%',
    history: ['op','op','op','op','op','op','op','op','op','op','op','op','deg','deg','deg','deg','op','op','op','op','deg','deg','deg','deg'],
    detail: 'Some users may experience slower connection speeds. Our team is investigating.',
    incident: 'INC-2026-0412 — VPN gateway latency — Started 14:30 UTC — Under investigation',
  },
  {
    id: 'wifi', name: 'Office WiFi', icon: FiWifi, group: 'Network',
    status: 'operational', uptime: '99.99%',
    history: Array(24).fill('op'),
    detail: 'Office wireless network is fully operational across all floors.',
  },
  {
    id: 'ad', name: 'Active Directory / SSO', icon: FiShield, group: 'Identity',
    status: 'operational', uptime: '100%',
    history: Array(24).fill('op'),
    detail: 'User authentication, SSO, and AD services are operating normally.',
  },
  {
    id: 'sharepoint', name: 'SharePoint / OneDrive', icon: FiCloud, group: 'Productivity',
    status: 'operational', uptime: '99.88%',
    history: ['op','op','op','op','op','op','op','op','deg','deg','op','op','op','op','op','op','op','op','op','op','op','op','op','op'],
    detail: 'SharePoint Online and OneDrive for Business are fully operational.',
  },
  {
    id: 'jira', name: 'Jira / Confluence', icon: FiActivity, group: 'Productivity',
    status: 'maintenance', uptime: '99.75%',
    history: ['op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','maint','maint','maint','op','op','op'],
    detail: 'Scheduled maintenance window in progress. Expected completion: 20:00 UTC.',
    incident: 'Maintenance window — Jira upgrades — 18:00–20:00 UTC — Planned',
  },
  {
    id: 'erp', name: 'ERP / SAP', icon: FiServer, group: 'Business Apps',
    status: 'operational', uptime: '99.95%',
    history: Array(24).fill('op'),
    detail: 'SAP production environment is operating normally.',
  },
  {
    id: 'crm', name: 'Salesforce CRM', icon: FiServer, group: 'Business Apps',
    status: 'partial', uptime: '97.20%',
    history: ['op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','part','part','part','part','part','part'],
    detail: 'Some users in the APAC region are unable to access Salesforce reports.',
    incident: 'INC-2026-0411 — Salesforce APAC reports — Started 12:00 UTC — Investigating',
  },
  {
    id: 'monitor', name: 'IT Monitoring Systems', icon: FiMonitor, group: 'IT Infrastructure',
    status: 'operational', uptime: '100%',
    history: Array(24).fill('op'),
    detail: 'All monitoring agents and alerting systems are active.',
  },
  {
    id: 'backup', name: 'Backup & Recovery', icon: FiCloud, group: 'IT Infrastructure',
    status: 'operational', uptime: '99.99%',
    history: Array(24).fill('op'),
    detail: 'Automated backups are running on schedule. Last backup: 2 hours ago.',
  },
  {
    id: 'printer', name: 'Print Services', icon: FiServer, group: 'IT Infrastructure',
    status: 'operational', uptime: '98.80%',
    history: ['op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','op','deg','deg','op','op','op','op','op'],
    detail: 'Central print servers are operational. Floor 3 printer offline — being serviced.',
  },
]

const INCIDENTS = [
  {
    id: 'INC-2026-0412', title: 'VPN Gateway High Latency', status: 'investigating',
    severity: 'medium', started: '2026-07-06 14:30 UTC', updated: '2026-07-06 16:10 UTC',
    updates: [
      { time: '16:10 UTC', msg: 'Team has identified the affected gateway node. Failover in progress.' },
      { time: '15:45 UTC', msg: 'Network team engaged. Investigating cause of latency spike.' },
      { time: '14:30 UTC', msg: 'Monitoring detected elevated VPN response times. Ticket opened.' },
    ]
  },
  {
    id: 'INC-2026-0411', title: 'Salesforce Reports Unavailable (APAC)', status: 'investigating',
    severity: 'medium', started: '2026-07-06 12:00 UTC', updated: '2026-07-06 15:55 UTC',
    updates: [
      { time: '15:55 UTC', msg: 'Salesforce support engaged. Root cause: database index issue.' },
      { time: '14:00 UTC', msg: 'Issue confirmed affecting APAC region only. Other regions unaffected.' },
      { time: '12:00 UTC', msg: 'Multiple users reported unable to run reports. Investigating.' },
    ]
  },
]

const MAINTENANCE = [
  {
    id: 'MNT-0089', title: 'Jira/Confluence Platform Upgrade', status: 'in_progress',
    start: '2026-07-06 18:00 UTC', end: '2026-07-06 20:00 UTC',
    affected: ['Jira', 'Confluence'],
    description: 'Routine upgrade to Jira 9.8 and Confluence 8.4. Both services will be in read-only mode during the window.',
  },
  {
    id: 'MNT-0090', title: 'Network Core Switch Maintenance', status: 'scheduled',
    start: '2026-07-12 22:00 UTC', end: '2026-07-13 02:00 UTC',
    affected: ['Office WiFi', 'VPN', 'Wired Network'],
    description: 'Scheduled firmware update for core network switches. Brief 10-minute outage expected around 23:30 UTC.',
  },
]

/* ─── History bar helper ─── */
const histMap = { op: 'bg-green-500', deg: 'bg-yellow-500', part: 'bg-orange-500', major: 'bg-red-500', maint: 'bg-blue-400' }

const HistoryBar = ({ history }) => (
  <div className="flex gap-0.5 mt-2" title="Last 24 hours — left is oldest">
    {history.map((h, i) => (
      <div key={i} className={`h-5 flex-1 rounded-sm ${histMap[h] || 'bg-gray-200'} opacity-80`} />
    ))}
  </div>
)

/* ─────────── Main Component ─────────── */
export default function SystemStatusPage() {
  const [expandedIncident, setExpandedIncident] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [tab, setTab] = useState('status')

  const refresh = () => setLastRefresh(new Date())

  /* Overall health */
  const hasMajor = SYSTEMS.some(s => s.status === 'major')
  const hasPartial = SYSTEMS.some(s => s.status === 'partial' || s.status === 'degraded')
  const allOp = !hasMajor && !hasPartial
  const overallStatus = hasMajor ? 'major' : hasPartial ? 'partial' : 'operational'
  const OverallIcon = STATUS[overallStatus].icon

  /* Group systems */
  const groups = [...new Set(SYSTEMS.map(s => s.group))]

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🖥️ System Status</h1>
          <p className="text-gray-500 text-sm mt-0.5">Live status of all IT systems and services</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg px-3 py-2 hover:border-indigo-300 transition-colors">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Overall Status Banner */}
      <div className={`rounded-2xl p-5 mb-6 flex items-center gap-4 ${STATUS[overallStatus].bg} border ${hasMajor ? 'border-red-200' : hasPartial ? 'border-yellow-200' : 'border-green-200'}`}>
        <OverallIcon className={`text-3xl ${STATUS[overallStatus].color} shrink-0`} />
        <div>
          <h2 className={`text-lg font-bold ${STATUS[overallStatus].color}`}>
            {allOp ? '✅ All Systems Operational' : hasMajor ? '🔴 Major Incident In Progress' : '⚠️ Some Systems Affected'}
          </h2>
          <p className={`text-sm ${STATUS[overallStatus].color} opacity-80`}>
            Last updated: {lastRefresh.toLocaleTimeString()} · {INCIDENTS.length} active incident{INCIDENTS.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="ml-auto hidden md:grid grid-cols-5 gap-2 text-xs text-center">
          {Object.entries(STATUS).map(([k, v]) => {
            const count = SYSTEMS.filter(s => s.status === k).length
            return count > 0 ? (
              <div key={k} className={`rounded-lg px-2 py-1 ${v.bg} ${v.color} font-semibold`}>{count}<br />{v.label}</div>
            ) : null
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-gray-200 p-1 mb-6 shadow-sm">
        {[['status', '📡 Services'], ['incidents', `🚨 Incidents (${INCIDENTS.length})`], ['maintenance', `🔧 Maintenance (${MAINTENANCE.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${tab === id ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Services Tab */}
      {tab === 'status' && (
        <div className="space-y-6">
          {groups.map(group => (
            <div key={group}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{group}</h3>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {SYSTEMS.filter(s => s.group === group).map((sys, i, arr) => {
                  const s = STATUS[sys.status]
                  const Icon = s.icon
                  const SysIcon = sys.icon
                  return (
                    <div key={sys.id} className={`p-4 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div className="flex items-center gap-3">
                        <SysIcon className="text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-gray-800">{sys.name}</p>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-gray-400 hidden sm:inline">{sys.uptime} uptime</span>
                              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${s.dot} shrink-0`} />
                                {s.label}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{sys.detail}</p>
                          {sys.incident && (
                            <p className="text-xs text-orange-600 mt-1 font-medium">⚠ {sys.incident}</p>
                          )}
                          <HistoryBar history={sys.history} />
                          <p className="text-xs text-gray-400 mt-1">← 24 hours ago · Now →</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 bg-gray-50 rounded-xl p-4">
            <span className="font-semibold">Legend:</span>
            {[['bg-green-500', 'Operational'], ['bg-yellow-500', 'Degraded'], ['bg-orange-500', 'Partial Outage'], ['bg-red-500', 'Major Outage'], ['bg-blue-400', 'Maintenance']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1">
                <span className={`h-3 w-3 rounded-sm ${c}`} />{l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Incidents Tab */}
      {tab === 'incidents' && (
        <div className="space-y-4">
          {INCIDENTS.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiCheckCircle className="text-5xl mx-auto mb-3 opacity-30 text-green-400" />
              <p>No active incidents</p>
            </div>
          ) : INCIDENTS.map(inc => (
            <div key={inc.id} className="rounded-xl border border-orange-200 bg-orange-50">
              <button
                className="w-full p-4 flex items-start justify-between gap-2 text-left"
                onClick={() => setExpandedIncident(expandedIncident === inc.id ? null : inc.id)}
              >
                <div className="flex gap-3 items-start">
                  <FiAlertTriangle className="text-orange-600 text-xl mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">{inc.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{inc.id} · Started: {inc.started}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-orange-200 text-orange-800 font-medium capitalize">
                      {inc.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {expandedIncident === inc.id ? <FiChevronUp className="shrink-0 mt-1 text-gray-500" /> : <FiChevronDown className="shrink-0 mt-1 text-gray-500" />}
              </button>
              {expandedIncident === inc.id && (
                <div className="px-4 pb-4 border-t border-orange-200">
                  <h4 className="text-sm font-semibold mt-3 mb-2">Incident Updates</h4>
                  <div className="space-y-3">
                    {inc.updates.map((u, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          {i < inc.updates.length - 1 && <div className="w-px flex-1 bg-orange-200 mt-1" />}
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 font-mono">{u.time}</span>
                          <p className="text-gray-700">{u.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Maintenance Tab */}
      {tab === 'maintenance' && (
        <div className="space-y-4">
          {MAINTENANCE.map(m => (
            <div key={m.id} className={`rounded-xl border p-4 ${m.status === 'in_progress' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex gap-3 items-start">
                  <FiRefreshCw className={`text-xl mt-0.5 shrink-0 ${m.status === 'in_progress' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-semibold text-gray-800">{m.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.id}</p>
                    <p className="text-sm text-gray-600 mt-2">{m.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="flex items-center gap-1 text-gray-500"><FiClock /> Start: {m.start}</span>
                      <span className="flex items-center gap-1 text-gray-500"><FiClock /> End: {m.end}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.affected.map(a => (
                        <span key={a} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${m.status === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {m.status === 'in_progress' ? '🔄 In Progress' : '📅 Scheduled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
