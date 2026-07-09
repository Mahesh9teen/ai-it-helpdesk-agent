import React, { useState } from 'react'
import { FiBell, FiLock, FiSliders, FiCheckCircle, FiX, FiCopy, FiCheck, FiTabs } from 'react-icons/fi'
import AdvancedFilters from './AdvancedFilters'
import RolePermissions from './RolePermissions'
import RecoveryCodes from './RecoveryCodes'
import SMSVerification from './SMSVerification'
import TimeTracker from './TimeTracker'
import ServiceTemplates from './ServiceTemplates'
import ChatHistory from './ChatHistory'
import NotificationPreferences from './NotificationPreferences'
import WorkflowAutomation from './WorkflowAutomation'

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('general') // Tab management
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

  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [showSMSVerification, setShowSMSVerification] = useState(false)
  const [showTimeTracker, setShowTimeTracker] = useState(false)

  const [twoFAModal, setTwoFAModal] = useState(false)
  const [twoFAStep, setTwoFAStep] = useState(1) // 1: Choose method, 2: QR/Email, 3: Verify
  const [twoFAMethod, setTwoFAMethod] = useState(null) // 'authenticator' or 'sms'
  const [verificationCode, setVerificationCode] = useState('')
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [copied, setCopied] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [codeAttempts, setCodeAttempts] = useState(0)

  // Simple base32 decoder for TOTP verification
  const base32Decode = (base32) => {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    const cleanBase32 = base32.replace(/=/g, '').toUpperCase()
    let bits = ''
    for (let i = 0; i < cleanBase32.length; i++) {
      const idx = base32chars.indexOf(cleanBase32[i])
      if (idx === -1) throw new Error('Invalid base32 character: ' + cleanBase32[i])
      bits += idx.toString(2).padStart(5, '0')
    }
    const bytes = []
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substr(i, 8), 2))
    }
    return new Uint8Array(bytes)
  }

  // Simple HMAC-SHA1 for TOTP
  const hmacSha1Async = async (key, message) => {
    const keyBuffer = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
    const signatureBuffer = await crypto.subtle.sign('HMAC', keyBuffer, message)
    return new Uint8Array(signatureBuffer)
  }

  // TOTP verification
  const verifyTOTP = async (token, secret) => {
    try {
      const secretBytes = base32Decode(secret)
      const now = Math.floor(Date.now() / 1000)
      const timeCounter = Math.floor(now / 30)
      
      // Check current and adjacent time windows (±1) to account for clock skew
      for (let i = -1; i <= 1; i++) {
        let counter = timeCounter + i
        const counterBytes = new Uint8Array(8)
        for (let j = 0; j < 8; j++) {
          counterBytes[7 - j] = counter & 0xff
          counter >>= 8
        }
        
        const hmac = await hmacSha1Async(secretBytes, counterBytes)
        const offset = hmac[19] & 0xf
        const code = ((hmac[offset] & 0x7f) << 24 |
                      (hmac[offset + 1] & 0xff) << 16 |
                      (hmac[offset + 2] & 0xff) << 8 |
                      (hmac[offset + 3] & 0xff)) % 1000000
        
        if (code.toString().padStart(6, '0') === token) {
          return true
        }
      }
      return false
    } catch (e) {
      console.error('TOTP verification error:', e)
      return false
    }
  }

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const openTwoFASetup = () => {
    setTwoFAModal(true)
    setTwoFAStep(1)
    setTwoFAMethod(null)
    setVerificationCode('')
    setCodeError('')
    setCodeAttempts(0)
  }

  const closeTwoFAModal = () => {
    setTwoFAModal(false)
    setTwoFAStep(1)
    setTwoFAMethod(null)
    setVerificationCode('')
    setCodeError('')
    setCodeAttempts(0)
  }

  const selectTwoFAMethod = (method) => {
    setTwoFAMethod(method)
    setTwoFAStep(2)
  }

  const copySecret = () => {
    navigator.clipboard.writeText('JBSWY3DPEBLW64TMMQ======')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const verify2FA = async () => {
    setCodeError('')
    
    if (verificationCode.length !== 6) {
      setCodeError('Code must be exactly 6 digits')
      return
    }

    if (!/^\d+$/.test(verificationCode)) {
      setCodeError('Code must contain only numbers')
      return
    }

    // Verify TOTP code
    const secret = 'JBSWY3DPEBLW64TMMQ======'
    const isValidToken = await verifyTOTP(verificationCode, secret)

    if (!isValidToken) {
      const newAttempts = codeAttempts + 1
      setCodeAttempts(newAttempts)
      const remainingAttempts = 3 - newAttempts
      
      if (remainingAttempts <= 0) {
        setCodeError('Maximum attempts exceeded. Please try again.')
        setTimeout(() => {
          closeTwoFAModal()
        }, 2000)
      } else {
        setCodeError(`Invalid code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`)
      }
      setVerificationCode('')
      return
    }

    // Code is correct
    setIs2FAEnabled(true)
    closeTwoFAModal()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <article className="hope-card p-6">
        <h2 className="text-2xl font-bold text-hope-ink dark:text-slate-100">System Settings</h2>
        <p className="mt-1 text-hope-secondary">Configure system preferences, automation, and integrations</p>
      </article>

      {/* Tabs */}
      <div className="border-b border-hope-border dark:border-slate-700 overflow-x-auto">
        <div className="flex gap-1 px-1">
          {[
            { id: 'general', label: 'General' },
            { id: 'security', label: 'Security & 2FA' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'advanced', label: 'Advanced' },
          ].map(tab => (
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
      {/* Automation Settings */}
      <article className="hope-card p-6">
        <div className="flex items-center gap-3 border-b border-hope-border pb-4 dark:border-slate-700">
          <FiSliders className="h-5 w-5 text-hope-primary" />
          <h3 className="text-lg font-semibold text-hope-ink dark:text-slate-100">Automation Rules</h3>
        </div>
        <div className="mt-6 space-y-4">
          {[
            { key: 'autoAssign', label: 'Auto-assign tickets to available agents', desc: 'Automatically distribute incoming tickets' },
            { key: 'priorityAutoAssign', label: 'Prioritize critical tickets', desc: 'Route high-priority issues to senior staff' },
            { key: 'autoEscalate', label: 'Auto-escalate overdue tickets', desc: 'Escalate tickets not resolved within SLA' },
            { key: 'aiSuggestions', label: 'Enable AI-powered suggestions', desc: 'Show suggested solutions based on ticket content' },
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
            { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive email alerts for ticket updates' },
            { key: 'slackIntegration', label: 'Slack integration', desc: 'Send notifications to Slack channel' },
            { key: 'dailyDigest', label: 'Daily digest', desc: 'Receive daily summary of ticket activity' },
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
      )}

      {/* Tab Content - Security */}
      {activeTab === 'security' && (
        <div className="space-y-5">

      {/* Security Settings */}
      <article className="hope-card p-6">
        <div className="flex items-center gap-3 border-b border-hope-border pb-4 dark:border-slate-700">
          <FiLock className="h-5 w-5 text-hope-danger" />
          <h3 className="text-lg font-semibold text-hope-ink dark:text-slate-100">Security</h3>
        </div>
        <div className="mt-6 space-y-4">
          <div className="rounded-hope border border-hope-border p-4 dark:border-slate-700">
            <p className="font-semibold text-hope-ink dark:text-slate-100">Change Password</p>
            <p className="mt-1 text-sm text-hope-secondary">Update your account password</p>
            <button className="mt-4 hope-btn-primary">
              Update Password
            </button>
          </div>
          <div className="rounded-hope border border-hope-border p-4 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-hope-ink dark:text-slate-100">Two-Factor Authentication</p>
                <p className="mt-1 text-sm text-hope-secondary">Add an extra layer of security to your account</p>
                {is2FAEnabled && (
                  <span className="mt-2 inline-block rounded-full bg-hope-success/20 px-3 py-1 text-xs font-semibold text-hope-success">
                    ✓ Enabled
                  </span>
                )}
              </div>
              <button 
                onClick={openTwoFASetup}
                className={`mt-4 ${is2FAEnabled ? 'hope-btn-ghost' : 'hope-btn-primary'}`}
              >
                {is2FAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button className="hope-btn-ghost">
          Discard Changes
        </button>
        <button className="hope-btn-primary flex items-center gap-2">
          <FiCheckCircle /> Save Settings
        </button>
      </div>

      {/* 2FA Setup Modal */}
      {twoFAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <article className="hope-card w-full max-w-md">
            {/* Step 1: Choose Method */}
            {twoFAStep === 1 && (
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-hope-ink dark:text-slate-100">Enable 2FA</h2>
                  <button
                    onClick={closeTwoFAModal}
                    className="rounded-lg p-1 text-hope-secondary hover:bg-hope-canvas dark:hover:bg-slate-800"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                <p className="mb-6 text-hope-secondary">Choose how you want to verify your identity</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => selectTwoFAMethod('authenticator')}
                    className="w-full rounded-hope border-2 border-hope-border p-4 text-left transition hover:border-hope-primary hover:bg-hope-canvas dark:hover:bg-slate-800"
                  >
                    <p className="font-semibold text-hope-ink dark:text-slate-100">Authenticator App</p>
                    <p className="text-sm text-hope-secondary">Use an app like Google Authenticator, Authy, or Microsoft Authenticator</p>
                  </button>
                  
                  <button
                    onClick={() => selectTwoFAMethod('sms')}
                    className="w-full rounded-hope border-2 border-hope-border p-4 text-left transition hover:border-hope-primary hover:bg-hope-canvas dark:hover:bg-slate-800"
                  >
                    <p className="font-semibold text-hope-ink dark:text-slate-100">SMS Text Message</p>
                    <p className="text-sm text-hope-secondary">Receive a code via SMS to your registered phone number</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Setup */}
            {twoFAStep === 2 && (
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-hope-ink dark:text-slate-100">
                    {twoFAMethod === 'authenticator' ? 'Scan QR Code' : 'SMS Verification'}
                  </h2>
                  <button
                    onClick={closeTwoFAModal}
                    className="rounded-lg p-1 text-hope-secondary hover:bg-hope-canvas dark:hover:bg-slate-800"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>

                {twoFAMethod === 'authenticator' && (
                  <div>
                    <p className="mb-4 text-sm text-hope-secondary">Scan this QR code with your authenticator app:</p>
                    <div className="mb-4 flex justify-center rounded-hope bg-white p-6">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/ITHelpdesk:user@company.com?secret=JBSWY3DPEBLW64TMMQ&issuer=ITHelpdesk"
                        alt="2FA QR Code"
                        className="h-48 w-48 rounded"
                      />
                    </div>
                    <p className="mb-3 text-sm font-semibold text-hope-ink dark:text-slate-100">Or enter this code manually:</p>
                    <div className="mb-4 flex items-center gap-2 rounded-hope border border-hope-border bg-hope-canvas p-3 dark:bg-slate-800">
                      <code className="flex-1 font-mono text-sm">JBSWY3DPEBLW64TMMQ======</code>
                      <button
                        onClick={copySecret}
                        className="p-2 text-hope-secondary hover:text-hope-primary"
                      >
                        {copied ? <FiCheck /> : <FiCopy />}
                      </button>
                    </div>
                  </div>
                )}

                {twoFAMethod === 'sms' && (
                  <div>
                    <p className="mb-4 text-sm text-hope-secondary">We'll send a verification code to your phone ending in •••• 5555</p>
                    <button className="hope-btn-primary w-full">
                      Send Code
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setTwoFAStep(3)}
                  className="mt-4 hope-btn-primary w-full"
                >
                  Next: Verify Code
                </button>
              </div>
            )}

            {/* Step 3: Verify */}
            {twoFAStep === 3 && (
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-hope-ink dark:text-slate-100">Verify Code</h2>
                  <button
                    onClick={closeTwoFAModal}
                    className="rounded-lg p-1 text-hope-secondary hover:bg-hope-canvas dark:hover:bg-slate-800"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>

                <p className="mb-4 text-sm text-hope-secondary">
                  Enter the 6-digit code from your {twoFAMethod === 'authenticator' ? 'authenticator app' : 'text message'}
                </p>

                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className={`mb-4 w-full rounded-hope border-2 px-4 py-3 text-center text-3xl tracking-widest font-bold bg-white placeholder-hope-secondary transition focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                    codeError 
                      ? 'border-hope-danger focus:border-hope-danger' 
                      : 'border-hope-border focus:border-hope-primary dark:border-slate-600'
                  }`}
                />

                {codeError && (
                  <div className="mb-4 rounded-hope bg-red-50 border border-hope-danger p-3 dark:bg-red-900/20">
                    <p className="text-sm font-semibold text-hope-danger">{codeError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setTwoFAStep(2)
                      setCodeError('')
                      setVerificationCode('')
                      setCodeAttempts(0)
                    }}
                    className="hope-btn-ghost flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={verify2FA}
                    className="hope-btn-primary flex-1"
                  >
                    Verify & Enable
                  </button>
                </div>
              </div>
            )}
          </article>
        </div>
      )}

      {/* Tab Content - Advanced (Enterprise Features) */}
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

      {/* Tab Content - Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-5">
          <NotificationPreferences />
        </div>
      )}
    </div>
  )
}
