import React, { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function HopeLayout({
  view,
  onNavigate,
  darkMode,
  onToggleTheme,
  employeeId,
  onEmployeeChange,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNavigate = (id) => {
    onNavigate(id)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-hope-canvas dark:bg-slate-950">
      <Sidebar
        view={view}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar
          view={view}
          darkMode={darkMode}
          onToggleTheme={onToggleTheme}
          onOpenSidebar={() => setSidebarOpen(true)}
          employeeId={employeeId}
          onEmployeeChange={onEmployeeChange}
        />
        <main className="px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
