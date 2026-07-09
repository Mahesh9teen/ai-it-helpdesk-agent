import { useState } from 'react'
import {
  FiUser, FiMonitor, FiWifi, FiLock, FiMail, FiShield,
  FiCheckCircle, FiCircle, FiChevronRight, FiAward,
  FiBook, FiSliders, FiPhone, FiDownload, FiVideo
} from 'react-icons/fi'

/* ─────────────── Step Data ─────────────── */
const ONBOARDING_STEPS = [
  {
    id: 'profile',
    step: 1,
    title: 'Complete Your IT Profile',
    icon: FiUser,
    color: 'bg-indigo-100 text-indigo-600',
    description: 'Set up your IT profile so we can tailor your workspace.',
    tasks: [
      { id: 'p1', text: 'Confirm your full name and job title', required: true },
      { id: 'p2', text: 'Verify your company email address', required: true },
      { id: 'p3', text: 'Add your mobile number for IT alerts', required: false },
      { id: 'p4', text: 'Set your preferred contact method', required: false },
    ],
    tip: '💡 Your IT profile helps us prioritise and route your support requests correctly.',
  },
  {
    id: 'device',
    step: 2,
    title: 'Set Up Your Computer',
    icon: FiMonitor,
    color: 'bg-blue-100 text-blue-600',
    description: 'Configure your company laptop or desktop for daily work.',
    tasks: [
      { id: 'd1', text: 'Power on your device and complete initial setup wizard', required: true },
      { id: 'd2', text: 'Sign in to Windows / macOS with your company account', required: true },
      { id: 'd3', text: 'Run Windows Update / Software Update and restart', required: true },
      { id: 'd4', text: 'Install company endpoint protection (CrowdStrike / Defender)', required: true },
      { id: 'd5', text: 'Enable BitLocker / FileVault full disk encryption', required: true },
      { id: 'd6', text: 'Adjust display, keyboard, and trackpad settings', required: false },
    ],
    tip: '💡 If you need a different monitor or peripheral, submit a request via the IT Service Catalog.',
  },
  {
    id: 'network',
    step: 3,
    title: 'Connect to the Network',
    icon: FiWifi,
    color: 'bg-green-100 text-green-600',
    description: 'Connect to office WiFi and configure remote access (VPN).',
    tasks: [
      { id: 'n1', text: 'Connect to "CompanyWiFi" using your company credentials', required: true },
      { id: 'n2', text: 'Install and configure Cisco AnyConnect / GlobalProtect VPN', required: true },
      { id: 'n3', text: 'Test VPN connection from outside the office network', required: true },
      { id: 'n4', text: 'Configure network printer (see floor map)', required: false },
    ],
    tip: '💡 VPN setup guide: Browse the Knowledge Base → "Configure VPN on Windows & Mac".',
    resource: { label: 'VPN Setup Guide', icon: FiBook },
  },
  {
    id: 'accounts',
    step: 4,
    title: 'Set Up Your Accounts',
    icon: FiLock,
    color: 'bg-purple-100 text-purple-600',
    description: 'Configure all work accounts and passwords securely.',
    tasks: [
      { id: 'a1', text: 'Set a strong password for your AD account (min 12 chars)', required: true },
      { id: 'a2', text: 'Enable multi-factor authentication (Microsoft Authenticator)', required: true },
      { id: 'a3', text: 'Save emergency backup codes in a secure location', required: true },
      { id: 'a4', text: 'Register your device in Azure AD', required: true },
      { id: 'a5', text: 'Sign in to company password manager (1Password / LastPass)', required: false },
    ],
    tip: '💡 Never share your password with anyone, including IT staff. We will never ask for it.',
  },
  {
    id: 'email',
    step: 5,
    title: 'Configure Email & Calendar',
    icon: FiMail,
    color: 'bg-orange-100 text-orange-600',
    description: 'Set up Outlook, Teams, and calendar for daily communication.',
    tasks: [
      { id: 'e1', text: 'Install and sign in to Microsoft Outlook', required: true },
      { id: 'e2', text: 'Set up your email signature (use company template)', required: true },
      { id: 'e3', text: 'Install Microsoft Teams desktop app', required: true },
      { id: 'e4', text: 'Join your team channel in Microsoft Teams', required: true },
      { id: 'e5', text: 'Set up calendar & accept recurring team meetings', required: true },
      { id: 'e6', text: 'Configure Outlook mobile app on personal phone (optional)', required: false },
    ],
    tip: '💡 Your manager will share the team channels you need to join on your first day.',
  },
  {
    id: 'software',
    step: 6,
    title: 'Install Required Software',
    icon: FiDownload,
    color: 'bg-teal-100 text-teal-600',
    description: 'Install software packages required for your role.',
    tasks: [
      { id: 's1', text: 'Install Microsoft 365 apps (Word, Excel, PowerPoint)', required: true },
      { id: 's2', text: 'Install role-specific software (see your manager\'s checklist)', required: true },
      { id: 's3', text: 'Request additional tools via the IT Service Catalog', required: false },
      { id: 's4', text: 'Test all required apps and confirm they open correctly', required: true },
    ],
    tip: '💡 All software requests must go through the IT Service Catalog — do not download from the internet.',
    resource: { label: 'Service Catalog', icon: FiSliders },
  },
  {
    id: 'security',
    step: 7,
    title: 'Complete Security Training',
    icon: FiShield,
    color: 'bg-red-100 text-red-600',
    description: 'Complete mandatory security awareness training.',
    tasks: [
      { id: 'sec1', text: 'Watch: "Phishing & Social Engineering" (15 min)', required: true },
      { id: 'sec2', text: 'Watch: "Data Classification & Handling" (10 min)', required: true },
      { id: 'sec3', text: 'Watch: "Acceptable Use Policy" (8 min)', required: true },
      { id: 'sec4', text: 'Pass the security knowledge check (score ≥ 80%)', required: true },
      { id: 'sec5', text: 'Sign the IT Acceptable Use Policy digitally', required: true },
    ],
    tip: '💡 Security training must be completed within your first 5 working days.',
    resource: { label: 'Training Portal', icon: FiVideo },
  },
  {
    id: 'verify',
    step: 8,
    title: 'Final Verification',
    icon: FiCheckCircle,
    color: 'bg-green-100 text-green-600',
    description: 'Confirm everything is working before your IT setup is signed off.',
    tasks: [
      { id: 'v1', text: 'Send a test email to your manager', required: true },
      { id: 'v2', text: 'Make a test Teams call or video call', required: true },
      { id: 'v3', text: 'Log in to all required systems and confirm access', required: true },
      { id: 'v4', text: 'Confirm you know how to submit an IT support ticket', required: true },
      { id: 'v5', text: 'Book IT orientation call with your IT buddy (if assigned)', required: false },
    ],
    tip: '🎉 Once complete, your IT setup is finished! Bookmark the Employee IT Portal for future help.',
  },
]

