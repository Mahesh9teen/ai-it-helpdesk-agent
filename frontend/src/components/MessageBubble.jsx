import MarkdownIt from 'markdown-it'
import markdownItHighlightjs from 'markdown-it-highlightjs'
import React from 'react'

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true,
}).use(markdownItHighlightjs)

const sourceHref = (source) => {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return source
  }
  return `/docs/${encodeURIComponent(source)}`
}

export default function MessageBubble({ message }) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`max-w-[92%] rounded-2xl border px-4 py-3 shadow-sm ${isAssistant ? 'border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100' : 'ml-auto border-indigo-200 bg-indigo-50 text-slate-800 dark:border-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-50'}`}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">{isAssistant ? 'Assistant' : 'You'}</p>
      <div className="markdown-body text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: markdown.render(message.text || '') }} />
      {isAssistant && Array.isArray(message.citations) && message.citations.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200/70 pt-3 dark:border-slate-700">
          {message.citations.map((source) => (
            <a
              key={`${message.id}-${source}`}
              href={sourceHref(source)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {source}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
