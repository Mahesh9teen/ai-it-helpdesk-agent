import { useState, useEffect } from 'react'
import { getApiBase } from '../../lib/apiBase'

/**
 * TicketSummaryPanel
 * 
 * Feature 2: AI Ticket Comment Summarization
 * Displays AI-generated summary of all comments in a ticket thread
 * 
 * Props:
 * - ticketId: UUID of the ticket
 * - onError: callback when error occurs
 */
export function TicketSummaryPanel({ ticketId, onError = () => {} }) {
  const [summary, setSummary] = useState(null)
  const [keyPoints, setKeyPoints] = useState([])
  const [resolution, setResolution] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSummary = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiBase = getApiBase()
      const response = await fetch(
        `${apiBase}/tickets/${ticketId}/ai-summary`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setSummary(data.summary)
      setKeyPoints(data.key_points || [])
      setResolution(data.resolution)
      setConfidence(data.confidence)
    } catch (err) {
      const errorMsg = err.message || 'Failed to generate summary'
      setError(errorMsg)
      onError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ticketId) {
      fetchSummary()
    }
  }, [ticketId])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-blue-600 rounded-full"></div>
          <span className="text-sm font-medium text-blue-700">Generating summary...</span>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-blue-100 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-blue-100 rounded animate-pulse w-4/5"></div>
          <div className="h-3 bg-blue-50 rounded animate-pulse w-full mt-4"></div>
          <div className="h-3 bg-blue-50 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-sm text-red-700">⚠️ Error generating summary</p>
        <p className="text-xs text-red-600 mt-1">{error}</p>
        <button
          onClick={fetchSummary}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded font-medium transition"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">No summary available</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          <h3 className="font-bold text-gray-900">AI Summary</h3>
        </div>
        <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
          <span className="text-xs font-medium text-blue-700">
            {(confidence * 100).toFixed(0)}% confident
          </span>
        </div>
      </div>

      {/* Main Summary */}
      <div className="mb-4">
        <p className="text-sm leading-relaxed text-gray-800">
          {summary}
        </p>
      </div>

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
            Key Points
          </h4>
          <ul className="space-y-1">
            {keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 font-bold flex-shrink-0 mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resolution */}
      {resolution && (
        <div className="mb-4 bg-white bg-opacity-50 p-3 rounded-lg border-l-4 border-blue-400">
          <p className="text-xs font-bold text-gray-600 mb-1">RESOLUTION</p>
          <p className="text-sm text-gray-800">{resolution}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-blue-100">
        <button
          onClick={fetchSummary}
          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-medium transition active:scale-95"
          title="Regenerate summary with latest comments"
        >
          🔄 Regenerate
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(summary)
          }}
          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded font-medium transition active:scale-95"
          title="Copy summary to clipboard"
        >
          📋 Copy
        </button>
        <button
          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded font-medium transition active:scale-95"
          title="Report inaccuracy - helps improve AI"
        >
          👎 Feedback
        </button>
      </div>

      {/* Confidence Bar */}
      <div className="mt-3 bg-gray-200 rounded-full h-1 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full transition-all duration-500"
          style={{ width: `${confidence * 100}%` }}
        ></div>
      </div>
    </div>
  )
}
