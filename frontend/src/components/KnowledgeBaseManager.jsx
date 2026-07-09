import { useState, useEffect } from 'react';
import {
  FiBook, FiEdit, FiTrash2, FiPlus, FiSearch, FiTag, FiEye,
  FiChevronDown, FiChevronUp, FiCheck, FiX, FiClock, FiUser
} from 'react-icons/fi';

/**
 * KnowledgeBaseManager.jsx
 * 
 * Create, manage, and search KB articles
 * Features:
 * - Create new articles
 * - Search by title/content
 * - Category filtering
 * - Edit/delete articles
 * - View count tracking
 * - Publish/draft status
 */

const CATEGORIES = ['Hardware', 'Software', 'Account', 'Network', 'Email', 'Other'];
const INITIAL_ARTICLES = [
  {
    id: 1,
    title: 'How to Reset Your Password',
    category: 'Account',
    content: 'Steps to reset your password: 1. Go to login page 2. Click Forgot Password 3. Enter email 4. Follow email instructions',
    status: 'published',
    views: 1250,
    created: '2026-06-01',
    updated: '2026-07-01',
    author: 'admin'
  },
  {
    id: 2,
    title: 'Connecting to Office WiFi',
    category: 'Network',
    content: 'WiFi SSID: CompanyWiFi-5G or CompanyWiFi-2.4G. Password available in company handbook or contact IT.',
    status: 'published',
    views: 892,
    created: '2026-06-05',
    updated: '2026-06-20',
    author: 'admin'
  },
  {
    id: 3,
    title: 'Setting Up Outlook',
    category: 'Email',
    content: 'Server: mail.company.com, IMAP port 993. Use your full email address and company password.',
    status: 'published',
    views: 567,
    created: '2026-06-10',
    updated: '2026-06-25',
    author: 'admin'
  },
  {
    id: 4,
    title: 'Request Software License',
    category: 'Software',
    content: 'Draft article: Please submit software requests through the helpdesk with business justification.',
    status: 'draft',
    views: 0,
    created: '2026-07-05',
    updated: '2026-07-05',
    author: 'sarah'
  }
];

function KnowledgeBaseManager() {
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Hardware',
    content: '',
    status: 'published'
  });

  const filteredArticles = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'All' || a.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleSave = () => {
    if (editingId) {
      setArticles(articles.map(a =>
        a.id === editingId
          ? { ...a, ...formData, updated: new Date().toISOString().split('T')[0] }
          : a
      ));
      setEditingId(null);
    } else {
      setArticles([...articles, {
        id: Math.max(...articles.map(a => a.id), 0) + 1,
        ...formData,
        views: 0,
        created: new Date().toISOString().split('T')[0],
        updated: new Date().toISOString().split('T')[0],
        author: 'current_user'
      }]);
    }
    setFormData({ title: '', category: 'Hardware', content: '', status: 'published' });
    setShowForm(false);
  };

  const handleEdit = (article) => {
    setFormData(article);
    setEditingId(article.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setArticles(articles.filter(a => a.id !== id));
  };

  const categoryColors = {
    'Hardware': 'bg-blue-100 text-blue-800',
    'Software': 'bg-purple-100 text-purple-800',
    'Account': 'bg-red-100 text-red-800',
    'Network': 'bg-green-100 text-green-800',
    'Email': 'bg-orange-100 text-orange-800',
    'Other': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiBook className="text-2xl text-blue-600" />
          <h1 className="text-3xl font-bold">Knowledge Base Manager</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: '', category: 'Hardware', content: '', status: 'published' }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FiPlus /> New Article
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Article' : 'Create New Article'}</h2>
          <input
            type="text"
            placeholder="Article Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-4"
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-4"
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <textarea
            placeholder="Article Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows="6"
            className="w-full border rounded px-3 py-2 mb-4"
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-4"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FiCheck /> Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded px-10 py-2"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded ${selectedCategory === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No articles found matching your search
          </div>
        ) : (
          filteredArticles.map(article => (
            <div key={article.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div
                className="bg-gray-50 p-4 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <FiBook className="text-lg text-gray-600" />
                  <div>
                    <h3 className="font-bold text-lg">{article.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[article.category]}`}>
                        {article.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                      </span>
                      <FiEye className="inline" /> {article.views} views
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(article); }}
                    className="text-blue-600 hover:text-blue-800 p-2"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <FiTrash2 />
                  </button>
                  {expandedId === article.id ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>

              {expandedId === article.id && (
                <div className="p-4 bg-white border-t">
                  <p className="text-gray-700 mb-3">{article.content}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>Created by {article.author} on {article.created}</div>
                    <div>Last updated {article.updated}</div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        Showing {filteredArticles.length} of {articles.length} articles
      </div>
    </div>
  );
}

export default KnowledgeBaseManager;
