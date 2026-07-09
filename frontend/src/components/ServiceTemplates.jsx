import React, { useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'

export default function ServiceTemplates() {
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Password Reset', description: 'Step-by-step password reset process', steps: ['Verify identity', 'Send reset link', 'Confirm completion'] },
    { id: 2, name: 'VPN Connection', description: 'Troubleshoot VPN connectivity issues', steps: ['Check credentials', 'Verify VPN app version', 'Test connection'] },
    { id: 3, name: 'Email Setup', description: 'Configure email client settings', steps: ['Gather email address', 'Configure IMAP/SMTP', 'Test send/receive'] }
  ])
  const [showNew, setShowNew] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', steps: [''] })

  const addTemplate = () => {
    if (newTemplate.name.trim()) {
      setTemplates([...templates, { id: templates.length + 1, ...newTemplate }])
      setNewTemplate({ name: '', description: '', steps: [''] })
      setShowNew(false)
    }
  }

  const deleteTemplate = (id) => {
    setTemplates(templates.filter(t => t.id !== id))
  }

  const useTemplate = (template) => {
    console.log('Using template:', template)
    // In real app, would populate ticket form with template
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-hope-ink dark:text-slate-100">Service Desk Templates</h3>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 rounded-xl bg-hope-primary px-3 py-2 text-white hover:opacity-90"
        >
          <FiPlus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {/* New Template Form */}
      {showNew && (
        <div className="rounded-hope border border-hope-border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <input
            type="text"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            placeholder="Template name"
            className="w-full mb-3 rounded-xl border border-hope-border bg-white px-3 py-2 text-hope-ink outline-none focus:border-hope-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            type="text"
            value={newTemplate.description}
            onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
            placeholder="Description"
            className="w-full mb-3 rounded-xl border border-hope-border bg-white px-3 py-2 text-hope-ink outline-none focus:border-hope-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <div className="flex gap-2">
            <button
              onClick={addTemplate}
              className="flex-1 rounded-xl bg-hope-primary px-3 py-2 text-white hover:opacity-90"
            >
              Add Template
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-3">
        {templates.map(template => (
          <div key={template.id} className="rounded-hope border border-hope-border p-4 dark:border-slate-700">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-hope-ink dark:text-slate-100">{template.name}</h4>
                <p className="text-sm text-hope-secondary">{template.description}</p>
              </div>
              <button
                onClick={() => deleteTemplate(template.id)}
                className="text-hope-secondary hover:text-hope-danger"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => useTemplate(template)}
                className="flex-1 rounded-xl bg-hope-primary px-3 py-1 text-sm text-white hover:opacity-90"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
