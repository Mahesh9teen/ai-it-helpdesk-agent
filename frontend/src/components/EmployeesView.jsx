import React, { useState } from 'react'
import { FiSearch, FiPhone, FiMail, FiMapPin } from 'react-icons/fi'

const departments = {
  'IT Support': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  'IT Infrastructure': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  'IT Security': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  'IT Management': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
}

export default function EmployeesView() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const employees = [
    { id: 1, name: 'John Smith', role: 'Senior Support Analyst', department: 'IT Support', email: 'john.smith@company.com', phone: '+1-555-0101', location: 'Building A - Floor 2' },
    { id: 2, name: 'Jane Williams', role: 'IT Infrastructure Engineer', department: 'IT Infrastructure', email: 'jane.williams@company.com', phone: '+1-555-0102', location: 'Building B - Floor 1' },
    { id: 3, name: 'Mike Johnson', role: 'Support Specialist', department: 'IT Support', email: 'mike.johnson@company.com', phone: '+1-555-0103', location: 'Building A - Floor 3' },
    { id: 4, name: 'Sarah Davis', role: 'System Administrator', department: 'IT Infrastructure', email: 'sarah.davis@company.com', phone: '+1-555-0104', location: 'Building B - Floor 2' },
    { id: 5, name: 'David Miller', role: 'Security Analyst', department: 'IT Security', email: 'david.miller@company.com', phone: '+1-555-0105', location: 'Building C - Floor 1' },
    { id: 6, name: 'Emma Wilson', role: 'IT Manager', department: 'IT Management', email: 'emma.wilson@company.com', phone: '+1-555-0106', location: 'Building B - Floor 3' },
  ]

  const filtered = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <article className="hope-card p-6">
        <h2 className="text-2xl font-bold text-hope-ink dark:text-slate-100">Employee Directory</h2>
        <p className="mt-1 text-hope-secondary">View and manage IT team members</p>
      </article>

      {/* Search */}
      <article className="hope-card p-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-3 text-hope-secondary" />
          <input
            type="text"
            placeholder="Search by name, role, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-hope border border-hope-border bg-white pl-10 pr-4 py-2 text-hope-ink placeholder-hope-secondary transition focus:border-hope-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </article>

      {/* Employee Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(emp => (
          <article key={emp.id} className="hope-card p-6 transition hover:shadow-lg dark:hover:shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hope-primary text-white font-bold">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-hope-ink dark:text-slate-100">{emp.name}</h3>
                    <p className="text-sm text-hope-secondary">{emp.role}</p>
                  </div>
                </div>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ml-2 ${departments[emp.department]}`}>
                {emp.department}
              </span>
            </div>
            
            <div className="mt-4 space-y-2 border-t border-hope-border pt-4 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm text-hope-secondary">
                <FiMail className="h-4 w-4" />
                <a href={`mailto:${emp.email}`} className="hover:text-hope-primary">{emp.email}</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-hope-secondary">
                <FiPhone className="h-4 w-4" />
                <span>{emp.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-hope-secondary">
                <FiMapPin className="h-4 w-4" />
                <span>{emp.location}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <article className="hope-card p-8 text-center">
          <p className="text-hope-secondary">No employees found</p>
        </article>
      )}
    </div>
  )
}
