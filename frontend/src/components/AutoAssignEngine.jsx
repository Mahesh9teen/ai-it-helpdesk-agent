import React, { useState } from 'react'
import { FiGitBranch, FiToggleRight, FiToggleLeft, FiPlus, FiTrash2, FiChevronDown, FiChevronRight, FiZap, FiCheck } from 'react-icons/fi'

const INITIAL_RULES = [
  {
    id: 1, name: 'P1 Critical → On-call Lead', enabled: true, matches: 312,
    conditions: [{ field: 'priority', op: 'equals', value: 'critical' }],
    action: { type: 'assign_to', value: 'on_call_lead' },
    secondary: { type: 'notify_channel', value: '#incidents' },
  },
  {
    id: 2, name: 'Network issues → Infrastructure Team', enabled: true, matches: 88,
    conditions: [
      { field: 'category', op: 'equals', value: 'Network' },
    ],
    action: { type: 'assign_to', value: 'infrastructure_team' },
    secondary: null,
  },
  {
    id: 3, name: 'HR Dept Software Requests → Alex', enabled: true, matches: 41,
    conditions: [
      { field: 'department', op: 'equals', value: 'HR' },
      { field: 'category', op: 'equals', value: 'Software Request' },
    ],
    action: { type: 'assign_to', value: 'alex_rodriguez' },
    secondary: null,
  },
  {
    id: 4, name: 'Unassigned after 1h → Notify Manager', enabled: false, matches: 7,
    conditions: [
      { field: 'assignee', op: 'equals', value: 'unassigned' },
      { field: 'age_hours', op: 'greater_than', value: '1' },
    ],
    action: { type: 'notify_manager', value: '' },
    secondary: null,
  },
]

const FIELDS = ['priority', 'category', 'department', 'assignee', 'status', 'age_hours', 'keyword']
const OPS = { priority: ['equals', 'not_equals'], category: ['equals', 'not_equals', 'contains'], department: ['equals'], assignee: ['equals'], status: ['equals'], age_hours: ['greater_than', 'less_than'], keyword: ['contains', 'not_contains'] }
const AGENTS = ['alex_rodriguez', 'sarah_mitchell', 'chen_wei', 'jay_patel', 'emma_clarke', 'on_call_lead', 'infrastructure_team', 'auto_round_robin']
const ACTION_TYPES = [
  { value: 'assign_to', label: 'Assign to agent/team' },
  { value: 'set_priority', label: 'Set priority' },
  { value: 'add_label', label: 'Add label' },
  { value: 'notify_manager', label: 'Notify manager' },
  { value: 'notify_channel', label: 'Notify Slack channel' },
  { value: 'auto_reply', label: 'Send auto-reply' },
]

const WORKLOAD = [
  { name: 'Alex Rodriguez', assigned: 7, capacity: 10 },
  { name: 'Sarah Mitchell', assigned: 4, capacity: 10 },
  { name: 'Chen Wei', assigned: 9, capacity: 10 },
  { name: 'Jay Patel', assigned: 6, capacity: 10 },
  { name: 'Emma Clarke', assigned: 3, capacity: 10 },
]

function WorkloadBar({ assigned, capacity }) {
  const pct = Math.round((assigned / capacity) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-hope-border dark:bg-slate-700">
        <div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-400' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-hope-secondary">{assigned}/{capacity}</span>
    </div>
  )
}

