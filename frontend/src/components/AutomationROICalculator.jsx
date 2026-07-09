import React, { useState, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { FiTrendingUp, FiBarChart2, FiDollarSign, FiClock, FiZap, FiSearch, FiChevronRight } from 'react-icons/fi'

const AUTOMATION_CASES = [
  { id: 1, name: 'Incident Auto-Triage & Assignment', status: 'active', investment: 45000, yearlySavings: 120000, payback: 4.5, roi: 266, manualHours: 2400, automatedHours: 200, tasks: 'Auto-categorize incidents, assign to L2 based on rules, send notifications', yearsActive: 1.2, cumSavings: 144000 },
  { id: 2, name: 'Password Reset Automation', status: 'active', investment: 12000, yearlySavings: 89000, payback: 1.6, roi: 742, manualHours: 1200, automatedHours: 40, tasks: 'Self-service password reset portal, MFA validation, logging', yearsActive: 2.1, cumSavings: 187000 },
  { id: 3, name: 'Patch Management & Distribution', status: 'planning', investment: 85000, yearlySavings: 210000, payback: 4.9, roi: 247, manualHours: 3000, automatedHours: 150, tasks: 'Automated patching, testing, rollback, compliance reporting', yearsActive: 0, cumSavings: 0 },
  { id: 4, name: 'Report Generation & Scheduling', status: 'active', investment: 18000, yearlySavings: 52000, payback: 4.2, roi: 289, manualHours: 800, automatedHours: 20, tasks: 'Scheduled report generation, email distribution, archive', yearsActive: 0.8, cumSavings: 41600 },
  { id: 5, name: 'Knowledge Base Article Auto-Linking', status: 'planning', investment: 28000, yearlySavings: 76000, payback: 4.4, roi: 271, manualHours: 600, automatedHours: 50, tasks: 'AI-powered KB linking, suggestion to tickets, SLA reduction', yearsActive: 0, cumSavings: 0 },
]

const ROI_PROJECTION = [
  { year: '2026', investment: 98000, savings: 261000, cumROI: 166, payback: 4.5 },
  { year: '2027', investment: 0, savings: 427000, cumROI: 336, payback: 2.3 },
  { year: '2028', investment: 35000, savings: 583000, cumROI: 531, payback: 0.6 },
  { year: '2029', investment: 0, savings: 689000, cumROI: 644, payback: 0 },
]

const EFFORT_SAVINGS = [
  { month: 'Jan', manualHours: 240, automatedHours: 8, savings: 232 },
  { month: 'Feb', manualHours: 220, automatedHours: 6, savings: 214 },
  { month: 'Mar', manualHours: 250, automatedHours: 10, savings: 240 },
  { month: 'Apr', manualHours: 235, automatedHours: 9, savings: 226 },
  { month: 'May', manualHours: 245, automatedHours: 8, savings: 237 },
  { month: 'Jun', manualHours: 255, automatedHours: 11, savings: 244 },
]

const PAYBACK_CHART = [
  { month: 1, cumulativeSavings: 21750, investment: 98000, breakeven: false },
  { month: 2, cumulativeSavings: 43500, investment: 98000, breakeven: false },
  { month: 3, cumulativeSavings: 65250, investment: 98000, breakeven: false },
  { month: 4, cumulativeSavings: 87000, investment: 98000, breakeven: false },
  { month: 5, cumulativeSavings: 108750, investment: 98000, breakeven: true },
  { month: 6, cumulativeSavings: 130500, investment: 98000, breakeven: true },
]

export default function AutomationROICalculator() {
  const [activeTab, setActiveTab] = useState('portfolio')
  const [selectedCase, setSelectedCase] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredCases = useMemo(() => {
    return AUTOMATION_CASES.filter(c => filterStatus === 'all' || c.status === filterStatus)
  }, [filterStatus])

  const portfolioMetrics = useMemo(() => {
    const active = AUTOMATION_CASES.filter(c => c.status === 'active')
    const totalInvestment = AUTOMATION_CASES.reduce((sum, c) => sum + c.investment, 0)
    const totalYearlySavings = AUTOMATION_CASES.reduce((sum, c) => sum + c.yearlySavings, 0)
    const totalHoursSaved = active.reduce((sum, c) => sum + (c.manualHours - c.automatedHours), 0)
    const avgPayback = (active.reduce((sum, c) => sum + c.payback, 0) / active.length).toFixed(1)
    return { totalInvestment, totalYearlySavings, totalHoursSaved, avgPayback, activeCount: active.length }
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#10b981'
      case 'planning': return '#3b82f6'
      case 'paused': return '#eab308'
      case 'archived': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusBg = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/10 border-green-500/30'
      case 'planning': return 'bg-blue-500/10 border-blue-500/30'
      case 'paused': return 'bg-amber-500/10 border-amber-500/30'
      default: return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-hope-bg text-hope-text">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-hope-text-primary">Automation ROI Calculator</h1>
            <p className="text-sm text-hope-text-secondary mt-1">Business case builder • Payback analysis • Investment tracking</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-hope-accent text-white rounded-lg hover:bg-opacity-90 transition">
            <FiZap className="w-4 h-4" />
            New Initiative
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Total Investment</p>
                <p className="text-2xl font-bold text-blue-500 mt-2">${(portfolioMetrics.totalInvestment / 1000).toFixed(0)}K</p>
              </div>
              <FiBarChart2 className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Annual Savings</p>
                <p className="text-2xl font-bold text-green-500 mt-2">${(portfolioMetrics.totalYearlySavings / 1000).toFixed(0)}K</p>
              </div>
              <FiDollarSign className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Hours Saved/Yr</p>
                <p className="text-2xl font-bold text-amber-500 mt-2">{(portfolioMetrics.totalHoursSaved).toLocaleString()}</p>
              </div>
              <FiClock className="w-10 h-10 text-amber-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Avg Payback</p>
                <p className="text-2xl font-bold text-purple-500 mt-2">{portfolioMetrics.avgPayback} months</p>
              </div>
              <FiTrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-hope-border overflow-x-auto">
          {['portfolio', 'projection', 'payback', 'details'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
                activeTab === tab
                  ? 'border-hope-accent text-hope-accent'
                  : 'border-transparent text-hope-text-secondary hover:text-hope-text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-hope-text-primary mb-4">Monthly Effort Savings</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={EFFORT_SAVINGS}>
                  <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="savings" fill="url(#colorSavings)" stroke="#10b981" name="Hours Saved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-2 flex-wrap">
              {['all', 'active', 'planning'].map(stat => (
                <button
                  key={stat}
                  onClick={() => setFilterStatus(stat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    filterStatus === stat
                      ? 'bg-hope-accent text-white'
                      : 'bg-hope-card-bg border border-hope-border text-hope-text-secondary'
                  }`}
                >
                  {stat.charAt(0).toUpperCase() + stat.slice(1)} ({AUTOMATION_CASES.filter(c => stat === 'all' || c.status === stat).length})
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredCases.map(autoCase => (
                <div
                  key={autoCase.id}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedCase?.id === autoCase.id
                      ? 'border-hope-accent bg-hope-accent/5'
                      : getStatusBg(autoCase.status)
                  }`}
                  onClick={() => setSelectedCase(selectedCase?.id === autoCase.id ? null : autoCase)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-hope-text-primary">{autoCase.name}</h4>
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: getStatusColor(autoCase.status) }}
                        >
                          {autoCase.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-hope-text-secondary mb-2">{autoCase.tasks}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-hope-text-secondary">Investment: </span>
                          <span className="font-semibold text-hope-text-primary">${(autoCase.investment / 1000).toFixed(0)}K</span>
                        </div>
                        <div>
                          <span className="text-hope-text-secondary">Annual Savings: </span>
                          <span className="font-semibold text-green-400">${(autoCase.yearlySavings / 1000).toFixed(0)}K</span>
                        </div>
                        <div>
                          <span className="text-hope-text-secondary">Payback: </span>
                          <span className="font-semibold text-hope-text-primary">{autoCase.payback}mo</span>
                        </div>
                        <div>
                          <span className="text-hope-text-secondary">ROI: </span>
                          <span className="font-semibold text-amber-400">{autoCase.roi}%</span>
                        </div>
                      </div>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-hope-text-secondary flex-shrink-0 mt-1" />
                  </div>

                  {selectedCase?.id === autoCase.id && (
                    <div className="mt-4 pt-4 border-t border-gray-600 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-hope-text-secondary mb-1">Manual Hours/Year</p>
                          <p className="text-sm text-hope-text-primary">{autoCase.manualHours.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-hope-text-secondary mb-1">Automated Hours/Year</p>
                          <p className="text-sm text-hope-text-primary">{autoCase.automatedHours.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-hope-text-secondary mb-1">Years Active</p>
                          <p className="text-sm text-hope-text-primary">{autoCase.yearsActive}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-hope-text-secondary mb-1">Cumulative Savings</p>
                          <p className="text-sm text-green-400">${(autoCase.cumSavings / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projection Tab */}
        {activeTab === 'projection' && (
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-hope-text-primary mb-4">4-Year ROI Projection</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ROI_PROJECTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="savings" fill="#10b981" name="Annual Savings" />
                <Bar yAxisId="left" dataKey="investment" fill="#dc2626" name="Investment" />
                <Line yAxisId="right" type="monotone" dataKey="cumROI" stroke="#3b82f6" name="Cumulative ROI %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payback Tab */}
        {activeTab === 'payback' && (
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-hope-text-primary mb-4">6-Month Payback Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={PAYBACK_CHART}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }} stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <ReferenceLine y={98000} stroke="#6b7280" strokeDasharray="5 5" name="Investment" />
                <Line type="monotone" dataKey="cumulativeSavings" stroke="#10b981" strokeWidth={2} name="Cumulative Savings" />
                <Line type="monotone" dataKey="investment" stroke="#dc2626" strokeWidth={2} name="Total Investment" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400">
                ✓ <strong>Breakeven Month 5:</strong> Cumulative savings exceed investment at 5-month mark. Portfolio becomes cash-positive within Q2 2026.
              </p>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {AUTOMATION_CASES.map(autoCase => (
              <div key={autoCase.id} className="bg-hope-card-bg border border-hope-border rounded-lg p-4">
                <h4 className="font-semibold text-hope-text-primary mb-3">{autoCase.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-hope-text-secondary">Status:</span>
                    <span
                      className="font-semibold px-2 py-1 rounded text-xs text-white"
                      style={{ backgroundColor: getStatusColor(autoCase.status) }}
                    >
                      {autoCase.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hope-text-secondary">Investment:</span>
                    <span className="font-semibold text-hope-text-primary">${(autoCase.investment / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hope-text-secondary">Annual Savings:</span>
                    <span className="font-semibold text-green-400">${(autoCase.yearlySavings / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hope-text-secondary">Payback Period:</span>
                    <span className="font-semibold text-hope-text-primary">{autoCase.payback} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hope-text-secondary">ROI:</span>
                    <span className="font-semibold text-amber-400">{autoCase.roi}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hope-text-secondary">Hours Saved/Year:</span>
                    <span className="font-semibold text-hope-text-primary">{(autoCase.manualHours - autoCase.automatedHours).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
