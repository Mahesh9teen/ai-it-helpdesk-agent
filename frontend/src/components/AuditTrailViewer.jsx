import { useState, useMemo } from 'react'
import {
  FiActivity, FiSearch, FiFilter, FiDownload,
  FiUser, FiLock, FiSettings, FiAlertCircle,
  FiCheckCircle, FiFileText, FiShield, FiTrash2,
  FiEdit, FiEye, FiKey, FiRefreshCw, FiCalendar
} from 'react-icons/fi'

/* ─── Audit Event Types ─── */
const EVENT_TYPES = {
  auth_success:      { label: 'Login Success',       icon: FiCheckCircle, color: 'text-green-600',  bg: 'bg-green-50' },
  auth_failed:       { label: 'Login Failed',        icon: FiAlertCircle, color: 'text-red-600',    bg: 'bg-red-50' },
  auth_mfa:          { label: 'MFA Verified',        icon: FiShield,      color: 'text-blue-600',   bg: 'bg-blue-50' },
  ticket_created:    { label: 'Ticket Created',      icon: FiFileText,    color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ticket_updated:    { label: 'Ticket Updated',      icon: FiEdit,        color: 'text-purple-600', bg: 'bg-purple-50' },
  ticket_deleted:    { label: 'Ticket Deleted',      icon: FiTrash2,      color: 'text-red-600',    bg: 'bg-red-50' },
  user_created:      { label: 'User Created',        icon: FiUser,        color: 'text-teal-600',   bg: 'bg-teal-50' },
  user_deleted:      { label: 'User Deleted',        icon: FiUser,        color: 'text-red-600',    bg: 'bg-red-50' },
  permission_changed:{ label: 'Permission Changed',  icon: FiKey,         color: 'text-orange-600', bg: 'bg-orange-50' },
  config_changed:    { label: 'Config Changed',      icon: FiSettings,    color: 'text-yellow-600', bg: 'bg-yellow-50' },
  data_exported:     { label: 'Data Exported',       icon: FiDownload,    color: 'text-pink-600',   bg: 'bg-pink-50' },
  report_viewed:     { label: 'Report Viewed',       icon: FiEye,         color: 'text-gray-600',   bg: 'bg-gray-50' },
  policy_updated:    { label: 'Policy Updated',      icon: FiShield,      color: 'text-violet-600', bg: 'bg-violet-50' },
  sla_breached:      { label: 'SLA Breached',        icon: FiAlertCircle, color: 'text-red-700',    bg: 'bg-red-100' },
  access_revoked:    { label: 'Access Revoked',      icon: FiLock,        color: 'text-orange-700', bg: 'bg-orange-50' },
}

const USERS_LIST = ['sarah.mitchell','chen.wei','jay.patel','emma.clarke','alex.rodriguez','priya.sharma','system','admin@company.com']
const RESOURCES  = ['Ticket TKT-1021','User Account','Permission Group','SLA Policy','Report: Weekly','Configuration: VPN','Knowledge Article','Workflow Rule','Device DEV-003','Vendor Contract']
const IPS        = ['192.168.1.105','10.0.0.42','172.16.0.88','203.44.100.12','2600:1408::1','192.168.10.201','34.102.45.1']

/* ── Generate 200 realistic audit events ── */
const generateAuditLog = () => {
  const keys = Object.keys(EVENT_TYPES)
  const log = []
  const now = new Date()
  for (let i = 200; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 900000 + Math.random() * 600000)
    const type = keys[Math.floor(Math.random() * keys.length)]
    const user = USERS_LIST[Math.floor(Math.random() * USERS_LIST.length)]
    const resource = RESOURCES[Math.floor(Math.random() * RESOURCES.length)]
    const ip = IPS[Math.floor(Math.random() * IPS.length)]
    log.push({
      id: `AUD-${String(10000 + i).slice(1)}`,
      timestamp: t.toISOString(),
      displayTime: t.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type, user, resource, ip,
      outcome: type.includes('failed') || type === 'sla_breached' ? 'failure' : 'success',
      severity: ['auth_failed','ticket_deleted','user_deleted','sla_breached','data_exported'].includes(type) ? 'high' : 'info',
      details: getDetails(type, user, resource),
      hash: `sha256:${Math.random().toString(16).slice(2,18)}…`,
    })
  }
  return log.reverse()
}

function getDetails(type, user, resource) {
  const map = {
    auth_success:       `${user} authenticated successfully`,
    auth_failed:        `${user} failed to authenticate — invalid credentials`,
    auth_mfa:           `${user} completed MFA challenge`,
    ticket_created:     `${user} created ${resource}`,
    ticket_updated:     `${user} updated ${resource} — status changed to In Progress`,
    ticket_deleted:     `${user} permanently deleted ${resource}`,
    user_created:       `${user} provisioned new user account`,
    user_deleted:       `${user} deactivated user account — data retained 90 days`,
    permission_changed: `${user} modified permissions on ${resource}`,
    config_changed:     `${user} updated ${resource} — previous value retained in history`,
    data_exported:      `${user} exported ${resource} (CSV, 2.3 MB)`,
    report_viewed:      `${user} viewed ${resource}`,
    policy_updated:     `${user} updated ${resource} — effective immediately`,
    sla_breached:       `SLA P2 breached for ${resource} — owner notified`,
    access_revoked:     `${user} revoked access to ${resource}`,
  }
  return map[type] || `${user} performed ${type} on ${resource}`
}

const AUDIT_LOG = generateAuditLog()

