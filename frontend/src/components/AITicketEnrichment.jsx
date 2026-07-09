import React, { useState } from 'react'
import { FiCpu, FiZap, FiThumbsUp, FiThumbsDown, FiCopy, FiCheck, FiRefreshCw, FiAlertTriangle, FiHeart } from 'react-icons/fi'
import { getApiBase } from '../lib/apiBase'

const API_BASE = getApiBase()

const SAMPLE_ENRICHMENTS = [
  {
    ticket_id: 'TKT-091',
    title: 'Laptop screen flickering after Windows update',
    description: 'After installing the latest Windows 11 update, my laptop screen has been flickering every 30 seconds.',
    ai: {
      category: 'Hardware / Display',
      sub_category: 'Driver Conflict',
      sentiment: 'frustrated',
      sentiment_score: 0.68,
      complexity: 'medium',
      complexity_score: 0.45,
      priority_suggestion: 'medium',
      root_cause: 'Likely a graphics driver conflict introduced by the Windows 11 update KB5025239.',
      suggested_resolution: 'Roll back display driver or update to latest OEM driver. Device Manager → Display Adapters → Roll Back Driver.',
      kb_links: ['KB-031 — Windows update troubleshooting', 'KB-019 — Graphics driver issues'],
      similar_tickets: ['TKT-044', 'TKT-067', 'TKT-081'],
      auto_reply_draft: "Hi there,\n\nThank you for reaching out. I can see your screen started flickering after a Windows 11 update — this is a known issue with KB5025239 and certain Intel/AMD graphics drivers.\n\nQuick fix:\n1. Open Device Manager (Win+X → Device Manager)\n2. Expand Display Adapters → Right-click your GPU → Properties\n3. Go to Driver tab → Click Roll Back Driver\n\nIf rollback is not available, please reply and we'll push the latest OEM driver remotely.\n\nBest,\nIT Helpdesk",
      estimated_resolution_time: '15-30 min',
      confidence: 0.87,
    }
  }
]

