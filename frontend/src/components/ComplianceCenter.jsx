import { useState, useMemo } from 'react'
import {
  RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  FiShield, FiCheckCircle, FiAlertCircle, FiXCircle,
  FiCalendar, FiUpload, FiDownload, FiSearch, FiFilter,
  FiClock, FiLock, FiFileText, FiPlus, FiChevronRight,
  FiAlertTriangle, FiUser, FiCheck
} from 'react-icons/fi'

/* ─── Frameworks ─── */
const FRAMEWORKS = ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'NIST CSF', 'CIS v8', 'HIPAA']
const DOMAINS = {
  'SOC 2 Type II': ['Security','Availability','Processing Integrity','Confidentiality','Privacy'],
  'ISO 27001':     ['Information Security Policies','Asset Management','Access Control','Cryptography','Physical Security','Operations Security','Communications Security','Supplier Relationships','Incident Management','BCM','Compliance'],
  'GDPR':          ['Lawful Basis','Data Subject Rights','Data Minimisation','Retention Policies','Data Transfers','Breach Notification','DPO Requirements','Privacy by Design'],
  'NIST CSF':      ['Identify','Protect','Detect','Respond','Recover'],
  'CIS v8':        ['Basic Controls','Foundational Controls','Organizational Controls'],
  'HIPAA':         ['Administrative Safeguards','Physical Safeguards','Technical Safeguards','Breach Notification'],
}

/* ─── Evidence Library ─── */
const EVIDENCE = [
  { id: 'EV-001', title: 'Information Security Policy v3.2',       framework: 'ISO 27001', domain: 'Information Security Policies', status: 'approved', owner: 'CISO', due: '2026-12-31', uploaded: '2026-06-15', size: '240 KB', type: 'pdf' },
  { id: 'EV-002', title: 'Q2 2026 Access Review Report',           framework: 'SOC 2 Type II', domain: 'Security', status: 'approved', owner: 'IT Director', due: '2026-09-30', uploaded: '2026-06-30', size: '1.2 MB', type: 'xlsx' },
  { id: 'EV-003', title: 'Encryption Key Management Procedure',    framework: 'ISO 27001', domain: 'Cryptography', status: 'approved', owner: 'SecOps', due: '2026-12-31', uploaded: '2026-05-20', size: '185 KB', type: 'pdf' },
  { id: 'EV-004', title: 'Penetration Test Report — Jul 2026',     framework: 'SOC 2 Type II', domain: 'Security', status: 'pending_review', owner: 'SecOps', due: '2026-07-31', uploaded: '2026-07-05', size: '4.8 MB', type: 'pdf' },
  { id: 'EV-005', title: 'GDPR Data Processing Register',          framework: 'GDPR', domain: 'Lawful Basis', status: 'approved', owner: 'DPO', due: '2026-12-31', uploaded: '2026-04-10', size: '320 KB', type: 'xlsx' },
  { id: 'EV-006', title: 'BCP / DR Test Results Q1 2026',          framework: 'ISO 27001', domain: 'BCM', status: 'approved', owner: 'IT Director', due: '2026-12-31', uploaded: '2026-03-28', size: '890 KB', type: 'pdf' },
  { id: 'EV-007', title: 'Incident Response Playbook v2.1',        framework: 'ISO 27001', domain: 'Incident Management', status: 'approved', owner: 'CISO', due: '2026-12-31', uploaded: '2026-06-01', size: '560 KB', type: 'pdf' },
  { id: 'EV-008', title: 'GDPR Data Subject Requests Log H1 2026', framework: 'GDPR', domain: 'Data Subject Rights', status: 'approved', owner: 'DPO', due: '2026-07-15', uploaded: '2026-07-01', size: '92 KB', type: 'xlsx' },
  { id: 'EV-009', title: 'Patch Management Policy v1.4',           framework: 'CIS v8', domain: 'Foundational Controls', status: 'needs_update', owner: 'Platform', due: '2026-07-31', uploaded: '2025-12-01', size: '145 KB', type: 'pdf' },
  { id: 'EV-010', title: 'Vendor Security Assessment — Salesforce', framework: 'ISO 27001', domain: 'Supplier Relationships', status: 'approved', owner: 'IT Director', due: '2027-01-31', uploaded: '2026-07-03', size: '2.1 MB', type: 'pdf' },
  { id: 'EV-011', title: 'MFA Enforcement Screenshot Evidence',    framework: 'SOC 2 Type II', domain: 'Security', status: 'approved', owner: 'SecOps', due: '2026-09-30', uploaded: '2026-07-01', size: '340 KB', type: 'png' },
  { id: 'EV-012', title: 'Privacy Impact Assessment — CRM Module', framework: 'GDPR', domain: 'Privacy by Design', status: 'pending_review', owner: 'DPO', due: '2026-07-20', uploaded: '2026-07-06', size: '680 KB', type: 'pdf' },
]

