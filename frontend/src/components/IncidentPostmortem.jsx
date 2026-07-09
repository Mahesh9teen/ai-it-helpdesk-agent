import { useState } from 'react'
import {
  FiFileText, FiPlus, FiTrash2, FiCheck, FiClock,
  FiAlertCircle, FiChevronRight, FiChevronDown, FiUser,
  FiCalendar, FiSave, FiCheckCircle, FiList, FiTarget
} from 'react-icons/fi'

/* ─── Mock incidents to link from ─── */
const INCIDENTS = [
  { id: 'INC-2026-0412', title: 'VPN Gateway High Latency',          start: '2026-07-06 14:30', duration: '3h 22m', severity: 'P2', affected_users: 47 },
  { id: 'INC-2026-0411', title: 'Salesforce Reports Unavailable (APAC)', start: '2026-07-06 12:00', duration: '5h 10m', severity: 'P2', affected_users: 12 },
  { id: 'INC-2026-0398', title: 'Email System Outage',                start: '2026-06-14 08:15', duration: '4h 45m', severity: 'P1', affected_users: 320 },
]

/* ─── Template for a new postmortem ─── */
const emptyPostmortem = (inc) => ({
  incident_id: inc.id,
  incident_title: inc.title,
  severity: inc.severity,
  incident_start: inc.start,
  duration: inc.duration,
  affected_users: inc.affected_users,
  status: 'draft',
  authors: '',
  reviewers: '',
  summary: '',
  impact: '',
  timeline: [
    { id: 't1', time: inc.start, event: 'Incident detected by monitoring system' },
    { id: 't2', time: '',         event: '' },
    { id: 't3', time: '',         event: 'Incident resolved' },
  ],
  root_cause: '',
  contributing_factors: [''],
  whys: ['', '', '', '', ''],
  action_items: [
    { id: 'ai1', description: '', owner: '', due: '', priority: 'high', status: 'open' },
  ],
  lessons_learned: '',
})

const SAVED_POSTMORTEMS = [
  {
    incident_id: 'INC-2026-0398',
    incident_title: 'Email System Outage',
    severity: 'P1',
    status: 'approved',
    duration: '4h 45m',
    affected_users: 320,
    summary: 'Exchange Online experienced a full outage affecting all 320 employees for 4h 45m due to an expired SSL certificate on the mail relay service.',
    root_cause: 'SSL certificate on the mail relay expired 48 hours earlier than the renewal script expected due to a DST time zone calculation bug.',
    action_items: [
      { description: 'Fix timezone bug in cert renewal script', owner: 'Chen Wei', due: '2026-06-28', priority: 'critical', status: 'completed' },
      { description: 'Implement 30-day cert expiry monitoring alert', owner: 'Platform', due: '2026-07-01', priority: 'high', status: 'completed' },
      { description: 'Run quarterly cert inventory audit', owner: 'SecOps', due: '2026-09-30', priority: 'medium', status: 'open' },
    ],
  },
]

const priorityCfg = {
  critical: 'bg-red-100 text-red-800',
  high:     'bg-orange-100 text-orange-800',
  medium:   'bg-yellow-100 text-yellow-800',
  low:      'bg-green-100 text-green-800',
}
const aiStatusCfg = {
  open:       'bg-blue-100 text-blue-800',
  in_progress:'bg-yellow-100 text-yellow-800',
  completed:  'bg-green-100 text-green-800',
}