const SEVERITY_CFG = {
  high: { label: 'High',   color: 'bg-red-100 text-red-800',   dot: 'bg-red-500' },
  info: { label: 'Info',   color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
}

const PAGE_SIZE = 25

export default function AuditTrailViewer() {
  const [query,      setQuery]      = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [sevFilter,  setSevFilter]  = useState('all')
  const [page,       setPage]       = useState(1)
  const [expanded,   setExpanded]   = useState(null)
  const [dateRange,  setDateRange]  = useState('24h')

  const cutoff = useMemo(() => {
    const d = new Date()
    if (dateRange === '1h')  d.setHours(d.getHours() - 1)
    if (dateRange === '24h') d.setDate(d.getDate() - 1)
    if (dateRange === '7d')  d.setDate(d.getDate() - 7)
    if (dateRange === '30d') d.setDate(d.getDate() - 30)
    return d
  }, [dateRange])

  const filtered = useMemo(() => AUDIT_LOG.filter(e =>
    new Date(e.timestamp) >= cutoff &&
    (typeFilter === 'all' || e.type === typeFilter) &&
    (userFilter === 'all' || e.user === userFilter) &&
    (sevFilter  === 'all' || e.severity === sevFilter) &&
    (!query || e.user.includes(query.toLowerCase()) || e.resource.toLowerCase().includes(query.toLowerCase()) || e.id.toLowerCase().includes(query.toLowerCase()) || e.ip.includes(query))
  ), [query, typeFilter, userFilter, sevFilter, cutoff])

  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  const stats = {
    total:    filtered.length,
    failures: filtered.filter(e => e.outcome === 'failure').length,
    highSev:  filtered.filter(e => e.severity === 'high').length,
    users:    new Set(filtered.map(e => e.user)).size,
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg">
            <FiActivity className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Audit Trail Viewer</h1>
            <p className="text-sm text-gray-500">Immutable audit log · Cryptographic event hashing · GDPR / SOC 2 ready</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 rounded-xl border border-gray-200 p-0.5 bg-gray-50">
            {['1h','24h','7d','30d'].map(r => (
              <button key={r} onClick={() => { setDateRange(r); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dateRange===r ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{r}</button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-4">
        {[
          { label: 'Events',         value: stats.total,    c: 'border-slate-400', t: 'text-slate-700' },
          { label: 'Failures',       value: stats.failures, c: 'border-red-400',   t: 'text-red-700'   },
          { label: 'High Severity',  value: stats.highSev,  c: 'border-orange-400',t: 'text-orange-700'},
          { label: 'Active Users',   value: stats.users,    c: 'border-blue-400',  t: 'text-blue-700'  },
        ].map(k => (
          <div key={k.label} className={`rounded-xl border-l-4 ${k.c} bg-white p-4 shadow-sm`}>
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${k.t}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input placeholder="Search user, resource, IP, ID…" value={query} onChange={e => { setQuery(e.target.value); setPage(1) }}
            className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-slate-500" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none">
          <option value="all">All Event Types</option>
          {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={userFilter} onChange={e => { setUserFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none">
          <option value="all">All Users</option>
          {USERS_LIST.map(u => <option key={u}>{u}</option>)}
        </select>
        <div className="flex gap-1">
          {['all','high','info'].map(s => (
            <button key={s} onClick={() => { setSevFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${sevFilter===s ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {s==='all'?'All Severity':s==='high'?'High Only':'Info Only'}
            </button>
          ))}
        </div>
      </div>

      {/* Immutability Banner */}
      <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center gap-2 text-xs text-slate-600">
        <FiLock className="shrink-0 text-slate-500" />
        Audit events are cryptographically hashed (SHA-256) and write-once. Records cannot be modified or deleted by any user including admins.
        <span className="ml-auto font-semibold text-slate-500">{filtered.length.toLocaleString()} events</span>
      </div>

      {/* Event Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {paged.map((e, i) => {
          const tcfg = EVENT_TYPES[e.type]
          const scfg = SEVERITY_CFG[e.severity]
          const TIcon = tcfg?.icon || FiActivity
          const isExpanded = expanded === e.id
          return (
            <div key={e.id} className="border-b border-gray-100 last:border-0">
              <div
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}
                onClick={() => setExpanded(isExpanded ? null : e.id)}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tcfg?.bg || 'bg-gray-50'}`}>
                  <TIcon className={`text-sm ${tcfg?.color || 'text-gray-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-800 truncate">{e.details}</p>
                    {e.severity === 'high' && <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold">HIGH</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{e.displayTime} · {e.ip} · {e.id}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${tcfg?.bg || 'bg-gray-100'} ${tcfg?.color || 'text-gray-600'}`}>
                  {tcfg?.label}
                </span>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 bg-slate-50 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs sm:grid-cols-4">
                    {[['Event ID', e.id], ['User', e.user], ['IP Address', e.ip], ['Outcome', e.outcome.toUpperCase()]].map(([k, v]) => (
                      <div key={k} className="bg-white rounded-lg p-2.5 border border-gray-200">
                        <p className="text-gray-400 font-medium">{k}</p>
                        <p className={`font-bold mt-0.5 ${k === 'Outcome' && e.outcome === 'failure' ? 'text-red-700' : 'text-gray-800'}`}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 rounded-lg bg-white border border-gray-200 p-2.5 font-mono text-xs text-gray-500 break-all">
                    🔒 {e.hash}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">ISO 8601 Timestamp: {e.timestamp}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} events</p>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
          {Array.from({ length: Math.min(5, pages) }, (_, i) => {
            const pg = page <= 3 ? i+1 : page-2+i
            if (pg > pages) return null
            return <button key={pg} onClick={() => setPage(pg)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${pg===page ? 'bg-slate-800 text-white border-slate-800' : 'border-gray-200 hover:bg-gray-50'}`}>{pg}</button>
          })}
          <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
        </div>
      </div>
    </div>
  )
}
