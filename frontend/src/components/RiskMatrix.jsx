import { useState } from 'react'
import {
  FiAlertTriangle, FiPlus, FiEdit, FiX, FiCheck,
  FiChevronRight, FiSearch, FiFilter, FiTarget,
  FiTrendingDown, FiShield, FiUser, FiClock
} from 'react-icons/fi'

/* ─── Risk Levels ─── */
const LIKELIHOOD_LABELS = ['Rare (1)', 'Unlikely (2)', 'Possible (3)', 'Likely (4)', 'Almost Certain (5)']
const IMPACT_LABELS     = ['Negligible (1)', 'Minor (2)', 'Moderate (3)', 'Major (4)', 'Catastrophic (5)']

const riskLevel = (l, i) => {
  const score = l * i
  if (score >= 15) return { level: 'Critical', color: '#dc2626', bg: 'bg-red-600',    text: 'text-white' }
  if (score >= 10) return { level: 'High',     color: '#ea580c', bg: 'bg-orange-500', text: 'text-white' }
  if (score >= 6)  return { level: 'Medium',   color: '#d97706', bg: 'bg-yellow-500', text: 'text-white' }
  if (score >= 3)  return { level: 'Low',      color: '#16a34a', bg: 'bg-green-500',  text: 'text-white' }
  return              { level: 'Very Low', color: '#15803d', bg: 'bg-green-300',  text: 'text-white' }
}

const CATEGORIES = ['Security', 'Operational', 'Compliance', 'Vendor', 'Financial', 'Technology']

const INITIAL_RISKS = [
  { id: 'RSK-001', title: 'Ransomware Attack on Core Infrastructure', category: 'Security', likelihood: 2, impact: 5, owner: 'CISO', status: 'active', mitigation: 'EDR deployed, daily backups, incident response plan tested quarterly', residual_l: 1, residual_i: 5, created: '2026-05-01', review: '2026-08-01' },
  { id: 'RSK-002', title: 'VPN Gateway Single Point of Failure',       category: 'Operational', likelihood: 3, impact: 4, owner: 'NetOps', status: 'mitigating', mitigation: 'Redundant gateway on order. Auto-restart script deployed.', residual_l: 2, residual_i: 4, created: '2026-06-10', review: '2026-07-15' },
  { id: 'RSK-003', title: 'GDPR Non-Compliance — DLP Gap',            category: 'Compliance', likelihood: 3, impact: 4, owner: 'DPO', status: 'active', mitigation: 'DLP policy deployment in progress (78% complete)', residual_l: 2, residual_i: 3, created: '2026-04-20', review: '2026-08-31' },
  { id: 'RSK-004', title: 'Key Vendor Bankruptcy (Primary SaaS)',      category: 'Vendor', likelihood: 1, impact: 4, owner: 'CTO', status: 'accepted', mitigation: 'Annual vendor financial health review. Tested data export last quarter.', residual_l: 1, residual_i: 4, created: '2026-03-01', review: '2027-03-01' },
  { id: 'RSK-005', title: 'Insider Threat — Privileged Access Misuse', category: 'Security', likelihood: 2, impact: 4, owner: 'SecOps', status: 'mitigating', mitigation: 'PAM tool deployment Q3. Quarterly access reviews in place.', residual_l: 1, residual_i: 4, created: '2026-05-15', review: '2026-09-01' },
  { id: 'RSK-006', title: 'IT Budget Overrun (>20%)',                  category: 'Financial', likelihood: 3, impact: 3, owner: 'IT Director', status: 'active', mitigation: 'Monthly budget reviews. Cost insights dashboard tracking spend.', residual_l: 2, residual_i: 3, created: '2026-01-10', review: '2026-10-01' },
  { id: 'RSK-007', title: 'Critical Skill Dependency — One Expert',   category: 'Operational', likelihood: 4, impact: 3, owner: 'IT Director', status: 'active', mitigation: 'Cross-training plan in progress. Knowledge base articles being created.', residual_l: 2, residual_i: 3, created: '2026-06-01', review: '2026-09-15' },
  { id: 'RSK-008', title: 'Legacy System Breach (End-of-Life OS)',     category: 'Technology', likelihood: 4, impact: 4, owner: 'Platform', status: 'mitigating', mitigation: 'Migration plan approved. 3 of 8 systems upgraded. ETA: Q4 2026.', residual_l: 2, residual_i: 4, created: '2026-02-01', review: '2026-12-01' },
  { id: 'RSK-009', title: 'Shadow IT — Unmanaged Cloud Storage',       category: 'Compliance', likelihood: 4, impact: 3, owner: 'CISO', status: 'active', mitigation: 'DLP scanning cloud egress. Employee awareness training completed.', residual_l: 3, residual_i: 2, created: '2026-04-01', review: '2026-07-30' },
  { id: 'RSK-010', title: 'MFA Bypass Vulnerability',                  category: 'Security', likelihood: 2, impact: 5, owner: 'SecOps', status: 'mitigating', mitigation: 'FIDO2 hardware tokens for privileged accounts. Phishing-resistant MFA rollout Q3.', residual_l: 1, residual_i: 4, created: '2026-06-20', review: '2026-08-20' },
]