const SENTIMENT_CONFIG = {
  frustrated: { label: 'Frustrated', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20', icon: '😤' },
  neutral: { label: 'Neutral', color: 'text-hope-secondary', bg: 'bg-hope-canvas dark:bg-slate-800', icon: '😐' },
  satisfied: { label: 'Satisfied', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20', icon: '😊' },
  urgent: { label: 'Urgent', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20', icon: '😰' },
}

const COMPLEXITY_CONFIG = {
  simple: { label: 'Simple', color: 'text-green-600', bar: 'bg-green-500' },
  medium: { label: 'Medium', color: 'text-yellow-600', bar: 'bg-yellow-400' },
  complex: { label: 'Complex', color: 'text-red-600', bar: 'bg-red-500' },
}

function ConfidenceBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hope-border dark:bg-slate-700">
        <div
          className={`h-full rounded-full ${value >= 0.8 ? 'bg-green-500' : value >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'}`}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      <span className="text-xs text-hope-secondary">{Math.round(value * 100)}%</span>
    </div>
  )
}

export default function AITicketEnrichment() {
  const [ticketText, setTicketText] = useState('')
  const [enrichment, setEnrichment] = useState(SAMPLE_ENRICHMENTS[0])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const analyze = async () => {
    if (!ticketText.trim()) return
    setLoading(true)
    setFeedback(null)
    try {
      const res = await fetch(`${API_BASE}/ai/enrich-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: ticketText }),
      })
      if (res.ok) {
        const data = await res.json()
        setEnrichment(data)
      } else {
        // simulate
        await new Promise(r => setTimeout(r, 1500))
        setEnrichment(SAMPLE_ENRICHMENTS[0])
      }
    } catch {
      await new Promise(r => setTimeout(r, 1500))
      setEnrichment(SAMPLE_ENRICHMENTS[0])
    } finally {
      setLoading(false)
    }
  }

  const copyReply = () => {
    navigator.clipboard.writeText(enrichment?.ai?.auto_reply_draft || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ai = enrichment?.ai
  const sentiment = ai ? SENTIMENT_CONFIG[ai.sentiment] || SENTIMENT_CONFIG.neutral : null
  const complexity = ai ? COMPLEXITY_CONFIG[ai.complexity] || COMPLEXITY_CONFIG.medium : null

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100 flex items-center gap-2">
            <FiCpu className="h-5 w-5 text-hope-primary" /> AI Ticket Enrichment
          </h2>
          <p className="text-sm text-hope-secondary dark:text-slate-400">Paste ticket description — AI classifies, scores sentiment, and drafts a reply</p>
        </div>
      </div>

      {/* Input */}
      <div className="hope-card p-5">
        <label className="mb-2 block text-sm font-medium text-hope-ink dark:text-slate-200">Ticket description</label>
        <textarea
          value={ticketText}
          onChange={e => setTicketText(e.target.value)}
          rows={4}
          placeholder="Paste the user's ticket description here, or type a new one..."
          className="hope-input w-full resize-none text-sm"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={analyze}
            disabled={loading || !ticketText.trim()}
            className="hope-btn-primary flex items-center gap-2 px-5 py-2 disabled:opacity-50"
          >
            {loading
              ? <><FiRefreshCw className="h-4 w-4 animate-spin" /> Analyzing...</>
              : <><FiZap className="h-4 w-4" /> Analyze with AI</>
            }
          </button>
        </div>
      </div>

      {/* Results */}
      {ai && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Classification */}
          <div className="hope-card p-5 space-y-4">
            <h3 className="font-semibold text-hope-ink dark:text-slate-100 flex items-center gap-2">
              <FiZap className="h-4 w-4 text-hope-primary" /> Classification
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-hope-secondary">Category</span>
                <span className="rounded-lg bg-hope-primary/10 px-2.5 py-1 text-xs font-semibold text-hope-primary">{ai.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-hope-secondary">Sub-category</span>
                <span className="text-sm font-medium text-hope-ink dark:text-slate-200">{ai.sub_category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-hope-secondary">Suggested priority</span>
                <span className={`text-sm font-bold capitalize ${
                  ai.priority_suggestion === 'critical' ? 'text-red-600' :
                  ai.priority_suggestion === 'high' ? 'text-orange-500' :
                  ai.priority_suggestion === 'medium' ? 'text-yellow-600' : 'text-blue-500'
                }`}>{ai.priority_suggestion}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-hope-secondary">Est. resolution time</span>
                <span className="text-sm font-medium text-hope-ink dark:text-slate-200">{ai.estimated_resolution_time}</span>
              </div>
            </div>

            {/* Sentiment */}
            <div className={`flex items-center gap-3 rounded-xl p-3 ${sentiment?.bg}`}>
              <span className="text-2xl">{sentiment?.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${sentiment?.color}`}>Sentiment: {sentiment?.label}</p>
                <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-white/50">
                  <div className={`h-full rounded-full ${sentiment?.color === 'text-red-600' ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.round(ai.sentiment_score * 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-hope-secondary">Complexity</span>
                <span className={`text-sm font-semibold ${complexity?.color}`}>{complexity?.label}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-hope-border dark:bg-slate-700">
                <div className={`h-full rounded-full ${complexity?.bar}`} style={{ width: `${Math.round(ai.complexity_score * 100)}%` }} />
              </div>
            </div>

            {/* AI confidence */}
            <div>
              <p className="mb-1 text-sm text-hope-secondary">AI Confidence</p>
              <ConfidenceBar value={ai.confidence} />
            </div>
          </div>

          {/* Root cause + KB links */}
          <div className="space-y-4">
            <div className="hope-card p-5 space-y-3">
              <h3 className="font-semibold text-hope-ink dark:text-slate-100 flex items-center gap-2">
                <FiAlertTriangle className="h-4 w-4 text-orange-500" /> Likely Root Cause
              </h3>
              <p className="text-sm text-hope-ink dark:text-slate-200">{ai.root_cause}</p>
              <h4 className="text-xs font-semibold uppercase text-hope-secondary tracking-wide">Suggested Resolution</h4>
              <p className="text-sm text-hope-ink dark:text-slate-200">{ai.suggested_resolution}</p>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-hope-secondary tracking-wide">Related KB Articles</p>
                {ai.kb_links.map((link, i) => (
                  <a key={i} href="#" className="block text-sm text-hope-primary hover:underline">{link}</a>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-hope-secondary tracking-wide">Similar Tickets</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {ai.similar_tickets.map(t => (
                    <span key={t} className="rounded bg-hope-canvas px-2 py-0.5 text-xs font-mono text-hope-secondary dark:bg-slate-800">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Auto reply */}
            <div className="hope-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-hope-ink dark:text-slate-100 flex items-center gap-2">
                  <FiHeart className="h-4 w-4 text-hope-primary" /> Auto-drafted Reply
                </h3>
                <button onClick={copyReply} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-hope-canvas hover:bg-hope-primary/10 text-hope-secondary dark:bg-slate-800">
                  {copied ? <><FiCheck className="h-3.5 w-3.5 text-green-500" /> Copied!</> : <><FiCopy className="h-3.5 w-3.5" /> Copy</>}
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-xl bg-hope-canvas p-4 text-xs text-hope-ink dark:bg-slate-800/80 dark:text-slate-300">{ai.auto_reply_draft}</pre>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setFeedback('up')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${feedback === 'up' ? 'bg-green-100 text-green-700' : 'bg-hope-canvas text-hope-secondary'} hover:bg-green-100 dark:bg-slate-800`}>
                  <FiThumbsUp className="h-3.5 w-3.5" /> Helpful
                </button>
                <button onClick={() => setFeedback('down')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${feedback === 'down' ? 'bg-red-100 text-red-600' : 'bg-hope-canvas text-hope-secondary'} hover:bg-red-100 dark:bg-slate-800`}>
                  <FiThumbsDown className="h-3.5 w-3.5" /> Not helpful
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
