import { useState, useRef, useEffect } from 'react'
import { FiTerminal, FiSend, FiTrash2, FiSave, FiPlay, FiX, FiCheck, FiChevronRight, FiBookOpen } from 'react-icons/fi'

/* ── Playbooks ── */
const PLAYBOOKS = [
  {
    id: 'pb-vpn', name: 'Diagnose VPN Issues', category: 'Network',
    description: 'Run full VPN connectivity diagnostics on a device',
    commands: ['ping 10.0.0.1', 'traceroute vpn.company.com', 'vpndiag --collect-logs', 'Get-Service -Name "vpnagent" | Select Status', 'ipconfig /all | findstr DNS'],
  },
  {
    id: 'pb-patch', name: 'Force Patch & Reboot', category: 'Endpoint',
    description: 'Trigger Windows Update and schedule a reboot',
    commands: ['Get-HotFix | Sort InstalledOn -Desc | Select -First 5', 'wuauclt /detectnow', 'Install-WindowsUpdate -AcceptAll -AutoReboot'],
  },
  {
    id: 'pb-dns', name: 'DNS Flush + Reset', category: 'Network',
    description: 'Reset DNS and Winsock on a target machine',
    commands: ['ipconfig /flushdns', 'ipconfig /registerdns', 'netsh winsock reset', 'netsh int ip reset', 'Test-DnsResolution -Name "google.com"'],
  },
  {
    id: 'pb-user', name: 'User Account Audit', category: 'Identity',
    description: 'Audit AD account, group memberships and last login',
    commands: ['Get-ADUser -Identity {username} -Properties *', 'Get-ADGroupMember -Identity "IT_Admins" | Where Name -eq {username}', 'Get-EventLog -LogName Security -InstanceId 4624 -Newest 10'],
  },
  {
    id: 'pb-disk', name: 'Disk Cleanup + Report', category: 'Endpoint',
    description: 'Collect disk usage, run cleanup, report freed space',
    commands: ['Get-PSDrive C | Select Used,Free', 'cleanmgr /sagerun:1', 'Get-ChildItem C:\\Windows\\Temp | Remove-Item -Recurse -Force', 'Get-PSDrive C | Select Used,Free'],
  },
  {
    id: 'pb-sec', name: 'Security Baseline Check', category: 'Security',
    description: 'Verify firewall, AV, BitLocker and admin accounts',
    commands: ['Get-MpComputerStatus | Select AntivirusEnabled,RealTimeProtectionEnabled', 'Get-BitLockerVolume | Select MountPoint,ProtectionStatus', 'Get-NetFirewallProfile | Select Name,Enabled', 'Get-LocalGroupMember Administrators'],
  },
]

