import { useState, useRef, useEffect } from 'react'
import {
  FiCpu, FiSend, FiZap, FiCopy, FiCheck, FiChevronDown,
  FiChevronUp, FiAlertCircle, FiCheckCircle, FiClock,
  FiThumbsUp, FiThumbsDown, FiRefreshCw, FiList, FiMessageSquare,
  FiTag, FiAlertTriangle
} from 'react-icons/fi'

/* ─── Mock AI "brain" ─── */
const KB_SOLUTIONS = {
  vpn: {
    title: 'VPN Connectivity Issue',
    confidence: 97,
    steps: [
      'Verify VPN client version is 5.0.04032 or higher — check About dialog.',
      'Open cmd/terminal and run: ipconfig /flushdns && ipconfig /release && ipconfig /renew',
      'Check Windows Firewall is not blocking the VPN application (Allow through firewall).',
      'Reinstall Cisco AnyConnect: uninstall via Control Panel, reboot, download latest from portal.',
      'If issue persists, collect VPN log from C:\\ProgramData\\Cisco\\Cisco AnyConnect Secure Mobility Client\\Logs and attach to ticket.',
    ],
    reply: `Hi {name},\n\nThank you for reaching out to IT Support. I've reviewed your VPN issue.\n\nPlease try the following steps:\n1. Open Command Prompt as Administrator\n2. Run: ipconfig /flushdns\n3. Disconnect and reconnect VPN\n\nIf you still have issues after these steps, please let me know and we'll escalate to our network team.\n\nBest regards,\nIT Support Team`,
    category: 'Network', priority: 'high', tags: ['vpn', 'connectivity', 'remote-work'],
  },
  password: {
    title: 'Password Reset / Account Lockout',
    confidence: 99,
    steps: [
      'Navigate to https://aka.ms/sspr (Self-Service Password Reset) — works outside the network.',
      'Enter your corporate email address and complete MFA verification.',
      'Choose "I forgot my password" and follow the reset wizard.',
      'New password must be 12+ characters, include upper/lower case, number and symbol.',
      'After reset, wait 5 minutes before logging in to allow AD replication.',
    ],
    reply: `Hi {name},\n\nYour account appears to be locked. Here's how to reset your password instantly:\n\n🔗 https://aka.ms/sspr\n\nThis self-service portal works from any device, even at home. No IT agent needed!\n\nIf you don't have MFA set up yet, please call IT ext. 1234 and we'll verify your identity.\n\nBest regards,\nIT Support Team`,
    category: 'Account', priority: 'high', tags: ['password', 'account', 'lockout', 'ad'],
  },
  slow: {
    title: 'Slow Computer Performance',
    confidence: 88,
    steps: [
      'Open Task Manager (Ctrl+Shift+Esc) → Performance tab → confirm CPU/RAM/Disk usage.',
      'Check Disk usage: if at 100%, run: sfc /scannow in elevated cmd.',
      'Disable startup programs: Task Manager → Startup tab → disable non-essential items.',
      'Run Disk Cleanup: search "Disk Cleanup" → select C: drive → clean system files.',
      'Ensure Windows Update is not running in background (Settings → Windows Update).',
      'If RAM < 8GB, request upgrade via IT Service Catalog.',
    ],
    reply: `Hi {name},\n\nI can help with your slow computer. Here are some quick wins:\n\n• Press Ctrl+Shift+Esc to open Task Manager\n• Click "More details" then check the CPU and Disk columns\n• Sort by highest usage to find the culprit\n\nCommon causes: antivirus scan running, Windows Update, or a browser with too many tabs.\n\nIf Task Manager shows disk at 100%, please reply and we'll run a full diagnostic.\n\nBest regards,\nIT Support Team`,
    category: 'Hardware', priority: 'medium', tags: ['slow', 'performance', 'hardware', 'ram'],
  },
  email: {
    title: 'Email / Outlook Issue',
    confidence: 93,
    steps: [
      'Close Outlook completely (check system tray).',
      'Hold Windows key + R, type: outlook /safe — launch Outlook in Safe Mode to test.',
      'If Safe Mode works: disable add-ins one by one (File → Options → Add-ins).',
      'Run Outlook diagnostics: File → Office Account → Update Options → Update Now.',
      'For "Disconnected" status: check internet connection, then remove and re-add the account.',
      'Repair Office: Control Panel → Programs → Microsoft 365 → Change → Quick Repair.',
    ],
    reply: `Hi {name},\n\nThank you for contacting IT about your Outlook issue. Let's start with a Safe Mode test:\n\n1. Press Windows+R\n2. Type: outlook /safe\n3. Press Enter\n\nDoes Outlook work in Safe Mode? Please reply with what you see and we'll take it from there.\n\nBest regards,\nIT Support Team`,
    category: 'Software', priority: 'medium', tags: ['outlook', 'email', 'office365'],
  },
  printer: {
    title: 'Printer Not Working',
    confidence: 90,
    steps: [
      'Check printer is powered on and shows "Ready" on display — not "Error" or "Offline".',
      'On Windows: Settings → Bluetooth & devices → Printers → right-click → "Set as default".',
      'Clear print queue: Services → Print Spooler → Stop → delete files in C:\\Windows\\System32\\spool\\PRINTERS → Start.',
      'Reinstall printer: remove from Devices, download driver from IT portal, reinstall.',
      'For network printer: confirm you are connected to office WiFi (not guest network or VPN).',
    ],
    reply: `Hi {name},\n\nLet's get your printer working. First, try this quick fix:\n\n1. Open Settings → Printers & Scanners\n2. Click your printer → "Open queue"\n3. Cancel all pending jobs\n4. Right-click the printer → "See what's printing" → Printer menu → "Cancel All Documents"\n\nThen try printing a test page. Does this help?\n\nBest regards,\nIT Support Team`,
    category: 'Hardware', priority: 'low', tags: ['printer', 'hardware', 'driver'],
  },
}

