import { useState } from 'react'
import {
  FiServer, FiDatabase, FiMonitor, FiWifi, FiCloud,
  FiSmartphone, FiShield, FiPackage, FiLink, FiSearch,
  FiChevronRight, FiChevronDown, FiInfo, FiAlertCircle,
  FiCheckCircle, FiGrid, FiList, FiTag
} from 'react-icons/fi'

/* ─── CMDB Data Model ─── */
const CI_TYPES = {
  server:      { label: 'Server',       icon: FiServer,    color: 'bg-slate-100 text-slate-700',   border: 'border-slate-300' },
  database:    { label: 'Database',     icon: FiDatabase,  color: 'bg-blue-100 text-blue-700',     border: 'border-blue-300' },
  application: { label: 'Application',  icon: FiPackage,   color: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-300' },
  network:     { label: 'Network',      icon: FiWifi,      color: 'bg-green-100 text-green-700',   border: 'border-green-300' },
  cloud:       { label: 'Cloud',        icon: FiCloud,     color: 'bg-sky-100 text-sky-700',       border: 'border-sky-300' },
  endpoint:    { label: 'Endpoint',     icon: FiMonitor,   color: 'bg-purple-100 text-purple-700', border: 'border-purple-300' },
  security:    { label: 'Security',     icon: FiShield,    color: 'bg-red-100 text-red-700',       border: 'border-red-300' },
  mobile:      { label: 'Mobile',       icon: FiSmartphone,color: 'bg-orange-100 text-orange-700', border: 'border-orange-300' },
}

const STATUS_CFG = {
  operational: { label: 'Operational', dot: 'bg-green-500',  text: 'text-green-700'  },
  degraded:    { label: 'Degraded',    dot: 'bg-yellow-500', text: 'text-yellow-700' },
  offline:     { label: 'Offline',     dot: 'bg-red-500',    text: 'text-red-700'    },
  maintenance: { label: 'Maintenance', dot: 'bg-blue-500',   text: 'text-blue-700'   },
}

const CIs = [
  /* Cloud / Network Core */
  { id: 'CI-001', name: 'Azure Tenant (Production)', type: 'cloud',      status: 'operational', env: 'Production', owner: 'Platform',  tier: 1, depends: [],                                     location: 'Azure East US',  tags: ['azure','cloud','core'] },
  { id: 'CI-002', name: 'Core Network Switch (HQ)',   type: 'network',    status: 'operational', env: 'Production', owner: 'NetOps',    tier: 1, depends: [],                                     location: 'HQ DataCenter', tags: ['network','switch'] },
  { id: 'CI-003', name: 'Cisco AnyConnect VPN GW',   type: 'security',   status: 'degraded',    env: 'Production', owner: 'NetOps',    tier: 1, depends: ['CI-002'],                             location: 'HQ DataCenter', tags: ['vpn','security'] },

  /* Identity */
  { id: 'CI-004', name: 'Azure Active Directory',     type: 'cloud',      status: 'operational', env: 'Production', owner: 'IAM',       tier: 1, depends: ['CI-001'],                             location: 'Azure',          tags: ['identity','aad'] },
  { id: 'CI-005', name: 'ADFS (Federation Service)',  type: 'server',     status: 'operational', env: 'Production', owner: 'IAM',       tier: 1, depends: ['CI-004', 'CI-002'],                   location: 'HQ DataCenter', tags: ['adfs','sso','auth'] },

  /* M365 */
  { id: 'CI-006', name: 'Microsoft 365 (Exchange)',   type: 'application',status: 'operational', env: 'Production', owner: 'Messaging', tier: 2, depends: ['CI-004'],                             location: 'Microsoft Cloud', tags: ['m365','email'] },
  { id: 'CI-007', name: 'Microsoft Teams',            type: 'application',status: 'operational', env: 'Production', owner: 'Messaging', tier: 2, depends: ['CI-004', 'CI-006'],                   location: 'Microsoft Cloud', tags: ['teams','chat'] },
  { id: 'CI-008', name: 'SharePoint Online',          type: 'application',status: 'operational', env: 'Production', owner: 'Collab',    tier: 2, depends: ['CI-004'],                             location: 'Microsoft Cloud', tags: ['sharepoint','collab'] },

  /* Servers */
  { id: 'CI-009', name: 'Web Server (IIS) — prod-web-01', type: 'server', status: 'operational', env: 'Production', owner: 'Platform', tier: 2, depends: ['CI-001', 'CI-002'],                   location: 'Azure East US',  tags: ['iis','web'] },
  { id: 'CI-010', name: 'App Server — prod-app-01',        type: 'server', status: 'operational', env: 'Production', owner: 'Platform', tier: 2, depends: ['CI-009'],                             location: 'Azure East US',  tags: ['app-server'] },
  { id: 'CI-011', name: 'App Server — prod-app-02',        type: 'server', status: 'maintenance', env: 'Production', owner: 'Platform', tier: 2, depends: ['CI-009'],                             location: 'Azure East US',  tags: ['app-server'] },

  /* Databases */
  { id: 'CI-012', name: 'SQL Server (Primary) — prod-db-01', type: 'database', status: 'operational', env: 'Production', owner: 'DBA', tier: 2, depends: ['CI-010', 'CI-011'],                  location: 'Azure East US',  tags: ['sql','database'] },
  { id: 'CI-013', name: 'SQL Server (Replica) — prod-db-02', type: 'database', status: 'operational', env: 'Production', owner: 'DBA', tier: 2, depends: ['CI-012'],                             location: 'Azure West US',  tags: ['sql','replica'] },
  { id: 'CI-014', name: 'Redis Cache Cluster',               type: 'database', status: 'operational', env: 'Production', owner: 'DBA', tier: 2, depends: ['CI-010'],                             location: 'Azure East US',  tags: ['redis','cache'] },

  /* Business Apps */
  { id: 'CI-015', name: 'Salesforce CRM',             type: 'application',status: 'degraded',    env: 'Production', owner: 'BizApps',   tier: 3, depends: ['CI-004', 'CI-005'],                  location: 'Salesforce Cloud', tags: ['crm','salesforce'] },
  { id: 'CI-016', name: 'Jira / Confluence',          type: 'application',status: 'operational', env: 'Production', owner: 'DevTools',  tier: 3, depends: ['CI-001', 'CI-012'],                  location: 'AWS',             tags: ['jira','confluence'] },
  { id: 'CI-017', name: 'ServiceNow (ITSM)',          type: 'application',status: 'operational', env: 'Production', owner: 'IT',        tier: 3, depends: ['CI-004', 'CI-012'],                  location: 'ServiceNow Cloud', tags: ['itsm','servicenow'] },

  /* Monitoring */
  { id: 'CI-018', name: 'Datadog APM',                type: 'cloud',      status: 'operational', env: 'Production', owner: 'Platform',  tier: 3, depends: ['CI-001'],                             location: 'Datadog Cloud',   tags: ['monitoring','apm'] },
  { id: 'CI-019', name: 'CrowdStrike EDR',            type: 'security',   status: 'operational', env: 'Production', owner: 'SecOps',    tier: 1, depends: ['CI-001'],                             location: 'CrowdStrike Cloud',tags: ['edr','security'] },
]

/* ─── Dependency Tree View ─── */
function DependencyTree({ ci, allCIs, depth = 0, visited = new Set() }) {
  const [expanded, setExpanded] = useState(depth === 0)
  if (visited.has(ci.id)) return null
  visited.add(ci.id)

  const children = ci.depends.map(id => allCIs.find(c => c.id === id)).filter(Boolean)
  const cfg = CI_TYPES[ci.type]
  const sCfg = STATUS_CFG[ci.status]
  const Icon = cfg.icon

  return (
    <div style={{ paddingLeft: depth * 20 }}>
      <div className={`flex items-center gap-2 rounded-lg border ${cfg.border} bg-white px-3 py-2 mb-1.5 cursor-pointer hover:shadow-sm transition-shadow`}
        onClick={() => setExpanded(e => !e)}>
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${cfg.color}`}><Icon className="text-sm" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{ci.name}</p>
          <p className="text-xs text-gray-400">{ci.id} · {ci.location}</p>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium ${sCfg.text}`}>
          <span className={`h-2 w-2 rounded-full ${sCfg.dot}`} />{sCfg.label}
        </span>
        {children.length > 0 && (
          <span className="text-gray-400">{expanded ? <FiChevronDown /> : <FiChevronRight />}</span>
        )}
      </div>
      {expanded && children.map(child => (
        <DependencyTree key={child.id} ci={child} allCIs={allCIs} depth={depth + 1} visited={new Set(visited)} />
      ))}
    </div>
  )
}