/* ── Simulated command responses ── */
const SIM_RESPONSES = {
  'ping': (cmd) => `Pinging ${cmd.split(' ')[1] || 'host'} with 32 bytes of data:\nReply from 10.0.0.1: bytes=32 time=2ms TTL=128\nReply from 10.0.0.1: bytes=32 time=3ms TTL=128\n\nPing statistics: Sent = 4, Received = 4, Lost = 0 (0% loss)`,
  'ipconfig': () => `Windows IP Configuration\n\nEthernet adapter Ethernet:\n   IPv4 Address. . . : 192.168.1.105\n   Subnet Mask . . . : 255.255.255.0\n   Default Gateway . : 192.168.1.1\n   DNS Servers . . . : 8.8.8.8`,
  'traceroute': (cmd) => `Tracing route to ${cmd.split(' ')[1] || 'host'}...\n  1  <1ms  192.168.1.1\n  2   5ms  10.0.0.1\n  3  12ms  vpn.company.com [34.102.45.1]\nTrace complete.`,
  'vpndiag': () => `[VPN DIAGNOSTIC REPORT]\nVPN Client: Cisco AnyConnect 5.0.04032\nGateway: vpn.company.com:443 — Reachable ✓\nTunnel Status: Connected\nLatency: 45ms (elevated — threshold 30ms)\n⚠ WARNING: Memory usage at 87% on gateway process`,
  'get-hotfix': () => `Source      Description     HotFixID  InstalledOn\n------      -----------     --------  -----------\n.           Update          KB5035853 2026-06-12\n.           Update          KB5034441 2026-05-28\n.           Security Update KB5028997 2026-04-15`,
  'wuauclt': () => `Windows Update client started.\nScanning for available updates...\n[INFO] 3 updates available: 2 Security, 1 Quality Rollup`,
  'install-windowsupdate': () => `Installing Windows Updates...\n[  5%] Downloading KB5035853...\n[ 20%] Downloading KB5034441...\n[ 55%] Installing KB5035853...\n[ 80%] Installing KB5034441...\n[100%] Updates installed. Reboot scheduled for 02:00.`,
  'flushdns': () => `Windows IP Configuration\nSuccessfully flushed the DNS Resolver Cache.`,
  'netsh': (cmd) => cmd.includes('winsock') ? `Winsock reset successful.\nRestart the computer to complete the reset.` : `The command completed successfully.`,
  'test-dns': () => `Name                  Type  TTL  Section DataLength Data\n----                  ----  ---  ------- ---------- ----\ngoogle.com            A     299  Answer  4          142.250.80.46`,
  'get-aduser': () => `DistinguishedName : CN=john.doe,OU=Users,DC=company,DC=com\nEnabled           : True\nLastLogonDate     : 2026-07-06 09:42:31\nLockedOut         : False\nBadLogonCount     : 0\nPasswordExpired   : False\nMemberOf          : {IT_Users, VPN_Users, M365_Licensed}`,
  'cleanmgr': () => `Running Disk Cleanup...\nCleaning: Temporary Internet Files (234 MB)\nCleaning: Windows Error Reports (45 MB)\nCleaning: Recycle Bin (0 MB)\nCompleted. Total freed: 279 MB`,
  'get-mpcomputerstatus': () => `AntivirusEnabled           : True\nRealTimeProtectionEnabled  : True\nAntispywareEnabled         : True\nNISEnabled                 : True\nAntivirusSignatureLastUpdated : 2026-07-07 04:00:00`,
  'get-bitlockervolume': () => `MountPoint  EncryptionMethod  VolumeStatus    ProtectionStatus\n----------  ----------------  ------------    ----------------\nC:          XtsAes256         FullyEncrypted  On`,
  'get-netfirewallprofile': () => `Name     Enabled\n----     -------\nDomain   True\nPrivate  True\nPublic   True`,
  'default': (cmd) => `PS C:\\> ${cmd}\n[${new Date().toISOString()}] Command completed successfully.\nExit code: 0`,
}

function simulateOutput(cmd) {
  const lower = cmd.toLowerCase()
  for (const [key, fn] of Object.entries(SIM_RESPONSES)) {
    if (lower.startsWith(key)) return fn(cmd)
  }
  return SIM_RESPONSES.default(cmd)
}

