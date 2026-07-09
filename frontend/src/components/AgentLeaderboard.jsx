import React, { useEffect, useState } from 'react'
import { FiAward, FiTrendingUp, FiTrendingDown, FiMinus, FiStar, FiClock, FiCheckCircle, FiZap } from 'react-icons/fi'

const MOCK_AGENTS = [
  { id: 1, name: 'Sarah Mitchell', avatar: 'SM', tickets_resolved: 87, avg_resolution_h: 2.1, satisfaction: 4.9, first_contact_rate: 93, escalation_rate: 2, trend: 'up', streak: 5 },
  { id: 2, name: 'Alex Rodriguez', avatar: 'AR', tickets_resolved: 74, avg_resolution_h: 2.8, satisfaction: 4.7, first_contact_rate: 88, escalation_rate: 4, trend: 'up', streak: 3 },
  { id: 3, name: 'Chen Wei', avatar: 'CW', tickets_resolved: 65, avg_resolution_h: 3.4, satisfaction: 4.5, first_contact_rate: 82, escalation_rate: 7, trend: 'down', streak: 0 },
  { id: 4, name: 'Jay Patel', avatar: 'JP', tickets_resolved: 61, avg_resolution_h: 3.1, satisfaction: 4.6, first_contact_rate: 85, escalation_rate: 5, trend: 'stable', streak: 1 },
  { id: 5, name: 'Emma Clarke', avatar: 'EC', tickets_resolved: 53, avg_resolution_h: 4.2, satisfaction: 4.3, first_contact_rate: 79, escalation_rate: 9, trend: 'up', streak: 2 },
]

const RANK_COLORS = ['text-yellow-500', 'text-slate-400', 'text-amber-600', 'text-hope-secondary', 'text-hope-secondary']
const RANK_ICONS = ['🥇', '🥈', '🥉', '4', '5']

const METRICS = [
  { key: 'tickets_resolved', label: 'Resolved', icon: FiCheckCircle, suffix: '', higher_is_better: true },
  { key: 'avg_resolution_h', label: 'Avg Resolution', icon: FiClock, suffix: 'h', higher_is_better: false },
  { key: 'satisfaction', label: 'CSAT', icon: FiStar, suffix: '/5', higher_is_better: true },
  { key: 'first_contact_rate', label: 'First-Contact Rate', icon: FiZap, suffix: '%', higher_is_better: true },
]

function TrendBadge({ trend }) {
  if (trend === 'up') return <FiTrendingUp className="h-4 w-4 text-green-500" />
  if (trend === 'down') return <FiTrendingDown className="h-4 w-4 text-red-400" />
  return <FiMinus className="h-4 w-4 text-hope-secondary" />
}

function ScoreBar({ value, max, good }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-hope-border dark:bg-slate-700">
      <div
        className={`h-full rounded-full transition-all ${good ? 'bg-green-500' : 'bg-red-400'}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  )
}

export default function AgentLeaderboard() {
  const [sortBy, setSortBy] = useState('tickets_resolved')
  const [period, setPeriod] = useState('week')
  const [agents, setAgents] = useState(MOCK_AGENTS)

  const sorted = [...agents].sort((a, b) => {
    const meta = METRICS.find(m => m.key === sortBy)
    return meta?.higher_is_better ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]
  })

  const top = sorted[0]

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100 flex items-center gap-2">
            <FiAward className="h-5 w-5 text-yellow-500" /> Agent Leaderboard
          </h2>
          <p className="text-sm text-hope-secondary dark:text-slate-400">Ranked by resolution performance · updated daily</p>
        </div>
        <div className="flex items-center gap-2">
          {['today', 'week', 'month'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p ? 'bg-hope-primary text-white' : 'bg-hope-canvas text-hope-secondary hover:bg-hope-primary/10 dark:bg-slate-800'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Top performer spotlight */}
      {top && (
        <div className="hope-card flex items-center gap-5 bg-gradient-to-r from-hope-primary/5 to-transparent p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 text-xl font-bold text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
            {top.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🥇</span>
              <p className="font-bold text-hope-ink dark:text-slate-100">{top.name}</p>
              {top.streak > 0 && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  🔥 {top.streak}-week streak
                </span>
              )}
            </div>
            <p className="text-sm text-hope-secondary">
              {top.tickets_resolved} tickets resolved · {top.satisfaction}/5 CSAT · {top.first_contact_rate}% first-contact rate
            </p>
          </div>
          <FiStar className="h-8 w-8 text-yellow-400" />
        </div>
      )}

      {/* Sort controls */}
      <div className="flex flex-wrap gap-2">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setSortBy(m.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              sortBy === m.key ? 'bg-hope-primary text-white' : 'bg-hope-canvas text-hope-secondary hover:bg-hope-primary/10 dark:bg-slate-800'
            }`}
          >
            <m.icon className="h-3.5 w-3.5" /> {m.label}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="hope-card overflow-hidden">
        <div className="divide-y divide-hope-border dark:divide-slate-800">
          {sorted.map((agent, idx) => (
            <div key={agent.id} className="flex items-center gap-4 px-5 py-4">
              {/* Rank */}
              <span className={`w-7 shrink-0 text-center text-lg font-bold ${RANK_COLORS[idx] || 'text-hope-secondary'}`}>
                {RANK_ICONS[idx] || idx + 1}
              </span>

              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hope-primary/10 text-sm font-bold text-hope-primary dark:bg-hope-primary/20">
                {agent.avatar}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-hope-ink dark:text-slate-100">{agent.name}</p>
                  <TrendBadge trend={agent.trend} />
                </div>
                <div className="mt-2 grid grid-cols-4 gap-3">
                  {METRICS.map(m => (
                    <div key={m.key}>
                      <p className="text-[10px] text-hope-secondary">{m.label}</p>
                      <p className={`text-sm font-semibold ${sortBy === m.key ? 'text-hope-primary' : 'text-hope-ink dark:text-slate-100'}`}>
                        {agent[m.key]}{m.suffix}
                      </p>
                      <ScoreBar
                        value={agent[m.key]}
                        max={m.key === 'tickets_resolved' ? 100 : m.key === 'avg_resolution_h' ? 8 : m.key === 'satisfaction' ? 5 : 100}
                        good={m.higher_is_better ? agent[m.key] > (m.key === 'satisfaction' ? 4 : m.key === 'first_contact_rate' ? 80 : 50) : agent[m.key] < 4}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Escalation badge */}
              <div className="shrink-0 text-right">
                <p className="text-xs text-hope-secondary">Escalation</p>
                <p className={`text-sm font-bold ${agent.escalation_rate <= 3 ? 'text-green-600' : agent.escalation_rate <= 6 ? 'text-orange-500' : 'text-red-500'}`}>
                  {agent.escalation_rate}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
