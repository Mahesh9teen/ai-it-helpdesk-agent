import { useState, useEffect } from 'react'
import { getApiBase } from '../../lib/apiBase'

/**
 * SimilarTicketsPanel
 * 
 * Feature 3: Similar Ticket Search
 * Shows previously-solved tickets that are similar to the current one
 * Helps users find existing solutions and identify duplicates
 * 
 * Props:
 * - ticketId: UUID of the current ticket
 * - title: Ticket title
 * - description: Ticket description
 * - onSelectTicket: callback when user clicks a similar ticket
 */
export function SimilarTicketsPanel({
  ticketId,
  title,
  description,
  onSelectTicket = () => {},
}) {
  const [similar, setSimilar] = useState([])
  const [duplicateLikelihood, setDuplicateLikelihood] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSimilarTickets = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiBase = getApiBase()
      const params = new URLSearchParams({
        title,
        description,
      })

      const response = await fetch(
        `${apiBase}/tickets/${ticketId}/similar?${params}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setSimilar(data.similar_tickets || [])
      setDuplicateLikelihood(data.duplicate_likelihood || 0)
    } catch (err) {
      setError(err.message || 'Failed to find similar tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ticketId && title && description) {
      fetchSimilarTickets()
    }
  }, [ticketId])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="animate-spin inline-block w-4 h-4 border-2 border-amber-400 border-t-amber-600 rounded-full"></div>
          <span className="text-sm font-medium text-amber-700">
            Searching for similar tickets...
          </span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-amber-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-sm text-red-700">⚠️ Error searching similar tickets</p>
        <p className="text-xs text-red-600 mt-1">{error}</p>
        <button
          onClick={fetchSimilarTickets}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded font-medium transition"
        >
          Retry
        </button>
      </div>
    )
  }

  if (similar.length === 0) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm text-green-700">✓ No similar tickets found</p>
        <p className="text-xs text-green-600 mt-1">This appears to be a unique issue</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔍</span>
          <h3 className="font-bold text-gray-900">
            {similar.length} Similar Ticket{similar.length !== 1 ? 's' : ''} Found
          </h3>
        </div>
        {duplicateLikelihood > 0.7 && (
          <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
            <span className="text-lg">⚠️</span>
            <span className="text-xs font-bold text-red-700">
              {(duplicateLikelihood * 100).toFixed(0)}% duplicate
            </span>
          </div>
        )}
      </div>

      {/* Duplicate Warning */}
      {duplicateLikelihood > 0.7 && (
        <div className="mb-4 bg-red-100 border border-red-300 rounded-lg p-3">
          <p className="text-sm text-red-800 font-medium">
            ⚠️ This might be a duplicate. Consider marking as duplicate to consolidate tickets.
          </p>
        </div>
      )}

      {/* Similar Tickets List */}
      <div className="space-y-3">
        {similar.map((ticket, idx) => (
          <div
            key={idx}
            className="bg-white bg-opacity-60 hover:bg-opacity-100 border-l-4 border-amber-400 p-4 rounded-lg cursor-pointer transition hover:shadow-sm"
            onClick={() => onSelectTicket(ticket)}
          >
            {/* Ticket Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-700 mb-1">
                  {ticket.ticket_id}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {ticket.title}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                <span className="text-xs font-bold text-green-700">
                  {(ticket.similarity_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Resolution */}
            <div className="bg-blue-50 bg-opacity-50 p-2 rounded mb-2 border-l-2 border-blue-300">
              <p className="text-xs font-bold text-gray-600 mb-1">✓ SOLUTION</p>
              <p className="text-sm text-gray-800 line-clamp-2">
                {ticket.resolution}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                Resolved by{' '}
                <span className="font-medium text-gray-800">
                  {ticket.resolved_by}
                </span>
              </span>
              <span>{ticket.resolved_at}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-amber-100 mt-4">
        {duplicateLikelihood > 0.7 && (
          <button className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-medium transition active:scale-95">
            🔗 Mark as Duplicate
          </button>
        )}
        <button
          onClick={fetchSimilarTickets}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded font-medium transition active:scale-95"
        >
          🔄 Refresh
        </button>
        {similar.length > 5 && (
          <button className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded font-medium transition active:scale-95">
            See All
          </button>
        )}
      </div>
    </div>
  )
}
