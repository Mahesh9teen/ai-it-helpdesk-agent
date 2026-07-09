import { useState } from 'react'
import {
  FiAlertTriangle, FiLink, FiSearch, FiPlus, FiX, FiChevronRight,
  FiCheckCircle, FiAlertCircle, FiClock, FiList, FiBookOpen,
  FiTarget, FiRefreshCw, FiTag, FiEdit, FiUser, FiEye
} from 'react-icons/fi'

/* ─── ITIL Problem Management ─── */
const PROBLEM_STATUSES = {
  new:           { label: 'New',            color: 'bg-blue-100 text-blue-800',   dot: 'bg-blue-500' },
  under_review:  { label: 'Under Review',   color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  rca_in_prog:   { label: 'RCA In Progress',color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  known_error:   { label: 'Known Error',    color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  resolved:      { label: 'Resolved',       color: 'bg-green-100 text-green-800',  dot: 'bg-green-500' },
  closed:        { label: 'Closed',         color: 'bg-gray-100 text-gray-700',    dot: 'bg-gray-400' },
}

const PROBLEMS = [
  {
    id: 'PRB-001', title: 'VPN Gateway Intermittent Disconnections',
    status: 'known_error', priority: 'high', owner: 'Chen Wei',
    category: 'Network', created: '2026-06-20', updated: '2026-07-05',
    affectedUsers: 47,
    linkedIncidents: ['TKT-1021', 'TKT-1847', 'TKT-1792', 'TKT-1654'],
    rootCause: 'Memory leak in VPN gateway firmware v4.2.1 causing connection drops every 45–90 minutes under high load.',
    workaround: 'Users should reconnect manually. The VPN gateway is restarted automatically every 6 hours.',
    resolution: 'Firmware update to v5.0.04032 scheduled for July 12 maintenance window.',
    timeline: [
      { date: '2026-07-05', event: 'Root cause identified — firmware memory leak', user: 'Chen Wei' },
      { date: '2026-07-03', event: 'Escalated to vendor for firmware patch', user: 'Alex R.' },
      { date: '2026-06-28', event: 'Pattern identified — affecting 47 users', user: 'Sarah M.' },
      { date: '2026-06-20', event: 'Problem record created from incident cluster', user: 'System' },
    ],
    tags: ['vpn', 'network', 'firmware', 'gateway'],
  },
  {
    id: 'PRB-002', title: 'Salesforce APAC Reports Not Loading',
    status: 'rca_in_prog', priority: 'medium', owner: 'Jay Patel',
    category: 'Software', created: '2026-07-01', updated: '2026-07-06',
    affectedUsers: 12,
    linkedIncidents: ['TKT-2011', 'TKT-2009'],
    rootCause: null,
    workaround: 'APAC users can export reports to Excel as a temporary workaround.',
    resolution: null,
    timeline: [
      { date: '2026-07-06', event: 'Salesforce support engaged — ticket opened', user: 'Jay Patel' },
      { date: '2026-07-05', event: 'Pattern confirmed — APAC region only', user: 'Jay Patel' },
      { date: '2026-07-01', event: 'Problem record created', user: 'System' },
    ],
    tags: ['salesforce', 'reports', 'crm', 'apac'],
  },
  {
    id: 'PRB-003', title: 'Windows 11 22H2 Black Screen After Wake',
    status: 'known_error', priority: 'medium', owner: 'Emma Clarke',
    category: 'Hardware', created: '2026-06-10', updated: '2026-06-30',
    affectedUsers: 23,
    linkedIncidents: ['TKT-1542', 'TKT-1498', 'TKT-1476', 'TKT-1421', 'TKT-1390'],
    rootCause: 'Incompatibility between Windows 11 22H2 and Intel Iris Xe Graphics driver 31.0.101.4146.',
    workaround: 'Users can force-restart (hold power 5s) to recover. Disabling fast startup also helps.',
    resolution: 'Driver rollback to v30.0.101.2111 resolves issue. Rollout in progress for affected devices.',
    timeline: [
      { date: '2026-06-30', event: 'Driver rollback confirmed as fix — deployment started', user: 'Emma Clarke' },
      { date: '2026-06-25', event: 'Reproduced in lab — confirmed driver incompatibility', user: 'Alex R.' },
      { date: '2026-06-15', event: 'Pattern identified — all affected machines have same graphics driver', user: 'Emma Clarke' },
      { date: '2026-06-10', event: 'Problem record created after 5 similar incidents', user: 'System' },
    ],
    tags: ['windows-11', 'graphics', 'driver', 'black-screen'],
  },
  {
    id: 'PRB-004', title: 'Outlook Slow to Load on Large Mailboxes (>50GB)',
    status: 'resolved', priority: 'low', owner: 'Sarah Mitchell',
    category: 'Software', created: '2026-05-15', updated: '2026-06-18',
    affectedUsers: 8,
    linkedIncidents: ['TKT-1200', 'TKT-1188', 'TKT-1155'],
    rootCause: 'Outlook OST file corruption and lack of archive policy on mailboxes >50GB.',
    workaround: 'Use Outlook Web Access (OWA) while issue is being resolved.',
    resolution: 'OST files rebuilt, archive policy deployed to all mailboxes >30GB.',
    timeline: [
      { date: '2026-06-18', event: 'All affected users confirm resolution — problem closed', user: 'Sarah M.' },
      { date: '2026-06-12', event: 'Archive policy deployed to affected mailboxes', user: 'Sarah M.' },
      { date: '2026-05-28', event: 'Root cause identified — OST corruption + no archiving', user: 'Sarah M.' },
      { date: '2026-05-15', event: 'Problem record created', user: 'System' },
    ],
    tags: ['outlook', 'ost', 'mailbox', 'performance'],
  },
]

const KEDB = [
  { id: 'KE-001', problem: 'PRB-001', title: 'VPN drops under high load', workaround: 'Reconnect manually or wait for auto-restart (every 6h)', status: 'active' },
  { id: 'KE-002', problem: 'PRB-003', title: 'Black screen after wake on Win11 22H2', workaround: 'Hold power button 5s to restart. Disable fast startup.', status: 'active' },
  { id: 'KE-003', problem: 'PRB-004', title: 'Outlook slow on 50GB+ mailboxes', workaround: 'Use OWA (mail.company.com) instead', status: 'resolved' },
]

const priorityConfig = {
  critical: 'bg-red-100 text-red-800',
  high:     'bg-orange-100 text-orange-800',
  medium:   'bg-yellow-100 text-yellow-800',
  low:      'bg-green-100 text-green-800',
}

export default function ProblemManagement() {
  const [tab,      setTab]      = useState('problems')
  const [selected, setSelected] = useState(null)
  const [query,    setQuery]    = useState('')
  const [filter,   setFilter]   = useState('all')

  const problem = PROBLEMS.find(p => p.id === selected)

  const filtered = PROBLEMS.filter(p =>
    (filter === 'all' || p.status === filter) &&
    (!query || p.title.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase()))
  )

  const stats = {
    total: PROBLEMS.length,
    active: PROBLEMS.filter(p => !['resolved','closed'].includes(p.status)).length,
    knownError: PROBLEMS.filter(p => p.status === 'known_error').length,
    affectedUsers: PROBLEMS.reduce((s, p) => s + p.affectedUsers, 0),
  }

  /* ─── Detail View ─── */
  if (selected && problem) {
    const s = PROBLEM_STATUSES[problem.status]
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <button onClick={() => setSelected(null)} className="mb-4 text-sm text-indigo-600 hover:underline flex items-center gap-1">
          ← Back to Problems
        </button>

        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Header */}
            <div className="rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-mono text-gray-400 mb-1">{problem.id}</p>
                  <h2 className="text-xl font-bold text-gray-900">{problem.title}</h2>
                </div>
                <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${s.color}`}>{s.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div><p className="text-gray-400 text-xs">Priority</p><span className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium ${priorityConfig[problem.priority]}`}>{problem.priority}</span></div>
                <div><p className="text-gray-400 text-xs">Owner</p><p className="font-medium mt-1">{problem.owner}</p></div>
                <div><p className="text-gray-400 text-xs">Category</p><p className="font-medium mt-1">{problem.category}</p></div>
                <div><p className="text-gray-400 text-xs">Affected Users</p><p className="font-bold text-red-600 mt-1 text-lg">{problem.affectedUsers}</p></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {problem.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">#{t}</span>)}
              </div>
            </div>

            {/* Root Cause */}
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3"><FiTarget /> Root Cause Analysis</h3>
              {problem.rootCause ? (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">{problem.rootCause}</div>
              ) : (
                <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 flex items-center gap-2">
                  <FiRefreshCw className="animate-spin shrink-0" /> Root cause analysis in progress…
                </div>
              )}
            </div>

            {/* Workaround */}
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3"><FiBookOpen /> Workaround</h3>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">{problem.workaround}</div>
            </div>

            {/* Resolution */}
            {problem.resolution && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3"><FiCheckCircle /> Resolution / Fix</h3>
                <p className="text-sm text-green-800">{problem.resolution}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                {problem.timeline.map((ev, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-indigo-500 mt-0.5 shrink-0" />
                      {i < problem.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm text-gray-700">{ev.event}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ev.date} · {ev.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Linked Incidents */}
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FiLink /> Linked Incidents
                <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{problem.linkedIncidents.length}</span>
              </h3>
              <div className="space-y-2">
                {problem.linkedIncidents.map(id => (
                  <div key={id} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2">
                    <FiAlertCircle className="text-orange-500 shrink-0" />
                    <span className="font-mono text-sm text-gray-700">{id}</span>
                    <FiEye className="ml-auto text-gray-400 cursor-pointer hover:text-indigo-600" />
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-2 text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600">
                <FiPlus /> Link Incident
              </button>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Add to KEDB', icon: FiBookOpen, color: 'text-orange-600' },
                  { label: 'Change Status', icon: FiRefreshCw, color: 'text-blue-600' },
                  { label: 'Reassign Owner', icon: FiUser, color: 'text-purple-600' },
                  { label: 'Post Update', icon: FiEdit, color: 'text-green-600' },
                ].map(a => {
                  const AIcon = a.icon
                  return (
                    <button key={a.label} className="w-full flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-sm hover:bg-gray-50 text-left">
                      <AIcon className={`${a.color} shrink-0`} />
                      {a.label}
                      <FiChevronRight className="ml-auto text-gray-400" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ─── List View ─── */
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Problem Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">ITIL Problem records — root cause analysis, workarounds, and known error database</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700">
          <FiPlus /> New Problem
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {[
          { label: 'Total Problems',    value: stats.total,         color: 'border-indigo-400',  icon: FiList },
          { label: 'Active',            value: stats.active,        color: 'border-orange-400',  icon: FiAlertCircle },
          { label: 'Known Errors',      value: stats.knownError,    color: 'border-yellow-400',  icon: FiAlertTriangle },
          { label: 'Affected Users',    value: stats.affectedUsers, color: 'border-red-400',     icon: FiUser },
        ].map(s => {
          const SIcon = s.icon
          return (
            <div key={s.label} className={`rounded-xl border-l-4 ${s.color} bg-white p-4 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                  <p className="text-2xl font-extrabold mt-0.5 text-gray-900">{s.value}</p>
                </div>
                <SIcon className="text-gray-400 text-xl" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-xl bg-white border border-gray-200 p-1 mb-5 shadow-sm">
        {[['problems', 'Problem Records'], ['kedb', `Known Error DB (${KEDB.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${tab === id ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Problems Tab */}
      {tab === 'problems' && (
        <>
          {/* Search + Filters */}
          <div className="flex gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input placeholder="Search problems…" value={query} onChange={e => setQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {['all', ...Object.keys(PROBLEM_STATUSES)].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {f === 'all' ? 'All' : PROBLEM_STATUSES[f]?.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map(p => {
              const s = PROBLEM_STATUSES[p.status]
              return (
                <div key={p.id}
                  onClick={() => setSelected(p.id)}
                  className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <FiAlertTriangle className={`mt-0.5 shrink-0 text-xl ${p.priority === 'high' || p.priority === 'critical' ? 'text-orange-500' : 'text-gray-400'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-mono text-xs text-gray-400">{p.id}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityConfig[p.priority]}`}>{p.priority}</span>
                        </div>
                        <p className="font-semibold text-gray-800 mt-1">{p.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1"><FiUser className="shrink-0" />{p.owner}</span>
                          <span className="flex items-center gap-1"><FiLink className="shrink-0" />{p.linkedIncidents.length} incidents</span>
                          <span className="flex items-center gap-1 text-red-500"><FiAlertCircle className="shrink-0" />{p.affectedUsers} users affected</span>
                          <span className="flex items-center gap-1"><FiClock className="shrink-0" />Updated {p.updated}</span>
                        </div>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-400 mt-1 shrink-0" />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* KEDB Tab */}
      {tab === 'kedb' && (
        <div className="space-y-3">
          <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 text-sm text-orange-800 flex items-center gap-2">
            <FiBookOpen className="shrink-0" />
            The Known Error Database (KEDB) documents known faults with approved workarounds. Share with IT agents and employees.
          </div>
          {KEDB.map(ke => (
            <div key={ke.id} className={`rounded-2xl border p-5 ${ke.status === 'active' ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-gray-400">{ke.id}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ke.status === 'active' ? 'bg-orange-200 text-orange-800' : 'bg-green-100 text-green-700'}`}>
                      {ke.status === 'active' ? '⚠ Active' : '✓ Resolved'}
                    </span>
                    <span className="text-xs text-gray-400">→ {ke.problem}</span>
                  </div>
                  <p className="font-semibold text-gray-800 mt-1">{ke.title}</p>
                </div>
              </div>
              <div className="rounded-lg bg-white border border-orange-100 p-3 text-sm text-gray-700">
                <span className="font-semibold text-orange-700">Workaround: </span>{ke.workaround}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
