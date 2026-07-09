import React, { useState } from 'react'
import { FiX, FiSend, FiPhone, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

export default function SMSVerification({ onClose, onComplete }) {
  const [step, setStep] = useState(1) // 1: phone input, 2: code verification, 3: success
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lastCodeSent, setLastCodeSent] = useState(null)

  const handleSendCode = async () => {
    if (!phone.trim()) {
      setError('Please enter a phone number')
      return
    }

    if (!/^\+?1?\d{9,15}$/.test(phone.replace(/[^\d+]/g, ''))) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    setError('')

    // Simulate SMS sending
    setTimeout(() => {
      setLastCodeSent(new Date())
      setStep(2)
      setLoading(false)
      // In real app, would send actual SMS with code
      console.log('SMS sent to', phone)
    }, 1000)
  }

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError('Please enter the verification code')
      return
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Code must be exactly 6 digits')
      return
    }

    setLoading(true)
    setError('')

    // Simulate verification (in real app, would validate against backend)
    setTimeout(() => {
      if (code === '123456') { // Demo code
        setSuccess(true)
        setStep(3)
        setLoading(false)
        setTimeout(() => {
          if (onComplete) onComplete()
        }, 2000)
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if (newAttempts >= 3) {
          setError('Too many failed attempts. Please try again later.')
        } else {
          setError(`Invalid code. ${3 - newAttempts} attempts remaining`)
        }
        setLoading(false)
      }
    }, 1000)
  }

  const handleResendCode = () => {
    if (lastCodeSent && new Date() - lastCodeSent < 30000) {
      setError('Please wait 30 seconds before requesting a new code')
      return
    }
    setCode('')
    setAttempts(0)
    setError('')
    handleSendCode()
  }

  const canResend = !lastCodeSent || (new Date() - lastCodeSent >= 30000)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-hope bg-white p-6 dark:bg-slate-900">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100">SMS Verification</h2>
          <button onClick={onClose} className="text-hope-secondary hover:text-hope-ink dark:hover:text-slate-100">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: Phone Input */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-hope-ink dark:text-slate-100 mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiPhone className="absolute left-3 top-3 h-5 w-5 text-hope-secondary" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setError('')
                    }}
                    placeholder="+1 (555) 123-4567"
                    className="w-full rounded-xl border border-hope-border bg-white pl-10 pr-4 py-2 text-hope-ink outline-none focus:border-hope-primary focus:ring-2 focus:ring-hope-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-hope-secondary">We'll send a verification code via SMS</p>
            </div>

            {error && (
              <div className="flex gap-2 rounded-xl bg-hope-danger/10 p-3 text-sm text-hope-danger dark:bg-hope-danger/20">
                <FiAlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-hope-primary px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              <FiSend className="h-4 w-4" />
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </div>
        )}

        {/* Step 2: Code Verification */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-hope-secondary">Enter the 6-digit code sent to <strong>{phone}</strong></p>

            <div>
              <label className="block text-sm font-semibold text-hope-ink dark:text-slate-100 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.slice(0, 6))
                  setError('')
                }}
                placeholder="000000"
                maxLength="6"
                className="w-full rounded-xl border border-hope-border bg-white px-4 py-3 text-center text-2xl tracking-widest font-mono text-hope-ink outline-none focus:border-hope-primary focus:ring-2 focus:ring-hope-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {error && (
              <div className="flex gap-2 rounded-xl bg-hope-danger/10 p-3 text-sm text-hope-danger dark:bg-hope-danger/20">
                <FiAlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 6}
              className="w-full rounded-xl bg-hope-primary px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              onClick={handleResendCode}
              disabled={!canResend}
              className="w-full rounded-xl border border-hope-border px-4 py-2 font-semibold text-hope-secondary hover:bg-hope-canvas disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Resend Code
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <FiCheckCircle className="h-12 w-12 text-hope-success" />
            </div>
            <h3 className="text-lg font-bold text-hope-ink dark:text-slate-100">SMS Verification Enabled!</h3>
            <p className="text-sm text-hope-secondary">You can now use SMS codes as your second authentication factor.</p>
          </div>
        )}

        {/* Demo Note */}
        <p className="mt-6 text-xs text-hope-secondary border-t border-hope-border pt-4 dark:border-slate-700">
          💡 Demo: Use code <strong>123456</strong> for testing
        </p>
      </div>
    </div>
  )
}
