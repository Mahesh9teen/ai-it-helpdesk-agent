import React, { useEffect, useState } from 'react'
import { FiAlertTriangle, FiClock, FiZap, FiCheckCircle, FiFilter } from 'react-icons/fi'
import { getApiBase } from '../lib/apiBase'

const API_BASE = getApiBase()

const PRIORITY_SLA = { critical: 2, high: 4, medium: 8, low: 24 }
const PRIORITY_COLORS = {
  critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', bar: 'bg-red-500' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', bar: 'bg-orange-500' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', bar: 'bg-yellow-400' },
  low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', bar: 'bg-blue-500' },
}

const mockTickets = [
  { id: 'TKT-001', title: 'Production database offline', priority: 'critical', created_at: new Date(Date.now() - 1.5 * 3600000).toISOString(), assignee: 'Alex R.' },
  { id: 'TKT-002', title: 'VPN access denied for 3 users', priority: 'high', created_at: new Date(Date.now() - 3.2 * 3600000).toISOString(), assignee: 'Sara M.' },
  { id: 'TKT-003', title: 'Outlook calendar sync broken', priority: 'medium', created_at: new Date(Date.now() - 6.1 * 3600000).toISOString(), assignee: 'Chen W.' },
  { id: 'TKT-004', title: 'New employee laptop setup', priority: 'low', created_at: new Date(Date.now() - 18 * 3600000).toISOString(), assignee: 'Jay P.' },
  { id: 'TKT-005', title: 'Printer not found on network', priority: 'medium', created_at: new Date(Date.now() - 4.5 * 3600000).toISOString(), assignee: 'Alex R.' },
  { id: 'TKT-006', title: 'MFA not working for Finance dept', priority: 'high', created_at: new Date(Date.now() - 2.8 * 3600000).toISOString(), assignee: null },
  { id: 'TKT-007', title: 'Software license expired - 12 users', priority: 'critical', created_at: new Date(Date.now() - 0.5 * 3600000).toISOString(), assignee: null },
  { id: 'TKT-008', title: 'Request for Adobe Acrobat', priority: 'low', created_at: new Date(Date.now() - 20 * 3600000).toISOString(), assignee: 'Sara M.' },
]

function getElapsedHours(createdAt) {
  return (Date.now() - new Date(createdAt).getTime()) / 3600000
}

function getSLAPercent(priority, createdAt) {
  const elapsed = getElapsedHours(createdAt)
  const sla = PRIORITY_SLA[priority] || 8
  return Math.min(100, (elapsed / sla) * 100)
}

function getTimeLeft(priority, createdAt) {
  const elapsed = getElapsedHours(createdAt)
  const sla = PRIORITY_SLA[priority] || 8
  const left = sla - elapsed
  if (left < 0) return { label: 'BREACHED', breached: true }
  if (left < 1) return { label: `${Math.round(left * 60)}m left`, warning: true }
  return { label: `${left.toFixed(1)}h left`, breached: false }
}

export default function SLAHeatmap() {
  const [tickets, setTickets] = useState(mockTickets)
  const [filter, setFilter] = useState('all')
  const [now, setNow] = useState(Date.now())

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch(`${API_BASE}/tickets?limit=50`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.items?.length) setTickets(data.items) })
      .catch(() => {})
  }, [])

  const filtered = filter === 'all'
    ? tickets
    : filter === 'breached'
    ? tickets.filter(t => getSLAPercent(t.priority, t.created_at) >= 100)
    : tickets.filter(t => t.priority === filter)

  const breachedCount = tickets.filter(t => getSLAPercent(t.priority, t.created_at) >= 100).length
  const warningCount = tickets.filter(t => {
    const pct = getSLAPercent(t.priority, t.created_at)
    return pct >= 75 && pct < 100
  }).length

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100">SLA Heatmap</h2>
          <p className="text-sm text-hope-secondary dark:text-slate-400">Live breach risk monitor — auto-refreshes every minute</p>
        </div>
        <div className="flex items-center gap-2">
          {breachedCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-400">
              <FiAlertTriangle className="h-3.5 w-3.5" /> {breachedCount} breached
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
              <FiClock className="h-3.5 w-3.5" /> {warningCount} at risk
            </span>
          )}
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Object.entries(PRIORITY_SLA).map(([p, hours]) => {
          const pTickets = tickets.filter(t => t.priority === p)
          const pBreached = pTickets.filter(t => getSLAPercent(p, t.created_at) >= 100).length
          const c = PRIORITY_COLORS[p]
          return (
            <button
              key={p}
              onClick={() => setFilter(filter === p ? 'all' : p)}
              className={`hope-card p-4 text-left transition-all ${filter === p ? 'ring-2 ring-hope-primary' : ''}`}
            >
              <p className={`text-xs font-semibold uppercase ${c.text}`}>{p}</p>
              <p className="mt-1 text-2xl font-bold text-hope-ink dark:text-slate-100">{pTickets.length}</p>
              <p className="text-xs text-hope-secondary">{hours}h SLA · {pBreached} breached</p>
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <FiFilter className="h-4 w-4 text-hope-secondary" />
        {['all', 'breached', 'critical', 'high', 'medium', 'low'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-hope-primary text-white'
                : 'bg-hope-canvas text-hope-secondary hover:bg-hope-primary/10 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Ticket rows */}
      <div className="hope-card overflow-hidden">
        <div className="divide-y divide-hope-border dark:divide-slate-800">
          {filtered.length === 0 && (
            <p className="p-6 text-center text-sm text-hope-secondary">No tickets match this filter.</p>
          )}
          {filtered.map(ticket => {
            const pct = getSLAPercent(ticket.priority, ticket.created_at)
            const timeLeft = getTimeLeft(ticket.priority, ticket.created_at)
            const c = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium

            return (
              <div key={ticket.id} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${c.bg} ${c.text}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-hope-secondary">{ticket.id}</span>
                    {!ticket.assignee && (
                      <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        Unassigned
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium text-hope-ink dark:text-slate-100">{ticket.title}</p>
                  {/* SLA progress bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hope-border dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-orange-400' : c.bar
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <span className={`shrink-0 text-[11px] font-semibold ${
                      timeLeft.breached ? 'text-red-600' : timeLeft.warning ? 'text-orange-500' : 'text-hope-secondary'
                    }`}>
                      {timeLeft.label}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-hope-secondary">{ticket.assignee || '—'}</p>
                  <p className="text-xs text-hope-secondary">{Math.round(pct)}% SLA used</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