export default function IncidentPostmortem() {
  const [view,        setView]       = useState('list')  // list | create | detail
  const [pm,          setPM]         = useState(null)
  const [selectedInc, setSelectedInc]= useState(null)
  const [expandedWhys,setExpandWhys] = useState(true)

  const startNew = (inc) => {
    setPM(emptyPostmortem(inc))
    setView('create')
  }

  const updateTimeline = (id, field, val) =>
    setPM(p => ({ ...p, timeline: p.timeline.map(t => t.id === id ? { ...t, [field]: val } : t) }))
  const addTimelineRow = () =>
    setPM(p => ({ ...p, timeline: [...p.timeline, { id: `t${Date.now()}`, time: '', event: '' }] }))
  const removeTimelineRow = id =>
    setPM(p => ({ ...p, timeline: p.timeline.filter(t => t.id !== id) }))

  const updateWhy = (i, val) =>
    setPM(p => { const w = [...p.whys]; w[i] = val; return { ...p, whys: w } })

  const updateActionItem = (id, field, val) =>
    setPM(p => ({ ...p, action_items: p.action_items.map(a => a.id === id ? { ...a, [field]: val } : a) }))
  const addActionItem = () =>
    setPM(p => ({ ...p, action_items: [...p.action_items, { id: `ai${Date.now()}`, description: '', owner: '', due: '', priority: 'high', status: 'open' }] }))

  const Section = ({ title, children }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  )

  /* ── LIST VIEW ── */
  if (view === 'list') return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600 shadow-lg">
            <FiFileText className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Incident Postmortem</h1>
            <p className="text-sm text-gray-500">5-Whys RCA · Timeline builder · Action item tracking</p>
          </div>
        </div>
      </div>

      {/* Existing Postmortems */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Completed Postmortems</h2>
        {SAVED_POSTMORTEMS.map((p, i) => (
          <div key={i} className="rounded-xl border border-green-200 bg-green-50 p-4 mb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-bold">{p.incident_title}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-200 text-green-800 font-medium">✓ Approved</span>
                  <span className="text-xs text-gray-500">{p.severity} · {p.duration} · {p.affected_users} users</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{p.summary}</p>
                <p className="text-xs text-gray-500 mt-1">{p.action_items.filter(a=>a.status==='completed').length}/{p.action_items.length} action items complete</p>
              </div>
              <button onClick={() => { setPM(p); setView('detail') }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 shrink-0">
                View <FiChevronRight />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create New */}
      <h2 className="font-semibold text-gray-700 mb-3">Create New Postmortem</h2>
      <div className="space-y-3">
        {INCIDENTS.map(inc => (
          <div key={inc.id} className="rounded-xl border-2 border-gray-200 bg-white p-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="font-semibold">{inc.title}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${inc.severity === 'P1' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>{inc.severity}</span>
              </div>
              <div className="flex gap-3 text-xs text-gray-500">
                <span>{inc.id}</span>
                <span>{inc.start}</span>
                <span>Duration: {inc.duration}</span>
                <span>{inc.affected_users} users affected</span>
              </div>
            </div>
            <button onClick={() => startNew(inc)}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm text-white font-semibold hover:bg-rose-700 shrink-0">
              <FiPlus /> Start RCA
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  /* ── DETAIL VIEW ── */
  if (view === 'detail' && pm) return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <button onClick={() => setView('list')} className="mb-4 text-sm text-indigo-600 hover:underline">← Back</button>
      <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-6 mb-5">
        <h2 className="text-xl font-bold">{pm.incident_title}</h2>
        <p className="text-sm text-gray-600 mt-2">{pm.summary}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          {[['Severity', pm.severity], ['Duration', pm.duration], ['Affected', `${pm.affected_users} users`], ['Status', 'Approved']].map(([k,v]) => (
            <div key={k} className="bg-white/60 rounded-lg p-2"><p className="text-gray-400">{k}</p><p className="font-bold mt-0.5">{v}</p></div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="font-bold mb-3">Root Cause</h3>
        <p className="text-sm text-gray-700 bg-red-50 border border-red-200 rounded-lg p-3">{pm.root_cause}</p>
      </div>
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="font-bold mb-3">Action Items</h3>
        <div className="space-y-2">
          {pm.action_items.map((a, i) => (
            <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${a.status==='completed'?'bg-green-50 border border-green-200':'bg-gray-50 border border-gray-200'}`}>
              {a.status === 'completed' ? <FiCheckCircle className="text-green-500 shrink-0" /> : <FiClock className="text-yellow-500 shrink-0" />}
              <div className="flex-1"><p className="text-sm font-medium">{a.description}</p><p className="text-xs text-gray-400">{a.owner} · Due {a.due}</p></div>
              <span className={`text-xs px-1.5 py-0.5 rounded ${priorityCfg[a.priority]}`}>{a.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  /* ── CREATE / EDIT ── */
  if (view === 'create' && pm) return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <button onClick={() => setView('list')} className="text-sm text-indigo-600 hover:underline mb-1 block">← Back to list</button>
          <h1 className="text-xl font-bold">Postmortem: {pm.incident_title}</h1>
          <p className="text-sm text-gray-500">{pm.incident_id} · {pm.severity} · {pm.duration}</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm text-white font-semibold hover:bg-rose-700">
          <FiSave /> Save Draft
        </button>
      </div>

      <div className="space-y-5">
        {/* Summary */}
        <Section title="📋 Executive Summary">
          <textarea rows={3} placeholder="1-2 sentence summary of the incident and its business impact…"
            value={pm.summary} onChange={e => setPM(p => ({...p, summary: e.target.value}))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 resize-none" />
        </Section>

        {/* Timeline */}
        <Section title="⏱ Incident Timeline">
          <div className="space-y-2.5">
            {pm.timeline.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-3 w-3 rounded-full bg-indigo-500" />
                </div>
                <input type="text" placeholder="HH:MM UTC" value={t.time}
                  onChange={e => updateTimeline(t.id, 'time', e.target.value)}
                  className="w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none shrink-0" />
                <input type="text" placeholder="What happened at this time?"
                  value={t.event} onChange={e => updateTimeline(t.id, 'event', e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none" />
                <button onClick={() => removeTimelineRow(t.id)} className="text-red-400 hover:text-red-600 shrink-0"><FiTrash2 className="text-sm" /></button>
              </div>
            ))}
            <button onClick={addTimelineRow} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              <FiPlus /> Add timeline entry
            </button>
          </div>
        </Section>

        {/* Root Cause + 5-Whys */}
        <Section title="🔍 Root Cause Analysis (5 Whys)">
          <div className="space-y-3 mb-4">
            {pm.whys.map((why, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Why #{i + 1}{i === 0 ? ' — the immediate cause' : i === 4 ? ' — the root cause' : ''}</p>
                  <input placeholder={i === 0 ? 'Why did the incident happen?' : `Why did "${pm.whys[i-1] || '…'}" occur?`}
                    value={why} onChange={e => updateWhy(i, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-rose-400" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Root Cause Statement</label>
            <textarea rows={2} placeholder="Synthesise the 5 Whys into one clear root cause statement…"
              value={pm.root_cause} onChange={e => setPM(p => ({...p, root_cause: e.target.value}))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 resize-none" />
          </div>
        </Section>

        {/* Action Items */}
        <Section title="✅ Action Items">
          <div className="space-y-3">
            {pm.action_items.map(a => (
              <div key={a.id} className="grid grid-cols-2 gap-2 rounded-xl border border-gray-100 p-3 sm:grid-cols-4">
                <div className="col-span-2 sm:col-span-4">
                  <input placeholder="Action item description *" value={a.description}
                    onChange={e => updateActionItem(a.id, 'description', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none" />
                </div>
                <input placeholder="Owner" value={a.owner}
                  onChange={e => updateActionItem(a.id, 'owner', e.target.value)}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none" />
                <input type="date" value={a.due}
                  onChange={e => updateActionItem(a.id, 'due', e.target.value)}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none" />
                <select value={a.priority} onChange={e => updateActionItem(a.id, 'priority', e.target.value)}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none">
                  {['critical','high','medium','low'].map(p => <option key={p}>{p}</option>)}
                </select>
                <select value={a.status} onChange={e => updateActionItem(a.id, 'status', e.target.value)}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none">
                  {['open','in_progress','completed'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            ))}
            <button onClick={addActionItem} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              <FiPlus /> Add action item
            </button>
          </div>
        </Section>

        {/* Lessons Learned */}
        <Section title="💡 Lessons Learned">
          <textarea rows={4} placeholder="What did we learn? What would we do differently next time?"
            value={pm.lessons_learned} onChange={e => setPM(p => ({...p, lessons_learned: e.target.value}))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none resize-none" />
        </Section>
      </div>
    </div>
  )

  return null
}
