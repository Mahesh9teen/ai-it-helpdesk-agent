import React, { useEffect, useRef, useState, useCallback } from 'react'
import { FiSearch, FiTag, FiUser, FiFileText, FiMessageCircle, FiClock, FiX, FiArrowRight } from 'react-icons/fi'
import { getApiBase } from '../lib/apiBase'

const API_BASE = getApiBase()

const SAMPLE_RESULTS = {
  tickets: [
    { id: 'TKT-091', title: 'Laptop screen flickering after Windows update', status: 'open', priority: 'medium', created: '2 hours ago' },
    { id: 'TKT-087', title: 'VPN intermittent disconnections', status: 'escalated', priority: 'high', created: '1 day ago' },
    { id: 'TKT-072', title: 'Outlook calendar not syncing with Teams', status: 'resolved', priority: 'low', created: '3 days ago' },
  ],
  employees: [
    { id: 'EMP-001', name: 'Sarah Mitchell', department: 'Engineering', email: 'sarah.m@company.com' },
    { id: 'EMP-044', name: 'Sarah Johnson', department: 'Finance', email: 'sarah.j@company.com' },
  ],
  kb: [
    { id: 'KB-012', title: 'How to connect to office VPN from home', views: 842, category: 'Network' },
    { id: 'KB-031', title: 'Windows update troubleshooting guide', views: 411, category: 'OS' },
  ],
  chats: [
    { id: 'CHAT-201', summary: 'Password reset for user emp_045', date: '2026-07-05' },
    { id: 'CHAT-198', summary: 'Software installation request for Figma', date: '2026-07-04' },
  ],
}

const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  escalated: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const PRIORITY_COLORS = {
  critical: 'text-red-600', high: 'text-orange-500', medium: 'text-yellow-600', low: 'text-blue-500'
}

const SCOPES = [
  { id: 'all', label: 'All', icon: FiSearch },
  { id: 'tickets', label: 'Tickets', icon: FiTag },
  { id: 'employees', label: 'Employees', icon: FiUser },
  { id: 'kb', label: 'Knowledge Base', icon: FiFileText },
  { id: 'chats', label: 'Chat History', icon: FiMessageCircle },
]

function highlight(text, query) {
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-700/50">{part}</mark>
      : part
  )
}

