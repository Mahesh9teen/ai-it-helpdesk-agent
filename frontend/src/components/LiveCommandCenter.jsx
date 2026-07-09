import { useState, useEffect, useRef } from 'react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  FiActivity, FiAlertCircle, FiCheckCircle, FiClock, FiRefreshCw,
  FiUsers, FiTrendingUp, FiTrendingDown, FiZap, FiRadio,
  FiCircle, FiAlertTriangle, FiArrowUp, FiArrowDown, FiMinus
} from 'react-icons/fi'

/* ── Simulate live data ── */
const randomBetween = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a

const generateTicketFeed = () => [
  { id: `TKT-${randomBetween(2000,2999)}`, title: 'VPN disconnecting every 30 min',    priority: 'high',     status: 'open',        agent: 'Sarah M.',  time: 'just now',  category: 'Network' },
  { id: `TKT-${randomBetween(2000,2999)}`, title: 'Outlook crashes on Windows 11',     priority: 'medium',   status: 'in_progress', agent: 'Chen W.',   time: '1m ago',    category: 'Software' },
  { id: `TKT-${randomBetween(2000,2999)}`, title: 'Cannot print to Floor-2 printer',   priority: 'low',      status: 'open',        agent: 'Unassigned',time: '2m ago',    category: 'Hardware' },
  { id: `TKT-${randomBetween(2000,2999)}`, title: 'MFA setup for new employee',        priority: 'medium',   status: 'resolved',    agent: 'Jay P.',    time: '3m ago',    category: 'Security' },
  { id: `TKT-${randomBetween(2000,2999)}`, title: 'SharePoint permissions error',      priority: 'high',     status: 'open',        agent: 'Emma C.',   time: '4m ago',    category: 'Access' },
  { id: `TKT-${randomBetween(2000,2999)}`, title: 'New laptop request – design team',  priority: 'medium',   status: 'pending',     agent: 'Alex R.',   time: '5m ago',    category: 'Hardware' },
  { id: `TKT-${randomBetween(2000,2999)}`, title: 'Phishing email received from ext.', priority: 'critical', status: 'open',        agent: 'Sarah M.',  time: '6m ago',    category: 'Security' },
  { id: `TKT-${randomBetween(2000,2999)}`, title: 'Zoom audio not working on Mac',     priority: 'low',      status: 'in_progress', agent: 'Jay P.',    time: '7m ago',    category: 'Software' },
]

const generateTrendData = () => {
  const hours = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','now']
  return hours.map((h, i) => ({
    time: h,
    opened:   randomBetween(5 + i, 18 + i),
    resolved: randomBetween(4 + i, 15 + i),
    escalated: randomBetween(0, 4),
  }))
}

const generateAgents = () => [
  { name: 'Sarah Mitchell', avatar: 'SM', status: 'available', tickets: randomBetween(4,9),  satisfaction: randomBetween(87,99), dept: 'L2 Support' },
  { name: 'Chen Wei',       avatar: 'CW', status: 'busy',      tickets: randomBetween(6,12), satisfaction: randomBetween(85,98), dept: 'L2 Support' },
  { name: 'Jay Patel',      avatar: 'JP', status: 'available', tickets: randomBetween(3,8),  satisfaction: randomBetween(88,99), dept: 'L1 Support' },
  { name: 'Emma Clarke',    avatar: 'EC', status: 'on_break',  tickets: randomBetween(2,6),  satisfaction: randomBetween(82,96), dept: 'L1 Support' },
  { name: 'Alex Rodriguez', avatar: 'AR', status: 'available', tickets: randomBetween(5,10), satisfaction: randomBetween(86,98), dept: 'L3 Support' },
  { name: 'Priya Sharma',   avatar: 'PS', status: 'offline',   tickets: 0,                   satisfaction: randomBetween(80,95), dept: 'L1 Support' },
]

const generateKpis = () => ({
  open:      randomBetween(28, 45),
  resolved:  randomBetween(60, 95),
  critical:  randomBetween(1, 5),
  avgResp:   (Math.random() * 2 + 0.5).toFixed(1),
  slaOk:     randomBetween(88, 99),
  backlog:   randomBetween(8, 22),
  csat:      (Math.random() * 0.8 + 4.1).toFixed(1),
  throughput:randomBetween(5, 18),
})

