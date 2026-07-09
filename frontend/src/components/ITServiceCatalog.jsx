import { useState } from 'react'
import {
  FiShoppingCart, FiMonitor, FiWifi, FiLock, FiDownload, FiPrinter,
  FiSmartphone, FiHeadphones, FiMail, FiShield, FiTool, FiUserPlus,
  FiCheck, FiChevronRight, FiX, FiSend, FiStar, FiClock, FiInfo
} from 'react-icons/fi'

/* ─────────── Service Catalog Data ─────────── */
const CATEGORIES = [
  { id: 'all', label: 'All Services', icon: FiShoppingCart },
  { id: 'hardware', label: 'Hardware', icon: FiMonitor },
  { id: 'software', label: 'Software', icon: FiDownload },
  { id: 'access', label: 'Access & Identity', icon: FiLock },
  { id: 'network', label: 'Network & VPN', icon: FiWifi },
  { id: 'communication', label: 'Communication', icon: FiMail },
  { id: 'security', label: 'Security', icon: FiShield },
  { id: 'support', label: 'IT Support', icon: FiTool },
  { id: 'onboarding', label: 'Onboarding', icon: FiUserPlus },
]

const SERVICES = [
  /* Hardware */
  {
    id: 'hw-laptop', category: 'hardware', name: 'New Laptop Request',
    icon: FiMonitor, description: 'Request a new laptop or replacement. Select specs based on your role.',
    sla: '3-5 business days', popular: true, fields: [
      { key: 'reason', label: 'Reason for request', type: 'textarea' },
      { key: 'specs', label: 'Preferred specs', type: 'select', options: ['Standard (i5, 16GB)', 'Power User (i7, 32GB)', 'Developer (i9, 64GB)'] },
      { key: 'os', label: 'Operating System', type: 'select', options: ['Windows 11', 'macOS Sequoia', 'Ubuntu 24.04'] },
    ]
  },
  {
    id: 'hw-monitor', category: 'hardware', name: 'Monitor Request',
    icon: FiMonitor, description: 'Request an additional or replacement monitor for your workstation.',
    sla: '2-3 business days', popular: false, fields: [
      { key: 'size', label: 'Monitor size', type: 'select', options: ['24 inch', '27 inch', '32 inch', 'Ultrawide 34 inch'] },
      { key: 'reason', label: 'Reason', type: 'textarea' },
    ]
  },
  {
    id: 'hw-headset', category: 'hardware', name: 'Headset / Audio Equipment',
    icon: FiHeadphones, description: 'Request a headset for calls, meetings, or focus work.',
    sla: '1-2 business days', popular: false, fields: [
      { key: 'type', label: 'Type', type: 'select', options: ['USB Headset', 'Bluetooth Headset', 'Webcam', 'USB-C Hub', 'Keyboard/Mouse'] },
      { key: 'reason', label: 'Business justification', type: 'textarea' },
    ]
  },
  {
    id: 'hw-phone', category: 'hardware', name: 'Mobile Phone Request',
    icon: FiSmartphone, description: 'Request a company mobile phone for business use.',
    sla: '5-7 business days', popular: false, fields: [
      { key: 'role', label: 'Job role requiring mobile', type: 'text' },
      { key: 'reason', label: 'Business justification', type: 'textarea' },
    ]
  },

  /* Software */
  {
    id: 'sw-install', category: 'software', name: 'Software Installation',
    icon: FiDownload, description: 'Request installation of approved software on your device.',
    sla: '4 hours', popular: true, fields: [
      { key: 'software', label: 'Software name & version', type: 'text' },
      { key: 'reason', label: 'Business reason for this software', type: 'textarea' },
      { key: 'licensed', label: 'License availability', type: 'select', options: ['Company has license', 'Need license purchased', 'Free/open-source'] },
    ]
  },
  {
    id: 'sw-license', category: 'software', name: 'Software License Request',
    icon: FiDownload, description: 'Request a new license for a commercial software product.',
    sla: '2-3 business days', popular: false, fields: [
      { key: 'product', label: 'Product name', type: 'text' },
      { key: 'vendor', label: 'Vendor / Publisher', type: 'text' },
      { key: 'cost', label: 'Estimated annual cost (USD)', type: 'text' },
      { key: 'reason', label: 'Business justification', type: 'textarea' },
    ]
  },
  {
    id: 'sw-m365', category: 'software', name: 'Microsoft 365 App Access',
    icon: FiMail, description: 'Request access to a Microsoft 365 application like Visio, Project, or Power BI.',
    sla: '1 business day', popular: true, fields: [
      { key: 'app', label: 'Application name', type: 'select', options: ['Visio', 'Project', 'Power BI Pro', 'Power Automate', 'Dynamics 365'] },
      { key: 'reason', label: 'How will you use this?', type: 'textarea' },
    ]
  },

  /* Access & Identity */
  {
    id: 'acc-new', category: 'access', name: 'New System Access',
    icon: FiLock, description: 'Request access to a specific system, application, or shared resource.',
    sla: '1 business day', popular: true, fields: [
      { key: 'system', label: 'System / Application name', type: 'text' },
      { key: 'access_level', label: 'Access level required', type: 'select', options: ['Read Only', 'Read/Write', 'Admin', 'Full Control'] },
      { key: 'reason', label: 'Business justification', type: 'textarea' },
      { key: 'approver', label: 'Manager / approver name', type: 'text' },
    ]
  },
  {
    id: 'acc-pwd', category: 'access', name: 'Password Reset Assistance',
    icon: FiLock, description: 'Get help resetting your password when self-service options are not available.',
    sla: '30 minutes', popular: true, fields: [
      { key: 'account', label: 'Account or system', type: 'text' },
      { key: 'detail', label: 'Describe the issue', type: 'textarea' },
    ]
  },
  {
    id: 'acc-mfa', category: 'access', name: 'MFA / Authenticator Setup',
    icon: FiShield, description: 'Set up or reset multi-factor authentication on your account.',
    sla: '2 hours', popular: false, fields: [
      { key: 'method', label: 'MFA method', type: 'select', options: ['Microsoft Authenticator', 'SMS', 'Hardware Token', 'Backup Codes'] },
      { key: 'reason', label: 'Reason for request', type: 'select', options: ['New device', 'Lost phone', 'First-time setup', 'Reset existing'] },
    ]
  },

  /* Network */
  {
    id: 'net-vpn', category: 'network', name: 'VPN Access Setup',
    icon: FiWifi, description: 'Request VPN access for remote work or set up VPN on a new device.',
    sla: '4 hours', popular: true, fields: [
      { key: 'device', label: 'Device type', type: 'select', options: ['Windows Laptop', 'Mac', 'iOS', 'Android', 'Linux'] },
      { key: 'reason', label: 'Primary use case', type: 'select', options: ['Remote work', 'Travel', 'Home office', 'Branch office'] },
    ]
  },
  {
    id: 'net-wifi', category: 'network', name: 'WiFi Connectivity Issue',
    icon: FiWifi, description: 'Report issues connecting to the office WiFi network.',
    sla: '1 hour', popular: false, fields: [
      { key: 'location', label: 'Office location / floor', type: 'text' },
      { key: 'device', label: 'Device type & model', type: 'text' },
      { key: 'issue', label: 'Describe the issue', type: 'textarea' },
    ]
  },

  /* Communication */
  {
    id: 'com-email', category: 'communication', name: 'Email Account Setup',
    icon: FiMail, description: 'Request setup of a new email account or mailbox configuration.',
    sla: '4 hours', popular: false, fields: [
      { key: 'type', label: 'Account type', type: 'select', options: ['Personal mailbox', 'Shared mailbox', 'Distribution list', 'Resource mailbox'] },
      { key: 'name', label: 'Display name', type: 'text' },
      { key: 'reason', label: 'Purpose', type: 'textarea' },
    ]
  },
  {
    id: 'com-teams', category: 'communication', name: 'Microsoft Teams Support',
    icon: FiHeadphones, description: 'Get help with Teams channels, meetings, calling, or permissions.',
    sla: '2 hours', popular: false, fields: [
      { key: 'issue', label: 'Issue type', type: 'select', options: ['Cannot join meetings', 'Audio/Video not working', 'Missing channels', 'Permission issue', 'Other'] },
      { key: 'detail', label: 'Describe the issue', type: 'textarea' },
    ]
  },

  /* Security */
  {
    id: 'sec-phishing', category: 'security', name: 'Report Phishing / Suspicious Email',
    icon: FiShield, description: 'Report a suspicious email, link, or potential security incident.',
    sla: '15 minutes', popular: true, urgent: true, fields: [
      { key: 'sender', label: 'Sender email address', type: 'text' },
      { key: 'subject', label: 'Email subject', type: 'text' },
      { key: 'action', label: 'Did you click any links?', type: 'select', options: ['No, just reporting', 'Clicked a link', 'Opened an attachment', 'Entered credentials'] },
      { key: 'detail', label: 'Additional details', type: 'textarea' },
    ]
  },
  {
    id: 'sec-lost', category: 'security', name: 'Report Lost / Stolen Device',
    icon: FiShield, description: 'Immediately report a lost or stolen company device for remote wipe.',
    sla: '15 minutes', popular: false, urgent: true, fields: [
      { key: 'device', label: 'Device type', type: 'text' },
      { key: 'serial', label: 'Serial number (if known)', type: 'text' },
      { key: 'when', label: 'When was it last seen?', type: 'text' },
      { key: 'location', label: 'Location where lost/stolen', type: 'text' },
    ]
  },

  /* Support */
  {
    id: 'sup-general', category: 'support', name: 'General IT Help',
    icon: FiTool, description: 'Request general IT assistance that doesn\'t fit other categories.',
    sla: '4 hours', popular: false, fields: [
      { key: 'issue', label: 'Describe your issue', type: 'textarea' },
      { key: 'urgency', label: 'How urgent is this?', type: 'select', options: ['Not urgent — whenever', 'Today if possible', 'Within an hour', 'Blocking my work'] },
    ]
  },
  {
    id: 'sup-remote', category: 'support', name: 'Remote Desktop Support',
    icon: FiTool, description: 'Request a remote desktop session with an IT agent to diagnose your issue.',
    sla: '1 hour', popular: false, fields: [
      { key: 'issue', label: 'Issue to resolve', type: 'textarea' },
      { key: 'time', label: 'Preferred time', type: 'select', options: ['ASAP', 'Morning (9 AM–12 PM)', 'Afternoon (1 PM–5 PM)', 'I\'ll be available any time'] },
    ]
  },
  {
    id: 'sup-printer', category: 'support', name: 'Printer / Scanner Issue',
    icon: FiPrinter, description: 'Report problems with office printers or scanners.',
    sla: '2 hours', popular: false, fields: [
      { key: 'printer', label: 'Printer name / location', type: 'text' },
      { key: 'issue', label: 'Issue type', type: 'select', options: ['Won\'t print', 'Paper jam', 'Scanner not working', 'Print quality issue', 'Setup new printer'] },
    ]
  },

  /* Onboarding */
  {
    id: 'onb-new', category: 'onboarding', name: 'New Employee IT Setup',
    icon: FiUserPlus, description: 'Full IT setup for a new team member — account, laptop, access.',
    sla: '1 business day', popular: false, fields: [
      { key: 'name', label: 'New employee full name', type: 'text' },
      { key: 'start', label: 'Start date', type: 'text' },
      { key: 'role', label: 'Job title / department', type: 'text' },
      { key: 'systems', label: 'Systems access required', type: 'textarea' },
    ]
  },
  {
    id: 'onb-offboard', category: 'onboarding', name: 'Employee Offboarding',
    icon: FiUserPlus, description: 'Revoke access and manage device return for departing employee.',
    sla: 'Same day', popular: false, fields: [
      { key: 'name', label: 'Employee name', type: 'text' },
      { key: 'last_day', label: 'Last working day', type: 'text' },
      { key: 'device', label: 'Device return needed?', type: 'select', options: ['Yes — ship label needed', 'Yes — drop off in office', 'No — keep device'] },
    ]
  },
]

