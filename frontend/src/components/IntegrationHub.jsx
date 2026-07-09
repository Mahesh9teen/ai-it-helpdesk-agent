import React, { useState } from 'react'
import { FiLink, FiCheck, FiAlertCircle, FiRefreshCw, FiSettings, FiPlus, FiTrash2, FiEye, FiEyeOff, FiZap } from 'react-icons/fi'

const INTEGRATIONS = [
  {
    id: 'jira',
    name: 'Jira',
    logo: '🟦',
    description: 'Sync tickets bidirectionally with Jira issues. Auto-create Jira issues for P1/P2 tickets.',
    status: 'connected',
    lastSync: '3 min ago',
    syncCount: 142,
    config: { project: 'HELP', url: 'https://company.atlassian.net', auto_create: true, auto_close: true },
    fields: [
      { key: 'url', label: 'Jira URL', placeholder: 'https://your-domain.atlassian.net', type: 'text' },
      { key: 'project', label: 'Project Key', placeholder: 'HELP', type: 'text' },
      { key: 'email', label: 'Account Email', placeholder: 'admin@company.com', type: 'text' },
      { key: 'api_token', label: 'API Token', placeholder: '••••••••••••', type: 'password' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    logo: '🟩',
    description: 'Post ticket updates, SLA alerts, and escalations to Slack channels.',
    status: 'connected',
    lastSync: '1 min ago',
    syncCount: 891,
    config: { channel: '#it-helpdesk', notify_on: ['critical', 'escalation', 'sla_breach'] },
    fields: [
      { key: 'webhook_url', label: 'Incoming Webhook URL', placeholder: 'https://hooks.slack.com/services/...', type: 'text' },
      { key: 'channel', label: 'Default Channel', placeholder: '#it-helpdesk', type: 'text' },
      { key: 'bot_token', label: 'Bot OAuth Token', placeholder: 'xoxb-...', type: 'password' },
    ],
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    logo: '🟥',
    description: 'Enterprise ITSM sync. Push incidents and change requests to ServiceNow.',
    status: 'disconnected',
    lastSync: null,
    syncCount: 0,
    config: {},
    fields: [
      { key: 'instance_url', label: 'Instance URL', placeholder: 'https://company.service-now.com', type: 'text' },
      { key: 'username', label: 'Username', placeholder: 'admin', type: 'text' },
      { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
    ],
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    logo: '🟢',
    description: 'Auto-page on-call engineer when P1 incidents are declared.',
    status: 'disconnected',
    lastSync: null,
    syncCount: 0,
    config: {},
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'pdl-...', type: 'password' },
      { key: 'service_id', label: 'Service ID', placeholder: 'P1ABCDE', type: 'text' },
    ],
  },
  {
    id: 'microsoft_teams',
    name: 'Microsoft Teams',
    logo: '🔵',
    description: 'Post IT alerts and ticket updates to Teams channels.',
    status: 'disconnected',
    lastSync: null,
    syncCount: 0,
    config: {},
    fields: [
      { key: 'webhook_url', label: 'Incoming Webhook URL', placeholder: 'https://outlook.office.com/webhook/...', type: 'text' },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    logo: '⚫',
    description: 'Link tickets to GitHub issues. Auto-create bug reports for developer-facing issues.',
    status: 'disconnected',
    lastSync: null,
    syncCount: 0,
    config: {},
    fields: [
      { key: 'token', label: 'Personal Access Token', placeholder: 'ghp_...', type: 'password' },
      { key: 'repo', label: 'Repository', placeholder: 'org/repo', type: 'text' },
    ],
  },
]

const WEBHOOKS_INITIAL = [
  { id: 1, event: 'ticket.created', url: 'https://hooks.example.com/new-ticket', active: true },
  { id: 2, event: 'ticket.escalated', url: 'https://hooks.example.com/escalate', active: true },
  { id: 3, event: 'sla.breach', url: 'https://hooks.example.com/sla-alert', active: false },
]

function IntegrationCard({ integration, onToggle }) {
  const [expanded, setExpanded] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [localConfig, setLocalConfig] = useState(integration.config || {})
  const [saved, setSaved] = useState(false)

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 1500)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="hope-card overflow-hidden">
      <div className="flex items-center gap-4 p-5">
        <span className="text-2xl">{integration.logo}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-hope-ink dark:text-slate-100">{integration.name}</p>
            {integration.status === 'connected' ? (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <FiCheck className="h-3 w-3" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-hope-canvas px-2 py-0.5 text-[11px] font-semibold text-hope-secondary dark:bg-slate-700">
                <FiAlertCircle className="h-3 w-3" /> Disconnected
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-hope-secondary">{integration.description}</p>
          {integration.status === 'connected' && (
            <p className="mt-0.5 text-xs text-hope-secondary">
              Last sync: {integration.lastSync} · {integration.syncCount} items synced
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {integration.status === 'connected' && (
            <button
              onClick={handleSync}
              className={`rounded-lg p-2 text-hope-secondary transition-colors hover:bg-hope-canvas dark:hover:bg-slate-800 ${syncing ? 'animate-spin text-hope-primary' : ''}`}
            >
              <FiRefreshCw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onToggle(integration.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              integration.status === 'connected' ? 'bg-hope-primary' : 'bg-hope-border dark:bg-slate-700'
            }`}
          >
            <span className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform ${
              integration.status === 'connected' ? 'translate-x-6' : ''
            }`} />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="rounded-lg p-2 text-hope-secondary transition-colors hover:bg-hope-canvas dark:hover:bg-slate-800"
          >
            <FiSettings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-hope-border bg-hope-canvas/50 px-5 pb-5 pt-4 dark:border-slate-700 dark:bg-slate-800/30">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {integration.fields.map(f => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-medium text-hope-secondary">{f.label}</label>
                <div className="relative">
                  <input
                    type={f.type === 'password' && !showSecrets ? 'password' : 'text'}
                    placeholder={f.placeholder}
                    defaultValue={localConfig[f.key] || ''}
                    onChange={e => setLocalConfig(c => ({ ...c, [f.key]: e.target.value }))}
                    className="hope-input w-full pr-8 text-sm"
                  />
                  {f.type === 'password' && (
                    <button
                      type="button"
                      onClick={() => setShowSecrets(s => !s)}
                      className="absolute right-2 top-2 text-hope-secondary hover:text-hope-primary"
                    >
                      {showSecrets ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleSave}
              className="hope-btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
            >
              {saved ? <><FiCheck className="h-4 w-4" /> Saved!</> : 'Save Configuration'}
            </button>
            <button
              onClick={() => {}}
              className="rounded-lg border border-hope-border px-4 py-2 text-sm text-hope-secondary hover:bg-hope-canvas dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Test Connection
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function IntegrationHub() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS)
  const [webhooks, setWebhooks] = useState(WEBHOOKS_INITIAL)
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookEvent, setNewWebhookEvent] = useState('ticket.created')

  const toggleIntegration = (id) => {
    setIntegrations(prev => prev.map(i =>
      i.id === id ? { ...i, status: i.status === 'connected' ? 'disconnected' : 'connected' } : i
    ))
  }

  const addWebhook = () => {
    if (!newWebhookUrl) return
    setWebhooks(w => [...w, { id: Date.now(), event: newWebhookEvent, url: newWebhookUrl, active: true }])
    setNewWebhookUrl('')
  }

  const connected = integrations.filter(i => i.status === 'connected').length

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100 flex items-center gap-2">
          <FiLink className="h-5 w-5 text-hope-primary" /> Integration Hub
        </h2>
        <p className="text-sm text-hope-secondary dark:text-slate-400">
          {connected}/{integrations.length} integrations connected
        </p>
      </div>

      <div className="space-y-3">
        {integrations.map(i => (
          <IntegrationCard key={i.id} integration={i} onToggle={toggleIntegration} />
        ))}
      </div>

      {/* Webhooks */}
      <div className="hope-card p-5">
        <h3 className="flex items-center gap-2 font-semibold text-hope-ink dark:text-slate-100">
          <FiZap className="h-4 w-4 text-hope-primary" /> Outgoing Webhooks
        </h3>
        <p className="mt-1 text-sm text-hope-secondary">Fire HTTP POST to your endpoints on ticket events</p>

        <div className="mt-4 space-y-2">
          {webhooks.map(wh => (
            <div key={wh.id} className="flex items-center gap-3 rounded-lg border border-hope-border bg-hope-canvas p-3 dark:border-slate-700 dark:bg-slate-800/50">
              <span className={`h-2 w-2 rounded-full shrink-0 ${wh.active ? 'bg-green-500' : 'bg-hope-border'}`} />
              <code className="truncate text-xs font-mono text-hope-secondary">{wh.event}</code>
              <span className="mx-1 text-hope-secondary">→</span>
              <code className="flex-1 truncate text-xs font-mono text-hope-ink dark:text-slate-300">{wh.url}</code>
              <button
                onClick={() => setWebhooks(w => w.map(h => h.id === wh.id ? { ...h, active: !h.active } : h))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${wh.active ? 'bg-hope-primary' : 'bg-hope-border dark:bg-slate-600'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 translate-x-0.5 rounded-full bg-white transition-transform ${wh.active ? 'translate-x-4' : ''}`} />
              </button>
              <button
                onClick={() => setWebhooks(w => w.filter(h => h.id !== wh.id))}
                className="text-red-400 hover:text-red-600"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <select
            value={newWebhookEvent}
            onChange={e => setNewWebhookEvent(e.target.value)}
            className="hope-input w-44 text-sm"
          >
            {['ticket.created', 'ticket.updated', 'ticket.escalated', 'ticket.resolved', 'sla.breach', 'incident.declared'].map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <input
            value={newWebhookUrl}
            onChange={e => setNewWebhookUrl(e.target.value)}
            placeholder="https://your-endpoint.com/webhook"
            className="hope-input flex-1 text-sm"
          />
          <button onClick={addWebhook} className="hope-btn-primary flex items-center gap-1.5 px-4 py-2 text-sm">
            <FiPlus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
    </section>
  )
}
