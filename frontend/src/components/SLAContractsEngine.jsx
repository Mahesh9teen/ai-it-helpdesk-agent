import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, ReferenceLine
} from 'recharts'
import {
  FiFileText, FiAlertCircle, FiCheckCircle, FiClock,
  FiPlus, FiSearch, FiChevronRight, FiAlertTriangle,
  FiUser, FiDollarSign, FiCalendar, FiTrendingUp, FiX
} from 'react-icons/fi'

/* ─── SLA Contract Data ─── */
const TIERS = [
  { id: 'platinum', label: 'Platinum', p1: 1,  p2: 4,  p3: 8,  p4: 24, price: 18000, color: '#8b5cf6' },
  { id: 'gold',     label: 'Gold',     p1: 2,  p2: 8,  p3: 16, p4: 48, price: 10500, color: '#f59e0b' },
  { id: 'silver',   label: 'Silver',   p1: 4,  p2: 12, p3: 24, p4: 72, price: 6200,  color: '#6b7280' },
  { id: 'bronze',   label: 'Bronze',   p1: 8,  p2: 24, p3: 48, p4: 96, price: 3000,  color: '#b45309' },
]

const CONTRACTS = [
  {
    id: 'SLA-001', client: 'Apex Financial Group', tier: 'platinum', status: 'active',
    start: '2026-01-01', end: '2027-06-30', value: 216000, am: 'Sarah Mitchell',
    ola: ['L1 to L2: 30m', 'L2 to L3: 2h', 'Vendor Escalation: 4h'],
    penalties: { enabled: true, p1_credit: 10, p2_credit: 5, max_credit: 15 },
    ytd_breaches: 0, ytd_credits: 0, csat: 4.9,
    monthly_perf: [99.98, 100, 99.97, 100, 99.99, 100, 100],
  },
  {
    id: 'SLA-002', client: 'Meridian Healthcare', tier: 'gold', status: 'active',
    start: '2026-01-01', end: '2026-12-31', value: 126000, am: 'Chen Wei',
    ola: ['L1 to L2: 1h', 'L2 to L3: 4h', 'Vendor Escalation: 8h'],
    penalties: { enabled: true, p1_credit: 8, p2_credit: 3, max_credit: 12 },
    ytd_breaches: 3, ytd_credits: 2400, csat: 4.3,
    monthly_perf: [99.8, 99.9, 99.5, 100, 99.7, 98.9, 99.2],
  },
  {
    id: 'SLA-003', client: 'Nexus Retail Chain', tier: 'gold', status: 'active',
    start: '2026-04-01', end: '2027-03-31', value: 75600, am: 'Jay Patel',
    ola: ['L1 to L2: 1h', 'L2 to L3: 4h'],
    penalties: { enabled: false, p1_credit: 0, p2_credit: 0, max_credit: 0 },
    ytd_breaches: 1, ytd_credits: 0, csat: 4.7,
    monthly_perf: [100, 99.9, 99.95, 100, 99.8, 99.9, 100],
  },
  {
    id: 'SLA-004', client: 'Sigma Law Partners', tier: 'silver', status: 'at_risk',
    start: '2026-01-01', end: '2026-09-30', value: 43200, am: 'Emma Clarke',
    ola: ['L1 to L2: 2h', 'L2 to L3: 8h'],
    penalties: { enabled: true, p1_credit: 5, p2_credit: 2, max_credit: 10 },
    ytd_breaches: 8, ytd_credits: 6800, csat: 3.1,
    monthly_perf: [99.2, 98.8, 99.0, 98.2, 97.5, 96.8, 95.9],
  },
  {
    id: 'SLA-005', client: 'Vantage Logistics', tier: 'platinum', status: 'active',
    start: '2025-02-01', end: '2028-01-31', value: 265200, am: 'Alex Rodriguez',
    ola: ['L1 to L2: 30m', 'L2 to L3: 1h', 'Vendor Escalation: 2h'],
    penalties: { enabled: true, p1_credit: 15, p2_credit: 8, max_credit: 20 },
    ytd_breaches: 0, ytd_credits: 0, csat: 4.8,
    monthly_perf: [100, 100, 100, 99.99, 100, 100, 100],
  },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

const statusCfg = {
  active:  { label: 'Active',  color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  at_risk: { label: 'At Risk', color: 'bg-red-100 text-red-800',     dot: 'bg-red-500 animate-pulse' },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700',   dot: 'bg-gray-400' },
}

export default function SLAContractsEngine() {
  const [selected, setSelected]  = useState(null)
  const [query,    setQuery]     = useState('')
  const [tab,      setTab]       = useState('contracts')

  const contract = selected ? CONTRACTS.find(c => c.id === selected) : null
  const filtered = CONTRACTS.filter(c =>
    !query || c.client.toLowerCase().includes(query.toLowerCase()) || c.id.toLowerCase().includes(query.toLowerCase())
  )

  const totalARR      = CONTRACTS.reduce((s,c) => s + c.value, 0)
  const totalCredits  = CONTRACTS.reduce((s,c) => s + c.ytd_credits, 0)
  const totalBreaches = CONTRACTS.reduce((s,c) => s + c.ytd_breaches, 0)
  const atRiskCount   = CONTRACTS.filter(c => c.status === 'at_risk').length

  /* SLA breach history for bar chart */
  const breachData = CONTRACTS.map(c => ({
    client: c.client.split(' ')[0],
    breaches: c.ytd_breaches,
    credits: c.ytd_credits / 1000,
    color: c.status === 'at_risk' ? '#ef4444' : '#6366f1',
  }))

  /* Tier comparison table data */
  const tierData = TIERS.map(t => ({
    tier: t.label,
    p1: t.p1, p2: t.p2, p3: t.p3, p4: t.p4,
    price: t.price, color: t.color,
  }))

  const TABS = [
    { id: 'contracts',   label: '📋 Contracts' },
    { id: 'performance', label: '📊 Performance' },
    { id: 'tiers',       label: '🏆 Tier Definitions' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 shadow-lg">
            <FiFileText className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">SLA Contracts Engine</h1>
            <p className="text-sm text-gray-500">Multi-tier SLA management · OLA chains · penalty tracking</p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-white font-semibold hover:bg-orange-700">
          <FiPlus /> New Contract
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {[
          { label: 'Total ARR', value: `$${(totalARR/1000).toFixed(0)}K`, icon: FiDollarSign, c: 'border-orange-400', t: 'text-orange-700' },
          { label: 'YTD Breaches', value: totalBreaches, icon: FiAlertTriangle, c: 'border-red-400', t: 'text-red-700' },
          { label: 'YTD Credits Issued', value: `$${(totalCredits/1000).toFixed(1)}K`, icon: FiTrendingUp, c: 'border-yellow-400', t: 'text-yellow-700' },
          { label: 'At-Risk Contracts', value: atRiskCount, icon: FiAlertCircle, c: 'border-purple-400', t: 'text-purple-700' },
        ].map(k => { const KIcon = k.icon; return (
          <div key={k.label} className={`rounded-2xl border-l-4 ${k.c} bg-white p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500">{k.label}</p><p className={`text-2xl font-extrabold mt-0.5 ${k.t}`}>{k.value}</p></div>
              <KIcon className={`text-2xl ${k.t} opacity-60`} />
            </div>
          </div>
        )})}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-gray-200 p-1 mb-6 shadow-sm">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${tab===t.id ? 'bg-orange-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CONTRACTS ── */}
      {tab === 'contracts' && (
        <div className={`${contract ? 'grid gap-5 lg:grid-cols-[1fr_380px]' : ''}`}>
          <div>
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input placeholder="Search contracts…" value={query} onChange={e => setQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div className="space-y-3">
              {filtered.map(c => {
                const tier = TIERS.find(t => t.id === c.tier)
                const sCfg = statusCfg[c.status]
                const avgPerf = (c.monthly_perf.reduce((s,v) => s+v, 0) / c.monthly_perf.length).toFixed(2)
                return (
                  <div key={c.id} onClick={() => setSelected(c.id === selected ? null : c.id)}
                    className={`rounded-2xl border-2 bg-white p-4 cursor-pointer transition-all hover:shadow-md ${c.id === selected ? 'border-orange-500 shadow-md' : c.status === 'at_risk' ? 'border-red-200 bg-red-50/20' : 'border-gray-200 hover:border-orange-300'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold">{c.client}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{background: tier?.color}}>{tier?.label}</span>
                          <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${sCfg.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
                          </span>
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
                          <span>{c.id}</span>
                          <span>${(c.value/12/1000).toFixed(1)}K MRR</span>
                          <span>Ends {c.end}</span>
                          <span>{c.am}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">Avg SLA</p>
                        <p className={`text-xl font-extrabold ${parseFloat(avgPerf) >= 99.9 ? 'text-green-600' : parseFloat(avgPerf) >= 99 ? 'text-yellow-600' : 'text-red-600'}`}>{avgPerf}%</p>
                        {c.ytd_credits > 0 && <p className="text-xs text-red-500 font-medium">${c.ytd_credits.toLocaleString()} credits</p>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Contract Detail */}
          {contract && (() => {
            const tier = TIERS.find(t => t.id === contract.tier)
            const perfData = MONTHS.map((m, i) => ({ month: m, sla: contract.monthly_perf[i] }))
            const target = tier?.id === 'platinum' ? 99.9 : tier?.id === 'gold' ? 99.5 : 99.0
            return (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 h-fit">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-lg">{contract.client}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{background: tier?.color}}>{tier?.label}</span>
                      <span className="text-xs text-gray-400">{contract.id}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)}><FiX className="text-gray-400" /></button>
                </div>

                {/* SLA Trend */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Monthly SLA Compliance (%)</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={perfData}>
                      <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                      <YAxis domain={[95, 100]} tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} formatter={(v) => [`${v}%`,'']} />
                      <Line type="monotone" dataKey="sla" stroke="#f97316" strokeWidth={2} dot={{ r: 2 }} />
                      <ReferenceLine y={target} stroke="#ef4444" strokeDasharray="3 2" />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-400 mt-1">Red line = SLA target ({target}%)</p>
                </div>

                {/* SLA Targets */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Response Time Targets</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[['P1 Critical', tier?.p1 + 'h'],['P2 High', tier?.p2 + 'h'],['P3 Medium', tier?.p3 + 'h'],['P4 Low', tier?.p4 + 'h']].map(([l,v]) => (
                      <div key={l} className="rounded-lg bg-gray-50 border border-gray-200 p-2 text-center">
                        <p className="text-xs text-gray-400">{l}</p>
                        <p className="font-extrabold text-orange-700">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* OLA Chain */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">OLA Chain</p>
                  <div className="space-y-1.5">
                    {contract.ola.map((o,i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-700 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
                        <FiChevronRight className="text-blue-500 shrink-0" />{o}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Penalties */}
                {contract.penalties.enabled && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs">
                    <p className="font-semibold text-red-800 mb-1">Penalty Clauses Active</p>
                    <div className="space-y-1 text-red-700">
                      <p>P1 breach: {contract.penalties.p1_credit}% monthly credit</p>
                      <p>P2 breach: {contract.penalties.p2_credit}% monthly credit</p>
                      <p>Max credit cap: {contract.penalties.max_credit}%</p>
                      <p className="font-bold mt-1">YTD credits issued: ${contract.ytd_credits.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* ── PERFORMANCE ── */}
      {tab === 'performance' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-4">SLA Breaches & Credits by Client</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={breachData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="client" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="l" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} unit="K" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar yAxisId="l" dataKey="breaches" name="Breaches" radius={[4,4,0,0]}>
                  {breachData.map((d,i) => <Cell key={i} fill={d.color} />)}
                </Bar>
                <Bar yAxisId="r" dataKey="credits" name="Credits ($K)" fill="#f59e0b" radius={[4,4,0,0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Client','Tier','Avg SLA','YTD Breaches','YTD Credits','CSAT','Renewal Risk'].map(h =>
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody>
                {CONTRACTS.map(c => {
                  const tier = TIERS.find(t => t.id === c.tier)
                  const avg = (c.monthly_perf.reduce((s,v) => s+v, 0) / c.monthly_perf.length).toFixed(2)
                  const renewalRisk = c.status === 'at_risk' ? '🔴 High' : c.csat >= 4.5 ? '🟢 Low' : '🟡 Medium'
                  return (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium">{c.client}</td>
                      <td className="px-3 py-2.5"><span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{background:tier?.color}}>{tier?.label}</span></td>
                      <td className={`px-3 py-2.5 font-bold ${parseFloat(avg)>=99.9?'text-green-600':parseFloat(avg)>=99?'text-yellow-600':'text-red-600'}`}>{avg}%</td>
                      <td className="px-3 py-2.5"><span className={`font-bold ${c.ytd_breaches > 5 ? 'text-red-600' : c.ytd_breaches > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{c.ytd_breaches}</span></td>
                      <td className="px-3 py-2.5">{c.ytd_credits > 0 ? <span className="text-red-600 font-medium">${c.ytd_credits.toLocaleString()}</span> : <span className="text-green-600">$0</span>}</td>
                      <td className="px-3 py-2.5 font-bold">{c.csat}★</td>
                      <td className="px-3 py-2.5 text-xs">{renewalRisk}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TIERS ── */}
      {tab === 'tiers' && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Tier','P1 Response','P2 Response','P3 Response','P4 Response','Monthly Price','Penalty Eligible'].map(h =>
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody>
              {TIERS.map(t => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><span className="text-sm font-extrabold px-2.5 py-1 rounded-lg text-white" style={{background:t.color}}>{t.label}</span></td>
                  <td className="px-4 py-3 font-bold text-red-700">{t.p1}h</td>
                  <td className="px-4 py-3 font-bold text-orange-700">{t.p2}h</td>
                  <td className="px-4 py-3 font-bold text-yellow-700">{t.p3}h</td>
                  <td className="px-4 py-3 font-bold text-green-700">{t.p4}h</td>
                  <td className="px-4 py-3 font-bold text-indigo-700">${t.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs">{t.id !== 'bronze' ? '✅ Yes' : '❌ No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
