import { useState, useEffect } from 'react'
import { getApiBase } from '../../lib/apiBase'

/**
 * ReplySuggestionPanel
 * 
 * Feature 5: AI Agent Reply Suggestions
 * Generates suggested responses for IT agents while they compose replies
 * Shows multiple tone options (formal, friendly, technical)
 * 
 * Props:
 * - ticketId: UUID of the ticket
 * - title: Ticket title
 * - description: Ticket description
 * - onSelectSuggestion: callback when user selects a suggestion
 * - onApply: callback with selected suggestion text
 */
export function ReplySuggestionPanel({
  ticketId,
  title,
  description,
  onSelectSuggestion = () => {},
  onApply = () => {},
}) {
  const [suggestions, setSuggestions] = useState([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showMultiple, setShowMultiple] = useState(false)
  const [error, setError] = useState(null)

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiBase = getApiBase()
      const response = await fetch(
        `${apiBase}/tickets/${ticketId}/reply-suggestions/multiple`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, count: 3 }),
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setSuggestions(data.suggestions || [])
      setSelectedIdx(0)
      setShowMultiple(true)
    } catch (err) {
      setError(err.message || 'Failed to generate suggestions')
    } finally {
      setLoading(false)
    }
  }

  const selectedSuggestion =
    suggestions.length > 0 ? suggestions[selectedIdx] : null

  return (
    <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 p-6 rounded-xl border border-teal-200 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <h3 className="font-bold text-gray-900">Reply Suggestions</h3>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Generate Button */}
      {!showMultiple && suggestions.length === 0 && (
        <div className="mb-4">
          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="w-full px-4 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <>
                <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Generating suggestions...
              </>
            ) : (
              <>✨ Generate Suggestions</>
            )}
          </button>
          <p className="text-xs text-gray-600 mt-2 text-center">
            AI will analyze this ticket and suggest response options
          </p>
        </div>
      )}

      {/* Multiple Options View */}
      {showMultiple && suggestions.length > 0 && (
        <div>
          {/* Single Suggestion Mode */}
          {!showMultiple && (
            <div className="mb-4 bg-white bg-opacity-50 p-4 rounded-lg border border-teal-200">
              <p className="text-xs font-bold text-gray-600 mb-2">
                SUGGESTED RESPONSE
              </p>
              <p className="text-sm text-gray-900 mb-3">
                {selectedSuggestion?.suggestion}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-400 transition-all duration-300"
                      style={{
                        width: `${(selectedSuggestion?.confidence || 0) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-700 whitespace-nowrap">
                  {(
                    (selectedSuggestion?.confidence || 0) * 100
                  ).toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {/* Multiple Options */}
          <div className="space-y-2 mb-4">
            {suggestions.map((sugg, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedIdx(idx)
                  onSelectSuggestion(sugg)
                }}
                className={`p-3 rounded-lg border-l-4 cursor-pointer transition ${
                  selectedIdx === idx
                    ? 'bg-white border-teal-500 shadow-sm'
                    : 'bg-white bg-opacity-50 border-gray-300 hover:border-teal-300'
                }`}
              >
                {/* Tone Label */}
                <p className="text-xs font-bold text-gray-600 mb-1 capitalize">
                  {sugg.tone}
                </p>

                {/* Preview */}
                <p
                  className={`text-sm mb-2 line-clamp-2 ${
                    selectedIdx === idx
                      ? 'text-gray-900'
                      : 'text-gray-700'
                  }`}
                >
                  {sugg.suggestion}
                </p>

                {/* Confidence */}
                <div className="flex items-center gap-1">
                  <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        selectedIdx === idx
                          ? 'bg-teal-500'
                          : 'bg-gray-400'
                      } transition-all duration-300`}
                      style={{ width: `${(sugg.confidence || 0) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                    {((sugg.confidence || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Option Preview */}
          {selectedSuggestion && (
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 mb-4">
              <p className="text-xs font-bold text-teal-700 mb-2">
                SELECTED: {selectedSuggestion.tone.toUpperCase()}
              </p>
              <p className="text-sm text-gray-900 leading-relaxed">
                {selectedSuggestion.suggestion}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                onApply(selectedSuggestion.suggestion)
              }}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition active:scale-95"
            >
              ✓ Use This
            </button>
            <button
              onClick={fetchSuggestions}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition active:scale-95"
            >
              🔄 Regenerate
            </button>
            <button
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition active:scale-95"
              title="Edit suggestion before sending"
            >
              ✏️ Modify
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
