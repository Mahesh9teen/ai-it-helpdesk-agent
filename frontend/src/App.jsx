import ChatWindow from './components/ChatWindow.jsx'
import TicketPanel from './components/TicketPanel.jsx'
import AnalyticsDashboard from './components/AnalyticsDashboard.jsx'
import TicketsView from './components/TicketsView.jsx'
import EmployeesView from './components/EmployeesView.jsx'
import SettingsViewNew from './components/SettingsViewNew.jsx'
import HelpView from './components/HelpView.jsx'
import ApiHealthBanner from './components/ApiHealthBanner.jsx'
import HopeLayout from './components/HopeLayout.jsx'
import SLAHeatmap from './components/SLAHeatmap.jsx'
import IncidentWarRoom from './components/IncidentWarRoom.jsx'
import AgentLeaderboard from './components/AgentLeaderboard.jsx'
import IntegrationHub from './components/IntegrationHub.jsx'
import SmartSearch from './components/SmartSearch.jsx'
import AITicketEnrichment from './components/AITicketEnrichment.jsx'
import AutoAssignEngine from './components/AutoAssignEngine.jsx'
import ChangeManagement from './components/ChangeManagement.jsx'
import KnowledgeBaseManager from './components/KnowledgeBaseManager.jsx'
import AdvancedAnalyticsDashboard from './components/AdvancedAnalyticsDashboard.jsx'
import TicketTemplates from './components/TicketTemplates.jsx'
import BulkOperations from './components/BulkOperations.jsx'
import NotificationCenter from './components/NotificationCenter.jsx'
import AssetManagement from './components/AssetManagement.jsx'
import EmployeePortal from './components/EmployeePortal.jsx'
import ITServiceCatalog from './components/ITServiceCatalog.jsx'
import SystemStatusPage from './components/SystemStatusPage.jsx'
import OnboardingWizard from './components/OnboardingWizard.jsx'
import LiveCommandCenter from './components/LiveCommandCenter.jsx'
import AIResolutionEngine from './components/AIResolutionEngine.jsx'
import VisualWorkflowBuilder from './components/VisualWorkflowBuilder.jsx'
import ReportBuilder from './components/ReportBuilder.jsx'
import ProblemManagement from './components/ProblemManagement.jsx'
import SecurityAuditCenter from './components/SecurityAuditCenter.jsx'
import CMDBViewer from './components/CMDBViewer.jsx'
import DeviceHealthCenter from './components/DeviceHealthCenter.jsx'
import ChatOpsConsole from './components/ChatOpsConsole.jsx'
import CostInsightsDashboard from './components/CostInsightsDashboard.jsx'
import PredictiveAnalytics from './components/PredictiveAnalytics.jsx'
import RiskMatrix from './components/RiskMatrix.jsx'
import VendorManagement from './components/VendorManagement.jsx'
import AdvancedKanban from './components/AdvancedKanban.jsx'
import AuditTrailViewer from './components/AuditTrailViewer.jsx'
import CapacityPlanning from './components/CapacityPlanning.jsx'
import MSPPortal from './components/MSPPortal.jsx'
import ComplianceCenter from './components/ComplianceCenter.jsx'
import NetworkTopology from './components/NetworkTopology.jsx'
import IncidentPostmortem from './components/IncidentPostmortem.jsx'
import SLAContractsEngine from './components/SLAContractsEngine.jsx'
import KnowledgeGraph from './components/KnowledgeGraph.jsx'
import CloudCostOptimizer from './components/CloudCostOptimizer.jsx'
import SecurityThreatsCenter from './components/SecurityThreatsCenter.jsx'
import ChangeImpactAnalysis from './components/ChangeImpactAnalysis.jsx'
import WorkforceProductivity from './components/WorkforceProductivity.jsx'
import VendorSLATracker from './components/VendorSLATracker.jsx'
import AutomationROICalculator from './components/AutomationROICalculator.jsx'
import React from 'react'
import { useEffect, useState } from 'react'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [view, setView] = useState('desk')

  useEffect(() => {
    const storedTheme = localStorage.getItem('helpdesk-theme')
    const storedEmployee = localStorage.getItem('helpdesk-employee-id')
    if (storedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
    if (storedEmployee) {
      setEmployeeId(storedEmployee)
    }
  }, [])

  const toggleTheme = () => {
    const nextMode = !darkMode
    setDarkMode(nextMode)
    document.documentElement.classList.toggle('dark', nextMode)
    localStorage.setItem('helpdesk-theme', nextMode ? 'dark' : 'light')
  }

  const onEmployeeChange = (value) => {
    setEmployeeId(value)
    localStorage.setItem('helpdesk-employee-id', value)
  }

  return (
    <HopeLayout
      view={view}
      onNavigate={setView}
      darkMode={darkMode}
      onToggleTheme={toggleTheme}
      employeeId={employeeId}
      onEmployeeChange={onEmployeeChange}
    >
      <ApiHealthBanner />

      {view === 'analytics' ? (
        <AnalyticsDashboard />
      ) : view === 'tickets' ? (
        <TicketsView />
      ) : view === 'employees' ? (
        <EmployeesView />
      ) : view === 'settings' ? (
        <SettingsViewNew />
      ) : view === 'help' ? (
        <HelpView />
      ) : view === 'sla' ? (
        <SLAHeatmap />
      ) : view === 'incidents' ? (
        <IncidentWarRoom />
      ) : view === 'leaderboard' ? (
        <AgentLeaderboard />
      ) : view === 'integrations' ? (
        <IntegrationHub />
      ) : view === 'search' ? (
        <SmartSearch />
      ) : view === 'ai-enrich' ? (
        <AITicketEnrichment />
      ) : view === 'auto-assign' ? (
        <AutoAssignEngine />
      ) : view === 'change-mgmt' ? (
        <ChangeManagement />
      ) : view === 'kb' ? (
        <KnowledgeBaseManager />
      ) : view === 'analytics-advanced' ? (
        <AdvancedAnalyticsDashboard />
      ) : view === 'templates' ? (
        <TicketTemplates />
      ) : view === 'bulk' ? (
        <BulkOperations />
      ) : view === 'notifications' ? (
        <NotificationCenter />
      ) : view === 'assets' ? (
        <AssetManagement />
      ) : view === 'employee-portal' ? (
        <EmployeePortal />
      ) : view === 'service-catalog' ? (
        <ITServiceCatalog />
      ) : view === 'system-status' ? (
        <SystemStatusPage />
      ) : view === 'onboarding' ? (
        <OnboardingWizard />
      ) : view === 'live-ops' ? (
        <LiveCommandCenter />
      ) : view === 'ai-resolve' ? (
        <AIResolutionEngine />
      ) : view === 'workflow-builder' ? (
        <VisualWorkflowBuilder />
      ) : view === 'report-builder' ? (
        <ReportBuilder />
      ) : view === 'problem-mgmt' ? (
        <ProblemManagement />
      ) : view === 'security-audit' ? (
        <SecurityAuditCenter />
      ) : view === 'cmdb' ? (
        <CMDBViewer />
      ) : view === 'device-health' ? (
        <DeviceHealthCenter />
      ) : view === 'chatops' ? (
        <ChatOpsConsole />
      ) : view === 'cost-insights' ? (
        <CostInsightsDashboard />
      ) : view === 'predictive' ? (
        <PredictiveAnalytics />
      ) : view === 'risk-matrix' ? (
        <RiskMatrix />
      ) : view === 'vendors' ? (
        <VendorManagement />
      ) : view === 'kanban' ? (
        <AdvancedKanban />
      ) : view === 'audit-trail' ? (
        <AuditTrailViewer />
      ) : view === 'capacity' ? (
        <CapacityPlanning />
      ) : view === 'msp-portal' ? (
        <MSPPortal />
      ) : view === 'compliance' ? (
        <ComplianceCenter />
      ) : view === 'network-topology' ? (
        <NetworkTopology />
      ) : view === 'postmortem' ? (
        <IncidentPostmortem />
      ) : view === 'sla-contracts' ? (
        <SLAContractsEngine />
      ) : view === 'knowledge-graph' ? (
        <KnowledgeGraph />
      ) : view === 'cloud-costs' ? (
        <CloudCostOptimizer />
      ) : view === 'security-threats' ? (
        <SecurityThreatsCenter />
      ) : view === 'change-impact' ? (
        <ChangeImpactAnalysis />
      ) : view === 'workforce' ? (
        <WorkforceProductivity />
      ) : view === 'vendor-sla' ? (
        <VendorSLATracker />
      ) : view === 'automation-roi' ? (
        <AutomationROICalculator />
      ) : (
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_0.85fr]">
          <ChatWindow employeeId={employeeId} />
          <TicketPanel employeeId={employeeId} />
        </section>
      )}
    </HopeLayout>
  )
}
