import React, { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiToggleRight, FiToggleLeft, FiClock, FiAlertTriangle } from 'react-icons/fi'
import { getWorkflowRules, createWorkflowRule, updateWorkflowRule, deleteWorkflowRule } from '../lib/api-features'

export default function WorkflowAutomation() {
  const [rules, setRules] = useState([
    { id: 1, name: 'Auto-escalate critical', condition: 'Priority = Critical', action: 'Escalate to Manager', enabled: true, slaTime: '2 hours' },
    { id: 2, name: 'Auto-assign network', condition: 'Category = Network', action: 'Assign to Network Team', enabled: true, slaTime: '4 hours' },
    { id: 3, name: 'Auto-close resolved', condition: 'No activity for 7 days', action: 'Close ticket', enabled: false, slaTime: '7 days' }
  ])

  const [showNew, setShowNew] = useState(false)
  const [newRule, setNewRule] = useState({ name: '', condition: '', action: '', slaTime: '' })

  useEffect(() => {
    // Load workflow rules from API
    const loadRules = async () => {
      try {
        const data = await getWorkflowRules()
        if (data && data.length > 0) {
          setRules(data)
        }
      } catch (error) {
        console.error('Failed to load workflow rules:', error)
      }
    }

    loadRules()
  }, [])

  const toggleRule = async (id) => {
    const rule = rules.find(r => r.id === id)
    try {
      await updateWorkflowRule(id, !rule.enabled)
      setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
    } catch (error) {
      console.error('Failed to toggle rule:', error)
    }
  }

  const deleteRule = async (id) => {
    try {
      await deleteWorkflowRule(id)
      setRules(rules.filter(r => r.id !== id))
    } catch (error) {
      console.error('Failed to delete rule:', error)
    }
  }

  const addRule = async () => {
    if (newRule.name.trim() && newRule.condition.trim() && newRule.action.trim()) {
      try {
        const created = await createWorkflowRule(newRule)
        setRules([...rules, { ...created, id: created.id || rules.length + 1 }])
        setNewRule({ name: '', condition: '', action: '', slaTime: '' })
        setShowNew(false)
      } catch (error) {
        console.error('Failed to create rule:', error)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-hope-ink dark:text-slate-100">Workflow & SLA Rules</h3>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 rounded-xl bg-hope-primary px-3 py-2 text-white hover:opacity-90"
        >
          <FiPlus className="h-4 w-4" />
          New Rule
        </button>
      </div>

      {/* New Rule Form */}
      {showNew && (
        <div className="rounded-hope border border-hope-border bg-white p-4 dark:border-slate-700 dark:bg-slate-900 space-y-3">
          <input
            type="text"
            value={newRule.name}
            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            placeholder="Rule name"
            className="w-full rounded-xl border border-hope-border bg-white px-3 py-2 text-hope-ink outline-none focus:border-hope-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            type="text"
            value={newRule.condition}
            onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
            placeholder="Condition (e.g., Priority = Critical)"
            className="w-full rounded-xl border border-hope-border bg-white px-3 py-2 text-hope-ink outline-none focus:border-hope-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            type="text"
            value={newRule.action}
            onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
            placeholder="Action (e.g., Send notification)"
            className="w-full rounded-xl border border-hope-border bg-white px-3 py-2 text-hope-ink outline-none focus:border-hope-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            type="text"
            value={newRule.slaTime}
            onChange={(e) => setNewRule({ ...newRule, slaTime: e.target.value })}
            placeholder="SLA time (e.g., 4 hours)"
            className="w-full rounded-xl border border-hope-border bg-white px-3 py-2 text-hope-ink outline-none focus:border-hope-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <div className="flex gap-2">
            <button
              onClick={addRule}
              className="flex-1 rounded-xl bg-hope-primary px-3 py-2 text-white hover:opacity-90"
            >
              Add Rule
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="flex-1 rounded-xl border border-hope-border px-3 py-2 hover:bg-hope-canvas dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map(rule => (
          <div key={rule.id} className="rounded-hope border border-hope-border p-4 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-hope-ink dark:text-slate-100">{rule.name}</h4>
                  {rule.enabled ? (
                    <FiToggleRight
                      onClick={() => toggleRule(rule.id)}
                      className="h-5 w-5 text-hope-success cursor-pointer"
                    />
                  ) : (
                    <FiToggleLeft
                      onClick={() => toggleRule(rule.id)}
                      className="h-5 w-5 text-hope-secondary cursor-pointer"
                    />
                  )}
                </div>
                <p className="text-sm text-hope-secondary">
                  <strong>Condition:</strong> {rule.condition}
                </p>
                <p className="text-sm text-hope-secondary">
                  <strong>Action:</strong> {rule.action}
                </p>
                {rule.slaTime && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-hope-secondary">
                    <FiClock className="h-3 w-3" />
                    <strong>SLA:</strong> {rule.slaTime}
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteRule(rule.id)}
                className="text-hope-secondary hover:text-hope-danger"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
            {!rule.enabled && (
              <div className="flex items-center gap-2 text-xs text-hope-warning bg-hope-warning/10 p-2 rounded">
                <FiAlertTriangle className="h-3 w-3" />
                This rule is disabled
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
