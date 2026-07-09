import React, { useState, useEffect } from 'react'
import { FiBell, FiMail, FiMessageSquare, FiSlack } from 'react-icons/fi'
import { getNotificationPreferences, updateNotificationPreferences } from '../lib/api-features'

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    email: {
      newTickets: true,
      assignments: true,
      comments: true,
      escalations: true
    },
    browser: {
      newTickets: true,
      assignments: true,
      comments: true,
      escalations: true
    },
    slack: {
      newTickets: false,
      assignments: false,
      comments: false,
      escalations: true
    },
    sms: {
      newTickets: false,
      assignments: false,
      comments: false,
      escalations: true
    }
  })

  useEffect(() => {
    // Load preferences from API
    const loadPreferences = async () => {
      try {
        const data = await getNotificationPreferences('demo-employee')
        if (data) {
          setPreferences(data)
        }
      } catch (error) {
        console.error('Failed to load notification preferences:', error)
      }
    }

    loadPreferences()
  }, [])

  const toggleNotification = async (channel, event) => {
    const newPrefs = {
      ...preferences,
      [channel]: {
        ...preferences[channel],
        [event]: !preferences[channel][event]
      }
    }
    setPreferences(newPrefs)

    // Save to API
    try {
      await updateNotificationPreferences('demo-employee', newPrefs)
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
    }
  }

  const channels = [
    { id: 'email', icon: FiMail, label: 'Email', color: 'text-blue-500' },
    { id: 'browser', icon: FiBell, label: 'Browser', color: 'text-purple-500' },
    { id: 'slack', icon: FiSlack, label: 'Slack', color: 'text-yellow-500' },
    { id: 'sms', icon: FiMessageSquare, label: 'SMS', color: 'text-green-500' }
  ]

  const events = [
    { id: 'newTickets', label: 'New Tickets' },
    { id: 'assignments', label: 'Ticket Assignments' },
    { id: 'comments', label: 'New Comments' },
    { id: 'escalations', label: 'Escalations' }
  ]

  return (
    <div className="rounded-hope border border-hope-border bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-lg font-bold text-hope-ink dark:text-slate-100 mb-4">Notification Preferences</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hope-border dark:border-slate-700">
              <th className="text-left py-2 px-3 font-semibold text-hope-ink dark:text-slate-100">Event</th>
              {channels.map(ch => {
                const Icon = ch.icon
                return (
                  <th key={ch.id} className="text-center py-2 px-3 font-semibold text-hope-ink dark:text-slate-100">
                    <Icon className={`h-4 w-4 mx-auto ${ch.color}`} />
                    <p className="text-xs mt-1">{ch.label}</p>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id} className="border-b border-hope-border dark:border-slate-700">
                <td className="py-3 px-3 text-hope-ink dark:text-slate-100">{event.label}</td>
                {channels.map(ch => (
                  <td key={`${ch.id}-${event.id}`} className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={preferences[ch.id][event.id]}
                      onChange={() => toggleNotification(ch.id, event.id)}
                      className="rounded cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-hope-secondary">💡 Connect Slack or SMS channels in your account settings to enable them</p>
    </div>
  )
}
