import MessageBubble from './MessageBubble.jsx'
import React from 'react'
import useChatStream from '../hooks/useChatStream.js'

export default function ChatWindow({ employeeId }) {
  const {
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
  } = useChatStream(employeeId)

  const onSubmit = (event) => {
    event.preventDefault()
    sendMessage()
  }

  return (
    <article className="flex min-h-[72vh] flex-col rounded-2xl border border-slate-200/70 bg-white/85 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
      <header
        className={`rounded-t-2xl border-b px-5 py-4 transition-colors ${
          isEscalated
            ? 'border-amber-300 bg-amber-50/80 dark:border-amber-700 dark:bg-amber-900/30'
            : 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/40'
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Chat Workspace</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Ask IT anything</h2>
          {isEscalated ? (
            <span className="rounded-full border border-amber-400/70 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
              Escalated to human support
            </span>
          ) : null}
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => setInput(action.prompt)}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200 dark:hover:bg-indigo-900"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            placeholder="Describe your IT issue or request..."
            className="min-h-[70px] flex-1 resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={isStreaming}
            className="h-11 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isStreaming ? 'Streaming...' : 'Send'}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            Upload Screenshot
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => uploadScreenshot(event.target.files?.[0])}
            />
          </label>
          <label className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            Upload Voice
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(event) => transcribeAudio(event.target.files?.[0])}
            />
          </label>
          <button
            type="button"
            onClick={() => setVoiceMode(!voiceMode)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Voice Mode: {voiceMode ? 'On' : 'Off'}
          </button>
        </div>
        {employeeId ? null : (
          <p className="text-xs text-slate-500 dark:text-slate-400">Tip: set an employee UUID in the top bar for personalized ticket and leave responses.</p>
        )}
        {error ? <p className="text-xs font-medium text-rose-600 dark:text-rose-300">{error}</p> : null}
      </form>
    </article>
  )
}
