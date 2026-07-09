import { useState } from 'react';
import { FiHardDrive, FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiSearch, FiTag } from 'react-icons/fi';

/**
 * AssetManagement.jsx
 * 
 * Track company hardware and software assets
 * Features:
 * - Inventory tracking
 * - Asset assignment to employees
 * - Serial number tracking
 * - Depreciation tracking
 * - Asset status (active, decommissioned, repair, etc.)
 * - Bulk import/export
 */

const ASSET_TYPES = ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Router', 'License', 'Phone'];
const ASSET_STATUS = ['Active', 'In Repair', 'Decommissioned', 'Spare', 'Lost'];

const INITIAL_ASSETS = [
  {
    id: 'AST-001',
    type: 'Laptop',
    model: 'MacBook Pro 16"',
    serial: 'C02Y12345ABC',
    assignee: 'Sarah Mitchell',
    purchaseDate: '2023-06-15',
    status: 'Active',
    warranty: '2025-06-15',
    value: 2500,
    location: 'Office'
  },
  {
    id: 'AST-002',
    type: 'Laptop',
    model: 'Dell XPS 13',
    serial: 'DELL123456',
    assignee: 'Chen Wei',
    purchaseDate: '2023-08-20',
    status: 'Active',
    warranty: '2025-08-20',
    value: 1800,
    location: 'Office'
  },
  {
    id: 'AST-003',
    type: 'Monitor',
    model: 'LG 27" UltraWide',
    serial: 'LG789XYZ',
    assignee: 'Alex Rodriguez',
    purchaseDate: '2022-11-10',
    status: 'Active',
    warranty: '2024-11-10',
    value: 800,
    location: 'Office'
  },
  {
    id: 'AST-004',
    type: 'License',
    model: 'Microsoft 365 Business',
    serial: 'M365-LICENSE-001',
    assignee: 'Jay Patel',
    purchaseDate: '2026-01-01',
    status: 'Active',
    warranty: '2027-01-01',
    value: 150,
    location: 'Digital'
  },
  {
    id: 'AST-005',
    type: 'Printer',
    model: 'HP LaserJet Pro',
    serial: 'HP-5XYZ123',
    assignee: 'Shared',
    purchaseDate: '2021-03-15',
    status: 'In Repair',
    warranty: '2023-03-15',
    value: 500,
    location: 'Office'
  },
  {
    id: 'AST-006',
    type: 'Phone',
    model: 'iPhone 14 Pro',
    serial: 'A2G65XXXXX',
    assignee: 'Emma Clarke',
    purchaseDate: '2022-09-20',
    status: 'Active',
    warranty: '2024-09-20',
    value: 1200,
    location: 'Mobile'
  }
];

function AssetManagement() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Laptop',
    model: '',
    serial: '',
    assignee: '',
    purchaseDate: '',
    status: 'Active',
    warranty: '',
    value: 0,
    location: 'Office'
  });

  const handleSave = () => {
    if (editingId) {
      setAssets(assets.map(a =>
        a.id === editingId ? { ...a, ...formData } : a
      ));
      setEditingId(null);
    } else {
      setAssets([...assets, {
        id: `AST-${String(Math.max(...assets.map(a => parseInt(a.id.split('-')[1])), 0) + 1).padStart(3, '0')}`,
        ...formData
      }]);
    }
    setFormData({ type: 'Laptop', model: '', serial: '', assignee: '', purchaseDate: '', status: 'Active', warranty: '', value: 0, location: 'Office' });
    setShowForm(false);
  };

  const handleEdit = (asset) => {
    setFormData(asset);
    setEditingId(asset.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const filteredAssets = assets.filter(a =>
    a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.assignee.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
  const activeAssets = assets.filter(a => a.status === 'Active').length;
  const warrantyExpiring = assets.filter(a => {
    const warranty = new Date(a.warranty);
    const today = new Date();
    const daysUntilExpiry = (warranty - today) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry < 90 && daysUntilExpiry > 0;
  }).length;

  const statusColors = {
    'Active': 'bg-green-100 text-green-800',
    'In Repair': 'bg-yellow-100 text-yellow-800',
    'Decommissioned': 'bg-gray-100 text-gray-800',
    'Spare': 'bg-blue-100 text-blue-800',
    'Lost': 'bg-red-100 text-red-800'
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiHardDrive className="text-2xl text-orange-600" />
          <h1 className="text-3xl font-bold">Asset Management</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ type: 'Laptop', model: '', serial: '', assignee: '', purchaseDate: '', status: 'Active', warranty: '', value: 0, location: 'Office' }); }}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 flex items-center gap-2"
        >
          <FiPlus /> Add Asset
        </button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Total Assets</p>
          <p className="text-2xl font-bold text-orange-600">{assets.length}</p>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeAssets}</p>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Warranty Expiring</p>
          <p className="text-2xl font-bold text-yellow-600">{warrantyExpiring}</p>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Total Value</p>
          <p className="text-2xl font-bold text-purple-600">${totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-orange-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Asset' : 'Add New Asset'}</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="border rounded px-3 py-2"
            >
              {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="text"
              placeholder="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Serial Number"
              value={formData.serial}
              onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Assignee"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="border rounded px-3 py-2"
            >
              {ASSET_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="date"
              placeholder="Warranty Expiry"
              value={formData.warranty}
              onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Value ($)"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 flex items-center gap-2"
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

      {/* Search */}
      <div className="mb-6 relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search assets by ID, type, model, serial, or assignee..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border rounded px-10 py-2"
        />
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="text-left p-3 font-bold">Asset ID</th>
              <th className="text-left p-3 font-bold">Type</th>
              <th className="text-left p-3 font-bold">Model</th>
              <th className="text-left p-3 font-bold">Serial</th>
              <th className="text-left p-3 font-bold">Assignee</th>
              <th className="text-left p-3 font-bold">Purchase</th>
              <th className="text-left p-3 font-bold">Warranty</th>
              <th className="text-left p-3 font-bold">Status</th>
              <th className="text-left p-3 font-bold">Value</th>
              <th className="text-center p-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(asset => (
              <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 font-mono font-bold text-xs">{asset.id}</td>
                <td className="p-3 font-medium">{asset.type}</td>
                <td className="p-3">{asset.model}</td>
                <td className="p-3 font-mono text-xs">{asset.serial}</td>
                <td className="p-3">{asset.assignee}</td>
                <td className="p-3 text-xs">{asset.purchaseDate}</td>
                <td className="p-3 text-xs">{asset.warranty}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[asset.status]}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="p-3">${asset.value}</td>
                <td className="p-3 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(asset)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredAssets.length} of {assets.length} assets
      </div>
    </div>
  );
}

export default AssetManagement;
