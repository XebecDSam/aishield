import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Eye, ShieldAlert, Fingerprint, X, Skull, Database, Activity, 
  Lock, Globe, Search, Volume2, VolumeX, Download, Filter, Key, CheckCircle2,
  RefreshCw, Radio, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    if (type === 'leak') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // Audio restricted
  }
};

export default function DarkWeb() {
  const [leaks, setLeaks] = useState([]);
  const [selectedLeak, setSelectedLeak] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [customDomainQuery, setCustomDomainQuery] = useState('');

  const generateLeak = (customDomain = null) => {
    const domains = customDomain ? [customDomain] : ['corporate.com', 'internal-vpn.net', 'finance.global', 'protonmail.onion', 'gov.portal'];
    const names = ['root_admin', 'cfo.office', 'dev_ops', 'sec_eng', 'payroll', 'sys_architect'];
    const passwords = ['P@ssw0rd2026!', 'Summer#99', 'AdminPass123', 'Quantum$Key7', 'DragonFly#88'];
    const threatLevels = ['CRITICAL', 'HIGH', 'ELEVATED'];
    const sources = ['BreachForums v2', 'LockBit 3.0 Leak Portal', 'Russian Market (Telegram)', 'Genesis Stealer Log'];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      email: `${names[Math.floor(Math.random() * names.length)]}@${domains[Math.floor(Math.random() * domains.length)]}`,
      password: passwords[Math.floor(Math.random() * passwords.length)],
      hash: Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      source: sources[Math.floor(Math.random() * sources.length)],
      onion: `xth74${Math.random().toString(36).substr(2, 6)}.onion`,
      time: new Date().toLocaleTimeString(),
      threatLevel: threatLevels[Math.floor(Math.random() * threatLevels.length)],
      ip: `${Math.floor(Math.random()*210)+10}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
      marketPrice: `$${(Math.random() * 40 + 10).toFixed(2)} USD in XMR`
    };
  };

  useEffect(() => {
    setLeaks(Array.from({ length: 10 }).map(() => generateLeak()));

    const interval = setInterval(() => {
      setLeaks(prev => {
        const next = [generateLeak(), ...prev].slice(0, 30);
        playCyberSound('leak', soundEnabled);
        return next;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleCustomDomainScan = (e) => {
    e.preventDefault();
    if (!customDomainQuery) return;
    playCyberSound('click', soundEnabled);
    const customLeaks = Array.from({ length: 3 }).map(() => generateLeak(customDomainQuery));
    setLeaks(prev => [...customLeaks, ...prev]);
    setAnnouncement(`Found ${customLeaks.length} breached records for domain ${customDomainQuery}`);
    setCustomDomainQuery('');
  };

  const filteredLeaks = useMemo(() => {
    return leaks.filter(leak => {
      const matchesSearch = leak.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            leak.source.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterLevel === 'ALL' || leak.threatLevel === filterLevel;
      return matchesSearch && matchesFilter;
    });
  }, [leaks, searchTerm, filterLevel]);

  const handleExport = () => {
    const data = JSON.stringify({
      exported_at: new Date().toISOString(),
      tor_circuit: 'Guard: 185.220.101.5 -> Relay: 194.26.29.112 -> Exit: Active',
      breaches_intercepted: filteredLeaks
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DarkWeb_Intelligence_Dump_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playCyberSound('click', soundEnabled);
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 lg:p-10 max-w-[1550px] mx-auto font-sans flex flex-col h-screen overflow-hidden text-slate-100 bg-[#06010a] ${highContrast ? 'contrast-125' : ''}`}>
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      {/* Header */}
      <header className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Skull className="text-fuchsia-500 animate-pulse" size={30} /> Dark Web Threat Intelligence
          </h1>
          <p className="text-fuchsia-400/80 font-medium text-xs sm:text-sm">
            Continuous Tor Circuit Scraping, Onion Leak Portals & Compromised Credential Feeds
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
            {soundEnabled ? <Volume2 size={14} className="text-fuchsia-400" /> : <VolumeX size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
              highContrast ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            A11Y Contrast
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-fuchsia-300 border border-white/10"
          >
            <Download size={13} /> Export Intelligence
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/5 hover:bg-white/10">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 overflow-hidden relative z-10">
        
        {/* LEFT TOR CIRUIT & DOMAIN RADAR PANEL */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex-[1] bento-card flex flex-col justify-between bg-black/60 border border-fuchsia-900/30 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-fuchsia-400 font-bold border-b border-fuchsia-500/20 pb-3">
            <span className="flex items-center gap-2">
              <Activity size={14} /> TOR CIRUIT ACTIVE
            </span>
            <span className="text-[10px] text-gray-400">3 HOPS (AES-256)</span>
          </div>

          {/* 3D Wireframe Eye Hologram */}
          <div className="relative w-48 h-48 mx-auto my-4 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-fuchsia-500/30 border-dashed" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border border-fuchsia-500/20" />
            <div className="w-24 h-24 rounded-full bg-fuchsia-950/60 border border-fuchsia-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(217,70,239,0.3)]">
              <Eye size={42} className="text-fuchsia-400 drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]" />
            </div>
          </div>

          {/* Custom Domain Intel Probe */}
          <div className="space-y-3 border-t border-fuchsia-500/20 pt-3">
            <div className="text-xs font-mono text-gray-400 flex justify-between">
              <span>Probe Organization Domain:</span>
              <span className="text-fuchsia-400 font-bold">Deep Scrape</span>
            </div>
            <form onSubmit={handleCustomDomainScan} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. acme-corp.com"
                value={customDomainQuery}
                onChange={(e) => setCustomDomainQuery(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-fuchsia-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs rounded-xl transition-colors font-mono"
              >
                Scan
              </button>
            </form>
          </div>
        </motion.div>

        {/* RIGHT INTERCEPTED LEAKS STREAM */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-[2] bento-card flex flex-col p-0 bg-black/60 border border-fuchsia-900/30 overflow-hidden">
          
          {/* Stream Header & Search Controls */}
          <div className="p-4 bg-fuchsia-950/30 border-b border-fuchsia-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Database className="text-fuchsia-400" size={18} />
              <h3 className="font-bold text-fuchsia-100 uppercase tracking-widest text-xs sm:text-sm">
                Compromised Credential Stream
              </h3>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter email/source..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-white font-mono focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="flex gap-1 text-[11px] font-mono">
                {['ALL', 'CRITICAL', 'HIGH'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setFilterLevel(lvl);
                      playCyberSound('click', soundEnabled);
                    }}
                    className={`px-2 py-1 rounded transition-colors ${
                      filterLevel === lvl 
                        ? 'bg-fuchsia-600 text-white font-bold' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stream Rows */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            <AnimatePresence>
              {filteredLeaks.map((leak) => (
                <motion.div 
                  key={leak.id} 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  onClick={() => {
                    setSelectedLeak(leak);
                    playCyberSound('click', soundEnabled);
                  }}
                  className="grid grid-cols-12 gap-3 p-3 rounded-xl bg-gradient-to-r from-fuchsia-950/20 to-black/40 border border-white/5 hover:border-fuchsia-500/50 items-center cursor-pointer transition-all"
                >
                  <div className="col-span-2 text-xs font-mono text-fuchsia-400/60">{leak.time}</div>
                  <div className="col-span-4 text-xs text-white font-bold truncate">{leak.email}</div>
                  <div className="col-span-3 text-xs text-rose-400 font-mono tracking-widest bg-black/60 px-2 py-1 rounded truncate border border-rose-900/30">
                    {leak.password}
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end gap-2">
                    <span className="text-[10px] font-mono text-gray-400 truncate hidden sm:inline">{leak.source}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      leak.threatLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-fuchsia-500/20 text-fuchsia-300'
                    }`}>
                      {leak.threatLevel}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* DEEP BREACH REPORT DRAWER */}
      <AnimatePresence>
        {selectedLeak && (
          <motion.div 
            initial={{ x: 500, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: 500, opacity: 0 }} 
            className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-black/95 backdrop-blur-3xl border-l border-fuchsia-500/30 z-50 p-6 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] font-mono text-xs"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-sm">
                <ShieldAlert size={18} /> Deep Breach Intel Report
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeak(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="bg-rose-950/30 border border-rose-500/30 p-4 rounded-xl text-center space-y-1">
                <div className="text-[10px] uppercase text-gray-400 tracking-widest">Exposed Plaintext Password</div>
                <div className="text-xl font-extrabold text-rose-400 tracking-wider">{selectedLeak.password}</div>
              </div>

              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Compromised Email:</span>
                  <span className="text-white font-bold">{selectedLeak.email}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Underground Source:</span>
                  <span className="text-fuchsia-300">{selectedLeak.source}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Tor Onion Host:</span>
                  <span className="text-gray-300">{selectedLeak.onion}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Exfiltration IP Origin:</span>
                  <span className="text-white">{selectedLeak.ip}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Black Market Valuation:</span>
                  <span className="text-amber-400 font-bold">{selectedLeak.marketPrice}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Calculated Hash:</span>
                  <span className="text-gray-500 truncate max-w-[200px]">{selectedLeak.hash}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    playCyberSound('click', soundEnabled);
                    setSelectedLeak(null);
                    setAnnouncement(`Triggered automated credential revocation for ${selectedLeak.email}`);
                  }}
                  className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.3)]"
                >
                  <CheckCircle2 size={16} /> Automated Credential Revocation
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
