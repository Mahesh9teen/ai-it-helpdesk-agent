import React, { useState, useEffect } from 'react'
import { FiFilter, FiSearch, FiPlus, FiChevronRight, FiX, FiList, FiGrid } from 'react-icons/fi'
import KanbanBoard from './KanbanBoard'
import TicketDetail from './TicketDetail'

const priorityColors = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
}

const statusColors = {
  open: 'text-hope-primary',
  in_progress: 'text-hope-warning',
  pending_approval: 'text-hope-secondary',
  resolved: 'text-hope-success',
  closed: 'text-hope-secondary'
}

export default function TicketsView() {
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'kanban'
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  })

  useEffect(() => {
    // Mock ticket data - in production this would come from the API
    const mockTickets = [
      { id: '#TK-1041', title: 'Password Reset Not Working', priority: 'high', status: 'in_progress', assigned_to: 'John Support', created: '2 hours ago', category: 'Authentication' },
      { id: '#TK-1040', title: 'VPN Connection Issues', priority: 'critical', status: 'open', assigned_to: 'Unassigned', created: '30 min ago', category: 'Network' },
      { id: '#TK-1039', title: 'Email Sync Problem', priority: 'medium', status: 'pending_approval', assigned_to: 'Jane Tech', created: '1 hour ago', category: 'Email' },
      { id: '#TK-1038', title: 'Monitor not Detected', priority: 'low', status: 'resolved', assigned_to: 'Mike Support', created: 'Yesterday', category: 'Hardware' },
      { id: '#TK-1037', title: 'Software License Expired', priority: 'high', status: 'in_progress', assigned_to: 'Sarah Admin', created: '3 hours ago', category: 'Licenses' },
      { id: '#TK-1036', title: 'Printer Driver Installation', priority: 'low', status: 'closed', assigned_to: 'John Support', created: '2 days ago', category: 'Peripherals' },
    ]
    setTickets(mockTickets)
    setFilteredTickets(mockTickets)
    setLoading(false)
  }, [])

  useEffect(() => {
    let filtered = tickets
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }
    
    setFilteredTickets(filtered)
  }, [searchTerm, statusFilter, tickets])

  const handleCreateTicket = () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const ticketId = `#TK-${Math.floor(Math.random() * 10000)}`
    const createdTicket = {
      id: ticketId,
      title: newTicket.title,
      priority: newTicket.priority,
      status: 'open',
      assigned_to: 'Unassigned',
      created: 'Just now',
      category: newTicket.category || 'General'
    }

    setTickets([createdTicket, ...tickets])
    setNewTicket({ title: '', description: '', category: '', priority: 'medium' })
    setShowCreateModal(false)
  }

  return (
    <div className="space-y-5">
      {/* Header with View Toggle */}
      <article className="hope-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-hope-ink dark:text-slate-100">Support Tickets</h2>
            <p className="mt-1 text-hope-secondary">Manage and resolve IT support requests</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-hope-border dark:border-slate-700">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-hope-primary text-white' : 'text-hope-secondary hover:bg-hope-canvas dark:hover:bg-slate-800'}`}
              >
                <FiList className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 ${viewMode === 'kanban' ? 'bg-hope-primary text-white' : 'text-hope-secondary hover:bg-hope-canvas dark:hover:bg-slate-800'}`}
              >
                <FiGrid className="h-5 w-5" />
              </button>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="hope-btn-primary">
              <FiPlus className="mr-2" /> New Ticket
            </button>
          </div>
        </div>
      </article>

      {/* Show Kanban or List */}
      {viewMode === 'kanban' ? (
        <KanbanBoard initialTickets={tickets} onUpdateTicket={setTickets} />
      ) : (
        <>
          {/* Search & Filters */}
          <article className="hope-card p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-3 text-hope-secondary" />
                <input
                  type="text"
                  placeholder="Search by title or ticket ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-hope border border-hope-border bg-white pl-10 pr-4 py-2 text-hope-ink placeholder-hope-secondary transition focus:border-hope-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-hope border border-hope-border bg-white px-4 py-2 text-hope-ink transition focus:border-hope-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </article>

          {/* Tickets List */}
          <article className="hope-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-hope-secondary">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-hope-secondary">No tickets found</div>
            ) : (
              <div className="divide-y divide-hope-border dark:divide-slate-700">
                {filteredTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex cursor-pointer items-center justify-between border-b border-hope-border px-6 py-4 last:border-b-0 transition hover:bg-hope-canvas dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold text-hope-ink dark:text-slate-100">{ticket.title}</h3>
                          <p className="mt-1 text-sm text-hope-secondary">{ticket.id} · {ticket.category}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                      <span className={`text-sm font-semibold ${statusColors[ticket.status]}`}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-hope-secondary">{ticket.assigned_to}</span>
                      <FiChevronRight className="text-hope-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* Stats Footer */}
          <article className="hope-card p-6">
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-2xl font-bold text-hope-primary">{tickets.length}</p>
                <p className="text-sm text-hope-secondary">Total Tickets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-hope-warning">{tickets.filter(t => t.status === 'in_progress').length}</p>
                <p className="text-sm text-hope-secondary">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-hope-success">{tickets.filter(t => t.status === 'resolved').length}</p>
                <p className="text-sm text-hope-secondary">Resolved</p>
              </div>
            </div>
          </article>
        </>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onAddComment={(comment) => console.log('Comment added:', comment)}
        />
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <article className="hope-card w-full max-w-md">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-hope-ink dark:text-slate-100">Create New Ticket</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-1 text-hope-secondary hover:bg-hope-canvas dark:hover:bg-slate-800"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-hope-ink dark:text-slate-100">Title*</label>
                  <input
                    type="text"
                    placeholder="Describe your issue..."
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="w-full rounded-hope border border-hope-border bg-white px-4 py-2 text-hope-ink placeholder-hope-secondary transition focus:border-hope-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-hope-ink dark:text-slate-100">Description*</label>
                  <textarea
                    placeholder="Provide more details about the issue..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    rows="4"
                    className="w-full rounded-hope border border-hope-border bg-white px-4 py-2 text-hope-ink placeholder-hope-secondary transition focus:border-hope-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-hope-ink dark:text-slate-100">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full rounded-hope border border-hope-border bg-white px-4 py-2 text-hope-ink transition focus:border-hope-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">Select a category</option>
                    <option value="Authentication">Authentication</option>
                    <option value="Network">Network</option>
                    <option value="Email">Email</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Licenses">Licenses</option>
                    <option value="Peripherals">Peripherals</option>
                    <option value="General">General</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-hope-ink dark:text-slate-100">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full rounded-hope border border-hope-border bg-white px-4 py-2 text-hope-ink transition focus:border-hope-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="hope-btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTicket}
                  className="hope-btn-primary flex-1"
                >
                  Create Ticket
                </button>
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  )
}
