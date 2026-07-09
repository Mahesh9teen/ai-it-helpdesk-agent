import React, { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FiInbox, FiTrendingUp, FiAlertTriangle, FiClock } from 'react-icons/fi'
import { getApiBase } from '../lib/apiBase'

const API_BASE = getApiBase()

const cardClass = 'hope-card'

const statCards = [
  { key: 'total_tickets', label: 'Total Tickets', icon: FiInbox, tint: 'bg-hope-primary/10 text-hope-primary', suffix: '' },
  { key: 'escalation_rate', label: 'Escalation Rate', icon: FiTrendingUp, tint: 'bg-hope-warning/15 text-hope-warning', suffix: '%' },
  { key: 'escalated_tickets', label: 'Escalated', icon: FiAlertTriangle, tint: 'bg-hope-danger/10 text-hope-danger', suffix: '' },
  { key: 'avg_resolution_hours', label: 'Avg Resolution (hrs)', icon: FiClock, tint: 'bg-hope-success/10 text-hope-success', suffix: '' },
]

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState({ total_tickets: 0, escalated_tickets: 0, escalation_rate: 0, avg_resolution_hours: 0 })
  const [byCategory, setByCategory] = useState([])
  const [trend, setTrend] = useState([])
  const [question, setQuestion] = useState('Why are tickets increasing this week?')
  const [managerAnswer, setManagerAnswer] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [summaryRes, categoryRes, trendRes] = await Promise.all([
          fetch(`${API_BASE}/analytics/summary`),
          fetch(`${API_BASE}/analytics/by-category`),
          fetch(`${API_BASE}/analytics/trend`),
        ])

        const [summaryJson, categoryJson, trendJson] = await Promise.all([
          summaryRes.json(),
          categoryRes.json(),
          trendRes.json(),
        ])

        if (!active) return
        setSummary(summaryJson)
        setByCategory(categoryJson.items || [])
        setTrend(trendJson.items || [])
      } catch {
        if (!active) return
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const askManager = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      if (!response.ok) {
        throw new Error('ask failed')
      }
      const payload = await response.json()
      setManagerAnswer(payload.answer || 'No answer returned.')
    } catch {
      setManagerAnswer('Unable to query ManagerAgent right now.')
    }
  }

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, tint, suffix }) => (
          <article key={key} className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-hope-secondary">{label}</p>
                <p className="mt-2 text-2xl font-bold text-hope-ink dark:text-slate-100">
                  {summary[key]}{suffix}
                </p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tint}`}>
                <Icon className="h-6 w-6" />
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <article className={cardClass}>
          <div className="hope-card-header">
            <p className="hope-card-title">Tickets by Category</p>
          </div>
          <div className="hope-card-body h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3a57e8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={cardClass}>
          <div className="hope-card-header">
            <p className="hope-card-title">Ticket Volume Trend</p>
          </div>
          <div className="hope-card-body h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1aa053" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <article className={cardClass}>
        <div className="hope-card-header">
          <p className="hope-card-title">Ask ManagerAgent</p>
        </div>
        <div className="hope-card-body">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="h-10 flex-1 rounded-xl border border-hope-border bg-hope-canvas px-3 text-sm text-hope-ink outline-none transition focus:border-hope-primary focus:bg-white focus:ring-2 focus:ring-hope-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <button type="button" onClick={askManager} className="hope-btn-primary">
              Ask
            </button>
          </div>
          {managerAnswer ? <p className="mt-3 text-sm text-hope-ink dark:text-slate-200">{managerAnswer}</p> : null}
        </div>
      </article>
    </section>
  )
}
