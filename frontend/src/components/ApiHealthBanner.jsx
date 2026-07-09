import React, { useEffect, useState } from 'react'
import { getApiBaseInfo } from '../lib/apiBase'

const { rawBase, apiBase, wasNormalized } = getApiBaseInfo()

export default function ApiHealthBanner() {
  const [health, setHealth] = useState({ status: 'checking', message: '' })

  useEffect(() => {
    let active = true

    const check = async () => {
      try {
        const response = await fetch(`${apiBase}/analytics/summary`, {
          headers: { 'X-User-Email': 'admin@company.com' },
        })

        if (!active) {
          return
        }

        if (response.ok) {
          setHealth({ status: 'ok', message: '' })
          return
        }

        setHealth({
          status: 'error',
          message: `API check failed with HTTP ${response.status}. Verify VITE_API_BASE_URL and backend availability.`,
        })
      } catch {
        if (!active) {
          return
        }
        setHealth({
          status: 'error',
          message: 'Unable to reach backend API. Verify VITE_API_BASE_URL and ensure backend is running.',
        })
      }
    }

    check()
    return () => {
      active = false
    }
  }, [])

  if (health.status === 'ok' && !wasNormalized) {
    return null
  }

  const baseClass = 'mt-4 rounded-xl border px-3 py-2 text-xs'

  if (health.status === 'error') {
    return (
      <div className={`${baseClass} border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200`}>
        <p className="font-semibold">API health warning</p>
        <p className="mt-1">{health.message}</p>
      </div>
    )
  }

  return (
    <div className={`${baseClass} border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200`}>
      <p className="font-semibold">API base normalized</p>
      <p className="mt-1">Configured base {rawBase} was normalized to {apiBase}. Set VITE_API_BASE_URL to include /api/v1 to avoid ambiguity.</p>
    </div>
  )
}