const CONTROLS = [
  { id: 'CC-001', fw: 'SOC 2 Type II', control: 'CC6.1 — Logical & Physical Access Controls', status: 'pass',  evidence: ['EV-002','EV-011'], lastTested: '2026-06-30', owner: 'SecOps' },
  { id: 'CC-002', fw: 'SOC 2 Type II', control: 'CC7.2 — System Monitoring',                  status: 'pass',  evidence: ['EV-002'],          lastTested: '2026-07-01', owner: 'Platform' },
  { id: 'CC-003', fw: 'SOC 2 Type II', control: 'CC9.2 — Vendor Management',                  status: 'warn',  evidence: ['EV-010'],          lastTested: '2026-07-03', owner: 'IT Director' },
  { id: 'CC-004', fw: 'ISO 27001',     control: 'A.9.1 — Access Control Policy',              status: 'pass',  evidence: ['EV-001','EV-002'], lastTested: '2026-06-28', owner: 'CISO' },
  { id: 'CC-005', fw: 'ISO 27001',     control: 'A.10.1 — Cryptographic Controls',            status: 'pass',  evidence: ['EV-003'],          lastTested: '2026-05-20', owner: 'SecOps' },
  { id: 'CC-006', fw: 'ISO 27001',     control: 'A.12.6 — Patch Management',                  status: 'fail',  evidence: ['EV-009'],          lastTested: '2026-06-01', owner: 'Platform' },
  { id: 'CC-007', fw: 'GDPR',          control: 'Art. 30 — Records of Processing Activities', status: 'pass',  evidence: ['EV-005'],          lastTested: '2026-07-01', owner: 'DPO' },
  { id: 'CC-008', fw: 'GDPR',          control: 'Art. 35 — Data Protection Impact Assessment',status: 'warn',  evidence: ['EV-012'],          lastTested: '2026-07-06', owner: 'DPO' },
  { id: 'CC-009', fw: 'CIS v8',        control: 'CIS 4 — Vulnerability Management',           status: 'warn',  evidence: ['EV-004'],          lastTested: '2026-07-05', owner: 'SecOps' },
  { id: 'CC-010', fw: 'ISO 27001',     control: 'A.17.1 — Business Continuity Planning',      status: 'pass',  evidence: ['EV-006'],          lastTested: '2026-03-28', owner: 'IT Director' },
]

const AUDIT_EVENTS = [
  { date: '2026-12-15', event: 'SOC 2 Type II Annual Audit',    status: 'upcoming', auditor: 'Deloitte', framework: 'SOC 2 Type II' },
  { date: '2026-11-01', event: 'ISO 27001 Surveillance Audit',  status: 'upcoming', auditor: 'BSI Group', framework: 'ISO 27001' },
  { date: '2026-10-01', event: 'GDPR DPA Review',               status: 'upcoming', auditor: 'Internal',  framework: 'GDPR' },
  { date: '2026-07-20', event: 'Pen Test Review Sign-off',       status: 'upcoming', auditor: 'Internal',  framework: 'SOC 2 Type II' },
  { date: '2026-06-30', event: 'Q2 Access Review',               status: 'completed', auditor: 'Internal', framework: 'SOC 2 Type II' },
]

