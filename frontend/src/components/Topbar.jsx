import React, { useState } from 'react'
import { FiMenu, FiSearch, FiBell, FiMail, FiMoon, FiSun, FiX } from 'react-icons/fi'

const titles = {
  desk: 'Helpdesk',
  analytics: 'Analytics',
  tickets: 'Tickets',
  employees: 'Employees',
  settings: 'Settings',
  help: 'Help Center',
}

export default function Topbar({
  view,
  darkMode,
  onToggleTheme,
  onOpenSidebar,
  employeeId,
  onEmployeeChange,
}) {
  const [showMessages, setShowMessages] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleToggleMessages = () => {
    setShowMessages(!showMessages)
    setShowNotifications(false) // Close notifications when opening messages
  }

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications)
    setShowMessages(false) // Close messages when opening notifications
  }

  const messages = [
    { id: 1, from: 'John Support', text: 'Can you check the VPN issue?', time: '2 min ago' },
    { id: 2, from: 'Sarah Admin', text: 'License renewal needed', time: '1 hour ago' },
    { id: 3, from: 'Jane Tech', text: 'Email sync problem resolved', time: '3 hours ago' },
  ]

  const notifications = [
    { id: 1, title: 'Ticket Escalated', message: 'VPN Connection Issues (Critical)', time: '5 min ago', unread: true },
    { id: 2, title: 'Assignment Update', message: 'You were assigned to TK-1041', time: '30 min ago', unread: true },
    { id: 3, title: 'System Alert', message: 'Backup completed successfully', time: '2 hours ago', unread: false },
  ]
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-hope-border bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 md:px-6">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-hope-secondary hover:bg-hope-canvas lg:hidden dark:hover:bg-slate-800"
        aria-label="Open sidebar"
      >
        <FiMenu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold text-hope-ink dark:text-slate-100">
          {titles[view] || 'Dashboard'}
        </h1>
      </div>

      {/* Search */}
      <div className="relative ml-auto hidden max-w-xs flex-1 sm:block">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hope-secondary" />
        <input
          type="search"
          placeholder="Search..."
          className="h-10 w-full rounded-xl border border-hope-border bg-hope-canvas pl-9 pr-3 text-sm text-hope-ink outline-none transition focus:border-hope-primary focus:bg-white focus:ring-2 focus:ring-hope-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      {/* Employee ID */}
      <div className="hidden items-center gap-2 xl:flex">
        <input
          id="employeeId"
          value={employeeId}
          onChange={(event) => onEmployeeChange(event.target.value.trim())}
          placeholder="Employee UUID"
          className="h-10 w-52 rounded-xl border border-hope-border bg-hope-canvas px-3 text-sm text-hope-ink outline-none transition focus:border-hope-primary focus:bg-white focus:ring-2 focus:ring-hope-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-1 sm:ml-0">
        <button
          type="button"
          onClick={handleToggleMessages}
          className="relative rounded-xl p-2.5 text-hope-secondary transition hover:bg-hope-canvas dark:hover:bg-slate-800"
          aria-label="Messages"
        >
          <FiMail className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={handleToggleNotifications}
          className="relative rounded-xl p-2.5 text-hope-secondary transition hover:bg-hope-canvas dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <FiBell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-hope-danger" />
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-xl p-2.5 text-hope-secondary transition hover:bg-hope-canvas dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
        </button>

        <div className="ml-1 flex items-center gap-2 rounded-xl border border-hope-border py-1 pl-1 pr-3 dark:border-slate-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-hope-primary text-sm font-semibold text-white">
            IT
          </span>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-xs font-semibold text-hope-ink dark:text-slate-100">Support Agent</p>
            <p className="text-[11px] text-hope-secondary">Online</p>
          </div>
        </div>
      </div>

      {/* Messages Dropdown */}
      {showMessages && (
        <div className="absolute right-20 top-16 z-40 w-80 rounded-hope border border-hope-border bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-hope-border p-4 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-hope-ink dark:text-slate-100">Messages</h3>
              <button onClick={() => setShowMessages(false)} className="text-hope-secondary">
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {messages.length > 0 ? (
              messages.map(msg => (
                <div key={msg.id} className="border-b border-hope-border p-4 last:border-b-0 hover:bg-hope-canvas dark:border-slate-700 dark:hover:bg-slate-800">
                  <p className="font-semibold text-hope-ink dark:text-slate-100">{msg.from}</p>
                  <p className="mt-1 text-sm text-hope-secondary">{msg.text}</p>
                  <p className="mt-2 text-xs text-hope-secondary">{msg.time}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-hope-secondary">No messages</div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-4 top-16 z-40 w-96 rounded-hope border border-hope-border bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-hope-border p-4 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-hope-ink dark:text-slate-100">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="text-hope-secondary">
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <div key={notif.id} className={`border-b border-hope-border p-4 last:border-b-0 hover:bg-hope-canvas dark:border-slate-700 dark:hover:bg-slate-800 ${notif.unread ? 'bg-hope-primary/5 dark:bg-hope-primary/10' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-hope-ink dark:text-slate-100">{notif.title}</p>
                      <p className="mt-1 text-sm text-hope-secondary">{notif.message}</p>
                      <p className="mt-2 text-xs text-hope-secondary">{notif.time}</p>
                    </div>
                    {notif.unread && <span className="ml-2 h-2 w-2 rounded-full bg-hope-primary flex-shrink-0 mt-1" />}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-hope-secondary">No notifications</div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
