import React, { useState } from 'react'
import { FiCopy, FiCheck, FiDownload, FiAlertTriangle } from 'react-icons/fi'

export default function RecoveryCodes({ onClose }) {
  const [codes, setCodes] = useState([
    'TK9A-3B7F-2K1X',
    'WQ4L-8M5P-6N9C',
    'RD2H-7V1J-4G8S',
    'YX3F-9K2B-5L7D',
    'CP6W-1E4R-3T8U',
    'MN7Z-2A9X-5C1F',
    'HJ4K-6L1M-8P3Q',
    'VB9N-2Z5X-7C4D',
  ])
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const copyAllCodes = () => {
    const text = codes.join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCodes = () => {
    const text = `IT Helpdesk - Recovery Codes\n\nSave these codes in a secure location. Each code can be used only once to regain access to your account if you lose your authenticator device.\n\n${codes.join('\n')}\n\nGenerated: ${new Date().toLocaleString()}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'recovery-codes.txt'
    a.click()
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-hope bg-white p-6 dark:bg-slate-900">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100 flex items-center gap-2">
            <FiAlertTriangle className="h-5 w-5 text-hope-warning" />
            Save Recovery Codes
          </h2>
          <p className="mt-2 text-sm text-hope-secondary">Store these codes in a secure location. Use them if you lose access to your authenticator.</p>
        </div>

        {/* Codes */}
        <div className="rounded-hope border-2 border-hope-warning/20 bg-hope-warning/5 p-4 mb-4 dark:border-hope-warning/30 dark:bg-hope-warning/10">
          <div className="space-y-2">
            {codes.map((code, idx) => (
              <div key={idx} className="font-mono text-sm text-hope-ink dark:text-slate-100">
                {code}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={copyAllCodes}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-hope-canvas px-4 py-2 font-semibold text-hope-ink hover:bg-hope-border dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {copied ? <FiCheck className="h-4 w-4 text-hope-success" /> : <FiCopy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy All Codes'}
          </button>

          <button
            onClick={downloadCodes}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-hope-canvas px-4 py-2 font-semibold text-hope-ink hover:bg-hope-border dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {downloaded ? <FiCheck className="h-4 w-4 text-hope-success" /> : <FiDownload className="h-4 w-4" />}
            {downloaded ? 'Downloaded!' : 'Download Codes'}
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-hope-primary px-4 py-2 font-semibold text-white hover:opacity-90"
          >
            I've Saved My Codes
          </button>
        </div>

        {/* Warning */}
        <p className="mt-4 text-xs text-hope-secondary border-t border-hope-border pt-4 dark:border-slate-700">
          ⚠️ Do not share these codes. Store them offline in a secure location.
        </p>
      </div>
    </div>
  )
}
