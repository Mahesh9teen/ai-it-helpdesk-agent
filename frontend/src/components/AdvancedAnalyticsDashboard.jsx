import { useState, useMemo } from 'react';
import { FiBarChart2, FiTrendingUp, FiUsers, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

/**
 * AdvancedAnalyticsDashboard.jsx
 * 
 * Real-time metrics, charts, and reporting
 * Features:
 * - Key metrics cards
 * - Trend charts
 * - Agent performance
 * - Category breakdown
 * - Time-based filtering
 */

const MOCK_METRICS = {
  total_tickets: 1247,
  resolved_today: 89,
  avg_resolution_time: 4.2,
  satisfaction_score: 4.7,
  tickets_by_category: [
    { name: 'Hardware', count: 325, percent: 26 },
    { name: 'Software', count: 298, percent: 24 },
    { name: 'Network', count: 215, percent: 17 },
    { name: 'Account', count: 189, percent: 15 },
    { name: 'Other', count: 220, percent: 18 }
  ],
  resolution_trend: [
    { day: 'Mon', resolved: 82, escalated: 12 },
    { day: 'Tue', resolved: 75, escalated: 15 },
    { day: 'Wed', resolved: 88, escalated: 10 },
    { day: 'Thu', resolved: 91, escalated: 8 },
    { day: 'Fri', resolved: 89, escalated: 11 }
  ],
  agent_stats: [
    { name: 'Sarah Mitchell', tickets: 145, satisfaction: 4.8, resolution_time: 3.2 },
    { name: 'Chen Wei', tickets: 132, satisfaction: 4.6, resolution_time: 3.8 },
    { name: 'Alex Rodriguez', tickets: 128, satisfaction: 4.7, resolution_time: 3.5 },
    { name: 'Jay Patel', tickets: 115, satisfaction: 4.5, resolution_time: 4.1 }
  ]
};

function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const MetricCard = ({ label, value, unit, icon: Icon, color }) => (
    <div className={`bg-white rounded-lg p-6 border-2 border-${color}-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className={`text-3xl font-bold text-${color}-600 mt-2`}>
            {value}{unit}
          </p>
        </div>
        <Icon className={`text-3xl text-${color}-400`} />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiBarChart2 className="text-2xl text-purple-600" />
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border-2 border-gray-300 rounded px-4 py-2"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Tickets"
          value={MOCK_METRICS.total_tickets}
          unit=""
          icon={FiCheckCircle}
          color="blue"
        />
        <MetricCard
          label="Resolved Today"
          value={MOCK_METRICS.resolved_today}
          unit=""
          icon={FiTrendingUp}
          color="green"
        />
        <MetricCard
          label="Avg Resolution"
          value={MOCK_METRICS.avg_resolution_time}
          unit="h"
          icon={FiClock}
          color="orange"
        />
        <MetricCard
          label="Satisfaction"
          value={MOCK_METRICS.satisfaction_score}
          unit="/5"
          icon={FiCheckCircle}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Resolution Trend */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Resolution Trend</h2>
          <div className="space-y-3">
            {MOCK_METRICS.resolution_trend.map((day, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{day.day}</span>
                  <span>{day.resolved + day.escalated} total</span>
                </div>
                <div className="flex h-6 bg-gray-100 rounded overflow-hidden">
                  <div
                    style={{ width: `${(day.resolved / 100) * 100}%` }}
                    className="bg-green-500"
                    title={`Resolved: ${day.resolved}`}
                  />
                  <div
                    style={{ width: `${(day.escalated / 100) * 100}%` }}
                    className="bg-orange-500"
                    title={`Escalated: ${day.escalated}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Resolved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Escalated</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Tickets by Category</h2>
          <div className="space-y-3">
            {MOCK_METRICS.tickets_by_category.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={`cursor-pointer p-2 rounded ${selectedCategory === cat.name ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
              >
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{cat.name}</span>
                  <span className="text-gray-600">{cat.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiUsers /> Agent Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-3">Agent</th>
                <th className="text-center p-3">Tickets Handled</th>
                <th className="text-center p-3">Satisfaction</th>
                <th className="text-center p-3">Avg Resolution</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_METRICS.agent_stats.map((agent, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium">{agent.name}</td>
                  <td className="p-3 text-center">{agent.tickets}</td>
                  <td className="p-3 text-center">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      {agent.satisfaction}/5 ⭐
                    </span>
                  </td>
                  <td className="p-3 text-center">{agent.resolution_time}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdvancedAnalyticsDashboard;
