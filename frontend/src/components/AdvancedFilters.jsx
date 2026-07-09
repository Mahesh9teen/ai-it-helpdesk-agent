import React, { useState } from 'react'
import { FiChevronDown, FiX, FiFilter } from 'react-icons/fi'

export default function AdvancedFilters({ onFilterChange, tickets = [] }) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    dateRange: 'all',
    priority: [],
    status: [],
    assignee: [],
    category: [],
    slaStatus: 'all'
  })

  const priorities = ['low', 'medium', 'high', 'critical']
  const statuses = ['open', 'in_progress', 'pending_approval', 'resolved', 'closed']
  const categories = ['Authentication', 'Network', 'Email', 'Hardware', 'Licenses', 'Peripherals', 'General']
  const assignees = tickets.length > 0 ? [...new Set(tickets.map(t => t.assigned_to))].filter(a => a !== 'Unassigned') : ['John Smith', 'Jane Doe', 'Support Team']

  const handleToggleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }))
  }

  const handleDateChange = (value) => {
    setFilters(prev => ({ ...prev, dateRange: value }))
  }

  const handleSLAChange = (value) => {
    setFilters(prev => ({ ...prev, slaStatus: value }))
  }

  const applyFilters = () => {
    onFilterChange(filters)
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      dateRange: 'all',
      priority: [],
      status: [],
      assignee: [],
      category: [],
      slaStatus: 'all'
    })
  }

  const activeFilterCount = [
    ...filters.priority,
    ...filters.status,
    ...filters.assignee,
    ...filters.category,
    ...(filters.dateRange !== 'all' ? [filters.dateRange] : []),
    ...(filters.slaStatus !== 'all' ? [filters.slaStatus] : [])
  ].length

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 rounded-xl border border-hope-border px-3 py-2 text-hope-secondary hover:bg-hope-canvas dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <FiFilter className="h-4 w-4" />
        Filters {activeFilterCount > 0 && <span className="ml-1 font-semibold text-hope-primary">({activeFilterCount})</span>}
      </button>

      {showFilters && (
        <div className="absolute right-0 top-12 z-40 w-96 rounded-hope border border-hope-border bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="space-y-4 p-4 max-h-96 overflow-y-auto">
            {/* Date Range */}
            <div>
              <label className="text-sm font-semibold text-hope-ink dark:text-slate-100 block mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full rounded-xl border border-hope-border bg-white px-3 py-2 text-sm text-hope-ink dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-semibold text-hope-ink dark:text-slate-100 block mb-2">Priority</label>
              <div className="space-y-2">
                {priorities.map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(p)}
                      onChange={() => handleToggleFilter('priority', p)}
                      className="rounded"
                    />
                    <span className="text-sm text-hope-ink dark:text-slate-100 capitalize">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-semibold text-hope-ink dark:text-slate-100 block mb-2">Status</label>
              <div className="space-y-2">
                {statuses.map(s => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(s)}
                      onChange={() => handleToggleFilter('status', s)}
                      className="rounded"
                    />
                    <span className="text-sm text-hope-ink dark:text-slate-100 capitalize">{s.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Assignee */}
            {assignees.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-hope-ink dark:text-slate-100 block mb-2">Assigned To</label>
                <div className="space-y-2">
                  {assignees.map(a => (
                    <label key={a} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.assignee.includes(a)}
                        onChange={() => handleToggleFilter('assignee', a)}
                        className="rounded"
                      />
                      <span className="text-sm text-hope-ink dark:text-slate-100">{a}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="text-sm font-semibold text-hope-ink dark:text-slate-100 block mb-2">Category</label>
              <div className="space-y-2">
                {categories.map(c => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(c)}
                      onChange={() => handleToggleFilter('category', c)}
                      className="rounded"
                    />
                    <span className="text-sm text-hope-ink dark:text-slate-100">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SLA Status */}
            <div>
              <label className="text-sm font-semibold text-hope-ink dark:text-slate-100 block mb-2">SLA Status</label>
              <select
                value={filters.slaStatus}
                onChange={(e) => handleSLAChange(e.target.value)}
                className="w-full rounded-xl border border-hope-border bg-white px-3 py-2 text-sm text-hope-ink dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">All</option>
                <option value="ontrack">On Track</option>
                <option value="atrisk">At Risk</option>
                <option value="breached">Breached</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 border-t border-hope-border pt-4 dark:border-slate-700">
              <button
                onClick={clearFilters}
                className="flex-1 rounded-xl border border-hope-border px-3 py-2 text-sm font-semibold text-hope-ink hover:bg-hope-canvas dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 rounded-xl bg-hope-primary px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
