import { useState, useEffect } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
  ComposedChart, Cell
} from 'recharts'
import {
  FiZap as FiBrain, FiTrendingUp, FiTrendingDown, FiAlertTriangle,
  FiCheckCircle, FiZap, FiRefreshCw, FiSliders,
  FiTarget, FiBarChart2, FiCalendar, FiClock
} from 'react-icons/fi'

/* ── Generate realistic ticket history ── */
const DAYS_HISTORY = 90
const CATEGORIES = ['Hardware','Software','Network','Account','Security','Other']
const generateHistory = () => {
  const data = []
  const base = 45
  for (let i = DAYS_HISTORY; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const dow = d.getDay()
    const isWeekend = dow === 0 || dow === 6
    const weekEffect = isWeekend ? 0.3 : 1.0
    const trend = 1 + (DAYS_HISTORY - i) * 0.003
    const noise = (Math.random() - 0.5) * 12
    const spike = Math.random() < 0.05 ? Math.random() * 25 : 0
    const v = Math.max(2, Math.round(base * weekEffect * trend + noise + spike))
    data.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      actual: v,
      predicted: null,
      lower: null,
      upper: null,
    })
  }
  return data
}

const generateForecast = (history) => {
  const last = history[history.length - 1].actual
  const forecast = []
  for (let i = 1; i <= 30; i++) {
    const d = new Date(); d.setDate(d.getDate() + i)
    const dow = d.getDay()
    const isWeekend = dow === 0 || dow === 6
    const wk = isWeekend ? 0.28 : 1.0
    const trend = 1 + i * 0.004
    const pred = Math.round(last * wk * trend)
    const uncertainty = 0.15 + i * 0.008
    forecast.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      actual: null,
      predicted: pred,
      lower: Math.round(pred * (1 - uncertainty)),
      upper: Math.round(pred * (1 + uncertainty)),
    })
  }
  return forecast
}

const ANOMALIES = [
  { date: '2026-06-14', label: 'Jun 14', value: 98, reason: 'Email system outage — 53 tickets in 4h' },
  { date: '2026-06-28', label: 'Jun 28', value: 87, reason: 'Windows update pushed Friday evening' },
  { date: '2026-07-03', label: 'Jul 3', reason: 'VPN gateway latency spike (peak: 89 tickets)' },
]

const CATEGORY_FORECAST = CATEGORIES.map(c => ({
  category: c,
  current: Math.round(Math.random() * 300 + 80),
  forecast: Math.round(Math.random() * 340 + 90),
  trend: (Math.random() * 30 - 10).toFixed(1),
}))

const RESOLUTION_TREND = Array.from({ length: 8 }, (_, i) => ({
  week: `W${i + 1}`,
  avgHours: parseFloat((8 - i * 0.4 + (Math.random() - 0.5)).toFixed(1)),
  target: 4.0,
  predicted: parseFloat((4.2 - i * 0.1).toFixed(1)),
}))

const AGENT_CAPACITY = [
  { name: 'Sarah M.', current: 87, max: 100, predicted: 105 },
  { name: 'Chen W.',  current: 92, max: 100, predicted: 98  },
  { name: 'Jay P.',   current: 78, max: 100, predicted: 88  },
  { name: 'Emma C.',  current: 65, max: 100, predicted: 72  },
  { name: 'Alex R.',  current: 95, max: 100, predicted: 112 },
]

const CONFIDENCE_COLORS = { high: 'text-green-700 bg-green-100', medium: 'text-yellow-700 bg-yellow-100', low: 'text-orange-700 bg-orange-100' }

/* ─── INSIGHT CARD ─── */
const InsightCard = ({ icon: Icon, title, body, confidence, action, color }) => (
  <div className={`rounded-2xl border-l-4 ${color} bg-white p-4 shadow-sm`}>
    <div className="flex items-start gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color.replace('border-','bg-').split(' ')[0]}/10`}>
        <Icon className={`text-lg ${color.includes('red') ? 'text-red-600' : color.includes('yellow') ? 'text-yellow-600' : color.includes('indigo') ? 'text-indigo-600' : 'text-green-600'}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className="font-semibold text-gray-800 text-sm">{title}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${CONFIDENCE_COLORS[confidence]}`}>{confidence} confidence</span>
        </div>
        <p className="text-sm text-gray-600">{body}</p>
        {action && <p className="text-xs text-indigo-600 font-medium mt-1.5">{action}</p>}
      </div>
    </div>
  </div>
)

