import { useState, useEffect, useRef } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  FiShield, FiAlertTriangle, FiAlertCircle, FiCheckCircle,
  FiLock, FiUnlock, FiUser, FiGlobe, FiRefreshCw,
  FiEye, FiXCircle, FiClock, FiSearch, FiFlag
} from 'react-icons/fi'

/* ── Helpers ── */
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const randF = (a, b, d = 1) => parseFloat((Math.random() * (b - a) + a).toFixed(d))

const GEO = ['United States', 'United Kingdom', 'Germany', 'India', 'Brazil', 'Nigeria', 'China', 'Australia', 'Canada', 'Singapore']
const USERS = ['sarah.mitchell', 'chen.wei', 'jay.patel', 'emma.clarke', 'alex.rodriguez', 'priya.sharma', 'dan.harris']
const APPS = ['Microsoft 365', 'VPN', 'Salesforce', 'SharePoint', 'Azure Portal', 'Jira', 'GitHub']
const ATTACK_TYPES = ['Brute Force', 'Credential Stuffing', 'Phishing Click', 'Anomalous Login', 'Privilege Escalation', 'Data Exfil Attempt']

function genEvents(n = 12) {
  return Array.from({ length: n }, (_, i) => ({
    id: `EVT-${2000 + i}`,
    type: ['failed_login', 'suspicious_location', 'mfa_bypass', 'privilege_escalation', 'data_access', 'malware_detected'][rand(0, 5)],
    severity: ['critical', 'high', 'medium', 'low'][rand(0, 3)],
    user: USERS[rand(0, USERS.length - 1)],
    app: APPS[rand(0, APPS.length - 1)],
    location: GEO[rand(0, GEO.length - 1)],
    ip: `${rand(1, 255)}.${rand(0, 255)}.${rand(0, 255)}.${rand(0, 255)}`,
    time: `${rand(0, 23).toString().padStart(2, '0')}:${rand(0, 59).toString().padStart(2, '0')}`,
    resolved: Math.random() > 0.4,
  }))
}

function genLoginTrend() {
  return ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'].map(h => ({
    hour: h + ':00',
    successful: rand(40, 180),
    failed: rand(2, 30),
    suspicious: rand(0, 8),
  }))
}

function genGeoThreats() {
  return [
    { country: 'Nigeria',       threats: rand(18, 45) },
    { country: 'China',         threats: rand(12, 35) },
    { country: 'Brazil',        threats: rand(8, 25) },
    { country: 'Unknown (VPN)', threats: rand(5, 20) },
    { country: 'India',         threats: rand(3, 15) },
    { country: 'Russia',        threats: rand(2, 12) },
  ]
}

const COMPLIANCE_CONTROLS = [
  { id: 'MFA-001',  name: 'MFA Enforced for All Users',          status: 'pass',    framework: 'SOC 2', score: 100 },
  { id: 'ACC-002',  name: 'Privileged Access Review (Quarterly)', status: 'pass',    framework: 'ISO 27001', score: 100 },
  { id: 'LOG-003',  name: 'Audit Logging Enabled — All Systems',  status: 'pass',    framework: 'SOC 2', score: 100 },
  { id: 'PWD-004',  name: 'Password Policy (12+ chars)',          status: 'pass',    framework: 'NIST', score: 100 },
  { id: 'PAT-005',  name: 'Patch Compliance ≥ 95%',              status: 'warn',    framework: 'CIS', score: 82 },
  { id: 'EDR-006',  name: 'EDR Deployed on All Endpoints',        status: 'warn',    framework: 'CIS', score: 91 },
  { id: 'BKP-007',  name: 'Backup Verification (Monthly)',        status: 'pass',    framework: 'ISO 27001', score: 100 },
  { id: 'ENC-008',  name: 'Full-Disk Encryption — All Laptops',  status: 'fail',    framework: 'SOC 2', score: 73 },
  { id: 'VUL-009',  name: 'Vulnerability Scan (Weekly)',          status: 'pass',    framework: 'NIST', score: 100 },
  { id: 'DLP-010',  name: 'Data Loss Prevention Policy Active',   status: 'warn',    framework: 'GDPR', score: 78 },
]

const sevColor = { critical: 'bg-red-600 text-white', high: 'bg-orange-100 text-orange-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-green-100 text-green-800' }
const typeLabel = { failed_login: '🔑 Failed Login', suspicious_location: '🌍 Geo Anomaly', mfa_bypass: '🔓 MFA Bypass', privilege_escalation: '⬆ Priv Escalation', data_access: '📂 Data Access', malware_detected: '🦠 Malware' }

