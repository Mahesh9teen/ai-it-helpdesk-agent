import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  FiMonitor, FiAlertCircle, FiCheckCircle, FiSearch,
  FiRefreshCw, FiShield, FiWifi, FiClock, FiSliders,
  FiAlertTriangle, FiUser, FiHardDrive, FiCpu, FiLock,
  FiChevronRight, FiDownload, FiX
} from 'react-icons/fi'

/* ── Mock fleet data ── */
const OS_LIST   = ['Windows 11 23H2', 'Windows 10 22H2', 'macOS 15 Sequoia', 'macOS 14 Sonoma', 'Ubuntu 24.04']
const DEPTS     = ['Engineering', 'Marketing', 'Finance', 'HR', 'Operations', 'Product']
const OWNERS    = ['Sarah Mitchell', 'Chen Wei', 'Jay Patel', 'Emma Clarke', 'Alex Rodriguez', 'Priya Sharma', 'Dan Harris', 'Mia Nguyen']
const MODELS    = ['MacBook Pro 16"', 'Dell XPS 13', 'HP EliteBook 840', 'Lenovo ThinkPad X1', 'MacBook Air M3', 'Surface Pro 11']

const PATCH_STATUSES = {
  current:    { label: 'Up to Date',   color: 'bg-green-100 text-green-800',  dot: 'bg-green-500' },
  pending:    { label: 'Patch Pending',color: 'bg-yellow-100 text-yellow-800',dot: 'bg-yellow-500' },
  critical:   { label: 'Critical Missing',color:'bg-red-100 text-red-800',   dot: 'bg-red-500' },
  rebooting:  { label: 'Needs Reboot', color: 'bg-orange-100 text-orange-800',dot: 'bg-orange-500' },
}

const COMPLIANCE_STATES = {
  compliant:     { label: 'Compliant',     color: 'text-green-700'  },
  non_compliant: { label: 'Non-Compliant', color: 'text-red-700'    },
  unknown:       { label: 'Unknown',       color: 'text-gray-500'   },
}

const FLEET = [
  { id: 'DEV-001', name: 'MACBOOK-SARAH',    os: 'macOS 15 Sequoia', model: 'MacBook Pro 16"',    owner: 'Sarah Mitchell', dept: 'Engineering', patch: 'current',  edr: true, encryption: true, compliance: 'compliant',     lastSeen: '2 min ago',  cpu: 18, ram: 62, disk: 45, battery: 87, os_ver: '15.4.1' },
  { id: 'DEV-002', name: 'LAPTOP-CHEN01',    os: 'Windows 11 23H2',  model: 'Dell XPS 13',        owner: 'Chen Wei',       dept: 'Engineering', patch: 'pending',  edr: true, encryption: true, compliance: 'compliant',     lastSeen: '5 min ago',  cpu: 45, ram: 78, disk: 67, battery: 54, os_ver: '23H2' },
  { id: 'DEV-003', name: 'LAPTOP-JAY01',     os: 'Windows 11 23H2',  model: 'HP EliteBook 840',   owner: 'Jay Patel',      dept: 'Operations',  patch: 'critical', edr: true, encryption: false, compliance: 'non_compliant', lastSeen: '12 min ago', cpu: 65, ram: 85, disk: 88, battery: 23, os_ver: '23H2' },
  { id: 'DEV-004', name: 'MACBOOK-EMMA',     os: 'macOS 14 Sonoma',  model: 'MacBook Air M3',     owner: 'Emma Clarke',    dept: 'Marketing',   patch: 'rebooting',edr: true, encryption: true, compliance: 'compliant',     lastSeen: '1 min ago',  cpu: 12, ram: 40, disk: 30, battery: 95, os_ver: '14.5' },
  { id: 'DEV-005', name: 'LAPTOP-ALEX01',    os: 'Windows 10 22H2',  model: 'Lenovo ThinkPad X1', owner: 'Alex Rodriguez', dept: 'Finance',     patch: 'critical', edr: false, encryption: true, compliance: 'non_compliant', lastSeen: '3h ago',     cpu: 5,  ram: 35, disk: 52, battery: 12, os_ver: '22H2' },
  { id: 'DEV-006', name: 'LAPTOP-PRIYA01',   os: 'Ubuntu 24.04',     model: 'Dell XPS 13',        owner: 'Priya Sharma',   dept: 'Engineering', patch: 'current',  edr: true, encryption: true, compliance: 'compliant',     lastSeen: '8 min ago',  cpu: 32, ram: 58, disk: 41, battery: 76, os_ver: '24.04 LTS' },
  { id: 'DEV-007', name: 'LAPTOP-DAN01',     os: 'Windows 11 23H2',  model: 'Surface Pro 11',     owner: 'Dan Harris',     dept: 'HR',          patch: 'pending',  edr: true, encryption: true, compliance: 'compliant',     lastSeen: '20 min ago', cpu: 8,  ram: 28, disk: 22, battery: 68, os_ver: '23H2' },
  { id: 'DEV-008', name: 'MACBOOK-MIA',      os: 'macOS 15 Sequoia', model: 'MacBook Pro 16"',    owner: 'Mia Nguyen',     dept: 'Product',     patch: 'current',  edr: true, encryption: true, compliance: 'compliant',     lastSeen: 'just now',   cpu: 28, ram: 55, disk: 38, battery: 91, os_ver: '15.4.1' },
]