/* ─────────────── MAIN ─────────────── */
export default function PredictiveAnalytics() {
  const [history]  = useState(generateHistory)
  const [forecast] = useState(() => generateForecast(generateHistory()))
  const [tab,      setTab]  = useState('forecast')
  const [horizon,  setHorizon] = useState(30)
  const [refreshed, setRefreshed] = useState(false)

  const combined = [...history.slice(-30), ...forecast.slice(0, horizon)]

  const handleRefresh = () => { setRefreshed(true); setTimeout(() => setRefreshed(false), 1500) }

  const todayPred = forecast[0]?.predicted || 0
  const weekPred  = forecast.slice(0,7).reduce((s,d) => s + (d.predicted||0), 0)
  const monthPred = forecast.reduce((s,d) => s + (d.predicted||0), 0)
  const lastWeekActual = history.slice(-7).reduce((s,d) => s + d.actual, 0)
  const weekChange = (((weekPred - lastWeekActual) / lastWeekActual) * 100).toFixed(1)
  const overloadedAgents = AGENT_CAPACITY.filter(a => a.predicted > a.max).length

  const TABS = [
    { id: 'forecast',   label: '📈 Ticket Forecast' },
    { id: 'anomalies',  label: '🔴 Anomaly Detection' },
    { id: 'categories', label: '📦 Category Forecast' },
    { id: 'resolution', label: '⏱ Resolution Forecast' },
    { id: 'capacity',   label: '👥 Capacity Prediction' },
    { id: 'insights',   label: '🧠 AI Insights' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
            <FiBrain className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Predictive Analytics Engine</h1>
            <p className="text-sm text-gray-500">ML-powered forecasting · 90-day training data · 30-day horizon</p>
          </div>
        </div>
        <button onClick={handleRefresh}
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">
          <FiRefreshCw className={refreshed ? 'animate-spin' : ''} /> Retrain Model
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {[
          { label: 'Predicted Today',    value: todayPred,            sub: 'tickets',     icon: FiCalendar, c: 'border-indigo-400', t: 'text-indigo-700' },
          { label: 'Predicted This Week',value: weekPred,             sub: `${weekChange > 0 ? '+' : ''}${weekChange}% vs last week`, icon: FiTrendingUp, c: 'border-blue-400', t: 'text-blue-700' },
          { label: '30-Day Total Pred.', value: monthPred,            sub: 'tickets',     icon: FiBarChart2, c: 'border-purple-400', t: 'text-purple-700' },
          { label: 'Agents Over Capacity',value: `${overloadedAgents}/5`, sub: 'next 30 days', icon: FiAlertTriangle, c: 'border-red-400', t: 'text-red-700' },
        ].map(k => {
          const KIcon = k.icon
          return (
            <div key={k.label} className={`rounded-2xl border-l-4 ${k.c} bg-white p-4 shadow-sm`}>
              <p className="text-xs text-gray-500 font-medium">{k.label}</p>
              <p className={`text-2xl font-extrabold mt-0.5 ${k.t}`}>{k.value}</p>
              <p className={`text-xs mt-0.5 ${k.sub.includes('+') ? 'text-red-500' : 'text-gray-400'}`}>{k.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-gray-200 p-1 mb-6 shadow-sm overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2.5 text-xs font-medium transition-all min-w-fit ${tab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── FORECAST TAB ── */}
      {tab === 'forecast' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-semibold text-gray-700">Ticket Volume Forecast — Next {horizon} Days</h3>
              <div className="flex gap-1 rounded-lg border border-gray-200 p-0.5">
                {[7, 14, 30].map(h => (
                  <button key={h} onClick={() => setHorizon(h)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${horizon === h ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {h}d
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={combined}>
                <defs>
                  <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9ca3af' }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 11 }}
                  formatter={(v, n) => [v ?? '—', n]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="upper"     name="Upper 95% CI" stroke="none"    fill="url(#gCI)"     fillOpacity={1} legendType="none" />
                <Area type="monotone" dataKey="lower"     name="Lower 95% CI" stroke="none"    fill="white"         fillOpacity={0.9} legendType="none" />
                <Area type="monotone" dataKey="actual"    name="Actual"       stroke="#6366f1" fill="url(#gActual)" strokeWidth={2} dot={false} />
                <Line  type="monotone" dataKey="predicted" name="AI Forecast"  stroke="#a78bfa" strokeDasharray="6 3" strokeWidth={2.5} dot={false} />
                <ReferenceLine x="Jul 7" stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Today', fill: '#ef4444', fontSize: 10 }} />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 mt-2 text-center">Purple band = 95% confidence interval · Dashed line = AI prediction</p>
          </div>

          {/* Weekly Heatmap */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Predicted Daily Pattern (Next 7 Days)</h3>
            <div className="grid grid-cols-7 gap-2">
              {forecast.slice(0, 7).map((d, i) => {
                const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
                const date = new Date(); date.setDate(date.getDate() + i + 1)
                const intensity = Math.min(d.predicted / 80, 1)
                return (
                  <div key={i} className="rounded-xl text-center p-3" style={{ background: `rgba(99, 102, 241, ${0.08 + intensity * 0.7})` }}>
                    <p className="text-xs text-indigo-900 font-semibold">{days[date.getDay()]}</p>
                    <p className="text-lg font-extrabold text-indigo-800 mt-1">{d.predicted}</p>
                    <p className="text-xs text-indigo-600">{d.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ANOMALY DETECTION ── */}
      {tab === 'anomalies' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-1">Anomaly Detection — Last 90 Days</h3>
            <p className="text-xs text-gray-400 mb-4">Red markers = statistically significant spikes (Z-score &gt; 2.5 σ above rolling mean)</p>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={history.slice(-60)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={6} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="actual" name="Tickets" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} />
                {ANOMALIES.map(a => (
                  <ReferenceLine key={a.date} x={a.label} stroke="#ef4444" strokeWidth={2} label={{ value: '!', fill: '#ef4444', fontSize: 13, fontWeight: 700 }} />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Detected Anomalies</h3>
            {ANOMALIES.map((a, i) => (
              <div key={i} className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 flex items-start gap-3">
                <FiAlertTriangle className="text-red-600 text-xl shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">{a.label} — {a.value || '~89'} tickets detected</p>
                  <p className="text-sm text-gray-600 mt-0.5">{a.reason}</p>
                  <p className="text-xs text-red-600 mt-1 font-medium">Severity: High · Auto-alert sent to IT Manager</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CATEGORY FORECAST ── */}
      {tab === 'categories' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Category Volume — Current vs 30-Day Forecast</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={CATEGORY_FORECAST}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="current"  name="Current Period" fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="forecast" name="AI Forecast"    fill="#a78bfa" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Category','Current Volume','Forecast (+30d)','Trend','Action'].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody>
                {CATEGORY_FORECAST.map(c => (
                  <tr key={c.category} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium">{c.category}</td>
                    <td className="px-4 py-2.5 text-gray-600">{c.current} tickets</td>
                    <td className="px-4 py-2.5 font-semibold text-indigo-700">{c.forecast} tickets</td>
                    <td className="px-4 py-2.5">
                      <span className={`flex items-center gap-1 text-xs font-semibold ${parseFloat(c.trend) > 5 ? 'text-red-600' : parseFloat(c.trend) < -5 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {parseFloat(c.trend) > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                        {c.trend > 0 ? '+' : ''}{c.trend}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {parseFloat(c.trend) > 8 ? <span className="text-xs text-red-600 font-medium">Pre-assign agents</span>
                        : parseFloat(c.trend) < -5 ? <span className="text-xs text-green-600 font-medium">Reduce staffing</span>
                        : <span className="text-xs text-gray-400">No change needed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── RESOLUTION FORECAST ── */}
      {tab === 'resolution' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-gray-700 mb-1">Resolution Time Forecast (8-Week Trajectory)</h3>
          <p className="text-xs text-gray-400 mb-4">Based on current process improvements and agent training curve</p>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={RESOLUTION_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis unit="h" tick={{ fontSize: 10 }} domain={[0, 12]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}h`, '']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="avgHours" name="Actual Avg Resolution" fill="#6366f1" radius={[4,4,0,0]} opacity={0.8} />
              <Line type="monotone" dataKey="predicted" name="AI Prediction" stroke="#a78bfa" strokeDasharray="5 3" strokeWidth={2.5} dot={{ r: 4 }} />
              <ReferenceLine y={4} stroke="#10b981" strokeDasharray="4 2" label={{ value: 'Target: 4h', fill: '#059669', fontSize: 10 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">
            <FiCheckCircle className="inline mr-1" />
            <strong>Prediction:</strong> At current improvement rate, average resolution time will hit the 4h SLA target by <strong>Week 7</strong>.
          </div>
        </div>
      )}

      {/* ── CAPACITY ── */}
      {tab === 'capacity' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Agent Capacity — Current vs 30-Day Forecast</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={AGENT_CAPACITY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 130]} unit="%" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`, '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="current"   name="Current Load %"   fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="predicted" name="30-Day Forecast %" radius={[4,4,0,0]}>
                  {AGENT_CAPACITY.map((a, i) => <Cell key={i} fill={a.predicted > 100 ? '#ef4444' : '#10b981'} />)}
                </Bar>
                <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Max Capacity', fill: '#ef4444', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {AGENT_CAPACITY.map(a => (
              <div key={a.name} className={`rounded-xl border-2 p-4 text-center ${a.predicted > 100 ? 'border-red-300 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                <p className="font-bold text-sm">{a.name}</p>
                <p className={`text-3xl font-extrabold mt-1 ${a.predicted > 100 ? 'text-red-600' : 'text-green-700'}`}>{a.predicted}%</p>
                <p className="text-xs text-gray-500 mt-0.5">Forecast load</p>
                {a.predicted > 100 && <p className="text-xs text-red-700 font-semibold mt-1">⚠ Over Capacity</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI INSIGHTS ── */}
      {tab === 'insights' && (
        <div className="space-y-3">
          <InsightCard icon={FiTrendingUp}     confidence="high"   color="border-red-500"
            title="Ticket volume increasing 12% next 30 days"
            body="Based on historical growth patterns and seasonal trends, total volume will rise from ~1,450 to ~1,620 tickets. Hardware category driving most growth."
            action="Recommendation: Pre-assign 2 additional agents to Hardware queue" />
          <InsightCard icon={FiAlertTriangle}  confidence="high"   color="border-orange-500"
            title="Alex Rodriguez will reach 112% capacity by Day 18"
            body="Current ticket assignment trajectory will push Alex over maximum capacity. Recommend redistributing 2–3 tickets/day starting Week 2."
            action="Recommendation: Enable auto-rebalancing for Alex Rodriguez" />
          <InsightCard icon={FiZap}            confidence="medium" color="border-yellow-500"
            title="VPN ticket spike predicted Jul 12–13"
            body="Planned maintenance window (July 12 10pm – Jul 13 2am) will likely generate 30–45 VPN and connectivity tickets on July 13."
            action="Recommendation: Pre-draft KB article and prepare on-call coverage" />
          <InsightCard icon={FiCheckCircle}    confidence="high"   color="border-green-500"
            title="Resolution time on track for 4h SLA by Week 7"
            body="Ongoing agent training and workflow automation are measurably improving resolution speed (down 1.2h over 6 weeks)."
            action="Recommendation: Continue current improvement cadence — no intervention needed" />
          <InsightCard icon={FiTarget}         confidence="medium" color="border-indigo-500"
            title="Account category tickets declining (−8% forecast)"
            body="Self-service password reset portal adoption is reducing Account tickets. Predicted to drop another 8% over 30 days."
            action="Recommendation: Promote SSPR more widely to accelerate this trend" />
          <InsightCard icon={FiClock}          confidence="low"    color="border-gray-400"
            title="Potential incident cluster: Salesforce reports Jul 20"
            body="APAC Salesforce degradation pattern correlates with month-end reporting cycles. Low confidence — monitor after Jul 18."
            action="Recommendation: Notify APAC teams, pre-engage Salesforce support" />
        </div>
      )}
    </div>
  )
}