/* ─────────── Main Component ─────────── */
export default function SecurityAuditCenter() {
  const [events,    setEvents]   = useState(genEvents)
  const [loginData, setLoginData]= useState(genLoginTrend)
  const [geoData,   setGeoData]  = useState(genGeoThreats)
  const [tab,       setTab]      = useState('overview')
  const [pulse,     setPulse]    = useState(false)
  const [query,     setQuery]    = useState('')
  const [sevFilter, setSevFilter]= useState('all')
  const [resolved,  setResolved] = useState({})

  useEffect(() => {
    const id = setInterval(() => {
      setEvents(genEvents())
      setLoginData(genLoginTrend())
      setGeoData(genGeoThreats())
      setPulse(true)
      setTimeout(() => setPulse(false), 600)
    }, 8000)
    return () => clearInterval(id)
  }, [])

  const filteredEvents = events.filter(e =>
    (sevFilter === 'all' || e.severity === sevFilter) &&
    (!query || e.user.includes(query.toLowerCase()) || e.app.toLowerCase().includes(query.toLowerCase()) || e.location.toLowerCase().includes(query.toLowerCase()))
  )

  const critCount = events.filter(e => e.severity === 'critical').length
  const openCount = events.filter(e => !e.resolved && !resolved[e.id]).length
  const passCount = COMPLIANCE_CONTROLS.filter(c => c.status === 'pass').length
  const overallScore = Math.round(COMPLIANCE_CONTROLS.reduce((s, c) => s + c.score, 0) / COMPLIANCE_CONTROLS.length)

  const resolveEvent = id => setResolved(r => ({ ...r, [id]: true }))

  const TABS = [
    { id: 'overview',    label: '📊 Overview' },
    { id: 'events',      label: `🚨 Events (${openCount} open)` },
    { id: 'compliance',  label: '✅ Compliance' },
  ]

  /* ── Score badge colour ── */
  const scoreBg = s => s >= 95 ? 'text-green-600' : s >= 80 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 shadow-lg ${pulse ? 'ring-4 ring-red-300' : ''} transition-all`}>
            <FiShield className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Security Audit Center</h1>
            <p className="text-gray-500 text-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Live · auto-refresh 8s
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-3 rounded-2xl px-5 py-3 border-2 ${overallScore >= 90 ? 'border-green-300 bg-green-50' : overallScore >= 75 ? 'border-yellow-300 bg-yellow-50' : 'border-red-300 bg-red-50'}`}>
          <FiShield className={`text-2xl ${scoreBg(overallScore)}`} />
          <div>
            <p className="text-xs text-gray-500">Security Score</p>
            <p className={`text-3xl font-extrabold ${scoreBg(overallScore)}`}>{overallScore}<span className="text-base font-normal">/100</span></p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {[
          { label: 'Open Threats',     value: openCount,                       icon: FiAlertCircle, color: 'border-red-400 bg-red-50',    val: 'text-red-700' },
          { label: 'Critical Alerts',  value: critCount,                       icon: FiAlertTriangle, color: 'border-orange-400 bg-orange-50', val: 'text-orange-700' },
          { label: 'Compliance Score', value: `${overallScore}%`,             icon: FiCheckCircle, color: 'border-green-400 bg-green-50', val: 'text-green-700' },
          { label: 'Controls Passing', value: `${passCount}/${COMPLIANCE_CONTROLS.length}`, icon: FiLock, color: 'border-blue-400 bg-blue-50', val: 'text-blue-700' },
        ].map(k => {
          const KIcon = k.icon
          return (
            <div key={k.label} className={`rounded-2xl border-l-4 ${k.color} p-4 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-semibold text-gray-500">{k.label}</p><p className={`text-2xl font-extrabold mt-0.5 ${k.val}`}>{k.value}</p></div>
                <KIcon className={`text-2xl ${k.val} opacity-60`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-gray-200 p-1 mb-6 shadow-sm">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${tab === t.id ? 'bg-red-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            {/* Login Trend */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Login Activity — Last 24 Hours</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={loginData}>
                  <defs>
                    <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Area type="monotone" dataKey="successful" name="Successful" stroke="#10b981" fill="url(#gSuccess)" strokeWidth={2} />
                  <Area type="monotone" dataKey="failed"     name="Failed"     stroke="#ef4444" fill="url(#gFailed)"   strokeWidth={2} />
                  <Line type="monotone" dataKey="suspicious" name="Suspicious" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Critical Events */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Recent High-Severity Events</h3>
              <div className="space-y-2.5">
                {events.filter(e => ['critical','high'].includes(e.severity)).slice(0, 5).map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded ${sevColor[ev.severity]}`}>{ev.severity.toUpperCase()}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{typeLabel[ev.type] || ev.type}</p>
                      <p className="text-xs text-gray-500">{ev.user} · {ev.app} · {ev.location}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{ev.time}</span>
                    {!resolved[ev.id] && !ev.resolved && (
                      <button onClick={() => resolveEvent(ev.id)} className="text-xs text-green-600 hover:text-green-800 font-medium shrink-0">Resolve</button>
                    )}
                    {(resolved[ev.id] || ev.resolved) && <FiCheckCircle className="text-green-500 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Geo Threat Map */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-700 mb-4">🌍 Threat Origins</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={geoData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="country" type="category" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="threats" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Compliance Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Compliance Status</h3>
              <div className="space-y-2">
                {['SOC 2', 'ISO 27001', 'NIST', 'CIS', 'GDPR'].map(fw => {
                  const controls = COMPLIANCE_CONTROLS.filter(c => c.framework === fw)
                  const avg = Math.round(controls.reduce((s, c) => s + c.score, 0) / controls.length)
                  return (
                    <div key={fw}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-medium text-gray-700">{fw}</span>
                        <span className={`font-bold ${scoreBg(avg)}`}>{avg}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${avg}%`, background: avg >= 90 ? '#10b981' : avg >= 75 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EVENTS ── */}
      {tab === 'events' && (
        <div>
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input placeholder="Search by user, app, location…" value={query} onChange={e => setQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-red-400" />
            </div>
            <div className="flex gap-1">
              {['all', 'critical', 'high', 'medium', 'low'].map(s => (
                <button key={s} onClick={() => setSevFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sevFilter === s ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['ID','Type','Severity','User','App','Location','IP','Time','Status','Action'].map(h =>
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredEvents.map(ev => (
                  <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">{ev.id}</td>
                    <td className="px-3 py-2 text-xs">{typeLabel[ev.type] || ev.type}</td>
                    <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded font-semibold ${sevColor[ev.severity]}`}>{ev.severity}</span></td>
                    <td className="px-3 py-2 text-xs">{ev.user}</td>
                    <td className="px-3 py-2 text-xs">{ev.app}</td>
                    <td className="px-3 py-2 text-xs">{ev.location}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-400">{ev.ip}</td>
                    <td className="px-3 py-2 text-xs text-gray-400">{ev.time}</td>
                    <td className="px-3 py-2">
                      {resolved[ev.id] || ev.resolved
                        ? <span className="text-xs text-green-600 flex items-center gap-1"><FiCheckCircle /> Resolved</span>
                        : <span className="text-xs text-orange-600 flex items-center gap-1"><FiAlertCircle /> Open</span>}
                    </td>
                    <td className="px-3 py-2">
                      {!resolved[ev.id] && !ev.resolved && (
                        <button onClick={() => resolveEvent(ev.id)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Resolve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── COMPLIANCE ── */}
      {tab === 'compliance' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[['Passing', COMPLIANCE_CONTROLS.filter(c=>c.status==='pass').length, 'bg-green-100 text-green-800'],
              ['Warnings', COMPLIANCE_CONTROLS.filter(c=>c.status==='warn').length, 'bg-yellow-100 text-yellow-800'],
              ['Failing',  COMPLIANCE_CONTROLS.filter(c=>c.status==='fail').length, 'bg-red-100 text-red-800']].map(([l,v,c]) => (
              <div key={l} className={`rounded-xl p-4 text-center ${c}`}>
                <p className="text-2xl font-extrabold">{v}</p>
                <p className="text-xs font-medium">{l}</p>
              </div>
            ))}
          </div>
          {COMPLIANCE_CONTROLS.map(c => (
            <div key={c.id} className={`rounded-xl border p-4 flex items-center gap-4 ${c.status === 'fail' ? 'border-red-200 bg-red-50' : c.status === 'warn' ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
              {c.status === 'pass' ? <FiCheckCircle className="text-green-600 text-xl shrink-0" />
                : c.status === 'warn' ? <FiAlertCircle className="text-yellow-600 text-xl shrink-0" />
                : <FiXCircle className="text-red-600 text-xl shrink-0" />}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">{c.name}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/60 text-gray-600">{c.framework}</span>
                  <span className="font-mono text-xs text-gray-400">{c.id}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-48 rounded-full bg-white/50">
                  <div className="h-1.5 rounded-full" style={{ width: `${c.score}%`, background: c.score >= 90 ? '#10b981' : c.score >= 75 ? '#f59e0b' : '#ef4444' }} />
                </div>
              </div>
              <span className={`text-xl font-extrabold ${scoreBg(c.score)}`}>{c.score}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
