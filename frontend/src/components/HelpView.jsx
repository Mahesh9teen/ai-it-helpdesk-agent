import React, { useState } from 'react'
import { FiChevronDown, FiSearch, FiBook, FiVideo, FiMessageCircle } from 'react-icons/fi'

const faqs = [
  {
    category: 'Getting Started',
    items: [
      { q: 'How do I submit a ticket?', a: 'Click the "New Ticket" button, fill in the details about your issue, and submit. Your ticket will be assigned to an available agent.' },
      { q: 'What information should I include in a ticket?', a: 'Include a clear description of the issue, steps to reproduce it, what you\'ve already tried, and any error messages you received.' },
      { q: 'How long does it take to get a response?', a: 'Response times depend on ticket priority. Critical issues: 30 min, High: 2 hours, Medium: 4 hours, Low: 24 hours.' },
    ]
  },
  {
    category: 'Account & Access',
    items: [
      { q: 'How do I reset my password?', a: 'Use the "Forgot Password" option on the login page, or contact the IT support team directly for assistance.' },
      { q: 'Can I access tickets on mobile?', a: 'Yes, the helpdesk system is fully responsive and works on mobile devices.' },
      { q: 'How do I update my profile?', a: 'Go to Settings > Profile to update your personal information and preferences.' },
    ]
  },
  {
    category: 'Common Issues',
    items: [
      { q: 'What should I do if I\'m having connectivity issues?', a: 'Try restarting your device first, check your network connection, and then contact IT support with error details.' },
      { q: 'How do I configure my email client?', a: 'Visit the Help Center > Email Setup section for step-by-step instructions for popular email clients.' },
      { q: 'Why is my license showing as expired?', a: 'Contact the IT Management team to renew your software licenses.' },
    ]
  },
]

export default function HelpView() {
  const [expandedCategories, setExpandedCategories] = useState(new Set([faqs[0].category]))
  const [searchTerm, setSearchTerm] = useState('')

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <article className="hope-card p-6">
        <h2 className="text-2xl font-bold text-hope-ink dark:text-slate-100">Help Center</h2>
        <p className="mt-1 text-hope-secondary">Find answers and documentation for the IT helpdesk system</p>
      </article>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <article className="hope-card p-6 transition hover:shadow-lg cursor-pointer dark:hover:shadow-2xl">
          <div className="flex items-center gap-3">
            <FiBook className="h-8 w-8 text-hope-primary" />
            <div>
              <h3 className="font-semibold text-hope-ink dark:text-slate-100">Documentation</h3>
              <p className="text-sm text-hope-secondary">User guides & tutorials</p>
            </div>
          </div>
        </article>
        <article className="hope-card p-6 transition hover:shadow-lg cursor-pointer dark:hover:shadow-2xl">
          <div className="flex items-center gap-3">
            <FiVideo className="h-8 w-8 text-hope-warning" />
            <div>
              <h3 className="font-semibold text-hope-ink dark:text-slate-100">Video Tutorials</h3>
              <p className="text-sm text-hope-secondary">Step-by-step guides</p>
            </div>
          </div>
        </article>
        <article className="hope-card p-6 transition hover:shadow-lg cursor-pointer dark:hover:shadow-2xl">
          <div className="flex items-center gap-3">
            <FiMessageCircle className="h-8 w-8 text-hope-success" />
            <div>
              <h3 className="font-semibold text-hope-ink dark:text-slate-100">Contact Support</h3>
              <p className="text-sm text-hope-secondary">Chat with our team</p>
            </div>
          </div>
        </article>
      </div>

      {/* Search */}
      <article className="hope-card p-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-3 text-hope-secondary" />
          <input
            type="text"
            placeholder="Search help topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-hope border border-hope-border bg-white pl-10 pr-4 py-2 text-hope-ink placeholder-hope-secondary transition focus:border-hope-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </article>

      {/* FAQ Accordion */}
      <article className="hope-card">
        <div className="divide-y divide-hope-border dark:divide-slate-700">
          {(filteredFaqs.length > 0 ? filteredFaqs : faqs).map(category => (
            <div key={category.category}>
              <button
                onClick={() => toggleCategory(category.category)}
                className="flex w-full items-center justify-between p-6 text-left transition hover:bg-hope-canvas dark:hover:bg-slate-800"
              >
                <h3 className="text-lg font-semibold text-hope-ink dark:text-slate-100">{category.category}</h3>
                <FiChevronDown
                  className={`transition transform ${expandedCategories.has(category.category) ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedCategories.has(category.category) && (
                <div className="border-t border-hope-border space-y-0 dark:border-slate-700">
                  {category.items.map((item, idx) => (
                    <div key={idx} className="border-t border-hope-border px-6 py-4 first:border-t-0 dark:border-slate-700">
                      <h4 className="font-semibold text-hope-ink dark:text-slate-100">{item.q}</h4>
                      <p className="mt-2 text-hope-secondary">{item.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </article>

      {/* Still Need Help */}
      <article className="hope-card p-6 border-l-4 border-l-hope-primary">
        <h3 className="text-lg font-semibold text-hope-ink dark:text-slate-100">Still need help?</h3>
        <p className="mt-2 text-hope-secondary">If you can\'t find what you\'re looking for, submit a ticket and our support team will help you as soon as possible.</p>
        <button className="mt-4 hope-btn-primary">
          Submit a Ticket
        </button>
      </article>
    </div>
  )
}