const SIMILAR_TICKETS = [
  { id: 'TKT-1847', title: 'VPN dropping every hour on Windows 11', resolution: 'Updated AnyConnect to 5.0.04032', resolved: '2026-06-28', match: 94 },
  { id: 'TKT-1792', title: 'Cannot connect to VPN from home office', resolution: 'Flushed DNS cache, reinstalled client', resolved: '2026-06-20', match: 87 },
  { id: 'TKT-1654', title: 'VPN error "Unable to contact server"',  resolution: 'Firewall rule blocking port 443',  resolved: '2026-06-10', match: 78 },
]

/* ── Detect what the ticket is about ── */
function classify(text) {
  const t = text.toLowerCase()
  if (/vpn|tunnel|remote|anyconnect/i.test(t))          return 'vpn'
  if (/password|locked|lock|forgot|reset|account/i.test(t)) return 'password'
  if (/slow|hang|freeze|crash|performance|lag/i.test(t)) return 'slow'
  if (/email|outlook|mail|calendar|teams/i.test(t))      return 'email'
  if (/print|printer|scanner/i.test(t))                  return 'printer'
  return null
}

const SAMPLE_TICKETS = [
  'VPN keeps disconnecting every 30 minutes when working from home. Using Cisco AnyConnect on Windows 11.',
  'My Outlook is not syncing emails since this morning. Shows "Disconnected" in bottom right.',
  'Computer is extremely slow, takes 5 minutes to boot and apps are freezing constantly.',
  'Forgot my password and my account is now locked out, cannot log in to any company systems.',
  'The printer on Floor 2 is showing offline and no one can print to it.',
]

