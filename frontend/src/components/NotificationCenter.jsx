import { useState } from 'react';
import { FiBell, FiX, FiCheck, FiTrash2, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

/**
 * NotificationCenter.jsx
 * 
 * Unified notification management
 * Features:
 * - View all notifications
 * - Mark as read/unread
 * - Delete notifications
 * - Filter by type
 * - Real-time updates
 * - Notification history
 */

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'ticket_assigned',
    title: 'New Ticket Assigned',
    message: 'TKT-456: "Server down" assigned to you',
    icon: 'FiAlertCircle',
    timestamp: '2 minutes ago',
    read: false,
    priority: 'high'
  },
  {
    id: 2,
    type: 'sla_warning',
    title: 'SLA Warning',
    message: 'TKT-123 is at risk of breaching SLA (1 hour remaining)',
    icon: 'FiAlertCircle',
    timestamp: '5 minutes ago',
    read: false,
    priority: 'high'
  },
  {
    id: 3,
    type: 'ticket_resolved',
    title: 'Ticket Resolved',
    message: 'TKT-789: "Email sync issue" has been resolved by Sarah',
    icon: 'FiCheckCircle',
    timestamp: '15 minutes ago',
    read: false,
    priority: 'normal'
  },
  {
    id: 4,
    type: 'comment_added',
    title: 'New Comment',
    message: 'Sarah added a comment to TKT-234',
    icon: 'FiInfo',
    timestamp: '32 minutes ago',
    read: true,
    priority: 'normal'
  },
  {
    id: 5,
    type: 'escalation',
    title: 'Ticket Escalated',
    message: 'TKT-567 has been escalated to manager level',
    icon: 'FiAlertCircle',
    timestamp: '1 hour ago',
    read: true,
    priority: 'high'
  },
  {
    id: 6,
    type: 'approval_needed',
    title: 'Approval Requested',
    message: 'TKT-345: Admin access request requires your approval',
    icon: 'FiAlertCircle',
    timestamp: '2 hours ago',
    read: true,
    priority: 'high'
  },
  {
    id: 7,
    type: 'system',
    title: 'System Update',
    message: 'System maintenance scheduled for tonight 10 PM - 12 AM',
    icon: 'FiInfo',
    timestamp: '3 hours ago',
    read: true,
    priority: 'normal'
  }
];

function NotificationCenter() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAsUnread = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: false } : n
    ));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'high') return n.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const priorityColors = {
    'high': 'bg-red-100 text-red-800 border-l-4 border-red-600',
    'normal': 'bg-gray-50 text-gray-800 border-l-4 border-gray-300'
  };

  const typeIcons = {
    'ticket_assigned': FiAlertCircle,
    'sla_warning': FiAlertCircle,
    'ticket_resolved': FiCheckCircle,
    'comment_added': FiInfo,
    'escalation': FiAlertCircle,
    'approval_needed': FiAlertCircle,
    'system': FiInfo
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiBell className="text-2xl text-red-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold">Notification Center</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded font-medium ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`px-4 py-2 rounded font-medium ${filter === 'high' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          High Priority
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiBell className="text-4xl mx-auto mb-3 opacity-30" />
            <p>No notifications</p>
          </div>
        ) : (
          filteredNotifications.map(notif => {
            const IconComponent = typeIcons[notif.type] || FiInfo;
            return (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border-l-4 flex items-start justify-between hover:shadow-md transition-shadow ${priorityColors[notif.priority]} ${!notif.read ? 'font-semibold' : ''}`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <IconComponent className={`text-xl flex-shrink-0 mt-1 ${notif.priority === 'high' ? 'text-red-600' : 'text-gray-600'}`} />
                  <div className="flex-1">
                    <h3 className="font-bold">{notif.title}</h3>
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!notif.read ? (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Mark as read"
                    >
                      <FiCheck />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkAsUnread(notif.id)}
                      className="text-gray-600 hover:text-gray-800 p-2"
                      title="Mark as unread"
                    >
                      <FiBell size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(notif.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                {showDeleteConfirm === notif.id && (
                  <div className="absolute right-4 mt-10 bg-white border-2 border-gray-200 rounded shadow-lg p-2 z-10">
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="text-xs text-red-600 hover:text-red-800 px-2 py-1 block"
                    >
                      Confirm delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 block"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-3">
        💡 Tip: Unread notifications appear with a blue highlight. Click the bell icon to mark as unread again.
      </div>
    </div>
  );
}

export default NotificationCenter;
