import React, { useState, useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { FiBarChart2, FiAlertTriangle, FiDownload, FiSearch, FiFilter, FiTrendingUp, FiDollarSign, FiAward, FiZap } from 'react-icons/fi'

const MONTHLY_SPEND = [
  { month: 'Jan', compute: 12400, storage: 2400, network: 1400, database: 800 },
  { month: 'Feb', compute: 13210, storage: 2210, network: 1290, database: 790 },
  { month: 'Mar', compute: 15670, storage: 2400, network: 1500, database: 850 },
  { month: 'Apr', compute: 14200, storage: 2100, network: 1200, database: 900 },
  { month: 'May', compute: 16500, storage: 2900, network: 1800, database: 1100 },
  { month: 'Jun', compute: 15800, storage: 2600, network: 1600, database: 950 },
]

const WASTE_ANALYSIS = [
  { id: 1, resource: 'Idle Compute (t2.2xlarge)', monthlyWaste: 4200, instances: 12, recommendation: 'Downsize or terminate unused instances', priority: 'critical' },
  { id: 2, resource: 'Oversized Database (db.r5.4xlarge)', monthlyWaste: 2800, instances: 3, recommendation: 'Move to smaller instance type', priority: 'high' },
  { id: 3, resource: 'Unused EBS Volumes', monthlyWaste: 1400, instances: 47, recommendation: 'Delete or archive to Glacier', priority: 'high' },
  { id: 4, resource: 'Data Transfer Charges', monthlyWaste: 890, instances: 5, recommendation: 'Use private VPC endpoints', priority: 'medium' },
  { id: 5, resource: 'Unattached NAT Gateways', monthlyWaste: 650, instances: 2, recommendation: 'Consolidate traffic or remove', priority: 'medium' },
]

const COST_ANOMALIES = [
  { date: '2026-06-15', service: 'Compute', baseline: 12400, actual: 18200, variance: 46.8, severity: 'high' },
  { date: '2026-06-12', service: 'Data Transfer', baseline: 1200, actual: 3400, variance: 183.3, severity: 'critical' },
  { date: '2026-06-08', service: 'Storage', baseline: 2400, actual: 2200, variance: -8.3, severity: 'low' },
]

const ANOMALY_SCATTER = [
  { service: 'Compute', anomalyCount: 3, totalCost: 15670, costPerAnomaly: 5223 },
  { service: 'Storage', anomalyCount: 1, totalCost: 2400, costPerAnomaly: 2400 },
  { service: 'Network', anomalyCount: 2, totalCost: 1500, costPerAnomaly: 750 },
  { service: 'Database', anomalyCount: 1, totalCost: 850, costPerAnomaly: 850 },
  { service: 'Data Transfer', anomalyCount: 4, totalCost: 3400, costPerAnomaly: 850 },
]

export default function CloudCostOptimizer() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchWaste, setSearchWaste] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  
  const totalSpend = useMemo(() => {
    return MONTHLY_SPEND[MONTHLY_SPEND.length - 1]
  }, [])
  
  const totalCostJune = useMemo(() => {
    return totalSpend.compute + totalSpend.storage + totalSpend.network + totalSpend.database
  }, [totalSpend])
  
  const monthlyTrend = useMemo(() => {
    return MONTHLY_SPEND.map(m => ({
      ...m,
      total: m.compute + m.storage + m.network + m.database
    }))
  }, [])
  
  const wasteOpportunities = useMemo(() => {
    let filtered = WASTE_ANALYSIS.filter(w =>
      (priorityFilter === 'all' || w.priority === priorityFilter) &&
      w.resource.toLowerCase().includes(searchWaste.toLowerCase())
    )
    return filtered
  }, [searchWaste, priorityFilter])
  
  const totalMonthlyWaste = useMemo(() => {
    return wasteOpportunities.reduce((sum, w) => sum + w.monthlyWaste, 0)
  }, [wasteOpportunities])
  
  const priorityCounts = useMemo(() => {
    return {
      critical: WASTE_ANALYSIS.filter(w => w.priority === 'critical').length,
      high: WASTE_ANALYSIS.filter(w => w.priority === 'high').length,
      medium: WASTE_ANALYSIS.filter(w => w.priority === 'medium').length,
    }
  }, [])

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return '#dc2626'
      case 'high': return '#ea580c'
      case 'medium': return '#eab308'
      default: return '#6b7280'
    }
  }

  return (
    <div className="min-h-screen bg-hope-bg text-hope-text">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-hope-text-primary">Cloud Cost Optimizer</h1>
            <p className="text-sm text-hope-text-secondary mt-1">FinOps dashboard • Spend optimization • Anomaly detection</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-hope-accent text-white rounded-lg hover:bg-opacity-90 transition">
            <FiDownload className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">June Spend</p>
                <p className="text-2xl font-bold text-hope-text-primary mt-2">${(totalCostJune / 1000).toFixed(1)}K</p>
              </div>
              <FiDollarSign className="w-10 h-10 text-hope-accent opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Monthly Waste</p>
                <p className="text-2xl font-bold text-red-500 mt-2">${(totalMonthlyWaste / 1000).toFixed(1)}K</p>
              </div>
              <FiTrendingUp className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Anomalies</p>
                <p className="text-2xl font-bold text-amber-500 mt-2">{COST_ANOMALIES.length}</p>
                <p className="text-xs text-hope-text-secondary mt-1">Last 15 days</p>
              </div>
              <FiAlertTriangle className="w-10 h-10 text-amber-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Potential Savings</p>
                <p className="text-2xl font-bold text-green-500 mt-2">${(totalMonthlyWaste * 12 / 1000).toFixed(0)}K</p>
                <p className="text-xs text-hope-text-secondary mt-1">Annual</p>
              </div>
              <FiAward className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-hope-border">
          {['overview', 'waste', 'anomalies'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab
                  ? 'border-hope-accent text-hope-accent'
                  : 'border-transparent text-hope-text-secondary hover:text-hope-text-primary'
              }`}
            >
              {tab === 'overview' && 'Spending Trends'}
              {tab === 'waste' && 'Waste Opportunities'}
              {tab === 'anomalies' && 'Cost Anomalies'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-hope-text-primary mb-4">6-Month Spend Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorCompute" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="compute" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCompute)" />
                  <Area type="monotone" dataKey="storage" stackId="1" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorStorage)" />
                  <Area type="monotone" dataKey="network" stackId="1" stroke="#06b6d4" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="database" stackId="1" stroke="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-hope-text-primary mb-4">Service Breakdown (June)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[totalSpend]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="compute" fill="#3b82f6" />
                  <Bar dataKey="storage" fill="#8b5cf6" />
                  <Bar dataKey="network" fill="#06b6d4" />
                  <Bar dataKey="database" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Waste Tab */}
        {activeTab === 'waste' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap items-center">
              <div className="flex-1 min-w-64 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hope-text-secondary" />
                <input
                  type="text"
                  placeholder="Search waste opportunities..."
                  value={searchWaste}
                  onChange={(e) => setSearchWaste(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-hope-input-bg border border-hope-border rounded-lg text-hope-text-primary placeholder-hope-text-secondary focus:outline-none focus:border-hope-accent"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'critical', 'high', 'medium'].map(pri => (
                  <button
                    key={pri}
                    onClick={() => setPriorityFilter(pri)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      priorityFilter === pri
                        ? 'bg-hope-accent text-white'
                        : 'bg-hope-card-bg border border-hope-border text-hope-text-secondary hover:text-hope-text-primary'
                    }`}
                  >
                    {pri === 'all' ? 'All' : pri.charAt(0).toUpperCase() + pri.slice(1)} ({pri === 'all' ? WASTE_ANALYSIS.length : priorityCounts[pri] || 0})
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {wasteOpportunities.map(waste => (
                <div key={waste.id} className="bg-hope-card-bg border border-hope-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-hope-text-primary">{waste.resource}</h4>
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: getPriorityColor(waste.priority) }}
                        >
                          {waste.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-hope-text-secondary mb-2">{waste.recommendation}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-hope-text-secondary">Instances: <span className="font-semibold text-hope-text-primary">{waste.instances}</span></span>
                        <span className="text-hope-text-secondary">Monthly Waste: <span className="font-semibold text-red-500">${waste.monthlyWaste.toLocaleString()}</span></span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-hope-accent text-white rounded text-sm hover:bg-opacity-90 transition">
                      Fix
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anomalies Tab */}
        {activeTab === 'anomalies' && (
          <div className="space-y-6">
            <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-hope-text-primary mb-4">Anomaly Detection by Service</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="anomalyCount" name="Anomaly Count" stroke="#9ca3af" />
                  <YAxis dataKey="totalCost" name="Total Cost" stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value) => value.toLocaleString()}
                  />
                  <Scatter name="Services" data={ANOMALY_SCATTER} fill="#3b82f6">
                    {ANOMALY_SCATTER.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][index % 5]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-hope-text-primary">Recent Anomalies</h3>
              {COST_ANOMALIES.map((anomaly, idx) => (
                <div key={idx} className="bg-hope-card-bg border border-hope-border rounded-lg p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-hope-text-primary">{anomaly.service}</h4>
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: anomaly.severity === 'critical' ? '#dc2626' : '#ea580c' }}
                        >
                          {anomaly.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-hope-text-secondary">
                        {anomaly.date} • Baseline: ${anomaly.baseline.toLocaleString()} → Actual: ${anomaly.actual.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-500">+{anomaly.variance.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
