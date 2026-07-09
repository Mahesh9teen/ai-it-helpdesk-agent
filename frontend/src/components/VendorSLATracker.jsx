import React, { useState, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { FiAward, FiAlertTriangle, FiCheckCircle, FiTrendingDown, FiSearch, FiFilter, FiZap, FiClock } from 'react-icons/fi'

const VENDOR_SLA_DATA = [
  { id: 1, vendor: 'Vendor A - Cisco', service: 'Network Support', slaTarget: 99.5, current: 99.2, violations: 2, credits: 4200, status: 'at-risk', contact: 'john@vendor-a.com', responseTime: '1h', resolution: '4h' },
  { id: 2, vendor: 'Vendor B - VMware', service: 'Infrastructure', slaTarget: 99.9, current: 99.85, violations: 0, credits: 0, status: 'healthy', contact: 'support@vendor-b.com', responseTime: '30min', resolution: '2h' },
  { id: 3, vendor: 'Vendor C - Microsoft', service: 'Cloud Services', slaTarget: 99.9, current: 99.72, violations: 3, credits: 7500, status: 'critical', contact: 'ms-support@company.com', responseTime: '2h', resolution: '8h' },
  { id: 4, vendor: 'Vendor D - Salesforce', service: 'CRM Platform', slaTarget: 99.0, current: 99.15, violations: 1, credits: 2100, status: 'warning', contact: 'salesforce-rep@company.com', responseTime: '1h', resolution: '6h' },
  { id: 5, vendor: 'Vendor E - AWS', service: 'Cloud Infrastructure', slaTarget: 99.99, current: 99.97, violations: 0, credits: 0, status: 'excellent', contact: 'aws-account@company.com', responseTime: '15min', resolution: '1h' },
]

const MONTHLY_COMPLIANCE = [
  { month: 'Jan', vendorA: 98.9, vendorB: 99.92, vendorC: 99.65, vendorD: 98.8, vendorE: 99.96 },
  { month: 'Feb', vendorA: 99.1, vendorB: 99.88, vendorC: 99.72, vendorD: 99.0, vendorE: 99.98 },
  { month: 'Mar', vendorA: 99.3, vendorB: 99.91, vendorC: 99.78, vendorD: 99.2, vendorE: 99.97 },
  { month: 'Apr', vendorA: 99.0, vendorB: 99.85, vendorC: 99.61, vendorD: 98.9, vendorE: 99.99 },
  { month: 'May', vendorA: 99.4, vendorB: 99.89, vendorC: 99.71, vendorD: 99.1, vendorE: 99.96 },
  { month: 'Jun', vendorA: 99.2, vendorB: 99.85, vendorC: 99.72, vendorD: 99.15, vendorE: 99.97 },
]

const SLA_INCIDENTS = [
  { id: 1, vendor: 'Vendor C - Microsoft', date: '2026-06-28', severity: 'critical', duration: '2.5h', impact: 'Service unavailable for 500 users', recovery: 'Vendor escalated to engineering', credited: true, amount: 2500 },
  { id: 2, vendor: 'Vendor A - Cisco', date: '2026-06-25', severity: 'high', duration: '1.2h', impact: 'Network slowdown', recovery: 'Device reboot performed', credited: true, amount: 1700 },
  { id: 3, vendor: 'Vendor D - Salesforce', date: '2026-06-20', severity: 'medium', duration: '0.5h', impact: 'API rate limiting exceeded', recovery: 'Quota increased', credited: true, amount: 400 },
  { id: 4, vendor: 'Vendor C - Microsoft', date: '2026-06-15', severity: 'critical', duration: '3.1h', impact: 'Service degradation', recovery: 'Failover to secondary region', credited: true, amount: 5000 },
]

const ALERT_RULES = [
  { id: 1, vendor: 'Vendor C', metric: 'Uptime', threshold: '99.7%', current: '99.72%', status: 'warning', action: 'escalate' },
  { id: 2, vendor: 'Vendor A', metric: 'Response Time', threshold: '1h', current: '58min', status: 'healthy', action: 'none' },
  { id: 3, vendor: 'Vendor D', metric: 'Monthly Violations', threshold: '2', current: '1', status: 'healthy', action: 'none' },
]

export default function VendorSLATracker() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [sortBy, setSortBy] = useState('current')

  const sortedVendors = useMemo(() => {
    const sorted = [...VENDOR_SLA_DATA]
    if (sortBy === 'violations') {
      sorted.sort((a, b) => b.violations - a.violations)
    } else if (sortBy === 'credits') {
      sorted.sort((a, b) => b.credits - a.credits)
    } else {
      sorted.sort((a, b) => a.current - b.current)
    }
    return sorted
  }, [sortBy])

  const stats = useMemo(() => {
    const avgCompliance = (VENDOR_SLA_DATA.reduce((sum, v) => sum + v.current, 0) / VENDOR_SLA_DATA.length).toFixed(2)
    const totalViolations = VENDOR_SLA_DATA.reduce((sum, v) => sum + v.violations, 0)
    const totalCredits = VENDOR_SLA_DATA.reduce((sum, v) => sum + v.credits, 0)
    return { avgCompliance, totalViolations, totalCredits, atRisk: VENDOR_SLA_DATA.filter(v => ['at-risk', 'critical', 'warning'].includes(v.status)).length }
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent': return '#10b981'
      case 'healthy': return '#3b82f6'
      case 'warning': return '#eab308'
      case 'at-risk': return '#ea580c'
      case 'critical': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getStatusBg = (status) => {
    switch(status) {
      case 'excellent': return 'bg-green-500/10 border-green-500/30'
      case 'healthy': return 'bg-blue-500/10 border-blue-500/30'
      case 'warning': return 'bg-amber-500/10 border-amber-500/30'
      case 'at-risk': return 'bg-orange-500/10 border-orange-500/30'
      case 'critical': return 'bg-red-500/10 border-red-500/30'
      default: return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-hope-bg text-hope-text">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-hope-text-primary">Vendor SLA Tracker</h1>
            <p className="text-sm text-hope-text-secondary mt-1">Real-time compliance • Violation tracking • Credit management</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-hope-accent text-white rounded-lg hover:bg-opacity-90 transition">
            <FiZap className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Avg Compliance</p>
                <p className="text-2xl font-bold text-blue-500 mt-2">{stats.avgCompliance}%</p>
              </div>
              <FiAward className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Total Violations</p>
                <p className="text-2xl font-bold text-red-500 mt-2">{stats.totalViolations}</p>
              </div>
              <FiAlertTriangle className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Credits YTD</p>
                <p className="text-2xl font-bold text-amber-500 mt-2">${(stats.totalCredits / 1000).toFixed(1)}K</p>
              </div>
              <FiTrendingDown className="w-10 h-10 text-amber-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">At-Risk Vendors</p>
                <p className="text-2xl font-bold text-orange-500 mt-2">{stats.atRisk}</p>
              </div>
              <FiAlertTriangle className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-hope-border overflow-x-auto">
          {['overview', 'vendors', 'incidents', 'alerts'].map(tab => (
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-hope-text-primary mb-4">6-Month SLA Compliance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={MONTHLY_COMPLIANCE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[98, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value) => `${value.toFixed(2)}%`}
                  />
                  <Legend />
                  <ReferenceLine y={99.5} stroke="#6b7280" strokeDasharray="5 5" name="Target 99.5%" />
                  <Line type="monotone" dataKey="vendorA" stroke="#3b82f6" name="Vendor A" />
                  <Line type="monotone" dataKey="vendorB" stroke="#10b981" name="Vendor B" />
                  <Line type="monotone" dataKey="vendorC" stroke="#dc2626" name="Vendor C" />
                  <Line type="monotone" dataKey="vendorD" stroke="#eab308" name="Vendor D" />
                  <Line type="monotone" dataKey="vendorE" stroke="#8b5cf6" name="Vendor E" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-hope-text-primary mb-4">Violations vs Credits by Vendor</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={VENDOR_SLA_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="vendor" angle={-45} textAnchor="end" height={100} stroke="#9ca3af" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#9ca3af" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="violations" fill="#dc2626" name="Violations" />
                  <Bar yAxisId="right" dataKey="credits" fill="#eab308" name="Credits ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {['current', 'violations', 'credits'].map(sort => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === sort
                      ? 'bg-hope-accent text-white'
                      : 'bg-hope-card-bg border border-hope-border text-hope-text-secondary'
                  }`}
                >
                  Sort: {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {sortedVendors.map(vendor => (
                <div
                  key={vendor.id}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedVendor?.id === vendor.id
                      ? 'border-hope-accent bg-hope-accent/5'
                      : getStatusBg(vendor.status)
                  }`}
                  onClick={() => setSelectedVendor(selectedVendor?.id === vendor.id ? null : vendor)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-hope-text-primary">{vendor.vendor}</h4>
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: getStatusColor(vendor.status) }}
                        >
                          {vendor.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-hope-text-secondary mb-2">{vendor.service}</p>
                      <div className="flex gap-4 text-sm">
                        <span>Target: <span className="font-semibold text-hope-text-primary">{vendor.slaTarget}%</span></span>
                        <span>Current: <span className="font-semibold text-hope-text-primary">{vendor.current}%</span></span>
                        <span>Violations: <span className="font-semibold text-hope-text-primary">{vendor.violations}</span></span>
                        <span>Credits: <span className="font-semibold text-hope-text-primary">${vendor.credits}</span></span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-hope-accent text-white rounded text-sm hover:bg-opacity-90 transition">
                      Details
                    </button>
                  </div>

                  {selectedVendor?.id === vendor.id && (
                    <div className="mt-4 pt-4 border-t border-gray-600 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-hope-text-secondary mb-1">Contact</p>
                          <p className="text-sm text-hope-text-primary">{vendor.contact}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-hope-text-secondary mb-1">Response Time</p>
                          <p className="text-sm text-hope-text-primary">{vendor.responseTime}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-hope-text-secondary mb-1">Resolution Time</p>
                          <p className="text-sm text-hope-text-primary">{vendor.resolution}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Incidents Tab */}
        {activeTab === 'incidents' && (
          <div className="space-y-2">
            {SLA_INCIDENTS.map(incident => (
              <div key={incident.id} className="bg-hope-card-bg border border-hope-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-hope-text-primary">{incident.vendor}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                          incident.severity === 'critical' ? 'bg-red-500' :
                          incident.severity === 'high' ? 'bg-orange-500' :
                          'bg-amber-500'
                        }`}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                      {incident.credited && <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">CREDITED ${incident.amount}</span>}
                    </div>
                    <p className="text-sm text-hope-text-secondary">
                      {incident.date} • Duration: {incident.duration} • Impact: {incident.impact}
                    </p>
                    <p className="text-sm text-hope-text-secondary mt-1">Recovery: {incident.recovery}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-2">
            {ALERT_RULES.map(alert => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${
                  alert.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-green-500/10 border-green-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-hope-text-primary">{alert.vendor} - {alert.metric}</h4>
                    <p className="text-sm text-hope-text-secondary mt-1">
                      Threshold: {alert.threshold} • Current: {alert.current}
                    </p>
                  </div>
                  <div className="text-right">
                    {alert.status === 'warning' ? (
                      <FiAlertTriangle className="w-6 h-6 text-amber-500" />
                    ) : (
                      <FiCheckCircle className="w-6 h-6 text-green-500" />
                    )}
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
