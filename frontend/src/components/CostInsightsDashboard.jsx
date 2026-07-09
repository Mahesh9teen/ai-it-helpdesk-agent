import { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import {
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiAlertTriangle,
  FiPackage, FiMonitor, FiCloud, FiUsers, FiBarChart2,
  FiChevronRight, FiDownload, FiCalendar
} from 'react-icons/fi'

/* ── Cost Data ── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul']

const MONTHLY_SPEND = [
  { month: 'Jan', cloud: 18400, saas: 12200, hardware: 4500, support: 6800, telecom: 2100 },
  { month: 'Feb', cloud: 19200, saas: 12200, hardware: 1200, support: 6800, telecom: 2100 },
  { month: 'Mar', cloud: 21500, saas: 13400, hardware: 8900, support: 7200, telecom: 2300 },
  { month: 'Apr', cloud: 20800, saas: 13400, hardware: 2100, support: 7200, telecom: 2200 },
  { month: 'May', cloud: 22100, saas: 14600, hardware: 3300, support: 7600, telecom: 2400 },
  { month: 'Jun', cloud: 23600, saas: 14600, hardware: 5400, support: 7600, telecom: 2500 },
  { month: 'Jul', cloud: 25100, saas: 15800, hardware: 2200, support: 8100, telecom: 2600 },
]

const DEPT_COST = [
  { dept: 'Engineering',  it_cost: 42800, users: 28, cost_per_user: 1529 },
  { dept: 'Marketing',    it_cost: 18600, users: 15, cost_per_user: 1240 },
  { dept: 'Finance',      it_cost: 14200, users: 12, cost_per_user: 1183 },
  { dept: 'Operations',   it_cost: 21500, users: 18, cost_per_user: 1194 },
  { dept: 'HR',           it_cost:  9800, users: 9,  cost_per_user: 1089 },
  { dept: 'Product',      it_cost: 16400, users: 14, cost_per_user: 1171 },
  { dept: 'Sales',        it_cost: 19200, users: 16, cost_per_user: 1200 },
]

const LICENSE_UTILIZATION = [
  { name: 'Microsoft 365',    licensed: 120, active: 112, unused: 8,  cost_seat: 22,  total: 2640 },
  { name: 'Salesforce',       licensed: 45,  active: 38,  unused: 7,  cost_seat: 150, total: 6750 },
  { name: 'Adobe CC',         licensed: 30,  active: 18,  unused: 12, cost_seat: 60,  total: 1800 },
  { name: 'Zoom',             licensed: 80,  active: 71,  unused: 9,  cost_seat: 15,  total: 1200 },
  { name: 'GitHub Enterprise',licensed: 35,  active: 34,  unused: 1,  cost_seat: 21,  total: 735  },
  { name: 'Datadog',          licensed: 50,  active: 50,  unused: 0,  cost_seat: 23,  total: 1150 },
  { name: 'Jira/Confluence',  licensed: 90,  active: 78,  unused: 12, cost_seat: 8.15,total: 734  },
  { name: '1Password Teams',  licensed: 120, active: 95,  unused: 25, cost_seat: 4,   total: 480  },
]

const CATEGORY_PIE = [
  { name: 'Cloud Infra',  value: 25100, color: '#6366f1' },
  { name: 'SaaS',         value: 15800, color: '#06b6d4' },
  { name: 'Support',      value: 8100,  color: '#10b981' },
  { name: 'Hardware',     value: 2200,  color: '#f59e0b' },
  { name: 'Telecom',      value: 2600,  color: '#8b5cf6' },
]

const CLOUD_BREAKDOWN = [
  { service: 'Azure Compute',    cost: 9800, trend: 12 },
  { service: 'Azure Storage',    cost: 3200, trend: -3 },
  { service: 'Azure Networking', cost: 2100, trend: 8 },
  { service: 'Azure SQL',        cost: 4800, trend: 5 },
  { service: 'Azure Monitor',    cost: 1400, trend: 2 },
  { service: 'M365 Business',    cost: 3800, trend: 0 },
]

const fmt = (v) => v >= 1000 ? `$${(v/1000).toFixed(1)}K` : `$${v}`
const fmtFull = (v) => `$${v.toLocaleString()}`

const CATEGORY_COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899']

export default function CostInsightsDashboard() {
  const [period, setPeriod] = useState('Jul')
  const [tab,    setTab]    = useState('overview')

  const monthData = MONTHLY_SPEND.find(m => m.month === period) || MONTHLY_SPEND[MONTHLY_SPEND.length - 1]
  const totalThisMonth = Object.values(monthData).reduce((s, v) => typeof v === 'number' ? s + v : s, 0)
  const prevMonth = MONTHLY_SPEND[MONTHLY_SPEND.indexOf(monthData) - 1]
  const totalPrev = prevMonth ? Object.values(prevMonth).reduce((s, v) => typeof v === 'number' ? s + v : s, 0) : totalThisMonth
  const momChange = (((totalThisMonth - totalPrev) / totalPrev) * 100).toFixed(1)

  const unusedLicenseCost = LICENSE_UTILIZATION.reduce((s, l) => s + l.unused * l.cost_seat, 0)
  const totalAnnualRun = totalThisMonth * 12

  const TABS = [
    { id: 'overview',   label: '💰 Overview' },
    { id: 'dept',       label: '🏢 By Department' },
    { id: 'licenses',   label: '📦 License Utilization' },
    { id: 'cloud',      label: '☁ Cloud Breakdown' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Cost Insights Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">IT spend analytics, department chargebacks, and license optimisation</p>
        </div>
        <div className="flex gap-2 items-center">
          <FiCalendar className="text-gray-400" />
          <div className="flex gap-1 rounded-xl border border-gray-200 p-0.5 bg-gray-50">
            {MONTHS.map(m => (
              <button key={m} onClick={() => setPeriod(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === m ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>{m}</button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {[
          { label: `${period} Total Spend`,    value: fmtFull(totalThisMonth), icon: FiDollarSign, color: 'border-indigo-400', t: 'text-indigo-700',
            sub: `${momChange > 0 ? '+' : ''}${momChange}% vs ${prevMonth?.month || 'N/A'}` },
          { label: 'Annual Run Rate',           value: fmtFull(totalAnnualRun), icon: FiTrendingUp,  color: 'border-blue-400',   t: 'text-blue-700', sub: 'Projected' },
          { label: 'Wasted License Spend/mo',   value: fmtFull(unusedLicenseCost), icon: FiAlertTriangle, color: 'border-red-400', t: 'text-red-700', sub: 'Recoverable' },
          { label: 'Cost Per Employee',         value: `$${Math.round(totalThisMonth / 112)}`, icon: FiUsers, color: 'border-green-400', t: 'text-green-700', sub: '112 employees' },
        ].map(k => {
          const KIcon = k.icon
          return (
            <div key={k.label} className={`rounded-2xl border-l-4 ${k.color} bg-white p-4 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{k.label}</p>
                  <p className={`text-2xl font-extrabold mt-0.5 ${k.t}`}>{k.value}</p>
                  {k.sub && <p className={`text-xs mt-0.5 ${parseFloat(k.sub) > 0 ? 'text-red-500' : 'text-green-600'}`}>{k.sub}</p>}
                </div>
                <KIcon className={`text-2xl ${k.t} opacity-60`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-gray-200 p-1 mb-6 shadow-sm">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            {/* Stacked Spend Chart */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Monthly IT Spend Breakdown</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={MONTHLY_SPEND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v, n) => [fmtFull(v), n]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="cloud"    name="Cloud"    stackId="a" fill="#6366f1" />
                  <Bar dataKey="saas"     name="SaaS"     stackId="a" fill="#06b6d4" />
                  <Bar dataKey="hardware" name="Hardware" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="support"  name="Support"  stackId="a" fill="#10b981" />
                  <Bar dataKey="telecom"  name="Telecom"  stackId="a" fill="#8b5cf6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Spend Trend Line */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Cloud Spend Trend (7 Months)</h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={MONTHLY_SPEND}>
                  <defs>
                    <linearGradient id="gCloud" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [fmtFull(v), 'Cloud Spend']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="cloud" stroke="#6366f1" fill="url(#gCloud)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-5">
            {/* Category Pie */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-700 mb-3">This Month by Category</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={CATEGORY_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {CATEGORY_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmtFull(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {CATEGORY_PIE.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />{c.name}</span>
                    <span className="font-semibold">{fmtFull(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Opportunities */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2"><FiAlertTriangle /> Savings Opportunities</h3>
              <div className="space-y-3">
                {[
                  { title: 'Unused licenses', savings: unusedLicenseCost, note: `${LICENSE_UTILIZATION.reduce((s,l) => s+l.unused,0)} unused seats across ${LICENSE_UTILIZATION.filter(l=>l.unused>0).length} apps` },
                  { title: 'Azure right-sizing', savings: 2800, note: '3 over-provisioned VMs identified' },
                  { title: 'Consolidate vendors', savings: 1200, note: '2 overlapping collaboration tools' },
                ].map(s => (
                  <div key={s.title} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-amber-900">{s.title}</p>
                      <p className="text-xs text-amber-700">{s.note}</p>
                    </div>
                    <p className="text-sm font-bold text-green-700 shrink-0">{fmtFull(s.savings)}/mo</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BY DEPARTMENT ── */}
      {tab === 'dept' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-4">IT Cost by Department (Monthly)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={DEPT_COST} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="dept" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v, n) => [fmtFull(v), n]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="it_cost" name="Monthly IT Cost" fill="#6366f1" radius={[0,4,4,0]}>
                  {DEPT_COST.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['Department','Monthly IT Cost','# Users','Cost / User','YTD Total'].map(h =>
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody>
                {[...DEPT_COST].sort((a,b) => b.it_cost - a.it_cost).map((d, i) => (
                  <tr key={d.dept} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{d.dept}</td>
                    <td className="px-4 py-3 font-bold text-indigo-700">{fmtFull(d.it_cost)}</td>
                    <td className="px-4 py-3 text-gray-600">{d.users}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${d.cost_per_user > 1300 ? 'text-red-600' : 'text-green-700'}`}>
                        ${d.cost_per_user.toFixed(0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fmtFull(d.it_cost * 7)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── LICENSES ── */}
      {tab === 'licenses' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-sm text-red-800">
            <FiAlertTriangle className="shrink-0 text-xl" />
            <span>You have <strong>{LICENSE_UTILIZATION.reduce((s,l)=>s+l.unused,0)} unused license seats</strong> costing approximately <strong>{fmtFull(unusedLicenseCost)}/month</strong> ({fmtFull(unusedLicenseCost*12)}/year). Consider downgrading or reassigning.</span>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['Product','Licensed','Active','Unused','Utilization','Cost/Seat','Monthly Cost','Action'].map(h =>
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody>
                {LICENSE_UTILIZATION.map(l => {
                  const util = Math.round((l.active / l.licensed) * 100)
                  const wastedCost = l.unused * l.cost_seat
                  return (
                    <tr key={l.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-semibold">{l.name}</td>
                      <td className="px-3 py-2.5 text-gray-600">{l.licensed}</td>
                      <td className="px-3 py-2.5 text-green-700 font-medium">{l.active}</td>
                      <td className="px-3 py-2.5">
                        <span className={`font-bold ${l.unused > 5 ? 'text-red-600' : l.unused > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{l.unused}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-gray-100">
                            <div className="h-2 rounded-full" style={{ width: `${util}%`, background: util >= 90 ? '#10b981' : util >= 70 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span className="text-xs font-medium">{util}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">${l.cost_seat}/mo</td>
                      <td className="px-3 py-2.5 font-semibold">{fmtFull(l.total)}</td>
                      <td className="px-3 py-2.5">
                        {l.unused > 0 ? (
                          <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                            Review <FiChevronRight />
                          </button>
                        ) : <span className="text-xs text-green-600">Optimised ✓</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CLOUD BREAKDOWN ── */}
      {tab === 'cloud' && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CLOUD_BREAKDOWN.map(s => (
              <div key={s.service} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-semibold text-gray-800 text-sm">{s.service}</p>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.trend > 0 ? 'text-red-600' : s.trend < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    {s.trend > 0 ? <FiTrendingUp /> : s.trend < 0 ? <FiTrendingDown /> : null}
                    {s.trend !== 0 ? `${s.trend > 0 ? '+' : ''}${s.trend}%` : '—'}
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-indigo-700">{fmtFull(s.cost)}</p>
                <p className="text-xs text-gray-400 mt-0.5">this month</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Cloud Service Cost Comparison</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CLOUD_BREAKDOWN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="service" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(1)}K`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [fmtFull(v), 'Cost']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="cost" name="Monthly Cost" radius={[4,4,0,0]}>
                  {CLOUD_BREAKDOWN.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
