import React, { useState } from 'react'
import { FiGitPullRequest, FiClock, FiCheck, FiX, FiAlertTriangle, FiPlus, FiUser, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi'

const CHANGE_TYPES = [
  { value: 'standard', label: 'Standard', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', desc: 'Pre-approved recurring changes' },
  { value: 'normal', label: 'Normal', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', desc: 'Requires CAB approval' },
  { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', desc: 'Urgent; eCAB approval required' },
]

const RISKS = ['low', 'medium', 'high', 'critical']

const INITIAL_REQUESTS = [
  {
    id: 'CHG-001', title: 'Deploy ERP database connection pool fix', type: 'emergency',
    status: 'approved', risk: 'high', raised_by: 'Chen W.',
    scheduled: '2026-07-06T22:00:00', cab_members: ['Sarah M.', 'Jay P.', 'Alex R.'],
    votes: { approve: 3, reject: 0 },
    description: 'Hotfix for DB pool exhaustion causing ERP outage INC-001. Tested on staging. Downtime: 0 (rolling deploy).',
    rollback: 'Revert to previous Docker image. Automated rollback script ready.',
    created: '2026-07-06T16:30:00',
  },
  {
    id: 'CHG-002', title: 'Upgrade Slack Workspace OAuth App permissions', type: 'normal',
    status: 'pending_approval', risk: 'medium', raised_by: 'Alex R.',
    scheduled: '2026-07-08T10:00:00', cab_members: ['Sarah M.', 'Jay P.'],
    votes: { approve: 1, reject: 0 },
    description: 'Requesting additional OAuth scopes for Slack bot: channels:read, users:read. Required for IntegrationHub feature.',
    rollback: 'Revoke added scopes via Slack admin panel.',
    created: '2026-07-06T10:15:00',
  },
  {
    id: 'CHG-003', title: 'Patch Tuesday — Windows security updates 200 workstations', type: 'standard',
    status: 'approved', risk: 'low', raised_by: 'Jay P.',
    scheduled: '2026-07-12T02:00:00', cab_members: ['Jay P.'],
    votes: { approve: 1, reject: 0 },
    description: 'Monthly Windows Update cycle. WSUS-managed rollout. Restart required for all workstations.',
    rollback: 'Uninstall KB via WSUS. Full rollback tested in pilot group of 10 machines.',
    created: '2026-07-05T14:00:00',
  },
]

const STATUS_CONFIG = {
  draft: { label: 'Draft', dot: 'bg-hope-secondary', text: 'text-hope-secondary' },
  pending_approval: { label: 'Pending CAB Approval', dot: 'bg-yellow-400', text: 'text-yellow-700 dark:text-yellow-400' },
  approved: { label: 'Approved', dot: 'bg-green-500', text: 'text-green-700 dark:text-green-400' },
  rejected: { label: 'Rejected', dot: 'bg-red-500', text: 'text-red-700 dark:text-red-400' },
  implemented: { label: 'Implemented', dot: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400' },
}

const RISK_CONFIG = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ChangeManagement() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'normal', risk: 'medium', description: '', rollback: '', scheduled: '' })
  const [filterStatus, setFilterStatus] = useState('all')

  const vote = (id, decision) => {
    setRequests(r => r.map(req => {
      if (req.id !== id) return req
      const newVotes = { ...req.votes, [decision]: req.votes[decision] + 1 }
      const newStatus = newVotes.approve >= 2 ? 'approved' : newVotes.reject >= 1 ? 'rejected' : req.status
      return { ...req, votes: newVotes, status: newStatus }
    }))
  }

  const submitForm = () => {
    if (!form.title.trim()) return
    const newReq = {
      id: `CHG-00${requests.length + 1}`,
      ...form,
      status: 'pending_approval',
      raised_by: 'You',
      cab_members: [],
      votes: { approve: 0, reject: 0 },
      created: new Date().toISOString(),
    }
    setRequests(r => [newReq, ...r])
    setShowForm(false)
    setForm({ title: '', type: 'normal', risk: 'medium', description: '', rollback: '', scheduled: '' })
  }

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus)
  const pendingCount = requests.filter(r => r.status === 'pending_approval').length

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100 flex items-center gap-2">
            <FiGitPullRequest className="h-5 w-5 text-hope-primary" /> Change Management
          </h2>
          <p className="text-sm text-hope-secondary dark:text-slate-400">
            CAB (Change Advisory Board) · {pendingCount} awaiting approval
          </p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="hope-btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <FiPlus className="h-4 w-4" /> Raise Change Request
        </button>
      </div>

      {/* Change type legend */}
      <div className="flex flex-wrap gap-3">
        {CHANGE_TYPES.map(t => (
          <div key={t.value} className="flex items-center gap-2 rounded-xl bg-hope-canvas p-3 dark:bg-slate-800/50">
            <span className={`rounded px-2 py-0.5 text-xs font-bold ${t.color}`}>{t.label}</span>
            <p className="text-xs text-hope-secondary">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* New request form */}
      {showForm && (
        <div className="hope-card p-5 space-y-4">
          <h3 className="font-semibold text-hope-ink dark:text-slate-100">New Change Request</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-hope-secondary">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="hope-input w-full text-sm" placeholder="Short description of change" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-hope-secondary">Change Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="hope-input w-full text-sm">
                {CHANGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-hope-secondary">Risk Level</label>
              <select value={form.risk} onChange={e => setForm(f => ({ ...f, risk: e.target.value }))} className="hope-input w-full text-sm">
                {RISKS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-hope-secondary">Scheduled Date/Time</label>
              <input type="datetime-local" value={form.scheduled} onChange={e => setForm(f => ({ ...f, scheduled: e.target.value }))} className="hope-input w-full text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-hope-secondary">Description & Impact</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="hope-input w-full resize-none text-sm" placeholder="What will be changed, why, and what is the impact?" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-hope-secondary">Rollback Plan</label>
              <textarea value={form.rollback} onChange={e => setForm(f => ({ ...f, rollback: e.target.value }))} rows={2} className="hope-input w-full resize-none text-sm" placeholder="How will you roll back if something goes wrong?" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={submitForm} className="hope-btn-primary px-4 py-2 text-sm">Submit for CAB Review</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-hope-border px-4 py-2 text-sm text-hope-secondary dark:border-slate-700">Cancel</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', ...Object.keys(STATUS_CONFIG)].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filterStatus === s ? 'bg-hope-primary text-white' : 'bg-hope-canvas text-hope-secondary hover:bg-hope-primary/10 dark:bg-slate-800'}`}>
            {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Requests */}
      <div className="space-y-3">
        {filtered.map(req => {
          const st = STATUS_CONFIG[req.status] || STATUS_CONFIG.draft
          const changeType = CHANGE_TYPES.find(t => t.value === req.type)
          const isExpanded = expanded === req.id

          return (
            <div key={req.id} className="hope-card overflow-hidden">
              <button onClick={() => setExpanded(e => e === req.id ? null : req.id)} className="flex w-full items-center gap-3 p-4 text-left">
                <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${changeType?.color}`}>{changeType?.label}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-hope-secondary">{req.id}</span>
                    <p className="truncate font-medium text-hope-ink dark:text-slate-100">{req.title}</p>
                    <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${RISK_CONFIG[req.risk]}`}>{req.risk} risk</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-xs">
                      <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                      <span className={st.text}>{st.label}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-hope-secondary">
                      <FiCalendar className="h-3 w-3" /> {formatDate(req.scheduled)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-hope-secondary">
                      <FiUser className="h-3 w-3" /> {req.raised_by}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {req.status === 'pending_approval' && (
                    <>
                      <button onClick={e => { e.stopPropagation(); vote(req.id, 'approve') }}
                        className="flex items-center gap-1 rounded-lg bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                        <FiCheck className="h-3.5 w-3.5" /> Approve ({req.votes.approve})
                      </button>
                      <button onClick={e => { e.stopPropagation(); vote(req.id, 'reject') }}
                        className="flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                        <FiX className="h-3.5 w-3.5" /> Reject ({req.votes.reject})
                      </button>
                    </>
                  )}
                  {isExpanded ? <FiChevronUp className="h-4 w-4 text-hope-secondary" /> : <FiChevronDown className="h-4 w-4 text-hope-secondary" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-hope-border px-5 pb-5 pt-4 dark:border-slate-700 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-hope-secondary tracking-wide mb-1">Description & Impact</p>
                    <p className="text-sm text-hope-ink dark:text-slate-200">{req.description}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-hope-secondary tracking-wide mb-1">Rollback Plan</p>
                    <p className="text-sm text-hope-ink dark:text-slate-200">{req.rollback}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-hope-secondary tracking-wide mb-1">CAB Members</p>
                    <div className="flex flex-wrap gap-2">
                      {req.cab_members.length > 0 ? req.cab_members.map(m => (
                        <span key={m} className="rounded-full bg-hope-primary/10 px-2.5 py-0.5 text-xs font-medium text-hope-primary">{m}</span>
                      )) : <span className="text-xs text-hope-secondary">No members assigned yet</span>}
                    </div>
                  </div>
                  {req.status === 'approved' && (
                    <button
                      onClick={() => setRequests(r => r.map(req2 => req2.id === req.id ? { ...req2, status: 'implemented' } : req2))}
                      className="hope-btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
                    >
                      <FiCheck className="h-4 w-4" /> Mark as Implemented
                    </button>
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
