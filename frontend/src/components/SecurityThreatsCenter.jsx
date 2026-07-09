import React, { useState, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FiShield, FiAlertTriangle, FiCheckCircle, FiAlertCircle, FiX, FiFilter, FiTrendingUp, FiClock, FiZap } from 'react-icons/fi'

const THREAT_TIMELINE = [
  { week: 'W1', critical: 3, high: 8, medium: 15, low: 42 },
  { week: 'W2', critical: 5, high: 12, medium: 18, low: 38 },
  { week: 'W3', critical: 2, high: 6, medium: 12, low: 35 },
  { week: 'W4', critical: 7, high: 14, medium: 22, low: 48 },
]

const ACTIVE_THREATS = [
  { id: 1, name: 'SQL Injection in Login Module', severity: 'critical', status: 'open', discovered: '2026-06-28', cve: 'CVE-2026-1234', affectedSystems: ['API Server 1', 'API Server 2'], mitigation: 'Input validation update pending', daysOpen: 3 },
  { id: 2, name: 'Unpatched RDP Vulnerability', severity: 'critical', status: 'open', discovered: '2026-06-26', cve: 'CVE-2026-0892', affectedSystems: ['Desktop-12', 'Desktop-45', 'Server-03'], mitigation: 'OS update scheduled for this week', daysOpen: 5 },
  { id: 3, name: 'Weak SSL Configuration', severity: 'high', status: 'open', discovered: '2026-06-25', cve: 'N/A', affectedSystems: ['Web Server 3', 'Web Server 4'], mitigation: 'SSL certificate renewal in progress', daysOpen: 6 },
  { id: 4, name: 'Suspicious User Activity (Anomaly)', severity: 'high', status: 'investigating', discovered: '2026-06-29', cve: 'N/A', affectedSystems: ['admin@company.com'], mitigation: 'MFA enforcement ongoing', daysOpen: 1 },
  { id: 5, name: 'Port Scan Activity from External IP', severity: 'medium', status: 'open', discovered: '2026-06-29', cve: 'N/A', affectedSystems: ['Perimeter Network'], mitigation: 'Firewall rules updated', daysOpen: 1 },
  { id: 6, name: 'Old TLS Version Detected', severity: 'medium', status: 'mitigated', discovered: '2026-06-15', cve: 'N/A', affectedSystems: ['Legacy App Server'], mitigation: 'TLS 1.2+ enforced', daysOpen: 14 },
]

const COMPLIANCE_VIOLATIONS = [
  { id: 1, framework: 'PCI-DSS', violation: 'Password policy not enforced', status: 'open', daysOverdue: 12, requirement: '8.2.3' },
  { id: 2, framework: 'ISO 27001', violation: 'Backup test not completed', status: 'open', daysOverdue: 8, requirement: 'A.12.3.1' },
  { id: 3, framework: 'HIPAA', violation: 'Audit log retention insufficient', status: 'in_progress', daysOverdue: 0, requirement: '§164.312(b)' },
  { id: 4, framework: 'SOC 2', violation: 'Access review delayed', status: 'open', daysOverdue: 5, requirement: 'CC6.1' },
]

const VULNERABILITY_DIST = [
  { name: 'Critical', value: 17, color: '#dc2626' },
  { name: 'High', value: 42, color: '#ea580c' },
  { name: 'Medium', value: 115, color: '#eab308' },
  { name: 'Low', value: 163, color: '#6b7280' },
]

const MTTR_DATA = [
  { month: 'Apr', days: 4.2 },
  { month: 'May', days: 3.8 },
  { month: 'Jun', days: 4.5 },
]