export default function ChatOpsConsole() {
  const [input,     setInput]    = useState('')
  const [history,   setHistory]  = useState([
    { type: 'system', text: '🖥  IT ChatOps Console v2.0\n✅ Connected to management gateway\n📡 Target: All Devices (broadcast mode)\nType a command or select a playbook below.\n' },
  ])
  const [running,   setRunning]  = useState(false)
  const [target,    setTarget]   = useState('MACBOOK-SARAH')
  const [savedCmds, setSavedCmds]= useState(['Get-Service | Where Status -eq Running', 'ipconfig /all', 'Get-EventLog -LogName System -Newest 10'])
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [history])

  const execCommand = (cmd) => {
    if (!cmd.trim()) return
    setRunning(true)
    setHistory(h => [...h, { type: 'cmd', text: `PS [${target}]> ${cmd}` }])
    setTimeout(() => {
      setHistory(h => [...h, { type: 'output', text: simulateOutput(cmd) }])
      setRunning(false)
    }, 600 + Math.random() * 800)
    setInput('')
  }

  const runPlaybook = (pb) => {
    setHistory(h => [...h, { type: 'system', text: `\n▶ Running playbook: "${pb.name}"\n${'─'.repeat(40)}` }])
    pb.commands.forEach((cmd, i) => {
      setTimeout(() => {
        setHistory(h => [...h, { type: 'cmd', text: `PS [${target}]> ${cmd}` }])
        setTimeout(() => {
          setHistory(h => [...h, { type: 'output', text: simulateOutput(cmd) }])
          if (i === pb.commands.length - 1) {
            setHistory(h => [...h, { type: 'success', text: `\n✅ Playbook "${pb.name}" completed.` }])
          }
        }, 500)
      }, i * 1200)
    })
  }

  const saveCommand = () => {
    if (input.trim() && !savedCmds.includes(input.trim())) {
      setSavedCmds(s => [input.trim(), ...s.slice(0, 9)])
    }
  }

  const categories = [...new Set(PLAYBOOKS.map(p => p.category))]

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-7xl mx-auto p-4 md:p-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
          <FiTerminal className="text-xl text-green-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold">IT ChatOps Console</h1>
          <p className="text-xs text-gray-500">Execute commands and playbooks across the device fleet</p>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Terminal */}
        <div className="flex flex-col flex-1 min-w-0 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
          {/* Terminal Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-700 bg-slate-900 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5"><span className="h-3 w-3 rounded-full bg-red-500" /><span className="h-3 w-3 rounded-full bg-yellow-500" /><span className="h-3 w-3 rounded-full bg-green-500" /></div>
              <span className="text-xs text-slate-400 font-mono ml-2">IT-Management-Console</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Target:</span>
              <select value={target} onChange={e => setTarget(e.target.value)}
                className="bg-slate-800 text-green-400 font-mono text-xs rounded px-2 py-1 border border-slate-600 focus:outline-none">
                {['MACBOOK-SARAH','LAPTOP-CHEN01','LAPTOP-JAY01','MACBOOK-EMMA','LAPTOP-ALEX01','ALL-DEVICES'].map(d =>
                  <option key={d}>{d}</option>)}
              </select>
              <span className={`h-2 w-2 rounded-full animate-pulse ${running ? 'bg-yellow-400' : 'bg-green-400'}`} />
              <button onClick={() => setHistory([{ type: 'system', text: '🖥  Console cleared.\n' }])}
                className="text-slate-500 hover:text-slate-300 ml-1"><FiTrash2 className="text-xs" /></button>
            </div>
          </div>

          {/* Output */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
            {history.map((entry, i) => (
              <pre key={i} className={`whitespace-pre-wrap leading-relaxed text-xs ${
                entry.type === 'cmd'     ? 'text-green-400' :
                entry.type === 'output' ? 'text-slate-300' :
                entry.type === 'success'? 'text-emerald-400' :
                entry.type === 'error'  ? 'text-red-400' :
                'text-blue-400'
              }`}>{entry.text}</pre>
            ))}
            {running && <p className="text-yellow-400 animate-pulse text-xs">Executing…</p>}
            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-slate-700 bg-slate-900 p-3">
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-mono text-sm shrink-0">PS [{target}]&gt;</span>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !running && execCommand(input)}
                placeholder="Type command…"
                disabled={running}
                className="flex-1 bg-transparent text-slate-200 font-mono text-sm focus:outline-none placeholder-slate-600"
                autoFocus
              />
              <button onClick={saveCommand} title="Save command" className="text-slate-500 hover:text-yellow-400"><FiSave className="text-sm" /></button>
              <button onClick={() => execCommand(input)} disabled={!input.trim() || running}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed">
                <FiSend /> Run
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Saved Commands + Playbooks */}
        <div className="w-72 shrink-0 space-y-4 overflow-y-auto">
          {/* Saved Commands */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1.5"><FiBookOpen /> Saved Commands</h3>
            <div className="space-y-1.5">
              {savedCmds.map((cmd, i) => (
                <button key={i} onClick={() => setInput(cmd)}
                  className="w-full text-left flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-2 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                  <FiChevronRight className="text-gray-400 text-xs shrink-0" />
                  <span className="font-mono text-xs text-gray-700 truncate">{cmd}</span>
                  <button onClick={e => { e.stopPropagation(); execCommand(cmd) }}
                    className="ml-auto shrink-0 text-green-600 hover:text-green-800"><FiPlay className="text-xs" /></button>
                </button>
              ))}
            </div>
          </div>

          {/* Playbooks */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">📋 Playbooks</h3>
            {categories.map(cat => (
              <div key={cat} className="mb-4">
                <p className="text-xs text-gray-400 font-semibold mb-2">{cat}</p>
                <div className="space-y-1.5">
                  {PLAYBOOKS.filter(p => p.category === cat).map(pb => (
                    <div key={pb.id} className="rounded-xl border border-gray-100 p-3 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer" onClick={() => runPlaybook(pb)}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-800">{pb.name}</p>
                        <button className="shrink-0 flex items-center gap-1 text-xs rounded-lg bg-green-100 text-green-700 px-2 py-0.5 hover:bg-green-200">
                          <FiPlay className="text-[10px]" /> Run
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{pb.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{pb.commands.length} commands</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
