import { useState } from 'react';
import { FiCopy, FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiChevronDown } from 'react-icons/fi';

/**
 * TicketTemplates.jsx
 * 
 * Pre-built ticket types with auto-fill
 * Features:
 * - Multiple templates (Hardware, Software, Account, etc.)
 * - Create new templates
 * - Edit/delete templates
 * - Quick create from template
 * - Template preview
 */

const INITIAL_TEMPLATES = [
  {
    id: 1,
    name: 'Hardware Issue',
    category: 'Hardware',
    priority: 'medium',
    description: 'My [DEVICE] is not working properly. The issue is: [DESCRIPTION]. I need this resolved by [DATE].',
    fields: ['DEVICE', 'DESCRIPTION', 'DATE'],
    usage_count: 342,
    created: '2026-06-01'
  },
  {
    id: 2,
    name: 'Software Installation',
    category: 'Software',
    priority: 'medium',
    description: 'I need to request installation of [SOFTWARE] on my machine. Business justification: [JUSTIFICATION]. Expected date needed: [DATE].',
    fields: ['SOFTWARE', 'JUSTIFICATION', 'DATE'],
    usage_count: 215,
    created: '2026-06-05'
  },
  {
    id: 3,
    name: 'Password Reset',
    category: 'Account',
    priority: 'high',
    description: 'I am unable to log in to [APPLICATION]. I have tried resetting my password but still cannot access the system.',
    fields: ['APPLICATION'],
    usage_count: 478,
    created: '2026-06-10'
  },
  {
    id: 4,
    name: 'Network Connectivity',
    category: 'Network',
    priority: 'high',
    description: 'I am experiencing [ISSUE] with my network connection. Device: [DEVICE]. Impact: [IMPACT].',
    fields: ['ISSUE', 'DEVICE', 'IMPACT'],
    usage_count: 156,
    created: '2026-06-15'
  }
];

function TicketTemplates() {
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hardware',
    priority: 'medium',
    description: ''
  });

  const handleSave = () => {
    if (editingId) {
      setTemplates(templates.map(t =>
        t.id === editingId ? { ...t, ...formData } : t
      ));
      setEditingId(null);
    } else {
      setTemplates([...templates, {
        id: Math.max(...templates.map(t => t.id), 0) + 1,
        ...formData,
        fields: extractFields(formData.description),
        usage_count: 0,
        created: new Date().toISOString().split('T')[0]
      }]);
    }
    setFormData({ name: '', category: 'Hardware', priority: 'medium', description: '' });
    setShowForm(false);
  };

  const extractFields = (text) => {
    const matches = text.match(/\[([A-Z_]+)\]/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  };

  const handleEdit = (template) => {
    setFormData(template);
    setEditingId(template.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleUseTemplate = (template) => {
    // Fill in the fields
    let filled = template.description;
    template.fields.forEach(field => {
      filled = filled.replace(`[${field}]`, `[Enter ${field}]`);
    });
    console.log('Using template:', filled);
  };

  const categoryColors = {
    'Hardware': 'bg-blue-100 text-blue-800',
    'Software': 'bg-purple-100 text-purple-800',
    'Account': 'bg-red-100 text-red-800',
    'Network': 'bg-green-100 text-green-800',
    'Other': 'bg-gray-100 text-gray-800'
  };

  const priorityColors = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-red-100 text-red-800'
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiCopy className="text-2xl text-green-600" />
          <h1 className="text-3xl font-bold">Ticket Templates</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', category: 'Hardware', priority: 'medium', description: '' }); }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <FiPlus /> New Template
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Template' : 'Create New Template'}</h2>
          <input
            type="text"
            placeholder="Template Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-4"
          />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Account">Account</option>
              <option value="Network">Network</option>
            </select>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <textarea
            placeholder="Description (Use [FIELD_NAME] for dynamic fields)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="6"
            className="w-full border rounded px-3 py-2 mb-4"
          />
          <div className="text-sm text-gray-600 mb-4">
            Tip: Use [BRACKETS] for fields that will be filled in. Example: "Device: [DEVICE_NAME]"
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
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

      {/* Templates Grid */}
      <div className="space-y-3">
        {templates.map(template => (
          <div key={template.id} className="border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div
              className="bg-gradient-to-r from-green-50 to-blue-50 p-4 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
            >
              <div className="flex-1">
                <h3 className="font-bold text-lg">{template.name}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[template.category]}`}>
                    {template.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[template.priority]}`}>
                    {template.priority.charAt(0).toUpperCase() + template.priority.slice(1)} Priority
                  </span>
                  <span className="text-gray-600">📊 Used {template.usage_count} times</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(template); }}
                  className="text-blue-600 hover:text-blue-800 p-2"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <FiTrash2 />
                </button>
                <FiChevronDown className={`transition-transform ${expandedId === template.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {expandedId === template.id && (
              <div className="p-4 bg-white border-t-2 border-gray-200">
                <h4 className="font-semibold mb-2">Preview:</h4>
                <p className="bg-gray-50 p-3 rounded text-gray-700 mb-4">{template.description}</p>
                {template.fields.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Fields to fill:</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.fields.map((field, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-mono">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <FiCopy /> Use Template
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TicketTemplates;
