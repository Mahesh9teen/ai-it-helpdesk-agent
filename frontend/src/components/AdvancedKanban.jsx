import { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'
import {
  FiLayout, FiPlus, FiX, FiClock, FiAlertTriangle,
  FiTrendingUp, FiUser, FiRefreshCw, FiBarChart2, FiChevronRight
} from 'react-icons/fi'

/* ─── Column definitions ─── */
const COLUMNS = [
  { id: 'backlog',      label: '📥 Backlog',      wip: null,  color: 'bg-gray-50   border-gray-200' },
  { id: 'in_progress',  label: '🔧 In Progress',  wip: 4,     color: 'bg-blue-50   border-blue-200' },
  { id: 'review',       label: '👁 In Review',    wip: 3,     color: 'bg-yellow-50 border-yellow-200' },
  { id: 'testing',      label: '🧪 Testing',      wip: 2,     color: 'bg-orange-50 border-orange-200' },
  { id: 'done',         label: '✅ Done',          wip: null,  color: 'bg-green-50  border-green-200' },
]

const priorityConfig = {
  critical: { label: 'P1', color: 'bg-red-600 text-white' },
  high:     { label: 'P2', color: 'bg-orange-500 text-white' },
  medium:   { label: 'P3', color: 'bg-yellow-500 text-white' },
  low:      { label: 'P4', color: 'bg-green-600 text-white' },
}

let nextCard = 100
const INITIAL_CARDS = [
  /* Backlog */
  { id: 'T-001', col: 'backlog',     title: 'Deploy CrowdStrike to 8 remaining endpoints', priority: 'high',    assignee: 'Emma C.',  age: 3,  estimate: 4, tags: ['security','edr'] },
  { id: 'T-002', col: 'backlog',     title: 'Upgrade Azure SQL to Premium tier',            priority: 'medium',  assignee: null,       age: 7,  estimate: 8, tags: ['cloud','database'] },
  { id: 'T-003', col: 'backlog',     title: 'Document VPN topology for CMDB',               priority: 'low',     assignee: null,       age: 14, estimate: 3, tags: ['documentation','cmdb'] },
  { id: 'T-004', col: 'backlog',     title: 'Review and rotate all service account passwords',priority:'high',   assignee: 'Alex R.',  age: 2,  estimate: 5, tags: ['security','iam'] },
  /* In Progress */
  { id: 'T-005', col: 'in_progress', title: 'Deploy DLP policy to remaining 35 mailboxes',  priority: 'high',    assignee: 'Sarah M.', age: 5,  estimate: 6, tags: ['compliance','dlp'] },
  { id: 'T-006', col: 'in_progress', title: 'BitLocker rollout to 12 remaining laptops',    priority: 'high',    assignee: 'Jay P.',   age: 4,  estimate: 8, tags: ['security','encryption'] },
  { id: 'T-007', col: 'in_progress', title: 'Migrate ADFS to Azure AD SSO',                 priority: 'critical',assignee: 'Chen W.',  age: 12, estimate: 20, tags: ['identity','sso'] },
  { id: 'T-008', col: 'in_progress', title: 'Implement SLA breach alerting workflow',        priority: 'medium',  assignee: 'Emma C.',  age: 3,  estimate: 4, tags: ['automation','sla'] },
  /* Review */
  { id: 'T-009', col: 'review',      title: 'Patch management policy documentation',        priority: 'medium',  assignee: 'Sarah M.', age: 8,  estimate: 3, tags: ['policy','patching'] },
  { id: 'T-010', col: 'review',      title: 'Network diagram updated post-VPN change',      priority: 'low',     assignee: 'Chen W.',  age: 6,  estimate: 2, tags: ['network','documentation'] },
  /* Testing */
  { id: 'T-011', col: 'testing',     title: 'Test MFA bypass mitigations in UAT',           priority: 'critical',assignee: 'Alex R.',  age: 2,  estimate: 5, tags: ['security','mfa'] },
  /* Done */
  { id: 'T-012', col: 'done',        title: 'Deploy CrowdStrike to Windows fleet',          priority: 'high',    assignee: 'Emma C.',  age: 0,  estimate: 12, cycleTime: 9, tags: ['security'] },
  { id: 'T-013', col: 'done',        title: 'Setup Datadog APM monitoring',                 priority: 'medium',  assignee: 'Alex R.',  age: 0,  estimate: 6,  cycleTime: 7, tags: ['monitoring'] },
  { id: 'T-014', col: 'done',        title: 'Enable audit logging on Azure tenant',         priority: 'high',    assignee: 'Chen W.',  age: 0,  estimate: 4,  cycleTime: 5, tags: ['compliance'] },
  { id: 'T-015', col: 'done',        title: 'Consolidate 3 Zoom plans to Enterprise',      priority: 'low',     assignee: 'Jay P.',   age: 0,  estimate: 2,  cycleTime: 4, tags: ['licensing'] },
]

/* CFD (Cumulative Flow Diagram) data */
const CFD_DATA = [
  { week: 'W1', backlog: 18, in_progress: 4, review: 2, testing: 1, done: 3  },
  { week: 'W2', backlog: 16, in_progress: 5, review: 3, testing: 2, done: 6  },
  { week: 'W3', backlog: 15, in_progress: 6, review: 2, testing: 2, done: 9  },
  { week: 'W4', backlog: 14, in_progress: 5, review: 4, testing: 1, done: 12 },
  { week: 'W5', backlog: 13, in_progress: 4, review: 3, testing: 2, done: 14 },
  { week: 'W6', backlog: 10, in_progress: 4, review: 2, testing: 1, done: 15 },
]

const CYCLE_TIME_DIST = [
  { range: '0–2d', count: 2 }, { range: '3–5d', count: 6 }, { range: '6–8d', count: 4 },
  { range: '9–12d', count: 3 }, { range: '13–18d', count: 2 }, { range: '19d+', count: 1 },
]

/* ─────────── Component ─────────── */
export default function AdvancedKanban() {
  const [cards,   setCards]   = useState(INITIAL_CARDS)
  const [view,    setView]    = useState('board')  // board | cfd | cycle
  const [dragging, setDragging] = useState(null)
  const [newCard, setNewCard]  = useState({ col: 'backlog', title: '', priority: 'medium', assignee: '' })
  const [showAdd, setShowAdd]  = useState(null)

  /* per-column counts */
  const colCount = (colId) => cards.filter(c => c.col === colId).length
  const wipBreach = (col) => col.wip !== null && colCount(col.id) > col.wip

  /* drag-and-drop helpers */
  const onDragStart = (id) => setDragging(id)
  const onDrop = (colId) => {
    if (!dragging) return
    setCards(cs => cs.map(c => c.id === dragging ? { ...c, col: colId } : c))
    setDragging(null)
  }

  const addCard = () => {
    if (!newCard.title.trim()) return
    const id = `T-${++nextCard}`
    setCards(cs => [...cs, { id, col: showAdd, title: newCard.title, priority: newCard.priority, assignee: newCard.assignee || null, age: 0, estimate: 2, tags: [] }])
    setNewCard({ col: showAdd, title: '', priority: 'medium', assignee: '' })
    setShowAdd(null)
  }

  const removeCard = (id) => setCards(cs => cs.filter(c => c.id !== id))

  const avgCycleTime = useMemo(() => {
    const done = cards.filter(c => c.cycleTime)
    return done.length ? (done.reduce((s,c) => s + c.cycleTime, 0) / done.length).toFixed(1) : '—'
  }, [cards])

  const throughput = cards.filter(c => c.col === 'done').length
  const overageCards = cards.filter(c => c.age > 10 && c.col !== 'done').length

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
            <FiLayout className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Advanced Kanban Board</h1>
            <p className="text-sm text-gray-500">WIP limits · CFD · Cycle time analytics · Drag to move cards</p>
          </div>
        </div>
        <div className="flex gap-1 rounded-xl border border-gray-200 p-1 bg-gray-50">
          {[['board','🗂 Board'],['cfd','📊 CFD'],['cycle','⏱ Cycle Time']].map(([id,l]) => (
            <button key={id} onClick={() => setView(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view===id ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-4">
        {[
          { label: 'Avg Cycle Time', value: `${avgCycleTime}d`, icon: FiClock, c: 'border-blue-400', t: 'text-blue-700' },
          { label: 'Throughput (Done)', value: throughput, icon: FiTrendingUp, c: 'border-green-400', t: 'text-green-700' },
          { label: 'Stale Cards (>10d)', value: overageCards, icon: FiAlertTriangle, c: 'border-orange-400', t: 'text-orange-700' },
          { label: 'WIP Breaches', value: COLUMNS.filter(c => wipBreach(c)).length, icon: FiBarChart2, c: 'border-red-400', t: 'text-red-700' },
        ].map(k => { const KIcon = k.icon; return (
          <div key={k.label} className={`rounded-xl border-l-4 ${k.c} bg-white p-3 shadow-sm`}>
            <div className="flex items-center justify-between"><div><p className="text-xs text-gray-500">{k.label}</p><p className={`text-xl font-extrabold mt-0.5 ${k.t}`}>{k.value}</p></div><KIcon className={`text-xl ${k.t} opacity-60`} /></div>
          </div>
        )})}
      </div>

      {/* ── BOARD VIEW ── */}
      {view === 'board' && (
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ minHeight: '60vh' }}>
          {COLUMNS.map(col => {
            const colCards = cards.filter(c => c.col === col.id)
            const breached = wipBreach(col)
            return (
              <div key={col.id}
                className="flex flex-col rounded-2xl border-2 shrink-0 w-60 transition-all"
                style={{ minWidth: 240, maxWidth: 280 }}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(col.id)}>
                {/* Column Header */}
                <div className={`flex items-center justify-between p-3 rounded-t-2xl border-b-2 ${col.color}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-700">{col.label}</p>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <span className={`font-semibold ${breached ? 'text-red-600' : 'text-gray-500'}`}>{colCards.length}</span>
                      {col.wip && <span className={`text-gray-400`}>/ {col.wip} WIP {breached && '⚠'}</span>}
                    </div>
                  </div>
                  <button onClick={() => setShowAdd(col.id)}
                    className="text-gray-400 hover:text-indigo-600 transition-colors"><FiPlus /></button>
                </div>

                {/* Add Card Form */}
                {showAdd === col.id && (
                  <div className="m-2 rounded-xl border-2 border-dashed border-indigo-300 p-2.5 bg-indigo-50">
                    <input autoFocus placeholder="Card title…" value={newCard.title}
                      onChange={e => setNewCard({ ...newCard, title: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && addCard()}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 mb-1.5 focus:outline-none" />
                    <div className="flex gap-1 mb-1.5">
                      <select value={newCard.priority} onChange={e => setNewCard({...newCard, priority: e.target.value})}
                        className="flex-1 text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none">
                        {Object.keys(priorityConfig).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input placeholder="Assignee" value={newCard.assignee}
                        onChange={e => setNewCard({...newCard, assignee: e.target.value})}
                        className="flex-1 text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none" />
                    </div>
                    <div className="flex gap-1">
                      <button onClick={addCard} className="flex-1 bg-indigo-600 text-white text-xs rounded py-1 font-medium hover:bg-indigo-700">Add</button>
                      <button onClick={() => setShowAdd(null)} className="flex-1 bg-gray-200 text-xs rounded py-1 hover:bg-gray-300">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Cards */}
                <div className={`flex-1 p-2 space-y-2 overflow-y-auto ${col.color}`}>
                  {colCards.map(card => {
                    const pc = priorityConfig[card.priority]
                    const isStale = card.age > 10 && card.col !== 'done'
                    return (
                      <div key={card.id}
                        draggable
                        onDragStart={() => onDragStart(card.id)}
                        className={`rounded-xl bg-white border ${isStale ? 'border-orange-300' : 'border-gray-200'} p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow`}>
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${pc.color}`}>{pc.label}</span>
                          <button onClick={() => removeCard(card.id)} className="text-gray-300 hover:text-red-400 shrink-0"><FiX className="text-xs" /></button>
                        </div>
                        <p className="text-xs font-medium text-gray-800 leading-snug">{card.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex gap-1.5 text-xs text-gray-400">
                            {card.assignee && <span className="flex items-center gap-0.5"><FiUser className="text-[10px]" />{card.assignee}</span>}
                            {card.age > 0 && <span className={`flex items-center gap-0.5 ${isStale ? 'text-orange-500 font-semibold' : ''}`}><FiClock className="text-[10px]" />{card.age}d</span>}
                          </div>
                          {card.cycleTime && <span className="text-xs text-green-600 font-semibold">{card.cycleTime}d ✓</span>}
                        </div>
                        {card.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {card.tags.slice(0, 2).map(t => <span key={t} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">#{t}</span>)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CFD ── */}
      {view === 'cfd' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-gray-700 mb-1">Cumulative Flow Diagram (6 Weeks)</h3>
          <p className="text-xs text-gray-400 mb-4">Healthy CFD: bands should be roughly parallel. Widening bands = rising WIP / bottleneck.</p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={CFD_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="done"        name="Done"        stackId="1" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
              <Area type="monotone" dataKey="testing"     name="Testing"     stackId="1" stroke="#f97316" fill="#ffedd5" strokeWidth={2} />
              <Area type="monotone" dataKey="review"      name="Review"      stackId="1" stroke="#f59e0b" fill="#fef9c3" strokeWidth={2} />
              <Area type="monotone" dataKey="in_progress" name="In Progress" stackId="1" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
              <Area type="monotone" dataKey="backlog"     name="Backlog"     stackId="1" stroke="#9ca3af" fill="#f3f4f6" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── CYCLE TIME ── */}
      {view === 'cycle' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[['Avg Cycle Time', `${avgCycleTime}d`, 'text-indigo-700'], ['Target', '5d', 'text-green-700'], ['Longest', '12d', 'text-red-700']].map(([l,v,c]) => (
              <div key={l} className="rounded-xl bg-white border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500">{l}</p>
                <p className={`text-3xl font-extrabold mt-1 ${c}`}>{v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Cycle Time Distribution (Completed Tasks)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CYCLE_TIME_DIST}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" name="Tasks" fill="#6366f1" radius={[4,4,0,0]} />
                <ReferenceLine x="6–8d" stroke="#f59e0b" strokeDasharray="4 2" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 mt-2">Yellow line = median cycle time. Left of line = fast; right = investigation needed.</p>
          </div>
        </div>
      )}
    </div>
  )
}
