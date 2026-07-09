import { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  FiBarChart2, FiPieChart, FiTrendingUp, FiPlus, FiX, FiDownload,
  FiSave, FiRefreshCw, FiSliders, FiCalendar, FiGrid, FiList,
  FiCheck, FiChevronDown
} from 'react-icons/fi'

/* ─── Available Metrics / Dimensions ─── */
const METRICS = [
  { id: 'tickets_opened',   label: 'Tickets Opened',       unit: '' },
  { id: 'tickets_resolved', label: 'Tickets Resolved',     unit: '' },
  { id: 'avg_resolution',   label: 'Avg Resolution Time',  unit: 'h' },
  { id: 'sla_compliance',   label: 'SLA Compliance',       unit: '%' },
  { id: 'csat_score',       label: 'CSAT Score',           unit: '/5' },
  { id: 'escalation_rate',  label: 'Escalation Rate',      unit: '%' },
  { id: 'first_contact',    label: 'First Contact Resolution', unit: '%' },
  { id: 'backlog',          label: 'Backlog Count',         unit: '' },
]

const DIMENSIONS = [
  { id: 'day',       label: 'By Day' },
  { id: 'week',      label: 'By Week' },
  { id: 'month',     label: 'By Month' },
  { id: 'category',  label: 'By Category' },
  { id: 'agent',     label: 'By Agent' },
  { id: 'priority',  label: 'By Priority' },
  { id: 'dept',      label: 'By Department' },
]

const DATE_RANGES = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'This year', 'Custom']
const CHART_TYPES = [
  { id: 'bar',  label: 'Bar',  icon: FiBarChart2 },
  { id: 'line', label: 'Line', icon: FiTrendingUp },
  { id: 'area', label: 'Area', icon: FiTrendingUp },
  { id: 'pie',  label: 'Pie',  icon: FiPieChart },
]

const COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6']

const SAVED_REPORTS = [
  { id: 'r1', name: 'Weekly Ticket Volume',   metrics: ['tickets_opened','tickets_resolved'], dimension: 'day',      range: 'Last 7 days', chart: 'bar' },
  { id: 'r2', name: 'SLA by Category',        metrics: ['sla_compliance'],                   dimension: 'category', range: 'Last 30 days', chart: 'bar' },
  { id: 'r3', name: 'Agent Performance',      metrics: ['tickets_resolved','csat_score'],     dimension: 'agent',    range: 'Last 30 days', chart: 'bar' },
  { id: 'r4', name: 'Monthly Trend Overview', metrics: ['tickets_opened','avg_resolution'],  dimension: 'month',    range: 'Last 90 days', chart: 'line' },
]

/* ── Generate plausible mock data ── */
function generateData(dimension, metrics) {
  const labels = {
    day:      ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    week:     ['W1','W2','W3','W4','W5'],
    month:    ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
    category: ['Hardware','Software','Network','Account','Security','Other'],
    agent:    ['Sarah M.','Chen W.','Jay P.','Emma C.','Alex R.'],
    priority: ['Critical','High','Medium','Low'],
    dept:     ['Engineering','Marketing','Finance','HR','Operations'],
  }
  const ranges = {
    tickets_opened:   [5, 35],  tickets_resolved: [4, 32],
    avg_resolution:   [1, 12],  sla_compliance:   [72, 99],
    csat_score:       [3.5,5],  escalation_rate:  [2, 20],
    first_contact:    [55, 90], backlog:          [3, 25],
  }
  return (labels[dimension] || labels.day).map(name => {
    const row = { name }
    metrics.forEach(m => {
      const [lo, hi] = ranges[m] || [0, 100]
      row[m] = parseFloat((Math.random() * (hi - lo) + lo).toFixed(1))
    })
    return row
  })
}

