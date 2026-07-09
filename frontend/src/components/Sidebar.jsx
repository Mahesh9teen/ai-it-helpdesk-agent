import React from 'react'
import {
  FiGrid,
  FiMessageSquare,
  FiBarChart2,
  FiInbox,
  FiUsers,
  FiSettings,
  FiHelpCircle,
  FiX,
  FiAlertOctagon,
  FiRadio,
  FiAward,
  FiLink,
  FiSearch,
  FiCpu,
  FiGitBranch,
  FiGitPullRequest,
  FiBook,
  FiBell,
  FiBold,
  FiHardDrive,
  FiHome,
  FiShoppingCart,
  FiActivity,
  FiUserPlus,
  FiGitMerge,
  FiPieChart,
  FiAlertTriangle,
  FiShield,
  FiDatabase,
  FiHardDrive as FiHd2,
  FiTerminal,
  FiDollarSign,
  FiZap as FiBrain,
  FiTarget,
  FiPackage,
  FiColumns as FiLayout,
  FiFileText,
  FiUsers as FiUsersGroup,
  FiWifi,
  FiShare2,
  FiTrendingUp,
} from 'react-icons/fi'

let FiGraph = FiShare2

const primaryNav = [
  { id: 'desk', label: 'Helpdesk', icon: FiMessageSquare },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { id: 'search', label: 'Smart Search', icon: FiSearch },
]

const secondaryNav = [
  { id: 'tickets', label: 'Tickets', icon: FiInbox },
  { id: 'employees', label: 'Employees', icon: FiUsers },
  { id: 'settings', label: 'Settings', icon: FiSettings },
  { id: 'help', label: 'Help Center', icon: FiHelpCircle },
]

const employeeNav = [
  { id: 'employee-portal', label: 'My IT Portal', icon: FiHome },
  { id: 'service-catalog', label: 'Service Catalog', icon: FiShoppingCart },
  { id: 'system-status',   label: 'System Status',   icon: FiActivity },
  { id: 'onboarding',      label: 'Onboarding',       icon: FiUserPlus },
]

const powerNav = [
  { id: 'live-ops',         label: 'Live Command Center',    icon: FiRadio },
  { id: 'ai-resolve',       label: 'AI Resolution Engine',   icon: FiCpu },
  { id: 'workflow-builder', label: 'Workflow Builder',       icon: FiGitMerge },
  { id: 'report-builder',   label: 'Report Builder',         icon: FiPieChart },
  { id: 'problem-mgmt',     label: 'Problem Management',     icon: FiAlertTriangle },
]

const enterpriseNav = [
  { id: 'security-audit', label: 'Security Audit',       icon: FiShield },
  { id: 'cmdb',           label: 'CMDB Viewer',           icon: FiDatabase },
  { id: 'device-health',  label: 'Device Health',         icon: FiHd2 },
  { id: 'chatops',        label: 'ChatOps Console',       icon: FiTerminal },
  { id: 'cost-insights',  label: 'Cost Insights',         icon: FiDollarSign },
]

const intelligenceNav = [
  { id: 'predictive',   label: 'Predictive Analytics', icon: FiBrain },
  { id: 'risk-matrix',  label: 'Risk Matrix',           icon: FiTarget },
  { id: 'vendors',      label: 'Vendor Management',     icon: FiPackage },
  { id: 'kanban',       label: 'Kanban Board',          icon: FiLayout },
  { id: 'audit-trail',  label: 'Audit Trail',           icon: FiFileText },
  { id: 'capacity',     label: 'Capacity Planning',     icon: FiUsersGroup },
]
const advancedNav2 = [
  { id: 'msp-portal',      label: 'MSP Client Portal',   icon: FiGrid },
  { id: 'compliance',      label: 'Compliance Center',   icon: FiShield },
  { id: 'network-topology',label: 'Network Topology',    icon: FiWifi },
  { id: 'postmortem',      label: 'Incident Postmortem', icon: FiFileText },
  { id: 'sla-contracts',   label: 'SLA Contracts',       icon: FiBarChart2 },
  { id: 'knowledge-graph', label: 'Knowledge Graph',     icon: FiGraph },
]
const advancedNav3 = [
  { id: 'cloud-costs',      label: 'Cloud Cost Optimizer', icon: FiDollarSign },
  { id: 'security-threats', label: 'Security Threats',     icon: FiShield },
  { id: 'change-impact',    label: 'Change Impact',        icon: FiGitBranch },
  { id: 'workforce',        label: 'Workforce Analytics',  icon: FiUsers },
  { id: 'vendor-sla',       label: 'Vendor SLA Tracker',   icon: FiAward },
  { id: 'automation-roi',   label: 'Automation ROI',       icon: FiTrendingUp },
]
const advancedNav = [
  { id: 'sla', label: 'SLA Heatmap', icon: FiAlertOctagon },
  { id: 'incidents', label: 'War Room', icon: FiRadio },
  { id: 'leaderboard', label: 'Agent Leaderboard', icon: FiAward },
  { id: 'integrations', label: 'Integrations', icon: FiLink },
  { id: 'ai-enrich', label: 'AI Enrichment', icon: FiCpu },
  { id: 'auto-assign', label: 'Auto-Assign', icon: FiGitBranch },
  { id: 'change-mgmt', label: 'Change Mgmt', icon: FiGitPullRequest },
  { id: 'kb', label: 'Knowledge Base', icon: FiBook },
  { id: 'analytics-advanced', label: 'Advanced Analytics', icon: FiBarChart2 },
  { id: 'templates', label: 'Ticket Templates', icon: FiLink },
  { id: 'bulk', label: 'Bulk Operations', icon: FiBold },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'assets', label: 'Asset Management', icon: FiHardDrive },
]

export default function Sidebar({ view, onNavigate, open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-hope-border bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-hope-border px-5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hope-primary text-white shadow-hope">
              <FiGrid className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-hope-ink dark:text-slate-100">
              Helpdesk<span className="text-hope-primary">AI</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-hope-secondary hover:bg-hope-canvas lg:hidden dark:hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-hope-secondary/70">
              Menu
            </p>
            {primaryNav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`hope-nav-link w-full ${view === id ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-hope-secondary/70">
              Workspace
            </p>
            {secondaryNav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`hope-nav-link w-full ${view === id ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-hope-secondary/70">
              Employee Tools
            </p>
            {employeeNav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`hope-nav-link w-full ${view === id ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-hope-secondary/70">
              Advanced
            </p>
            {advancedNav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`hope-nav-link w-full ${view === id ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-hope-secondary/70">
              Power Tools ⚡
            </p>
            {powerNav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`hope-nav-link w-full ${view === id ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-hope-secondary/70">
              Enterprise 🏢
            </p>
            {enterpriseNav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`hope-nav-link w-full ${view === id ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-hope-secondary/70">
              Intelligence 🧠
            </p>
            {intelligenceNav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`hope-nav-link w-full ${view === id ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-hope-secondary/70">
              Advanced II
            </p>
            {advancedNav2.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`hope-nav-link w-full ${view === id ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-hope-secondary/70">
              Advanced III 📊
            </p>
            {advancedNav3.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`hope-nav-link w-full ${view === id ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
}
