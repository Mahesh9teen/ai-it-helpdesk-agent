import React, { useState } from 'react'
import { FiX, FiSend, FiClock, FiUser, FiCheck, FiAlertCircle } from 'react-icons/fi'

export default function TicketDetail({ ticket, onClose, onAddComment }) {
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([
    { id: 1, author: 'John Support', text: 'Initial assessment: User unable to login', time: '2 hours ago', isSystem: false },
    { id: 2, author: 'System', text: 'Ticket moved from OPEN to IN PROGRESS', time: '1.5 hours ago', isSystem: true },
    { id: 3, author: 'Sarah Admin', text: 'Checking credentials in the system...', time: '1 hour ago', isSystem: false },
  ])

  const handleAddComment = () => {
    if (!commentText.trim()) return

    const newComment = {
      id: comments.length + 1,
      author: 'Support Agent',
      text: commentText,
      time: 'Just now',
      isSystem: false,
    }

    setComments([...comments, newComment])
    setCommentText('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddComment()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="h-full max-h-screen w-full max-w-2xl flex flex-col rounded-hope bg-white dark:bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="border-b border-hope-border p-6 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-hope-secondary">{ticket.id}</p>
              <h2 className="text-xl font-bold text-hope-ink dark:text-slate-100 mt-1">{ticket.title}</h2>
              <p className="text-sm text-hope-secondary mt-2">{ticket.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-hope-secondary hover:text-hope-ink dark:hover:text-slate-100"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Ticket Info Grid */}
        <div className="grid grid-cols-2 gap-4 border-b border-hope-border p-6 dark:border-slate-700 md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold text-hope-secondary uppercase">Status</p>
            <p className="mt-1 font-semibold text-hope-ink dark:text-slate-100">{ticket.status}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-hope-secondary uppercase">Priority</p>
            <p className="mt-1 font-semibold text-hope-ink dark:text-slate-100">{ticket.priority}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-hope-secondary uppercase">Assigned</p>
            <p className="mt-1 font-semibold text-hope-ink dark:text-slate-100">{ticket.assigned_to}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-hope-secondary uppercase">Category</p>
            <p className="mt-1 font-semibold text-hope-ink dark:text-slate-100">{ticket.category}</p>
          </div>
        </div>

        {/* Activity/Comments Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="font-bold text-hope-ink dark:text-slate-100 mb-4">Activity & Comments</h3>

          <div className="space-y-4">
            {comments.map(comment => (
              <div
                key={comment.id}
                className={`rounded-hope p-4 ${
                  comment.isSystem
                    ? 'bg-hope-canvas dark:bg-slate-800 border border-hope-border dark:border-slate-700'
                    : 'bg-white dark:bg-slate-900 border border-hope-border dark:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {comment.isSystem ? (
                        <FiAlertCircle className="h-4 w-4 text-hope-secondary" />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-hope-primary text-xs font-bold text-white">
                          {comment.author.charAt(0)}
                        </div>
                      )}
                      <p className="font-semibold text-hope-ink dark:text-slate-100">{comment.author}</p>
                      <p className="text-xs text-hope-secondary">{comment.time}</p>
                    </div>
                    <p className="mt-2 text-sm text-hope-ink dark:text-slate-300">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comment Input */}
        <div className="border-t border-hope-border p-6 dark:border-slate-700">
          <div className="space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a comment... (Ctrl+Enter to send)"
              rows="3"
              className="w-full rounded-xl border border-hope-border bg-hope-canvas px-4 py-3 text-hope-ink outline-none focus:border-hope-primary focus:ring-2 focus:ring-hope-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="flex items-center gap-2 rounded-xl bg-hope-primary px-4 py-2 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend className="h-4 w-4" />
                Send Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
