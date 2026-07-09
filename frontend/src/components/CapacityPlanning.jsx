import { useState, useMemo } from 'react'
import {
  ComposedChart, Bar, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend, Cell
} from 'recharts'
import {
  FiUsers, FiTrendingUp, FiAlertTriangle, FiCheckCircle,
  FiPlus, FiMinus, FiCalendar, FiSliders, FiTarget,
  FiClock, FiBarChart2, FiRefreshCw
} from 'react-icons/fi'

/* ── Resource pools ── */
const ROLES = [
  { id: 'l1', label: 'L1 Support',    color: '#6366f1', headcount: 4, capacity_hrs: 160, cost_per_head: 4800  },
  { id: 'l2', label: 'L2 Support',    color: '#06b6d4', headcount: 3, capacity_hrs: 120, cost_per_head: 7200  },
  { id: 'l3', label: 'L3 Engineering',color: '#10b981', headcount: 2, capacity_hrs: 80,  cost_per_head: 10500 },
  { id: 'mgr', label: 'Management',   color: '#f59e0b', headcount: 1, capacity_hrs: 40,  cost_per_head: 14000 },
]

/* ── 12-month demand forecast ── */
const MONTHS = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul']
const generateDemand = () => MONTHS.map((m, i) => {
  const base = 750
  const trend = 1 + i * 0.025
  const seasonal = m === 'Nov' || m === 'Dec' ? 1.3 : m === 'Jan' ? 1.15 : 1.0
  const demand = Math.round(base * trend * seasonal)
  const capacity = ROLES.reduce((s, r) => s + r.capacity_hrs, 0)
  const utilization = Math.min(Math.round((demand / capacity) * 100), 130)
  return {
    month: m,
    demand,
    capacity,
    utilization,
    gap: demand - capacity,
    headcountNeeded: Math.ceil(demand / (capacity / ROLES.reduce((s,r)=>s+r.headcount,0))),
  }
})

const SKILL_GAPS = [
  { skill: 'Cybersecurity (EDR / SIEM)',  current: 60, required: 95, gap: 35, priority: 'critical' },
  { skill: 'Azure Cloud Administration',  current: 70, required: 90, gap: 20, priority: 'high'     },
  { skill: 'PowerShell Automation',       current: 75, required: 85, gap: 10, priority: 'medium'   },
  { skill: 'ITIL Practices',             current: 80, required: 90, gap: 10, priority: 'medium'   },
  { skill: 'Networking (Cisco/BGP)',      current: 65, required: 70, gap:  5, priority: 'low'      },
  { skill: 'DevOps / CI-CD',             current: 40, required: 75, gap: 35, priority: 'critical' },
]

const HIRING_PLAN = [
  { role: 'L1 Support Analyst',      type: 'hire',     startMonth: 'Aug', cost: 4800,  status: 'approved'  },
  { role: 'L2 Security Specialist',  type: 'hire',     startMonth: 'Sep', cost: 8200,  status: 'approved'  },
  { role: 'Azure Cloud Engineer',    type: 'hire',     startMonth: 'Nov', cost: 10500, status: 'pending'   },
  { role: 'L1 Support Analyst x2',   type: 'hire',     startMonth: 'Jan', cost: 9600,  status: 'proposed'  },
  { role: 'ITIL Training (all team)',type: 'training', startMonth: 'Aug', cost: 2400,  status: 'approved'  },
  { role: 'Azure Certs (L2 team)',   type: 'training', startMonth: 'Sep', cost: 3600,  status: 'approved'  },
  { role: 'DevOps Bootcamp (3 eng.)',type: 'training', startMonth: 'Oct', cost: 5400,  status: 'pending'   },
]

const priorityCfg = {
  critical: 'bg-red-100 text-red-800',
  high:     'bg-orange-100 text-orange-800',
  medium:   'bg-yellow-100 text-yellow-800',
  low:      'bg-green-100 text-green-800',
}

