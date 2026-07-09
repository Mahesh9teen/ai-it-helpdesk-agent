import React, { useState, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { FiUsers, FiTrendingUp, FiAward, FiActivity, FiSearch, FiFilter, FiZap } from 'react-icons/fi'

const EMPLOYEES = [
  { id: 1, name: 'Alice Johnson', role: 'Senior Analyst', team: 'L1 Support', tickets: 187, avgTime: 4.2, resolution: 92, satisf: 4.6, skills: ['tickets', 'escalation', 'training'], utilization: 87, capacity: 'high', status: 'productive' },
  { id: 2, name: 'Bob Smith', role: 'Technician', team: 'L2 Support', tickets: 142, avgTime: 5.8, resolution: 88, satisf: 4.3, skills: ['network', 'hardware', 'scripting'], utilization: 71, capacity: 'medium', status: 'healthy' },
  { id: 3, name: 'Carol Davis', role: 'Network Engineer', team: 'Infrastructure', tickets: 28, avgTime: 2.1, resolution: 100, satisf: 4.8, skills: ['network', 'cloud', 'automation'], utilization: 92, capacity: 'over', status: 'at-risk' },
  { id: 4, name: 'David Wilson', role: 'Junior Analyst', team: 'L1 Support', tickets: 156, avgTime: 6.4, resolution: 85, satisf: 4.1, skills: ['tickets', 'documentation'], utilization: 65, capacity: 'low', status: 'developing' },
  { id: 5, name: 'Eve Martinez', role: 'Security Specialist', team: 'Security', tickets: 31, avgTime: 3.2, resolution: 97, satisf: 4.7, skills: ['security', 'compliance', 'audit'], utilization: 88, capacity: 'high', status: 'expert' },
  { id: 6, name: 'Frank Brown', role: 'DevOps Engineer', team: 'Infrastructure', tickets: 45, avgTime: 2.8, resolution: 100, satisf: 4.5, skills: ['infrastructure', 'scripting', 'cloud'], utilization: 93, capacity: 'over', status: 'at-risk' },
]

const PRODUCTIVITY_TREND = [
  { week: 'W1', avgTickets: 165, avgTime: 5.2, resolution: 86, satisf: 4.2 },
  { week: 'W2', avgTickets: 172, avgTime: 5.0, resolution: 88, satisf: 4.3 },
  { week: 'W3', avgTickets: 168, avgTime: 5.3, resolution: 87, satisf: 4.2 },
  { week: 'W4', avgTickets: 175, avgTime: 4.9, resolution: 89, satisf: 4.4 },
]

const UTILIZATION_DIST = [
  { util: '< 60%', count: 2, team: 'Development' },
  { util: '60-80%', count: 3, team: 'L1 Support' },
  { util: '80-95%', count: 7, team: 'L2 Support' },
  { util: '> 95%', count: 2, team: 'Infrastructure' },
]

const SKILL_MATRIX = [
  { skill: 'Ticketing', coverage: 100, depth: 85 },
  { skill: 'Network', coverage: 68, depth: 92 },
  { skill: 'Cloud', coverage: 54, depth: 87 },
  { skill: 'Security', coverage: 42, depth: 95 },
  { skill: 'Scripting', coverage: 58, depth: 80 },
  { skill: 'Database', coverage: 35, depth: 88 },
]

const CAPACITY_VS_UTIL = [
  { employee: 'Alice', capacity: 100, utilization: 87 },
  { employee: 'Bob', capacity: 100, utilization: 71 },
  { employee: 'Carol', capacity: 100, utilization: 92 },
  { employee: 'David', capacity: 100, utilization: 65 },
  { employee: 'Eve', capacity: 100, utilization: 88 },
  { employee: 'Frank', capacity: 100, utilization: 93 },
]

export default function WorkforceProductivity() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchEmployee, setSearchEmployee] = useState('')
  const [teamFilter, setTeamFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredEmployees = useMemo(() => {
    return EMPLOYEES.filter(emp =>
      (teamFilter === 'all' || emp.team === teamFilter) &&
      (statusFilter === 'all' || emp.status === statusFilter) &&
      emp.name.toLowerCase().includes(searchEmployee.toLowerCase())
    )
  }, [searchEmployee, teamFilter, statusFilter])

  const teams = useMemo(() => [...new Set(EMPLOYEES.map(e => e.team))], [])

  const stats = useMemo(() => {
    return {
      avgUtilization: (EMPLOYEES.reduce((sum, e) => sum + e.utilization, 0) / EMPLOYEES.length).toFixed(1),
      avgSatisfaction: (EMPLOYEES.reduce((sum, e) => sum + e.satisf, 0) / EMPLOYEES.length).toFixed(1),
      atRisk: EMPLOYEES.filter(e => e.status === 'at-risk').length,
      experts: EMPLOYEES.filter(e => e.status === 'expert').length,
    }
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'productive': return '#10b981'
      case 'healthy': return '#3b82f6'
      case 'developing': return '#6b7280'
      case 'expert': return '#f59e0b'
      case 'at-risk': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getCapacityBg = (capacity) => {
    switch(capacity) {
      case 'low': return 'bg-green-500/10 border-green-500/30'
      case 'medium': return 'bg-blue-500/10 border-blue-500/30'
      case 'high': return 'bg-amber-500/10 border-amber-500/30'
      case 'over': return 'bg-red-500/10 border-red-500/30'
      default: return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-hope-bg text-hope-text">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-hope-text-primary">Workforce Productivity</h1>
            <p className="text-sm text-hope-text-secondary mt-1">Team performance • Capacity planning • Skill analytics</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-hope-accent text-white rounded-lg hover:bg-opacity-90 transition">
            <FiZap className="w-4 h-4" />
            Generate Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Avg Utilization</p>
                <p className="text-2xl font-bold text-blue-500 mt-2">{stats.avgUtilization}%</p>
              </div>
              <FiActivity className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Avg Satisfaction</p>
                <p className="text-2xl font-bold text-green-500 mt-2">{stats.avgSatisfaction}/5.0</p>
              </div>
              <FiAward className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">At-Risk Staff</p>
                <p className="text-2xl font-bold text-red-500 mt-2">{stats.atRisk}</p>
              </div>
              <FiTrendingUp className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </div>
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hope-text-secondary">Subject Matter Experts</p>
                <p className="text-2xl font-bold text-amber-500 mt-2">{stats.experts}</p>
              </div>
              <FiUsers className="w-10 h-10 text-amber-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-hope-border">
          {['overview', 'team-roster', 'skills', 'capacity'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab
                  ? 'border-hope-accent text-hope-accent'
                  : 'border-transparent text-hope-text-secondary hover:text-hope-text-primary'
              }`}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'team-roster' && 'Team Roster'}
              {tab === 'skills' && 'Skills Matrix'}
              {tab === 'capacity' && 'Capacity vs Util'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-hope-text-primary mb-4">4-Week Productivity Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={PRODUCTIVITY_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9ca3af" />
                    <YAxis yAxisId="left" stroke="#9ca3af" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="avgTickets" stroke="#3b82f6" name="Avg Tickets" />
                    <Line yAxisId="right" type="monotone" dataKey="satisf" stroke="#10b981" name="CSAT" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-hope-text-primary mb-4">Utilization Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={UTILIZATION_DIST}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="util" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-hope-text-primary mb-4">Utilization vs Resolution Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={PRODUCTIVITY_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="avgTime" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.6} name="Avg Time (hrs)" />
                  <Area type="monotone" dataKey="resolution" fill="#10b981" stroke="#10b981" fillOpacity={0.6} name="Resolution %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Team Roster Tab */}
        {activeTab === 'team-roster' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap items-center">
              <div className="flex-1 min-w-64 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hope-text-secondary" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-hope-input-bg border border-hope-border rounded-lg text-hope-text-primary placeholder-hope-text-secondary focus:outline-none focus:border-hope-accent"
                />
              </div>
              <div className="flex gap-2">
                {['all', ...teams].map(team => (
                  <button
                    key={team}
                    onClick={() => setTeamFilter(team)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      teamFilter === team
                        ? 'bg-hope-accent text-white'
                        : 'bg-hope-card-bg border border-hope-border text-hope-text-secondary'
                    }`}
                  >
                    {team === 'all' ? 'All' : team}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filteredEmployees.map(emp => (
                <div key={emp.id} className={`border rounded-lg p-4 ${getCapacityBg(emp.capacity)}`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-hope-text-primary">{emp.name}</h4>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">{emp.role}</span>
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: getStatusColor(emp.status) }}
                        >
                          {emp.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-hope-text-secondary mb-2">{emp.team}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-hope-text-secondary">Tickets: </span>
                          <span className="font-semibold text-hope-text-primary">{emp.tickets}</span>
                        </div>
                        <div>
                          <span className="text-hope-text-secondary">Resolution: </span>
                          <span className="font-semibold text-hope-text-primary">{emp.resolution}%</span>
                        </div>
                        <div>
                          <span className="text-hope-text-secondary">CSAT: </span>
                          <span className="font-semibold text-hope-text-primary">{emp.satisf}</span>
                        </div>
                        <div>
                          <span className="text-hope-text-secondary">Util: </span>
                          <span className="font-semibold text-hope-text-primary">{emp.utilization}%</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-hope-accent text-white rounded text-sm hover:bg-opacity-90 transition">
                      View Profile
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {emp.skills.map(skill => (
                      <span key={skill} className="px-2 py-1 rounded text-xs bg-gray-700/50">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Matrix Tab */}
        {activeTab === 'skills' && (
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-hope-text-primary mb-4">Skill Coverage & Depth</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="coverage" name="Coverage %" stroke="#9ca3af" />
                <YAxis dataKey="depth" name="Depth %" stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Scatter name="Skills" data={SKILL_MATRIX} fill="#3b82f6">
                  {SKILL_MATRIX.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#dc2626'][index % 6]} />
                  ))}
                </Scatter>
                <ReferenceLine x={60} stroke="#6b7280" strokeDasharray="5 5" name="Coverage Target" />
                <ReferenceLine y={85} stroke="#6b7280" strokeDasharray="5 5" name="Depth Target" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Capacity vs Util Tab */}
        {activeTab === 'capacity' && (
          <div className="bg-hope-card-bg border border-hope-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-hope-text-primary mb-4">Capacity vs Utilization by Employee</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={CAPACITY_VS_UTIL}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="employee" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="capacity" fill="#3b82f6" name="Capacity %" />
                <Bar dataKey="utilization" fill="#10b981" name="Utilization %" />
                <ReferenceLine y={100} stroke="#dc2626" strokeDasharray="5 5" name="Overload" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
