import { useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts'
import {
  FiPackage, FiStar, FiAlertCircle, FiCheckCircle, FiDollarSign,
  FiCalendar, FiChevronRight, FiPlus, FiSearch, FiTrendingUp,
  FiTrendingDown, FiX, FiEdit, FiPhone, FiMail, FiFileText
} from 'react-icons/fi'

/* ─── Vendor Data ─── */
const VENDOR_TIERS = {
  strategic:  { label: 'Strategic',  color: 'bg-purple-100 text-purple-800' },
  preferred:  { label: 'Preferred',  color: 'bg-blue-100 text-blue-800'    },
  approved:   { label: 'Approved',   color: 'bg-green-100 text-green-800'  },
  watch_list: { label: 'Watch List', color: 'bg-red-100 text-red-800'      },
}

const VENDORS = [
  {
    id: 'VND-001', name: 'Microsoft',         tier: 'strategic', category: 'Cloud / Productivity',
    spend: 42000, contract_end: '2027-06-30', account_manager: 'James Carter', email: 'j.carter@microsoft.com', phone: '+1 800 642 7676',
    sla_uptime: 99.9, incidents_ytd: 2, renewal_risk: 'low',
    scores: { delivery: 92, quality: 88, support: 85, pricing: 70, innovation: 90, compliance: 95 },
    trend: [{ month: 'Jan', score: 88 },{ month: 'Feb', score: 87 },{ month: 'Mar', score: 89 },{ month: 'Apr', score: 90 },{ month: 'May', score: 91 },{ month: 'Jun', score: 88 }],
    notes: 'Annual EA renewal due Jun 2027. Azure Copilot pilot running Q3.',
    contracts: [{ name: 'Microsoft 365 EA', value: 28000, end: '2027-06-30' }, { name: 'Azure MACC', value: 14000, end: '2027-03-31' }],
  },
  {
    id: 'VND-002', name: 'Cisco Systems',     tier: 'preferred', category: 'Network / Security',
    spend: 18500, contract_end: '2026-12-31', account_manager: 'Linda Park', email: 'l.park@cisco.com', phone: '+1 800 553 6387',
    sla_uptime: 99.5, incidents_ytd: 5, renewal_risk: 'medium',
    scores: { delivery: 85, quality: 80, support: 78, pricing: 65, innovation: 75, compliance: 88 },
    trend: [{ month: 'Jan', score: 80 },{ month: 'Feb', score: 79 },{ month: 'Mar', score: 81 },{ month: 'Apr', score: 78 },{ month: 'May', score: 77 },{ month: 'Jun', score: 78 }],
    notes: 'VPN gateway issues documented in INC-2026-0412. Performance declining. Review before renewal.',
    contracts: [{ name: 'AnyConnect Licenses', value: 12000, end: '2026-12-31' }, { name: 'Smartnet Support', value: 6500, end: '2026-12-31' }],
  },
  {
    id: 'VND-003', name: 'Salesforce',        tier: 'strategic', category: 'CRM',
    spend: 31000, contract_end: '2027-01-31', account_manager: 'Tom Warren', email: 't.warren@salesforce.com', phone: '+1 800 667 6389',
    sla_uptime: 99.2, incidents_ytd: 8, renewal_risk: 'low',
    scores: { delivery: 80, quality: 78, support: 72, pricing: 58, innovation: 85, compliance: 82 },
    trend: [{ month: 'Jan', score: 82 },{ month: 'Feb', score: 80 },{ month: 'Mar', score: 79 },{ month: 'Apr', score: 77 },{ month: 'May', score: 75 },{ month: 'Jun', score: 76 }],
    notes: 'APAC report degradation ongoing (INC-2026-0411). Pricing increase 18% at last renewal. Benchmark vs HubSpot.',
    contracts: [{ name: 'Sales Cloud Enterprise', value: 22000, end: '2027-01-31' }, { name: 'Salesforce Shield', value: 9000, end: '2027-01-31' }],
  },
  {
    id: 'VND-004', name: 'CrowdStrike',       tier: 'strategic', category: 'Security / EDR',
    spend: 24000, contract_end: '2027-09-30', account_manager: 'Amy Lin', email: 'a.lin@crowdstrike.com', phone: '+1 888 512 8906',
    sla_uptime: 100, incidents_ytd: 0, renewal_risk: 'low',
    scores: { delivery: 97, quality: 96, support: 94, pricing: 72, innovation: 95, compliance: 98 },
    trend: [{ month: 'Jan', score: 94 },{ month: 'Feb', score: 95 },{ month: 'Mar', score: 96 },{ month: 'Apr', score: 96 },{ month: 'May', score: 97 },{ month: 'Jun', score: 96 }],
    notes: 'Top performer. Zero incidents YTD. Evaluate Falcon Identity module for ITDR.',
    contracts: [{ name: 'Falcon Prevent + Insight', value: 24000, end: '2027-09-30' }],
  },
  {
    id: 'VND-005', name: 'Atlassian (Jira)',  tier: 'preferred', category: 'Dev Tools',
    spend: 8200,  contract_end: '2026-10-31', account_manager: 'Sam Hughes', email: 's.hughes@atlassian.com', phone: '',
    sla_uptime: 99.7, incidents_ytd: 1, renewal_risk: 'low',
    scores: { delivery: 88, quality: 85, support: 70, pricing: 82, innovation: 88, compliance: 80 },
    trend: [{ month: 'Jan', score: 82 },{ month: 'Feb', score: 84 },{ month: 'Mar', score: 85 },{ month: 'Apr', score: 86 },{ month: 'May', score: 87 },{ month: 'Jun', score: 86 }],
    notes: 'Good value. Support responsiveness could improve. Cloud migration completed Q1.',
    contracts: [{ name: 'Jira Software (Cloud)', value: 4800, end: '2026-10-31' }, { name: 'Confluence (Cloud)', value: 3400, end: '2026-10-31' }],
  },
]

const overallScore = v => Math.round(Object.values(v.scores).reduce((s,x) => s+x, 0) / Object.keys(v.scores).length)
const scoreColor   = s => s >= 90 ? 'text-green-700' : s >= 75 ? 'text-yellow-700' : 'text-red-700'
const scoreBg      = s => s >= 90 ? 'bg-green-100'  : s >= 75 ? 'bg-yellow-100'   : 'bg-red-100'

export default function VendorManagement() {
  const [selected, setSelected] = useState(null)
  const [query,    setQuery]    = useState('')
  const [tab,      setTab]      = useState('overview')

  const vendor = selected ? VENDORS.find(v => v.id === selected) : null
  const filtered = VENDORS.filter(v =>
    !query || v.name.toLowerCase().includes(query.toLowerCase()) || v.category.toLowerCase().includes(query.toLowerCase())
  )
  const totalSpend = VENDORS.reduce((s, v) => s + v.spend, 0)
  const renewingIn90d = VENDORS.filter(v => {
    const d = new Date(v.contract_end), now = new Date()
    return (d - now) / (1000 * 60 * 60 * 24) < 90
  }).length

  const radarData = vendor ? Object.entries(vendor.scores).map(([k, v]) => ({ subject: k.charAt(0).toUpperCase() + k.slice(1), score: v, fullMark: 100 })) : []

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-green-500 shadow-lg">
            <FiPackage className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Vendor Management</h1>
            <p className="text-sm text-gray-500">Contracts, scorecards, performance tracking, renewal alerts</p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-white font-semibold hover:bg-teal-700">
          <FiPlus /> Add Vendor
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {[
          { label: 'Total Vendors',      value: VENDORS.length, icon: FiPackage,  c: 'border-teal-400',   t: 'text-teal-700' },
          { label: 'Monthly IT Spend',   value: `$${(totalSpend/1000).toFixed(0)}K`, icon: FiDollarSign, c: 'border-blue-400', t: 'text-blue-700' },
          { label: 'Renewing ≤ 90 Days', value: renewingIn90d, icon: FiCalendar,  c: 'border-orange-400', t: 'text-orange-700' },
          { label: 'Watch List',         value: VENDORS.filter(v=>v.tier==='watch_list').length, icon: FiAlertCircle, c: 'border-red-400', t: 'text-red-700' },
        ].map(k => { const KIcon = k.icon; return (
          <div key={k.label} className={`rounded-2xl border-l-4 ${k.c} bg-white p-4 shadow-sm`}>
            <div className="flex items-center justify-between"><div><p className="text-xs text-gray-500">{k.label}</p><p className={`text-2xl font-extrabold mt-0.5 ${k.t}`}>{k.value}</p></div><KIcon className={`text-2xl ${k.t} opacity-60`} /></div>
          </div>
        )})}
      </div>

      <div className={vendor ? 'grid gap-5 lg:grid-cols-[1fr_380px]' : ''}>
        {/* Vendor List */}
        <div>
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input placeholder="Search vendors…" value={query} onChange={e => setQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-teal-400" />
          </div>
          <div className="space-y-3">
            {filtered.map(v => {
              const score = overallScore(v)
              const tierCfg = VENDOR_TIERS[v.tier]
              const daysToRenewal = Math.round((new Date(v.contract_end) - new Date()) / (1000*60*60*24))
              return (
                <div key={v.id} onClick={() => setSelected(v.id === selected ? null : v.id)}
                  className={`rounded-2xl border-2 bg-white p-4 cursor-pointer transition-all hover:shadow-md ${v.id === selected ? 'border-teal-500 shadow-md' : 'border-gray-200 hover:border-teal-300'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-gray-800">{v.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${tierCfg.color}`}>{tierCfg.label}</span>
                        <span className="text-xs text-gray-400">{v.category}</span>
                        {daysToRenewal < 90 && <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold">🔔 Renews in {daysToRenewal}d</span>}
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                        <span>${(v.spend/1000).toFixed(0)}K/mo</span>
                        <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" />{v.sla_uptime}% uptime</span>
                        <span>{v.incidents_ytd} incidents YTD</span>
                        <span>{v.account_manager}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">Scorecard</p>
                      <p className={`text-3xl font-extrabold ${scoreColor(score)}`}>{score}</p>
                      <p className={`text-xs font-medium ${scoreColor(score)}`}>/100</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Vendor Detail Panel */}
        {vendor && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{vendor.name}</h2>
                  <p className="text-xs text-gray-400">{vendor.id} · {vendor.category}</p>
                </div>
                <button onClick={() => setSelected(null)}><FiX className="text-gray-400 hover:text-gray-600" /></button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 rounded-lg border border-gray-200 p-0.5 mb-4">
                {[['overview','Overview'],['scorecard','Scorecard'],['contracts','Contracts']].map(([id,l]) => (
                  <button key={id} onClick={() => setTab(id)}
                    className={`flex-1 rounded py-1.5 text-xs font-medium transition-all ${tab===id ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{l}</button>
                ))}
              </div>

              {tab === 'overview' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[['Monthly Spend', `$${vendor.spend.toLocaleString()}`], ['Contract End', vendor.contract_end], ['SLA Uptime', `${vendor.sla_uptime}%`], ['Incidents YTD', vendor.incidents_ytd]].map(([k,v]) => (
                      <div key={k} className="rounded-lg bg-gray-50 p-2"><p className="text-gray-400">{k}</p><p className="font-bold mt-0.5">{v}</p></div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 text-sm">
                    {vendor.email && <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-teal-600 hover:text-teal-800"><FiMail />{vendor.email}</a>}
                    {vendor.phone && <p className="flex items-center gap-2 text-gray-600"><FiPhone />{vendor.phone}</p>}
                  </div>
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
                    <FiFileText className="inline mr-1" /> <strong>Notes:</strong> {vendor.notes}
                  </div>
                </div>
              )}

              {tab === 'scorecard' && (
                <div>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name={vendor.name} dataKey="score" stroke="#0d9488" fill="#0d9488" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {Object.entries(vendor.scores).map(([k,v]) => (
                      <div key={k} className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5">
                        <span className="text-xs text-gray-600 capitalize">{k}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreBg(v)} ${scoreColor(v)}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-gray-500 mb-2">Score Trend (6 Months)</h4>
                    <ResponsiveContainer width="100%" height={80}>
                      <LineChart data={vendor.trend}>
                        <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                        <YAxis domain={[60,100]} tick={{ fontSize: 9 }} />
                        <Line type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {tab === 'contracts' && (
                <div className="space-y-2">
                  {vendor.contracts.map((c, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 p-3">
                      <p className="font-medium text-sm">{c.name}</p>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>${c.value.toLocaleString()}/yr</span>
                        <span className={`font-medium ${new Date(c.end) < new Date(Date.now() + 90*24*60*60*1000) ? 'text-orange-600' : 'text-gray-500'}`}>Ends {c.end}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