/* ─────────── Main Component ─────────── */
export default function CMDBViewer() {
  const [view,      setView]     = useState('grid')
  const [query,     setQuery]    = useState('')
  const [typeFilter,setTypeFilter]= useState('all')
  const [selected,  setSelected] = useState(null)
  const [envFilter, setEnvFilter]= useState('all')
  const [showTree,  setShowTree] = useState(null)

  const filtered = CIs.filter(c =>
    (typeFilter === 'all' || c.type === typeFilter) &&
    (envFilter  === 'all' || c.env  === envFilter) &&
    (!query || c.name.toLowerCase().includes(query.toLowerCase()) || c.id.toLowerCase().includes(query.toLowerCase()) || c.tags.some(t => t.includes(query.toLowerCase())))
  )

  const selectedCI = selected ? CIs.find(c => c.id === selected) : null

  /* dependants: who depends on this CI */
  const getDependants = id => CIs.filter(c => c.depends.includes(id))

  const statusCounts = Object.fromEntries(
    Object.keys(STATUS_CFG).map(s => [s, CIs.filter(c => c.status === s).length])
  )

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">CMDB — Configuration Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configuration Items, dependency mapping, and impact analysis</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(STATUS_CFG).map(([s, cfg]) => (
            <span key={s} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full bg-white border border-gray-200">
              <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
              {statusCounts[s]} {cfg.label}
            </span>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input placeholder="Search by name, ID, or tag…" value={query} onChange={e => setQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none">
          <option value="all">All Types</option>
          {Object.entries(CI_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="flex gap-1 rounded-xl border border-gray-200 p-0.5 bg-gray-50">
          <button onClick={() => setView('grid')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${view==='grid' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}><FiGrid /> Grid</button>
          <button onClick={() => setView('list')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${view==='list' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}><FiList /> List</button>
          <button onClick={() => setView('tree')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${view==='tree' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}><FiLink /> Tree</button>
        </div>
      </div>

      <div className={`${selectedCI ? 'grid gap-5 lg:grid-cols-[1fr_340px]' : ''}`}>
        {/* CI List / Grid */}
        <div>
          {/* GRID VIEW */}
          {view === 'grid' && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(ci => {
                const cfg = CI_TYPES[ci.type]
                const sCfg = STATUS_CFG[ci.status]
                const Icon = cfg.icon
                return (
                  <div key={ci.id} onClick={() => setSelected(ci.id === selected ? null : ci.id)}
                    className={`rounded-xl border-2 bg-white p-4 cursor-pointer transition-all hover:shadow-md ${ci.id === selected ? 'border-indigo-500 shadow-md' : `${cfg.border} hover:border-indigo-300`}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.color}`}><Icon className="text-lg" /></div>
                      <span className={`flex items-center gap-1 text-xs font-medium ${sCfg.text}`}>
                        <span className={`h-2 w-2 rounded-full ${sCfg.dot}`} />{sCfg.label}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm leading-tight">{ci.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ci.id} · Tier {ci.tier}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {ci.tags.slice(0, 3).map(t => <span key={t} className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">#{t}</span>)}
                    </div>
                    {ci.depends.length > 0 && (
                      <p className="mt-2 text-xs text-gray-400">↳ depends on {ci.depends.length} CI{ci.depends.length > 1 ? 's' : ''}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {view === 'list' && (
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{['CI ID','Name','Type','Status','Tier','Owner','Location'].map(h =>
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map(ci => {
                    const cfg = CI_TYPES[ci.type]
                    const sCfg = STATUS_CFG[ci.status]
                    const Icon = cfg.icon
                    return (
                      <tr key={ci.id} onClick={() => setSelected(ci.id === selected ? null : ci.id)}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${ci.id === selected ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                        <td className="px-3 py-2.5 font-mono text-xs text-gray-400">{ci.id}</td>
                        <td className="px-3 py-2.5 font-medium">{ci.name}</td>
                        <td className="px-3 py-2.5">
                          <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full w-fit ${cfg.color}`}>
                            <Icon className="text-[10px]" />{cfg.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`flex items-center gap-1 text-xs font-medium ${sCfg.text}`}>
                            <span className={`h-2 w-2 rounded-full ${sCfg.dot}`} />{sCfg.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-500">Tier {ci.tier}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-500">{ci.owner}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-400">{ci.location}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* DEPENDENCY TREE VIEW */}
          {view === 'tree' && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs text-gray-500 mb-4">Showing Tier 1 root nodes with full dependency chains. Click to expand.</p>
              {CIs.filter(c => c.depends.length === 0).map(ci => (
                <DependencyTree key={ci.id} ci={ci} allCIs={CIs} />
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedCI && (() => {
          const cfg = CI_TYPES[selectedCI.type]
          const sCfg = STATUS_CFG[selectedCI.status]
          const Icon = cfg.icon
          const deps = selectedCI.depends.map(id => CIs.find(c => c.id === id)).filter(Boolean)
          const dependants = getDependants(selectedCI.id)
          return (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 h-fit sticky top-4">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.color}`}><Icon className="text-xl" /></div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><FiSearch /></button>
              </div>
              <h3 className="font-bold text-gray-800 leading-tight">{selectedCI.name}</h3>
              <p className="font-mono text-xs text-gray-400 mt-0.5">{selectedCI.id}</p>

              <div className={`mt-3 flex items-center gap-1.5 text-sm font-semibold ${sCfg.text}`}>
                <span className={`h-3 w-3 rounded-full ${sCfg.dot}`} />{sCfg.label}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {[['Type', cfg.label], ['Tier', `Tier ${selectedCI.tier}`], ['Owner', selectedCI.owner], ['Location', selectedCI.location], ['Environment', selectedCI.env]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-right">{v}</span>
                  </div>
                ))}
              </div>

              {deps.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Depends On ({deps.length})</p>
                  <div className="space-y-1.5">
                    {deps.map(d => {
                      const dc = CI_TYPES[d.type]
                      return (
                        <button key={d.id} onClick={() => setSelected(d.id)}
                          className="flex items-center gap-2 w-full rounded-lg border border-gray-100 px-2.5 py-1.5 hover:bg-gray-50 text-left">
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${dc.color}`}><dc.icon className="text-xs" /></div>
                          <span className="text-xs font-medium truncate">{d.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {dependants.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Depended on by ({dependants.length})</p>
                  <div className="space-y-1.5">
                    {dependants.map(d => {
                      const dc = CI_TYPES[d.type]
                      return (
                        <button key={d.id} onClick={() => setSelected(d.id)}
                          className="flex items-center gap-2 w-full rounded-lg border border-gray-100 px-2.5 py-1.5 hover:bg-gray-50 text-left">
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${dc.color}`}><dc.icon className="text-xs" /></div>
                          <span className="text-xs font-medium truncate">{d.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Impact Warning */}
              {(selectedCI.status !== 'operational') && (
                <div className="mt-4 rounded-xl bg-orange-50 border border-orange-200 p-3 text-xs text-orange-800">
                  <div className="flex items-center gap-2 font-semibold mb-1"><FiAlertCircle /> Impact Warning</div>
                  {dependants.length > 0
                    ? `This CI affects ${dependants.length} dependent system${dependants.length > 1 ? 's' : ''}.`
                    : 'Status degraded — monitor closely.'}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-1">
                {selectedCI.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">#{t}</span>)}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