/* ─────────── Main Component ─────────── */
export default function ITServiceCatalog() {
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [formValues, setFormValues] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const filtered = SERVICES.filter(s =>
    (cat === 'all' || s.category === cat) &&
    (!query || s.name.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase()))
  )

  const popular = SERVICES.filter(s => s.popular)

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setSelected(null); setFormValues({}) }, 2400)
  }

  /* ─── Service Request Form ─── */
  if (selected) {
    const svc = SERVICES.find(s => s.id === selected)
    if (!svc) return null
    const Icon = svc.icon
    return (
      <div className="p-6 max-w-2xl mx-auto">
        {submitted ? (
          <div className="rounded-2xl bg-green-50 border-2 border-green-300 p-10 text-center">
            <FiCheck className="text-6xl text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800">Request Submitted!</h3>
            <p className="mt-2 text-green-700">Your request for <strong>{svc.name}</strong> has been received.</p>
            <p className="mt-1 text-sm text-green-600">Expected fulfillment: {svc.sla}</p>
          </div>
        ) : (
          <>
            <button onClick={() => setSelected(null)} className="mb-4 text-sm text-indigo-600 hover:underline">← Back to catalog</button>
            <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 text-xl">
                  <Icon />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{svc.name}</h2>
                  <p className="text-sm text-gray-500">{svc.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-5 mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                <FiClock /><span>SLA: <strong>{svc.sla}</strong></span>
                {svc.urgent && <span className="ml-2 rounded bg-red-600 text-white text-xs px-2 py-0.5">Urgent</span>}
              </div>

              <div className="space-y-4">
                {svc.fields.map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    {f.type === 'text' && (
                      <input type="text" value={formValues[f.key] || ''} onChange={e => setFormValues({ ...formValues, [f.key]: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    )}
                    {f.type === 'textarea' && (
                      <textarea rows={3} value={formValues[f.key] || ''} onChange={e => setFormValues({ ...formValues, [f.key]: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    )}
                    {f.type === 'select' && (
                      <select value={formValues[f.key] || f.options[0]} onChange={e => setFormValues({ ...formValues, [f.key]: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                ))}
                <button onClick={handleSubmit}
                  className="w-full rounded-lg bg-indigo-600 py-3 text-white font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">
                  <FiSend /> Submit Service Request
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  /* ─── Catalog Grid ─── */
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">IT Service Catalog</h1>
        <p className="text-gray-500 text-sm mt-0.5">Browse and request IT services — from new hardware to security help</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-3 text-gray-400">🔍</span>
        <input type="text" placeholder="Search services..." value={query} onChange={e => setQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>

      {/* Popular Services */}
      {!query && cat === 'all' && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiStar className="text-yellow-500" /> Popular Requests
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {popular.map(s => {
              const Icon = s.icon
              return (
                <button key={s.id} onClick={() => setSelected(s.id)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center hover:border-indigo-400 hover:shadow-sm transition-all bg-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <Icon className="text-xl" />
                  </div>
                  <span className="text-sm font-medium leading-tight">{s.name}</span>
                  <span className="text-xs text-gray-400">{s.sla}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {CATEGORIES.map(c => {
          const Icon = c.icon
          return (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors shrink-0
                ${cat === c.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Icon className="text-base" />
              {c.label}
            </button>
          )
        })}
      </div>

      {/* Services Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(s => {
          const Icon = s.icon
          return (
            <div key={s.id}
              className={`rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer bg-white ${s.urgent ? 'border-red-200' : 'border-gray-200 hover:border-indigo-300'}`}
              onClick={() => setSelected(s.id)}>
              <div className="flex items-start justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.urgent ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  <Icon className="text-xl" />
                </div>
                {s.urgent && <span className="rounded bg-red-600 px-2 py-0.5 text-xs text-white">Urgent</span>}
                {s.popular && !s.urgent && <span className="rounded bg-yellow-100 text-yellow-700 px-2 py-0.5 text-xs font-medium">Popular</span>}
              </div>
              <h3 className="font-semibold text-gray-800">{s.name}</h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{s.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><FiClock className="text-xs" /> {s.sla}</span>
                <span className="flex items-center gap-1 text-indigo-600 font-medium">Request <FiChevronRight /></span>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No services found for "{query}"</p>
          <p className="text-sm mt-1">Try a different search term or browse by category</p>
        </div>
      )}
    </div>
  )
}