export default function SecurityThreatsCenter() {
  const [activeTab, setActiveTab] = useState('threats')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredThreats = useMemo(() => {
    return ACTIVE_THREATS.filter(t =>
      (severityFilter === 'all' || t.severity === severityFilter) &&
      (statusFilter === 'all' || t.status === statusFilter)
    )
  }, [severityFilter, statusFilter])

  const threatStats = useMemo(() => {
    return {
      critical: ACTIVE_THREATS.filter(t => t.severity === 'critical').length,
      high: ACTIVE_THREATS.filter(t => t.severity === 'high').length,
      open: ACTIVE_THREATS.filter(t => t.status === 'open').length,
      investigating: ACTIVE_THREATS.filter(t => t.status === 'investigating').length,
    }
  }, [])

  const complianceStatus = useMemo(() => {
    return {
      violations: COMPLIANCE_VIOLATIONS.filter(v => v.status === 'open').length,
      inProgress: COMPLIANCE_VIOLATIONS.filter(v => v.status === 'in_progress').length,
      compliant: COMPLIANCE_VIOLATIONS.filter(v => v.status === 'compliant').length,
    }
  }, [])

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#dc2626'
      case 'high': return '#ea580c'
      case 'medium': return '#eab308'
      case 'low': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusBg = (status) => {
    switch(status) {
      case 'open': return 'bg-red-100/10 border-red-500/20'
      case 'investigating': return 'bg-amber-100/10 border-amber-500/20'
      case 'mitigated': return 'bg-green-100/10 border-green-500/20'
      default: return 'bg-gray-100/10 border-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-hope-bg text-hope-text">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-hope-text-primary">Security Threats Center</h1>
            <p className="text-sm text-hope-text-secondary mt-1">Threat intelligence • Vulnerability tracking • Compliance monitoring</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-hope-accent text-white rounded-lg hover:bg-opacity-90 transition">
            <FiZap className="w-4 h-4" />
            Run Scan
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Critical Threats</p>
                <p className="text-2xl font-bold text-red-500 mt-2">{threatStats.critical}</p>
              </div>
              <FiAlertTriangle className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">High Threats</p>
                <p className="text-2xl font-bold text-orange-500 mt-2">{threatStats.high}</p>
              </div>
              <FiAlertCircle className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Compliance Issues</p>
                <p className="text-2xl font-bold text-amber-500 mt-2">{complianceStatus.violations}</p>
              </div>
              <FiShield className="w-10 h-10 text-amber-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Avg MTTR</p>
                <p className="text-2xl font-bold text-blue-500 mt-2">{MTTR_DATA[MTTR_DATA.length - 1].days} days</p>
              </div>
              <FiClock className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-hope-border">
          {['threats', 'vulnerabilities', 'compliance'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab
                  ? 'border-hope-accent text-hope-accent'
                  : 'border-transparent text-hope-text-secondary hover:text-hope-text-primary'
              }`}
            >
              {tab === 'threats' && 'Active Threats'}
              {tab === 'vulnerabilities' && 'Vulnerabilities'}
              {tab === 'compliance' && 'Compliance'}
            </button>
          ))}
        </div>

        {/* Threats Tab */}
        {activeTab === 'threats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-hope-card-bg border border-hope-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-hope-text-primary mb-4">4-Week Threat Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={THREAT_TIMELINE}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="critical" fill="#dc2626" />
                    <Bar dataKey="high" fill="#ea580c" />
                    <Bar dataKey="medium" fill="#eab308" />
                    <Bar dataKey="low" fill="#6b7280" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-hope-text-primary mb-4">Severity Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={VULNERABILITY_DIST}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {VULNERABILITY_DIST.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1">
                {['all', 'critical', 'high', 'medium'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      severityFilter === sev
                        ? 'bg-hope-accent text-white'
                        : 'bg-hope-card-bg border border-hope-border text-hope-text-secondary'
                    }`}
                  >
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {['all', 'open', 'investigating', 'mitigated'].map(stat => (
                  <button
                    key={stat}
                    onClick={() => setStatusFilter(stat)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      statusFilter === stat
                        ? 'bg-hope-accent text-white'
                        : 'bg-hope-card-bg border border-hope-border text-hope-text-secondary'
                    }`}
                  >
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Threat List */}
            <div className="space-y-2">
              {filteredThreats.map(threat => (
                <div key={threat.id} className={`border rounded-lg p-4 ${getStatusBg(threat.status)}`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-hope-text-primary">{threat.name}</h4>
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: getSeverityColor(threat.severity) }}
                        >
                          {threat.severity.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
                          {threat.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-hope-text-secondary mb-2">{threat.cve} • Discovered: {threat.discovered} • Open for {threat.daysOpen}d</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {threat.affectedSystems.map((sys, idx) => (
                          <span key={idx} className="text-xs bg-gray-700/50 px-2 py-1 rounded">
                            {sys}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-hope-text-secondary">Mitigation: {threat.mitigation}</p>
                    </div>
                    <button className="px-3 py-1 bg-hope-accent text-white rounded text-sm hover:bg-opacity-90 transition">
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vulnerabilities Tab */}
        {activeTab === 'vulnerabilities' && (
          <div className="space-y-6">
            <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-hope-text-primary mb-4">Mean Time To Remediate</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={MTTR_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value) => `${value} days`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={2} name="MTTR (days)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <div className="space-y-2">
              {COMPLIANCE_VIOLATIONS.map((violation, idx) => (
                <div key={idx} className="bg-hope-card-bg border border-hope-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-hope-text-primary">{violation.framework} - {violation.requirement}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          violation.status === 'open' ? 'bg-red-500/20 text-red-400' :
                          violation.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {violation.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-hope-text-secondary">{violation.violation}</p>
                      {violation.daysOverdue > 0 && (
                        <p className="text-sm text-red-400 mt-1">Overdue by {violation.daysOverdue} days</p>
                      )}
                    </div>
                    <button className="px-3 py-1 bg-hope-accent text-white rounded text-sm hover:bg-opacity-90 transition">
                      Review
                    </button>
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
