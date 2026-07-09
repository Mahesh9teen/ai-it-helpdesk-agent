const rawBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export function getApiBase() {
  const trimmed = rawBase.replace(/\/+$/, '')
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`
}

export function getApiBaseInfo() {
  const trimmedRawBase = rawBase.replace(/\/+$/, '')
  const apiBase = getApiBase()
  return {
    rawBase: trimmedRawBase,
    apiBase,
    wasNormalized: trimmedRawBase !== apiBase,
  }
}