const STATUS_CFG = {
  active:     { label: 'Active',     color: 'bg-red-100 text-red-800'    },
  mitigating: { label: 'Mitigating', color: 'bg-yellow-100 text-yellow-800' },
  accepted:   { label: 'Accepted',   color: 'bg-blue-100 text-blue-800'  },
  closed:     { label: 'Closed',     color: 'bg-gray-100 text-gray-600'  },
}

/* ─── 5×5 Heat Map Cell ─── */
function HeatCell({ likelihood, impact, risks }) {
  const cfg = riskLevel(likelihood, impact)
  const count = risks.filter(r => r.likelihood === likelihood && r.impact === impact).length
  return (
    <div className="flex h-14 w-full items-center justify-center rounded text-center text-xs font-bold"
      style={{ background: cfg.color + '30', border: `2px solid ${cfg.color}40` }}>
      {count > 0 && (
        <span className={`h-7 w-7 rounded-full ${cfg.bg} ${cfg.text} flex items-center justify-center text-sm font-extrabold shadow`}>
          {count}
        </span>
      )}
    </div>
  )
}

export default function RiskMatrix() {
  const [risks,      setRisks]     = useState(INITIAL_RISKS)
  const [tab,        setTab]       = useState('matrix')
  const [query,      setQuery]     = useState('')
  const [catFilter,  setCat]       = useState('all')
  const [statusFilter, setStatus]  = useState('all')
  const [selected,   setSelected]  = useState(null)
  const [showForm,   setShowForm]  = useState(false)
  const [form,       setForm]      = useState({ title:'', category:'Security', likelihood:3, impact:3, owner:'', mitigation:'', status:'active' })

  const filtered = risks.filter(r =>
    (catFilter === 'all' || r.category === catFilter) &&
    (statusFilter === 'all' || r.status === statusFilter) &&
    (!query || r.title.toLowerCase().includes(query.toLowerCase()) || r.id.toLowerCase().includes(query.toLowerCase()))
  )

  const selectedRisk = selected ? risks.find(r => r.id === selected) : null

  const addRisk = () => {
    const id = `RSK-${String(risks.length + 1).padStart(3,'0')}`
    setRisks(r => [...r, { ...form, id, created: new Date().toISOString().slice(0,10), review: '', residual_l: form.likelihood - 1, residual_i: form.impact }])
    setShowForm(false)
    setForm({ title:'', category:'Security', likelihood:3, impact:3, owner:'', mitigation:'', status:'active' })
  }

  const summary = {
    critical: risks.filter(r => r.likelihood * r.impact >= 15).length,
    high:     risks.filter(r => { const s = r.likelihood * r.impact; return s >= 10 && s < 15 }).length,
    medium:   risks.filter(r => { const s = r.likelihood * r.impact; return s >= 6 && s < 10 }).length,
    low:      risks.filter(r => r.likelihood * r.impact < 6).length,
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 shadow-lg">
            <FiTarget className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">IT Risk Register</h1>
            <p className="text-sm text-gray-500">ITIL-aligned risk management · 5×5 likelihood-impact matrix</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700">
          <FiPlus /> Add Risk
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {[['Critical', summary.critical, '#dc2626'], ['High', summary.high, '#ea580c'], ['Medium', summary.medium, '#d97706'], ['Low', summary.low, '#16a34a']].map(([l, v, c]) => (
          <div key={l} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm flex items-center gap-3">
            <div className="h-3 w-3 rounded-full shrink-0" style={{ background: c }} />
            <div><p className="text-xs text-gray-500">{l} Risk</p><p className="text-2xl font-extrabold" style={{ color: c }}>{v}</p></div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 mb-6">
          <h3 className="font-bold mb-4">Add New Risk</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="col-span-2 sm:col-span-3">
              <input placeholder="Risk title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
            </div>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="rounded-lg border border-gray-200 px-2 py-2 text-sm focus:outline-none">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Owner" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})}
              className="rounded-lg border border-gray-200 px-2 py-2 text-sm focus:outline-none" />
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
              className="rounded-lg border border-gray-200 px-2 py-2 text-sm focus:outline-none">
              {Object.keys(STATUS_CFG).map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Likelihood:</span>
              <input type="range" min="1" max="5" value={form.likelihood} onChange={e => setForm({...form, likelihood: +e.target.value})} className="flex-1" />
              <span className="font-bold text-sm w-4">{form.likelihood}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Impact:</span>
              <input type="range" min="1" max="5" value={form.impact} onChange={e => setForm({...form, impact: +e.target.value})} className="flex-1" />
              <span className="font-bold text-sm w-4">{form.impact}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${riskLevel(form.likelihood, form.impact).bg} text-white`}>
                {riskLevel(form.likelihood, form.impact).level} (Score: {form.likelihood * form.impact})
              </span>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <textarea placeholder="Mitigation measures" rows={2} value={form.mitigation} onChange={e => setForm({...form, mitigation: e.target.value})}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addRisk} disabled={!form.title.trim()}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">
              <FiCheck /> Save Risk
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-gray-200 p-1 mb-6 shadow-sm">
        {[['matrix','🟥 Risk Matrix'], ['register','📋 Risk Register'], ['residual','🛡 Residual Risk']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${tab === id ? 'bg-red-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── HEAT MAP ── */}
      {tab === 'matrix' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-4">5×5 Risk Heat Map (Inherent Risk)</h3>
            <div className="flex gap-3">
              <div className="space-y-2 w-full">
                {/* Y axis label */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-xs text-gray-400 writing-vertical w-5 text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>← Likelihood</div>
                  <div className="flex-1">
                    {[5,4,3,2,1].map(l => (
                      <div key={l} className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-gray-500 w-32 shrink-0 text-right">{LIKELIHOOD_LABELS[l-1]}</span>
                        <div className="flex-1 grid grid-cols-5 gap-1.5">
                          {[1,2,3,4,5].map(i => <HeatCell key={i} likelihood={l} impact={i} risks={risks} />)}
                        </div>
                      </div>
                    ))}
                    {/* X axis labels */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-32 shrink-0" />
                      <div className="flex-1 grid grid-cols-5 gap-1.5">
                        {IMPACT_LABELS.map(l => <p key={l} className="text-xs text-gray-400 text-center truncate">{l}</p>)}
                      </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-1">Impact →</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 text-xs">
              {[['Critical', '≥15', '#dc2626'],['High','10-14','#ea580c'],['Medium','6-9','#d97706'],['Low','3-5','#16a34a'],['Very Low','1-2','#15803d']].map(([l,s,c]) => (
                <span key={l} className="flex items-center gap-1.5 font-medium" style={{ color: c }}>
                  <span className="h-3 w-3 rounded" style={{ background: c }} />
                  {l} ({s})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── REGISTER ── */}
      {tab === 'register' && (
        <div>
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input placeholder="Search risks…" value={query} onChange={e => setQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-red-400" />
            </div>
            <select value={catFilter} onChange={e => setCat(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none">
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatus(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none">
              <option value="all">All Statuses</option>
              {Object.keys(STATUS_CFG).map(s => <option key={s} className="capitalize">{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            {filtered.sort((a,b) => (b.likelihood * b.impact) - (a.likelihood * a.impact)).map(r => {
              const cfg = riskLevel(r.likelihood, r.impact)
              const sCfg = STATUS_CFG[r.status]
              return (
                <div key={r.id} onClick={() => setSelected(r.id === selected ? null : r.id)}
                  className={`rounded-2xl border-l-4 bg-white p-4 cursor-pointer transition-all hover:shadow-sm ${r.id === selected ? 'shadow-md border-indigo-500' : ''}`}
                  style={{ borderLeftColor: cfg.color }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 items-start flex-1 min-w-0">
                      <div className={`shrink-0 px-2 py-1 rounded text-xs font-extrabold ${cfg.bg} ${cfg.text}`}>
                        {r.likelihood * r.impact}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-800 text-sm">{r.title}</p>
                          <span className="font-mono text-xs text-gray-400">{r.id}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${sCfg.color}`}>{sCfg.label}</span>
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1"><FiFilter className="text-[10px]" />{r.category}</span>
                          <span className="flex items-center gap-1"><FiUser className="text-[10px]" />{r.owner}</span>
                          <span className="flex items-center gap-1"><FiClock className="text-[10px]" />Review: {r.review || 'Not set'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500">L{r.likelihood} × I{r.impact}</p>
                      <p className="text-xs font-bold mt-0.5" style={{ color: cfg.color }}>{cfg.level}</p>
                    </div>
                  </div>
                  {r.id === selected && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 font-semibold mb-1">Mitigation:</p>
                      <p className="text-sm text-gray-700">{r.mitigation}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── RESIDUAL RISK ── */}
      {tab === 'residual' && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-600">Residual risk = risk remaining after mitigation controls are applied</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Risk','Inherent Score','Residual Score','Risk Reduction','Mitigation Status'].map(h =>
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody>
              {risks.sort((a,b) => (b.likelihood*b.impact)-(a.likelihood*a.impact)).map(r => {
                const inherent  = riskLevel(r.likelihood, r.impact)
                const residual  = riskLevel(r.residual_l, r.residual_i)
                const reduction = r.likelihood * r.impact - r.residual_l * r.residual_i
                return (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3">
                      <p className="font-medium text-xs">{r.title}</p>
                      <p className="text-xs text-gray-400">{r.id} · {r.category}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${inherent.bg} ${inherent.text}`}>
                        {r.likelihood * r.impact} — {inherent.level}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${residual.bg} ${residual.text}`}>
                        {r.residual_l * r.residual_i} — {residual.level}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-bold ${reduction > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                        {reduction > 0 ? `−${reduction} pts` : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3"><span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_CFG[r.status].color}`}>{STATUS_CFG[r.status].label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
