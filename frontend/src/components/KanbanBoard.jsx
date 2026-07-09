import React, { useState } from 'react'
import { FiFilter, FiPlus, FiMove, FiX, FiCalendar, FiUser, FiTag } from 'react-icons/fi'

export default function KanbanBoard({ initialTickets, onUpdateTicket }) {
  const [tickets, setTickets] = useState(initialTickets)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTicket, setNewTicket] = useState({ title: '', description: '', category: 'General', priority: 'Medium' })
  const [draggedTicket, setDraggedTicket] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)

  const columns = ['open', 'in_progress', 'pending_approval', 'resolved', 'closed']
  const columnLabels = {
    'open': 'OPEN',
    'in_progress': 'IN PROGRESS',
    'pending_approval': 'PENDING APPROVAL',
    'resolved': 'RESOLVED',
    'closed': 'CLOSED'
  }
  const priorityColors = {
    low: '#1aa053',
    medium: '#ffb02b',
    high: '#ff8c42',
    critical: '#c03221'
  }

  const groupedTickets = columns.reduce((acc, col) => {
    acc[col] = tickets.filter(t => t.status === col)
    return acc
  }, {})

  const handleDragStart = (ticket) => {
    setDraggedTicket(ticket)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDropOnColumn = (status) => {
    if (draggedTicket) {
      setTickets(tickets.map(t =>
        t.id === draggedTicket.id ? { ...t, status } : t
      ))
      setDraggedTicket(null)
    }
  }

  const handleCreateTicket = () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      alert('Title and description are required!')
      return
    }

    const ticket = {
      id: `#TK-${Math.floor(Math.random() * 10000)}`,
      title: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority.toLowerCase(),
      status: 'open',
      assigned_to: 'Unassigned',
      created: 'Just now',
      category: newTicket.category,
    }

    setTickets([ticket, ...tickets])
    setNewTicket({ title: '', description: '', category: 'General', priority: 'Medium' })
    setShowCreateModal(false)
  }

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-hope-border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100">Kanban Board</h2>
            <p className="text-sm text-hope-secondary">Drag tickets to move between statuses</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-hope-primary px-4 py-2 text-white hover:opacity-90"
          >
            <FiPlus className="h-4 w-4" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex flex-1 gap-4 overflow-x-auto bg-hope-canvas p-4 dark:bg-slate-950">
        {columns.map(col => (
          <div
            key={col}
            className="flex min-w-80 flex-col rounded-hope border border-hope-border bg-white dark:border-slate-700 dark:bg-slate-900"
          >
            {/* Column Header */}
            <div className="border-b border-hope-border p-3 dark:border-slate-700">
              <h3 className="font-semibold text-hope-ink dark:text-slate-100">
                {columnLabels[col]} ({groupedTickets[col].length})
              </h3>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnColumn(col)}
              className="flex-1 space-y-3 p-3"
            >
              {groupedTickets[col].map(ticket => (
                <div
                  key={ticket.id}
                  draggable
                  onDragStart={() => handleDragStart(ticket)}
                  onClick={() => setSelectedTicket(ticket)}
                  className="group cursor-grab rounded-hope border border-hope-border bg-white p-3 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 active:cursor-grabbing"
                >
                  {/* Ticket ID & Title */}
                  <div className="flex items-start gap-2">
                    <FiMove className="mt-0.5 h-4 w-4 text-hope-secondary opacity-0 group-hover:opacity-100" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-hope-secondary">{ticket.id}</p>
                      <p className="mt-1 text-sm font-semibold text-hope-ink dark:text-slate-100 line-clamp-2">
                        {ticket.title}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {/* Priority Badge */}
                    <span
                      className="inline-flex items-center rounded px-2 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: priorityColors[ticket.priority.toLowerCase()] }}
                    >
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>

                    {/* Category */}
                    <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs bg-hope-canvas dark:bg-slate-700 text-hope-ink dark:text-slate-300">
                      <FiTag className="h-3 w-3" />
                      {ticket.category}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between border-t border-hope-border pt-2 dark:border-slate-700">
                    <span className="text-xs text-hope-secondary">{ticket.assigned_to}</span>
                    <span className="text-xs text-hope-secondary">{ticket.created}</span>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {groupedTickets[col].length === 0 && (
                <div className="flex h-32 items-center justify-center rounded border-2 border-dashed border-hope-border text-center text-hope-secondary dark:border-slate-700">
                  <p className="text-sm">No tickets</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-hope bg-white p-6 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-hope-ink dark:text-slate-100">Create New Ticket</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-hope-secondary hover:text-hope-ink dark:hover:text-slate-100"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-hope-ink dark:text-slate-100 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="Ticket title"
                  className="w-full rounded-xl border border-hope-border bg-hope-canvas px-3 py-2 text-hope-ink outline-none focus:border-hope-primary focus:ring-2 focus:ring-hope-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-hope-ink dark:text-slate-100 mb-1">
                  Description *
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Describe the issue..."
                  rows="3"
                  className="w-full rounded-xl border border-hope-border bg-hope-canvas px-3 py-2 text-hope-ink outline-none focus:border-hope-primary focus:ring-2 focus:ring-hope-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-hope-ink dark:text-slate-100 mb-1">
                    Category
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full rounded-xl border border-hope-border bg-hope-canvas px-3 py-2 text-hope-ink outline-none focus:border-hope-primary focus:ring-2 focus:ring-hope-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option>Authentication</option>
                    <option>Network</option>
                    <option>Email</option>
                    <option>Hardware</option>
                    <option>Licenses</option>
                    <option>Peripherals</option>
                    <option>General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-hope-ink dark:text-slate-100 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full rounded-xl border border-hope-border bg-hope-canvas px-3 py-2 text-hope-ink outline-none focus:border-hope-primary focus:ring-2 focus:ring-hope-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-xl border border-hope-border px-4 py-2 font-semibold text-hope-ink hover:bg-hope-canvas dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                className="flex-1 rounded-xl bg-hope-primary px-4 py-2 font-semibold text-white hover:opacity-90"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Sidebar (optional) */}
      {selectedTicket && (
        <div className="fixed right-0 top-0 z-40 h-full w-96 border-l border-hope-border bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <button
            onClick={() => setSelectedTicket(null)}
            className="absolute top-4 right-4 text-hope-secondary hover:text-hope-ink dark:hover:text-slate-100"
          >
            <FiX className="h-5 w-5" />
          </button>

          <h3 className="text-lg font-bold text-hope-ink dark:text-slate-100 mb-2">{selectedTicket.id}</h3>
          <p className="text-sm text-hope-secondary mb-4">{selectedTicket.title}</p>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-hope-ink dark:text-slate-100">Status</p>
              <p className="text-hope-secondary">{selectedTicket.status}</p>
            </div>
            <div>
              <p className="font-semibold text-hope-ink dark:text-slate-100">Priority</p>
              <p className="text-hope-secondary">{selectedTicket.priority}</p>
            </div>
            <div>
              <p className="font-semibold text-hope-ink dark:text-slate-100">Assigned To</p>
              <p className="text-hope-secondary">{selectedTicket.assigned_to}</p>
            </div>
            <div>
              <p className="font-semibold text-hope-ink dark:text-slate-100">Category</p>
              <p className="text-hope-secondary">{selectedTicket.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