export default function AIResolutionEngine() {
  const [input,     setInput]    = useState('')
  const [loading,   setLoading]  = useState(false)
  const [result,    setResult]   = useState(null)
  const [copied,    setCopied]   = useState(false)
  const [showSimilar, setShowSimilar] = useState(false)
  const [feedback,  setFeedback] = useState(null)
  const [history,   setHistory]  = useState([])
  const [activeTab, setActiveTab] = useState('solution')
  const textareaRef = useRef(null)

  const analyze = () => {
    if (!input.trim()) return
    setLoading(true)
    setResult(null)
    setFeedback(null)
    setShowSimilar(false)

    // Simulate AI thinking delay
    setTimeout(() => {
      const key = classify(input)
      const solution = key ? KB_SOLUTIONS[key] : null
      const res = {
        key,
        solution,
        category: solution?.category || 'General',
        priority: solution?.priority || 'medium',
        tags: solution?.tags || ['it-support'],
        suggestedTitle: solution?.title || 'IT Support Request',
        confidence: solution?.confidence || 60,
        needsEscalation: !solution || solution.confidence < 80,
        analysedAt: new Date().toLocaleTimeString(),
      }
      setResult(res)
      setHistory(h => [{ input: input.slice(0, 60) + '…', result: res, id: Date.now() }, ...h.slice(0, 4)])
      setLoading(false)
    }, 1500)
  }

  const copyReply = () => {
    const txt = result?.solution?.reply?.replace('{name}', 'there') || ''
    navigator.clipboard.writeText(txt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const TABS = [
    { id: 'solution', label: 'Resolution Steps' },
    { id: 'reply',    label: 'Auto Reply Draft' },
    { id: 'similar',  label: `Similar Tickets (${SIMILAR_TICKETS.length})` },
  ]

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
          <FiCpu className="text-2xl text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Resolution Engine</h1>
          <p className="text-gray-500 text-sm">Paste a ticket description — AI suggests resolution steps, a reply draft, and similar past tickets</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Input Column */}
        <div className="space-y-4">
          {/* Sample Tickets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 self-center">Try sample:</span>
            {SAMPLE_TICKETS.map((s, i) => (
              <button key={i} onClick={() => { setInput(s); setResult(null) }}
                className="text-xs rounded-full border border-gray-200 px-3 py-1 hover:border-violet-400 hover:text-violet-700 transition-colors truncate max-w-[200px]">
                {s.slice(0, 40)}…
              </button>
            ))}
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={6}
              placeholder="Paste or type the ticket description here…&#10;&#10;e.g. 'My VPN keeps disconnecting every hour since yesterday. I'm working from home on Windows 11 with Cisco AnyConnect.'"
              value={input}
              onChange={e => { setInput(e.target.value); setResult(null) }}
              className="w-full rounded-2xl border-2 border-gray-200 p-4 text-sm focus:outline-none focus:border-violet-400 resize-none transition-colors"
            />
            <span className="absolute bottom-3 right-3 text-xs text-gray-400">{input.length} chars</span>
          </div>

          <button
            onClick={analyze}
            disabled={!input.trim() || loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-opacity"
          >
            {loading ? (
              <><FiRefreshCw className="animate-spin" /> Analysing with AI…</>
            ) : (
              <><FiZap /> Analyse & Resolve</>
            )}
          </button>

          {/* Analysis Result */}
          {result && (
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Classification Banner */}
              <div className={`p-4 flex items-center gap-3 ${result.needsEscalation ? 'bg-orange-50 border-b border-orange-100' : 'bg-green-50 border-b border-green-100'}`}>
                {result.needsEscalation
                  ? <FiAlertTriangle className="text-orange-600 text-xl shrink-0" />
                  : <FiCheckCircle className="text-green-600 text-xl shrink-0" />
                }
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-800">{result.suggestedTitle}</p>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${result.needsEscalation ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'}`}>
                      {result.confidence}% confidence
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{result.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${result.priority === 'high' ? 'bg-red-100 text-red-700' : result.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {result.priority} priority
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {result.tags.map(t => (
                      <span key={t} className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        <FiTag className="text-[10px]" /> {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-gray-500">Confidence</div>
                  <div className="h-2 w-20 rounded-full bg-gray-200 mt-1">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${result.confidence}%`, background: result.confidence >= 90 ? '#10b981' : result.confidence >= 70 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === t.id ? 'border-b-2 border-violet-600 text-violet-700' : 'text-gray-500 hover:text-gray-700'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {/* Resolution Steps Tab */}
                {activeTab === 'solution' && result.solution && (
                  <ol className="space-y-3">
                    {result.solution.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{i+1}</span>
                        <p className="text-sm text-gray-700 pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                )}
                {activeTab === 'solution' && !result.solution && (
                  <div className="text-center py-6 text-gray-400">
                    <FiAlertCircle className="text-4xl mx-auto mb-2 text-orange-400" />
                    <p className="font-medium text-orange-700">Low confidence — manual review needed</p>
                    <p className="text-sm mt-1">I couldn't find a specific resolution pattern. Suggest assigning to L2 support.</p>
                  </div>
                )}

                {/* Reply Draft Tab */}
                {activeTab === 'reply' && result.solution && (
                  <div>
                    <div className="rounded-xl bg-gray-50 p-4 font-mono text-sm whitespace-pre-wrap text-gray-700 border border-gray-200">
                      {result.solution.reply.replace('{name}', 'there')}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={copyReply}
                        className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700">
                        {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy to Clipboard</>}
                      </button>
                      <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <FiMessageSquare /> Apply to Ticket
                      </button>
                    </div>
                  </div>
                )}

                {/* Similar Tickets Tab */}
                {activeTab === 'similar' && (
                  <div className="space-y-3">
                    {SIMILAR_TICKETS.map(t => (
                      <div key={t.id} className="rounded-xl border border-gray-200 p-3 hover:border-violet-300 cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-800">{t.title}</p>
                          <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{t.match}% match</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1.5 flex items-center gap-1"><FiCheckCircle /> {t.resolution}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{t.id} · Resolved {t.resolved}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Feedback */}
              <div className="border-t border-gray-100 p-3 flex items-center justify-between bg-gray-50">
                <p className="text-xs text-gray-500">Was this analysis helpful?</p>
                <div className="flex gap-2">
                  <button onClick={() => setFeedback('up')}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${feedback === 'up' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 hover:bg-green-50 text-gray-700'}`}>
                    <FiThumbsUp /> Yes
                  </button>
                  <button onClick={() => setFeedback('down')}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${feedback === 'down' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 hover:bg-red-50 text-gray-700'}`}>
                    <FiThumbsDown /> No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div>
          <div className="rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiList className="text-gray-500" />
              <h3 className="font-semibold text-gray-700">Analysis History</h3>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <FiCpu className="text-3xl mx-auto mb-2 opacity-30" />
                Analyse a ticket to see history
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(h => (
                  <button key={h.id} onClick={() => { setInput(h.input.replace('…','')); setResult(h.result) }}
                    className="w-full text-left rounded-xl border border-gray-100 p-3 hover:border-violet-300 hover:bg-violet-50 transition-colors">
                    <p className="text-sm font-medium text-gray-700 truncate">{h.input}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${h.result.confidence >= 85 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {h.result.confidence}%
                      </span>
                      <span>{h.result.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Shortcut Tips */}
          <div className="mt-4 rounded-2xl bg-violet-50 border border-violet-200 p-5">
            <h3 className="font-semibold text-violet-800 text-sm mb-3">✨ AI Capabilities</h3>
            <ul className="space-y-2 text-xs text-violet-700">
              {[
                'Categorises & tags tickets automatically',
                'Suggests step-by-step resolution guides',
                'Drafts personalised customer reply emails',
                'Finds similar resolved tickets with match %',
                'Flags tickets that need L2/L3 escalation',
                'Recommends priority based on impact',
              ].map(t => (
                <li key={t} className="flex items-start gap-2">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-violet-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