const statusCfg = {
  approved: { color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  pending:  { color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  proposed: { color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-400' },
}

export default function CapacityPlanning() {
  const [demandData] = useState(generateDemand)
  const [tab,        setTab]     = useState('overview')
  const [roles,      setRoles]   = useState(ROLES)
  const [scenario,   setScenario]= useState('baseline')

  const totalHeadcount = roles.reduce((s,r) => s + r.headcount, 0)
  const totalCapacity  = roles.reduce((s,r) => s + r.capacity_hrs, 0)
  const totalCost      = roles.reduce((s,r) => s + r.headcount * r.cost_per_head, 0)
  const peakDemand     = Math.max(...demandData.map(d => d.demand))
  const capacityGap    = peakDemand - totalCapacity
  const breachMonths   = demandData.filter(d => d.gap > 0).length

  const adjustHeadcount = (id, delta) =>
    setRoles(rs => rs.map(r => r.id === id ? { ...r, headcount: Math.max(0, r.headcount + delta), capacity_hrs: Math.max(0, r.headcount + delta) * 40 } : r))

  const SCENARIOS = [
    { id: 'baseline',   label: '📊 Baseline', multiplier: 1.0 },
    { id: 'growth15',   label: '📈 +15% Growth', multiplier: 1.15 },
    { id: 'growth30',   label: '🚀 +30% Growth', multiplier: 1.30 },
    { id: 'reduction',  label: '📉 −10% Reduction', multiplier: 0.9 },
  ]
  const sm = SCENARIOS.find(s => s.id === scenario)?.multiplier || 1
  const scenarioData = demandData.map(d => ({ ...d, demand: Math.round(d.demand * sm), gap: Math.round(d.demand * sm) - totalCapacity }))

  const hiringBudget = HIRING_PLAN.filter(h => h.status !== 'proposed').reduce((s,h) => s + h.cost, 0)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-lg">
            <FiUsers className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Capacity Planning</h1>
            <p className="text-sm text-gray-500">12-month resource forecasting · skill gap analysis · hiring roadmap</p>
          </div>
        </div>
        <div className="flex gap-1 rounded-xl border border-gray-200 p-0.5 bg-gray-50">
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => setScenario(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${scenario===s.id ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {[
          { label: 'Total Headcount',     value: totalHeadcount, sub: 'agents + managers', icon: FiUsers,     c: 'border-emerald-400', t: 'text-emerald-700' },
          { label: 'Monthly Capacity',    value: `${totalCapacity}h`, sub: 'available hrs/mo', icon: FiClock, c: 'border-blue-400',    t: 'text-blue-700' },
          { label: 'Capacity Breaches',   value: breachMonths,   sub: 'months over limit', icon: FiAlertTriangle, c: 'border-red-400', t: 'text-red-700' },
          { label: 'Monthly Staff Cost',  value: `$${(totalCost/1000).toFixed(0)}K`, sub: 'salary inc. benefits', icon: FiBarChart2, c: 'border-purple-400', t: 'text-purple-700' },
        ].map(k => { const KIcon = k.icon; return (
          <div key={k.label} className={`rounded-2xl border-l-4 ${k.c} bg-white p-4 shadow-sm`}>
            <p className="text-xs text-gray-500 font-medium">{k.label}</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${k.t}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        )})}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-gray-200 p-1 mb-6 shadow-sm">
        {[['overview','📊 Demand vs Capacity'],['resources','👥 Resource Mix'],['skills','🎓 Skill Gaps'],['hiring','📋 Hiring Plan']].map(([id,l]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 rounded-lg px-2 py-2.5 text-xs font-medium transition-all whitespace-nowrap ${tab===id ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>{l}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-semibold text-gray-700">Demand vs Capacity — 12 Month Forecast ({sm !== 1 ? `${Math.round(sm*100)}% scenario` : 'Baseline'})</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} unit="h" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} unit="%" domain={[0,140]} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="demand"   name="Demand (hrs)"   fill="#6366f1" radius={[4,4,0,0]} opacity={0.8} />
                <Bar yAxisId="left" dataKey="capacity" name="Capacity (hrs)"  fill="#10b981" radius={[4,4,0,0]} opacity={0.6} />
                <Line yAxisId="right" type="monotone" dataKey="utilization" name="Utilization %" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                <ReferenceLine yAxisId="right" y={100} stroke="#ef4444" strokeDasharray="4 2" label={{ value: '100% cap', fill:'#ef4444', fontSize:10 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Month by month table */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 border-b">
                <tr>{['Month','Demand (hrs)','Capacity (hrs)','Gap','Utilization','Status'].map(h =>
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody>
                {scenarioData.map(d => (
                  <tr key={d.month} className={`border-b border-gray-100 ${d.gap > 0 ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-3 py-2.5 font-medium">{d.month}</td>
                    <td className="px-3 py-2.5">{d.demand}h</td>
                    <td className="px-3 py-2.5">{totalCapacity}h</td>
                    <td className={`px-3 py-2.5 font-semibold ${d.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {d.gap > 0 ? `+${d.gap}h overload` : `${Math.abs(d.gap)}h spare`}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-gray-200">
                          <div className="h-2 rounded-full" style={{ width: `${Math.min(d.utilization,100)}%`, background: d.utilization >= 100 ? '#ef4444' : d.utilization >= 85 ? '#f59e0b' : '#10b981' }} />
                        </div>
                        <span className={`text-xs font-bold ${d.utilization >= 100 ? 'text-red-600' : ''}`}>{d.utilization}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {d.gap > 0
                        ? <span className="text-xs text-red-600 font-semibold">⚠ Over Capacity</span>
                        : d.utilization >= 85
                        ? <span className="text-xs text-yellow-600 font-semibold">Near Limit</span>
                        : <span className="text-xs text-green-600 font-semibold">✓ Healthy</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── RESOURCE MIX ── */}
      {tab === 'resources' && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map(r => (
              <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ background: r.color }} />
                  <p className="font-semibold text-gray-800 text-sm">{r.label}</p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-4xl font-extrabold" style={{ color: r.color }}>{r.headcount}</p>
                    <p className="text-xs text-gray-500">{r.capacity_hrs}h capacity/mo</p>
                    <p className="text-xs text-gray-400 mt-0.5">${r.cost_per_head.toLocaleString()}/mo</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => adjustHeadcount(r.id, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-200">
                      <FiPlus />
                    </button>
                    <button onClick={() => adjustHeadcount(r.id, -1)} disabled={r.headcount === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-40">
                      <FiMinus />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-1">What-If Modeller</h3>
            <p className="text-xs text-gray-400 mb-4">Use +/− buttons above to adjust headcount. Changes update cost and capacity projections in real time.</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[['Total Headcount', totalHeadcount, 'text-emerald-700'], ['Total Capacity', `${totalCapacity}h/mo`, 'text-blue-700'], ['Monthly Cost', `$${(totalCost/1000).toFixed(1)}K`, 'text-purple-700']].map(([l,v,c]) => (
                <div key={l} className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">{l}</p>
                  <p className={`text-2xl font-extrabold mt-1 ${c}`}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SKILL GAPS ── */}
      {tab === 'skills' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Team Skill Assessment vs Requirements</h3>
            <div className="space-y-4">
              {SKILL_GAPS.map(s => (
                <div key={s.skill}>
                  <div className="flex items-center justify-between text-sm mb-1 flex-wrap gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.skill}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${priorityCfg[s.priority]}`}>{s.priority}</span>
                    </div>
                    <span className={`text-xs font-semibold ${s.gap > 20 ? 'text-red-600' : s.gap > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      Gap: {s.gap}pts
                    </span>
                  </div>
                  <div className="relative h-4 rounded-full bg-gray-100">
                    <div className="absolute h-4 rounded-full bg-blue-300 opacity-60" style={{ width: `${s.required}%` }} />
                    <div className="absolute h-4 rounded-full transition-all" style={{ width: `${s.current}%`, background: s.current >= s.required ? '#10b981' : s.gap > 20 ? '#ef4444' : '#f59e0b' }} />
                    <div className="absolute top-0 h-4 w-0.5 bg-blue-600" style={{ left: `${s.required}%` }} title={`Required: ${s.required}`} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>Current: {s.current}%</span>
                    <span>Required: {s.required}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HIRING PLAN ── */}
      {tab === 'hiring' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 mb-2">
            {[['Approved Budget', `$${(hiringBudget/1000).toFixed(1)}K/mo`, 'bg-green-50 border-green-200 text-green-800'],
              ['Pending Approval', `$${(HIRING_PLAN.filter(h=>h.status==='pending').reduce((s,h)=>s+h.cost,0)/1000).toFixed(1)}K/mo`, 'bg-yellow-50 border-yellow-200 text-yellow-800'],
              ['Proposed', `$${(HIRING_PLAN.filter(h=>h.status==='proposed').reduce((s,h)=>s+h.cost,0)/1000).toFixed(1)}K/mo`, 'bg-blue-50 border-blue-200 text-blue-800'],
            ].map(([l,v,c]) => (
              <div key={l} className={`rounded-xl border p-4 text-center ${c}`}>
                <p className="text-xs font-medium">{l}</p>
                <p className="text-xl font-extrabold mt-1">{v}</p>
              </div>
            ))}
          </div>
          {HIRING_PLAN.map((h, i) => {
            const sCfg = statusCfg[h.status]
            return (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${h.type === 'hire' ? 'bg-indigo-100 text-indigo-600' : 'bg-teal-100 text-teal-600'}`}>
                  {h.type === 'hire' ? <FiUsers /> : <FiTarget />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{h.role}</p>
                    <span className="text-xs text-gray-400">{h.startMonth}</span>
                    <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${sCfg.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sCfg.dot}`} />{h.status}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600`}>{h.type}</span>
                  </div>
                </div>
                <p className="font-bold text-indigo-700 shrink-0">${h.cost.toLocaleString()}/mo</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