const EMPLOYEE = { name: 'Jamie Rivera', startDate: '2026-07-07', department: 'Product', itBuddy: 'Sarah Mitchell' }

/* ─────────── Main Component ─────────── */
export default function OnboardingWizard() {
  const [checked, setChecked] = useState({})
  const [activeStep, setActiveStep] = useState(0)

  const toggle = (taskId) => setChecked(prev => ({ ...prev, [taskId]: !prev[taskId] }))

  const stepProgress = (step) => {
    const total = step.tasks.length
    const done = step.tasks.filter(t => checked[t.id]).length
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
  }

  const totalTasks = ONBOARDING_STEPS.flatMap(s => s.tasks).length
  const totalDone = ONBOARDING_STEPS.flatMap(s => s.tasks).filter(t => checked[t.id]).length
  const overallPct = Math.round((totalDone / totalTasks) * 100)

  const currentStep = ONBOARDING_STEPS[activeStep]
  const { done, total, pct } = stepProgress(currentStep)
  const Icon = currentStep.icon

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 p-6 text-white">
        <h1 className="text-2xl font-bold">🎉 Welcome to the Team, {EMPLOYEE.name.split(' ')[0]}!</h1>
        <p className="mt-1 opacity-90">IT Onboarding Checklist · Start Date: {EMPLOYEE.startDate} · {EMPLOYEE.department}</p>
        <p className="text-sm opacity-80 mt-1">Your IT Buddy: <strong>{EMPLOYEE.itBuddy}</strong></p>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Overall Progress</span>
            <span>{totalDone} / {totalTasks} tasks ({overallPct}%)</span>
          </div>
          <div className="h-3 rounded-full bg-white/20">
            <div className="h-3 rounded-full bg-white transition-all duration-500" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
        {overallPct === 100 && (
          <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 text-sm">
            <FiAward className="text-yellow-300 text-xl" />
            <span>🎊 IT Onboarding Complete! You're all set up.</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Steps Sidebar */}
        <div className="space-y-2">
          {ONBOARDING_STEPS.map((s, i) => {
            const { done, total, pct } = stepProgress(s)
            const SIcon = s.icon
            const isComplete = done === total
            const isActive = i === activeStep
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(i)}
                className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all border
                  ${isActive ? 'border-indigo-400 bg-indigo-50 shadow-sm' : isComplete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.color}`}>
                  {isComplete ? <FiCheckCircle className="text-green-600 text-lg" /> : <SIcon className="text-lg" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? 'text-indigo-800' : 'text-gray-700'}`}>{s.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex-1 h-1 rounded-full bg-gray-200">
                      <div className={`h-1 rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-indigo-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{done}/{total}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Step Detail */}
        <div className="rounded-2xl border border-gray-200 p-6 bg-white">
          {/* Step Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${currentStep.color}`}>
              <Icon className="text-3xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Step {currentStep.step} of {ONBOARDING_STEPS.length}</p>
              <h2 className="text-xl font-bold text-gray-800">{currentStep.title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{currentStep.description}</p>
            </div>
          </div>

          {/* Step Progress */}
          <div className="mb-5">
            <div className="flex justify-between text-sm text-gray-500 mb-1"><span>Progress</span><span>{done}/{total} tasks</span></div>
            <div className="h-2.5 rounded-full bg-gray-100">
              <div className="h-2.5 rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-3 mb-6">
            {currentStep.tasks.map(task => (
              <label key={task.id} className="flex items-start gap-3 cursor-pointer group rounded-lg p-2 hover:bg-gray-50 transition-colors">
                <div className="mt-0.5 shrink-0">
                  {checked[task.id]
                    ? <FiCheckCircle className="text-green-500 text-xl" />
                    : <FiCircle className="text-gray-300 text-xl group-hover:text-gray-400" />
                  }
                </div>
                <input type="checkbox" className="sr-only" checked={!!checked[task.id]} onChange={() => toggle(task.id)} />
                <div className="flex-1">
                  <span className={`text-sm ${checked[task.id] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.text}
                  </span>
                  {task.required && !checked[task.id] && (
                    <span className="ml-2 text-xs text-red-500 font-medium">Required</span>
                  )}
                  {task.required && checked[task.id] && (
                    <span className="ml-2 text-xs text-green-600 font-medium">✓ Done</span>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Tip */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-5 text-sm text-amber-800">
            {currentStep.tip}
          </div>

          {/* Resource Link */}
          {currentStep.resource && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 mb-5 flex items-center gap-2 text-sm text-blue-700">
              <currentStep.resource.icon />
              <span>Quick link: <strong>{currentStep.resource.label}</strong></span>
              <FiChevronRight className="ml-auto" />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => setActiveStep(Math.min(ONBOARDING_STEPS.length - 1, activeStep + 1))}
              disabled={activeStep === ONBOARDING_STEPS.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next Step <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