const evStatusCfg = {
  approved:        { label: 'Approved',        color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
  pending_review:  { label: 'Pending Review',  color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
  needs_update:    { label: 'Needs Update',    color: 'bg-orange-100 text-orange-800', icon: FiAlertCircle },
  rejected:        { label: 'Rejected',        color: 'bg-red-100 text-red-800', icon: FiXCircle },
}
const ctrlCfg = {
  pass: { label: 'Pass', color: 'bg-green-100 text-green-800', icon: FiCheckCircle, dot: 'bg-green-500' },
  warn: { label: 'Warning', color: 'bg-yellow-100 text-yellow-800', icon: FiAlertTriangle, dot: 'bg-yellow-500' },
  fail: { label: 'Fail', color: 'bg-red-100 text-red-800', icon: FiXCircle, dot: 'bg-red-500' },
}

export default function ComplianceCenter() {
  const [fw,      setFw]     = useState('SOC 2 Type II')
  const [tab,     setTab]    = useState('overview')
  const [query,   setQuery]  = useState('')
  const [evFilter,setEvFilter]= useState('all')

  const fwControls = CONTROLS.filter(c => c.fw === fw)
  const fwEvidence = EVIDENCE.filter(e => e.framework === fw)

  const totalControls = fwControls.length
  const passCount  = fwControls.filter(c => c.status === 'pass').length
  const warnCount  = fwControls.filter(c => c.status === 'warn').length
  const failCount  = fwControls.filter(c => c.status === 'fail').length
  const overallScore = totalControls ? Math.round((passCount + warnCount * 0.5) / totalControls * 100) : 0

  const scoreColor = overallScore >= 90 ? '#10b981' : overallScore >= 75 ? '#f59e0b' : '#ef4444'

  const filteredEvidence = EVIDENCE.filter(e =>
    (evFilter === 'all' || e.status === evFilter) &&
    (!query || e.title.toLowerCase().includes(query.toLowerCase()) || e.id.toLowerCase().includes(query.toLowerCase()))
  )

  const fwScores = FRAMEWORKS.map(f => {
    const ctrls = CONTROLS.filter(c => c.fw === f)
    const pass = ctrls.filter(c => c.status === 'pass').length
    const warn = ctrls.filter(c => c.status === 'warn').length
    const score = ctrls.length ? Math.round((pass + warn*0.5)/ctrls.length*100) : 0
    return { name: f.split(' ')[0], score, fill: score >= 90 ? '#10b981' : score >= 75 ? '#f59e0b' : '#ef4444' }
  })

  const TABS = [
    { id: 'overview',  label: '📊 Overview' },
    { id: 'controls',  label: `🔒 Controls (${totalControls})` },
    { id: 'evidence',  label: `📁 Evidence (${fwEvidence.length})` },
    { id: 'calendar',  label: '📅 Audit Calendar' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-700 shadow-lg">
            <FiShield className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Compliance Center</h1>
            <p className="text-sm text-gray-500">SOC 2 · ISO 27001 · GDPR · NIST · CIS · HIPAA evidence management</p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-white font-semibold hover:bg-blue-800">
          <FiUpload /> Upload Evidence
        </button>
      </div>

      {/* Framework Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FRAMEWORKS.map(f => {
          const ctrls = CONTROLS.filter(c => c.fw === f)
          const pass = ctrls.filter(c => c.status === 'pass').length
          const score = ctrls.length ? Math.round((pass + ctrls.filter(c=>c.status==='warn').length*0.5)/ctrls.length*100) : 0
          return (
            <button key={f} onClick={() => setFw(f)}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${fw===f ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
              {f.split(' ')[0]}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${fw===f ? 'bg-white/20 text-white' : score>=90?'bg-green-100 text-green-800':score>=75?'bg-yellow-100 text-yellow-800':'bg-red-100 text-red-800'}`}>
                {score}%
              </span>
            </button>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-gray-200 p-1 mb-6 shadow-sm">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${tab===t.id ? 'bg-blue-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
          {/* Score Gauge */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col items-center">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">{fw} Score</h3>
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" startAngle={90} endAngle={-270}
                  data={[{ value: overallScore, fill: scoreColor }]}>
                  <RadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-extrabold" style={{ color: scoreColor }}>{overallScore}%</p>
                <p className="text-xs text-gray-400">compliance</p>
              </div>
            </div>
            <div className="mt-4 w-full space-y-2">
              {[['Pass', passCount, '#10b981'],['Warning', warnCount, '#f59e0b'],['Fail', failCount, '#ef4444']].map(([l,v,c]) => (
                <div key={l} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{background:c}}/>{l}</div>
                  <span className="font-bold">{v} controls</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Framework comparison */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">All Framework Scores</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={fwScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0,100]} tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip formatter={(v) => [`${v}%`, 'Score']} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="score" radius={[4,4,0,0]}>
                    {fwScores.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Upcoming items */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">⚠ Action Items</h3>
              <div className="space-y-2">
                {CONTROLS.filter(c => c.status !== 'pass').map(c => {
                  const cfg = ctrlCfg[c.status]
                  const Icon = cfg.icon
                  return (
                    <div key={c.id} className={`flex items-center gap-2 rounded-lg p-2.5 text-xs ${cfg.color}`}>
                      <Icon className="shrink-0" />
                      <span className="font-medium">[{c.fw.split(' ')[0]}]</span>
                      <span className="flex-1 truncate">{c.control}</span>
                      <span className="shrink-0">Owner: {c.owner}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTROLS ── */}
      {tab === 'controls' && (
        <div className="space-y-3">
          {fwControls.map(c => {
            const cfg = ctrlCfg[c.status]
            const Icon = cfg.icon
            const evidenceItems = c.evidence.map(eid => EVIDENCE.find(e => e.id === eid)).filter(Boolean)
            return (
              <div key={c.id} className={`rounded-xl border p-4 ${c.status==='fail'?'border-red-200 bg-red-50':c.status==='warn'?'border-yellow-200 bg-yellow-50':'border-green-200 bg-green-50'}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`text-xl shrink-0 mt-0.5 ${c.status==='fail'?'text-red-600':c.status==='warn'?'text-yellow-600':'text-green-600'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{c.control}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><FiUser className="text-[10px]" />{c.owner}</span>
                      <span className="flex items-center gap-1"><FiClock className="text-[10px]" />Tested {c.lastTested}</span>
                      <span>{c.evidence.length} evidence file{c.evidence.length!==1?'s':''}</span>
                    </div>
                    {evidenceItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {evidenceItems.map(ev => (
                          <span key={ev.id} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600 flex items-center gap-1">
                            <FiFileText className="text-[10px]" />{ev.id}: {ev.title.slice(0,35)}…
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── EVIDENCE ── */}
      {tab === 'evidence' && (
        <div>
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input placeholder="Search evidence…" value={query} onChange={e => setQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div className="flex gap-1">
              {['all', 'approved', 'pending_review', 'needs_update'].map(s => (
                <button key={s} onClick={() => setEvFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${evFilter===s?'bg-blue-700 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {s==='all'?'All':evStatusCfg[s].label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['ID','Title','Domain','Status','Owner','Due Date','Actions'].map(h =>
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredEvidence.map(ev => {
                  const sCfg = evStatusCfg[ev.status]
                  const SIcon = sCfg.icon
                  return (
                    <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-400">{ev.id}</td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-xs">{ev.title}</p>
                        <p className="text-xs text-gray-400">{ev.size} · {ev.type.toUpperCase()} · {ev.uploaded}</p>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">{ev.domain}</td>
                      <td className="px-3 py-2.5">
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit ${sCfg.color}`}>
                          <SIcon className="text-[10px]" />{sCfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs">{ev.owner}</td>
                      <td className="px-3 py-2.5 text-xs">{ev.due}</td>
                      <td className="px-3 py-2.5">
                        <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><FiDownload /> View</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CALENDAR ── */}
      {tab === 'calendar' && (
        <div className="space-y-3">
          {AUDIT_EVENTS.map((ev, i) => {
            const daysUntil = Math.round((new Date(ev.date) - new Date()) / (1000*60*60*24))
            return (
              <div key={i} className={`rounded-xl border p-4 flex items-center gap-4 ${ev.status==='completed'?'border-green-200 bg-green-50':'border-blue-200 bg-blue-50'}`}>
                <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${ev.status==='completed'?'bg-green-600':'bg-blue-600'} text-white`}>
                  <p className="text-xs font-medium">{ev.date.slice(5,7)}/{ev.date.slice(0,4)}</p>
                  <p className="text-lg font-extrabold">{ev.date.slice(8,10)}</p>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{ev.event}</p>
                  <div className="flex gap-3 mt-0.5 text-xs text-gray-600">
                    <span>Framework: {ev.framework}</span>
                    <span>Auditor: {ev.auditor}</span>
                    {ev.status !== 'completed' && <span className={`font-semibold ${daysUntil < 30 ? 'text-red-600' : 'text-blue-700'}`}>{daysUntil}d away</span>}
                  </div>
                </div>
                {ev.status === 'completed'
                  ? <FiCheckCircle className="text-green-600 text-xl shrink-0" />
                  : <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-medium shrink-0">Upcoming</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