export default function SmartSearch() {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('all')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState(['VPN issue', 'password reset', 'Figma install'])
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults(null); return }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}&scope=${scope}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      } else {
        // fallback demo results
        await new Promise(r => setTimeout(r, 300))
        const filtered = Object.fromEntries(
          Object.entries(SAMPLE_RESULTS).map(([key, items]) => [
            key,
            items.filter(item => {
              const text = JSON.stringify(item).toLowerCase()
              return text.includes(q.toLowerCase())
            })
          ])
        )
        setResults(filtered)
      }
    } catch {
      await new Promise(r => setTimeout(r, 300))
      setResults(SAMPLE_RESULTS)
    } finally {
      setLoading(false)
    }
  }, [scope])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        doSearch(query)
        setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5))
      } else {
        setResults(null)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  const totalHits = results
    ? Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0)
    : 0

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100">Smart Search</h2>
        <p className="text-sm text-hope-secondary dark:text-slate-400">Fuzzy search across tickets, employees, knowledge base, and chat history</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <FiSearch className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-hope-secondary" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search everything... (e.g. 'VPN issue', 'Sarah', 'KB-012')"
          className="hope-input w-full py-3 pl-11 pr-10 text-base"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults(null) }}
            className="absolute right-3 top-3 rounded p-0.5 text-hope-secondary hover:text-hope-primary"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-3.5 h-5 w-5 animate-spin rounded-full border-2 border-hope-primary border-t-transparent" />
        )}
      </div>

      {/* Scope filter */}
      <div className="flex flex-wrap gap-2">
        {SCOPES.map(s => (
          <button
            key={s.id}
            onClick={() => setScope(s.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              scope === s.id ? 'bg-hope-primary text-white' : 'bg-hope-canvas text-hope-secondary hover:bg-hope-primary/10 dark:bg-slate-800'
            }`}
          >
            <s.icon className="h-3.5 w-3.5" /> {s.label}
          </button>
        ))}
      </div>

      {/* No query state */}
      {!query && (
        <div className="hope-card p-5">
          <p className="mb-3 text-sm font-medium text-hope-secondary">Recent searches</p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map(s => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="flex items-center gap-1.5 rounded-lg bg-hope-canvas px-3 py-1.5 text-sm text-hope-ink hover:bg-hope-primary/10 dark:bg-slate-800 dark:text-slate-300"
              >
                <FiClock className="h-3.5 w-3.5 text-hope-secondary" /> {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <p className="text-sm text-hope-secondary">
            {totalHits} result{totalHits !== 1 ? 's' : ''} for "{query}"
          </p>

          {/* Tickets */}
          {(scope === 'all' || scope === 'tickets') && results.tickets?.length > 0 && (
            <div className="hope-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-hope-border px-5 py-3 dark:border-slate-700">
                <FiTag className="h-4 w-4 text-hope-primary" />
                <span className="text-sm font-semibold text-hope-ink dark:text-slate-100">Tickets</span>
                <span className="ml-auto rounded-full bg-hope-primary/10 px-2 py-0.5 text-xs font-semibold text-hope-primary">
                  {results.tickets.length}
                </span>
              </div>
              <div className="divide-y divide-hope-border dark:divide-slate-800">
                {results.tickets.map(t => (
                  <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-hope-canvas dark:hover:bg-slate-800/50">
                    <span className="text-xs font-mono text-hope-secondary shrink-0">{t.id}</span>
                    <p className="flex-1 text-sm text-hope-ink dark:text-slate-100">{highlight(t.title, query)}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[t.status] || ''}`}>{t.status}</span>
                    <span className={`shrink-0 text-xs font-semibold ${PRIORITY_COLORS[t.priority] || ''}`}>{t.priority}</span>
                    <FiArrowRight className="h-4 w-4 shrink-0 text-hope-secondary" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employees */}
          {(scope === 'all' || scope === 'employees') && results.employees?.length > 0 && (
            <div className="hope-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-hope-border px-5 py-3 dark:border-slate-700">
                <FiUser className="h-4 w-4 text-hope-primary" />
                <span className="text-sm font-semibold text-hope-ink dark:text-slate-100">Employees</span>
                <span className="ml-auto rounded-full bg-hope-primary/10 px-2 py-0.5 text-xs font-semibold text-hope-primary">
                  {results.employees.length}
                </span>
              </div>
              <div className="divide-y divide-hope-border dark:divide-slate-800">
                {results.employees.map(e => (
                  <div key={e.id} className="flex items-center gap-3 px-5 py-3 hover:bg-hope-canvas dark:hover:bg-slate-800/50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hope-primary/10 text-xs font-bold text-hope-primary">
                      {e.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-hope-ink dark:text-slate-100">{highlight(e.name, query)}</p>
                      <p className="text-xs text-hope-secondary">{e.department} · {e.email}</p>
                    </div>
                    <FiArrowRight className="h-4 w-4 shrink-0 text-hope-secondary" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Base */}
          {(scope === 'all' || scope === 'kb') && results.kb?.length > 0 && (
            <div className="hope-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-hope-border px-5 py-3 dark:border-slate-700">
                <FiFileText className="h-4 w-4 text-hope-primary" />
                <span className="text-sm font-semibold text-hope-ink dark:text-slate-100">Knowledge Base</span>
                <span className="ml-auto rounded-full bg-hope-primary/10 px-2 py-0.5 text-xs font-semibold text-hope-primary">
                  {results.kb.length}
                </span>
              </div>
              <div className="divide-y divide-hope-border dark:divide-slate-800">
                {results.kb.map(k => (
                  <div key={k.id} className="flex items-center gap-3 px-5 py-3 hover:bg-hope-canvas dark:hover:bg-slate-800/50">
                    <span className="text-xs font-mono text-hope-secondary shrink-0">{k.id}</span>
                    <div className="flex-1">
                      <p className="text-sm text-hope-ink dark:text-slate-100">{highlight(k.title, query)}</p>
                      <p className="text-xs text-hope-secondary">{k.category} · {k.views} views</p>
                    </div>
                    <FiArrowRight className="h-4 w-4 shrink-0 text-hope-secondary" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat History */}
          {(scope === 'all' || scope === 'chats') && results.chats?.length > 0 && (
            <div className="hope-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-hope-border px-5 py-3 dark:border-slate-700">
                <FiMessageCircle className="h-4 w-4 text-hope-primary" />
                <span className="text-sm font-semibold text-hope-ink dark:text-slate-100">Chat History</span>
                <span className="ml-auto rounded-full bg-hope-primary/10 px-2 py-0.5 text-xs font-semibold text-hope-primary">
                  {results.chats.length}
                </span>
              </div>
              <div className="divide-y divide-hope-border dark:divide-slate-800">
                {results.chats.map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-hope-canvas dark:hover:bg-slate-800/50">
                    <span className="text-xs font-mono text-hope-secondary shrink-0">{c.id}</span>
                    <div className="flex-1">
                      <p className="text-sm text-hope-ink dark:text-slate-100">{highlight(c.summary, query)}</p>
                      <p className="text-xs text-hope-secondary">{c.date}</p>
                    </div>
                    <FiArrowRight className="h-4 w-4 shrink-0 text-hope-secondary" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalHits === 0 && (
            <div className="hope-card p-8 text-center">
              <FiSearch className="mx-auto mb-3 h-10 w-10 text-hope-secondary/40" />
              <p className="font-medium text-hope-ink dark:text-slate-200">No results for "{query}"</p>
              <p className="mt-1 text-sm text-hope-secondary">Try different keywords or broader search terms</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
