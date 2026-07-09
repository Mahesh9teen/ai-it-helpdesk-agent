import React, { useState } from 'react'
import { FiBell, FiLock, FiSliders, FiCheckCircle, FiX, FiCopy, FiCheck } from 'react-icons/fi'
import AdvancedFilters from './AdvancedFilters'
import RolePermissions from './RolePermissions'
import RecoveryCodes from './RecoveryCodes'
import SMSVerification from './SMSVerification'
import TimeTracker from './TimeTracker'
import ServiceTemplates from './ServiceTemplates'
import ChatHistory from './ChatHistory'
import NotificationPreferences from './NotificationPreferences'
import WorkflowAutomation from './WorkflowAutomation'

export default function SettingsViewNew() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    autoAssign: true,
    emailNotifications: true,
    slackIntegration: false,
    autoEscalate: true,
    aiSuggestions: true,
    darkMode: false,
    priorityAutoAssign: true,
    dailyDigest: true
  })

  const [twoFAModal, setTwoFAModal] = useState(false)
  const [twoFAStep, setTwoFAStep] = useState(1)
  const [twoFAMethod, setTwoFAMethod] = useState(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [copied, setCopied] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [codeAttempts, setCodeAttempts] = useState(0)

  // Base32 decoder for TOTP
  const base32Decode = (base32) => {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    const cleanBase32 = base32.replace(/=/g, '').toUpperCase()
    let bits = ''
    for (let i = 0; i < cleanBase32.length; i++) {
      const val = base32chars.indexOf(cleanBase32[i])
      bits += val.toString(2).padStart(5, '0')
    }
    const bytes = []
    for (let i = 0; i < bits.length; i += 8) {
      bytes.push(parseInt(bits.substr(i, 8), 2))
    }
    return bytes
  }

  // TOTP verification
  const verifyTOTP = (secret, token) => {
    const secretBytes = base32Decode(secret)
    const timeCounter = Math.floor(Date.now() / 1000 / 30)
    
    for (let i = -1; i <= 1; i++) {
      let counter = timeCounter + i
      const counterBytes = new Uint8Array(8)
      for (let j = 7; j >= 0; j--) {
        counterBytes[j] = counter & 0xff
        counter = Math.floor(counter / 256)
      }

      const hmac = new Uint8Array(20)
      let carry = 0
      for (let j = 19; j >= 0; j--) {
        let sum = secretBytes[j] + carry
        hmac[j] = sum & 0xff
        carry = sum >> 8
      }

      let totp = 0
      const offset = hmac[19] & 0x0f
      for (let j = 0; j < 4; j++) {
        totp = (totp << 8) | hmac[offset + j]
      }
      totp = (totp & 0x7fffffff) % 1000000

      if (totp.toString().padStart(6, '0') === token) {
        return true
      }
    }
    return false
  }

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const selectTwoFAMethod = (method) => {
    setTwoFAMethod(method)
    setTwoFAStep(2)
  }

  const closeTwoFAModal = () => {
    setTwoFAModal(false)
    setTwoFAStep(1)
    setTwoFAMethod(null)
    setVerificationCode('')
    setCodeError('')
    setCodeAttempts(0)
  }

  const copySecret = () => {
    navigator.clipboard.writeText('JBSWY3DPEBLW64TMMQ======')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const verify2FA = () => {
    if (verificationCode.length !== 6) return

    if (!verifyTOTP('JBSWY3DPEBLW64TMMQ', verificationCode)) {
      const attempts = codeAttempts + 1
      setCodeAttempts(attempts)
      
      if (attempts >= 3) {
        setCodeError('Too many failed attempts')
        setTimeout(closeTwoFAModal, 2000)
      } else {
        setCodeError(`Invalid code. ${3 - attempts} attempts remaining`)
      }
    } else {
      setTwoFAStep(3)
      setIs2FAEnabled(true)
      setTimeout(closeTwoFAModal, 2000)
    }
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'advanced', label: 'Advanced' }
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <article className="hope-card p-6">
        <h2 className="text-2xl font-bold text-hope-ink dark:text-slate-100">System Settings</h2>
        <p className="mt-1 text-hope-secondary">Configure system preferences and integrations</p>
      </article>

      {/* Tabs */}
      <div className="border-b border-hope-border dark:border-slate-700 overflow-x-auto">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-hope-primary text-hope-primary'
                  : 'border-transparent text-hope-secondary hover:text-hope-ink dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-5">
          {/* Automation Settings */}
          <article className="hope-card p-6">
            <div className="flex items-center gap-3 border-b border-hope-border pb-4 dark:border-slate-700">
              <FiSliders className="h-5 w-5 text-hope-primary" />
              <h3 className="text-lg font-semibold text-hope-ink dark:text-slate-100">Automation</h3>
            </div>
            <div className="mt-6 space-y-4">
              {[
                { key: 'autoAssign', label: 'Auto-assign tickets', desc: 'Automatically distribute incoming tickets' },
                { key: 'priorityAutoAssign', label: 'Prioritize critical', desc: 'Route high-priority issues to senior staff' },
                { key: 'autoEscalate', label: 'Auto-escalate', desc: 'Escalate tickets exceeding SLA' },
                { key: 'aiSuggestions', label: 'AI suggestions', desc: 'Show AI-powered solutions' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-hope border border-hope-border p-4 dark:border-slate-700">
                  <div>
                    <p className="font-semibold text-hope-ink dark:text-slate-100">{item.label}</p>
                    <p className="text-sm text-hope-secondary">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.key)}
                    className={`relative inline-block h-6 w-11 rounded-full transition ${settings[item.key] ? 'bg-hope-success' : 'bg-hope-secondary'}`}
                  >
                    <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition transform ${settings[item.key] ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </article>

          {/* Notification Settings */}
          <article className="hope-card p-6">
            <div className="flex items-center gap-3 border-b border-hope-border pb-4 dark:border-slate-700">
              <FiBell className="h-5 w-5 text-hope-warning" />
              <h3 className="text-lg font-semibold text-hope-ink dark:text-slate-100">Notifications</h3>
            </div>
            <div className="mt-6 space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email alerts', desc: 'Receive email for ticket updates' },
                { key: 'slackIntegration', label: 'Slack integration', desc: 'Send notifications to Slack' },
                { key: 'dailyDigest', label: 'Daily digest', desc: 'Receive daily summary' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-hope border border-hope-border p-4 dark:border-slate-700">
                  <div>
                    <p className="font-semibold text-hope-ink dark:text-slate-100">{item.label}</p>
                    <p className="text-sm text-hope-secondary">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.key)}
                    className={`relative inline-block h-6 w-11 rounded-full transition ${settings[item.key] ? 'bg-hope-success' : 'bg-hope-secondary'}`}
                  >
                    <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition transform ${settings[item.key] ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </article>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-5">
          <article className="hope-card p-6">
            <div className="flex items-center gap-3 border-b border-hope-border pb-4 dark:border-slate-700">
              <FiLock className="h-5 w-5 text-hope-danger" />
              <h3 className="text-lg font-semibold text-hope-ink dark:text-slate-100">Security</h3>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-hope border border-hope-border p-4 dark:border-slate-700">
                <p className="font-semibold text-hope-ink dark:text-slate-100">Change Password</p>
                <p className="mt-1 text-sm text-hope-secondary">Update your account password</p>
                <button className="mt-4 hope-btn-primary">Update Password</button>
              </div>

              <div className="rounded-hope border border-hope-border p-4 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-hope-ink dark:text-slate-100">Two-Factor Authentication</p>
                    <p className="mt-1 text-sm text-hope-secondary">Add extra security to your account</p>
                  </div>
                  <button
                    onClick={() => setTwoFAModal(true)}
                    className={`hope-btn-primary ${is2FAEnabled ? 'bg-hope-success hover:bg-hope-success/80' : ''}`}
                  >
                    {is2FAEnabled ? <FiCheckCircle className="inline mr-2" /> : ''}
                    {is2FAEnabled ? 'Enabled' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* Advanced Tab - Enterprise Features */}
      {activeTab === 'advanced' && (
        <div className="space-y-5">
          <TimeTracker />
          <AdvancedFilters />
          <RolePermissions />
          <NotificationPreferences />
          <ServiceTemplates />
          <ChatHistory />
          <WorkflowAutomation />
          <RecoveryCodes />
        </div>
      )}

      {/* 2FA Modal */}
      {twoFAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <article className="hope-card w-full max-w-md p-6 dark:bg-slate-900">
            {/* Step 1: Choose Method */}
            {twoFAStep === 1 && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-hope-ink dark:text-slate-100">Setup 2FA</h2>
                  <button onClick={closeTwoFAModal} className="rounded-lg p-1 text-hope-secondary hover:bg-hope-canvas dark:hover:bg-slate-800">
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                <p className="mb-6 text-sm text-hope-secondary">Choose how you want to verify your identity</p>
                <div className="space-y-3">
                  <button
                    onClick={() => selectTwoFAMethod('authenticator')}
                    className="w-full rounded-hope border-2 border-hope-border p-4 text-left transition hover:border-hope-primary hover:bg-hope-canvas dark:hover:bg-slate-800"
                  >
                    <p className="font-semibold text-hope-ink dark:text-slate-100">Authenticator App</p>
                    <p className="text-sm text-hope-secondary">Use Google Authenticator or Authy</p>
                  </button>
                  <button
                    onClick={() => selectTwoFAMethod('sms')}
                    className="w-full rounded-hope border-2 border-hope-border p-4 text-left transition hover:border-hope-primary hover:bg-hope-canvas dark:hover:bg-slate-800"
                  >
                    <p className="font-semibold text-hope-ink dark:text-slate-100">SMS Text Message</p>
                    <p className="text-sm text-hope-secondary">Receive code via text</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Setup */}
            {twoFAStep === 2 && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-hope-ink dark:text-slate-100">
                    {twoFAMethod === 'authenticator' ? 'Scan QR Code' : 'SMS Setup'}
                  </h2>
                  <button onClick={closeTwoFAModal} className="rounded-lg p-1 text-hope-secondary hover:bg-hope-canvas dark:hover:bg-slate-800">
                    <FiX className="h-5 w-5" />
                  </button>
                </div>

                {twoFAMethod === 'authenticator' && (
                  <div>
                    <p className="mb-4 text-sm text-hope-secondary">Scan with your authenticator app:</p>
                    <div className="mb-4 flex justify-center rounded-hope bg-white p-6">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/ITHelpdesk:user@company.com?secret=JBSWY3DPEBLW64TMMQ&issuer=ITHelpdesk" alt="QR" className="h-48 w-48" />
                    </div>
                    <p className="mb-3 text-sm font-semibold text-hope-ink dark:text-slate-100">Or enter manually:</p>
                    <div className="mb-4 flex items-center gap-2 rounded-hope border border-hope-border bg-hope-canvas p-3 dark:bg-slate-800">
                      <code className="flex-1 font-mono text-sm">JBSWY3DPEBLW64TMMQ======</code>
                      <button onClick={copySecret} className="p-2 text-hope-secondary hover:text-hope-primary">
                        {copied ? <FiCheck /> : <FiCopy />}
                      </button>
                    </div>
                  </div>
                )}

                <p className="mb-4 text-sm text-hope-secondary">Enter the 6-digit code:</p>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className={`mb-4 w-full rounded-hope border-2 px-4 py-3 text-center text-3xl font-bold bg-white dark:bg-slate-800 dark:text-slate-100 ${codeError ? 'border-hope-danger' : 'border-hope-border focus:border-hope-primary'}`}
                />
                {codeError && <p className="mb-4 text-sm text-hope-danger">{codeError}</p>}

                <div className="flex gap-3">
                  <button onClick={() => setTwoFAStep(1)} className="hope-btn-ghost flex-1">Back</button>
                  <button onClick={verify2FA} className="hope-btn-primary flex-1">Verify & Enable</button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {twoFAStep === 3 && (
              <div className="text-center">
                <FiCheckCircle className="mx-auto mb-4 h-12 w-12 text-hope-success" />
                <h3 className="mb-2 text-lg font-semibold text-hope-ink dark:text-slate-100">2FA Enabled!</h3>
                <p className="text-sm text-hope-secondary">Your account is now more secure</p>
              </div>
            )}
          </article>
        </div>
      )}
    </div>
  )
}
