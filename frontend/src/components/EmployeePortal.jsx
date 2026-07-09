import { useState } from 'react'
import {
  FiHome, FiPlusCircle, FiList, FiSearch, FiBell, FiUser,
  FiClock, FiCheckCircle, FiAlertCircle, FiXCircle, FiChevronRight,
  FiStar, FiMessageSquare, FiPaperclip, FiSend, FiRefreshCw,
  FiInfo, FiWifi, FiMonitor, FiLock, FiDownload, FiHelpCircle
} from 'react-icons/fi'

/* ─────────── Mock Data ─────────── */
const CURRENT_EMPLOYEE = {
  id: 'EMP-042',
  name: 'Alex Johnson',
  department: 'Marketing',
  email: 'alex.johnson@company.com',
  manager: 'Rachel Kim',
  avatar: 'AJ',
}

const MY_TICKETS = [
  { id: 'TKT-1021', title: 'Laptop running very slow', status: 'in_progress', priority: 'high', created: '2026-07-04', updated: '2026-07-06', agent: 'Sarah Mitchell', progress: 60 },
  { id: 'TKT-1018', title: 'Cannot connect to VPN from home', status: 'resolved', priority: 'high', created: '2026-07-01', updated: '2026-07-03', agent: 'Chen Wei', progress: 100 },
  { id: 'TKT-1015', title: 'Outlook keeps crashing on startup', status: 'pending', priority: 'medium', created: '2026-06-29', updated: '2026-07-05', agent: 'Jay Patel', progress: 30 },
  { id: 'TKT-1009', title: 'Request for Adobe Creative Suite', status: 'resolved', priority: 'low', created: '2026-06-20', updated: '2026-06-25', agent: 'Emma Clarke', progress: 100 },
  { id: 'TKT-1003', title: 'New monitor setup', status: 'resolved', priority: 'low', created: '2026-06-10', updated: '2026-06-12', agent: 'Jay Patel', progress: 100 },
]

const KB_QUICK = [
  { id: 1, title: 'Reset your password in 3 steps', category: 'Account', views: 1420, helpful: 98 },
  { id: 2, title: 'Connect to the office WiFi on any device', category: 'Network', views: 980, helpful: 96 },
  { id: 3, title: 'Set up Microsoft Authenticator for MFA', category: 'Security', views: 845, helpful: 94 },
  { id: 4, title: 'How to install approved software', category: 'Software', views: 760, helpful: 92 },
  { id: 5, title: 'Configure VPN on Windows & Mac', category: 'Network', views: 720, helpful: 97 },
  { id: 6, title: 'Fix slow computer — 10 quick tips', category: 'Hardware', views: 650, helpful: 91 },
]

const ANNOUNCEMENTS = [
  { id: 1, type: 'maintenance', title: 'Scheduled Maintenance — July 12', body: 'The IT systems will be offline Saturday 12 Jul, 10 PM–2 AM for planned maintenance.', date: '2026-07-05', urgent: true },
  { id: 2, type: 'info', title: 'New Self-Service Password Reset Portal', body: 'You can now reset your AD password without calling IT. Visit accounts.company.com.', date: '2026-07-03', urgent: false },
  { id: 3, type: 'security', title: 'Phishing Alert — Finance Invoice Emails', body: 'We have detected targeted phishing emails claiming to be invoices. Do NOT open attachments.', date: '2026-07-01', urgent: true },
]

const QUICK_LINKS = [
  { id: 'pwd',  label: 'Reset Password',   icon: FiLock,    desc: 'Self-service reset', color: 'bg-blue-100 text-blue-700' },
  { id: 'wifi', label: 'WiFi Setup',       icon: FiWifi,    desc: 'Connect your device', color: 'bg-green-100 text-green-700' },
  { id: 'soft', label: 'Request Software', icon: FiDownload, desc: 'Install new tools', color: 'bg-purple-100 text-purple-700' },
  { id: 'hard', label: 'Hardware Issue',   icon: FiMonitor, desc: 'PC/monitor/keyboard', color: 'bg-orange-100 text-orange-700' },
  { id: 'chat', label: 'Live Chat IT',     icon: FiMessageSquare, desc: 'Talk to an agent', color: 'bg-teal-100 text-teal-700' },
  { id: 'kb',   label: 'Knowledge Base',  icon: FiHelpCircle, desc: 'Browse articles', color: 'bg-pink-100 text-pink-700' },
]

