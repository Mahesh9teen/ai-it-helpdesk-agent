import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'
import {
  FiGrid, FiAlertCircle, FiCheckCircle, FiClock,
  FiTrendingUp, FiTrendingDown, FiUsers, FiDollarSign,
  FiStar, FiActivity, FiServer, FiShield, FiSearch,
  FiChevronRight, FiRefreshCw, FiFilter, FiArrowUp, FiArrowDown
} from 'react-icons/fi'

/* ── Client Data ── */
const CLIENT_TIERS = {
  enterprise: { label: 'Enterprise', color: 'bg-purple-100 text-purple-800', border: 'border-purple-300' },
  business:   { label: 'Business',   color: 'bg-blue-100 text-blue-800',    border: 'border-blue-300'   },
  starter:    { label: 'Starter',    color: 'bg-green-100 text-green-800',  border: 'border-green-300'  },
}

const HEALTH_CFG = {
  healthy:    { label: 'Healthy',     dot: 'bg-green-500',  text: 'text-green-700',  ring: 'ring-green-300' },
  warning:    { label: 'Warning',     dot: 'bg-yellow-500', text: 'text-yellow-700', ring: 'ring-yellow-300' },
  critical:   { label: 'Critical',   dot: 'bg-red-500',    text: 'text-red-700',    ring: 'ring-red-300'   },
  offboarding:{ label: 'Offboarding',dot: 'bg-gray-400',   text: 'text-gray-600',   ring: 'ring-gray-200'  },
}

const CLIENTS = [
  {
    id: 'CLT-001', name: 'Apex Financial Group', tier: 'enterprise', health: 'healthy',
    users: 320, devices: 418, mrr: 18400, arr: 220800, sla: 99.9,
    open_tickets: 4, critical_tickets: 0, avg_response: 1.2,
    csat: 4.9, contract_end: '2027-06-30', am: 'Sarah Mitchell',
    logo: 'AF', color: '#6366f1',
    monthly_trend: [
      { m: 'Feb', tickets: 42 }, { m: 'Mar', tickets: 38 }, { m: 'Apr', tickets: 51 },
      { m: 'May', tickets: 35 }, { m: 'Jun', tickets: 29 }, { m: 'Jul', tickets: 33 },
    ],
    alerts: [],
    services: ['M365 Management','Azure Hosting','Security Monitoring','24/7 Support','Backup & DR'],
  },
  {
    id: 'CLT-002', name: 'Meridian Healthcare', tier: 'enterprise', health: 'warning',
    users: 245, devices: 310, mrr: 14200, arr: 170400, sla: 99.5,
    open_tickets: 12, critical_tickets: 1, avg_response: 2.8,
    csat: 4.3, contract_end: '2026-12-31', am: 'Chen Wei',
    logo: 'MH', color: '#06b6d4',
    monthly_trend: [
      { m: 'Feb', tickets: 61 }, { m: 'Mar', tickets: 72 }, { m: 'Apr', tickets: 65 },
      { m: 'May', tickets: 70 }, { m: 'Jun', tickets: 78 }, { m: 'Jul', tickets: 81 },
    ],
    alerts: ['SLA P1 breach risk — TKT-9821 (4h remaining)', 'HIPAA compliance review overdue'],
    services: ['M365 Management','Security Monitoring','HIPAA Compliance','24/7 Support'],
  },
  {
    id: 'CLT-003', name: 'Nexus Retail Chain', tier: 'business', health: 'healthy',
    users: 180, devices: 224, mrr: 8600, arr: 103200, sla: 99.7,
    open_tickets: 7, critical_tickets: 0, avg_response: 1.8,
    csat: 4.7, contract_end: '2027-03-31', am: 'Jay Patel',
    logo: 'NR', color: '#10b981',
    monthly_trend: [
      { m: 'Feb', tickets: 45 }, { m: 'Mar', tickets: 52 }, { m: 'Apr', tickets: 48 },
      { m: 'May', tickets: 41 }, { m: 'Jun', tickets: 39 }, { m: 'Jul', tickets: 42 },
    ],
    alerts: [],
    services: ['Device Management','Helpdesk Support','Network Monitoring'],
  },
  {
    id: 'CLT-004', name: 'Sigma Law Partners', tier: 'business', health: 'critical',
    users: 95, devices: 112, mrr: 5200, arr: 62400, sla: 98.2,
    open_tickets: 23, critical_tickets: 3, avg_response: 5.4,
    csat: 3.1, contract_end: '2026-09-30', am: 'Emma Clarke',
    logo: 'SL', color: '#ef4444',
    monthly_trend: [
      { m: 'Feb', tickets: 28 }, { m: 'Mar', tickets: 35 }, { m: 'Apr', tickets: 41 },
      { m: 'May', tickets: 52 }, { m: 'Jun', tickets: 68 }, { m: 'Jul', tickets: 74 },
    ],
    alerts: ['3 P1 tickets open >4h SLA', 'CSAT dropped 1.8 pts this month', 'Contract renewal risk HIGH'],
    services: ['M365 Management','Helpdesk Support','Backup & DR'],
  },
  {
    id: 'CLT-005', name: 'Vantage Logistics', tier: 'enterprise', health: 'healthy',
    users: 410, devices: 535, mrr: 22100, arr: 265200, sla: 99.95,
    open_tickets: 6, critical_tickets: 0, avg_response: 0.9,
    csat: 4.8, contract_end: '2028-01-31', am: 'Alex Rodriguez',
    logo: 'VL', color: '#8b5cf6',
    monthly_trend: [
      { m: 'Feb', tickets: 55 }, { m: 'Mar', tickets: 48 }, { m: 'Apr', tickets: 51 },
      { m: 'May', tickets: 44 }, { m: 'Jun', tickets: 39 }, { m: 'Jul', tickets: 37 },
    ],
    alerts: [],
    services: ['Azure Hosting','M365 Management','Security Monitoring','SIEM','24/7 Support','Backup & DR'],
  },
  {
    id: 'CLT-006', name: 'Bloom Edu Academy', tier: 'starter', health: 'healthy',
    users: 58, devices: 74, mrr: 2800, arr: 33600, sla: 99.0,
    open_tickets: 3, critical_tickets: 0, avg_response: 3.2,
    csat: 4.5, contract_end: '2026-11-30', am: 'Jay Patel',
    logo: 'BE', color: '#f59e0b',
    monthly_trend: [
      { m: 'Feb', tickets: 18 }, { m: 'Mar', tickets: 21 }, { m: 'Apr', tickets: 19 },
      { m: 'May', tickets: 16 }, { m: 'Jun', tickets: 14 }, { m: 'Jul', tickets: 15 },
    ],
    alerts: ['Renewal in 146 days — prepare renewal proposal'],
    services: ['M365 Management','Helpdesk Support'],
  },
]

