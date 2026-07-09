import React, { useState } from 'react'
import { FiCheck, FiAlertCircle, FiShield, FiUsers, FiLock } from 'react-icons/fi'

export default function RolePermissions() {
  const [roles, setRoles] = useState([
    { id: 1, name: 'Support Agent', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', permissions: ['view_tickets', 'add_comments', 'create_tickets'] },
    { id: 2, name: 'Team Lead', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100', permissions: ['view_tickets', 'add_comments', 'create_tickets', 'assign_tickets', 'view_reports'] },
    { id: 3, name: 'Manager', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', permissions: ['view_tickets', 'add_comments', 'create_tickets', 'assign_tickets', 'view_reports', 'manage_team', 'close_tickets'] },
    { id: 4, name: 'Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', permissions: ['all'] }
  ])

  const allPermissions = [
    { id: 'view_tickets', label: 'View Tickets' },
    { id: 'create_tickets', label: 'Create Tickets' },
    { id: 'add_comments', label: 'Add Comments' },
    { id: 'assign_tickets', label: 'Assign Tickets' },
    { id: 'close_tickets', label: 'Close Tickets' },
    { id: 'view_reports', label: 'View Reports' },
    { id: 'manage_team', label: 'Manage Team' },
    { id: 'system_settings', label: 'System Settings' }
  ]

  const togglePermission = (roleId, permissionId) => {
    setRoles(prev => prev.map(role =>
      role.id === roleId && !role.permissions.includes('all')
        ? { ...role, permissions: role.permissions.includes(permissionId) ? role.permissions.filter(p => p !== permissionId) : [...role.permissions, permissionId] }
        : role
    ))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-hope border border-hope-border bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-4">
          <FiShield className="h-5 w-5 text-hope-primary" />
          <h3 className="text-lg font-bold text-hope-ink dark:text-slate-100">Role & Permissions</h3>
        </div>

        <div className="space-y-4">
          {roles.map(role => (
            <div key={role.id} className="rounded-hope border border-hope-border p-4 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${role.color}`}>
                  {role.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {allPermissions.map(perm => (
                  <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={role.permissions.includes(perm.id) || role.permissions.includes('all')}
                      onChange={() => togglePermission(role.id, perm.id)}
                      disabled={role.permissions.includes('all')}
                      className="rounded"
                    />
                    <span className="text-sm text-hope-ink dark:text-slate-100">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
