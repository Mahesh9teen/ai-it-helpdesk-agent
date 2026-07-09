import { useState } from 'react'
import {
  FiPlay, FiPlus, FiTrash2, FiChevronDown, FiSettings,
  FiZap, FiFilter, FiArrowDown, FiCheck, FiCopy,
  FiSave, FiCode, FiAlertCircle, FiMail, FiUser,
  FiGitBranch, FiBell, FiMessageSquare, FiSliders
} from 'react-icons/fi'

/* ─── DSL types ─── */
const TRIGGERS = [
  { id: 'ticket_created',   label: 'Ticket Created',          icon: FiZap,     color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'ticket_updated',   label: 'Ticket Updated',          icon: FiSettings,color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 'sla_breach',       label: 'SLA About to Breach',     icon: FiAlertCircle, color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'comment_added',    label: 'Comment Added',           icon: FiMessageSquare, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'status_changed',   label: 'Status Changed',          icon: FiGitBranch, color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { id: 'schedule',         label: 'Scheduled (CRON)',        icon: FiPlay,    color: 'bg-green-100 text-green-700 border-green-200' },
]

const CONDITIONS = [
  { id: 'priority_is',      label: 'Priority is',             fields: [{ type: 'select', key: 'value', options: ['low','medium','high','critical'] }] },
  { id: 'category_is',      label: 'Category is',             fields: [{ type: 'select', key: 'value', options: ['Hardware','Software','Network','Account','Security','Other'] }] },
  { id: 'assigned_to',      label: 'Assigned to',             fields: [{ type: 'select', key: 'value', options: ['Unassigned','Sarah Mitchell','Chen Wei','Jay Patel','Emma Clarke'] }] },
  { id: 'status_is',        label: 'Status is',               fields: [{ type: 'select', key: 'value', options: ['open','in_progress','pending','resolved','closed'] }] },
  { id: 'keyword_in_title', label: 'Title contains keyword',  fields: [{ type: 'text', key: 'value', placeholder: 'e.g. VPN' }] },
  { id: 'age_over',         label: 'Ticket age over',         fields: [{ type: 'text', key: 'value', placeholder: 'e.g. 4' }, { type: 'select', key: 'unit', options: ['hours','days'] }] },
  { id: 'dept_is',          label: 'Requester dept is',       fields: [{ type: 'select', key: 'value', options: ['Engineering','Marketing','Finance','HR','Operations'] }] },
]

const ACTIONS = [
  { id: 'assign_agent',     label: 'Assign to Agent',         icon: FiUser,    color: 'bg-green-100 text-green-700', fields: [{ type: 'select', key: 'agent', options: ['Sarah Mitchell','Chen Wei','Jay Patel','Emma Clarke','Auto (round-robin)'] }] },
  { id: 'set_priority',     label: 'Set Priority',            icon: FiSliders, color: 'bg-yellow-100 text-yellow-700', fields: [{ type: 'select', key: 'priority', options: ['low','medium','high','critical'] }] },
  { id: 'send_email',       label: 'Send Email Notification', icon: FiMail,    color: 'bg-blue-100 text-blue-700', fields: [{ type: 'select', key: 'to', options: ['Requester','Assigned Agent','Manager','IT Team'] }, { type: 'text', key: 'subject', placeholder: 'Email subject' }] },
  { id: 'add_tag',          label: 'Add Tag / Label',         icon: FiZap,     color: 'bg-purple-100 text-purple-700', fields: [{ type: 'text', key: 'tag', placeholder: 'Tag name' }] },
  { id: 'escalate',         label: 'Escalate Ticket',         icon: FiAlertCircle, color: 'bg-red-100 text-red-700', fields: [{ type: 'select', key: 'to', options: ['L2 Support','L3 Engineering','Management','Security Team'] }] },
  { id: 'post_note',        label: 'Post Internal Note',      icon: FiMessageSquare, color: 'bg-gray-100 text-gray-700', fields: [{ type: 'text', key: 'note', placeholder: 'Note text' }] },
  { id: 'change_status',    label: 'Change Status',           icon: FiGitBranch, color: 'bg-teal-100 text-teal-700', fields: [{ type: 'select', key: 'status', options: ['open','in_progress','pending','resolved','closed'] }] },
  { id: 'webhook',          label: 'Call Webhook',            icon: FiCode,    color: 'bg-indigo-100 text-indigo-700', fields: [{ type: 'text', key: 'url', placeholder: 'https://...' }] },
  { id: 'notify_teams',     label: 'Send Teams Message',      icon: FiBell,    color: 'bg-violet-100 text-violet-700', fields: [{ type: 'text', key: 'channel', placeholder: 'Channel name' }] },
]

const SAVED_WORKFLOWS = [
  {
    id: 'wf-1', name: 'Auto-escalate critical tickets', active: true,
    trigger: 'ticket_created', conditionCount: 1, actionCount: 2, runs: 847,
  },
  {
    id: 'wf-2', name: 'SLA breach email alert', active: true,
    trigger: 'sla_breach', conditionCount: 0, actionCount: 1, runs: 312,
  },
  {
    id: 'wf-3', name: 'Welcome message for new requests', active: false,
    trigger: 'ticket_created', conditionCount: 0, actionCount: 1, runs: 1204,
  },
]

let nextId = 1
const makeId = () => `node-${nextId++}`

export default function VisualWorkflowBuilder() {
  const [view, setView] = useState('list') // 'list' | 'builder'
  const [wfName, setWfName] = useState('New Workflow')
  const [trigger, setTrigger] = useState(null)
  const [conditions, setConditions] = useState([])
  const [actions, setActions] = useState([])
  const [saved, setSaved] = useState(SAVED_WORKFLOWS)
  const [showJSON, setShowJSON] = useState(false)
  const [testRan, setTestRan] = useState(false)

  const addCondition = () => setConditions(c => [...c, { id: makeId(), type: CONDITIONS[0].id, values: {} }])
  const addAction    = () => setActions(a => [...a, { id: makeId(), type: ACTIONS[0].id, values: {} }])
  const removeCondition = id => setConditions(c => c.filter(x => x.id !== id))
  const removeAction    = id => setActions(a => a.filter(x => x.id !== id))

  const updateCondition = (id, field, val) =>
    setConditions(c => c.map(x => x.id === id ? { ...x, values: { ...x.values, [field]: val } } : x))
  const updateAction = (id, field, val) =>
    setActions(a => a.map(x => x.id === id ? { ...x, values: { ...x.values, [field]: val } } : x))

  const saveWorkflow = () => {
    setSaved(s => [{
      id: `wf-${Date.now()}`, name: wfName, active: true,
      trigger: trigger || 'ticket_created',
      conditionCount: conditions.length,
      actionCount: actions.length,
      runs: 0,
    }, ...s])
    setView('list')
  }

  const runTest = () => { setTestRan(true); setTimeout(() => setTestRan(false), 2500) }

  const wfJSON = JSON.stringify({
    name: wfName,
    trigger: trigger || null,
    conditions: conditions.map(c => ({ type: c.type, values: c.values })),
    actions:    actions.map(a => ({ type: a.type, values: a.values })),
  }, null, 2)

  const triggerDef  = TRIGGERS.find(t => t.id === trigger)
  const isValid = trigger && actions.length > 0

  /* ─── List View ─── */
  if (view === 'list') return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Visual Workflow Builder</h1>
          <p className="text-gray-500 text-sm mt-0.5">Build no-code automation rules with triggers, conditions and actions</p>
        </div>
        <button onClick={() => { setView('builder'); setTrigger(null); setConditions([]); setActions([]); setWfName('New Workflow') }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700">
          <FiPlus /> New Workflow
        </button>
      </div>

      <div className="space-y-3">
        {saved.map(wf => {
          const trig = TRIGGERS.find(t => t.id === wf.trigger)
          return (
            <div key={wf.id} className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked={wf.active} className="sr-only peer" />
                      <div className="h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-indigo-600 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{wf.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full border text-xs ${trig?.color || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{trig?.label}</span>
                      <span>→ {wf.conditionCount} condition{wf.conditionCount !== 1 ? 's' : ''}</span>
                      <span>→ {wf.actionCount} action{wf.actionCount !== 1 ? 's' : ''}</span>
                      <span className="text-gray-400">{wf.runs.toLocaleString()} runs</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setView('builder'); setWfName(wf.name) }}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50">Edit</button>
                  <button onClick={() => setSaved(s => s.filter(x => x.id !== wf.id))}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  /* ─── Builder View ─── */
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => setView('list')} className="text-sm text-indigo-600 hover:underline">← Back to workflows</button>
        <input value={wfName} onChange={e => setWfName(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-indigo-400 min-w-[200px]" />
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowJSON(s => !s)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50">
            <FiCode /> {showJSON ? 'Hide' : 'View'} JSON
          </button>
          <button onClick={runTest}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${testRan ? 'bg-green-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
            {testRan ? <><FiCheck /> Test Passed!</> : <><FiPlay /> Test Run</>}
          </button>
          <button onClick={saveWorkflow} disabled={!isValid}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm text-white font-semibold hover:bg-indigo-700 disabled:opacity-50">
            <FiSave /> Save
          </button>
        </div>
      </div>

      {showJSON && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-900 p-4">
          <pre className="text-xs text-green-400 overflow-x-auto">{wfJSON}</pre>
        </div>
      )}

      <div className="space-y-0">
        {/* TRIGGER */}
        <FlowBlock color="bg-blue-600" label="TRIGGER" icon={FiZap}>
          <p className="text-xs text-gray-500 mb-3">When this event happens…</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TRIGGERS.map(t => {
              const TIcon = t.icon
              return (
                <button key={t.id} onClick={() => setTrigger(t.id)}
                  className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all ${trigger === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <TIcon className={trigger === t.id ? 'text-blue-600' : 'text-gray-400'} />
                  <span className={`text-xs font-medium ${trigger === t.id ? 'text-blue-800' : 'text-gray-700'}`}>{t.label}</span>
                  {trigger === t.id && <FiCheck className="ml-auto text-blue-600 text-xs" />}
                </button>
              )
            })}
          </div>
        </FlowBlock>

        <Connector />

        {/* CONDITIONS */}
        <FlowBlock color="bg-yellow-500" label="CONDITIONS" icon={FiFilter}>
          <p className="text-xs text-gray-500 mb-3">Only if all these conditions are met… (optional)</p>
          <div className="space-y-3">
            {conditions.map((cond, i) => {
              const def = CONDITIONS.find(c => c.id === cond.type)
              return (
                <div key={cond.id} className="flex items-start gap-3 rounded-xl border border-gray-200 p-3">
                  {i > 0 && <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded self-center shrink-0">AND</span>}
                  <select value={cond.type}
                    onChange={e => setConditions(c => c.map(x => x.id === cond.id ? { ...x, type: e.target.value, values: {} } : x))}
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-yellow-400 shrink-0">
                    {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  {def?.fields.map(f => (
                    f.type === 'select'
                      ? <select key={f.key} value={cond.values[f.key] || f.options[0]}
                          onChange={e => updateCondition(cond.id, f.key, e.target.value)}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-yellow-400">
                          {f.options.map(o => <option key={o}>{o}</option>)}
                        </select>
                      : <input key={f.key} placeholder={f.placeholder} value={cond.values[f.key] || ''}
                          onChange={e => updateCondition(cond.id, f.key, e.target.value)}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-yellow-400 flex-1 min-w-0" />
                  ))}
                  <button onClick={() => removeCondition(cond.id)} className="ml-auto text-red-400 hover:text-red-600 shrink-0"><FiTrash2 /></button>
                </div>
              )
            })}
            <button onClick={addCondition}
              className="flex items-center gap-2 rounded-xl border-2 border-dashed border-yellow-300 px-4 py-2.5 text-sm text-yellow-700 hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
              <FiPlus /> Add Condition
            </button>
          </div>
        </FlowBlock>

        <Connector />

        {/* ACTIONS */}
        <FlowBlock color="bg-green-600" label="ACTIONS" icon={FiPlay}>
          <p className="text-xs text-gray-500 mb-3">Then run these actions in order…</p>
          <div className="space-y-3">
            {actions.map((act, i) => {
              const def = ACTIONS.find(a => a.id === act.type)
              const AIcon = def?.icon || FiZap
              return (
                <div key={act.id} className="rounded-xl border border-gray-200 p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 shrink-0 mt-0.5">{i+1}</span>
                    <div className="flex-1 space-y-2">
                      <select value={act.type}
                        onChange={e => setActions(a => a.map(x => x.id === act.id ? { ...x, type: e.target.value, values: {} } : x))}
                        className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-green-400">
                        {ACTIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                      </select>
                      {def?.fields.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {def.fields.map(f => (
                            f.type === 'select'
                              ? <select key={f.key} value={act.values[f.key] || f.options[0]}
                                  onChange={e => updateAction(act.id, f.key, e.target.value)}
                                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-green-400">
                                  {f.options.map(o => <option key={o}>{o}</option>)}
                                </select>
                              : <input key={f.key} placeholder={f.placeholder} value={act.values[f.key] || ''}
                                  onChange={e => updateAction(act.id, f.key, e.target.value)}
                                  className="flex-1 min-w-0 rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-green-400" />
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeAction(act.id)} className="text-red-400 hover:text-red-600 mt-0.5 shrink-0"><FiTrash2 /></button>
                  </div>
                </div>
              )
            })}
            <button onClick={addAction}
              className="flex items-center gap-2 rounded-xl border-2 border-dashed border-green-300 px-4 py-2.5 text-sm text-green-700 hover:border-green-500 hover:bg-green-50 transition-colors">
              <FiPlus /> Add Action
            </button>
          </div>
        </FlowBlock>

        {/* Validation */}
        {!isValid && (
          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3 flex items-center gap-2 text-sm text-orange-700">
            <FiAlertCircle className="shrink-0" />
            {!trigger ? 'Select a trigger to continue.' : 'Add at least one action to save this workflow.'}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Flow Block Shell ─── */
function FlowBlock({ color, label, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className={`flex items-center gap-2 px-5 py-3 ${color} text-white`}>
        <Icon className="text-lg" />
        <span className="text-sm font-bold tracking-wider">{label}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

/* ─── Connector Arrow ─── */
function Connector() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center">
        <div className="h-4 w-px bg-gray-300" />
        <FiArrowDown className="text-gray-400" />
      </div>
    </div>
  )
}