const TICKET_CATEGORIES = [
  'Hardware Issue', 'Software Installation', 'Account / Access', 'Email & Calendar',
  'Network / VPN', 'Printer / Scanner', 'New Equipment Request', 'Security / Phishing',
  'Audio / Video', 'Other IT Issue',
]

/* ─────────── Status helpers ─────────── */
const statusConfig = {
  open:        { label: 'Open',        color: 'bg-blue-100 text-blue-800',   icon: FiAlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: FiRefreshCw },
  pending:     { label: 'Pending',     color: 'bg-orange-100 text-orange-800', icon: FiClock },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-800',  icon: FiCheckCircle },
  closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-700',   icon: FiXCircle },
}

const priorityConfig = {
  critical: 'bg-red-600 text-white',
  high:     'bg-red-100 text-red-800',
  medium:   'bg-yellow-100 text-yellow-800',
  low:      'bg-green-100 text-green-800',
}

/* ─────────────────────────────────────────── */
/*              MAIN COMPONENT                 */
/* ─────────────────────────────────────────── */
export default function EmployeePortal() {
  const [tab, setTab] = useState('home')
  const [kbQuery, setKbQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'Hardware Issue', priority: 'medium', description: '', contact: 'email' })
  const [ticketFilter, setTicketFilter] = useState('all')
  const [rating, setRating] = useState({})

  /* submit new ticket */
  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim()) return
    setSubmitSuccess(true)
    setTimeout(() => { setSubmitSuccess(false); setTab('tickets') }, 2200)
    setForm({ title: '', category: 'Hardware Issue', priority: 'medium', description: '', contact: 'email' })
  }

  /* filtered tickets */
  const filteredTickets = MY_TICKETS.filter(t =>
    ticketFilter === 'all' ? true : t.status === ticketFilter
  )

  const openCount = MY_TICKETS.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'pending').length
  const resolvedCount = MY_TICKETS.filter(t => t.status === 'resolved').length

  /* ─── TAB: HOME ─── */
  const HomeTab = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">👋 Welcome back, {CURRENT_EMPLOYEE.name.split(' ')[0]}!</h2>
            <p className="mt-1 opacity-90">{CURRENT_EMPLOYEE.department} · {CURRENT_EMPLOYEE.email}</p>
            <div className="mt-3 flex gap-4 text-sm">
              <span className="rounded-full bg-white/20 px-3 py-1">{openCount} Active Ticket{openCount !== 1 ? 's' : ''}</span>
              <span className="rounded-full bg-white/20 px-3 py-1">{resolvedCount} Resolved</span>
            </div>
          </div>
          <div className="hidden md:flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl font-bold">
            {CURRENT_EMPLOYEE.avatar}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-800">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_LINKS.map(q => (
            <button
              key={q.id}
              onClick={() => q.id === 'chat' ? setTab('home') : q.id === 'kb' ? setTab('kb') : setTab('submit')}
              className={`flex flex-col items-center gap-2 rounded-xl p-4 ${q.color} hover:opacity-80 transition-opacity`}
            >
              <q.icon className="text-2xl" />
              <span className="text-xs font-semibold text-center">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-800">📢 IT Announcements</h3>
        <div className="space-y-3">
          {ANNOUNCEMENTS.map(a => (
            <div key={a.id} className={`flex gap-3 rounded-xl border-l-4 p-4 ${a.type === 'maintenance' ? 'border-yellow-500 bg-yellow-50' : a.type === 'security' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'}`}>
              <FiInfo className={`mt-0.5 shrink-0 text-xl ${a.type === 'security' ? 'text-red-600' : a.type === 'maintenance' ? 'text-yellow-600' : 'text-blue-600'}`} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{a.title}</p>
                  {a.urgent && <span className="rounded bg-red-600 px-2 py-0.5 text-xs text-white">Urgent</span>}
                </div>
                <p className="mt-1 text-sm text-gray-600">{a.body}</p>
                <p className="mt-1 text-xs text-gray-400">{a.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tickets Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">🎫 Recent Tickets</h3>
          <button onClick={() => setTab('tickets')} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
            View all <FiChevronRight />
          </button>
        </div>
        <div className="space-y-2">
          {MY_TICKETS.slice(0, 3).map(t => {
            const s = statusConfig[t.status] || statusConfig.open
            const Icon = s.icon
            return (
              <button
                key={t.id}
                onClick={() => { setSelectedTicket(t); setTab('tickets') }}
                className="w-full flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Icon className="text-gray-500 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.id} · Updated {t.updated}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${s.color}`}>{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Popular Articles */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-800">📚 Popular Self-Help Articles</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {KB_QUICK.slice(0, 4).map(a => (
            <button key={a.id} onClick={() => setTab('kb')} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-indigo-50 transition-colors text-left">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <FiHelpCircle />
              </div>
              <div>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-gray-500">{a.helpful}% found helpful</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  /* ─── TAB: MY TICKETS ─── */
  const TicketsTab = () => (
    <div>
      <div className="mb-4 flex gap-2 flex-wrap">
        {['all', 'open', 'in_progress', 'pending', 'resolved'].map(f => (
          <button
            key={f}
            onClick={() => setTicketFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${ticketFilter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1 text-xs opacity-70">
              ({f === 'all' ? MY_TICKETS.length : MY_TICKETS.filter(t => t.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {selectedTicket ? (
        /* Ticket Detail View */
        <div className="rounded-xl border border-gray-200 p-6">
          <button onClick={() => setSelectedTicket(null)} className="mb-4 text-sm text-indigo-600 hover:underline">← Back to list</button>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500">{selectedTicket.id}</p>
              <h3 className="text-xl font-bold mt-1">{selectedTicket.title}</h3>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${(statusConfig[selectedTicket.status] || statusConfig.open).color}`}>
              {(statusConfig[selectedTicket.status] || statusConfig.open).label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-6 sm:grid-cols-4">
            <div><p className="text-gray-500">Priority</p><p className="font-medium mt-1 capitalize">{selectedTicket.priority}</p></div>
            <div><p className="text-gray-500">Agent</p><p className="font-medium mt-1">{selectedTicket.agent}</p></div>
            <div><p className="text-gray-500">Created</p><p className="font-medium mt-1">{selectedTicket.created}</p></div>
            <div><p className="text-gray-500">Last Update</p><p className="font-medium mt-1">{selectedTicket.updated}</p></div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progress</span><span>{selectedTicket.progress}%</span></div>
            <div className="h-2 rounded-full bg-gray-200">
              <div className="h-2 rounded-full bg-indigo-600 transition-all" style={{ width: `${selectedTicket.progress}%` }} />
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Activity Timeline</h4>
            <div className="space-y-3">
              {[
                { date: selectedTicket.created, text: 'Ticket submitted', user: CURRENT_EMPLOYEE.name },
                { date: selectedTicket.created, text: `Assigned to ${selectedTicket.agent}`, user: 'System' },
                { date: selectedTicket.updated, text: selectedTicket.status === 'resolved' ? 'Ticket resolved' : 'Agent updated ticket status', user: selectedTicket.agent },
              ].map((ev, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-indigo-500 mt-1 shrink-0" />
                    {i < 2 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div>
                    <span className="font-medium">{ev.user}</span> — {ev.text}
                    <p className="text-xs text-gray-400">{ev.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rate Resolution */}
          {selectedTicket.status === 'resolved' && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm font-semibold text-green-800 mb-2">Was this issue resolved to your satisfaction?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating({ ...rating, [selectedTicket.id]: s })}
                    className={`text-2xl transition-transform hover:scale-110 ${rating[selectedTicket.id] >= s ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </button>
                ))}
                {rating[selectedTicket.id] && <span className="ml-2 text-sm text-green-700 self-center">Thanks for your feedback!</span>}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiList className="text-5xl mx-auto mb-3 opacity-30" />
              <p>No tickets found</p>
            </div>
          ) : filteredTickets.map(t => {
            const s = statusConfig[t.status] || statusConfig.open
            const Icon = s.icon
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="w-full rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-3 items-start flex-1 min-w-0">
                    <Icon className={`text-xl mt-0.5 shrink-0 ${s.color.includes('yellow') ? 'text-yellow-500' : s.color.includes('green') ? 'text-green-500' : s.color.includes('blue') ? 'text-blue-500' : 'text-gray-500'}`} />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{t.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.id} · Agent: {t.agent} · {t.updated}</p>
                      <div className="mt-2 h-1.5 w-40 rounded-full bg-gray-200">
                        <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${t.progress}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.color}`}>{s.label}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${priorityConfig[t.priority]}`}>{t.priority}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  /* ─── TAB: SUBMIT TICKET ─── */
  const SubmitTab = () => (
    <div className="max-w-2xl mx-auto">
      {submitSuccess ? (
        <div className="rounded-2xl bg-green-50 border-2 border-green-300 p-10 text-center">
          <FiCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-800">Ticket Submitted!</h3>
          <p className="mt-2 text-green-700">We've received your request. An IT agent will respond within 4 hours.</p>
          <p className="mt-1 text-sm text-green-600">Redirecting to your tickets…</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Submit a New IT Request</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Short description of the problem"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {TICKET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="low">Low — Not urgent</option>
                  <option value="medium">Medium — Normal</option>
                  <option value="high">High — Affects my work</option>
                  <option value="critical">Critical — Work completely blocked</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea
                rows={5}
                placeholder="Please describe the issue in detail. Include: what happened, when it started, what you've already tried, and any error messages you see."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
              <div className="flex gap-4">
                {[['email', '📧 Email'], ['phone', '📞 Phone'], ['teams', '💬 Teams Chat']].map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="contact" value={v} checked={form.contact === v} onChange={() => setForm({ ...form, contact: v })} className="accent-indigo-600" />
                    <span className="text-sm">{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional)</label>
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3 text-gray-500 hover:border-indigo-400 cursor-pointer">
                <FiPaperclip />
                <span className="text-sm">Click to attach screenshot or file</span>
              </div>
            </div>

            {/* AI suggestion hint */}
            {form.category === 'Account / Access' && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm">
                <p className="font-semibold text-blue-800">💡 Quick Fix Available</p>
                <p className="text-blue-700 mt-1">Most account issues can be resolved via the self-service portal at <strong>accounts.company.com</strong> — no ticket required!</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!form.title.trim() || !form.description.trim()}
              className="w-full rounded-lg bg-indigo-600 py-3 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiSend /> Submit Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  )

  /* ─── TAB: KNOWLEDGE BASE ─── */
  const KBTab = () => {
    const filtered = KB_QUICK.filter(a =>
      !kbQuery || a.title.toLowerCase().includes(kbQuery.toLowerCase()) || a.category.toLowerCase().includes(kbQuery.toLowerCase())
    )
    return (
      <div>
        <div className="relative mb-6">
          <FiSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search for help articles, guides, how-tos..."
            value={kbQuery}
            onChange={e => setKbQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(a => (
            <div key={a.id} className="rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <FiHelpCircle />
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 ml-auto">{a.category}</span>
              </div>
              <h4 className="mt-3 font-semibold text-gray-800">{a.title}</h4>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span>👁 {a.views.toLocaleString()} views</span>
                <span>👍 {a.helpful}% helpful</span>
              </div>
              <button className="mt-3 text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1">
                Read article <FiChevronRight />
              </button>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <FiSearch className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No articles found for "{kbQuery}"</p>
            <button onClick={() => setTab('submit')} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm hover:bg-indigo-700">
              Submit a support ticket instead
            </button>
          </div>
        )}
      </div>
    )
  }

  /* ─── Tab Buttons ─── */
  const TABS = [
    { id: 'home',    label: 'Dashboard', icon: FiHome },
    { id: 'tickets', label: 'My Tickets', icon: FiList, badge: openCount },
    { id: 'submit',  label: 'Submit Request', icon: FiPlusCircle },
    { id: 'kb',      label: 'Self-Help', icon: FiSearch },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee IT Portal</h1>
          <p className="text-gray-500 text-sm mt-0.5">Get IT help, track requests, browse self-help guides</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">
            {CURRENT_EMPLOYEE.avatar}
          </div>
          <div className="text-sm">
            <p className="font-semibold">{CURRENT_EMPLOYEE.name}</p>
            <p className="text-gray-500">{CURRENT_EMPLOYEE.department}</p>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white border border-gray-200 p-1 shadow-sm">
        {TABS.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSelectedTicket(null) }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
              ${tab === id ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Icon className="shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            {badge > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${tab === id ? 'bg-white text-indigo-700' : 'bg-red-500 text-white'}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tab === 'home'    && <HomeTab />}
        {tab === 'tickets' && <TicketsTab />}
        {tab === 'submit'  && <SubmitTab />}
        {tab === 'kb'      && <KBTab />}
      </div>
    </div>
  )
}
