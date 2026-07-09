import { useState } from 'react';
import { FiBold, FiCheckSquare, FiX, FiArrowRight, FiCheck, FiChevronDown, FiAlertCircle } from 'react-icons/fi';

/**
 * BulkOperations.jsx
 * 
 * Batch update multiple tickets at once
 * Features:
 * - Select multiple tickets
 * - Bulk assign
 * - Bulk status update
 * - Bulk priority change
 * - Bulk add labels
 * - Confirmation before applying
 */

const MOCK_TICKETS = [
  { id: 'TKT-001', title: 'Laptop won\'t start', priority: 'high', status: 'open', assigned: 'unassigned', category: 'Hardware' },
  { id: 'TKT-002', title: 'Email not syncing', priority: 'medium', status: 'open', assigned: 'sarah', category: 'Account' },
  { id: 'TKT-003', title: 'Password reset needed', priority: 'high', status: 'in_progress', assigned: 'chen', category: 'Account' },
  { id: 'TKT-004', title: 'VPN connection issues', priority: 'critical', status: 'open', assigned: 'unassigned', category: 'Network' },
  { id: 'TKT-005', title: 'Monitor flickering', priority: 'low', status: 'open', assigned: 'jay', category: 'Hardware' },
  { id: 'TKT-006', title: 'Software installation', priority: 'medium', status: 'pending', assigned: 'unassigned', category: 'Software' },
  { id: 'TKT-007', title: 'Access denied error', priority: 'high', status: 'open', assigned: 'alex', category: 'Account' },
  { id: 'TKT-008', title: 'Printer not working', priority: 'low', status: 'open', assigned: 'unassigned', category: 'Hardware' },
];

function BulkOperations() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [selected, setSelected] = useState(new Set());
  const [action, setAction] = useState('assign');
  const [value, setValue] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggleTicket = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleSelectAll = () => {
    if (selected.size === tickets.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tickets.map(t => t.id)));
    }
  };

  const handleApplyAction = () => {
    const selectedTickets = Array.from(selected);
    const updated = tickets.map(t => {
      if (!selectedTickets.includes(t.id)) return t;
      
      switch (action) {
        case 'assign':
          return { ...t, assigned: value };
        case 'status':
          return { ...t, status: value };
        case 'priority':
          return { ...t, priority: value };
        case 'label':
          return { ...t, label: value };
        default:
          return t;
      }
    });
    
    setTickets(updated);
    setSelected(new Set());
    setAction('assign');
    setValue('');
    setShowConfirm(false);
  };

  const getActionLabel = () => {
    const count = selected.size;
    switch (action) {
      case 'assign':
        return `Assign ${count} ticket(s) to ${value || 'agent'}`;
      case 'status':
        return `Change status of ${count} ticket(s) to ${value || 'status'}`;
      case 'priority':
        return `Change priority of ${count} ticket(s) to ${value || 'priority'}`;
      case 'label':
        return `Add label "${value}" to ${count} ticket(s)`;
      default:
        return '';
    }
  };

  const priorityColors = {
    'critical': 'bg-red-100 text-red-800',
    'high': 'bg-orange-100 text-orange-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800'
  };

  const statusColors = {
    'open': 'bg-blue-100 text-blue-800',
    'in_progress': 'bg-purple-100 text-purple-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'resolved': 'bg-green-100 text-green-800'
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FiBold className="text-2xl text-indigo-600" />
        <h1 className="text-3xl font-bold">Bulk Operations</h1>
      </div>

      {/* Action Panel */}
      {selected.size > 0 && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <FiAlertCircle className="text-xl text-blue-600" />
            <span className="font-semibold">{selected.size} ticket(s) selected</span>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <select
              value={action}
              onChange={(e) => { setAction(e.target.value); setValue(''); }}
              className="border-2 border-blue-300 rounded px-3 py-2"
            >
              <option value="assign">Assign To</option>
              <option value="status">Change Status</option>
              <option value="priority">Change Priority</option>
              <option value="label">Add Label</option>
            </select>

            {action === 'assign' && (
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="border-2 border-blue-300 rounded px-3 py-2"
              >
                <option value="">Select Agent</option>
                <option value="unassigned">Unassigned</option>
                <option value="sarah">Sarah Mitchell</option>
                <option value="chen">Chen Wei</option>
                <option value="jay">Jay Patel</option>
                <option value="alex">Alex Rodriguez</option>
              </select>
            )}

            {action === 'status' && (
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="border-2 border-blue-300 rounded px-3 py-2"
              >
                <option value="">Select Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            )}

            {action === 'priority' && (
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="border-2 border-blue-300 rounded px-3 py-2"
              >
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            )}

            {action === 'label' && (
              <input
                type="text"
                placeholder="Label name"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="border-2 border-blue-300 rounded px-3 py-2"
              />
            )}

            <button
              onClick={() => setShowConfirm(true)}
              disabled={!value}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiArrowRight /> Apply
            </button>
          </div>

          <p className="text-sm text-blue-700">{getActionLabel()}</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h2 className="text-xl font-bold mb-4">Confirm Bulk Action</h2>
            <p className="text-gray-700 mb-6">{getActionLabel()}?</p>
            <div className="flex gap-2">
              <button
                onClick={handleApplyAction}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <FiCheck /> Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === tickets.length && tickets.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="p-3 text-left font-bold">Ticket ID</th>
              <th className="p-3 text-left font-bold">Title</th>
              <th className="p-3 text-left font-bold">Priority</th>
              <th className="p-3 text-left font-bold">Status</th>
              <th className="p-3 text-left font-bold">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr
                key={ticket.id}
                className={`border-b border-gray-100 hover:bg-gray-50 ${selected.has(ticket.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.has(ticket.id)}
                    onChange={() => handleToggleTicket(ticket.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="p-3 font-mono font-bold text-sm">{ticket.id}</td>
                <td className="p-3">{ticket.title}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3 text-sm">{ticket.assigned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {tickets.length} tickets • {selected.size} selected
      </div>
    </div>
  );
}

export default BulkOperations;
