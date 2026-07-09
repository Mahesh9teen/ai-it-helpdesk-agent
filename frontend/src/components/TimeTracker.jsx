import React, { useState, useEffect } from 'react'
import { FiPlay, FiPause, FiX, FiClock, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { logTimeSession } from '../lib/api-features'

export default function TimeTracker({ ticket = { title: 'Time Tracking' }, onClose }) {
  const [isRunning, setIsRunning] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [sessions, setSessions] = useState([
    { id: 1, duration: 1800, startTime: '2 hours ago', description: 'Initial diagnosis' },
    { id: 2, duration: 900, startTime: '1.5 hours ago', description: 'Troubleshooting' }
  ])
  const [description, setDescription] = useState('')

  useEffect(() => {
    let interval
    if (isRunning) {
      interval = setInterval(() => {
        setSessionSeconds(s => s + 1)
        setTotalSeconds(t => t + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const stopSession = async () => {
    if (sessionSeconds > 0) {
      try {
        // Save to API
        await logTimeSession(ticket.id || 'demo-ticket', {
          duration: sessionSeconds,
          description: description || 'Work session',
          startTime: new Date(Date.now() - sessionSeconds * 1000).toISOString()
        })
        
        // Add to local state
        setSessions([
          ...sessions,
          {
            id: sessions.length + 1,
            duration: sessionSeconds,
            startTime: 'Just now',
            description: description || 'Work session'
          }
        ])
      } catch (error) {
        console.error('Failed to save session:', error)
      }
    }
    setSessionSeconds(0)
    setDescription('')
    setIsRunning(false)
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-hope bg-white p-6 dark:bg-slate-900 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100">Time Tracking</h2>
            <p className="text-sm text-hope-secondary">{ticket.title}</p>
          </div>
          <button onClick={onClose} className="text-hope-secondary hover:text-hope-ink">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Timer */}
        <div className="rounded-hope border-2 border-hope-primary bg-hope-primary/5 p-6 mb-6 dark:bg-hope-primary/10">
          <div className="text-center">
            <p className="text-sm text-hope-secondary mb-2">Current Session</p>
            <p className="text-4xl font-mono font-bold text-hope-primary mb-4">{formatTime(sessionSeconds)}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={toggleTimer}
                className="flex items-center gap-2 rounded-xl bg-hope-primary px-4 py-2 text-white hover:opacity-90"
              >
                {isRunning ? (
                  <>
                    <FiPause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <FiPlay className="h-4 w-4" />
                    Start
                  </>
                )}
              </button>
              <button
                onClick={stopSession}
                className="flex items-center gap-2 rounded-xl border border-hope-border px-4 py-2 hover:bg-hope-canvas dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <FiCheck className="h-4 w-4" />
                Save Session
              </button>
            </div>
          </div>
        </div>

        {/* Session Description */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-hope-ink dark:text-slate-100 mb-2">Session Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            className="w-full rounded-xl border border-hope-border bg-white px-4 py-2 text-hope-ink outline-none focus:border-hope-primary focus:ring-2 focus:ring-hope-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Total Time */}
        <div className="rounded-hope bg-hope-canvas p-4 mb-6 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiClock className="h-5 w-5 text-hope-secondary" />
              <span className="font-semibold text-hope-ink dark:text-slate-100">Total Time Logged</span>
            </div>
            <span className="text-2xl font-mono font-bold text-hope-primary">{formatTime(totalSeconds)}</span>
          </div>
        </div>

        {/* Sessions History */}
        <div>
          <h3 className="font-semibold text-hope-ink dark:text-slate-100 mb-3">Session History</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-xl border border-hope-border dark:border-slate-700">
                <div>
                  <p className="font-semibold text-hope-ink dark:text-slate-100">{session.description}</p>
                  <p className="text-xs text-hope-secondary">{session.startTime}</p>
                </div>
                <span className="font-mono text-hope-primary">{formatTime(session.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