const totalMRR = CLIENTS.reduce((s,c) => s + c.mrr, 0)
const totalUsers = CLIENTS.reduce((s,c) => s + c.users, 0)
const totalDevices = CLIENTS.reduce((s,c) => s + c.devices, 0)
const totalTickets = CLIENTS.reduce((s,c) => s + c.open_tickets, 0)
const avgCSAT = (CLIENTS.reduce((s,c) => s + c.csat, 0) / CLIENTS.length).toFixed(1)

const CROSS_CLIENT_DATA = [
  { client: 'Apex', tickets: 33, sla: 99.9, csat: 4.9 },
  { client: 'Meridian', tickets: 81, sla: 99.5, csat: 4.3 },
  { client: 'Nexus', tickets: 42, sla: 99.7, csat: 4.7 },
  { client: 'Sigma', tickets: 74, sla: 98.2, csat: 3.1 },
  { client: 'Vantage', tickets: 37, sla: 99.95, csat: 4.8 },
  { client: 'Bloom', tickets: 15, sla: 99.0, csat: 4.5 },
]

/* ── Mini sparkline ── */
function MiniLine({ data, color }) {
  const vals = data.map(d => d.tickets)
  const max = Math.max(...vals), min = Math.min(...vals)
  const w = 80, h = 28, pad = 2
  const points = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (w - 2*pad)
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - 2*pad)
    return `${x},${y}`
  }).join(' ')
  const trend = vals[vals.length-1] - vals[vals.length-2]
  return (
    <div className="flex items-center gap-2">
      <svg width={w} height={h} className="shrink-0">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
        {trend > 0 ? <FiArrowUp className="text-[10px]" /> : <FiArrowDown className="text-[10px]" />}
        {Math.abs(trend)}
      </span>
    </div>
  )
}

