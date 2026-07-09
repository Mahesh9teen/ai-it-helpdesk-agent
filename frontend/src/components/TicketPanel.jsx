import { useEffect, useMemo, useState } from 'react'
import React from 'react'
import { getApiBase } from '../lib/apiBase'

const API_BASE = getApiBase()

const badgeStyles = {
  open: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  in_progress: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
  escalated: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
}

const toDisplayStatus = (ticket) => {
  if (ticket.priority === 'urgent' && ticket.status === 'open') {
    return 'escalated'
  }
  if (ticket.status === 'new' || ticket.status === 'open') {
    return 'open'
  }
  if (ticket.status === 'in_progress') {
    return 'in_progress'
  }
  return 'resolved'
}

const statusLabel = (status) => {
  if (status === 'in_progress') {
    return 'In Progress'
  }
  if (status === 'escalated') {
    return 'Escalated'
  }
  if (status === 'resolved') {
    return 'Resolved'
  }
  return 'Open'
}

export default function TicketPanel({ employeeId }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportStatus, setReportStatus] = useState({})
  const [analysisByTicket, setAnalysisByTicket] = useState({})
  const [activeTabByTicket, setActiveTabByTicket] = useState({})

  useEffect(() => {
    if (!employeeId) {
      setTickets([])
      return
    }

    const controller = new AbortController()

    const fetchTickets = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`${API_BASE}/tickets?employee_id=${encodeURIComponent(employeeId)}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Ticket request failed')
        }
        const payload = await response.json()
        setTickets(Array.isArray(payload.tickets) ? payload.tickets : [])
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('Unable to load tickets for this employee ID.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
    return () => controller.abort()
  }, [employeeId])

  const openTickets = useMemo(
    () => tickets,
    [tickets],
  )

  const generateIncidentReport = async (ticketId) => {
    setReportStatus((current) => ({ ...current, [ticketId]: 'Generating report...' }))
    try {
      const response = await fetch(`${API_BASE}/tickets/${ticketId}/incident-report`, { method: 'POST' })
      if (!response.ok) {
        throw new Error('report generation failed')
      }
      setReportStatus((current) => ({ ...current, [ticketId]: 'Incident report ready' }))
    } catch {
      setReportStatus((current) => ({ ...current, [ticketId]: 'Unable to generate report' }))
    }
  }

  const loadAnalysis = async (ticketId) => {
    setActiveTabByTicket((current) => ({ ...current, [ticketId]: 'analysis' }))
    if (analysisByTicket[ticketId]) {
      return
    }
    setAnalysisByTicket((current) => ({ ...current, [ticketId]: { loading: true } }))
    try {
      const response = await fetch(`${API_BASE}/tickets/${ticketId}/analyze-root-cause`, { method: 'POST' })
      if (!response.ok) {
        throw new Error('analysis failed')
      }
      const payload = await response.json()
      setAnalysisByTicket((current) => ({ ...current, [ticketId]: { loading: false, data: payload } }))
    } catch {
      setAnalysisByTicket((current) => ({ ...current, [ticketId]: { loading: false, error: 'Unable to load AI analysis' } }))
    }
  }

  return (
    <article className="flex min-h-[72vh] flex-col rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
      <header className="mb-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Tickets</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">Ticket queue</h2>
      </header>

      {!employeeId ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
          Add an employee UUID above to load that user&apos;s ticket queue.
        </p>
      ) : null}

      {loading ? <p className="text-sm text-slate-500 dark:text-slate-400">Loading tickets...</p> : null}
      {error ? <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{error}</p> : null}

      <div className="space-y-3">
        {openTickets.map((ticket) => {
          const displayStatus = toDisplayStatus(ticket)
          return (
            <article
              key={ticket.ticket_id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{ticket.subject}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{ticket.description || 'No description provided.'}</p>
                  {ticket.summary ? <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">{ticket.summary}</p> : null}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeStyles[displayStatus]}`}>
                  {statusLabel(displayStatus)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-mono text-[11px]">{ticket.ticket_id}</span>
                <span className="capitalize">Priority: {ticket.priority || 'medium'} | Category: {ticket.category || 'Other'}</span>
              </div>
              {ticket.assigned_agent_id ? (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Assigned Agent: <span className="font-mono">{ticket.assigned_agent_id}</span></p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTabByTicket((current) => ({ ...current, [ticket.ticket_id]: 'details' }))}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => loadAnalysis(ticket.ticket_id)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  AI Analysis
                </button>
                <button
                  type="button"
                  onClick={() => generateIncidentReport(ticket.ticket_id)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Generate Incident Report
                </button>
                <a
                  href={`${API_BASE}/tickets/${ticket.ticket_id}/incident-report/markdown`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Markdown
                </a>
                <a
                  href={`${API_BASE}/tickets/${ticket.ticket_id}/incident-report/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  PDF
                </a>
                {reportStatus[ticket.ticket_id] ? <span className="text-slate-500 dark:text-slate-400">{reportStatus[ticket.ticket_id]}</span> : null}
              </div>
              {activeTabByTicket[ticket.ticket_id] === 'analysis' ? (
                <div className="mt-2 rounded-md border border-indigo-200 bg-indigo-50 p-2 text-xs text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">
                  {analysisByTicket[ticket.ticket_id]?.loading ? <p>Analyzing root cause...</p> : null}
                  {analysisByTicket[ticket.ticket_id]?.error ? <p>{analysisByTicket[ticket.ticket_id].error}</p> : null}
                  {analysisByTicket[ticket.ticket_id]?.data ? (
                    <div className="space-y-1">
                      <p><strong>Likely Cause:</strong> {analysisByTicket[ticket.ticket_id].data.likely_cause}</p>
                      <p><strong>Confidence:</strong> {Math.round((analysisByTicket[ticket.ticket_id].data.confidence || 0) * 100)}%</p>
                      <p><strong>Affected Systems:</strong> {(analysisByTicket[ticket.ticket_id].data.affected_systems || []).join(', ') || 'n/a'}</p>
                      <p><strong>Permanent Fix:</strong> {analysisByTicket[ticket.ticket_id].data.recommended_permanent_fix}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          )
        })}

        {!loading && employeeId && openTickets.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
            No tickets found for this employee.
          </p>
        ) : null}
      </div>
    </article>
  )
}
