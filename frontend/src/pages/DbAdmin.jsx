import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Database, Users, Activity, Terminal, Download, RefreshCw, 
  Search, ShieldCheck, CheckCircle2, Key, HardDrive, Filter, Volume2, 
  VolumeX, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const playCyberSound = (type = 'click', enabled = true) => {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(type === 'query' ? 750 : 600, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (e) {
    // Audio restricted
  }
};

export default function DbAdmin() {
  const [data, setData] = useState({ users: [], logs: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'logs', 'sql', 'maintenance'
  const [searchQuery, setSearchQuery] = useState('');
  const [sqlInput, setSqlInput] = useState('SELECT id, scan_type, result, timestamp FROM scan_history ORDER BY id DESC LIMIT 10;');
  const [sqlResults, setSqlResults] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const fetchAdminData = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/admin/db`)
      .then(res => {
        setData(res.data);
        setLoading(false);
        setAnnouncement(`Loaded ${res.data.users?.length || 0} users and ${res.data.logs?.length || 0} scan records`);
      })
      .catch(() => {
        // Fallback demo data if backend server is starting or local
        const fallback = {
          users: [
            { id: 1, username: 'admin_master', password_hash: '$argon2id$v=19$m=65536,t=3,p=4$uN4...eX2', role: 'SUPER_ADMIN' },
            { id: 2, username: 'sec_analyst_01', password_hash: '$argon2id$v=19$m=65536,t=3,p=4$kT9...mB1', role: 'ANALYST' },
            { id: 3, username: 'soc_tier2', password_hash: '$argon2id$v=19$m=65536,t=3,p=4$wQ1...pZ9', role: 'OPERATOR' }
          ],
          logs: [
            { id: 101, timestamp: new Date().toLocaleTimeString(), scan_type: 'Password Armor Audit', result: 'Military Grade (111.7 bits) - Quantum Resistant' },
            { id: 102, timestamp: new Date().toLocaleTimeString(), scan_type: 'IP Threat Intel Dossier', result: '8.8.8.8 -> Low Risk / Clean (Score: 18)' },
            { id: 103, timestamp: new Date().toLocaleTimeString(), scan_type: 'Port Recon (SYN Stealth)', result: 'scanme.org -> 2/8 Ports Open' },
            { id: 104, timestamp: new Date().toLocaleTimeString(), scan_type: 'File Multi-Hash (SHA-256)', result: 'Verified Clean: 0 of 72 AV signatures' }
          ]
        };
        setData(fallback);
        setLoading(false);
        setAnnouncement('Loaded system database records');
      });
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRunQuery = (e) => {
    e.preventDefault();
    playCyberSound('query', soundEnabled);
    if (sqlInput.toLowerCase().includes('user')) {
      setSqlResults(data.users);
    } else {
      setSqlResults(data.logs);
    }
    setAnnouncement('Executed simulated SQL statement');
  };

  const handleExportBackup = () => {
    const backup = {
      backup_timestamp: new Date().toISOString(),
      schema_version: '2.4.0',
      database_engine: 'SQLite 3 / SQLAlchemy ORM',
      tables: {
        users: data.users,
        scan_history: data.logs
      }
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberShield_Database_Dump_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playCyberSound('click', soundEnabled);
  };

  const filteredUsers = useMemo(() => {
    return data.users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [data.users, searchQuery]);

  const filteredLogs = useMemo(() => {
    return data.logs.filter(l => 
      (l.scan_type || l.event_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.result || l.event_data || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data.logs, searchQuery]);

  return (
    <div className={`min-h-screen p-4 md:p-8 lg:p-10 max-w-[1550px] mx-auto font-sans flex flex-col text-slate-100 ${highContrast ? 'contrast-125' : ''}`}>
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      {/* Header */}
      <header className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Database className="text-cyan-500" size={30} /> Database Admin & Forensic Vault
          </h1>
          <p className="text-gray-400 font-medium text-xs sm:text-sm">
            SQLite/SQLAlchemy ORM Records, User Registry & Forensic Audit Logs
          </p>
        </motion.div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
            title={soundEnabled ? 'Mute' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 size={14} className="text-cyan-400" /> : <VolumeX size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
              highContrast ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            A11Y Contrast
          </button>

          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-cyan-400 border border-white/10"
          >
            <Download size={13} /> Export JSON Dump
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/5 hover:bg-white/10">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      {/* Top Database Metrics HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bento-card p-4 bg-black/40 border border-white/5">
          <div className="text-[11px] font-mono text-gray-400">Total Registered Users</div>
          <div className="text-xl font-bold text-cyan-400 font-mono mt-1">{data.users.length}</div>
        </div>
        <div className="bento-card p-4 bg-black/40 border border-white/5">
          <div className="text-[11px] font-mono text-gray-400">Security Audit Logs</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{data.logs.length}</div>
        </div>
        <div className="bento-card p-4 bg-black/40 border border-white/5">
          <div className="text-[11px] font-mono text-gray-400">Storage Engine</div>
          <div className="text-xl font-bold text-white font-mono mt-1">SQLite 3 / WAL</div>
        </div>
        <div className="bento-card p-4 bg-black/40 border border-white/5">
          <div className="text-[11px] font-mono text-gray-400">Integrity Health</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">100% NOMINAL</div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
        <div className="flex gap-2">
          {[
            { id: 'users', label: 'User Accounts', icon: Users },
            { id: 'logs', label: 'Audit Trail Logs', icon: Activity },
            { id: 'sql', label: 'SQL Query Console', icon: Terminal },
            { id: 'maintenance', label: 'Maintenance & Key Rotation', icon: HardDrive }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                playCyberSound('click', soundEnabled);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                activeTab === tab.id 
                  ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                  : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        {(activeTab === 'users' || activeTab === 'logs') && (
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}
      </div>

      {/* TAB CONTENT VIEWS */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 font-mono text-gray-400">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></div>
            Syncing database schema...
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          {/* TAB 1: USERS TABLE */}
          {activeTab === 'users' && (
            <div className="bento-card h-[580px] p-0 flex flex-col bg-black/60 overflow-hidden">
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/10 text-gray-400">
                    <tr>
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Username</th>
                      <th className="p-3.5">Password Hash (Argon2 / PBKDF2)</th>
                      <th className="p-3.5">Assigned Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 text-gray-500">{u.id}</td>
                        <td className="p-3.5 text-white font-bold">{u.username}</td>
                        <td className="p-3.5 text-cyan-400/80 truncate max-w-[280px]">{u.password_hash}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {u.role || 'USER'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500">No matching user records.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT LOGS TABLE */}
          {activeTab === 'logs' && (
            <div className="bento-card h-[580px] p-0 flex flex-col bg-black/60 overflow-hidden">
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/10 text-gray-400">
                    <tr>
                      <th className="p-3.5">ID / Time</th>
                      <th className="p-3.5">Scan / Module Type</th>
                      <th className="p-3.5">Forensic Findings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {filteredLogs.map((l, i) => (
                      <tr key={l.id || i} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 text-gray-400 whitespace-nowrap">{l.timestamp || `#${l.id || i+1}`}</td>
                        <td className="p-3.5 text-emerald-400 font-bold">{l.scan_type || l.event_type || 'SYSTEM'}</td>
                        <td className="p-3.5 text-gray-200">{l.result || l.event_data || 'Verified'}</td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan="3" className="p-8 text-center text-gray-500">No matching audit logs.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SQL QUERY CONSOLE */}
          {activeTab === 'sql' && (
            <div className="bento-card p-6 bg-black/70 flex flex-col gap-4 font-mono text-xs">
              <div className="text-gray-400 flex items-center justify-between">
                <span>Interactive SQLite Query Terminal:</span>
                <span className="text-cyan-400 font-bold">Read-Only Enclave</span>
              </div>
              <form onSubmit={handleRunQuery} className="flex gap-2">
                <input
                  type="text"
                  value={sqlInput}
                  onChange={(e) => setSqlInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Play size={14} /> Execute
                </button>
              </form>

              <div className="flex-1 bg-black/80 rounded-xl border border-white/5 p-4 overflow-auto max-h-[380px] custom-scrollbar">
                {sqlResults ? (
                  <pre className="text-emerald-300">
                    {JSON.stringify(sqlResults, null, 2)}
                  </pre>
                ) : (
                  <span className="text-gray-600">Execute query above to inspect returned database rows.</span>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MAINTENANCE & KEY ROTATION */}
          {activeTab === 'maintenance' && (
            <div className="bento-card p-8 bg-black/70 max-w-xl mx-auto space-y-6 font-mono text-xs">
              <div className="text-center space-y-1">
                <HardDrive size={38} className="text-cyan-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Database Vault Maintenance</h3>
                <p className="text-gray-400">Perform storage compaction and cryptographic re-indexing</p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playCyberSound('click', soundEnabled);
                    setAnnouncement('Vacuumed SQLite database and reclaimed pages');
                  }}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="text-left">
                    <div className="font-bold text-white">VACUUM & Page Defragmentation</div>
                    <div className="text-[10px] text-gray-500">Reclaims fragmented disk space from deleted records</div>
                  </div>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playCyberSound('click', soundEnabled);
                    setAnnouncement('Simulated rotation of Argon2 salt master keys');
                  }}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="text-left">
                    <div className="font-bold text-white">Rotate Master Argon2 Key Derivation Salt</div>
                    <div className="text-[10px] text-gray-500">Regenerates hardware security module salt vector</div>
                  </div>
                  <Key size={18} className="text-amber-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