const PATCH_HISTORY = [
  { month: 'Mar', patched: 85, total: 90 }, { month: 'Apr', patched: 88, total: 91 },
  { month: 'May', patched: 90, total: 92 }, { month: 'Jun', patched: 87, total: 93 },
  { month: 'Jul', patched: 84, total: 93 },
]

function UtilBar({ value, label, color }) {
  const bg = value >= 90 ? 'bg-red-500' : value >= 70 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100"><div className={`h-2 rounded-full ${bg}`} style={{ width: `${value}%` }} /></div>
      <span className={`w-8 text-right font-medium ${value >= 90 ? 'text-red-600' : 'text-gray-700'}`}>{value}%</span>
    </div>
  )
}

export default function DeviceHealthCenter() {
  const [query,      setQuery]     = useState('')
  const [patchFilter,setPatch]     = useState('all')
  const [selected,   setSelected]  = useState(null)
  const [action,     setAction]    = useState(null)

  const filtered = FLEET.filter(d =>
    (patchFilter === 'all' || d.patch === patchFilter) &&
    (!query || d.name.toLowerCase().includes(query.toLowerCase()) ||
               d.owner.toLowerCase().includes(query.toLowerCase()) ||
               d.dept.toLowerCase().includes(query.toLowerCase()))
  )

  const selectedDev = selected ? FLEET.find(d => d.id === selected) : null

  const stats = {
    total:        FLEET.length,
    compliant:    FLEET.filter(d => d.compliance === 'compliant').length,
    critical:     FLEET.filter(d => d.patch === 'critical').length,
    noEdr:        FLEET.filter(d => !d.edr).length,
    noEncryption: FLEET.filter(d => !d.encryption).length,
  }

  const patchSummary = [
    { label: 'Up to Date',        count: FLEET.filter(d => d.patch === 'current').length,   color: '#10b981' },
    { label: 'Patch Pending',     count: FLEET.filter(d => d.patch === 'pending').length,   color: '#f59e0b' },
    { label: 'Critical Missing',  count: FLEET.filter(d => d.patch === 'critical').length,  color: '#ef4444' },
    { label: 'Needs Reboot',      count: FLEET.filter(d => d.patch === 'rebooting').length, color: '#f97316' },
  ]

  const handleAction = (act, devId) => {
    setAction({ act, devId })
    setTimeout(() => setAction(null), 2500)
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Device Health Center</h1>
          <p className="text-gray-500 text-sm mt-0.5">MDM-style fleet management — patch status, compliance, remote actions</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
          <FiRefreshCw /> Sync MDM
        </button>
      </div>

      {/* Action Toast */}
      {action && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-300 p-3 flex items-center gap-2 text-sm text-green-800">
          <FiCheckCircle className="shrink-0" />
          <strong>{action.act}</strong> command sent to {FLEET.find(d => d.id === action.devId)?.name}. Agent will execute within 60 seconds.
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-5">
        {[
          { label: 'Total Devices',   value: stats.total,       icon: FiMonitor,  c: 'border-indigo-400', t: 'text-indigo-700' },
          { label: 'Compliant',       value: stats.compliant,   icon: FiCheckCircle, c: 'border-green-400', t: 'text-green-700' },
          { label: 'Critical Patch',  value: stats.critical,    icon: FiAlertTriangle, c: 'border-red-400', t: 'text-red-700' },
          { label: 'No EDR',          value: stats.noEdr,       icon: FiShield,   c: 'border-orange-400', t: 'text-orange-700' },
          { label: 'No Encryption',   value: stats.noEncryption,icon: FiLock,     c: 'border-yellow-400', t: 'text-yellow-700' },
        ].map(k => {
          const KIcon = k.icon
          return (
            <div key={k.label} className={`rounded-xl border-l-4 ${k.c} bg-white p-4 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500 font-medium">{k.label}</p><p className={`text-2xl font-extrabold mt-0.5 ${k.t}`}>{k.value}</p></div>
                <KIcon className={`text-xl ${k.t} opacity-60`} />
              </div>
            </div>
          )
        })}
      </div>

      <div className={`${selectedDev ? 'grid gap-5 lg:grid-cols-[1fr_320px]' : ''}`}>
        <div className="space-y-5">
          {/* Charts Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Patch Status Distribution</h3>
              <div className="space-y-2.5">
                {patchSummary.map(p => (
                  <div key={p.label}>
                    <div className="flex justify-between text-xs mb-0.5 text-gray-600"><span>{p.label}</span><span className="font-semibold">{p.count}/{FLEET.length}</span></div>
                    <div className="h-2.5 rounded-full bg-gray-100">
                      <div className="h-2.5 rounded-full" style={{ width: `${(p.count/FLEET.length)*100}%`, background: p.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Patch Compliance Trend</h3>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={PATCH_HISTORY}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="patched" name="Patched" fill="#10b981" radius={[4,4,0,0]}>
                    {PATCH_HISTORY.map((_, i) => <Cell key={i} fill={_.patched >= 88 ? '#10b981' : '#f59e0b'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filter + Device Table */}
          <div>
            <div className="flex gap-3 mb-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                <input placeholder="Search devices, owners, departments…" value={query} onChange={e => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="flex gap-1 flex-wrap">
                {['all', ...Object.keys(PATCH_STATUSES)].map(s => (
                  <button key={s} onClick={() => setPatch(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${patchFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {s === 'all' ? 'All' : PATCH_STATUSES[s].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{['Device','OS','Owner / Dept','Patch','EDR','Encryption','Compliance','Last Seen','Actions'].map(h =>
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map(d => {
                    const pCfg = PATCH_STATUSES[d.patch]
                    const cCfg = COMPLIANCE_STATES[d.compliance]
                    return (
                      <tr key={d.id} onClick={() => setSelected(d.id === selected ? null : d.id)}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${d.id === selected ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-xs">{d.name}</p>
                          <p className="text-xs text-gray-400">{d.model}</p>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{d.os}</td>
                        <td className="px-3 py-2.5">
                          <p className="text-xs font-medium">{d.owner}</p>
                          <p className="text-xs text-gray-400">{d.dept}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${pCfg.color}`}>
                            {pCfg.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {d.edr ? <FiCheckCircle className="text-green-500 mx-auto" /> : <FiAlertCircle className="text-red-500 mx-auto" />}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {d.encryption ? <FiLock className="text-green-500 mx-auto" /> : <FiAlertCircle className="text-red-500 mx-auto" />}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs font-semibold ${cCfg.color}`}>{cCfg.label}</span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{d.lastSeen}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            {['Patch', 'Reboot', 'Wipe'].map(act => (
                              <button key={act} onClick={e => { e.stopPropagation(); handleAction(act, d.id) }}
                                className={`text-xs rounded px-2 py-1 font-medium transition-colors ${act === 'Wipe' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                {act}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Device Detail Panel */}
        {selectedDev && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 h-fit sticky top-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-bold text-gray-800">{selectedDev.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{selectedDev.model} · {selectedDev.os}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><FiX /></button>
            </div>

            <div className="space-y-1.5 mb-4">
              <UtilBar value={selectedDev.cpu}  label="CPU" />
              <UtilBar value={selectedDev.ram}  label="RAM" />
              <UtilBar value={selectedDev.disk} label="Disk" />
              <UtilBar value={selectedDev.battery} label="Bat." />
            </div>

            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              {[['Owner', selectedDev.owner], ['Department', selectedDev.dept], ['OS Version', selectedDev.os_ver], ['Last Seen', selectedDev.lastSeen]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-gray-500 text-xs">{k}</span>
                  <span className="font-medium text-xs text-right">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {[['EDR', selectedDev.edr], ['Encryption', selectedDev.encryption]].map(([l, v]) => (
                <div key={l} className={`rounded-lg p-2.5 flex items-center gap-1.5 ${v ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {v ? <FiCheckCircle /> : <FiAlertCircle />}
                  <span className="font-medium">{l}: {v ? 'Active' : 'Missing'}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {[
                { act: 'Push Patch Now',   icon: FiDownload, color: 'bg-blue-600 text-white hover:bg-blue-700' },
                { act: 'Remote Reboot',    icon: FiRefreshCw,color: 'bg-yellow-500 text-white hover:bg-yellow-600' },
                { act: 'Remote Wipe',      icon: FiX,        color: 'bg-red-600 text-white hover:bg-red-700' },
                { act: 'Run Diagnostics',  icon: FiSliders,  color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
              ].map(({ act, icon: AIcon, color }) => (
                <button key={act} onClick={() => handleAction(act, selectedDev.id)}
                  className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${color}`}>
                  <AIcon className="shrink-0" /> {act}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
