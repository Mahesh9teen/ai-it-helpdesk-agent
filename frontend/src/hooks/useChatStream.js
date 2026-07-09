import { useEffect, useMemo, useRef, useState } from 'react'
import { getApiBase } from '../lib/apiBase'

const API_BASE = getApiBase()

const QUICK_ACTIONS = [
  { id: 'reset-password', label: 'Reset Password', prompt: 'Please help me reset my password securely.' },
  { id: 'leave-balance', label: 'Check Leave Balance', prompt: 'Can you check my current leave balance?' },
  { id: 'raise-ticket', label: 'Raise a Ticket', prompt: 'Please raise a ticket: my VPN connection keeps dropping.' },
  { id: 'request-software', label: 'Request Software', prompt: 'I need to request software installation for Postman with business justification.' },
]

const createSessionId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }
  return '00000000-0000-4000-8000-000000000001'
}

export default function useChatStream(employeeId) {
  const [messages, setMessages] = useState([
    {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: 'Hello. I can help with password resets, leave balance, ticketing, and software requests. Choose a quick action or type your request.',
      citations: [],
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState('')
  const [isEscalated, setIsEscalated] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const sessionIdRef = useRef(createSessionId())
  const streamRef = useRef(null)

  const quickActions = useMemo(() => QUICK_ACTIONS, [])

  const closeActiveStream = () => {
    if (streamRef.current) {
      streamRef.current.close()
      streamRef.current = null
    }
  }

  const updateAssistantMessage = (assistantId, updater) => {
    setMessages((current) =>
      current.map((message) => {
        if (message.id !== assistantId) {
          return message
        }
        return updater(message)
      }),
    )
  }

  const sendMessage = (text) => {
    const message = (text || input).trim()
    if (!message || isStreaming) {
      return
    }

    setError('')
    const userMessage = { id: `user-${Date.now()}`, role: 'user', text: message, citations: [] }
    const assistantId = `assistant-${Date.now() + 1}`
    const assistantMessage = { id: assistantId, role: 'assistant', text: '', citations: [] }
    setMessages((current) => [...current, userMessage, assistantMessage])
    setInput('')
    setIsStreaming(true)

    const params = new URLSearchParams({
      message,
      session_id: sessionIdRef.current,
    })
    if (employeeId) {
      params.set('employee_id', employeeId)
    }

    closeActiveStream()
    const eventSource = new EventSource(`${API_BASE}/chat/stream?${params.toString()}`)
    streamRef.current = eventSource

    eventSource.onmessage = (event) => {
      let payload
      try {
        payload = JSON.parse(event.data)
      } catch {
        return
      }

      if (payload.token) {
        updateAssistantMessage(assistantId, (assistant) => ({
          ...assistant,
          text: `${assistant.text}${assistant.text ? ' ' : ''}${payload.token}`,
        }))
      }

      if (payload.done) {
        updateAssistantMessage(assistantId, (assistant) => ({
          ...assistant,
          citations: Array.isArray(payload.sources) ? payload.sources : [],
        }))
        if (payload.intent === 'ESCALATE') {
          setIsEscalated(true)
        }
        setIsStreaming(false)
        eventSource.close()
        streamRef.current = null
      }
    }

    eventSource.onerror = () => {
      setError('Unable to stream response from the server. Check backend connectivity and try again.')
      setIsStreaming(false)
      eventSource.close()
      streamRef.current = null
    }
  }

  const uploadScreenshot = async (file) => {
    if (!file || isStreaming) {
      return
    }
    setError('')
    setIsStreaming(true)
    const form = new FormData()
    form.append('screenshot', file)
    form.append('message', input || 'Please troubleshoot using this screenshot.')
    if (employeeId) {
      form.append('employee_id', employeeId)
    }
    form.append('session_id', sessionIdRef.current)

    try {
      const response = await fetch(`${API_BASE}/chat/upload-screenshot`, { method: 'POST', body: form })
      if (!response.ok) {
        throw new Error('screenshot analysis failed')
      }
      const payload = await response.json()
      setMessages((current) => [
        ...current,
        { id: `user-shot-${Date.now()}`, role: 'user', text: 'Uploaded screenshot for analysis.', citations: [] },
        { id: `assistant-shot-${Date.now() + 1}`, role: 'assistant', text: payload.response, citations: [] },
      ])
      if (voiceMode) {
        await speakText(payload.response)
      }
    } catch {
      setError('Unable to process screenshot upload.')
    } finally {
      setIsStreaming(false)
    }
  }

  const transcribeAudio = async (file) => {
    if (!file || isStreaming) {
      return
    }
    setError('')
    setIsStreaming(true)
    const form = new FormData()
    form.append('audio', file)
    if (employeeId) {
      form.append('employee_id', employeeId)
    }
    form.append('session_id', sessionIdRef.current)

    try {
      const response = await fetch(`${API_BASE}/voice/transcribe`, { method: 'POST', body: form })
      if (!response.ok) {
        throw new Error('voice transcription failed')
      }
      const payload = await response.json()
      setMessages((current) => [
        ...current,
        { id: `user-voice-${Date.now()}`, role: 'user', text: payload.transcript, citations: [] },
        { id: `assistant-voice-${Date.now() + 1}`, role: 'assistant', text: payload.response, citations: [] },
      ])
      if (voiceMode) {
        await speakText(payload.response)
      }
    } catch {
      setError('Unable to transcribe audio.')
    } finally {
      setIsStreaming(false)
    }
  }

  const speakText = async (text) => {
    const response = await fetch(`${API_BASE}/voice/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) {
      return
    }
    const blob = await response.blob()
    const audioUrl = URL.createObjectURL(blob)
    const audio = new Audio(audioUrl)
    await audio.play()
  }

  useEffect(() => () => closeActiveStream(), [])

  return {
    messages,
    input,
    setInput,
    sendMessage,
    isStreaming,
    error,
    quickActions,
    isEscalated,
    uploadScreenshot,
    transcribeAudio,
    voiceMode,
    setVoiceMode,
  }
}