export default function AutoAssignEngine() {
  const [rules, setRules] = useState(INITIAL_RULES)
  const [expanded, setExpanded] = useState(null)
  const [saved, setSaved] = useState({})

  const toggleRule = (id) => {
    setRules(r => r.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
  }

  const deleteRule = (id) => {
    setRules(r => r.filter(rule => rule.id !== id))
  }

  const saveRule = (id) => {
    setSaved(s => ({ ...s, [id]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [id]: false })), 2000)
  }

  const addRule = () => {
    const id = Date.now()
    setRules(r => [...r, {
      id, name: 'New Rule', enabled: false, matches: 0,
      conditions: [{ field: 'priority', op: 'equals', value: 'high' }],
      action: { type: 'assign_to', value: 'auto_round_robin' },
      secondary: null,
    }])
    setExpanded(id)
  }

  const enabledCount = rules.filter(r => r.enabled).length

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100 flex items-center gap-2">
            <FiGitBranch className="h-5 w-5 text-hope-primary" /> Auto-Assign Engine
          </h2>
          <p className="text-sm text-hope-secondary dark:text-slate-400">
            {enabledCount} of {rules.length} rules active · AI routes tickets automatically based on conditions
          </p>
        </div>
        <button onClick={addRule} className="hope-btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <FiPlus className="h-4 w-4" /> New Rule
        </button>
      </div>

      {/* Workload overview */}
      <div className="hope-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-hope-ink dark:text-slate-100">Current Agent Workload</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {WORKLOAD.map(agent => (
            <div key={agent.name} className="rounded-xl bg-hope-canvas p-3 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-hope-ink dark:text-slate-200 truncate">{agent.name.split(' ')[0]}</p>
              <WorkloadBar assigned={agent.assigned} capacity={agent.capacity} />
            </div>
          ))}
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-3">
        {rules.map(rule => (
          <div key={rule.id} className={`hope-card overflow-hidden transition-all ${rule.enabled ? '' : 'opacity-60'}`}>
            {/* Header */}
            <div className="flex items-center gap-3 p-4">
              <button onClick={() => setExpanded(e => e === rule.id ? null : rule.id)} className="text-hope-secondary hover:text-hope-primary">
                {expanded === rule.id
                  ? <FiChevronDown className="h-4 w-4" />
                  : <FiChevronRight className="h-4 w-4" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-hope-ink dark:text-slate-100">{rule.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-hope-secondary">{rule.conditions.length} condition{rule.conditions.length > 1 ? 's' : ''}</span>
                  <span className="flex items-center gap-1 text-xs text-hope-secondary">
                    <FiZap className="h-3 w-3" /> {rule.matches} matches
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    rule.enabled
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-hope-canvas text-hope-secondary dark:bg-slate-800'
                  }`}
                >
                  {rule.enabled
                    ? <><FiToggleRight className="h-3.5 w-3.5" /> Active</>
                    : <><FiToggleLeft className="h-3.5 w-3.5" /> Inactive</>}
                </button>
                <button onClick={() => deleteRule(rule.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Expanded editor */}
            {expanded === rule.id && (
              <div className="border-t border-hope-border px-5 pb-5 pt-4 dark:border-slate-700">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-hope-secondary">Conditions (ALL must match)</p>
                <div className="space-y-2 mb-4">
                  {rule.conditions.map((cond, i) => (
                    <div key={i} className="flex items-center gap-2 flex-wrap">
                      <select
                        value={cond.field}
                        onChange={e => setRules(r => r.map(ru => ru.id === rule.id ? {
                          ...ru, conditions: ru.conditions.map((c, ci) => ci === i ? { ...c, field: e.target.value, op: 'equals' } : c)
                        } : ru))}
                        className="hope-input w-32 text-sm"
                      >
                        {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <select
                        value={cond.op}
                        onChange={e => setRules(r => r.map(ru => ru.id === rule.id ? {
                          ...ru, conditions: ru.conditions.map((c, ci) => ci === i ? { ...c, op: e.target.value } : c)
                        } : ru))}
                        className="hope-input w-32 text-sm"
                      >
                        {(OPS[cond.field] || ['equals']).map(op => <option key={op} value={op}>{op.replace('_', ' ')}</option>)}
                      </select>
                      <input
                        value={cond.value}
                        onChange={e => setRules(r => r.map(ru => ru.id === rule.id ? {
                          ...ru, conditions: ru.conditions.map((c, ci) => ci === i ? { ...c, value: e.target.value } : c)
                        } : ru))}
                        className="hope-input w-36 text-sm"
                        placeholder="value"
                      />
                      <button
                        onClick={() => setRules(r => r.map(ru => ru.id === rule.id ? {
                          ...ru, conditions: ru.conditions.filter((_, ci) => ci !== i)
                        } : ru))}
                        className="text-red-400 hover:text-red-600"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setRules(r => r.map(ru => ru.id === rule.id ? {
                      ...ru, conditions: [...ru.conditions, { field: 'priority', op: 'equals', value: '' }]
                    } : ru))}
                    className="text-xs text-hope-primary hover:underline flex items-center gap-1"
                  >
                    <FiPlus className="h-3 w-3" /> Add condition
                  </button>
                </div>

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-hope-secondary">Action</p>
                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    value={rule.action.type}
                    onChange={e => setRules(r => r.map(ru => ru.id === rule.id ? {
                      ...ru, action: { ...ru.action, type: e.target.value }
                    } : ru))}
                    className="hope-input w-44 text-sm"
                  >
                    {ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                  {rule.action.type === 'assign_to' ? (
                    <select
                      value={rule.action.value}
                      onChange={e => setRules(r => r.map(ru => ru.id === rule.id ? {
                        ...ru, action: { ...ru.action, value: e.target.value }
                      } : ru))}
                      className="hope-input w-44 text-sm"
                    >
                      {AGENTS.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                    </select>
                  ) : (
                    <input
                      value={rule.action.value}
                      onChange={e => setRules(r => r.map(ru => ru.id === rule.id ? {
                        ...ru, action: { ...ru.action, value: e.target.value }
                      } : ru))}
                      className="hope-input w-44 text-sm"
                      placeholder="value"
                    />
                  )}
                </div>

                <button
                  onClick={() => saveRule(rule.id)}
                  className="mt-4 hope-btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
                >
                  {saved[rule.id] ? <><FiCheck className="h-4 w-4" /> Saved!</> : 'Save Rule'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
