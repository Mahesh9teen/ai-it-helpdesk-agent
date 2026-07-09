import React, { useEffect, useRef, useState } from 'react'
import { FiAlertOctagon, FiUsers, FiMessageCircle, FiCheck, FiChevronDown, FiChevronUp, FiRadio } from 'react-icons/fi'

const SEVERITY = {
  P1: { label: 'P1 · Critical', bg: 'bg-red-600', ring: 'ring-red-600' },
  P2: { label: 'P2 · Major', bg: 'bg-orange-500', ring: 'ring-orange-500' },
  P3: { label: 'P3 · Minor', bg: 'bg-yellow-400', ring: 'ring-yellow-400' },
}

const INITIAL_INCIDENTS = [
  {
    id: 'INC-001', severity: 'P1', title: 'ERP System Unresponsive — All Users Affected',
    started: new Date(Date.now() - 34 * 60000).toISOString(),
    status: 'investigating', affected: 420,
    commander: 'Sarah M.', bridge: '#incident-p1-erp',
    timeline: [
      { time: new Date(Date.now() - 34 * 60000).toISOString(), actor: 'System', msg: 'Incident auto-detected via monitoring alert' },
      { time: new Date(Date.now() - 30 * 60000).toISOString(), actor: 'Sarah M.', msg: 'Incident commander assigned. War room opened.' },
      { time: new Date(Date.now() - 22 * 60000).toISOString(), actor: 'Chen W.', msg: 'Root cause narrowed to DB connection pool exhaustion' },
      { time: new Date(Date.now() - 10 * 60000).toISOString(), actor: 'Alex R.', msg: 'Hotfix deployed to staging — testing now' },
    ],
  },
  {
    id: 'INC-002', severity: 'P2', title: 'Email Service Intermittent Failures',
    started: new Date(Date.now() - 2.1 * 3600000).toISOString(),
    status: 'identified', affected: 85,
    commander: 'Jay P.', bridge: '#incident-p2-email',
    timeline: [
      { time: new Date(Date.now() - 2.1 * 3600000).toISOString(), actor: 'System', msg: 'Alert triggered — email bounce rate > 15%' },
      { time: new Date(Date.now() - 1.8 * 3600000).toISOString(), actor: 'Jay P.', msg: 'Issue traced to TLS cert on mail relay' },
    ],
  },
]