export default function ReportBuilder() {
  const [selectedMetrics,  setSelectedMetrics]  = useState(['tickets_opened', 'tickets_resolved'])
  const [dimension,        setDimension]        = useState('day')
  const [dateRange,        setDateRange]        = useState('Last 7 days')
  const [chartType,        setChartType]        = useState('bar')
  const [reportName,       setReportName]       = useState('My Custom Report')
  const [savedReports,     setSavedReports]     = useState(SAVED_REPORTS)
  const [activeReport,     setActiveReport]     = useState(null)
  const [showSaved,        setShowSaved]        = useState(false)
  const [saved,            setSaved]            = useState(false)
  const [filters,          setFilters]          = useState({ priority: 'All', category: 'All' })

  const data = useMemo(() => generateData(dimension, selectedMetrics), [dimension, selectedMetrics])

  const toggleMetric = (id) => {
    setSelectedMetrics(m =>
      m.includes(id) ? (m.length > 1 ? m.filter(x => x !== id) : m) : [...m, id]
    )
  }

  const saveReport = () => {
    setSavedReports(r => [
      { id: `r-${Date.now()}`, name: reportName, metrics: selectedMetrics, dimension, range: dateRange, chart: chartType },
      ...r,
    ])
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const loadReport = (r) => {
    setSelectedMetrics(r.metrics)
    setDimension(r.dimension)
    setDateRange(r.range)
    setChartType(r.chart)
    setReportName(r.name)
    setActiveReport(r.id)
    setShowSaved(false)
  }

  /* ── Chart renderer ── */
  const ChartView = () => {
    const commonProps = {
      data,
      margin: { top: 8, right: 16, left: 0, bottom: 0 },
    }

    if (chartType === 'pie' && selectedMetrics.length === 1) {
      const key = selectedMetrics[0]
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey={key} nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({ name, value }) => `${name}: ${value}`}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    const Chart = chartType === 'area' ? AreaChart : chartType === 'line' ? LineChart : BarChart
    return (
      <ResponsiveContainer width="100%" height={300}>
        <Chart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {selectedMetrics.map((m, i) => {
            const def = METRICS.find(x => x.id === m)
            const color = COLORS[i % COLORS.length]
            if (chartType === 'area') return <Area key={m} type="monotone" dataKey={m} name={def?.label} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} />
            if (chartType === 'line') return <Line key={m} type="monotone" dataKey={m} name={def?.label} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
            return <Bar key={m} dataKey={m} name={def?.label} fill={color} radius={[4,4,0,0]} />
          })}
        </Chart>
      </ResponsiveContainer>
    )
  }

  /* ── Summary Table ── */
  const SummaryTable = () => (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left font-semibold text-gray-700">{DIMENSIONS.find(d => d.id === dimension)?.label.replace('By ','')}</th>
            {selectedMetrics.map(m => <th key={m} className="p-3 text-right font-semibold text-gray-700">{METRICS.find(x => x.id === m)?.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="p-3 font-medium text-gray-800">{row.name}</td>
              {selectedMetrics.map(m => (
                <td key={m} className="p-3 text-right text-gray-600">
                  {row[m]}{METRICS.find(x => x.id === m)?.unit}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Report Builder</h1>
          <p className="text-gray-500 text-sm mt-0.5">Build custom reports with any metrics, dimensions and date ranges</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button onClick={() => setShowSaved(s => !s)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
              <FiList /> Saved Reports ({savedReports.length}) <FiChevronDown />
            </button>
            {showSaved && (
              <div className="absolute right-0 top-full mt-1 w-72 rounded-xl border border-gray-200 bg-white shadow-xl z-20">
                {savedReports.map(r => (
                  <button key={r.id} onClick={() => loadReport(r)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-indigo-50 border-b border-gray-100 last:border-0 ${activeReport === r.id ? 'bg-indigo-50' : ''}`}>
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.range} · {DIMENSIONS.find(d => d.id === r.dimension)?.label}</p>
                    </div>
                    {activeReport === r.id && <FiCheck className="text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={saveReport}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
            {saved ? <><FiCheck /> Saved!</> : <><FiSave /> Save Report</>}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Config Panel */}
        <div className="space-y-5">
          {/* Report Name */}
          <div className="rounded-2xl border border-gray-200 p-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Report Name</label>
            <input value={reportName} onChange={e => setReportName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
          </div>

          {/* Metrics */}
          <div className="rounded-2xl border border-gray-200 p-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">Metrics</label>
            <div className="space-y-1.5">
              {METRICS.map(m => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-gray-50">
                  <input type="checkbox" checked={selectedMetrics.includes(m.id)} onChange={() => toggleMetric(m.id)}
                    className="accent-indigo-600 h-4 w-4" />
                  <span className="text-sm text-gray-700">{m.label}</span>
                  {m.unit && <span className="text-xs text-gray-400 ml-auto">{m.unit}</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Dimension */}
          <div className="rounded-2xl border border-gray-200 p-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">Group By</label>
            <div className="space-y-1.5">
              {DIMENSIONS.map(d => (
                <label key={d.id} className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-gray-50">
                  <input type="radio" name="dimension" checked={dimension === d.id} onChange={() => setDimension(d.id)}
                    className="accent-indigo-600 h-4 w-4" />
                  <span className="text-sm text-gray-700">{d.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="rounded-2xl border border-gray-200 p-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Date Range</label>
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
              {DATE_RANGES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-5">
          {/* Chart Type + Toolbar */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-bold text-gray-800">{reportName}</h2>
              <div className="flex gap-1 rounded-xl border border-gray-200 p-1">
                {CHART_TYPES.map(c => {
                  const CIcon = c.icon
                  return (
                    <button key={c.id} onClick={() => setChartType(c.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${chartType === c.id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <CIcon /> {c.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="text-xs text-gray-400 mb-3 flex gap-3">
              <span className="flex items-center gap-1"><FiCalendar /> {dateRange}</span>
              <span className="flex items-center gap-1"><FiGrid /> {DIMENSIONS.find(d => d.id === dimension)?.label}</span>
              <span className="flex items-center gap-1"><FiSliders /> {selectedMetrics.length} metric{selectedMetrics.length > 1 ? 's' : ''}</span>
            </div>
            <ChartView />
          </div>

          {/* Data Table */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Data Table</h3>
              <button className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800">
                <FiDownload /> Export CSV
              </button>
            </div>
            <SummaryTable />
          </div>
        </div>
      </div>
    </div>
  )
}