const CATEGORY_COLORS = ['#6366f1','#06b6d4','#f59e0b','#10b981','#ef4444','#8b5cf6']
const CATEGORIES_DATA = [
  { name: 'Hardware', value: 28 }, { name: 'Software', value: 22 },
  { name: 'Network',  value: 19 }, { name: 'Account',  value: 15 },
  { name: 'Security', value: 10 }, { name: 'Other',    value: 6  },
]

const agentStatusCfg = {
  available: { label: 'Available', color: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50' },
  busy:      { label: 'Busy',      color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  on_break:  { label: 'Break',     color: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50' },
  offline:   { label: 'Offline',   color: 'bg-gray-400',   text: 'text-gray-500',   bg: 'bg-gray-50' },
}
const priorityCfg = {
  critical: 'bg-red-600 text-white',
  high:     'bg-red-100 text-red-800',
  medium:   'bg-yellow-100 text-yellow-800',
  low:      'bg-green-100 text-green-800',
}

/* ─── KPI Card ─── */
const KpiCard = ({ label, value, sub, icon: Icon, color, trend }) => (
  <div className={`rounded-2xl border-l-4 ${color} bg-white p-4 shadow-sm`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="mt-1 text-3xl font-extrabold text-gray-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.replace('border-','bg-').split(' ')[0]}/10`}>
        <Icon className={`text-xl ${color.includes('indigo') ? 'text-indigo-600' : color.includes('green') ? 'text-green-600' : color.includes('red') ? 'text-red-600' : color.includes('yellow') ? 'text-yellow-600' : 'text-blue-600'}`} />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-500'}`}>
        {trend > 0 ? <FiArrowUp /> : trend < 0 ? <FiArrowDown /> : <FiMinus />}
        <span>{Math.abs(trend)}% vs last hour</span>
      </div>
    )}
  </div>
)

/* ─────────── MAIN COMPONENT ─────────── */
export default function LiveCommandCenter() {
  const [kpis,    setKpis]    = useState(generateKpis)
  const [trend,   setTrend]   = useState(generateTrendData)
  const [agents,  setAgents]  = useState(generateAgents)
  const [feed,    setFeed]    = useState(generateTicketFeed)
  const [tick,    setTick]    = useState(0)
  const [paused,  setPaused]  = useState(false)
  const [pulse,   setPulse]   = useState(false)
  const intervalRef = useRef(null)

  const refresh = () => {
    setKpis(generateKpis())
    setTrend(generateTrendData())
    setAgents(generateAgents())
    setFeed(generateTicketFeed())
    setPulse(true)
    setTimeout(() => setPulse(false), 600)
    setTick(t => t + 1)
  }

  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(refresh, 5000)
    }
    return () => clearInterval(intervalRef.current)
  }, [paused])

  const SLA_DATA = [{ name: 'SLA', value: kpis.slaOk, fill: kpis.slaOk >= 95 ? '#10b981' : kpis.slaOk >= 80 ? '#f59e0b' : '#ef4444' }]

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 ${pulse ? 'ring-4 ring-indigo-400/50' : ''} transition-all`}>
            <FiRadio className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Live Command Center</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${paused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
              {paused ? 'Paused' : 'Live · Refreshing every 5s'} · Refresh #{tick}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPaused(p => !p)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${paused ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 hover:bg-slate-600'}`}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button onClick={refresh} className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600 transition-colors">
            <FiRefreshCw className={pulse ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4 lg:grid-cols-8">
        {[
          { label: 'Open', value: kpis.open, icon: FiAlertCircle, color: 'border-orange-500', trend: 5 },
          { label: 'Resolved Today', value: kpis.resolved, icon: FiCheckCircle, color: 'border-green-500', trend: -8 },
          { label: 'Critical', value: kpis.critical, icon: FiZap, color: 'border-red-500', trend: 0 },
          { label: 'Avg Response', value: `${kpis.avgResp}h`, icon: FiClock, color: 'border-blue-500', trend: 3 },
          { label: 'SLA %', value: `${kpis.slaOk}%`, icon: FiTrendingUp, color: 'border-indigo-500', trend: -2 },
          { label: 'Backlog', value: kpis.backlog, icon: FiActivity, color: 'border-yellow-500', trend: 12 },
          { label: 'CSAT', value: `${kpis.csat}★`, icon: FiCheckCircle, color: 'border-pink-500', trend: 0 },
          { label: 'Throughput/hr', value: kpis.throughput, icon: FiTrendingUp, color: 'border-teal-500', trend: -4 },
        ].map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 mb-6 lg:grid-cols-[2fr_1fr_1fr]">
        {/* Ticket Volume Trend */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Ticket Volume — Today</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gOpened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Area type="monotone" dataKey="opened"   name="Opened"   stroke="#6366f1" fill="url(#gOpened)"  strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" fill="url(#gResolved)" strokeWidth={2} />
              <Line  type="monotone" dataKey="escalated" name="Escalated" stroke="#ef4444" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Donut */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Tickets by Category</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CATEGORIES_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {CATEGORIES_DATA.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
            {CATEGORIES_DATA.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[i] }} />
                {c.name} {c.value}%
              </div>
            ))}
          </div>
        </div>

        {/* SLA Radial */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">SLA Compliance</h3>
          <ResponsiveContainer width="100%" height={160}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="85%" startAngle={90} endAngle={-270} data={SLA_DATA}>
              <RadialBar background={{ fill: '#1e293b' }} dataKey="value" cornerRadius={8} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-20">
            <p className="text-4xl font-extrabold" style={{ color: SLA_DATA[0].fill }}>{kpis.slaOk}%</p>
            <p className="text-xs text-slate-400 mt-1">SLA Compliance</p>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-2 text-center text-xs">
            {[['P1', '4h'], ['P2', '8h'], ['P3', '24h']].map(([p, t]) => (
              <div key={p} className="rounded-lg bg-slate-700 py-1.5">
                <p className="font-semibold text-white">{p}</p>
                <p className="text-slate-400">{t} target</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Agents + Live Feed */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        {/* Agent Presence */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Agent Presence</h3>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1 text-green-400"><FiCircle className="text-[8px]" /> {agents.filter(a => a.status === 'available').length} Online</span>
              <span className="flex items-center gap-1 text-slate-500"><FiCircle className="text-[8px]" /> {agents.filter(a => a.status === 'offline').length} Offline</span>
            </div>
          </div>
          <div className="space-y-3">
            {agents.map(ag => {
              const s = agentStatusCfg[ag.status]
              return (
                <div key={ag.name} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0">
                      {ag.avatar}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-800 ${s.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-200 truncate">{ag.name}</p>
                      <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${s.text} ${s.bg}`}>{s.label}</span>
                    </div>
                    <div className="flex gap-3 mt-0.5 text-xs text-slate-400">
                      <span>{ag.tickets} tickets</span>
                      <span>{ag.satisfaction}% CSAT</span>
                      <span className="text-slate-600">{ag.dept}</span>
                    </div>
                    {ag.status !== 'offline' && (
                      <div className="mt-1 h-1 rounded-full bg-slate-700">
                        <div className="h-1 rounded-full bg-indigo-400 transition-all" style={{ width: `${Math.min((ag.tickets / 12) * 100, 100)}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Live Ticket Feed */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Live Ticket Feed</h3>
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> streaming
            </span>
          </div>
          <div className="space-y-2.5 overflow-y-auto" style={{ maxHeight: 360 }}>
            {feed.map((t, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-700/60 p-3 hover:bg-slate-700 transition-colors cursor-pointer">
                <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                  <span className={`text-xs font-bold rounded px-1.5 py-0.5 ${priorityCfg[t.priority]}`}>{t.priority.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-200 truncate">{t.title}</p>
                    <span className="text-xs text-slate-500 shrink-0">{t.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span className="font-mono">{t.id}</span>
                    <span>·</span>
                    <span className="rounded bg-slate-600 px-1.5 py-0.5 text-slate-300">{t.category}</span>
                    <span>·</span>
                    <span>{t.agent}</span>
                  </div>
                </div>
                <div className={`h-2 w-2 rounded-full mt-1 shrink-0 ${t.status === 'open' ? 'bg-blue-400 animate-pulse' : t.status === 'in_progress' ? 'bg-yellow-400' : 'bg-green-400'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