const STATUS_CONFIG = {
  investigating: { label: 'Investigating', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  identified: { label: 'Identified', color: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-400' },
  monitoring: { label: 'Monitoring Fix', color: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  resolved: { label: 'Resolved', color: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
}

function elapsed(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

function duration(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function IncidentWarRoom() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS)
  const [expanded, setExpanded] = useState('INC-001')
  const [newMsg, setNewMsg] = useState({})
  const bottomRef = useRef(null)

  const toggleExpand = (id) => setExpanded(e => e === id ? null : id)

  const postUpdate = (incidentId) => {
    const text = newMsg[incidentId]?.trim()
    if (!text) return
    setIncidents(prev => prev.map(inc => {
      if (inc.id !== incidentId) return inc
      return {
        ...inc,
        timeline: [...inc.timeline, { time: new Date().toISOString(), actor: 'You', msg: text }]
      }
    }))
    setNewMsg(m => ({ ...m, [incidentId]: '' }))
  }

  const setStatus = (incidentId, status) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id !== incidentId) return inc
      return {
        ...inc, status,
        timeline: [...inc.timeline, {
          time: new Date().toISOString(), actor: 'You',
          msg: `Status changed to "${STATUS_CONFIG[status]?.label}"`
        }]
      }
    }))
  }

  const resolveIncident = (incidentId) => setStatus(incidentId, 'resolved')

  const activeCount = incidents.filter(i => i.status !== 'resolved').length

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100 flex items-center gap-2">
            <FiRadio className="h-5 w-5 text-red-500 animate-pulse" />
            Incident War Room
          </h2>
          <p className="text-sm text-hope-secondary dark:text-slate-400">
            {activeCount > 0 ? `${activeCount} active incident${activeCount > 1 ? 's' : ''} in progress` : 'No active incidents'}
          </p>
        </div>
        <button
          onClick={() => {
            const id = `INC-00${incidents.length + 1}`
            setIncidents(p => [...p, {
              id, severity: 'P3', title: 'New Incident (edit title)',
              started: new Date().toISOString(), status: 'investigating',
              affected: 0, commander: 'Unassigned', bridge: '#new-incident',
              timeline: [{ time: new Date().toISOString(), actor: 'You', msg: 'Incident declared' }]
            }])
            setExpanded(id)
          }}
          className="hope-btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <FiAlertOctagon className="h-4 w-4" /> Declare Incident
        </button>
      </div>

      <div className="space-y-3">
        {incidents.map(inc => {
          const sev = SEVERITY[inc.severity]
          const st = STATUS_CONFIG[inc.status] || STATUS_CONFIG.investigating
          const isExpanded = expanded === inc.id

          return (
            <div key={inc.id} className={`hope-card overflow-hidden ${inc.status !== 'resolved' ? 'ring-1 ' + sev.ring : ''}`}>
              {/* Header */}
              <button
                onClick={() => toggleExpand(inc.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold text-white ${sev.bg}`}>{inc.severity}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-hope-ink dark:text-slate-100">{inc.title}</p>
                  <div className="mt-0.5 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs">
                      <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                      <span className={st.color}>{st.label}</span>
                    </span>
                    <span className="text-xs text-hope-secondary">Duration: {duration(inc.started)}</span>
                    <span className="flex items-center gap-1 text-xs text-hope-secondary">
                      <FiUsers className="h-3 w-3" /> {inc.affected} affected
                    </span>
                  </div>
                </div>
                {isExpanded ? <FiChevronUp className="h-4 w-4 text-hope-secondary" /> : <FiChevronDown className="h-4 w-4 text-hope-secondary" />}
              </button>

              {/* Expanded body */}
              {isExpanded && (
                <div className="border-t border-hope-border px-5 pb-5 dark:border-slate-700">
                  {/* Meta row */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div>
                      <p className="text-xs text-hope-secondary uppercase tracking-wide">Commander</p>
                      <p className="font-medium text-hope-ink dark:text-slate-100">{inc.commander}</p>
                    </div>
                    <div>
                      <p className="text-xs text-hope-secondary uppercase tracking-wide">Slack Bridge</p>
                      <a href="#" className="font-medium text-hope-primary hover:underline">{inc.bridge}</a>
                    </div>
                    <div>
                      <p className="text-xs text-hope-secondary uppercase tracking-wide">Incident ID</p>
                      <p className="font-medium text-hope-ink dark:text-slate-100">{inc.id}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {['investigating', 'identified', 'monitoring'].map(s => (
                        <button
                          key={s}
                          onClick={() => setStatus(inc.id, s)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                            inc.status === s
                              ? 'bg-hope-primary text-white'
                              : 'bg-hope-canvas text-hope-secondary hover:bg-hope-primary/10 dark:bg-slate-800'
                          }`}
                        >
                          {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                      {inc.status !== 'resolved' && (
                        <button
                          onClick={() => resolveIncident(inc.id)}
                          className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          <FiCheck className="h-3.5 w-3.5" /> Resolve
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-4 space-y-2 max-h-64 overflow-y-auto" ref={bottomRef}>
                    {inc.timeline.map((entry, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-hope-primary" />
                        <div>
                          <p className="text-xs text-hope-secondary">{elapsed(entry.time)} · <span className="font-medium text-hope-ink dark:text-slate-300">{entry.actor}</span></p>
                          <p className="text-sm text-hope-ink dark:text-slate-200">{entry.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Post update */}
                  {inc.status !== 'resolved' && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={newMsg[inc.id] || ''}
                        onChange={e => setNewMsg(m => ({ ...m, [inc.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && postUpdate(inc.id)}
                        placeholder="Post an update to the timeline…"
                        className="hope-input flex-1 text-sm"
                      />
                      <button
                        onClick={() => postUpdate(inc.id)}
                        className="hope-btn-primary px-4 py-2 text-sm"
                      >
                        <FiMessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
