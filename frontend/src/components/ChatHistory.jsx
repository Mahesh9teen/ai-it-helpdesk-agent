import React, { useState, useEffect } from 'react'
import { FiSearch, FiX, FiDownload, FiCopy, FiCheck } from 'react-icons/fi'
import { getChatHistory } from '../lib/api-features'

export default function ChatHistory() {
  const [conversations, setConversations] = useState([
    { id: 1, title: 'Password Reset Request', date: '2 days ago', messages: 5, preview: 'I need help resetting my password...' },
    { id: 2, title: 'VPN Connection Issue', date: '1 week ago', messages: 12, preview: 'Cannot connect to the company VPN...' },
    { id: 3, title: 'Software Installation', date: '2 weeks ago', messages: 3, preview: 'Can you install Microsoft Office?' }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConv, setSelectedConv] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load chat history from API
    const loadChatHistory = async () => {
      try {
        setLoading(true)
        const data = await getChatHistory('demo-employee')
        if (data && data.length > 0) {
          setConversations(data)
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChatHistory()
  }, [])

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.preview.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const copyConversation = () => {
    const text = `Conversation: ${selectedConv.title}\n\n${selectedConv.preview}\n\nMessages: ${selectedConv.messages}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadConversation = () => {
    const text = `Chat History\n\nTitle: ${selectedConv.title}\nDate: ${selectedConv.date}\n\n${selectedConv.preview}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedConv.title}.txt`
    a.click()
  }

  return (
    <div className="rounded-hope border border-hope-border bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-lg font-bold text-hope-ink dark:text-slate-100 mb-4">Chat History</h3>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-3 h-4 w-4 text-hope-secondary" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search conversations..."
          className="w-full rounded-xl border border-hope-border bg-white pl-10 pr-4 py-2 text-hope-ink outline-none focus:border-hope-primary focus:ring-2 focus:ring-hope-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      {/* Conversation List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredConversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => setSelectedConv(conv)}
            className={`p-3 rounded-xl cursor-pointer transition ${
              selectedConv?.id === conv.id
                ? 'bg-hope-primary/10 border border-hope-primary dark:bg-hope-primary/20'
                : 'border border-hope-border hover:bg-hope-canvas dark:border-slate-700 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-hope-ink dark:text-slate-100">{conv.title}</h4>
                <p className="text-xs text-hope-secondary line-clamp-1">{conv.preview}</p>
              </div>
              <span className="text-xs text-hope-secondary ml-2">{conv.date}</span>
            </div>
            <p className="text-xs text-hope-secondary mt-1">{conv.messages} messages</p>
          </div>
        ))}
      </div>

      {/* Selected Conversation Actions */}
      {selectedConv && (
        <div className="mt-4 pt-4 border-t border-hope-border dark:border-slate-700 space-y-2">
          <button
            onClick={copyConversation}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-hope-canvas px-3 py-2 text-sm font-semibold text-hope-ink hover:opacity-75 dark:bg-slate-800 dark:text-slate-100"
          >
            {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Conversation'}
          </button>
          <button
            onClick={downloadConversation}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-hope-canvas px-3 py-2 text-sm font-semibold text-hope-ink hover:opacity-75 dark:bg-slate-800 dark:text-slate-100"
          >
            <FiDownload className="h-4 w-4" />
            Download
          </button>
        </div>
      )}
    </div>
  )
}