export default function MSPPortal() {
  const [view,     setView]     = useState('grid')
  const [selected, setSelected] = useState(null)
  const [query,    setQuery]    = useState('')
  const [tierFilter, setTier]   = useState('all')
  const [healthFilter, setHealth] = useState('all')

  const client = selected ? CLIENTS.find(c => c.id === selected) : null
  const filtered = CLIENTS.filter(c =>
    (tierFilter  === 'all' || c.tier   === tierFilter) &&
    (healthFilter === 'all' || c.health === healthFilter) &&
    (!query || c.name.toLowerCase().includes(query.toLowerCase()))
  )

  /* ── Client Detail Panel ── */
  const ClientDetail = ({ c }) => {
    const hCfg = HEALTH_CFG[c.health]
    return (
      <div className="space-y-4">
        {/* Client Header */}
        <div className={`rounded-2xl p-5 border-2 ${CLIENT_TIERS[c.tier].border}`} style={{ background: c.color + '08' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white font-extrabold text-xl" style={{ background: c.color }}>
                {c.logo}
              </div>
              <div>
                <h2 className="text-xl font-bold">{c.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CLIENT_TIERS[c.tier].color}`}>{CLIENT_TIERS[c.tier].label}</span>
                  <span className={`flex items-center gap-1 text-xs font-medium ${hCfg.text}`}>
                    <span className={`h-2 w-2 rounded-full ${hCfg.dot}`} />{hCfg.label}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
          </div>

          {/* Alerts */}
          {c.alerts.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {c.alerts.map((a, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800">
                  <FiAlertCircle className="shrink-0" /> {a}
                </div>
              ))}
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ['MRR', `$${(c.mrr/1000).toFixed(1)}K`, 'text-indigo-700'],
              ['Open Tickets', c.open_tickets, c.critical_tickets > 0 ? 'text-red-700' : 'text-gray-700'],
              ['Avg Response', `${c.avg_response}h`, c.avg_response > 4 ? 'text-red-700' : 'text-green-700'],
              ['CSAT', `${c.csat}★`, c.csat >= 4.5 ? 'text-green-700' : c.csat >= 4 ? 'text-yellow-700' : 'text-red-700'],
            ].map(([l,v,t]) => (
              <div key={l} className="rounded-xl bg-white/70 p-3 text-center border border-white">
                <p className="text-xs text-gray-500">{l}</p>
                <p className={`text-xl font-extrabold mt-0.5 ${t}`}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Trend */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Monthly Ticket Volume</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={c.monthly_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="m" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="tickets" fill={c.color} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Services + Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h4 className="font-semibold text-gray-600 text-xs uppercase mb-2">Services</h4>
            <div className="space-y-1.5">
              {c.services.map(s => (
                <div key={s} className="flex items-center gap-2 text-xs"><FiCheckCircle className="text-green-500 shrink-0" />{s}</div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h4 className="font-semibold text-gray-600 text-xs uppercase mb-2">Account Details</h4>
            <div className="space-y-2 text-xs">
              {[['Users', c.users], ['Devices', c.devices], ['SLA Target', `${c.sla}%`], ['Account Mgr', c.am], ['Contract End', c.contract_end]].map(([k,v]) => (
                <div key={k} className="flex justify-between"><span className="text-gray-400">{k}</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-700 to-violet-600 shadow-lg">
            <FiGrid className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">MSP Client Portal</h1>
            <p className="text-sm text-gray-500">Multi-tenant managed service provider — single pane of glass</p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
          <FiRefreshCw /> Sync All
        </button>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-5">
        {[
          { label: 'Total MRR',     value: `$${(totalMRR/1000).toFixed(0)}K`,    icon: FiDollarSign, c: 'border-indigo-400', t: 'text-indigo-700' },
          { label: 'Total Clients', value: CLIENTS.length,                        icon: FiGrid,       c: 'border-blue-400',   t: 'text-blue-700' },
          { label: 'Total Users',   value: totalUsers,                             icon: FiUsers,      c: 'border-teal-400',   t: 'text-teal-700' },
          { label: 'Open Tickets',  value: totalTickets,                           icon: FiActivity,   c: 'border-orange-400', t: 'text-orange-700' },
          { label: 'Avg CSAT',      value: `${avgCSAT}★`,                         icon: FiStar,       c: 'border-yellow-400', t: 'text-yellow-700' },
        ].map(k => { const KIcon = k.icon; return (
          <div key={k.label} className={`rounded-2xl border-l-4 ${k.c} bg-white p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500">{k.label}</p><p className={`text-2xl font-extrabold mt-0.5 ${k.t}`}>{k.value}</p></div>
              <KIcon className={`text-2xl ${k.t} opacity-60`} />
            </div>
          </div>
        )})}
      </div>

      {/* Alerts Banner */}
      {CLIENTS.some(c => c.alerts.length > 0) && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3">
          <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-2"><FiAlertCircle /> Active Client Alerts</p>
          <div className="space-y-1">
            {CLIENTS.filter(c => c.alerts.length > 0).map(c => c.alerts.map((a,i) => (
              <div key={`${c.id}-${i}`} className="flex items-center gap-2 text-xs text-red-700">
                <span className="font-bold">[{c.name}]</span> {a}
              </div>
            )))}
          </div>
        </div>
      )}

      <div className={client ? 'grid gap-5 lg:grid-cols-[1fr_420px]' : ''}>
        <div>
          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input placeholder="Search clients…" value={query} onChange={e => setQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div className="flex gap-1">
              {['all','enterprise','business','starter'].map(t => (
                <button key={t} onClick={() => setTier(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tierFilter===t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {['all','healthy','warning','critical'].map(h => (
                <button key={h} onClick={() => setHealth(h)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${healthFilter===h ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {h === 'all' ? 'All' : HEALTH_CFG[h].label}
                </button>
              ))}
            </div>
          </div>

          {/* Client Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(c => {
              const hCfg = HEALTH_CFG[c.health]
              const tierCfg = CLIENT_TIERS[c.tier]
              return (
                <div key={c.id} onClick={() => setSelected(c.id === selected ? null : c.id)}
                  className={`rounded-2xl border-2 bg-white p-4 cursor-pointer transition-all hover:shadow-md ${c.id === selected ? 'border-indigo-500 shadow-md' : `hover:border-indigo-300 ${c.health === 'critical' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-sm shrink-0 ring-2 ring-offset-1 ${hCfg.ring}`} style={{ background: c.color }}>
                        {c.logo}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{c.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${tierCfg.color}`}>{tierCfg.label}</span>
                          {c.alerts.length > 0 && <span className="text-xs text-red-500 font-bold">⚠ {c.alerts.length}</span>}
                        </div>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium shrink-0 ${hCfg.text}`}>
                      <span className={`h-2 w-2 rounded-full ${hCfg.dot} ${c.health !== 'healthy' ? 'animate-pulse' : ''}`} />
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600 mb-3">
                    <span>{c.users} users</span>
                    <span className="font-bold text-indigo-700">${(c.mrr/1000).toFixed(1)}K MRR</span>
                    <span className={`font-semibold ${c.open_tickets > 10 ? 'text-red-600' : 'text-gray-600'}`}>{c.open_tickets} tickets</span>
                    <span className={`font-semibold ${c.csat >= 4.5 ? 'text-green-600' : c.csat >= 4 ? 'text-yellow-600' : 'text-red-600'}`}>{c.csat}★ CSAT</span>
                  </div>

                  <MiniLine data={c.monthly_trend} color={c.color} />
                </div>
              )
            })}
          </div>

          {/* Cross-client comparison */}
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Cross-Client Comparison</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={CROSS_CLIENT_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="client" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="l" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="r" orientation="right" domain={[3,5]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="l" dataKey="tickets" name="Tickets" radius={[4,4,0,0]}>
                  {CROSS_CLIENT_DATA.map((d,i) => <Cell key={i} fill={CLIENTS[i]?.color || '#6366f1'} />)}
                </Bar>
                <Line yAxisId="r" type="monotone" dataKey="csat" name="CSAT" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detail Panel */}
        {client && <ClientDetail c={client} />}
      </div>
    </div>
  )
}
